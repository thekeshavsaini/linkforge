import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorized } from "@/lib/auth";
import { createLinkSchema, generateShortCode, isReservedCode } from "@/lib/validation";
import { checkRateLimit } from "@/lib/ratelimit";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized: provide a valid x-admin-key header" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const search = searchParams.get("search")?.trim() || "";
  const status = searchParams.get("status") || "all";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  const now = new Date();
  const where: Prisma.LinkWhereInput = {};

  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { destination: { contains: search, mode: "insensitive" } }
    ];
  }

  if (status === "active") {
    where.isActive = true;
    where.AND = [
      {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    ];
  } else if (status === "expired") {
    where.OR = [
      { expiresAt: { lte: now } },
      { isActive: false }
    ];
  }

  const validSortFields = ["createdAt", "clicks", "expiresAt", "title", "code"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  const [total, links] = await Promise.all([
    prisma.link.count({ where }),
    prisma.link.findMany({
      where,
      orderBy: { [sortField]: order },
      skip: (page - 1) * limit,
      take: limit
    })
  ]);

  const formattedLinks = links.map((link) => ({
    ...link,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
    expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null
  }));

  return NextResponse.json({
    links: formattedLinks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized: provide a valid x-admin-key header" }, { status: 401 });
  }

  // Rate limiting link creation: max 30 per minute
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "admin";
  const rl = checkRateLimit(`create-link:${clientIp}`, 30, 60);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before creating more links." },
      { status: 429, headers: { "Retry-After": rl.resetSeconds.toString() } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
  }

  const parsed = createLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input parameters" },
      { status: 400 }
    );
  }

  const { url, alias, title, expiresAt, isActive } = parsed.data;

  let code = alias;
  if (code) {
    if (isReservedCode(code)) {
      return NextResponse.json({ error: "That alias is reserved by the system." }, { status: 400 });
    }
    const existing = await prisma.link.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "That alias is already in use. Please select another." }, { status: 409 });
    }
  } else {
    // Generate unique short code with collision avoidance loop
    let attempts = 0;
    while (!code && attempts < 5) {
      const candidate = generateShortCode(6);
      if (!isReservedCode(candidate)) {
        const found = await prisma.link.findUnique({ where: { code: candidate } });
        if (!found) {
          code = candidate;
          break;
        }
      }
      attempts++;
    }
    if (!code) {
      code = generateShortCode(8);
    }
  }

  const link = await prisma.link.create({
    data: {
      code,
      destination: url,
      title: title || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive ?? true
    }
  });

  return NextResponse.json(
    {
      link: {
        ...link,
        createdAt: link.createdAt.toISOString(),
        updatedAt: link.updatedAt.toISOString(),
        expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null
      }
    },
    { status: 201 }
  );
}

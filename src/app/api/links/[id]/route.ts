import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorized } from "@/lib/auth";
import { updateLinkSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const link = await prisma.link.findUnique({
    where: { id }
  });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Get 30-day visits breakdown
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [visits, recentVisits] = await Promise.all([
    prisma.visit.findMany({
      where: {
        linkId: id,
        visitedAt: { gte: thirtyDaysAgo }
      },
      select: {
        visitedAt: true,
        referer: true,
        device: true,
        country: true
      },
      orderBy: { visitedAt: "desc" }
    }),
    prisma.visit.findMany({
      where: { linkId: id },
      take: 10,
      orderBy: { visitedAt: "desc" },
      select: { id: true, visitedAt: true, referer: true, device: true, country: true }
    })
  ]);

  // Aggregate by day
  const dailyClicksMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyClicksMap.set(key, 0);
  }

  const referrersMap = new Map<string, number>();
  const devicesMap = new Map<string, number>();

  for (const v of visits) {
    const dayKey = v.visitedAt.toISOString().split("T")[0];
    if (dailyClicksMap.has(dayKey)) {
      dailyClicksMap.set(dayKey, (dailyClicksMap.get(dayKey) || 0) + 1);
    }

    const ref = v.referer || "Direct / None";
    referrersMap.set(ref, (referrersMap.get(ref) || 0) + 1);

    const dev = v.device || "other";
    devicesMap.set(dev, (devicesMap.get(dev) || 0) + 1);
  }

  const dailyTrend = Array.from(dailyClicksMap.entries()).map(([date, clicks]) => ({
    date,
    clicks
  }));

  const topReferrers = Array.from(referrersMap.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const deviceDistribution = Array.from(devicesMap.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    link: {
      ...link,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null
    },
    analytics: {
      totalClicks: link.clicks,
      thirtyDayClicks: visits.length,
      dailyTrend,
      topReferrers,
      deviceDistribution,
      recentVisits: recentVisits.map((v) => ({
        ...v,
        visitedAt: v.visitedAt.toISOString()
      }))
    }
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.link.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
  }

  const parsed = updateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid update parameters" },
      { status: 400 }
    );
  }

  const { destination, title, expiresAt, isActive } = parsed.data;

  const dataToUpdate: {
    destination?: string;
    title?: string | null;
    expiresAt?: Date | null;
    isActive?: boolean;
  } = {};

  if (destination !== undefined) dataToUpdate.destination = destination;
  if (title !== undefined) dataToUpdate.title = title || null;
  if (expiresAt !== undefined) {
    dataToUpdate.expiresAt = expiresAt ? new Date(expiresAt) : null;
  }
  if (isActive !== undefined) dataToUpdate.isActive = isActive;

  const updated = await prisma.link.update({
    where: { id },
    data: dataToUpdate
  });

  return NextResponse.json({
    link: {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      expiresAt: updated.expiresAt ? updated.expiresAt.toISOString() : null
    }
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.link.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!existing) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  await prisma.link.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Link deleted successfully" });
}

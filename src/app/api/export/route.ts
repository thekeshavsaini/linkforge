import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "json" ? "json" : "csv";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" }
  });

  const timestamp = new Date().toISOString().split("T")[0];

  if (format === "json") {
    const data = links.map((l) => ({
      ...l,
      shortUrl: `${baseUrl}/${l.code}`,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
      expiresAt: l.expiresAt ? l.expiresAt.toISOString() : null
    }));

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="linkforge-export-${timestamp}.json"`
      }
    });
  }

  // Generate CSV
  const headers = [
    "ID",
    "Short Code",
    "Short URL",
    "Destination URL",
    "Title",
    "Clicks",
    "Active",
    "Expires At",
    "Created At"
  ];

  const escapeCsv = (str: string | number | boolean | null | undefined) => {
    if (str === null || str === undefined) return '""';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  };

  const rows = links.map((l) => [
    escapeCsv(l.id),
    escapeCsv(l.code),
    escapeCsv(`${baseUrl}/${l.code}`),
    escapeCsv(l.destination),
    escapeCsv(l.title || ""),
    escapeCsv(l.clicks),
    escapeCsv(l.isActive ? "Yes" : "No"),
    escapeCsv(l.expiresAt ? l.expiresAt.toISOString() : "Never"),
    escapeCsv(l.createdAt.toISOString())
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="linkforge-export-${timestamp}.csv"`
    }
  });
}

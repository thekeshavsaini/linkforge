import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(90, Math.max(7, parseInt(searchParams.get("days") || "30", 10)));

  const now = new Date();
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - days);

  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const [
    totalLinks,
    activeLinks,
    expiredLinks,
    totalClicksAgg,
    recentClicks24h,
    visitsPeriod,
    topLinks
  ] = await Promise.all([
    prisma.link.count(),
    prisma.link.count({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
      }
    }),
    prisma.link.count({
      where: {
        OR: [{ expiresAt: { lte: now } }, { isActive: false }]
      }
    }),
    prisma.link.aggregate({ _sum: { clicks: true } }),
    prisma.visit.count({
      where: { visitedAt: { gte: twentyFourHoursAgo } }
    }),
    prisma.visit.findMany({
      where: { visitedAt: { gte: pastDate } },
      select: { visitedAt: true, referer: true, device: true, country: true }
    }),
    prisma.link.findMany({
      orderBy: { clicks: "desc" },
      take: 6,
      select: {
        id: true,
        code: true,
        title: true,
        destination: true,
        clicks: true,
        createdAt: true
      }
    })
  ]);

  // Aggregate time series
  const dailyClicksMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyClicksMap.set(key, 0);
  }

  const referrersMap = new Map<string, number>();
  const devicesMap = new Map<string, number>();
  const countriesMap = new Map<string, number>();

  for (const v of visitsPeriod) {
    const dayKey = v.visitedAt.toISOString().split("T")[0];
    if (dailyClicksMap.has(dayKey)) {
      dailyClicksMap.set(dayKey, (dailyClicksMap.get(dayKey) || 0) + 1);
    }

    const ref = v.referer || "Direct / None";
    referrersMap.set(ref, (referrersMap.get(ref) || 0) + 1);

    const dev = v.device || "other";
    devicesMap.set(dev, (devicesMap.get(dev) || 0) + 1);

    if (v.country) {
      countriesMap.set(v.country, (countriesMap.get(v.country) || 0) + 1);
    }
  }

  const dailyTrend = Array.from(dailyClicksMap.entries()).map(([date, clicks]) => ({
    date,
    clicks
  }));

  const topReferrers = Array.from(referrersMap.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const deviceDistribution = Array.from(devicesMap.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  const topCountries = Array.from(countriesMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({
    summary: {
      totalLinks,
      activeLinks,
      expiredLinks,
      totalClicks: totalClicksAgg._sum.clicks ?? 0,
      recentClicks24h,
      periodClicks: visitsPeriod.length
    },
    dailyTrend,
    topReferrers,
    deviceDistribution,
    topCountries,
    topLinks: topLinks.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString()
    }))
  });
}

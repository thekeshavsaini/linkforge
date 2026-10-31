import Dashboard from "@/components/dashboard";
import { prisma } from "@/lib/prisma";
import { LinkItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let linksCount = 0;
  let totalClicksCount = 0;
  let latestLinks: LinkItem[] = [];

  try {
    const [links, totalClicks, recent] = await Promise.all([
      prisma.link.count(),
      prisma.link.aggregate({ _sum: { clicks: true } }),
      prisma.link.findMany({
        orderBy: { createdAt: "desc" },
        take: 12
      })
    ]);

    linksCount = links;
    totalClicksCount = totalClicks._sum.clicks ?? 0;
    latestLinks = recent.map((link) => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null
    }));
  } catch (error) {
    console.warn("Could not query database for initial home render:", error);
  }

  return (
    <Dashboard
      initialStats={{ links: linksCount, clicks: totalClicksCount }}
      initialLinks={latestLinks}
    />
  );
}

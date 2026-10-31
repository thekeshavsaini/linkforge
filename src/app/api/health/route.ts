import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    const [linksCount] = await Promise.all([
      prisma.link.count(),
      prisma.$queryRaw`SELECT 1`
    ]);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        database: {
          status: "connected",
          latencyMs,
          totalLinks: linksCount
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: {
          status: "unavailable",
          error: error instanceof Error ? error.message : "Database connection failed"
        }
      },
      { status: 503 }
    );
  }
}

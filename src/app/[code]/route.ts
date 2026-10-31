import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDevice } from "@/lib/device";
import { isReservedCode } from "@/lib/validation";

export const dynamic = "force-dynamic";

function renderErrorPage(title: string, message: string, code: number) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — LinkForge</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #070b14;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 1rem;
      padding: 2.5rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(124, 58, 237, 0.15);
      border: 1px solid rgba(124, 58, 237, 0.3);
      color: #c4b5fd;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.75rem;
    }
    p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 2rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .brand {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">HTTP ${code}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/" class="btn">Return to LinkForge</a>
    <div class="brand">Powered by LinkForge · Self-hosted Link Management</div>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    status: code,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  if (isReservedCode(code)) {
    return renderErrorPage(
      "Link Not Found",
      `The short link "/${code}" does not exist or is a reserved system path.`,
      404
    );
  }

  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return renderErrorPage(
      "Link Not Found",
      `The short link "/${code}" could not be found. It may have been deleted or the code is incorrect.`,
      404
    );
  }

  if (!link.isActive) {
    return renderErrorPage(
      "Link Disabled",
      "This short link is currently paused or inactive.",
      403
    );
  }

  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    return renderErrorPage(
      "Link Expired",
      `This short link expired on ${link.expiresAt.toUTCString()}.`,
      410
    );
  }

  // Safe referrer hostname extraction (strip query params and paths)
  const rawReferer = request.headers.get("referer");
  let safeReferer: string | null = null;
  if (rawReferer) {
    try {
      safeReferer = new URL(rawReferer).hostname.slice(0, 500);
    } catch {
      safeReferer = null;
    }
  }

  // Device category
  const userAgent = request.headers.get("user-agent");
  const device = parseDevice(userAgent);

  // Country header (Cloudflare, Vercel, generic proxies)
  const countryHeader =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code") ||
    request.headers.get("cloudfront-viewer-country") ||
    null;
  const country =
    countryHeader && countryHeader.length === 2
      ? countryHeader.toUpperCase()
      : null;

  // Record click & visit atomically
  try {
    await prisma.$transaction([
      prisma.link.update({
        where: { id: link.id },
        data: { clicks: { increment: 1 } }
      }),
      prisma.visit.create({
        data: {
          linkId: link.id,
          referer: safeReferer,
          device,
          country
        }
      })
    ]);
  } catch (err) {
    console.error("Failed to record visit:", err);
  }

  // HTTP 302 Redirect with no-cache headers so browsers don't skip redirect counters
  return NextResponse.redirect(link.destination, {
    status: 302,
    headers: {
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0"
    }
  });
}

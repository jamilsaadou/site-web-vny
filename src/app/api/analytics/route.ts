import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnalyticsPayload = {
  path?: unknown;
  title?: unknown;
  referrer?: unknown;
  visitorId?: unknown;
  sessionId?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function normalizePath(value: unknown) {
  const path = cleanText(value, 512);
  if (!path || !path.startsWith("/") || path.startsWith("/api") || path.startsWith("/admin")) {
    return null;
  }

  return path;
}

function isLikelyBot(userAgent: string) {
  return /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|monitoring/i.test(userAgent);
}

function parseDevice(userAgent: string) {
  const deviceType = /ipad|tablet/i.test(userAgent)
    ? "Tablette"
    : /mobile|android|iphone|ipod/i.test(userAgent)
      ? "Mobile"
      : "Ordinateur";

  const browser = /edg/i.test(userAgent)
    ? "Edge"
    : /chrome|crios/i.test(userAgent)
      ? "Chrome"
      : /safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)
        ? "Safari"
        : /firefox|fxios/i.test(userAgent)
          ? "Firefox"
          : "Autre";

  const os = /windows/i.test(userAgent)
    ? "Windows"
    : /mac os|macintosh/i.test(userAgent)
      ? "macOS"
      : /android/i.test(userAgent)
        ? "Android"
        : /iphone|ipad|ipod/i.test(userAgent)
          ? "iOS"
          : /linux/i.test(userAgent)
            ? "Linux"
            : "Autre";

  return { deviceType, browser, os };
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return new NextResponse(null, { status: 204 });
  }

  let payload: AnalyticsPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const path = normalizePath(payload.path);
  const sessionId = cleanText(payload.sessionId, 128);
  if (!path || !sessionId) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isLikelyBot(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  const { deviceType, browser, os } = parseDevice(userAgent);

  try {
    await prisma.sitePageView.create({
      data: {
        path,
        title: cleanText(payload.title, 180),
        referrer: cleanText(payload.referrer, 512),
        visitorId: cleanText(payload.visitorId, 128),
        sessionId,
        userAgent: cleanText(userAgent, 512),
        deviceType,
        browser,
        os,
      },
    });
  } catch {
    return NextResponse.json({ error: "analytics_unavailable" }, { status: 503 });
  }

  return new NextResponse(null, { status: 204 });
}

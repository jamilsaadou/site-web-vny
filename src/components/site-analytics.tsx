"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const VISITOR_KEY = "vny_analytics_visitor_id";
const SESSION_KEY = "vny_analytics_session_id";

function createId(prefix: string) {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}_${randomId}`;
}

function getStoredId(storage: Storage, key: string, prefix: string) {
  try {
    const existing = storage.getItem(key);
    if (existing) {
      return existing;
    }

    const value = createId(prefix);
    storage.setItem(key, value);
    return value;
  } catch {
    return createId(prefix);
  }
}

export function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    if (navigator.doNotTrack === "1") {
      return;
    }

    const visitorId = getStoredId(window.localStorage, VISITOR_KEY, "visitor");
    const sessionId = getStoredId(window.sessionStorage, SESSION_KEY, "session");
    const path = `${window.location.pathname}${window.location.search}`;

    window.fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        title: document.title,
        referrer: document.referrer,
        visitorId,
        sessionId,
      }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never affect navigation.
    });
  }, [pathname]);

  return null;
}

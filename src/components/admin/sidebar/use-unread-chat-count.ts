"use client";

import { useEffect, useState } from "react";

export function useUnreadChatCount(enabled = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    let inFlight = false;
    let revision = 0;
    let primed = false;

    async function load() {
      if (inFlight) {
        return;
      }
      inFlight = true;
      try {
        const revQuery = primed ? `?rev=${revision}` : "";
        const response = await fetch(`/api/chat/unread-count${revQuery}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as {
          count?: number;
          unchanged?: boolean;
          revision?: number;
        };
        if (typeof payload.revision === "number") {
          revision = payload.revision;
        }
        primed = true;
        if (payload.unchanged) {
          return;
        }
        if (!cancelled) {
          setCount(typeof payload.count === "number" ? payload.count : 0);
        }
      } catch {
        // Ignore transient poll errors.
      } finally {
        inFlight = false;
      }
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 8000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled]);

  return count;
}

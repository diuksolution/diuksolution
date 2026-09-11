"use client";

import { useEffect, useState } from "react";

export function useUnreadChatCount(enabled = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/chat/unread-count", {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { count?: number };
        if (!cancelled) {
          setCount(typeof payload.count === "number" ? payload.count : 0);
        }
      } catch {
        // Ignore transient poll errors.
      }
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled]);

  return count;
}

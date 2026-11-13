"use client";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Subscription = { table: string; filter?: string };

// Shared guard: manual refreshes (delete/edit) already revalidate the route,
// so a realtime event arriving right after must not trigger a second refresh.
// Without this, deleting a post caused two overlapping full-page refreshes
// (one manual, one from the realtime DELETE event) which looked like glitching.
let lastManualRefresh = 0;
export function markManualRefresh() {
  lastManualRefresh = Date.now();
}

export function RealtimeRefresh({
  table,
  filter,
  tables,
  onDeleteNavigate,
}: {
  table?: string;
  filter?: string;
  tables?: Subscription[];
  /** When the watched idea row is deleted, navigate here instead of refreshing
   *  (refreshing a deleted detail page flashes a 404 before navigation). */
  onDeleteNavigate?: string;
}) {
  const router = useRouter();
  const subscriptions = useMemo(
    () => tables || (table ? [{ table, filter }] : []),
    [tables, table, filter],
  );
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase || !subscriptions.length) return;

    // Coalesce bursts of realtime events into a single refresh so rapid
    // like/comment/delete activity does not flicker the page repeatedly.
    const scheduleRefresh = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        if (Date.now() - lastManualRefresh < 1200) return;
        router.refresh();
      }, 350);
    };

    const channel = supabase.channel(
      `live:${subscriptions.map((item) => `${item.table}:${item.filter || "all"}`).join("|")}`,
    );
    subscriptions.forEach((subscription) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: subscription.table,
          ...(subscription.filter ? { filter: subscription.filter } : {}),
        },
        (payload) => {
          if (
            subscription.table === "ideas" &&
            payload.eventType === "DELETE" &&
            onDeleteNavigate
          ) {
            router.push(onDeleteNavigate);
            return;
          }
          scheduleRefresh();
        },
      );
    });
    channel.subscribe();
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      void supabase.removeChannel(channel);
    };
  }, [router, subscriptions, onDeleteNavigate]);

  return null;
}

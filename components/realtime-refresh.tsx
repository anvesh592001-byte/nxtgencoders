"use client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Subscription = { table: string; filter?: string };

export function RealtimeRefresh({
  table,
  filter,
  tables,
}: {
  table?: string;
  filter?: string;
  tables?: Subscription[];
}) {
  const router = useRouter();
  const subscriptions = useMemo(
    () => tables || (table ? [{ table, filter }] : []),
    [tables, table, filter],
  );

  useEffect(() => {
    const supabase = createClient();
    if (!supabase || !subscriptions.length) return;
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
        () => router.refresh(),
      );
    });
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router, subscriptions]);

  return null;
}

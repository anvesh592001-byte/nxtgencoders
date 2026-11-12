"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RealtimeRefresh({ table, filter }: { table:string; filter?:string }) {
 const router=useRouter();
 useEffect(()=>{const s=createClient();if(!s)return;const channel=s.channel(`live:${table}:${filter||"all"}`).on("postgres_changes",{event:"*",schema:"public",table,...(filter?{filter}:{})},()=>router.refresh()).subscribe();return()=>{void s.removeChannel(channel)};},[router,table,filter]);
 return null;
}

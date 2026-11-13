"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
export function LiveNotificationButton({signedIn}:{signedIn:boolean}){
 const [count,setCount]=useState(0);
 useEffect(()=>{if(!signedIn)return;const s=createClient();if(!s)return;let live=true;const load=async()=>{const {count}=await s.from("notifications").select("id",{count:"exact",head:true}).is("read_at",null);if(live)setCount(count||0)};void load();const channel=s.channel("notification-indicator").on("postgres_changes",{event:"*",schema:"public",table:"notifications"},()=>void load()).subscribe();return()=>{live=false;void s.removeChannel(channel)}},[signedIn]);
 return <Link href="/notifications" className="relative border border-zinc-800 p-2.5 text-zinc-400 hover:text-white" aria-label={count?`${count} unread notifications`:"Notifications"}><Bell size={17}/>{count>0&&<><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-blink bg-lime"/>{count>9&&<span className="sr-only">9+ unread</span>}</>}</Link>
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogIn, LogOut, Settings, ShieldCheck, UserRound, UserPlus } from "lucide-react";
import { signOut } from "@/app/actions";
import { Avatar } from "./ui/avatar";

export type ShellUser={
 name?:string|null;
 username?:string|null;
 role?:string|null;
 approvalStatus?:string|null;
 contributionPoints?:number|null;
 avatarUrl?:string|null;
};

export function AccountMenu({user}:{user?:ShellUser|null}){
 const [open,setOpen]=useState(false);
 const [closing,setClosing]=useState(false);
 const root=useRef<HTMLDivElement>(null);
 const timer=useRef<number|null>(null);
 function close(){setClosing(true);timer.current=window.setTimeout(()=>{setOpen(false);setClosing(false)},160);}
 function toggle(){if(open){close();}else{if(timer.current)window.clearTimeout(timer.current);setClosing(false);setOpen(true);}}
 useEffect(()=>{
  const outside=(event:PointerEvent)=>{if(open&&root.current&&!root.current.contains(event.target as Node))close()};
  const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")close()};
  document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);
  return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape)};
 },[open]);
 useEffect(()=>()=>{if(timer.current)window.clearTimeout(timer.current)},[]);
 return <div ref={root} className="relative shrink-0">
  <button type="button" onClick={toggle} aria-expanded={open} aria-haspopup="menu" aria-label="Open profile menu" className="profile-trigger flex h-10 items-center gap-2 border border-zinc-800 bg-zinc-950 px-1.5 text-zinc-400 hover:border-purple hover:text-white">
   {user?<Avatar name={user.name} url={user.avatarUrl} size="sm"/>:<span className="flex h-7 w-7 items-center justify-center bg-deep"><UserRound size={15}/></span>}
   <span className="max-w-28 truncate text-left text-[10px] font-bold">{user?.name||"Guest"}</span>
   <ChevronDown size={12} className={`transition-transform ${open?"rotate-180":""}`}/>
  </button>
  {open&&<div role="menu" aria-label="Profile menu" className={`appearance-dialog absolute right-0 top-12 z-[110] w-72 border border-zinc-700 bg-zinc-950 p-3 ${closing?"animate-fade-out":"animate-dialog-in"}`}>
   {user?<>
    <div className="border-b border-zinc-800 p-2 pb-4"><div className="flex items-center gap-3"><Avatar name={user.name} url={user.avatarUrl}/><div className="min-w-0"><p className="truncate text-sm font-bold">{user.name}</p><p className="truncate font-mono text-[9px] text-zinc-500">@{user.username||"onboarding"}</p></div></div><div className="mt-3 grid grid-cols-2 gap-2"><div className="border border-zinc-800 p-2"><span className="block font-mono text-[7px] uppercase text-zinc-600">Role</span><b className="text-[10px] uppercase text-purple">{user.role||"student"}</b></div><div className="border border-zinc-800 p-2"><span className="block font-mono text-[7px] uppercase text-zinc-600">Points</span><b className="text-[10px] text-lime">{user.contributionPoints||0}</b></div></div></div>
    <div className="space-y-1 py-2"><MenuLink href="/profile/me" icon={<UserRound size={15}/>} label="View profile"/><MenuLink href="/settings" icon={<Settings size={15}/>} label="Profile settings"/>{user.role==="admin"&&<MenuLink href="/admin" icon={<ShieldCheck size={15}/>} label="Admin console"/>}</div>
    <form action={signOut} className="border-t border-zinc-800 pt-2"><button role="menuitem" className="flex w-full items-center gap-3 px-3 py-2.5 font-mono text-[9px] font-bold uppercase text-zinc-500 hover:bg-zinc-900 hover:text-white"><LogOut size={15}/>Sign out</button></form>
   </>:<>
    <div className="p-3"><p className="eyebrow">Your builder profile</p><h2 className="mt-2 font-display text-xl font-black uppercase">Join the network.</h2><p className="mt-2 text-xs leading-5 text-zinc-500">Sign in to publish ideas, discuss problems, vote, and collaborate.</p></div>
    <div className="grid gap-2 border-t border-zinc-800 pt-3"><MenuLink href="/login" icon={<LogIn size={15}/>} label="Sign in"/><MenuLink href="/signup" icon={<UserPlus size={15}/>} label="Create account"/></div>
   </>}
  </div>}
 </div>;
}

function MenuLink({href,icon,label}:{href:string;icon:React.ReactNode;label:string}){return <Link role="menuitem" href={href} className="flex items-center gap-3 border border-transparent px-3 py-2.5 font-mono text-[9px] font-bold uppercase text-zinc-500 transition hover:border-zinc-800 hover:bg-zinc-900 hover:text-white"><span className="text-purple">{icon}</span>{label}</Link>}

"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Blocks, BookOpen, ChevronDown, CircleUserRound, Home, Lightbulb, Menu,
  Plus, Search, ShieldCheck, Trophy, UsersRound, X, Zap
} from "lucide-react";
import { Button } from "./ui/button";
import { LiveNotificationButton } from "./live-notification-button";
import { AppearanceControls } from "./appearance-controls";
import { AccountMenu, type ShellUser } from "./account-menu";

const nav = [
  ["Home","/",Home],["Explore Ideas","/explore",Lightbulb],["Problem Board","/problems",BookOpen],
  ["Monthly Arena","/arena",Trophy],["Projects","/projects",Blocks],["Leaderboard","/leaderboard",UsersRound],
  ["Notifications","/notifications",Bell],["Profile","/profile/me",CircleUserRound]
] as const;

function Brand(){return <Link href="/" prefetch={false} className="group flex items-center gap-3"><span className="flex h-9 w-9 -skew-x-6 items-center justify-center bg-lime text-ink transition-transform group-hover:skew-x-0"><Zap size={20} fill="currentColor"/></span><span><b className="block font-display text-sm font-black tracking-tight">NXTGEN<span className="text-purple">CODERS</span></b><i className="block font-mono text-[7px] not-italic tracking-[.22em] text-zinc-500">THINK · SHARE · BUILD</i></span></Link>}

export function AppShell({ children, user }: { children:React.ReactNode; user?:ShellUser|null }) {
 const pathname=usePathname(); const router=useRouter(); const [menu,setMenu]=useState(false); const [post,setPost]=useState(false); const [menuClosing,setMenuClosing]=useState(false); const [postClosing,setPostClosing]=useState(false); const [navigating,setNavigating]=useState<{href:string;from:string}|null>(null); const isAuth=["/login","/signup","/forgot-password","/check-email"].some(x=>pathname.startsWith(x));
 const menuTimer=useRef<number|null>(null); const postTimer=useRef<number|null>(null);
 const closeMenu=()=>{setMenuClosing(true);menuTimer.current=window.setTimeout(()=>{setMenu(false);setMenuClosing(false)},260)};
 const closePost=()=>{setPostClosing(true);postTimer.current=window.setTimeout(()=>{setPost(false);setPostClosing(false)},200)};
 useEffect(()=>()=>{if(menuTimer.current)window.clearTimeout(menuTimer.current);if(postTimer.current)window.clearTimeout(postTimer.current)},[]);
 const routePending=navigating?.from===pathname;
 const accountNotice=user?.approvalStatus==="pending"?"Your email is verified and you are signed in. An administrator must approve your student profile before you can post, vote, or comment.":user?.approvalStatus==="suspended"?"This account is suspended. Contact an administrator if you believe this is a mistake.":user?.approvalStatus==="rejected"?"This registration was not approved. Contact an administrator for help.":null;
 const warmRoute=(href:string)=>router.prefetch(href);
 const routeLinkProps=(href:string)=>({prefetch:false as const,onMouseEnter:()=>warmRoute(href),onFocus:()=>warmRoute(href),onTouchStart:()=>warmRoute(href),onClick:()=>setNavigating({href,from:pathname})});
 const submitSearch=(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();const q=new FormData(e.currentTarget).get("q"); if(q){const href=`/search?q=${encodeURIComponent(String(q))}`;setNavigating({href,from:pathname});router.push(href)}};
 if(isAuth) return <>{children}</>;
 return <div className="pc-shell doodle-bg min-h-screen bg-ink">
  {routePending&&<div role="status" aria-label="Loading page" className="fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-purple/20"><span className="block h-full w-full animate-pulse bg-lime"/></div>}
  <aside className="pc-sidebar theme-sidebar fixed inset-y-0 left-0 z-40 hidden w-64 overflow-hidden border-r border-zinc-800 bg-zinc-950 lg:flex lg:flex-col">
   <div className="shrink-0 border-b border-zinc-800 p-5"><Brand/></div>
   <nav aria-label="Primary navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3 [scrollbar-gutter:stable]">{nav.map(([label,href,Icon],i)=>{const active=href==="/"?pathname===href:pathname.startsWith(href.replace("/profile/me","/profile"));return <Link key={href} href={href} {...routeLinkProps(href)} aria-current={active?"page":undefined} className={`group flex items-center gap-3 border px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider transition ${active?"border-purple/60 bg-purple/10 text-white":"border-transparent text-zinc-500 hover:border-zinc-800 hover:bg-zinc-900 hover:text-white"}`}><span className={`w-5 text-[8px] ${active?"text-lime":"text-zinc-700"}`}>{String(i+1).padStart(2,"0")}</span><Icon size={16}/>{label}{active&&<span className="ml-auto h-1.5 w-1.5 bg-lime"/>}</Link>})}</nav>
   <div className="shrink-0 border-t border-zinc-800 p-3">
    {(user?.role==="admin"||user?.role==="chief")&&<Link href="/admin" className="mb-2 flex items-center gap-3 border border-purple/40 bg-purple/10 p-3 font-mono text-[10px] font-bold uppercase text-lavender"><ShieldCheck size={16}/>{user.role==="chief"?"Chief's console":"Admin console"}</Link>}
    <Link href={user?"/profile/me":"/login"} className="group block border border-transparent p-2 transition hover:border-zinc-800 hover:bg-zinc-900"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center border border-zinc-700 bg-deep font-display text-xs font-black text-purple">{(user?.name||"G")[0]}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold group-hover:text-white">{user?.name||"Guest student"}</p><p className="truncate font-mono text-[8px] uppercase text-zinc-600">{user?`@${user.username||"onboarding"}`:"Sign in to participate"}</p></div>{user&&<span className="font-mono text-[8px] font-bold text-lime">{user.contributionPoints||0} XP</span>}</div></Link>
   </div>
  </aside>
  <div className="pc-content min-w-0 lg:pl-64">
   <header className="pc-topbar theme-topbar sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-800 bg-ink/95 px-4 backdrop-blur sm:px-6">
    <button onClick={()=>setMenu(true)} className="p-2 lg:hidden" aria-label="Open menu"><Menu/></button><div className="lg:hidden"><Brand/></div>
    <form onSubmit={submitSearch} className="pc-search ml-auto hidden max-w-md flex-1 md:flex"><label className="flex w-full items-center gap-2 border border-zinc-800 bg-zinc-950 px-3 py-2 focus-within:border-purple"><Search size={15} className="text-zinc-600"/><input name="q" aria-label="Global search" placeholder="SEARCH IDEAS, PROBLEMS, BUILDERS..." className="w-full bg-transparent font-mono text-[9px] font-bold tracking-wider text-white outline-none placeholder:text-zinc-700"/><kbd className="border border-zinc-700 px-1.5 font-mono text-[8px] text-zinc-600">/</kbd></label></form>
    <AppearanceControls/>
    <LiveNotificationButton signedIn={Boolean(user)}/>
    <div className="hidden sm:block"><AccountMenu user={user}/></div>
    <Button onClick={()=>setPost(true)} size="sm" aria-label="Post something"><Plus size={14}/><span className="hidden sm:inline">Post something</span><ChevronDown className="hidden sm:block" size={13}/></Button>
   </header>
   {accountNotice&&<div role="status" className="border-b border-amber-400/30 bg-amber-400/10 px-5 py-3 text-xs leading-5 text-amber-200 sm:px-8"><b className="mr-2 font-mono text-[9px] uppercase tracking-wider">Account status //</b>{accountNotice}</div>}
   <main className="pc-main doodle-canvas min-h-[calc(100vh-4rem)] pb-20 lg:pb-0">{children}</main>
  </div>
  <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-zinc-800 bg-zinc-950 lg:hidden">{nav.slice(0,5).map(([label,href,Icon])=><Link key={href} href={href} {...routeLinkProps(href)} aria-label={label} aria-current={pathname===href||href!=="/"&&pathname.startsWith(href)?"page":undefined} className={`p-3 ${pathname===href||href!=="/"&&pathname.startsWith(href)?"text-lime":"text-zinc-600"}`}><Icon size={20}/></Link>)}</nav>
  {menu&&<><div onClick={closeMenu} className={`fixed inset-0 z-50 bg-black/70 lg:hidden ${menuClosing?"animate-fade-out":"animate-fade-in"}`}/><aside className={`fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col overflow-hidden border-r border-zinc-700 bg-zinc-950 p-4 lg:hidden ${menuClosing?"animate-slide-out-left":"animate-slide-in-left"}`}><div className="mb-5 flex shrink-0 items-center justify-between"><Brand/><button onClick={closeMenu} aria-label="Close menu"><X/></button></div><nav aria-label="Mobile navigation" className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]">{nav.map(([label,href,Icon])=><Link key={href} href={href} prefetch={false} onMouseEnter={()=>warmRoute(href)} onFocus={()=>warmRoute(href)} onTouchStart={()=>warmRoute(href)} onClick={()=>{closeMenu();setNavigating({href,from:pathname})}} className="flex items-center gap-3 border-b border-zinc-900 px-2 py-3 font-mono text-xs font-bold uppercase"><Icon size={18} className="text-purple"/>{label}</Link>)}</nav><div className="mt-4 shrink-0 border-t border-zinc-800 pt-4"><AccountMenu user={user}/></div></aside></>}
  {post&&<div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 ${postClosing?"animate-fade-out":"animate-fade-in"}`} onClick={closePost}><div onClick={e=>e.stopPropagation()} className={`comic-panel w-full max-w-lg bg-zinc-950 p-6 ${postClosing?"animate-fade-out":"animate-dialog-in"}`}><div className="mb-6 flex items-center justify-between"><div><p className="eyebrow">Start the signal</p><h2 className="mt-2 font-display text-3xl font-black uppercase">Post something.</h2></div><button onClick={closePost}><X/></button></div><div className="grid gap-3 sm:grid-cols-2"><Link href="/ideas/new" className="group border border-zinc-700 p-5 hover:border-purple"><Lightbulb className="mb-8 text-purple"/><b className="block font-display text-lg uppercase">Share an idea</b><span className="mt-2 block text-xs leading-5 text-zinc-500">Pitch technology worth debating and building.</span></Link><Link href="/problems/new" className="group border border-zinc-700 p-5 hover:border-lime"><BookOpen className="mb-8 text-lime"/><b className="block font-display text-lg uppercase">Share a problem</b><span className="mt-2 block text-xs leading-5 text-zinc-500">Surface a real challenge the community can solve.</span></Link></div></div></div>}
 </div>
}

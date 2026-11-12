"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Moon, Palette, Sun, X } from "lucide-react";

const accents = [
  { id:"neon", name:"Neon", primary:"#8B5CF6", secondary:"#B6FF3B" },
  { id:"ocean", name:"Ocean", primary:"#0EA5E9", secondary:"#22D3EE" },
  { id:"sunset", name:"Sunset", primary:"#F97316", secondary:"#FACC15" },
] as const;

type Mode = "light" | "dark";
type Accent = typeof accents[number]["id"];

function isMode(value:string|null):value is Mode{return value==="light"||value==="dark"}
function isAccent(value:string|null):value is Accent{return accents.some(item=>item.id===value)}

function setDocumentAppearance(mode:Mode,accent:Accent){
 const root=document.documentElement;
 root.dataset.mode=mode;
 root.dataset.accent=accent;
 root.classList.toggle("light",mode==="light");
 root.classList.toggle("dark",mode==="dark");
 root.classList.remove("theme-neon","theme-ocean","theme-sunset");
 root.classList.add(`theme-${accent}`);
 root.style.colorScheme=mode;
 if(document.body){document.body.dataset.mode=mode;document.body.dataset.accent=accent}
}

export function AppearanceControls({ className="" }:{className?:string}) {
 const [open,setOpen]=useState(false);
 const [mode,setMode]=useState<Mode>("dark");
 const [accent,setAccent]=useState<Accent>("neon");
 const rootRef=useRef<HTMLDivElement>(null);

 useEffect(()=>{
  const savedMode=localStorage.getItem("nxt-theme");
  const savedAccent=localStorage.getItem("nxt-accent");
  const root=document.documentElement;
  const initialMode:Mode=isMode(savedMode)?savedMode:root.dataset.mode==="light"?"light":root.dataset.mode==="dark"?"dark":matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";
  const initialAccent:Accent=isAccent(savedAccent)?savedAccent:root.dataset.accent==="ocean"?"ocean":root.dataset.accent==="sunset"?"sunset":"neon";
  setDocumentAppearance(initialMode,initialAccent);
  const frame=requestAnimationFrame(()=>{setMode(initialMode);setAccent(initialAccent)});
  return()=>cancelAnimationFrame(frame);
 },[]);

 useEffect(()=>{
  function outside(event:PointerEvent){if(open&&rootRef.current&&!rootRef.current.contains(event.target as Node))setOpen(false)}
  function escape(event:KeyboardEvent){if(event.key==="Escape")setOpen(false)}
  document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);
  return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape)};
 },[open]);

 function applyMode(next:Mode){
  setDocumentAppearance(next,accent);
  localStorage.setItem("nxt-theme",next);
  setMode(next);
 }

 function applyAccent(next:Accent){
  setDocumentAppearance(mode,next);
  localStorage.setItem("nxt-accent",next);
  setAccent(next);
 }

 return <div ref={rootRef} className={`appearance-controls relative shrink-0 ${className}`}>
  <button type="button" onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-haspopup="dialog" aria-label="Open appearance settings" title="Appearance" className="theme-toggle flex h-10 w-10 items-center justify-center border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:border-purple hover:text-purple"><Palette size={17}/></button>
  {open&&<div role="dialog" aria-label="Appearance settings" className="appearance-dialog absolute right-0 top-12 z-[100] w-72 border border-zinc-700 bg-zinc-950 p-4 shadow-comic">
   <div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Appearance</p><p className="mt-1 text-xs text-zinc-500">Applied instantly across the app</p></div><button type="button" onClick={()=>setOpen(false)} aria-label="Close appearance settings" className="p-2 text-zinc-500 hover:text-white"><X size={16}/></button></div>
   <p className="label">Mode</p>
   <div className="mb-5 grid grid-cols-2 gap-2">
    <button type="button" aria-pressed={mode==="light"} onClick={()=>applyMode("light")} className={`flex items-center justify-center gap-2 border px-3 py-3 font-mono text-[10px] font-bold uppercase ${mode==="light"?"border-purple bg-purple/10 text-purple":"border-zinc-800 text-zinc-500 hover:border-purple"}`}><Sun size={15}/>Light{mode==="light"&&<Check size={12}/>}</button>
    <button type="button" aria-pressed={mode==="dark"} onClick={()=>applyMode("dark")} className={`flex items-center justify-center gap-2 border px-3 py-3 font-mono text-[10px] font-bold uppercase ${mode==="dark"?"border-purple bg-purple/10 text-purple":"border-zinc-800 text-zinc-500 hover:border-purple"}`}><Moon size={15}/>Dark{mode==="dark"&&<Check size={12}/>}</button>
   </div>
   <p className="label">Color theme</p>
   <div className="space-y-2">{accents.map(item=><button key={item.id} type="button" aria-pressed={accent===item.id} onClick={()=>applyAccent(item.id)} className={`flex w-full items-center gap-3 border px-3 py-3 text-left transition ${accent===item.id?"border-purple bg-purple/10":"border-zinc-800 hover:border-purple"}`}><span className="flex -space-x-1"><i className="h-5 w-5 border border-ink" style={{backgroundColor:item.primary}}/><i className="h-5 w-5 border border-ink" style={{backgroundColor:item.secondary}}/></span><span className="font-mono text-[10px] font-bold uppercase tracking-wider">{item.name}</span>{accent===item.id&&<Check className="ml-auto text-lime" size={14}/>}</button>)}</div>
  </div>}
 </div>;
}

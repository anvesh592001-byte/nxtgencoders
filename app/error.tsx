"use client";
import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error("Application route error",error)},[error]);
 return <main className="doodle-bg flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-950 p-5"><section className="comic-panel smooth-enter w-full max-w-xl bg-zinc-950 p-7 sm:p-10"><span className="flex h-12 w-12 items-center justify-center bg-deep text-purple"><AlertTriangle size={24}/></span><p className="eyebrow mt-7">Recovery // Route error</p><h1 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">That signal dropped.</h1><p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">Your data has not been changed. Retry the page, or return home and continue from a stable route.</p>{error.digest&&<p className="mt-4 font-mono text-[8px] uppercase text-zinc-600">Reference: {error.digest}</p>}<div className="mt-8 flex flex-wrap gap-3"><Button onClick={reset}><RotateCcw size={15}/>Try again</Button><Button href="/" variant="outline"><Home size={15}/>Return home</Button></div></section></main>;
}

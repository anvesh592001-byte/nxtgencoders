import { cn } from "@/lib/utils";
export function Badge({ children, tone="default", className }: { children:React.ReactNode; tone?:"default"|"lime"|"purple"|"danger"; className?:string }) {
  const tones={default:"border-zinc-700 text-zinc-400",lime:"border-lime/60 bg-lime/10 text-lime",purple:"border-purple/60 bg-purple/10 text-lavender",danger:"border-red-500/50 bg-red-500/10 text-red-300"};
  return <span className={cn("inline-flex items-center border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest",tones[tone],className)}>{children}</span>;
}

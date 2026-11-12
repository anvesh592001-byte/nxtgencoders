import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
export function EmptyState({ title, body, href, action }: { title:string; body:string; href?:string; action?:string }) {
 return <div className="editorial-shadow halftone relative overflow-hidden border border-dashed border-zinc-700 bg-zinc-950 p-8 text-center sm:p-12">
   <Sparkles className="mx-auto mb-4 text-purple"/><h3 className="font-display text-xl font-black uppercase">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{body}</p>
   {href && <Button href={href} className="mt-5" size="sm">{action || "Get started"}</Button>}
 </div>;
}

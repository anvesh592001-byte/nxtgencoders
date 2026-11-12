import { ArrowRight, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ErrorNote } from "@/components/error-note";
import { createIdea } from "@/app/actions";

export const metadata={title:"Share an Idea"};

export default async function NewIdea({searchParams}:{searchParams:Promise<{error?:string;remix?:string}>}){
 const p=await searchParams;
 return <>
  <PageHeader eyebrow="New idea" title="Share what you're thinking." description="Just add a heading and explain your idea. The community can take it from there."/>
  <div className="mx-auto grid max-w-4xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_240px]">
   <form action={createIdea} className="panel space-y-6 p-5 sm:p-8">
    <ErrorNote message={p.error}/>
    {p.remix&&<input type="hidden" name="remix_of" value={p.remix}/>} 
    <label><span className="label">Heading</span><input name="title" required minLength={3} maxLength={120} className="field" placeholder="Give your idea a clear heading"/></label>
    <label><span className="label">Your idea</span><textarea name="idea" required minLength={10} maxLength={10000} rows={12} className="field resize-y" placeholder="Explain your idea in your own words..."/></label>
    <Button type="submit" size="lg">Post idea<ArrowRight size={16}/></Button>
   </form>
   <aside className="h-fit border border-purple/50 bg-deep p-5 lg:sticky lg:top-24">
    <Lightbulb className="text-lime"/>
    <h2 className="mt-4 font-display text-xl font-black uppercase">That's it.</h2>
    <p className="mt-2 text-sm leading-6 text-zinc-500">A good heading and a simple explanation are enough. People can ask questions and help improve it in the comments.</p>
   </aside>
  </div>
 </>;
}

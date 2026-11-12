import { ArrowRight, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ErrorNote } from "@/components/error-note";
import { createProblem } from "@/app/actions";

export const metadata={title:"Share a Problem"};

export default async function NewProblem({searchParams}:{searchParams:Promise<{error?:string}>}){
 const p=await searchParams;
 return <>
  <PageHeader eyebrow="New problem" title="Tell us what's not working." description="Add a heading and describe the problem. Keep it simple—the community can help with the rest."/>
  <div className="mx-auto grid max-w-4xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_240px]">
   <form action={createProblem} className="panel space-y-6 p-5 sm:p-8">
    <ErrorNote message={p.error}/>
    <label><span className="label">Heading</span><input name="title" required minLength={3} maxLength={140} className="field" placeholder="Give the problem a clear heading"/></label>
    <label><span className="label">The problem</span><textarea name="problem" required minLength={10} maxLength={10000} rows={12} className="field resize-y" placeholder="What problem did you notice?"/></label>
    <Button type="submit" size="lg">Post problem<ArrowRight size={16}/></Button>
   </form>
   <aside className="h-fit border border-lime/40 bg-deep p-5 lg:sticky lg:top-24">
    <BookOpen className="text-purple"/>
    <h2 className="mt-4 font-display text-xl font-black uppercase">Keep it clear.</h2>
    <p className="mt-2 text-sm leading-6 text-zinc-500">Describe what happened and why it matters to you. Other students can suggest a solution.</p>
   </aside>
  </div>
 </>;
}

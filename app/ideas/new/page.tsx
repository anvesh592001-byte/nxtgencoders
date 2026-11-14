import { Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { IdeaForm } from "@/components/idea-form";

export const metadata={title:"Share an Idea"};

export default async function NewIdea({searchParams}:{searchParams:Promise<{error?:string;remix?:string}>}){
 const p=await searchParams;
 return <>
  <PageHeader eyebrow="New idea" title="Share what you're thinking." description="Just add a heading and explain your idea. The community can take it from there."/>
  <div className="mx-auto grid max-w-4xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_240px]">
   <IdeaForm remix={p.remix} error={p.error}/>
   <aside className="h-fit border border-purple/50 bg-deep p-5 lg:sticky lg:top-24">
    <Lightbulb className="text-lime"/>
    <h2 className="mt-4 font-display text-xl font-black uppercase">That&apos;s it.</h2>
    <p className="mt-2 text-sm leading-6 text-zinc-500">A good heading and a simple explanation are enough. People can ask questions and help improve it in the comments.</p>
   </aside>
  </div>
 </>;
}

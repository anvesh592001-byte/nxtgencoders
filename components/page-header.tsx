export function PageHeader({ eyebrow, title, description, aside }: { eyebrow:string; title:string; description:string; aside?:React.ReactNode }) {
 return <header className="doodle-bg relative overflow-hidden border-b border-zinc-800 bg-zinc-950 px-5 py-10 sm:px-8 sm:py-14">
  <div className="halftone absolute right-0 top-0 h-full w-1/3 opacity-50"/><div className="relative mx-auto flex max-w-7xl items-end justify-between gap-8">
   <div><p className="eyebrow mb-3">{eyebrow}</p><h1 className="display-title max-w-4xl text-4xl sm:text-6xl lg:text-7xl">{title}</h1><p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">{description}</p></div>{aside}
  </div>
 </header>;
}

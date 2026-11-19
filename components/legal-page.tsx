import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "./page-header";

export type LegalSection = { heading: string; body: React.ReactNode };

export function LegalPage({ eyebrow, title, description, updated, intro, sections, footer }: {
  eyebrow: string; title: string; description: string; updated: string;
  intro?: React.ReactNode; sections: LegalSection[]; footer?: React.ReactNode;
}) {
  return (
    <main>
      <PageHeader eyebrow={eyebrow} title={title} description={description}/>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <p className="eyebrow mb-3">On this page</p>
            <nav className="border-l border-zinc-800">
              {sections.map((s, i) => (
                <a key={s.heading} href={`#s${i + 1}`} className="block border-l-2 border-transparent py-1.5 pl-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500 transition hover:border-lime hover:text-lime">
                  {s.heading}
                </a>
              ))}
            </nav>
            <p className="mt-6 font-mono text-[9px] uppercase tracking-widest text-zinc-600">Last updated<br/><span className="text-zinc-400">{updated}</span></p>
          </aside>

          <article className="min-w-0">
            {intro && (
              <div className="editorial-card mb-8 p-5 text-sm leading-7 text-zinc-400 sm:p-6">{intro}</div>
            )}

            <div className="space-y-4">
              {sections.map((s, i) => (
                <section key={s.heading} id={`s${i + 1}`} className="border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
                  <div className="mb-3 flex items-baseline gap-3">
                    <span className="font-mono text-[10px] text-purple">/{String(i + 1).padStart(2, "0")}</span>
                    <h2 className="font-display text-lg font-black uppercase tracking-tight sm:text-xl">{s.heading}</h2>
                  </div>
                  <div className="space-y-3 text-sm leading-7 text-zinc-400 [&_a]:font-bold [&_a]:text-lime [&_a:hover]:text-purple [&_li]:ml-5 [&_li]:list-disc [&_li]:leading-7 [&_strong]:text-zinc-200">
                    {s.body}
                  </div>
                </section>
              ))}
            </div>

            {footer && <div className="mt-8 border border-zinc-800 bg-zinc-950 p-5 text-sm leading-7 text-zinc-400 sm:p-6">{footer}</div>}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-zinc-800 pt-5">
              <Link href="/privacy" className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition hover:text-lime">Privacy Policy<ArrowUpRight size={12}/></Link>
              <Link href="/terms" className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition hover:text-lime">Terms of Service<ArrowUpRight size={12}/></Link>
              <Link href="/" className="ml-auto font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition hover:text-purple">NXTGENCODERS</Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}

export function Table({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="-mx-5 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="py-2 pr-4 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">Data</th>
            <th className="py-2 pr-4 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">Why we collect it</th>
            <th className="py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">Required?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b, c]) => (
            <tr key={a} className="border-b border-zinc-900 align-top">
              <td className="py-2.5 pr-4 text-[13px] font-bold text-zinc-200">{a}</td>
              <td className="py-2.5 pr-4 text-[13px] leading-6 text-zinc-400">{b}</td>
              <td className="py-2.5 text-[13px] leading-6 text-zinc-500">{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

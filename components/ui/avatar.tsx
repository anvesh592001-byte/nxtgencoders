import { initials } from "@/lib/utils";
export function Avatar({ name, url, size="md" }: { name?: string | null; url?: string | null; size?: "sm"|"md"|"lg" }) {
  const cls={sm:"h-7 w-7 text-[9px]",md:"h-9 w-9 text-xs",lg:"h-16 w-16 text-xl"}[size];
  return <div className={`${cls} shrink-0 overflow-hidden border border-zinc-600 bg-deep font-display font-black flex items-center justify-center`}>
    {url ? <img src={url} alt={name || "Profile"} className="h-full w-full object-cover"/> : initials(name)}
  </div>;
}

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "lime" | "purple" | "outline" | "ghost"; href?: string; size?: "sm" | "md" | "lg" };
const styles = {
  lime:"border-lime bg-lime text-ink hover:bg-white hover:border-white",
  purple:"border-purple bg-purple text-white hover:bg-lavender hover:text-ink hover:border-lavender",
  outline:"border-zinc-600 bg-transparent text-white hover:border-white hover:bg-white hover:text-ink",
  ghost:"border-transparent bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900"
};
const sizes = { sm:"h-9 px-3 text-[10px]", md:"h-11 px-4 text-xs", lg:"h-13 px-6 text-xs" };
export function Button({ className, variant="lime", size="md", href, children, ...props }: Props) {
  const cnx=cn("inline-flex items-center justify-center gap-2 border font-mono font-bold uppercase tracking-[.12em] transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-50",variant!=="ghost"&&"action-shadow",styles[variant],sizes[size],className);
  if (href) return <Link href={href} className={cnx}>{children}</Link>;
  return <button className={cnx} {...props}>{children}</button>;
}

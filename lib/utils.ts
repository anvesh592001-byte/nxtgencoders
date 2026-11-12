import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
export function timeAgo(value?: string | null) {
  if (!value) return "just now";
  const sec = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [[31536000,"year"],[2592000,"month"],[86400,"day"],[3600,"hour"],[60,"minute"]];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [n, unit] of units) if (Math.abs(sec) >= n) return rtf.format(-Math.floor(sec / n), unit);
  return "just now";
}
export function initials(name?: string | null) {
  return (name || "NG").split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase();
}

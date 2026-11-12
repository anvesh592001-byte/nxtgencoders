import { redirect } from "next/navigation";
import { CalendarDays, Camera, CheckCircle2, KeyRound, LogOut, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut, updateAvatar, updatePassword, updateProfile } from "@/app/actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorNote } from "@/components/error-note";
import { FormSubmitButton } from "@/components/form-submit-button";
import { SectionHeader } from "@/components/section-header";

export const metadata={title:"Account Settings"};

export default async function Settings({searchParams}:{searchParams:Promise<{error?:string;message?:string;reset?:string}>}){
 const p=await searchParams;const s=await createClient();if(!s)redirect("/login");const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login?next=/settings");
 const {data:profile}=await s.from("profiles").select("*").eq("id",user.id).maybeSingle();if(!profile)redirect("/signup?error=Complete%20registration%20first");
 const joined=new Intl.DateTimeFormat("en",{month:"short",year:"numeric"}).format(new Date(profile.created_at));
 return <main className="min-h-screen bg-zinc-950"><section className="border-b border-zinc-800 bg-deep py-16"><div className="container-site"><SectionHeader eyebrow="Account // Profile" title="Your builder identity." description="Keep your public profile accurate and manage secure account access."/></div></section>
  <section className="container-site py-10"><div className="mb-7"><ErrorNote message={p.error}/>{p.message&&<div role="status" className="flex gap-2 border border-lime/40 bg-lime/10 p-3 text-sm text-lime"><CheckCircle2 className="mt-0.5 shrink-0" size={16}/>{p.message}</div>}</div>
   <div className="grid gap-7 lg:grid-cols-[320px_1fr]">
    <aside className="space-y-5">
     <div className="editorial-card p-6"><div className="flex items-center gap-4"><Avatar name={profile.display_name} url={profile.avatar_url} size="lg"/><div className="min-w-0"><h2 className="truncate font-display text-xl font-black uppercase">{profile.display_name}</h2><p className="font-mono text-[9px] text-zinc-500">@{profile.username}</p></div></div>
      <form action={updateAvatar} className="mt-5 space-y-3"><label className="block cursor-pointer border border-dashed border-zinc-700 p-3 text-center transition hover:border-purple"><Camera className="mx-auto mb-1 text-purple" size={17}/><span className="font-mono text-[8px] font-bold uppercase text-zinc-400">Choose a profile image</span><input className="sr-only" name="avatar" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required/></label><p className="text-center font-mono text-[7px] uppercase text-zinc-600">JPG, PNG, WebP or AVIF · Max 2 MB</p><FormSubmitButton label="Upload image" pendingLabel="Uploading…" className="w-full"/></form>
     </div>
     <div className="editorial-card divide-y divide-zinc-800 p-1"><Detail icon={<Mail/>} label="Email" value={user.email||"—"}/><Detail icon={<ShieldCheck/>} label="Access" value={profile.approval_status}/><Detail icon={<Sparkles/>} label="Contribution points" value={String(profile.contribution_points||0)}/><Detail icon={<CalendarDays/>} label="Member since" value={joined}/></div>
    </aside>
    <div className="space-y-7">
     <section className="editorial-card p-6 sm:p-8"><div className="mb-6 flex items-start gap-3 border-b border-zinc-800 pb-5"><span className="flex h-10 w-10 items-center justify-center bg-deep text-purple"><UserRound size={19}/></span><div><h2 className="font-display text-xl font-black uppercase">Public profile</h2><p className="mt-1 text-xs text-zinc-500">These details help other builders discover your work and skills.</p></div></div>
      <form action={updateProfile} className="grid gap-5 sm:grid-cols-2"><Field label="Display name" name="display_name" defaultValue={profile.display_name} required minLength={2} maxLength={60}/><Field label="Username" name="username" defaultValue={profile.username} required minLength={3} maxLength={24}/><label className="sm:col-span-2"><span className="label">Bio</span><textarea className="input min-h-28 resize-y" name="bio" maxLength={400} defaultValue={profile.bio||""} placeholder="What are you building, learning, or exploring?"/><span className="mt-1 block text-right font-mono text-[7px] uppercase text-zinc-600">Up to 400 characters</span></label><Field label="Skills" name="skills" defaultValue={(profile.skills||[]).join(", ")} placeholder="React, Python, Product design"/><Field label="Interests" name="interests" defaultValue={(profile.interests||[]).join(", ")} placeholder="AI, Climate, Healthtech"/><Field label="GitHub URL" name="github_url" type="url" defaultValue={profile.github_url||""} placeholder="https://github.com/..."/><Field label="LinkedIn URL" name="linkedin_url" type="url" defaultValue={profile.linkedin_url||""} placeholder="https://linkedin.com/in/..."/><label className="sm:col-span-2"><span className="label">Portfolio URL</span><input className="input" name="portfolio_url" type="url" defaultValue={profile.portfolio_url||""} placeholder="https://your-work.dev"/></label><div className="sm:col-span-2"><FormSubmitButton/></div></form>
     </section>
     <section className="editorial-card p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><KeyRound size={17} className="text-purple"/><h2 className="font-display text-lg font-black uppercase">Security & session</h2></div><p className="mt-2 max-w-xl text-xs leading-5 text-zinc-500">Password changes use a secure email recovery link. Signing out clears this browser session.</p></div><div className="flex flex-wrap gap-2"><Button href="/forgot-password" variant="outline"><KeyRound size={14}/>Reset password</Button><form action={signOut}><Button variant="outline" type="submit"><LogOut size={14}/>Sign out</Button></form></div></div>{p.reset&&<form action={updatePassword} className="mt-6 grid gap-4 border-t border-zinc-800 pt-6 sm:grid-cols-[1fr_auto] sm:items-end"><label><span className="label">New password</span><input className="input" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters"/></label><FormSubmitButton label="Update password" pendingLabel="Updating…"/></form>}</section>
    </div>
   </div>
  </section>
 </main>;
}
function Field({label,...props}:{label:string;name:string;type?:string;defaultValue?:string;placeholder?:string;required?:boolean;minLength?:number;maxLength?:number}){return <label><span className="label">{label}</span><input className="input" {...props}/></label>}
function Detail({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="flex items-center gap-3 p-4"><span className="text-purple [&>svg]:h-4 [&>svg]:w-4">{icon}</span><div className="min-w-0"><span className="block font-mono text-[7px] uppercase text-zinc-600">{label}</span><b className="block truncate text-[10px] capitalize text-zinc-300">{value}</b></div></div>}

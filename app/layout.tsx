import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { SetupBanner } from "@/components/setup-banner";
import { PwaRegistration } from "@/components/pwa-registration";
import { createClient } from "@/lib/supabase/server";

const inter=Inter({subsets:["latin"],variable:"--font-inter"});
const space=Space_Grotesk({subsets:["latin"],variable:"--font-space"});
const mono=Space_Mono({subsets:["latin"],weight:["400","700"],variable:"--font-mono"});
export const metadata:Metadata={title:{default:"NXTGENCODERS — NIAT Innovation Network",template:"%s · NXTGENCODERS"},description:"Think it. Share it. Build it. The NIAT student innovation community.",applicationName:"NXTGENCODERS",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"NXTGENCODERS",statusBarStyle:"black-translucent"},formatDetection:{telephone:false}};
export const viewport:Viewport={width:"device-width",initialScale:1,maximumScale:5,themeColor:[{media:"(prefers-color-scheme: dark)",color:"#09090B"},{media:"(prefers-color-scheme: light)",color:"#F4F1E9"}]};

export default async function RootLayout({children}:{children:React.ReactNode}){
 const supabase=await createClient(); let userProfile=null;
 if(supabase){const {data:{user}}=await supabase.auth.getUser();if(user){const {data}=await supabase.from("profiles").select("display_name,username,role,approval_status,contribution_points,avatar_url").eq("id",user.id).maybeSingle();userProfile=data?{name:data.display_name,username:data.username,role:data.role,approvalStatus:data.approval_status,contributionPoints:data.contribution_points,avatarUrl:data.avatar_url}:null;}}
 return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body className={`${inter.variable} ${space.variable} ${mono.variable} font-sans antialiased`}><PwaRegistration/><SetupBanner/><AppShell user={userProfile}>{children}</AppShell></body></html>;
}

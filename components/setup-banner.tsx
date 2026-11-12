import { supabaseConfigured } from "@/lib/supabase/config";
import { DatabaseZap } from "lucide-react";
export function SetupBanner() {
 if (supabaseConfigured) return null;
 return <div className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
   <DatabaseZap className="mr-2 inline" size={13}/> Setup mode — add Supabase environment variables to activate authentication and persistence.
 </div>;
}

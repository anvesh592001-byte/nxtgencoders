export async function googleAuthEnabled(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return false;
 try{
  const response=await fetch(`${url}/auth/v1/settings`,{headers:{apikey:key},cache:"no-store"});
  if(!response.ok)return false;
  const settings=await response.json();
  return Boolean(settings?.external?.google);
 }catch{return false;}
}

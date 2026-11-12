import type { MetadataRoute } from "next";

export default function manifest():MetadataRoute.Manifest{
 return {
  name:"NXTGENCODERS — NIAT Innovation Network",
  short_name:"NXTGENCODERS",
  description:"Think it. Share it. Build it. The NIAT student innovation community.",
  id:"/",
  start_url:"/",
  scope:"/",
  display:"standalone",
  background_color:"#09090B",
  theme_color:"#8B5CF6",
  orientation:"any",
  categories:["education","social","productivity"],
  icons:[
   {src:"/icons/icon-192.png",sizes:"192x192",type:"image/png",purpose:"any"},
   {src:"/icons/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any"},
   {src:"/icons/icon-maskable-512.png",sizes:"512x512",type:"image/png",purpose:"maskable"},
  ],
 };
}

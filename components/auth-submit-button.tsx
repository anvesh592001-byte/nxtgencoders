"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";

export function AuthSubmitButton({label,pendingLabel}:{label:string;pendingLabel:string}){
 const {pending}=useFormStatus();
 return <Button type="submit" className="w-full" disabled={pending} aria-disabled={pending}>{pending?<><LoaderCircle className="animate-spin" size={15}/>{pendingLabel}</>:<>{label}<ArrowRight size={15}/></>}</Button>;
}

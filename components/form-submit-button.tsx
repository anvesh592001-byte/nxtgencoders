"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle, Save } from "lucide-react";
import { Button } from "./ui/button";

export function FormSubmitButton({label="Save changes",pendingLabel="Saving…",className}:{label?:string;pendingLabel?:string;className?:string}){const {pending}=useFormStatus();return <Button type="submit" disabled={pending} className={className}>{pending?<><LoaderCircle size={15} className="animate-spin"/>{pendingLabel}</>:<><Save size={15}/>{label}</>}</Button>}

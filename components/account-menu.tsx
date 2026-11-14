"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown, LogIn, LogOut, Settings, ShieldCheck, UserRound, UserPlus } from "lucide-react";
import { signOut } from "@/app/actions";
import { computeMenuPlacement, type MenuPlacement } from "@/lib/menu-placement";
import { Avatar } from "./ui/avatar";

export type ShellUser = {
  name?: string | null;
  username?: string | null;
  role?: string | null;
  approvalStatus?: string | null;
  contributionPoints?: number | null;
  avatarUrl?: string | null;
};

export function AccountMenu({ user }: { user?: ShellUser | null }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [placement, setPlacement] = useState<MenuPlacement | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  const close = useCallback((returnFocus = false) => {
    setClosing(true);
    timer.current = window.setTimeout(() => { setOpen(false); setClosing(false); }, 160);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  const reposition = useCallback(() => {
    const trigger = buttonRef.current?.getBoundingClientRect();
    if (trigger) setPlacement(computeMenuPlacement(trigger, { width: window.innerWidth, height: window.innerHeight }));
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    if (open) { close(); return; }
    if (timer.current) window.clearTimeout(timer.current);
    setClosing(false);
    reposition(); // measure before the first paint so the menu never flashes in the wrong place
    setOpen(true);
    if (event.detail === 0) {
      // Opened with the keyboard: move focus to the first menu item (menu pattern).
      requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
    }
  }

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!root.current?.contains(target) && !menuRef.current?.contains(target)) close();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") close(true); };
    const onViewportChange = () => reposition();
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", onViewportChange);
    // Capture phase catches scrolls inside nested containers; repositioning keeps the
    // fixed menu glued to its trigger instead of detaching from it.
    window.addEventListener("scroll", onViewportChange, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, { capture: true });
    };
  }, [open, close, reposition]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  function onMenuKeyDown(event: React.KeyboardEvent) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next = 0;
    if (event.key === "ArrowDown") next = index < 0 ? 0 : (index + 1) % items.length;
    if (event.key === "ArrowUp") next = index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
    if (event.key === "End") next = items.length - 1;
    items[next]?.focus();
  }

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        className="profile-trigger flex h-10 items-center gap-2 border border-zinc-800 bg-zinc-950 px-1.5 text-zinc-400 hover:border-purple hover:text-white"
      >
        {user ? <Avatar name={user.name} url={user.avatarUrl} size="sm" /> : <span className="flex h-7 w-7 items-center justify-center bg-deep"><UserRound size={15} /></span>}
        <span className="max-w-28 truncate text-left text-[10px] font-bold">{user?.name || "Guest"}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && placement && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label="Profile menu"
          onKeyDown={onMenuKeyDown}
          className={`appearance-dialog z-[110] w-72 overflow-y-auto overscroll-contain border border-zinc-700 bg-zinc-950 p-3 ${closing ? "animate-fade-out" : "animate-dialog-in"}`}
          style={{
            position: "fixed",
            left: placement.left,
            width: placement.width,
            maxHeight: placement.maxHeight,
            ...(placement.openUp ? { bottom: placement.bottom } : { top: placement.top }),
          }}
        >
          {user ? (
            <>
              <div className="border-b border-zinc-800 p-2 pb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} url={user.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate font-mono text-[9px] text-zinc-500">@{user.username || "onboarding"}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="border border-zinc-800 p-2"><span className="block font-mono text-[7px] uppercase text-zinc-600">Role</span><b className="text-[10px] uppercase text-purple">{user.role || "student"}</b></div>
                  <div className="border border-zinc-800 p-2"><span className="block font-mono text-[7px] uppercase text-zinc-600">Points</span><b className="text-[10px] text-lime">{user.contributionPoints || 0}</b></div>
                </div>
              </div>
              <div className="space-y-1 py-2">
                <MenuLink href="/profile/me" icon={<UserRound size={15} />} label="View profile" />
                <MenuLink href="/settings" icon={<Settings size={15} />} label="Profile settings" />
                {(user.role === "admin" || user.role === "chief") && <MenuLink href="/admin" icon={<ShieldCheck size={15} />} label={"Chief's console"} />}
              </div>
              <form action={signOut} className="border-t border-zinc-800 pt-2">
                <button role="menuitem" className="flex w-full items-center gap-3 px-3 py-2.5 font-mono text-[9px] font-bold uppercase text-zinc-500 hover:bg-zinc-900 hover:text-white"><LogOut size={15} />Sign out</button>
              </form>
            </>
          ) : (
            <>
              <div className="p-3">
                <p className="eyebrow">Your builder profile</p>
                <h2 className="mt-2 font-display text-xl font-black uppercase">Join the network.</h2>
                <p className="mt-2 text-xs leading-5 text-zinc-500">Sign in to publish ideas, discuss problems, vote, and collaborate.</p>
              </div>
              <div className="grid gap-2 border-t border-zinc-800 pt-3">
                <MenuLink href="/login" icon={<LogIn size={15} />} label="Sign in" />
                <MenuLink href="/signup" icon={<UserPlus size={15} />} label="Create account" />
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link role="menuitem" href={href} className="flex items-center gap-3 border border-transparent px-3 py-2.5 font-mono text-[9px] font-bold uppercase text-zinc-500 transition hover:border-zinc-800 hover:bg-zinc-900 hover:text-white">
      <span className="text-purple">{icon}</span>{label}
    </Link>
  );
}

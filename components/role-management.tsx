"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { changeUserRole } from "@/app/actions";
import { Button } from "@/components/ui/button";

type Role = "chief" | "admin" | "moderator" | "student";
type RoleFilter = "all" | Role;

type Profile = {
  id: string;
  display_name: string;
  username: string;
  role: Role;
};

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "chief", label: "Chiefs" },
  { value: "admin", label: "Admins" },
  { value: "moderator", label: "Moderators" },
  { value: "student", label: "Students" },
];

export function RoleManagement({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles
      .filter((p) => p.id !== currentUserId)
      .filter((p) => roleFilter === "all" || p.role === roleFilter)
      .filter((p) => !q || p.display_name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q));
  }, [profiles, query, roleFilter, currentUserId]);

  const counts = useMemo(() => {
    const c: Record<RoleFilter, number> = { all: 0, chief: 0, admin: 0, moderator: 0, student: 0 };
    for (const p of profiles) {
      if (p.id === currentUserId) continue;
      c.all += 1;
      c[p.role] += 1;
    }
    return c;
  }, [profiles, currentUserId]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3">
        <label className="relative block">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username…"
            aria-label="Search users"
            className="field pl-9"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by role">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={roleFilter === tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`border px-3 py-1.5 font-mono text-[9px] font-bold uppercase transition ${
                roleFilter === tab.value
                  ? "border-purple bg-purple/15 text-purple"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {tab.label} <span className="text-zinc-600">{counts[tab.value]}</span>
            </button>
          ))}
        </div>
      </div>
      {visible.length ? (
        <div className="max-h-72 divide-y divide-zinc-800 overflow-auto">
          {visible.map((p) => {
            const isChief = p.role === "chief";
            return (
              <form action={changeUserRole} key={p.id} className="flex items-center gap-2 py-2">
                <input type="hidden" name="user_id" value={p.id} />
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-xs">{p.display_name}</b>
                  <span className="font-mono text-[8px] text-zinc-600">@{p.username}</span>
                </div>
                {isChief ? (
                  <span className="border border-lime/40 bg-lime/10 px-2 py-1.5 font-mono text-[9px] font-bold uppercase text-lime">Chief · Protected</span>
                ) : (
                  <>
                    <select name="role" defaultValue={p.role} className="border border-zinc-700 bg-ink p-2 font-mono text-[9px]">
                      <option value="student">Student</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button type="submit" size="sm" variant="outline">Save</Button>
                  </>
                )}
              </form>
            );
          })}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-zinc-600">
          {query ? `No users match “${query}”.` : "No users in this category."}
        </p>
      )}
    </div>
  );
}

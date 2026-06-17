"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = { user_id: string; email: string };
type Group = { id: string; name: string; members: Member[] };

export default function GroupManager({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [emailFor, setEmailFor] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");

  async function call(payload: any, method: "POST" | "DELETE" = "POST") {
    setErr("");
    const res = await fetch("/api/admin/groups", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    if (!res.ok) {
      setErr(d.error || "Action failed.");
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (await call({ action: "create-group", name: newName })) setNewName("");
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="block flex-1">
          <span className="label">New group name</span>
          <input required className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Claimed-profile owners" />
        </label>
        <button type="submit" className="btn-primary">+ Create group</button>
      </form>
      {err && <p className="text-sm text-red-600">{err}</p>}

      {groups.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">No groups yet.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.id} className="card p-5">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-heading text-lg font-bold text-navy">{g.name} <span className="text-sm font-normal text-slate-400">· {g.members.length} member{g.members.length === 1 ? "" : "s"}</span></h4>
                <button onClick={() => confirm(`Delete group "${g.name}"?`) && call({ id: g.id }, "DELETE")} className="text-sm font-semibold text-red-600 hover:underline">Delete group</button>
              </div>
              {g.members.length > 0 && (
                <ul className="mb-3 flex flex-wrap gap-2">
                  {g.members.map((m) => (
                    <li key={m.user_id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-navy">
                      {m.email}
                      <button onClick={() => call({ action: "remove-member", group_id: g.id, user_id: m.user_id })} className="text-slate-400 hover:text-red-600" aria-label="Remove">✕</button>
                    </li>
                  ))}
                </ul>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const email = emailFor[g.id] ?? "";
                  if (await call({ action: "add-member", group_id: g.id, email })) setEmailFor({ ...emailFor, [g.id]: "" });
                }}
                className="flex flex-wrap items-end gap-2"
              >
                <input
                  className="input max-w-xs text-sm"
                  placeholder="add member by email"
                  value={emailFor[g.id] ?? ""}
                  onChange={(e) => setEmailFor({ ...emailFor, [g.id]: e.target.value })}
                />
                <button type="submit" className="btn-outline text-sm">Add</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

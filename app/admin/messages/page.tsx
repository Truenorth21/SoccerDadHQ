import type { Metadata } from "next";
import Link from "next/link";
import MessageComposer from "@/components/MessageComposer";
import GroupManager from "@/components/GroupManager";
import CollapsibleSection from "@/components/CollapsibleSection";
import { getCurrentAdmin, adminServiceClient, hasServiceKey } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Admin — Messages", robots: { index: false } };
export const dynamic = "force-dynamic";

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-heading text-3xl font-bold uppercase text-navy">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">{children}</p>
      <Link href="/admin" className="btn-primary mt-5">Back to admin</Link>
    </div>
  );
}

export default async function AdminMessagesPage() {
  if (!isSupabaseConfigured) return <Notice title="Admin needs Supabase">Add your Supabase keys.</Notice>;
  const admin = await getCurrentAdmin();
  if (!admin) return <Notice title="Admins only">Log in with an admin account first.</Notice>;
  const service = adminServiceClient();
  if (!service || !hasServiceKey) return <Notice title="Service key required">Add <code>SUPABASE_SERVICE_ROLE_KEY</code>.</Notice>;

  const [groupsRes, membersRes, sentRes] = await Promise.all([
    service.from("user_groups").select("id,name").order("name"),
    service.from("user_group_members").select("group_id,user_id,profiles(email)"),
    service.from("messages").select("*").order("created_at", { ascending: false }).limit(25),
  ]);
  const missing = Boolean(
    groupsRes.error && (groupsRes.error.message?.includes("does not exist") || (groupsRes.error as { code?: string }).code === "42P01")
  );

  const memberRows = (membersRes.data ?? []) as any[];
  const groups = (groupsRes.data ?? []).map((g: any) => ({
    id: g.id,
    name: g.name,
    members: memberRows
      .filter((m) => m.group_id === g.id)
      .map((m) => ({ user_id: m.user_id, email: m.profiles?.email ?? "(no email)" })),
  }));
  const sent = (sentRes.data ?? []) as any[];

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Messages</h1>
            <p className="mt-1 text-slate-300">Reach registered users — everyone, a group, or one person.</p>
          </div>
          <Link href="/admin" className="btn-outline text-sm">← Admin</Link>
        </div>
      </section>

      <div className="container-page py-8">
        {missing ? (
          <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-6 text-sm text-amber-800">
            <h2 className="font-heading text-lg font-bold text-navy">Messaging tables not created yet</h2>
            <p className="mt-1">Run <code>supabase/messaging-migration.sql</code> in Supabase, then refresh.</p>
          </div>
        ) : (
          <>
            <MessageComposer groups={groups.map((g) => ({ id: g.id, name: g.name }))} sent={sent} />
            <CollapsibleSection title="User groups" subtitle="Create groups and add members by email" defaultOpen>
              <GroupManager groups={groups} />
            </CollapsibleSection>
          </>
        )}
      </div>
    </>
  );
}

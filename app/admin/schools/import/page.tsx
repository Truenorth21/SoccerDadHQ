import type { Metadata } from "next";
import Link from "next/link";
import SchoolCsvImporter from "@/components/SchoolCsvImporter";
import { getCurrentAdmin, adminServiceClient, hasServiceKey } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Admin — Import Schools", robots: { index: false } };
export const dynamic = "force-dynamic";

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-heading text-3xl font-bold uppercase text-navy">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">{children}</p>
      <Link href="/" className="btn-primary mt-5">Back home</Link>
    </div>
  );
}

export default async function ImportSchoolsPage() {
  if (!isSupabaseConfigured) return <Notice title="Admin needs Supabase">Add your Supabase keys to import schools.</Notice>;
  const admin = await getCurrentAdmin();
  if (!admin) {
    return (
      <Notice title="Admins only">
        Sign in with an admin account, then{" "}
        <Link href="/login?next=/admin/schools/import" className="font-semibold text-brand-blue hover:underline">log in</Link>.
      </Notice>
    );
  }
  const service = adminServiceClient();
  if (!service || !hasServiceKey) return <Notice title="Service key required">Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to import schools.</Notice>;

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Import Schools (CSV)</h1>
            <p className="mt-1 text-slate-300">Bulk-add FHSAA programs. They appear live immediately.</p>
          </div>
          <Link href="/admin/schools" className="btn-outline text-sm">← Manage schools</Link>
        </div>
      </section>
      <div className="container-page py-8">
        <SchoolCsvImporter />
      </div>
    </>
  );
}

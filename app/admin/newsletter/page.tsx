import type { Metadata } from "next";
import Link from "next/link";
import NewsletterAdmin from "@/components/NewsletterAdmin";
import { getCurrentAdmin, adminServiceClient, hasServiceKey } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { REGIONS } from "@/lib/regions";

export const metadata: Metadata = { title: "Admin — Newsletter", robots: { index: false } };
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

export default async function AdminNewsletterPage() {
  if (!isSupabaseConfigured) return <Notice title="Admin needs Supabase">Add your Supabase keys.</Notice>;
  const admin = await getCurrentAdmin();
  if (!admin) return <Notice title="Admins only">Log in with an admin account first.</Notice>;
  const service = adminServiceClient();
  if (!service || !hasServiceKey) return <Notice title="Service key required">Add <code>SUPABASE_SERVICE_ROLE_KEY</code>.</Notice>;

  const { data } = await service.from("site_config").select("value").eq("key", "newsletter").maybeSingle();
  const initialIntro = ((data?.value as { intro?: string } | null)?.intro ?? "") as string;
  const regions = REGIONS.map((r) => ({ key: r.key, name: r.name }));

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Newsletter</h1>
            <p className="mt-1 text-slate-300">The Sideline — weekly intro &amp; test sends.</p>
          </div>
          <Link href="/admin" className="btn-outline text-sm">← Admin</Link>
        </div>
      </section>
      <div className="container-page py-8">
        <NewsletterAdmin initialIntro={initialIntro} adminEmail={admin.email ?? ""} regions={regions} />
      </div>
    </>
  );
}

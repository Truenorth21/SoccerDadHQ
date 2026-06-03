import { CardGridSkeleton } from "@/components/Skeleton";

export default function RankingsLoading() {
  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Community Rankings</h1>
          <p className="mt-1 text-slate-300">Loading the board…</p>
        </div>
      </section>
      <div className="container-page py-8">
        <CardGridSkeleton count={6} />
      </div>
    </>
  );
}

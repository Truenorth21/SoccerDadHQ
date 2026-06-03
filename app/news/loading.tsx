import { CardGridSkeleton } from "@/components/Skeleton";

export default function NewsLoading() {
  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Soccer News</h1>
          <p className="mt-1 text-slate-300">Fetching the latest headlines…</p>
        </div>
      </section>
      <div className="container-page py-8">
        <CardGridSkeleton count={9} />
      </div>
    </>
  );
}

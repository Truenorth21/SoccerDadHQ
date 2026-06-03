import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="font-heading text-7xl font-bold text-brand-sky">404</span>
      <h1 className="mt-2 font-heading text-3xl font-bold uppercase text-navy">Off the pitch</h1>
      <p className="mt-2 max-w-md text-slate-500">
        We couldn't find that page. It may have moved, or never existed.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">Back home</Link>
        <Link href="/clubs" className="btn-outline">Browse clubs</Link>
      </div>
    </div>
  );
}

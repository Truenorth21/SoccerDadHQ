"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";

type Hit = { name: string; slug: string; sub: string };
type Results = { clubs: Hit[]; schools: Hit[]; coaches: Hit[] };
const EMPTY: Results = { clubs: [], schools: [], coaches: [] };

function SearchBox({ onSubmitted }: { onSubmitted?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results>(EMPTY);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Debounced typeahead.
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setResults(EMPTY);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setResults(d))
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Close on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(href: string) {
    router.push(href);
    setOpen(false);
    setQ("");
    onSubmitted?.();
  }

  const groups: { label: string; base: string; hits: Hit[] }[] = [
    { label: "Clubs", base: "/clubs", hits: results.clubs },
    { label: "Schools", base: "/schools", hits: results.schools },
    { label: "Coaches", base: "/coaches", hits: results.coaches },
  ];
  const hasHits = groups.some((g) => g.hits.length > 0);

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!q.trim()) return;
          go(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
        role="search"
      >
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M11 19a8 8 0 110-16 8 8 0 010 16z" />
        </svg>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search clubs, schools, coaches…"
          aria-label="Search"
          autoComplete="off"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-navy placeholder:text-slate-400 focus:border-brand-sky focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-sky/30"
        />
      </form>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-card-hover">
          {!hasHits ? (
            <p className="px-3 py-3 text-sm text-slate-500">No matches for &ldquo;{q.trim()}&rdquo;</p>
          ) : (
            groups
              .filter((g) => g.hits.length > 0)
              .map((g) => (
                <div key={g.label} className="py-1">
                  <p className="px-3 py-1 font-heading text-xs font-bold uppercase tracking-wide text-slate-400">{g.label}</p>
                  {g.hits.map((h) => (
                    <button
                      key={h.slug}
                      onClick={() => go(`${g.base}/${h.slug}`)}
                      className="block w-full px-3 py-1.5 text-left hover:bg-slate-50"
                    >
                      <span className="font-medium text-navy">{h.name}</span>
                      {h.sub && <span className="ml-2 text-xs text-slate-400">{h.sub}</span>}
                    </button>
                  ))}
                </div>
              ))
          )}
          <button
            onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}
            className="block w-full border-t border-slate-100 px-3 py-2 text-left text-sm font-semibold text-brand-blue hover:bg-slate-50"
          >
            See all results for &ldquo;{q.trim()}&rdquo; →
          </button>
        </div>
      )}
    </div>
  );
}

const LINKS = [
  { href: "/clubs", label: "Clubs" },
  { href: "/schools", label: "Schools" },
  { href: "/coaches", label: "Coaches" },
  { href: "/commitments", label: "Commits" },
  { href: "/rankings", label: "Rankings" },
  { href: "/news", label: "News" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setEmail(session?.user?.email ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 font-heading text-base font-semibold uppercase tracking-wide transition-colors ${
                  active ? "text-brand-sky" : "text-navy hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden min-w-0 flex-1 justify-end lg:flex lg:max-w-xs">
          <SearchBox />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {email ? (
            <Link href="/dashboard" className="btn-navy text-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-outline text-sm">
                Log in
              </Link>
              <Link href="/login?mode=signup" className="btn-primary text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg className="h-6 w-6 text-navy" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            <div className="mb-2">
              <SearchBox onSubmitted={() => setOpen(false)} />
            </div>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2.5 font-heading text-lg font-semibold uppercase tracking-wide text-navy hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {email ? (
                <Link href="/dashboard" className="btn-navy flex-1 text-sm">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn-outline flex-1 text-sm">
                    Log in
                  </Link>
                  <Link href="/login?mode=signup" className="btn-primary flex-1 text-sm">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

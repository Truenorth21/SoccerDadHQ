import Link from "next/link";
import Logo from "./Logo";
import { REGIONS } from "@/lib/regions";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-navy-700 bg-navy text-slate-300">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-3">
          <Logo light />
          <p className="mt-4 text-sm text-slate-400">
            The home base for Florida youth soccer families — directories, reviews, rankings and news,
            all in one place.
          </p>
        </div>

        <div className="lg:col-span-2">
          <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-white">
            Directories
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/clubs" className="hover:text-white">Clubs</Link></li>
            <li><Link href="/schools" className="hover:text-white">Schools</Link></li>
            <li><Link href="/coaches" className="hover:text-white">Coaches</Link></li>
            <li><Link href="/training-centers" className="hover:text-white">Training Centers</Link></li>
            <li><Link href="/facilities" className="hover:text-white">Facilities</Link></li>
            <li><Link href="/tournaments" className="hover:text-white">Tournaments</Link></li>
            <li><Link href="/camps" className="hover:text-white">Camps</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-white">
            Explore
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/commitments" className="hover:text-white">Commitment Tracker</Link></li>
            <li><Link href="/rankings" className="hover:text-white">Community Rankings</Link></li>
            <li><Link href="/news" className="hover:text-white">News</Link></li>
            <li><Link href="/sideline" className="hover:text-white">Sideline Life 🎉</Link></li>
            <li><Link href="/submit" className="hover:text-white">Submit a Listing</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">My Dashboard</Link></li>
            <li><Link href="/claim" className="font-semibold text-brand-amber hover:text-amber-300">Claim Your Profile</Link></li>
            <li><Link href="/advertise" className="hover:text-white">Advertise & Upgrade</Link></li>
            <li><Link href="/partners" className="hover:text-white">Premier Partners</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-white">
            Regions
          </h4>
          <ul className="grid grid-cols-1 gap-2 text-sm">
            {REGIONS.slice(0, 6).map((r) => (
              <li key={r.key}>
                <Link href={`/clubs?region=${r.key}`} className="hover:text-white">
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="mb-1 font-heading text-sm font-bold uppercase tracking-wider text-white">
            The Sideline
          </h4>
          <p className="mb-3 text-xs text-slate-400">Our free weekly newsletter.</p>
          <NewsletterSignup compact />
        </div>
      </div>

      <div className="border-t border-navy-700">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>
            © {2026} SoccerDadHQ.com — Independent. Not affiliated with any league or club.{" "}
            <Link href="/terms" className="underline hover:text-slate-300">Listings may be incomplete — confirm details directly.</Link>
          </p>
          <div className="flex gap-4">
            <Link href="/rankings" className="hover:text-slate-300">Methodology</Link>
            <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

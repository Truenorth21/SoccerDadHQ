import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using SoccerDadHQ, including content and review guidelines.",
};

export default function TermsPage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-heading text-4xl font-bold uppercase tracking-tight text-navy">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: June 2026</p>

      <div className="prose mt-8 space-y-6 text-slate-700 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-navy [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-brand-blue">
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-100">
          This is a starting-point template, not legal advice. Have it reviewed by an attorney before launch.
        </p>

        <p>By using SoccerDadHQ.com you agree to these terms.</p>

        <h2>Directory data &amp; accuracy</h2>
        <p>
          Our directory combines listings we&rsquo;ve compiled with programs added by the community. Information may
          be <strong>incomplete, out of date, or unverified</strong> &mdash; especially for profiles that haven&rsquo;t
          yet been claimed by the program, which may show placeholder descriptions or contact details until the
          organization claims and manages its page. Please treat everything here as a starting point and confirm
          details (tryout dates, fees, contacts) directly with the club, school or coach.
        </p>
        <p>
          <strong>Ratings and reviews come only from genuine community submissions.</strong> A program with no
          reviews is shown as &ldquo;not yet rated&rdquo; &mdash; we never publish fabricated ratings. Aggregate
          ratings reflect the opinions of contributors, not an endorsement by SoccerDadHQ.
        </p>

        <h2>Accounts</h2>
        <p>
          You&rsquo;re responsible for activity under your account and for keeping your login secure. Don&rsquo;t
          impersonate others or create accounts to manipulate reviews or rankings.
        </p>

        <h2>Reviews &amp; community content</h2>
        <ul>
          <li>Reviews must reflect genuine, first-hand experience. One review per program, per person.</li>
          <li>No defamation, harassment, hate speech, personal attacks on minors, or private personal information.</li>
          <li>No fake, incentivized, or competitor-sabotage reviews; no vote manipulation.</li>
          <li>You grant us a license to display and distribute content you post. You retain ownership.</li>
          <li>We may edit, remove, or decline to publish content that violates these terms.</li>
        </ul>

        <h2>Claiming a profile</h2>
        <p>
          Profile claims are verified before access is granted. Claiming falsely or on behalf of an organization
          you don&rsquo;t represent is prohibited.
        </p>

        <h2>Advertising &amp; paid plans</h2>
        <p>
          Ad orders and Premier Partner memberships are subject to approval and separate order terms. Prices shown
          are estimates until confirmed by invoice. Ads are clearly labeled; we may decline or remove ads at our
          discretion.
        </p>

        <h2>Rankings</h2>
        <p>
          Community rankings reflect votes, not on-field results, and are provided for engagement only. We filter
          suspicious voting to protect their integrity.
        </p>

        <h2>Third-party content</h2>
        <p>
          News headlines are aggregated from public feeds and link to and remain the property of their original
          publishers. We are not affiliated with any league, club or school.
        </p>

        <h2>Disclaimer &amp; liability</h2>
        <p>
          The site is provided &ldquo;as is&rdquo; without warranties. To the fullest extent permitted by law, we
          are not liable for decisions made based on information found here.
        </p>

        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:hello@soccerdadhq.com">hello@soccerdadhq.com</a>.</p>
      </div>
    </div>
  );
}

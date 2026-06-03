import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SoccerDadHQ collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-heading text-4xl font-bold uppercase tracking-tight text-navy">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: June 2026</p>

      <div className="prose mt-8 space-y-6 text-slate-700 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-navy [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-brand-blue">
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-100">
          This is a starting-point template, not legal advice. Have it reviewed by an attorney before launch.
        </p>

        <p>
          SoccerDadHQ (&ldquo;we,&rdquo; &ldquo;us&rdquo;) operates SoccerDadHQ.com. This policy explains what
          we collect and how we use it.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li><strong>Account info</strong> — email address (and name/avatar if you sign in with Google) when you create an account.</li>
          <li><strong>Content you submit</strong> — reviews, ratings, votes, commitment announcements, claim and inquiry forms.</li>
          <li><strong>Newsletter</strong> — your email and chosen region when you subscribe to The Sideline.</li>
          <li><strong>Usage data</strong> — standard server logs and, if enabled, privacy-friendly analytics (pages viewed, device type).</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To provide the directory, reviews, rankings and community features.</li>
          <li>To send the newsletter and account-related email (you can unsubscribe anytime).</li>
          <li>To display and attribute content you post (e.g. your chosen display name on reviews).</li>
          <li>To measure ad delivery and improve the site.</li>
        </ul>

        <h2>Service providers</h2>
        <p>
          We use trusted third parties to operate the site, including <strong>Supabase</strong> (database &amp;
          authentication), <strong>Resend</strong> (email delivery), and <strong>Vercel</strong> (hosting). News
          headlines link to their original publishers; we don&rsquo;t control their privacy practices.
        </p>

        <h2>Advertising &amp; affiliate links</h2>
        <p>
          Some pages show ads, which may include <strong>Google AdSense</strong>. AdSense and its partners use
          cookies to serve and measure ads; manage this in Google&rsquo;s Ads Settings. Some links are
          <strong> affiliate links</strong> (labeled &ldquo;Affiliate&rdquo;) — if you buy through them we may earn
          a commission at no extra cost to you. Directly-sold ads are labeled &ldquo;Sponsored.&rdquo;
        </p>

        <h2>Cookies</h2>
        <p>
          We use essential cookies for login sessions. Favorites and dismissed notices are stored locally in your
          browser. We do not sell your personal information.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>Unsubscribe from the newsletter via the link in any issue or at <a href="/unsubscribe">/unsubscribe</a>.</li>
          <li>Request deletion of your account or a review you posted by emailing us.</li>
        </ul>

        <h2>Children</h2>
        <p>
          The site is intended for parents, coaches and adult community members. Accounts are not intended for
          children under 13.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Email <a href="mailto:privacy@soccerdadhq.com">privacy@soccerdadhq.com</a>.
          {" "}Mailing address: [Your business address here].
        </p>
      </div>
    </div>
  );
}

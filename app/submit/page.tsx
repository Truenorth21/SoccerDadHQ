import type { Metadata } from "next";
import SubmitForm from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit a Listing",
  description: "Know a Florida club, school, coach, training center, facility, tournament or camp that's missing? Submit it and we'll add it to the directory.",
};

const KIND_LABELS: Record<string, { noun: string; blurb: string }> = {
  club: { noun: "Club", blurb: "Missing a club? Add it free — we'll review and publish it, and the club can claim its profile later." },
  school: { noun: "High School", blurb: "Missing a high school program? Add it free — we'll review and publish it." },
  coach: { noun: "Coach", blurb: "Know a coach who isn't listed? Add them — we'll review and publish the profile." },
  "training-center": { noun: "Training Center", blurb: "Missing a training center? Add it and we'll review and publish it." },
  facility: { noun: "Facility", blurb: "Missing a field or facility? Add it and we'll review and publish it." },
  tournament: { noun: "Tournament", blurb: "Missing a tournament? Add it and we'll review and publish it." },
  camp: { noun: "Camp", blurb: "Missing a camp? Add it and we'll review and publish it." },
};

export default function SubmitPage({
  searchParams,
}: {
  searchParams: { kind?: string };
}) {
  const kind = searchParams.kind && KIND_LABELS[searchParams.kind] ? searchParams.kind : undefined;
  const meta = kind ? KIND_LABELS[kind] : undefined;
  const heading = meta ? `Add a ${meta.noun}` : "Submit a Listing";
  const blurb =
    meta?.blurb ??
    "Missing a club, school, coach, training center, facility, tournament or camp? Add it free — we'll review and publish it, and the program can claim it later.";

  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">{heading}</h1>
          <p className="mt-1 max-w-2xl text-slate-300">{blurb}</p>
        </div>
      </section>
      <div className="container-page max-w-2xl py-8">
        <SubmitForm presetKind={kind} />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import SubmitForm from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit a Listing",
  description: "Know a Florida club, school, coach, training center, facility, tournament or camp that's missing? Submit it and we'll add it to the directory.",
};

export default function SubmitPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-navy py-10 text-white">
        <div className="container-page">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">Submit a Listing</h1>
          <p className="mt-1 max-w-2xl text-slate-300">
            Missing a club, school, coach, training center, facility, tournament or camp? Add it free — we'll
            review and publish it, and the program can claim it later.
          </p>
        </div>
      </section>
      <div className="container-page max-w-2xl py-8">
        <SubmitForm />
      </div>
    </>
  );
}

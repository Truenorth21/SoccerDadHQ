import type { Metadata } from "next";
import TryoutsView from "@/components/TryoutsView";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Youth Soccer Tryouts Near You",
  description:
    "Upcoming youth soccer tryouts across the country, posted by the clubs themselves. Browse by state and get tryout alerts by email.",
  alternates: { canonical: "/tryouts" },
};

export default function TryoutsPage() {
  return <TryoutsView />;
}

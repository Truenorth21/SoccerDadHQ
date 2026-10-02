import type { Metadata } from "next";
import RankingsView from "@/components/RankingsView";

export const metadata: Metadata = {
  title: "National Youth Soccer Rankings",
  description:
    "Community-voted national rankings of the best youth soccer clubs, coaches, training centers, facilities, tournaments and camps. Filter by state, vote monthly and see who's trending.",
  alternates: { canonical: "/rankings" },
};

export const dynamic = "force-dynamic";

export default function RankingsPage() {
  return <RankingsView />;
}

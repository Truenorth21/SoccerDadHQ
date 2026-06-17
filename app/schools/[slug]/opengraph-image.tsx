import { ImageResponse } from "next/og";
import { getSchoolBySlug } from "@/lib/data";
import { getRankFor } from "@/lib/rankings";
import { regionName } from "@/lib/regions";
import { initials } from "@/lib/utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "School soccer profile — SoccerDadHQ";

// DB + seed so crowdsourced/imported schools get a real card, not the generic one.
export default async function Image({ params }: { params: { slug: string } }) {
  const school = await getSchoolBySlug(params.slug);
  const name = school?.name ?? "SoccerDadHQ";
  const color = school?.logo_color ?? "#1a4fa0";
  // Best-ranked team, only when backed by real recommendations (honest).
  const rank = school ? await getRankFor("schools", school.id, { prefix: true }) : null;
  const showRank = !!rank && rank.votes > 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px",
          background: "linear-gradient(135deg, #0a1628 0%, #142844 60%, #1a4fa0 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 130,
                height: 130,
                borderRadius: 24,
                background: color,
                fontSize: 56,
                fontWeight: 800,
              }}
            >
              {initials(name)}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 26, color: "#e8a020", letterSpacing: 3, textTransform: "uppercase" }}>
                {school ? [school.fhsaa_class, regionName(school.region)].filter(Boolean).join(" · ") : "Florida High School Soccer"}
              </div>
              <div style={{ display: "flex", fontSize: 60, fontWeight: 800, marginTop: 8, maxWidth: showRank ? 600 : 920, lineHeight: 1.05 }}>
                {name}
              </div>
            </div>
          </div>
          {showRank && rank && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", fontSize: 90, fontWeight: 800, color: "#e8a020", lineHeight: 1 }}>#{rank.regionRank}</div>
              <div style={{ display: "flex", fontSize: 20, color: "#cbd5e1", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>
                {rank.programLabel ? `${rank.programLabel} · ` : ""}{regionName(rank.region)}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", color: "#e8a020", fontWeight: 800, fontSize: 34 }}>
            {school ? (school.review_count > 0 ? `${school.mascot} · ★ ${school.rating.toFixed(1)}` : school.mascot) : ""}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://soccerdadhq.com/icon.png" width={44} height={44} alt="" style={{ borderRadius: 9999, background: "#fff" }} />
            <div style={{ display: "flex", fontSize: 30, color: "#94a3b8" }}>SoccerDadHQ.com</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}

import { ImageResponse } from "next/og";
import { CLUBS } from "@/lib/seed";
import { regionName } from "@/lib/regions";
import { initials } from "@/lib/utils";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Club profile — SoccerDadHQ";

export default function Image({ params }: { params: { slug: string } }) {
  const club = CLUBS.find((c) => c.slug === params.slug);
  const name = club?.name ?? "SoccerDadHQ";
  const color = club?.logo_color ?? "#1a4fa0";

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
              {club ? regionName(club.region) : "Florida Youth Soccer"}
            </div>
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800, marginTop: 8, maxWidth: 920, lineHeight: 1.05 }}>
              {name}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34 }}>
            {club && (
              <span style={{ display: "flex", color: "#e8a020", fontWeight: 800 }}>
                ★ {club.rating.toFixed(1)} · {club.review_count} reviews
              </span>
            )}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#94a3b8" }}>SoccerDadHQ.com</div>
        </div>
      </div>
    ),
    size
  );
}

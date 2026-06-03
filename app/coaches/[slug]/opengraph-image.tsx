import { ImageResponse } from "next/og";
import { COACHES } from "@/lib/seed";
import { regionName } from "@/lib/regions";
import { initials } from "@/lib/utils";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Coach profile — SoccerDadHQ";

export default function Image({ params }: { params: { slug: string } }) {
  const coach = COACHES.find((c) => c.slug === params.slug);
  const name = coach?.name ?? "SoccerDadHQ";
  const color = coach?.photo_color ?? "#1a4fa0";

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
              borderRadius: 999,
              background: color,
              fontSize: 56,
              fontWeight: 800,
            }}
          >
            {initials(name)}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 26, color: "#e8a020", letterSpacing: 3, textTransform: "uppercase" }}>
              {coach ? regionName(coach.region) : "Florida Youth Soccer"}
            </div>
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800, marginTop: 8, maxWidth: 920, lineHeight: 1.05 }}>
              {name}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", color: "#cbd5e1", fontSize: 32, maxWidth: 850 }}>
            {coach ? `${coach.title} · ${coach.club_name}` : ""}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#94a3b8" }}>SoccerDadHQ.com</div>
        </div>
      </div>
    ),
    size
  );
}

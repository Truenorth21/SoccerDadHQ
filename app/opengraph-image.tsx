import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SoccerDadHQ — Florida Youth Soccer";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a1628 0%, #142844 45%, #1a4fa0 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#e8a020", letterSpacing: 4, textTransform: "uppercase" }}>
          Florida Youth Soccer
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, marginTop: 16, lineHeight: 1.05 }}>
          Soccer<span style={{ color: "#2a7de1" }}>Dad</span>HQ
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#cbd5e1", marginTop: 24, maxWidth: 900 }}>
          Club & coach directories, reviews, rankings and news for Florida soccer families.
        </div>
      </div>
    ),
    size
  );
}

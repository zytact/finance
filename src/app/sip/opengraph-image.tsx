import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export const alt =
  "SIP Calculator - Calculate Systematic Investment Plan Returns";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textAlign: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: "bold",
          marginBottom: "20px",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        📈 SIP Calculator
      </div>
      <div
        style={{
          fontSize: 32,
          marginBottom: "40px",
          opacity: 0.9,
        }}
      >
        Systematic Investment Plan Returns
      </div>
      <div
        style={{
          fontSize: 24,
          opacity: 0.8,
          maxWidth: "600px",
          lineHeight: "1.4",
        }}
      >
        Calculate your SIP investment returns with step-up options and different
        frequencies
      </div>
      <div
        style={{
          fontSize: 20,
          marginTop: "30px",
          opacity: 0.7,
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <span>💰 Investment Amount</span>
        <span>📅 Frequency Options</span>
        <span>📊 Return Projections</span>
        <span>⬆️ Step-up SIP</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}

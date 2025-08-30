import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export const alt = "Finance Calculator - SIP, Lumpsum & CAGR Calculators";
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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
        💰 Finance Calculator
      </div>
      <div
        style={{
          fontSize: 32,
          marginBottom: "40px",
          opacity: 0.9,
        }}
      >
        SIP • Lumpsum • CAGR Calculators
      </div>
      <div
        style={{
          fontSize: 24,
          opacity: 0.8,
          maxWidth: "600px",
          lineHeight: "1.4",
        }}
      >
        Calculate your investment returns with our comprehensive financial tools
      </div>
    </div>,
    {
      ...size,
    },
  );
}

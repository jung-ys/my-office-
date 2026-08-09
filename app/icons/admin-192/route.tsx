import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#334155",
        }}
      >
        <svg width={Math.round(size.width * 0.55)} height={Math.round(size.height * 0.55)} viewBox="0 0 100 100">
          <rect x="15" y="20" width="70" height="14" rx="7" fill="white" />
          <rect x="15" y="43" width="70" height="14" rx="7" fill="white" />
          <rect x="15" y="66" width="70" height="14" rx="7" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const s = size.width;
const triSize = Math.round(s * 0.5);

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
        }}
      >
        <svg width={triSize} height={triSize} viewBox="0 0 100 100">
          <polygon points="22,8 22,92 90,50" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

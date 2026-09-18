import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default OG image for every page that doesn't generate its own. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #134e4a 0%, #0d9488 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "white",
            display: "flex",
          }}
        >
          Oja Square
        </div>
        <div
          style={{
            fontSize: 34,
            color: "#ccfbf1",
            marginTop: 24,
            display: "flex",
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          Every store on Oja, one search away
        </div>
      </div>
    ),
    { ...size },
  );
}

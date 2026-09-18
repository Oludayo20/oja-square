import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oja Square — shop every store on Oja",
    short_name: "Oja Square",
    description:
      "Browse products from every independent Nigerian merchant on Oja in one place, then buy directly from the store that sells it.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/images/oja-logo-trans-icon.png",
        sizes: "312x312",
        type: "image/png",
      },
    ],
  };
}

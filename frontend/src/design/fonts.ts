import localFont from "next/font/local";

// Fuentes autoalojadas (offline): subconjunto latino de @fontsource-variable.
// Fraunces "full" incluye los ejes opsz, SOFT y WONK que usa la GUIA_VISUAL §4.3.
export const fraunces = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2", style: "normal", weight: "100 900" },
    { path: "../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});

export const manrope = localFont({
  src: [{ path: "../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2", style: "normal", weight: "200 800" }],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

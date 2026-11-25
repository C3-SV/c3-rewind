import type { Metadata } from "next";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "../styles/tokens.css";
import "../styles/motion.css";
import "../styles/primitives.css";
import "../styles/stage.css";

export const metadata: Metadata = {
  title: "C3 Rewind",
  description: "Un año de competencia, creación y conexión.",
  referrer: "no-referrer",
  robots: { index: false, follow: false, noarchive: true },
  openGraph: {
    title: "C3 Rewind",
    description: "Un año de competencia, creación y conexión.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

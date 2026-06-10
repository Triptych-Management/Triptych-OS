import type { Metadata } from "next";
import { Bebas_Neue, Instrument_Serif, Inter } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import { TopNav } from "@/components/TopNav";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Triptych OS",
  description: "Internal operations tracker for Triptych Management.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${instrument.variable} ${inter.variable}`}
    >
      <body>
        <AppProvider>
          <TopNav />
          <main className="tri-main">{children}</main>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}

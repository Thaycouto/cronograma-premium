import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteFooter } from "@/app/site-footer";
import { SupportWhatsAppButton } from "@/app/support-whatsapp";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Couto Hair Program",
  description: "Cronograma capilar premium com diagnóstico, rotina personalizada e acompanhamento.",
  icons: {
    icon: [{ url: "/assets/logo-couto-hair-icon.png", type: "image/png" }],
    apple: [{ url: "/assets/logo-couto-hair-icon.png", type: "image/png" }],
    shortcut: [{ url: "/assets/logo-couto-hair-icon.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${fraunces.variable} ${manrope.variable}`}>
        {children}
        <SiteFooter />
        <SupportWhatsAppButton />
      </body>
    </html>
  );
}

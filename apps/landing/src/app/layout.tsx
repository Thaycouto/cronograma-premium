import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
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
  metadataBase: new URL("https://couto-hair-program.netlify.app"),
  title: "Couto Hair Program | Cronograma Capilar Personalizado",
  description:
    "Monte um cronograma capilar personalizado para reduzir frizz, ressecamento, quebra e organizar os cuidados do seu cabelo com mais direção.",
  icons: {
    icon: [{ url: "/assets/logo-couto-hair.jpeg", type: "image/jpeg" }],
    apple: [{ url: "/assets/logo-couto-hair.jpeg", type: "image/jpeg" }],
    shortcut: [{ url: "/assets/logo-couto-hair.jpeg", type: "image/jpeg" }],
  },
  openGraph: {
    title: "Couto Hair Program | Cronograma Capilar Personalizado",
    description:
      "Monte um cronograma capilar personalizado para reduzir frizz, ressecamento, quebra e organizar os cuidados do seu cabelo com mais direção.",
    url: "https://couto-hair-program.netlify.app",
    siteName: "Couto Hair Program",
    images: [
      {
        url: "/assets/fotos referencia cronograma/depois.cronograma.jpeg",
        width: 1200,
        height: 1600,
        alt: "Resultado capilar usado como referência do Couto Hair Program",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${fraunces.variable} ${manrope.variable}`}>
        {children}
        <SupportWhatsAppButton />
      </body>
    </html>
  );
}

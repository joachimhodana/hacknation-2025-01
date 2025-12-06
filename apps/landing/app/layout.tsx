import type { Metadata } from "next";
import { Manrope, Reenie_Beanie } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const reenie = Reenie_Beanie({
  subsets: ["latin"],
  variable: "--font-reenie",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "BydGO — Zwiedzaj Bydgoszcz tak, jak lubisz.",
  description:
    "Zwiedzaj Bydgoszcz w nowy sposób — trasy, punkty, ciekawostki i nagrody za odkrywanie miasta. Dla mieszkańców i turystów.",
  keywords: ["Bydgoszcz", "BydGO", "miasto", "trasy", "gra miejska", "punkty"],
  metadataBase: new URL("https://bydgo.app"),

  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-180.png",
  },

  openGraph: {
    title: "BydGO — Zwiedzaj Bydgoszcz tak, jak lubisz.",
    description:
      "Zwiedzaj Bydgoszcz w nowy sposób. Zbieraj punkty, odblokowuj odznaki, eksploruj swoje miasto.",
    url: "https://bydgo.app",
    siteName: "BydGO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BydGO – gra miejska",
      },
    ],
    type: "website",
    locale: "pl_PL",
  },

  twitter: {
    card: "summary_large_image",
    title: "BydGO — Zwiedzaj Bydgoszcz tak, jak lubisz.",
    description:
      "Zwiedzaj Bydgoszcz, zbieraj punkty i przechodź trasy miejskie. BydGO to nowy sposób poznawania miasta.",
    images: ["/og-image.png"],
  },

  appleWebApp: {
    title: "BydGO",
    capable: true,
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="scroll-smooth">
      <head>
        <meta name="apple-mobile-web-app-title" content="BydGO" />
      </head>

      <body className={`${manrope.variable} ${reenie.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
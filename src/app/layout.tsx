import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ThemeWrapper from "@/components/ThemeWrapper";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Presty Food — Restaurant & Traiteur Alger",
  description:
    "Découvrez Presty Food : cuisine authentique préparée avec des produits frais. Commandez en ligne, réservez une table ou faites-vous livrer.",
  openGraph: {
    title: "Presty Food — Restaurant & Traiteur Alger",
    description:
      "Cuisine authentique préparée avec des produits frais. Commandez en ligne, réservez une table.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${playfairDisplay.variable} antialiased`}
      >
        <ThemeWrapper>
          <ClientLayout>{children}</ClientLayout>
        </ThemeWrapper>
      </body>
    </html>
  );
}

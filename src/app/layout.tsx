import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tri de CV IA | Outil de Tri de Curriculum Vitae Automatique",
  description: "Outil gratuit d'analyse de CV par Intelligence Artificielle. Évaluez automatiquement les profils candidats, scorez les CV, triez les candidatures et prenez des décisions de recrutement en quelques secondes.",
  keywords: [
    // French Keywords
    "analyse CV", "analyseur CV", "CV analyse", "intelligence artificielle", "IA recrutement",
    "analyse de CV", "évaluation CV", "noter CV", "scoring CV", "triage CV",
    "recrutement automatisé", "analyse automatique CV", "OCR CV", "extraction texte CV",
    "analyseur de curriculum vitae", "logiciel analyse CV", "outil analyse CV",
    "analyse CV gratuit", "traitement CV", "reconnaissance CV", "classement candidats",
    "décision recrutement", "justification analyse CV", "faculté des sciences juridiques économiques et sociales", "fsjes", "faculté tanger", "université tanger", "projet universitaire",
    "analyse CV maroc", "recrutement maroc", "gestion candidatures",

    // English Keywords
    "CV analyzer", "resume analyzer", "AI CV analysis", "artificial intelligence CV",
    "resume parsing", "CV parsing", "resume scoring", "CV scoring", "candidate ranking",
    "automated recruitment", "HR tools", "applicant tracking", "resume OCR",
    "extract text from CV", "analyze resumes", "CV evaluation", "resume screening",
    "AI recruitment", "machine learning CV", "CV analysis tool", "free CV analyzer",
    "resume evaluation", "candidate assessment", "hiring automation", "CV screening"
  ],
  authors: [{ name: "Faculté des sciences juridiques, économiques et sociales" }],
  creator: "Sharone - Analyseur CV IA",
  publisher: "Faculté des sciences juridiques, économiques et sociales",
  metadataBase: new URL("https://fsjest.mizotra.com.com"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Tri de CV par Intelligence Artificielle",
    description: "Analysez et évaluez des CV automatiquement avec l'IA. Outil de recrutement intelligent pour trier les candidatures.",
    type: "website",
    url: "https://fsjest.mizotra.com.com",
    siteName: "Sharone Tri CV",
    locale: "fr_MA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tri CV IA",
    description: "Analyse automatique de CV par Intelligence Artificielle",
  },
  verification: {
    google: "google-site-verification=your-verification-code-here",
  },
  category: "Technology, Recruitment, Human Resources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProgressProvider } from "@/lib/progress";
import { EnforcementProvider } from "@/components/EnforcementProvider";
import { AuthGate } from "@/components/AuthGate";
import { InstallPrompt } from "@/components/InstallPrompt";
import { themeScript } from "@/components/ThemeToggle";
import { LangProvider, langScript } from "@/lib/i18n";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "English Learning Center — Ingliz tilini o'rganing",
  description:
    "O'zbek tilida so'zlashuvchilar uchun ingliz tili platformasi: Beginner'dan IELTS gacha darslar, lug'at, test va tinglash mashqlari.",
  icons: { icon: "/logo.svg", apple: "/icon-192.png" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "EnglishUp",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b14" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + langScript }} />
      </head>
      <body
        className={`${jakarta.variable} ${fraunces.variable} flex min-h-screen flex-col font-sans`}
      >
        <LangProvider>
          <ProgressProvider>
          <EnforcementProvider>
            <Header />
            <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-16 pt-10 max-md:pb-28 max-md:pt-7">
              {children}
            </main>
            <Footer />
            <AuthGate />
            <InstallPrompt />
          </EnforcementProvider>
          </ProgressProvider>
        </LangProvider>
      </body>
    </html>
  );
}

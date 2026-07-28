import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Baloo_2, Karla, JetBrains_Mono } from "next/font/google";
import "@/styles.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-display",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Hello, I'm Mac — Retro Portfolio",
  description: "A neo-brutalist portfolio template.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${baloo.variable} ${karla.variable} ${jetbrains.variable}`}>
      <body className="font-sans bg-dots-bg text-ink antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

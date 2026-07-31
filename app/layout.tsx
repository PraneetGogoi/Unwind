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
  title: "Unwind — Dev Burnout Lab",
  description: "Turns developer burnout signals into actionable insights.",
};

import { Header } from "@/components/Header";
import { CommandPalette } from "@/components/CommandPalette";
import { DatabaseProvider } from "@/components/DatabaseProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${baloo.variable} ${karla.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans bg-dots-bg text-ink antialiased">
        <ThemeProvider>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('error', function(e) {
                  const div = document.createElement('div');
                  div.style.position = 'fixed';
                  div.style.top = '0';
                  div.style.left = '0';
                  div.style.zIndex = '9999';
                  div.style.background = 'red';
                  div.style.color = 'white';
                  div.style.padding = '10px';
                  div.innerText = 'JS ERROR: ' + e.message;
                  document.body.appendChild(div);
                });
              `
            }}
          />
          <DatabaseProvider>
            <Header />
            <div className="min-h-[calc(100vh-4rem-6rem)]">{children}</div>
            <footer className="border-t-2 border-ink bg-frame py-6 px-4">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-bold uppercase text-muted-foreground">
                <div className="flex gap-4">
                  <span>© {new Date().getFullYear()} Unwind</span>
                  <span>Not Medical Advice</span>
                </div>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-ink hover:underline decoration-2 underline-offset-2">GitHub</a>
                  <a href="#" className="hover:text-ink hover:underline decoration-2 underline-offset-2">Portfolio</a>
                  <span>Your data stays on your device.</span>
                </div>
              </div>
            </footer>
            <CommandPalette />
          </DatabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

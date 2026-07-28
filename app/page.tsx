"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dots-bg text-ink selection:bg-ink selection:text-paper">
      <main className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        {/* hero */}
        <section className="flex flex-col md:flex-row gap-12 items-start justify-between">
          <div className="flex-1">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.0] tracking-tight">
              The quiet science of
              <br />
              staying well at the keyboard.
            </h1>
            <p className="mt-8 text-xl font-bold font-sans text-grey-text">
              Unwind turns burnout signals — sleep, caffeine, commits, meetings
              — into clear insight. Explore the data, predict your risk, and
              recover.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="brutal-btn inline-block px-8 py-4 font-bold text-lg"
              >
                Explore Dashboard
              </Link>
              <Link
                href="/predict"
                className="brutal-card inline-block px-8 py-4 font-bold text-lg bg-paper"
              >
                Predict My Risk
              </Link>
            </div>
          </div>

          <div className="w-full md:w-[400px] h-[400px] bg-paper brutal-border flex items-center justify-center brutal-card p-6 relative">
            {/* Illustration placeholder */}
            <div className="text-center font-bold text-grey-text">
              [ Illustration: pen + retro computer ]
            </div>

            {/* Fake browser chrome for hero illustration */}
            <div className="absolute top-0 left-0 right-0 h-10 border-b-2 border-ink flex items-center px-4 bg-frame">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
                <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
              </div>
              <div className="mx-auto font-mono text-xs font-bold">
                hero_image.svg
              </div>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="mt-24">
          <h2 className="font-display text-2xl mb-4">Quick links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 border-2 border-ink bg-paper shadow-hard">
            {["Dashboard", "Predict", "Breathe", "Tips"].map((link, i) => (
              <Link
                key={link}
                href={`/${link.toLowerCase()}`}
                className={`
                  flex items-center justify-between p-4 font-bold font-sans group hover:bg-frame transition-colors
                  ${i !== 0 ? "border-t-2 md:border-t-0 border-ink" : ""}
                  ${i % 2 !== 0 ? "border-l-2 border-ink" : ""}
                  ${i > 0 && i % 2 === 0 ? "md:border-l-2 border-ink" : ""}
                `}
              >
                {link}
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  const [focus, setFocus] = useState<{ title: string; color: string } | null>(null);

  useEffect(() => {
    const savedFocus = localStorage.getItem("unwind_focus");
    if (savedFocus) setFocus(JSON.parse(savedFocus));
  }, []);
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
                className="brutal-btn brutal-btn-primary inline-block px-8 py-4 font-bold text-lg"
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

            {focus && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                <Link href="/my-unwind" className="inline-flex items-center gap-3 p-4 border-2 border-ink bg-frame shadow-hard-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  <div className="w-10 h-10 border-2 border-ink bg-paper shadow-hard-sm flex items-center justify-center" style={{ color: focus.color }}>
                    <CheckCircle2 className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">This week's focus</div>
                    <div className="font-display text-xl" style={{ color: focus.color }}>{focus.title}</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <div className="w-full md:w-[400px] h-[400px] bg-paper brutal-border flex items-center justify-center brutal-card p-6 relative">
            {/* Hero Illustration */}
            <div className="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 400 400" className="w-full h-full text-ink">
                {/* Desk/Background lines */}
                <path d="M 50 320 L 350 320" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
                <path d="M 50 330 L 350 330" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                <path d="M 50 340 L 350 340" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
                
                {/* Retro Computer Monitor */}
                <rect x="100" y="100" width="160" height="130" fill="var(--color-paper)" stroke="currentColor" strokeWidth="8" rx="8" />
                <rect x="110" y="110" width="140" height="100" fill="var(--color-frame)" stroke="currentColor" strokeWidth="4" rx="4" />
                
                {/* Monitor Screen Lines (code) */}
                <line x1="120" y1="130" x2="160" y2="130" stroke="var(--low)" strokeWidth="4" strokeLinecap="round" />
                <line x1="120" y1="150" x2="220" y2="150" stroke="var(--medium)" strokeWidth="4" strokeLinecap="round" />
                <line x1="120" y1="170" x2="180" y2="170" stroke="var(--teal)" strokeWidth="4" strokeLinecap="round" />
                <line x1="120" y1="190" x2="150" y2="190" stroke="var(--high)" strokeWidth="4" strokeLinecap="round" />
                
                {/* Monitor Stand */}
                <path d="M 160 230 L 160 260 L 140 260 L 140 270 L 220 270 L 220 260 L 200 260 L 200 230 Z" fill="var(--color-paper)" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
                
                {/* Keyboard */}
                <rect x="80" y="280" width="200" height="30" fill="var(--color-paper)" stroke="currentColor" strokeWidth="6" rx="4" transform="skewX(-15)" />
                <line x1="95" y1="295" x2="265" y2="295" stroke="currentColor" strokeWidth="2" transform="skewX(-15)" />
                
                {/* Coffee Mug */}
                <rect x="290" y="240" width="40" height="50" fill="var(--color-paper)" stroke="currentColor" strokeWidth="6" rx="2" />
                <path d="M 330 250 C 350 250, 350 270, 330 270" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                
                {/* Floating Pen */}
                <g transform="translate(30, -20) rotate(15, 280, 150)">
                  <path d="M 280 100 L 290 100 L 290 180 L 285 200 L 280 180 Z" fill="var(--color-paper)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
                  <line x1="280" y1="120" x2="290" y2="120" stroke="currentColor" strokeWidth="4" />
                  <line x1="280" y1="175" x2="290" y2="175" stroke="currentColor" strokeWidth="4" />
                  <path d="M 283 110 L 283 150" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </g>
                
                {/* Decorative Sparkles */}
                <path d="M 330 80 L 335 95 L 350 100 L 335 105 L 330 120 L 325 105 L 310 100 L 325 95 Z" fill="var(--coral)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M 80 80 L 82 88 L 90 90 L 82 92 L 80 100 L 78 92 L 70 90 L 78 88 Z" fill="var(--teal)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
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

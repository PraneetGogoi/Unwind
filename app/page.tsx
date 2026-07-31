"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, CheckCircle2, Activity, Brain, Wind } from "lucide-react";
import { useYSetting } from "@/lib/db";
import { db } from "@/lib/db";

export default function LandingPage() {
  const [hasData, setHasData] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const latestPrediction = useYSetting<any>("unwind_latest_prediction", null);
  const streak = useYSetting<number>("unwind_streak", 0);
  const plan = useYSetting<any[]>("unwind_plan", []);

  useEffect(() => {
    if (latestPrediction) {
      setHasData(true);
      setPrediction(latestPrediction.result?.prediction || null);
    }
    if (plan.length > 0) {
      setHasData(true);
    }
  }, [latestPrediction, plan]);

  return (
    <div className="min-h-screen bg-dots-bg text-ink selection:bg-ink selection:text-paper overflow-hidden">
      <main className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        
        {/* Adaptive Welcome Strip */}
        {hasData ? (
          <div className="mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="font-display text-4xl mb-4">Welcome back.</h1>
            <div className="brutal-card bg-paper shadow-hard flex flex-col sm:flex-row divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-ink border-2 border-ink">
              
              <div className="flex-1 p-4 flex flex-col justify-center">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Risk</div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-ink" />
                  <span className="font-bold text-lg">{prediction || "Unknown"}</span>
                </div>
              </div>

              <div className="flex-1 p-4 flex flex-col justify-center">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">Consistency</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-ink" />
                  <span className="font-bold text-lg">{streak} Day Streak</span>
                </div>
              </div>

              <div className="flex-1 p-4 flex flex-col justify-center">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">Active Plan</div>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-ink" />
                  <span className="font-bold text-lg">{plan.length} Habit{plan.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <Link href="/my-unwind" className="flex-1 px-6 py-3 bg-frame hover:bg-ink hover:text-paper transition-colors flex items-center justify-center font-bold text-sm uppercase tracking-wider font-mono border-b-2 sm:border-b-0 border-ink group">
                  Dashboard <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/breathe" className="flex-1 px-6 py-3 bg-paper hover:bg-low hover:text-ink transition-colors flex items-center justify-center font-bold text-sm uppercase tracking-wider font-mono border-t-2 border-ink group">
                  Breathe <Wind className="ml-2 w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        ) : null}

        {/* Hero */}
        <section className={`flex flex-col md:flex-row gap-12 items-start justify-between ${hasData ? 'mt-12' : ''}`}>
          <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {!hasData && (
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.0] tracking-tight">
                The quiet science of
                <br />
                staying well at the keyboard.
              </h1>
            )}
            {hasData && (
              <h2 className="font-display text-4xl sm:text-5xl leading-[1.0] tracking-tight text-muted-foreground">
                The quiet science of
                <br />
                staying well at the keyboard.
              </h2>
            )}

            <p className="mt-8 text-xl font-bold font-sans text-grey-text">
              Unwind turns burnout signals — sleep, caffeine, commits, meetings
              — into clear insight. Explore the data, predict your risk, and
              recover.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href="/predict"
                className="brutal-btn brutal-btn-primary inline-block px-8 py-4 font-mono font-bold text-lg"
              >
                [ PREDICT_RISK.EXE ]
              </Link>
              <Link
                href="/dashboard"
                className="brutal-btn brutal-btn-ghost inline-block px-8 py-4 font-bold text-lg"
              >
                [ EXPLORE_DASHBOARD ]
              </Link>
            </div>
          </div>

          <div className="w-full md:w-[400px] h-[400px] bg-paper brutal-border flex flex-col items-center justify-center brutal-card relative animate-in fade-in zoom-in duration-700 delay-150">
            {/* Fake browser chrome for hero illustration */}
            <div className="absolute top-0 left-0 right-0 h-10 border-b-2 border-ink flex items-center px-4 bg-frame z-10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
                <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
              </div>
              <div className="mx-auto font-mono text-xs font-bold">
                hero_image.svg
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="w-full h-full flex items-center justify-center pt-10">
              <svg viewBox="0 0 400 400" className="w-full h-full text-ink">
                <style>
                  {`
                    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                    @keyframes float { 0%, 100% { transform: translateY(0px) rotate(15deg); } 50% { transform: translateY(-10px) rotate(12deg); } }
                    @keyframes pulse-color { 0%, 100% { stroke: var(--coral); } 50% { stroke: var(--teal); } }
                    .cursor { animation: blink 1s step-end infinite; }
                    .floating-pen { animation: float 4s ease-in-out infinite; transform-origin: center; }
                    .sparkle { animation: pulse-color 3s ease-in-out infinite; }
                  `}
                </style>
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
                <line x1="120" y1="190" x2="140" y2="190" stroke="var(--high)" strokeWidth="4" strokeLinecap="round" />
                <rect x="145" y="186" width="6" height="8" fill="currentColor" className="cursor" />
                
                {/* Monitor Stand */}
                <path d="M 160 230 L 160 260 L 140 260 L 140 270 L 220 270 L 220 260 L 200 260 L 200 230 Z" fill="var(--color-paper)" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
                
                {/* Keyboard */}
                <rect x="80" y="280" width="200" height="30" fill="var(--color-paper)" stroke="currentColor" strokeWidth="6" rx="4" transform="skewX(-15)" />
                <line x1="95" y1="295" x2="265" y2="295" stroke="currentColor" strokeWidth="2" transform="skewX(-15)" />
                
                {/* Coffee Mug */}
                <rect x="290" y="240" width="40" height="50" fill="var(--color-paper)" stroke="currentColor" strokeWidth="6" rx="2" />
                <path d="M 330 250 C 350 250, 350 270, 330 270" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                
                {/* Floating Pen */}
                <g className="floating-pen" style={{ transformOrigin: '285px 150px' }}>
                  <path d="M 280 100 L 290 100 L 290 180 L 285 200 L 280 180 Z" fill="var(--color-paper)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
                  <line x1="280" y1="120" x2="290" y2="120" stroke="currentColor" strokeWidth="4" />
                  <line x1="280" y1="175" x2="290" y2="175" stroke="currentColor" strokeWidth="4" />
                  <path d="M 283 110 L 283 150" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </g>
                
                {/* Decorative Sparkles */}
                <path className="sparkle" d="M 330 80 L 335 95 L 350 100 L 335 105 L 330 120 L 325 105 L 310 100 L 325 95 Z" fill="var(--coral)" stroke="var(--coral)" strokeWidth="2" strokeLinejoin="round" />
                <path className="sparkle" d="M 80 80 L 82 88 L 90 90 L 82 92 L 80 100 L 78 92 L 70 90 L 78 88 Z" fill="var(--teal)" stroke="var(--teal)" strokeWidth="2" strokeLinejoin="round" style={{ animationDelay: '1.5s' }} />
              </svg>
            </div>
          </div>
        </section>

        {/* Data Teaser */}
        <section className="mt-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="brutal-card bg-frame border-2 border-ink shadow-hard p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-ink/5 rotate-12 pointer-events-none">
              <Activity className="w-64 h-64" />
            </div>
            <p className="font-mono text-sm font-bold tracking-widest uppercase mb-4 text-muted-foreground">The Data speaks</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-6 relative z-10 max-w-3xl">
              High cognitive load and lack of boundaries drive <span className="text-high">~70%</span> of developer burnout risk.
            </h2>
            <p className="font-bold max-w-2xl text-lg relative z-10">
              We trained our models on 7,000 real developers to strip away the guesswork. Unwind identifies exactly what's pushing your limits and suggests 2-minute interventions proven to work.
            </p>
          </div>
        </section>

        {/* How It Works Loop */}
        <section className="mt-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <h2 className="font-display text-3xl mb-8">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 border-2 border-ink bg-paper shadow-hard divide-y-2 md:divide-y-0 md:divide-x-2 divide-ink">
            
            <Link href="/predict" className="p-6 group hover:bg-frame transition-colors">
              <div className="w-10 h-10 border-2 border-ink rounded-full flex items-center justify-center font-mono font-bold text-sm mb-4 bg-paper">1</div>
              <h3 className="font-display text-xl mb-2 flex items-center justify-between">
                Predict <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </h3>
              <p className="font-sans text-sm font-bold text-muted-foreground">Take the 60-second assessment to map your current physiological and mental risk.</p>
            </Link>

            <Link href="/dashboard" className="p-6 group hover:bg-frame transition-colors">
              <div className="w-10 h-10 border-2 border-ink rounded-full flex items-center justify-center font-mono font-bold text-sm mb-4 bg-paper">2</div>
              <h3 className="font-display text-xl mb-2 flex items-center justify-between">
                Analyze <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </h3>
              <p className="font-sans text-sm font-bold text-muted-foreground">Explore the 7,000-developer dataset to see how your specific habits correlate to burnout.</p>
            </Link>

            <Link href="/tips" className="p-6 group hover:bg-frame transition-colors">
              <div className="w-10 h-10 border-2 border-ink rounded-full flex items-center justify-center font-mono font-bold text-sm mb-4 bg-paper">3</div>
              <h3 className="font-display text-xl mb-2 flex items-center justify-between">
                Plan <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </h3>
              <p className="font-sans text-sm font-bold text-muted-foreground">Our SHAP model tells you exactly which micro-habit to adopt to lower your risk today.</p>
            </Link>

            <Link href="/breathe" className="p-6 group hover:bg-frame transition-colors">
              <div className="w-10 h-10 border-2 border-ink rounded-full flex items-center justify-center font-mono font-bold text-sm mb-4 bg-paper">4</div>
              <h3 className="font-display text-xl mb-2 flex items-center justify-between">
                Breathe <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </h3>
              <p className="font-sans text-sm font-bold text-muted-foreground">Interrupt stress loops instantly with our built-in guided breathwork sensory module.</p>
            </Link>

          </div>
        </section>
      </main>
    </div>
  );
}

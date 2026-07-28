"use client";

import { Header } from "@/components/Header";

export default function BreathePage() {
  return (
    <div className="min-h-screen bg-dots-bg text-ink selection:bg-ink selection:text-paper flex flex-col">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-24 flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-5xl md:text-7xl mb-8">4-7-8 Breathing</h1>
        <p className="font-sans text-xl text-grey-text mb-12">
          Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 4 times to reduce stress.
        </p>
        
        <div className="w-64 h-64 rounded-full border-4 border-ink bg-paper shadow-hard flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-frame opacity-50 scale-50 group-hover:scale-100 transition-transform duration-[4000ms] ease-in-out rounded-full" />
          <span className="font-display text-3xl z-10">Breathe</span>
        </div>
      </main>
    </div>
  );
}

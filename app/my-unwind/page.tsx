"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

const PlotlyChart = dynamic(
  () => import("@/components/PlotlyChart").then((mod) => mod.PlotlyChart),
  { ssr: false, loading: () => <div className="h-64 bg-frame animate-pulse" /> }
);

type CheckIn = {
  date: string;
  energy: number; // 1-5
  mood: number; // 1-5
  sleep: number; // hours
};

export default function MyUnwindPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [focus, setFocus] = useState<{ title: string; color: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [checkInState, setCheckInState] = useState({ energy: 3, mood: 3, sleep: 7 });

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("unwind_history") || "[]");
    setHistory(savedHistory);

    const savedFocus = localStorage.getItem("unwind_focus");
    if (savedFocus) setFocus(JSON.parse(savedFocus));

    const savedStreak = parseInt(localStorage.getItem("unwind_streak") || "0", 10);
    setStreak(savedStreak);

    const lastCheckIn = localStorage.getItem("unwind_last_checkin");
    if (lastCheckIn === new Date().toDateString()) {
      setHasCheckedInToday(true);
    }
  }, []);

  const handleCheckIn = () => {
    setHasCheckedInToday(true);
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("unwind_streak", newStreak.toString());
    localStorage.setItem("unwind_last_checkin", new Date().toDateString());
    
    const checkIns = JSON.parse(localStorage.getItem("unwind_daily_checkins") || "[]");
    checkIns.push({
      date: new Date().toISOString(),
      ...checkInState
    });
    localStorage.setItem("unwind_daily_checkins", JSON.stringify(checkIns));
  };

  const levelMap: Record<string, number> = { "Low": 1, "Medium": 2, "High": 3 };
  
  const trendData = history.length > 0 ? [
    {
      x: history.map((h, i) => new Date(h.timestamp).toLocaleDateString() + ` (${i+1})`),
      y: history.map(h => levelMap[h.result.burnout_level] || 2),
      type: "scatter",
      mode: "lines+markers",
      line: { color: "var(--ink)", width: 3, shape: "spline" },
      marker: { size: 10, color: history.map(h => {
        if (h.result.burnout_level === "High") return "var(--high)";
        if (h.result.burnout_level === "Medium") return "var(--medium)";
        return "var(--low)";
      }) }
    }
  ] : [];

  return (
    <div className="flex-1 bg-dots-bg text-ink selection:bg-ink selection:text-paper">
      <main className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-12">
          <h1 className="font-display text-4xl sm:text-5xl">My Unwind</h1>
          <p className="text-muted-foreground mt-2 text-lg font-bold">
            Your personal dashboard for tracking risk, checking in, and building kinder habits.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Daily Check-in */}
          <section>
            <h2 className="font-display text-2xl mb-4">Daily Check-in</h2>
            <Card className="p-6 brutal-card bg-paper shadow-hard">
              {hasCheckedInToday ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-ink" />
                  <h3 className="font-bold text-xl mb-2">Check-in complete</h3>
                  <p className="text-muted-foreground mb-4">You're on a {streak}-day streak.</p>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider">Tomorrow is another day</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider">Energy Level</label>
                    <input 
                      type="range" min="1" max="5" 
                      value={checkInState.energy}
                      onChange={e => setCheckInState({...checkInState, energy: parseInt(e.target.value)})}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-mono font-bold mt-1 text-muted-foreground">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider">Mood</label>
                    <input 
                      type="range" min="1" max="5" 
                      value={checkInState.mood}
                      onChange={e => setCheckInState({...checkInState, mood: parseInt(e.target.value)})}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-mono font-bold mt-1 text-muted-foreground">
                      <span>Stressed</span>
                      <span>Calm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider">Sleep (Hours)</label>
                    <input 
                      type="number" min="0" max="14" step="0.5"
                      value={checkInState.sleep}
                      onChange={e => setCheckInState({...checkInState, sleep: parseFloat(e.target.value)})}
                      className="w-full p-2 border-2 border-ink bg-frame font-mono text-sm outline-none focus:ring-2 focus:ring-ink"
                    />
                  </div>
                  <button 
                    onClick={handleCheckIn}
                    className="brutal-btn brutal-btn-primary w-full py-3 font-bold text-lg"
                  >
                    Log today
                  </button>
                </div>
              )}
            </Card>
          </section>

          {/* Focus & Streak */}
          <section>
            <h2 className="font-display text-2xl mb-4">Weekly Focus</h2>
            <Card className="p-6 brutal-card bg-frame shadow-hard relative overflow-hidden">
              {focus ? (
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-muted-foreground">Active Focus</span>
                  </div>
                  <h3 className="font-display text-3xl mb-4" style={{ color: focus.color }}>
                    {focus.title}
                  </h3>
                  <p className="font-bold mb-6">Building kinder weeks, one habit at a time.</p>
                  <div className="flex items-center gap-2 font-mono text-sm font-bold">
                    <CheckCircle2 className="w-5 h-5 text-ink" />
                    <span>{streak} kinder days so far</span>
                  </div>
                  <Link href="/tips" className="mt-6 inline-flex items-center gap-2 text-sm font-bold hover:underline group">
                    Change focus <ArrowRight className="w-4 h-4 arrow-icon group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <div className="relative z-10 text-center py-8 border-2 border-dashed border-ink rounded-[3px]">
                  <p className="font-bold mb-6">You haven't picked a focus yet.</p>
                  <Link href="/tips" className="brutal-btn brutal-btn-primary inline-block px-6 py-3 font-bold">
                    Pick a focus
                  </Link>
                </div>
              )}
            </Card>
          </section>
        </div>

        {/* Prediction Trend */}
        <section className="mt-12">
          <h2 className="font-display text-2xl mb-4">Risk Trend</h2>
          <Card className="p-6 brutal-card bg-paper shadow-hard">
            {history.length > 0 ? (
              <div className="h-72">
                <PlotlyChart 
                  data={trendData as any}
                  layout={{
                    margin: { t: 20, r: 20, b: 40, l: 40 },
                    paper_bgcolor: "transparent",
                    plot_bgcolor: "transparent",
                    yaxis: { 
                      tickvals: [1, 2, 3],
                      ticktext: ["Low", "Medium", "High"],
                      gridcolor: "var(--muted)",
                      range: [0.5, 3.5]
                    },
                    xaxis: {
                      showgrid: false,
                      tickfont: { family: "JetBrains Mono" }
                    }
                  }}
                  config={{ displayModeBar: false }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="font-bold mb-6">No prediction history yet.</p>
                <Link href="/predict" className="brutal-card px-6 py-3 font-bold bg-frame border-2 border-ink inline-block shadow-hard-sm active:translate-y-1 active:translate-x-1 active:shadow-none">
                  Take the prediction quiz
                </Link>
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}

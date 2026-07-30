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
  energy: number;
  mood: number;
  sleep: number;
};

export default function MyUnwindPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [focus, setFocus] = useState<{ title: string; color: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [checkInState, setCheckInState] = useState({ energy: 3, mood: 3, sleep: 7 });
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

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
    
    const savedCheckIns = JSON.parse(localStorage.getItem("unwind_daily_checkins") || "[]");
    setCheckIns(savedCheckIns);
  }, []);

  const handleCheckIn = () => {
    setHasCheckedInToday(true);
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("unwind_streak", newStreak.toString());
    localStorage.setItem("unwind_last_checkin", new Date().toDateString());
    
    const newCheckIns = [...checkIns, {
      date: new Date().toISOString(),
      ...checkInState
    }];
    setCheckIns(newCheckIns);
    localStorage.setItem("unwind_daily_checkins", JSON.stringify(newCheckIns));
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getTrendText = () => {
    if (history.length < 2) return "Start tracking your risk today.";
    const last = levelMap[history[history.length - 1].result.burnout_level] || 2;
    const prev = levelMap[history[history.length - 2].result.burnout_level] || 2;
    if (last < prev) return "you're trending calmer this week.";
    if (last > prev) return "your risk is trending up — take it easy.";
    return "your risk level is holding steady.";
  };

  const latestPrediction = history.length > 0 ? history[history.length - 1] : null;

  const getTopDrivers = () => {
    if (!latestPrediction || !latestPrediction.inputs) return [];
    const inputs = latestPrediction.inputs;
    const drivers = [];
    if (inputs.sleep_hours < 7) drivers.push({ name: "Low Sleep", tip: "Sleep" });
    if (inputs.screen_time > 10) drivers.push({ name: "High Screen Time", tip: "Screen time" });
    if (inputs.meetings_per_day > 4) drivers.push({ name: "Meeting Overload", tip: "Meetings" });
    if (inputs.caffeine_intake > 3) drivers.push({ name: "High Caffeine", tip: "Caffeine" });
    if (inputs.daily_work_hours > 9) drivers.push({ name: "Overwork", tip: "Boundaries" });
    
    return drivers.slice(0, 3);
  };

  return (
    <div className="flex-1 bg-dots-bg text-ink selection:bg-ink selection:text-paper">
      <main className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-12">
          <h1 className="font-display text-4xl sm:text-5xl mb-4">My Unwind</h1>
          <p className="text-muted-foreground text-lg font-bold">
            {getGreeting()} — {getTrendText()}
          </p>
        </header>

        {/* Row 1: Risk */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <section>
            <h2 className="font-display text-2xl mb-4">Current Risk</h2>
            <Card className="p-6 h-72 flex flex-col">
              {latestPrediction ? (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-display text-6xl mb-2" style={{ color: `var(--${latestPrediction.result.burnout_level.toLowerCase()})` }}>
                      {latestPrediction.result.burnout_level}
                    </h3>
                    {latestPrediction.result.probabilities && (
                      <p className="font-bold text-muted-foreground text-lg mb-6">
                        Score: {((latestPrediction.result.probabilities["High"] || 0) * 100 + (latestPrediction.result.probabilities["Medium"] || 0) * 50).toFixed(1)} / 100
                        <br/>
                        <span className="text-sm font-mono uppercase tracking-wider">Last checked: {new Date(latestPrediction.timestamp).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                  <Link href="/predict" className="brutal-btn brutal-btn-primary w-full py-4 font-bold text-lg text-center">
                    Re-run Prediction
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-ink rounded-[3px] flex flex-col items-center justify-center h-full">
                  <p className="font-bold mb-6">No predictions yet.</p>
                  <Link href="/predict" className="brutal-btn brutal-btn-primary inline-block px-6 py-3 font-bold">
                    Run your first prediction
                  </Link>
                </div>
              )}
            </Card>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">Risk Trend</h2>
            <Card className="p-6 h-72 flex flex-col">
              {history.length > 0 ? (
                <div className="h-full w-full">
                  <PlotlyChart 
                    data={trendData as any}
                    layout={{
                      margin: { t: 20, r: 20, b: 40, l: 40 },
                      paper_bgcolor: "transparent",
                      plot_bgcolor: "transparent",
                      yaxis: { 
                        tickvals: [1, 2, 3],
                        ticktext: ["Low", "Med", "High"],
                        gridcolor: "var(--muted)",
                        range: [0.5, 3.5]
                      },
                      xaxis: {
                        showgrid: false,
                        tickfont: { family: "JetBrains Mono" }
                      }
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                </div>
              ) : (
                <div className="text-center py-12 h-full flex flex-col items-center justify-center border-2 border-dashed border-ink rounded-[3px]">
                  <p className="font-bold mb-2">Trend needs data.</p>
                  <p className="text-muted-foreground text-sm font-bold">Run a prediction to start your trend.</p>
                </div>
              )}
            </Card>
          </section>
        </div>

        {/* Row 2: Habits */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <section>
            <h2 className="font-display text-2xl mb-4">Daily Check-in</h2>
            <Card className="p-6 h-auto min-h-[300px]">
              {hasCheckedInToday ? (
                <div className="text-center py-8 flex flex-col items-center justify-center h-full">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-ink" />
                  <h3 className="font-bold text-xl mb-2">Check-in complete</h3>
                  <p className="text-muted-foreground mb-6 font-bold">You're on a {streak}-day streak.</p>
                  
                  <div className="w-full">
                    <p className="font-mono text-xs font-bold uppercase tracking-wider mb-2 text-left">Your last 7 days</p>
                    <div className="flex gap-2">
                      {Array.from({ length: Math.max(0, 7 - checkIns.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-8 h-8 border-2 border-dashed border-ink opacity-30"></div>
                      ))}
                      {checkIns.slice(-7).map((c, i) => (
                        <div key={i} className="w-8 h-8 bg-ink border-2 border-ink" title={new Date(c.date).toLocaleDateString()}></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider">Energy Level: {checkInState.energy}/5</label>
                    <input 
                      type="range" min="1" max="5" step="1"
                      value={checkInState.energy}
                      onChange={e => setCheckInState({...checkInState, energy: parseInt(e.target.value)})}
                      className="w-full brutal-slider"
                      style={{ "--slider-fill": `${((checkInState.energy - 1) / 4) * 100}%` } as React.CSSProperties}
                    />
                    <div className="flex justify-between text-xs font-mono font-bold mt-2 text-muted-foreground relative px-1">
                      <div className="absolute top-[-8px] left-0 right-0 flex justify-between px-[10px]">
                         {[1,2,3,4,5].map(i => <div key={i} className="w-[2px] h-[6px] bg-ink opacity-20"></div>)}
                      </div>
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider">Mood: {checkInState.mood}/5</label>
                    <input 
                      type="range" min="1" max="5" step="1"
                      value={checkInState.mood}
                      onChange={e => setCheckInState({...checkInState, mood: parseInt(e.target.value)})}
                      className="w-full brutal-slider"
                      style={{ "--slider-fill": `${((checkInState.mood - 1) / 4) * 100}%` } as React.CSSProperties}
                    />
                    <div className="flex justify-between text-xs font-mono font-bold mt-2 text-muted-foreground relative px-1">
                      <div className="absolute top-[-8px] left-0 right-0 flex justify-between px-[10px]">
                         {[1,2,3,4,5].map(i => <div key={i} className="w-[2px] h-[6px] bg-ink opacity-20"></div>)}
                      </div>
                      <span>Stressed</span>
                      <span>Calm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider">Sleep ({checkInState.sleep} Hours)</label>
                    <input 
                      type="range" min="0" max="14" step="0.5"
                      value={checkInState.sleep}
                      onChange={e => setCheckInState({...checkInState, sleep: parseFloat(e.target.value)})}
                      className="w-full brutal-slider"
                      style={{ "--slider-fill": `${((checkInState.sleep - 0) / 14) * 100}%` } as React.CSSProperties}
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

          <section>
            <h2 className="font-display text-2xl mb-4">Weekly Focus</h2>
            <Card className="p-6 relative overflow-hidden h-full min-h-[300px]">
              {focus ? (
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-xs uppercase font-bold tracking-wider text-muted-foreground">Active Focus</span>
                    </div>
                    <h3 className="font-display text-3xl mb-4" style={{ color: focus.color }}>
                      {focus.title}
                    </h3>
                    <p className="font-bold mb-6">Building kinder weeks, one habit at a time.</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-mono text-sm font-bold bg-frame border-2 border-ink inline-flex px-3 py-1 mb-6">
                      <CheckCircle2 className="w-4 h-4 text-ink" />
                      <span>{streak} kinder days</span>
                    </div>
                    <Link href="/tips" className="mt-2 inline-flex items-center gap-2 text-sm font-bold hover:underline group">
                      Change focus <ArrowRight className="w-4 h-4 arrow-icon group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 text-center py-8 border-2 border-dashed border-ink rounded-[3px] h-full flex flex-col items-center justify-center">
                  <p className="font-bold mb-6">You haven't picked a focus yet.</p>
                  <Link href="/tips" className="brutal-btn brutal-btn-primary inline-block px-6 py-3 font-bold">
                    Pick a focus
                  </Link>
                </div>
              )}
            </Card>
          </section>
        </div>

        {/* Row 3: Actionable items */}
        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h2 className="font-display text-2xl mb-4">Top Drivers</h2>
            <Card className="p-6 h-64 flex flex-col">
              {getTopDrivers().length > 0 ? (
                <div className="space-y-4">
                  {getTopDrivers().map(d => (
                     <div key={d.name} className="flex items-center justify-between p-4 border-2 border-ink bg-frame">
                       <span className="font-bold">{d.name}</span>
                       <Link href={`/tips`} className="text-sm font-bold underline group inline-flex items-center gap-1">
                         View Tip <ArrowRight className="w-3 h-3 arrow-icon group-hover:translate-x-1 transition-transform" />
                       </Link>
                     </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-ink rounded-[3px] h-full flex items-center justify-center">
                  <p className="font-bold text-muted-foreground">Run a prediction to see your risk drivers.</p>
                </div>
              )}
            </Card>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">Quick Action</h2>
            <Card className="p-6 bg-ink text-paper h-64 flex flex-col justify-center items-center text-center">
              <h2 className="font-display text-3xl mb-4 text-paper">Feeling overwhelmed?</h2>
              <p className="font-sans mb-8 font-bold opacity-90">Take a minute to reset your nervous system.</p>
              <Link href="/breathe" className="brutal-btn bg-paper text-ink border-2 border-paper w-full py-3 font-bold text-lg inline-flex items-center justify-center gap-2 group">
                Take a 4-7-8 minute <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

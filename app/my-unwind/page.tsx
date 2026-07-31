"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Flame, Calendar, Activity, Zap, Moon, Frown, FileText, ChevronRight } from "lucide-react";
import { useYSetting } from "@/lib/db";
import { db, getSetting, setSetting } from "@/lib/db";
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
  const history = useYSetting<any[]>("unwind_history", []);
  const planSetting = useYSetting<any>("unwind_plan", null);
  const focusSetting = useYSetting<any>("unwind_focus", null);
  const plan = planSetting ? planSetting : (focusSetting ? [focusSetting] : []);

  const habitsState = useYSetting<any>("unwind_habits_state", {});
  const streak = useYSetting<number>("unwind_streak", 0);
  
  const lastCheckIn = useYSetting<any>("unwind_last_checkin", null);
  const hasCheckedInToday = lastCheckIn === new Date().toDateString();

  const [checkInState, setCheckInState] = useState({ energy: 3, mood: 3, sleep: 7 });
  const checkIns = useYSetting<any[]>("unwind_daily_checkins", []);
  const breatheSessions = useYSetting<number>("unwind_breathe_sessions", 0);

  const handleCheckIn = async () => {
    const newStreak = streak + 1;
    await setSetting("unwind_streak", newStreak);
    await setSetting("unwind_last_checkin", new Date().toDateString());
    
    const newCheckIns = [...checkIns, {
      date: new Date().toISOString(),
      ...checkInState
    }];
    await setSetting("unwind_daily_checkins", newCheckIns);
  };

  const handleCheckoffHabit = async (title: string) => {
    const today = new Date().toDateString();
    const currentState = habitsState[title] || { streak: 0, last_completed: "" };
    if (currentState.last_completed === today) return;

    const newState = {
      ...habitsState,
      [title]: {
        streak: currentState.streak + 1,
        last_completed: today
      }
    };
    await setSetting("unwind_habits_state", newState);
  };

  const handleReflectHabit = async (title: string, status: "Yes" | "Kinda" | "No") => {
    const historyLog = await getSetting<any[]>("unwind_habit_history", []);
    historyLog.push({
      title,
      status,
      date: new Date().toISOString()
    });
    await setSetting("unwind_habit_history", historyLog);

    const newPlan = plan.filter((p: any) => p.title !== title);
    await setSetting("unwind_plan", newPlan);
  };

  const levelMap: Record<string, number> = { "Low": 1, "Medium": 2, "High": 3 };
  
  const trendData = history.length > 0 ? [
    {
      x: history.map((h: any) => h.timestamp),
      y: history.map((h: any) => levelMap[h.result.burnout_level] || 2),
      type: "scatter",
      mode: "lines+markers",
      line: { color: "var(--ink)", width: 3, shape: "spline" },
      marker: { size: 10, color: history.map((h: any) => {
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
                  <Link href="/predict" className="brutal-btn brutal-btn-primary w-full py-4 font-mono font-bold text-lg text-center">
                    [ RE-RUN.EXE ]
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-ink rounded-[3px] flex flex-col items-center justify-center h-full">
                  <p className="font-bold mb-6">No predictions yet.</p>
                  <Link href="/predict" className="brutal-btn brutal-btn-primary inline-block px-6 py-3 font-mono font-bold">
                    [ INIT_PREDICTION.EXE ]
                  </Link>
                </div>
              )}
            </Card>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">Risk Trend</h2>
            <Card className="p-6 h-72 flex flex-col overflow-hidden">
              {history.length > 0 ? (
                <div className="h-full w-full">
                  <PlotlyChart 
                    data={trendData as any}
                    layout={{
                      margin: { t: 20, r: 20, b: 60, l: 40 },
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
                      {checkIns.slice(-7).map((c: any, i: number) => (
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
            <h2 className="font-display text-2xl mb-4">Weekly Plan</h2>
            <Card className="p-6 relative overflow-hidden h-72">
              {plan.length > 0 ? (
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-muted-foreground">Active Habits</span>
                    <Link href="/tips" className="brutal-btn brutal-btn-ghost text-[10px] uppercase tracking-wider font-bold inline-flex items-center gap-1 px-2 py-1">EDIT PLAN <ArrowRight className="w-3 h-3 group-hover:translate-x-[2px] transition-transform" /></Link>
                  </div>
                  <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-2">
                    {plan.map((p: any, idx: number) => {
                      const hState = habitsState[p.title] || { streak: 0, last_completed: "" };
                      const doneToday = hState.last_completed === new Date().toDateString();
                      return (
                        <div key={idx} className="border-2 border-ink bg-frame p-4 rounded-[3px]">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-display text-xl flex items-center gap-2 mb-1" style={{ color: p.color }}>
                                {p.title}
                                {hState.streak > 0 && <span className="font-mono text-[10px] font-bold bg-ink text-paper px-1.5 py-0.5 rounded-[2px] ml-1 uppercase">{hState.streak} day streak</span>}
                              </h3>
                            </div>
                            <button
                              onClick={() => handleCheckoffHabit(p.title)}
                              disabled={doneToday}
                              title="Mark complete for today"
                              className={`w-6 h-6 rounded-[3px] border-2 border-ink flex items-center justify-center transition-colors ${doneToday ? 'bg-ink text-paper' : 'bg-paper hover:bg-ink hover:text-paper shadow-hard-sm'}`}
                            >
                              {doneToday && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t-2 border-ink/20 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Reflect:</span>
                            <button onClick={() => handleReflectHabit(p.title, "Yes")} className="text-[10px] font-bold uppercase tracking-widest bg-paper border-2 border-ink px-2 py-1 hover:bg-low hover:text-ink transition-colors rounded-[3px]">Helped</button>
                            <button onClick={() => handleReflectHabit(p.title, "Kinda")} className="text-[10px] font-bold uppercase tracking-widest bg-paper border-2 border-ink px-2 py-1 hover:bg-frame hover:text-ink transition-colors rounded-[3px]">Kinda</button>
                            <button onClick={() => handleReflectHabit(p.title, "No")} className="text-[10px] font-bold uppercase tracking-widest bg-paper border-2 border-ink px-2 py-1 hover:bg-high hover:text-paper transition-colors rounded-[3px]">Didn't</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="relative z-10 text-center py-8 border-2 border-dashed border-ink rounded-[3px] h-full flex flex-col items-center justify-center">
                  <p className="font-bold mb-6">You haven't picked any habits yet.</p>
                  <Link href="/tips" className="brutal-btn brutal-btn-ghost inline-block px-6 py-3 font-bold uppercase tracking-wider">
                    Build your plan
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
            <h2 className="font-display text-2xl mb-4">Breathe & Reset</h2>
            <Card className="p-6 bg-ink text-paper h-64 flex flex-col justify-between items-center text-center">
              <div>
                <h2 className="font-display text-3xl mb-2 text-paper">Feeling overwhelmed?</h2>
                <p className="font-sans mb-4 font-bold opacity-90">Take a minute to reset your nervous system.</p>
                {breatheSessions > 0 && (
                  <div className="inline-flex items-center gap-2 font-mono text-sm font-bold bg-frame text-ink border-2 border-paper px-3 py-1">
                    <Circle className="w-4 h-4" />
                    <span>{breatheSessions} sessions completed</span>
                  </div>
                )}
              </div>
              <Link href="/breathe" className="brutal-btn bg-paper text-ink border-2 border-paper w-full py-3 font-mono font-bold text-lg inline-flex items-center justify-center gap-2 mt-4 hover:bg-frame">
                [ BREATHE_MODULE.EXE ] <ArrowRight className="w-5 h-5 arrow-icon" />
              </Link>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

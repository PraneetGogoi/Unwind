"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Battery, Flame, Activity, Clock, Users, Cpu, Shield, Zap, Circle, CheckCircle2, Star, TrendingDown, ArrowDownRight, Moon, Coffee, Monitor, Layout, Heart, Palmtree } from "lucide-react";
import { getSetting, setSetting } from "@/lib/db";

type TipCategory = {
  icon: any;
  title: string;
  color: string;
  relatedInput?: string; // used to link to prediction factors
  driverImpact?: number;
  recommended?: boolean;
  downranked?: boolean;
  payoff: string;
  tips: {
    text: string;
    why: string;
    effort: "2-minute" | "this week" | "ongoing";
  }[];
};

const CATEGORIES: TipCategory[] = [
  {
    icon: Moon,
    title: "Sleep",
    color: "var(--teal)",
    relatedInput: "sleep_hours",
    payoff: "Developers sleeping 7h+ are 42% less likely to report high risk.",
    tips: [
      { text: "Aim for 7–8 hours.", why: "The dataset shows risk climbs sharply below 6h.", effort: "ongoing" },
      { text: "Stop screens 45 minutes before bed.", why: "Blue light delays melatonin production.", effort: "this week" },
      { text: "Keep a consistent wake time.", why: "Regulates your circadian rhythm, improving sleep quality.", effort: "ongoing" }
    ],
  },
  {
    icon: Coffee,
    title: "Caffeine",
    color: "var(--coral)",
    relatedInput: "caffeine_intake",
    payoff: "Keeping caffeine under 3 cups correlates with 30% lower burnout risk.",
    tips: [
      { text: "Cap at ~3 cups a day.", why: "The caffeine-per-sleep ratio strongly correlates with stress.", effort: "ongoing" },
      { text: "Cut off coffee 8 hours before sleep.", why: "Caffeine's half-life is ~5 hours. Late coffee ruins deep sleep.", effort: "this week" },
      { text: "Hydrate with water between cups.", why: "Dehydration mimics fatigue, tricking you into drinking more coffee.", effort: "2-minute" }
    ],
  },
  {
    icon: Activity,
    title: "Movement",
    color: "var(--low)",
    relatedInput: "exercise_hours",
    payoff: "Daily movement drops stress-related fatigue by over 25%.",
    tips: [
      { text: "30 minutes of moderate movement daily.", why: "Reduces cortisol and stress meaningfully.", effort: "ongoing" },
      { text: "Walk while reviewing PRs or during 1:1s.", why: "Combines necessary work with physical activity.", effort: "this week" },
      { text: "Stretch every 90 minutes.", why: "Relieves muscle tension from prolonged sitting.", effort: "2-minute" }
    ],
  },
  {
    icon: Brain,
    title: "Focus",
    color: "var(--medium)",
    relatedInput: "commits_per_day",
    payoff: "Deep work batching improves subjective productivity by 40%.",
    tips: [
      { text: "Batch deep work into 90-minute blocks.", why: "Aligns with ultradian rhythms for peak concentration.", effort: "this week" },
      { text: "Use the 4-7-8 breath between tasks.", why: "Resets the autonomic nervous system.", effort: "2-minute" },
      { text: "Write tomorrow's three priorities.", why: "Offloads cognitive burden before resting.", effort: "2-minute" }
    ],
  },
  {
    icon: Users,
    title: "Meetings",
    color: "var(--high)",
    relatedInput: "meetings_per_day",
    payoff: "Developers with <3 meetings/day report half the cognitive load.",
    tips: [
      { text: "Decline meetings without an agenda.", why: "Prevents wasted time and ambiguous commitments.", effort: "ongoing" },
      { text: "Default to 25/50-minute slots.", why: "Forces a 5-10 minute breather between calls.", effort: "this week" },
      { text: "Block one no-meeting day each week.", why: "Provides uninterrupted time for deep engineering work.", effort: "this week" }
    ],
  },
  {
    icon: Monitor,
    title: "Screen time",
    color: "var(--teal)",
    relatedInput: "screen_time",
    payoff: "Capping screen time under 10h/day drastically reduces neural fatigue.",
    tips: [
      { text: "Apply the 20-20-20 rule.", why: "Every 20 mins, look 20 feet away for 20 seconds. Reduces eye strain.", effort: "2-minute" },
      { text: "Increase font size.", why: "Eye strain accelerates cognitive fatigue.", effort: "2-minute" },
      { text: "Use warm color temperature after sunset.", why: "Prevents blue light from disrupting melatonin.", effort: "2-minute" }
    ],
  },
  {
    icon: Shield,
    title: "Boundaries",
    color: "var(--high)",
    relatedInput: "daily_work_hours",
    payoff: "Hard stop boundaries reduce next-day exhaustion risk by 35%.",
    tips: [
      { text: "Set a hard shut-down time.", why: "Continuous work blurring into evenings prevents recovery.", effort: "ongoing" },
      { text: "Remove Slack from your personal phone.", why: "Context switching to work off-hours spikes cortisol.", effort: "this week" }
    ]
  },
  {
    icon: Layout,
    title: "Ergonomics",
    color: "var(--medium)",
    payoff: "Proper ergonomics prevents chronic pain, a silent focus killer.",
    tips: [
      { text: "Ensure your monitor is at eye level.", why: "Prevents neck strain and tension headaches.", effort: "2-minute" },
      { text: "Use an external keyboard and mouse.", why: "Laptop trackpads force unnatural wrist pronation.", effort: "ongoing" }
    ]
  },
  {
    icon: Heart,
    title: "Connection",
    color: "var(--coral)",
    payoff: "Social buffering mitigates the physiological effects of high stress.",
    tips: [
      { text: "Have a non-work conversation daily.", why: "Social buffering mitigates the effects of high stress.", effort: "ongoing" },
      { text: "Pair program on difficult bugs.", why: "Shared problem solving reduces individual cognitive load.", effort: "this week" }
    ]
  },
  {
    icon: Palmtree,
    title: "Time-off",
    color: "var(--low)",
    payoff: "Anticipating time off provides immediate psychological relief.",
    tips: [
      { text: "Take one completely unplugged day a week.", why: "Zero work thoughts required for full baseline reset.", effort: "ongoing" },
      { text: "Plan your next vacation now.", why: "Anticipation of time off provides immediate psychological relief.", effort: "this week" }
    ]
  }
];

export default function TipsPage() {
  const [categories, setCategories] = useState<TipCategory[]>(CATEGORIES);
  const [plan, setPlan] = useState<{ title: string; color: string }[]>([]);
  const [effortFilter, setEffortFilter] = useState<string>("all");
  const [expandedTips, setExpandedTips] = useState<Record<string, boolean>>({});
  const [personalData, setPersonalData] = useState<any>(null);
  
  const [tab, setTab] = useState<"tips" | "history">("tips");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      let savedPlan = await getSetting("unwind_plan", null);
      if (savedPlan) {
        setPlan(savedPlan);
      } else {
        const singleFocus = await getSetting("unwind_focus", null);
        if (singleFocus) {
          setPlan([singleFocus]);
          await setSetting("unwind_plan", [singleFocus]);
        }
      }

      const savedHistory = await getSetting("unwind_habit_history", []);
      setHistory(savedHistory);

      const noCounts: Record<string, number> = {};
      savedHistory.forEach((h: any) => {
        if (h.status === "No") noCounts[h.title] = (noCounts[h.title] || 0) + 1;
      });
      const downrankedTitles = Object.keys(noCounts).filter(t => noCounts[t] >= 2);

      const latestPrediction = await getSetting<any>("unwind_latest_prediction", null);
      if (latestPrediction && latestPrediction.inputs && latestPrediction.result) {
        setPersonalData(latestPrediction.inputs);
        const topDrivers = latestPrediction.result.top_drivers || [];
        
        const mapping: Record<string, string> = {
          sleep_hours: "Sleep", caffeine_intake: "Caffeine", exercise_hours: "Movement",
          commits_per_day: "Focus", meetings_per_day: "Meetings", screen_time: "Screen time", daily_work_hours: "Boundaries"
        };

        const riskDrivingFeatures = topDrivers.filter((d: any) => d.impact > 0).map((d: any) => d.feature);
        const recommendations = riskDrivingFeatures.map((f: string) => mapping[f]).filter(Boolean);

        const processedCats = CATEGORIES.map(c => {
           let impact: number | undefined;
           if (c.relatedInput) {
             const d = topDrivers.find((td: any) => td.feature === c.relatedInput);
             if (d && d.impact > 0) impact = d.impact;
           }
           return {
             ...c,
             recommended: recommendations.includes(c.title),
             driverImpact: impact,
             downranked: downrankedTitles.includes(c.title)
           };
        });
        
        const recCats = processedCats.filter(c => c.recommended && !c.downranked);
        const nCats = processedCats.filter(c => !c.recommended && !c.downranked);
        const downCats = processedCats.filter(c => c.downranked);
        setCategories([...recCats, ...nCats, ...downCats]);
      } else {
        const processedCats = CATEGORIES.map(c => ({ ...c, downranked: downrankedTitles.includes(c.title) }));
        setCategories([...processedCats.filter(c => !c.downranked), ...processedCats.filter(c => c.downranked)]);
      }
    }
    
    loadData();
  }, []);

  const handleTogglePlan = async (category: TipCategory) => {
    let newPlan = [...plan];
    const exists = newPlan.find(p => p.title === category.title);
    if (exists) {
      newPlan = newPlan.filter(p => p.title !== category.title);
    } else {
      if (newPlan.length >= 3) {
        alert("You can only have up to 3 habits in your plan at a time.");
        return;
      }
      newPlan.push({ title: category.title, color: category.color });
    }
    setPlan(newPlan);
    await setSetting("unwind_plan", newPlan);
  };

  const toggleTip = (id: string) => {
    setExpandedTips(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCategories = categories.map(c => ({
    ...c,
    tips: c.tips.filter(t => effortFilter === "all" || t.effort === effortFilter)
  })).filter(c => c.tips.length > 0);

  const getPersonalMetricText = (c: TipCategory) => {
    if (!personalData || !c.relatedInput || personalData[c.relatedInput] === undefined) return null;
    const val = personalData[c.relatedInput];
    let unit = "";
    if (c.relatedInput.includes("hours") || c.relatedInput.includes("time")) unit = "h";
    if (c.relatedInput.includes("caffeine")) unit = " cups";
    if (c.relatedInput.includes("meetings")) unit = " meetings";
    return `Your average: ${val}${unit}`;
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10 min-h-screen">
      <header className="max-w-2xl">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-grey-text">
          Recovery Plan
        </p>
        <h1 className="font-display text-4xl sm:text-5xl mt-2">
          Small habits, kinder weeks.
        </h1>
        <p className="font-bold mt-3">
          Select up to 3 habits. We rank these based on your specific SHAP top drivers to maximize impact.
        </p>
      </header>

      <div className="mt-8 flex border-b-2 border-ink">
        <button 
          onClick={() => setTab("tips")}
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors border-t-2 border-l-2 border-r-2 ${tab === "tips" ? "bg-ink text-paper border-ink" : "bg-transparent border-transparent text-grey-text hover:text-ink"}`}
        >
          Explore Tips
        </button>
        <button 
          onClick={() => setTab("history")}
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors border-t-2 border-l-2 border-r-2 ${tab === "history" ? "bg-ink text-paper border-ink" : "bg-transparent border-transparent text-grey-text hover:text-ink"}`}
        >
          Habit History
        </button>
      </div>

      {tab === "history" && (
        <div className="mt-12 max-w-2xl">
          {history.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-ink flex flex-col items-center">
              <p className="font-bold mb-2">No history yet.</p>
              <p className="text-sm text-grey-text">When you complete and reflect on a habit, it appears here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const grouped = history.reduce((acc: any, h: any) => {
                  if (!acc[h.title]) acc[h.title] = { total: 0, yes: 0, kinda: 0, no: 0, lastDate: null };
                  acc[h.title].total++;
                  if (h.status === "Yes") acc[h.title].yes++;
                  if (h.status === "Kinda") acc[h.title].kinda++;
                  if (h.status === "No") acc[h.title].no++;
                  if (!acc[h.title].lastDate || new Date(h.date) > new Date(acc[h.title].lastDate)) {
                    acc[h.title].lastDate = h.date;
                  }
                  return acc;
                }, {});
                return Object.entries(grouped).map(([title, stats]: [string, any]) => {
                  const pattern = stats.yes > stats.no ? "Mostly helpful" : stats.no >= 2 ? "Rarely helpful" : "Mixed results";
                  return (
                    <div key={title} className="brutal-card bg-frame border-2 border-ink shadow-hard-sm p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-xl mb-1">{title}</h3>
                        <p className="font-mono text-xs text-grey-text uppercase">
                          Last completed: {new Date(stats.lastDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-right">
                        <span className="font-bold text-sm uppercase">Completed {stats.total} {stats.total === 1 ? 'time' : 'times'}</span>
                        <span className={`px-2 py-0.5 font-bold text-[10px] uppercase border-2 border-ink ${stats.yes > stats.no ? 'bg-low text-ink' : stats.no >= 2 ? 'bg-high text-paper' : 'bg-paper text-ink'}`}>
                          Pattern: {pattern}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}

      {tab === "tips" && (
        <>
          <div className="mt-8 flex flex-wrap gap-2 items-center">
            <span className="font-mono text-sm font-bold text-grey-text mr-2">Filter by effort:</span>
            {["all", "2-minute", "this week", "ongoing"].map(effort => (
              <button
                key={effort}
                onClick={() => setEffortFilter(effort)}
                className={`px-3 py-1 font-mono text-xs font-bold uppercase border-2 rounded-[3px] transition-colors ${
                  effortFilter === effort 
                    ? "bg-ink text-paper border-ink" 
                    : "bg-paper text-ink border-ink hover:bg-frame"
                }`}
              >
                {effort}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {filteredCategories.map((c: any) => {
              const inPlan = plan.find(p => p.title === c.title);
              const personalMetric = getPersonalMetricText(c);

              return (
                <Card
                  key={c.title}
                  className="brutal-card bg-paper shadow-hard flex flex-col relative overflow-hidden group border-2 border-ink rounded-[3px]"
                >
                  <div className="h-8 border-b-2 border-ink flex items-center justify-between px-3 bg-frame shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-ink bg-paper"></div>
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-ink bg-paper"></div>
                    </div>
                    <div className="font-mono text-[10px] font-bold uppercase">{c.title.toLowerCase()}.md</div>
                    <div className="w-6"></div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-paper shadow-hard-sm shrink-0"
                        style={{ color: c.color }}
                      >
                        <c.icon className="h-6 w-6" strokeWidth={3} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {c.recommended && (
                          <span className="bg-ink text-paper font-mono text-[10px] font-bold uppercase px-2 py-1 rounded-[3px]">
                            Recommended
                          </span>
                        )}
                        {personalMetric && (
                          <span className="bg-frame text-ink font-mono text-[10px] font-bold uppercase px-2 py-1 border-2 border-ink rounded-[3px]">
                            {personalMetric}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-display text-2xl mb-2">{c.title}</h3>
                    
                    <div className="bg-ink text-paper p-3 text-xs font-bold mb-6 rounded-[3px]">
                      {c.payoff}
                    </div>
                    
                    <ul className="space-y-4 flex-1">
                      {c.tips.map((t: any, i: number) => {
                        const tipId = `${c.title}-${i}`;
                        const isExpanded = expandedTips[tipId];
                        return (
                          <li key={i} className="flex flex-col gap-1">
                            <div className="flex gap-3 text-sm">
                              <span className="font-mono font-bold text-xs mt-0.5" style={{ color: c.color }}>
                                0{i + 1}
                              </span>
                              <div className="flex-1">
                                <span className="font-bold cursor-pointer hover:underline" onClick={() => toggleTip(tipId)}>
                                  {t.text}
                                </span>
                                <span className="ml-2 font-mono text-[10px] uppercase text-grey-text border-b border-muted-foreground">
                                  {t.effort}
                                </span>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="ml-7 mt-1 text-xs text-grey-text bg-frame p-2 border-l-2 border-ink">
                                <strong>Why it works:</strong> {t.why}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      onClick={() => handleTogglePlan(c)}
                      className={`mt-6 w-full py-3 font-bold font-mono text-xs uppercase tracking-wider border-2 transition-all rounded-[3px] flex items-center justify-center gap-2 ${
                        inPlan 
                          ? "bg-ink text-paper border-ink" 
                          : "bg-paper text-ink border-ink shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      }`}
                    >
                      {inPlan ? <><CheckCircle2 className="w-4 h-4" /> Added to Plan</> : "Add to Plan"}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
      {/* Sticky Bottom Bar */}
      {plan.length > 0 && tab === "tips" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-4 pointer-events-none">
          <div className="max-w-2xl mx-auto brutal-card bg-paper border-2 border-ink shadow-hard p-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
            <div>
              <p className="font-bold text-sm">Habit selected.</p>
              <p className="text-xs text-grey-text font-mono uppercase">Next step in your loop:</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Link href="/breathe" className="flex-1 md:flex-none px-4 py-2 text-center text-xs font-bold font-mono uppercase border-2 border-ink bg-paper hover:bg-frame transition-colors">
                Take a Breath
              </Link>
              <Link href="/my-unwind" className="flex-1 md:flex-none px-4 py-2 text-center text-xs font-bold font-mono uppercase bg-ink text-paper hover:bg-ink/80 transition-colors">
                Track in My Unwind
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

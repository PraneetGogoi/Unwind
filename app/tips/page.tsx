"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Moon, Coffee, Activity, Brain, Users, Monitor, Shield, Layout, Heart, Palmtree } from "lucide-react";

type TipCategory = {
  icon: any;
  title: string;
  color: string;
  relatedInput?: string; // used to link to prediction factors
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
    tips: [
      { text: "Aim for 7–8 hours.", why: "The dataset shows risk climbs sharply below 6h.", effort: "ongoing" },
      { text: "Stop screens 45 minutes before bed.", why: "Blue light delays melatonin production.", effort: "this week" },
      { text: "Keep a consistent wake time, even on weekends.", why: "Regulates your circadian rhythm, improving sleep quality.", effort: "ongoing" }
    ],
  },
  {
    icon: Coffee,
    title: "Caffeine",
    color: "var(--coral)",
    relatedInput: "caffeine_intake",
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
    tips: [
      { text: "Set a hard shut-down time.", why: "Continuous work blurring into evenings prevents recovery.", effort: "ongoing" },
      { text: "Remove Slack from your personal phone.", why: "Context switching to work off-hours spikes cortisol.", effort: "this week" }
    ]
  },
  {
    icon: Layout,
    title: "Ergonomics",
    color: "var(--medium)",
    tips: [
      { text: "Ensure your monitor is at eye level.", why: "Prevents neck strain and tension headaches.", effort: "2-minute" },
      { text: "Use an external keyboard and mouse.", why: "Laptop trackpads force unnatural wrist pronation.", effort: "ongoing" }
    ]
  },
  {
    icon: Heart,
    title: "Connection",
    color: "var(--coral)",
    tips: [
      { text: "Have a non-work conversation daily.", why: "Social buffering mitigates the effects of high stress.", effort: "ongoing" },
      { text: "Pair program on difficult bugs.", why: "Shared problem solving reduces individual cognitive load.", effort: "this week" }
    ]
  },
  {
    icon: Palmtree,
    title: "Time-off",
    color: "var(--low)",
    tips: [
      { text: "Take one completely unplugged day a week.", why: "Zero work thoughts required for full baseline reset.", effort: "ongoing" },
      { text: "Plan your next vacation now.", why: "Anticipation of time off provides immediate psychological relief.", effort: "this week" }
    ]
  }
];

export default function TipsPage() {
  const [categories, setCategories] = useState<TipCategory[]>(CATEGORIES);
  const [focus, setFocus] = useState<{ title: string; color: string } | null>(null);
  const [effortFilter, setEffortFilter] = useState<string>("all");
  const [expandedTips, setExpandedTips] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedFocus = localStorage.getItem("unwind_focus");
    if (savedFocus) setFocus(JSON.parse(savedFocus));

    const latestPrediction = JSON.parse(localStorage.getItem("unwind_latest_prediction") || "null");
    if (latestPrediction && latestPrediction.inputs) {
      const inputs = latestPrediction.inputs;
      
      // Determine what to recommend based on inputs. Very simple heuristics:
      const recommendations: string[] = [];
      if (inputs.sleep_hours < 7) recommendations.push("Sleep");
      if (inputs.screen_time > 10) recommendations.push("Screen time");
      if (inputs.exercise_hours < 2) recommendations.push("Movement");
      if (inputs.meetings_per_day > 4) recommendations.push("Meetings");
      if (inputs.daily_work_hours > 9) recommendations.push("Boundaries");
      if (inputs.caffeine_intake > 3) recommendations.push("Caffeine");

      if (recommendations.length > 0) {
        const recommendedCats = CATEGORIES.filter(c => recommendations.includes(c.title));
        const otherCats = CATEGORIES.filter(c => !recommendations.includes(c.title));
        setCategories([...recommendedCats.map(c => ({...c, recommended: true})), ...otherCats]);
      }
    }
  }, []);

  const handleSetFocus = (category: TipCategory) => {
    const newFocus = { title: category.title, color: category.color };
    setFocus(newFocus);
    localStorage.setItem("unwind_focus", JSON.stringify(newFocus));
  };

  const toggleTip = (id: string) => {
    setExpandedTips(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCategories = categories.map(c => ({
    ...c,
    tips: c.tips.filter(t => effortFilter === "all" || t.effort === effortFilter)
  })).filter(c => c.tips.length > 0);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <header className="max-w-2xl">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Recovery
        </p>
        <h1 className="font-display text-4xl sm:text-5xl mt-2">
          Small habits, kinder weeks.
        </h1>
        <p className="font-bold mt-3">
          Ten categories drawn from the strongest signals in the dataset. Pick
          one this week — that's enough.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2 items-center">
        <span className="font-mono text-sm font-bold text-muted-foreground mr-2">Filter by effort:</span>
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
        {filteredCategories.map((c: any) => (
          <Card
            key={c.title}
            className="brutal-card bg-paper shadow-hard flex flex-col relative overflow-hidden group"
          >
            {/* File Chrome Motif */}
            <div className="h-8 border-b-2 border-ink flex items-center justify-between px-3 bg-frame">
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
                  className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-paper shadow-hard-sm"
                  style={{ color: c.color }}
                >
                  <c.icon className="h-6 w-6" strokeWidth={3} />
                </div>
                {c.recommended && (
                  <span className="bg-ink text-paper font-mono text-[10px] font-bold uppercase px-2 py-1 rounded-[3px]">
                    Recommended
                  </span>
                )}
              </div>
              
              <h3 className="font-display text-2xl mb-4">{c.title}</h3>
              
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
                          <span className="ml-2 font-mono text-[10px] uppercase text-muted-foreground border-b border-muted-foreground">
                            {t.effort}
                          </span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="ml-7 mt-1 text-xs text-muted-foreground bg-frame p-2 border-l-2 border-ink">
                          <strong>Why it works:</strong> {t.why}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={() => handleSetFocus(c)}
                className={`mt-6 w-full py-2 font-bold font-mono text-xs uppercase tracking-wider border-2 transition-all ${
                  focus?.title === c.title 
                    ? "bg-ink text-paper border-ink" 
                    : "bg-paper text-ink border-ink shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                }`}
              >
                {focus?.title === c.title ? "Current Focus" : "Set as Focus"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}

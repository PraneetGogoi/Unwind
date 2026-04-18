import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Moon, Coffee, Activity, Brain, Users, Monitor } from "lucide-react";

export const Route = createFileRoute("/tips")({
  head: () => ({
    meta: [
      { title: "Tips — Unwind" },
      { name: "description", content: "Evidence-aligned habits to reduce developer burnout: sleep, movement, focus, caffeine." },
    ],
  }),
  component: TipsPage,
});

const CATEGORIES = [
  {
    icon: Moon, title: "Sleep", color: "var(--teal)",
    tips: [
      "Aim for 7–8 hours. The dataset shows risk climbs sharply below 6h.",
      "Stop screens 45 minutes before bed — blue light delays melatonin.",
      "Keep a consistent wake time, even on weekends.",
    ],
  },
  {
    icon: Coffee, title: "Caffeine", color: "var(--coral)",
    tips: [
      "Cap at ~3 cups. The caffeine-per-sleep ratio strongly correlates with stress.",
      "Cut off coffee 8 hours before sleep — half-life is ~5 hours.",
      "Hydrate with water between cups; dehydration mimics fatigue.",
    ],
  },
  {
    icon: Activity, title: "Movement", color: "var(--low)",
    tips: [
      "30 minutes of moderate movement daily reduces stress meaningfully.",
      "Walk while reviewing PRs or during 1:1s when possible.",
      "Stretch every 90 minutes — set a gentle reminder.",
    ],
  },
  {
    icon: Brain, title: "Focus", color: "var(--medium)",
    tips: [
      "Batch deep work into 90-minute blocks. Protect them on your calendar.",
      "Use the 4-7-8 breath between tasks to reset attention.",
      "End the day by writing tomorrow's three priorities.",
    ],
  },
  {
    icon: Users, title: "Meetings", color: "var(--high)",
    tips: [
      "Decline meetings without an agenda. Suggest async alternatives.",
      "Default to 25/50-minute slots for a real breather between calls.",
      "Block one no-meeting day each week.",
    ],
  },
  {
    icon: Monitor, title: "Screen time", color: "var(--teal)",
    tips: [
      "Apply the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.",
      "Increase font size — eye strain accelerates fatigue.",
      "Use warm color temperature after sunset (Night Shift / Redshift).",
    ],
  },
];

function TipsPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <header className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Recovery</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">Small habits, kinder weeks.</h1>
          <p className="text-muted-foreground mt-3">
            Six categories drawn from the strongest signals in the dataset. Pick one this week — that's enough.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {CATEGORIES.map(c => (
            <Card key={c.title} className="p-6 glass border-0 shadow-soft hover:shadow-glow transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `color-mix(in oklab, ${c.color} 18%, transparent)`, color: c.color }}>
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl mt-4">{c.title}</h3>
              <ul className="mt-4 space-y-3">
                {c.tips.map((t, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="font-mono text-xs mt-0.5" style={{ color: c.color }}>0{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

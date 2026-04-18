import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { predictBurnout, PredictorInput } from "@/lib/burnout-data";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Predict your burnout — Unwind" },
      { name: "description", content: "Estimate your burnout risk from sleep, work hours, caffeine, and more." },
    ],
  }),
  component: PredictPage,
});

const FIELDS: { key: keyof PredictorInput; label: string; min: number; max: number; step: number; unit: string; default: number }[] = [
  { key: "daily_work_hours", label: "Daily work hours", min: 2, max: 16, step: 0.5, unit: "h", default: 9 },
  { key: "sleep_hours", label: "Sleep", min: 2, max: 10, step: 0.25, unit: "h", default: 6.5 },
  { key: "caffeine_intake", label: "Caffeine cups", min: 0, max: 8, step: 1, unit: "cups", default: 3 },
  { key: "bugs_per_day", label: "Bugs touched / day", min: 0, max: 25, step: 1, unit: "", default: 8 },
  { key: "meetings_per_day", label: "Meetings / day", min: 0, max: 10, step: 1, unit: "", default: 4 },
  { key: "screen_time", label: "Screen time", min: 4, max: 18, step: 0.5, unit: "h", default: 12 },
  { key: "exercise_hours", label: "Exercise", min: 0, max: 3, step: 0.1, unit: "h", default: 0.5 },
];

function PredictPage() {
  const [vals, setVals] = useState<PredictorInput>(
    Object.fromEntries(FIELDS.map(f => [f.key, f.default])) as PredictorInput
  );
  const [result, setResult] = useState<ReturnType<typeof predictBurnout> | null>(null);

  const update = (k: keyof PredictorInput, v: number) => setVals(p => ({ ...p, [k]: v }));

  const levelStyles = {
    Low: { bg: "bg-[var(--low)]/15", text: "text-[var(--low)]", icon: CheckCircle2, blurb: "You're navigating it. Keep your routines steady." },
    Medium: { bg: "bg-[var(--medium)]/15", text: "text-[var(--medium)]", icon: AlertCircle, blurb: "Warning lights. Adjust one or two drivers below this week." },
    High: { bg: "bg-[var(--high)]/15", text: "text-[var(--high)]", icon: AlertTriangle, blurb: "Significant risk. Prioritize sleep, movement, and a real break." },
  } as const;

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Predictor</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">How are you, really?</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            A weighted estimate based on the dataset's strongest burnout drivers. Move the sliders to reflect a typical week.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 glass border-0 shadow-soft space-y-5">
            {FIELDS.map(f => (
              <div key={f.key}>
                <div className="flex items-baseline justify-between">
                  <Label className="text-sm">{f.label}</Label>
                  <span className="font-mono text-sm text-primary">{vals[f.key]}{f.unit}</span>
                </div>
                <Slider
                  value={[vals[f.key]]}
                  min={f.min} max={f.max} step={f.step}
                  onValueChange={(v) => update(f.key, v[0])}
                  className="mt-3"
                />
              </div>
            ))}
            <Button onClick={() => setResult(predictBurnout(vals))} className="w-full h-12 rounded-full text-base shadow-glow">
              <Sparkles className="mr-2 h-4 w-4" /> Predict my burnout
            </Button>
          </Card>

          <div className="relative">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card className={`p-7 border-0 shadow-soft ${levelStyles[result.level].bg}`}>
                    {(() => {
                      const Icon = levelStyles[result.level].icon;
                      return <Icon className={`h-8 w-8 ${levelStyles[result.level].text}`} />;
                    })()}
                    <div className={`font-display text-5xl mt-3 ${levelStyles[result.level].text}`}>{result.level}</div>
                    <p className="text-muted-foreground mt-2">{levelStyles[result.level].blurb}</p>
                    <div className="mt-6">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Risk score</span><span>{result.score}/100</span>
                      </div>
                      <div className="h-3 rounded-full bg-background/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${result.score}%` }} transition={{ duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-to-r from-[var(--low)] via-[var(--medium)] to-[var(--high)]"
                        />
                      </div>
                    </div>
                    <div className="mt-7">
                      <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Top drivers</h4>
                      <ul className="space-y-3">
                        {result.drivers.map(d => (
                          <li key={d.label}>
                            <div className="flex justify-between text-sm">
                              <span>{d.label}</span><span className="font-mono">{d.impact}%</span>
                            </div>
                            <div className="h-1.5 mt-1 rounded-full bg-background/60 overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, d.impact * 4)}%` }} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="p-10 glass border-0 shadow-soft text-center">
                    <div className="font-display text-2xl">Your reading appears here.</div>
                    <p className="text-muted-foreground mt-2">Adjust the sliders, then tap predict.</p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

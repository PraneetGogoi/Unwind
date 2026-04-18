import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export const Route = createFileRoute("/breathe")({
  head: () => ({
    meta: [
      { title: "Breathe — Unwind" },
      { name: "description", content: "Animated 4-7-8 breathing exercise to calm your nervous system in two minutes." },
    ],
  }),
  component: BreathePage,
});

type Phase = "inhale" | "hold" | "exhale" | "rest";
const SEQ: { phase: Phase; secs: number; label: string }[] = [
  { phase: "inhale", secs: 4, label: "Breathe in" },
  { phase: "hold", secs: 7, label: "Hold" },
  { phase: "exhale", secs: 8, label: "Breathe out" },
  { phase: "rest", secs: 1, label: "Rest" },
];

function BreathePage() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [remaining, setRemaining] = useState(SEQ[0].secs);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev > 1) return prev - 1;
        setStep(s => {
          const next = (s + 1) % SEQ.length;
          if (next === 0) setCycles(c => c + 1);
          setRemaining(SEQ[next].secs);
          return next;
        });
        return SEQ[(step + 1) % SEQ.length].secs;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, step]);

  const current = SEQ[step];
  const scale = current.phase === "inhale" ? 1.35 : current.phase === "exhale" ? 0.85 : current.phase === "hold" ? 1.35 : 0.85;
  const transitionDur = current.secs;

  const reset = () => { setRunning(false); setStep(0); setRemaining(SEQ[0].secs); setCycles(0); };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">4 · 7 · 8 method</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">A two-minute reset.</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Inhale through the nose for four. Hold for seven. Exhale through pursed lips for eight. Repeat four times.
          </p>
        </header>

        <Card className="mt-10 p-10 glass border-0 shadow-soft">
          <div className="relative h-[420px] flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-72 w-72 rounded-full bg-aurora opacity-50 blur-2xl animate-spin-slow" />
            </div>
            <motion.div
              animate={{ scale: running ? scale : 1 }}
              transition={{ duration: running ? transitionDur : 0.6, ease: "easeInOut" }}
              className="relative h-64 w-64 rounded-full bg-gradient-to-br from-primary to-accent shadow-glow flex items-center justify-center"
            >
              <div className="text-center text-primary-foreground">
                <div className="font-display text-3xl">{current.label}</div>
                <div className="font-mono text-6xl mt-2">{remaining}</div>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="rounded-full px-8 h-12" onClick={() => setRunning(r => !r)}>
              {running ? "Pause" : cycles > 0 || step > 0 ? "Resume" : "Begin"}
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12" onClick={reset}>Reset</Button>
            <div className="text-sm text-muted-foreground ml-4">Cycles completed: <span className="font-mono text-foreground">{cycles}</span></div>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-2">
            {SEQ.map((s, i) => (
              <div key={s.phase} className={`rounded-xl border p-3 text-center text-xs transition ${i === step && running ? "bg-primary/10 border-primary text-foreground" : "text-muted-foreground"}`}>
                <div className="font-display text-xl text-foreground">{s.secs}s</div>
                <div className="mt-1 capitalize">{s.phase}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

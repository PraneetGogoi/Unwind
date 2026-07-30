"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

type PatternType = "4-7-8" | "box" | "sigh";
type Phase = "IDLE" | "INHALE" | "HOLD" | "EXHALE" | "HOLD_EMPTY" | "DONE";

interface Pattern {
  id: PatternType;
  name: string;
  description: string;
  phases: { phase: Phase; duration: number }[];
  rounds: number;
}

const PATTERNS: Record<PatternType, Pattern> = {
  "4-7-8": {
    id: "4-7-8",
    name: "4-7-8 Wind Down",
    description: "Inhale 4s, hold 7s, exhale 8s. Deep relaxation.",
    rounds: 4,
    phases: [
      { phase: "INHALE", duration: 4 },
      { phase: "HOLD", duration: 7 },
      { phase: "EXHALE", duration: 8 },
    ],
  },
  box: {
    id: "box",
    name: "Box Breathing",
    description: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Focus & calm.",
    rounds: 4,
    phases: [
      { phase: "INHALE", duration: 4 },
      { phase: "HOLD", duration: 4 },
      { phase: "EXHALE", duration: 4 },
      { phase: "HOLD_EMPTY", duration: 4 },
    ],
  },
  sigh: {
    id: "sigh",
    name: "Physiological Sigh",
    description: "Double inhale, long exhale. Fast stress reset.",
    rounds: 3,
    phases: [
      { phase: "INHALE", duration: 2 }, // Quick inhale
      { phase: "HOLD", duration: 1 },   // Tiny pause
      { phase: "INHALE", duration: 1 }, // Top off
      { phase: "EXHALE", duration: 6 }, // Long exhale
    ],
  },
};

export default function BreathePage() {
  const [patternId, setPatternId] = useState<PatternType>("4-7-8");
  const pattern = PATTERNS[patternId];
  
  const [phaseIndex, setPhaseIndex] = useState(-1);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Setup reduced motion listener
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const playTone = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, ctx.currentTime); // Low A note, very gentle
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    } catch (e) {
      console.warn("Audio not supported or blocked");
    }
  }, [soundEnabled]);

  const triggerHaptic = useCallback(() => {
    if (soundEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50); // Short pulse
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (phaseIndex === -1) return; // IDLE or DONE handled elsewhere
    if (phaseIndex >= pattern.phases.length) {
      // End of round
      if (round >= pattern.rounds) {
        setPhaseIndex(-2); // DONE state
        // Save session
        const sessions = parseInt(localStorage.getItem("unwind_breathe_sessions") || "0");
        localStorage.setItem("unwind_breathe_sessions", (sessions + 1).toString());
      } else {
        setRound(r => r + 1);
        setPhaseIndex(0);
      }
      return;
    }

    const currentPhase = pattern.phases[phaseIndex];
    setTimeLeft(currentPhase.duration);
    playTone();
    triggerHaptic();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhaseIndex(idx => idx + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phaseIndex, round, pattern, playTone, triggerHaptic]);

  const startSession = () => {
    setRound(1);
    setPhaseIndex(0);
  };

  const currentPhaseDef = phaseIndex >= 0 && phaseIndex < pattern.phases.length ? pattern.phases[phaseIndex] : null;
  const isIdle = phaseIndex === -1;
  const isDone = phaseIndex === -2;
  const activePhaseName = currentPhaseDef?.phase || "IDLE";

  const getOrbState = () => {
    if (prefersReducedMotion) return { scale: 1, opacity: 0.2 };
    if (isIdle || isDone || activePhaseName === "HOLD_EMPTY") return { scale: 0.5, opacity: 0.2 };
    if (activePhaseName === "INHALE") return { scale: 1, opacity: 0.6 };
    if (activePhaseName === "HOLD") return { scale: 1, opacity: 0.6 };
    if (activePhaseName === "EXHALE") return { scale: 0.5, opacity: 0.4 };
    return { scale: 0.5, opacity: 0.2 };
  };
  
  const getOrbTransition = () => {
    if (prefersReducedMotion || !currentPhaseDef) return { duration: 0 };
    return {
      duration: currentPhaseDef.duration,
      ease: activePhaseName === "INHALE" ? "easeOut" : activePhaseName === "EXHALE" ? "easeInOut" : "linear"
    };
  };

  const getPhaseLabel = () => {
    if (isIdle) return "Start";
    if (isDone) return "Done";
    if (activePhaseName === "INHALE") return "Inhale...";
    if (activePhaseName === "HOLD") return "Hold...";
    if (activePhaseName === "EXHALE") return "Exhale...";
    if (activePhaseName === "HOLD_EMPTY") return "Hold...";
    return "";
  };

  return (
    <div className={`flex-1 bg-dots-bg text-ink selection:bg-ink selection:text-paper flex flex-col transition-colors duration-1000 ${
      !isIdle && !isDone && activePhaseName === "INHALE" ? "bg-frame" : ""
    }`}>
      
      {/* Header controls */}
      <div className="absolute top-24 right-4 md:right-8 z-50 flex items-center gap-4">
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 brutal-border bg-paper rounded-full hover:bg-frame transition-colors"
          title="Toggle Sound & Haptics"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
        </button>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-24 flex-1 flex flex-col items-center justify-center text-center w-full">
        {isDone ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <h1 className="font-display text-5xl md:text-7xl mb-6">Nice.</h1>
            <p className="font-sans text-xl text-grey-text mb-12">
              Feeling steadier? You just completed {pattern.name}.
            </p>
            <Link
              href="/my-unwind"
              className="brutal-btn brutal-btn-primary inline-flex items-center gap-2 px-8 py-4 font-bold text-lg"
            >
              Log Session in My Unwind <ArrowRight className="w-5 h-5 arrow-icon" />
            </Link>
          </div>
        ) : (
          <>
            {isIdle && (
              <div className="mb-12 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex bg-frame brutal-border p-1 gap-1">
                  {(Object.keys(PATTERNS) as PatternType[]).map(key => (
                    <button
                      key={key}
                      onClick={() => setPatternId(key)}
                      className={`px-4 py-2 font-bold text-sm transition-colors ${patternId === key ? 'bg-ink text-paper' : 'hover:bg-paper'}`}
                    >
                      {PATTERNS[key].name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isIdle && (
              <h1 className="font-display text-4xl mb-4 animate-in fade-in slide-in-from-top-4">
                {pattern.name}
              </h1>
            )}

            <p className="font-sans text-xl text-grey-text mb-12 h-8">
              {isIdle
                ? pattern.description
                : `Round ${round} of ${pattern.rounds}`}
            </p>

            <button
              onClick={isIdle ? startSession : undefined}
              className={`w-72 h-72 rounded-full border-4 border-ink bg-paper shadow-hard flex items-center justify-center relative overflow-hidden ${isIdle ? "cursor-pointer hover:shadow-hard-hover active:translate-y-1 active:translate-x-1 active:shadow-none transition-all" : "cursor-default"}`}
            >
              {/* The animating background orb */}
              {!prefersReducedMotion ? (
                 <motion.div
                   className="absolute inset-0 bg-ink rounded-full"
                   style={{ originX: 0.5, originY: 0.5 }}
                   animate={getOrbState()}
                   transition={getOrbTransition()}
                 />
              ) : (
                 <div className="absolute inset-0 border-[16px] border-frame rounded-full opacity-20" />
              )}

              {/* Text content inside orb */}
              <div className={`z-10 flex flex-col items-center ${(!isIdle && activePhaseName === "INHALE" && !prefersReducedMotion) ? "text-paper" : "text-ink"} transition-colors duration-500`}>
                <span className="font-display text-4xl">{getPhaseLabel()}</span>
                {!isIdle && (
                  <span className="font-mono text-3xl mt-2 font-bold">{timeLeft}s</span>
                )}
              </div>
            </button>

            {!isIdle && (
              <button
                onClick={() => setPhaseIndex(-1)}
                className="mt-12 text-sm font-bold text-grey-text hover:text-ink underline underline-offset-4"
              >
                Cancel session
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}

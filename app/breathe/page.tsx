"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { motion, useAnimation } from "framer-motion";

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
      { phase: "INHALE", duration: 2 }, 
      { phase: "HOLD", duration: 1 },   
      { phase: "INHALE", duration: 1 }, 
      { phase: "EXHALE", duration: 6 }, 
    ],
  },
};

export default function BreathePage() {
  const [patternId, setPatternId] = useState<PatternType>("4-7-8");
  const pattern = PATTERNS[patternId];
  
  const [activePhaseName, setActivePhaseName] = useState<Phase>("IDLE");
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const orbControls = useAnimation();
  const sessionRef = useRef<{ active: boolean; timerId: NodeJS.Timeout | null }>({ active: false, timerId: null });

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

  const playTone = useCallback((phase: Phase) => {
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
      
      if (phase === "INHALE") {
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 1.0);
      } else if (phase === "EXHALE") {
          osc.frequency.setValueAtTime(330, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(165, ctx.currentTime + 1.0);
      } else {
          osc.frequency.setValueAtTime(220, ctx.currentTime);
      }
      
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

  const startSession = async () => {
    sessionRef.current.active = true;
    
    // Quick haptic/tone to signify start
    triggerHaptic();
    playTone("INHALE");

    for (let r = 1; r <= pattern.rounds; r++) {
      if (!sessionRef.current.active) break;
      setRound(r);
      
      for (const p of pattern.phases) {
        if (!sessionRef.current.active) break;
        
        setActivePhaseName(p.phase);
        setTimeLeft(p.duration);
        playTone(p.phase);
        triggerHaptic();
        
        // Start animation visually
        if (!prefersReducedMotion) {
           let targetScale = 1;
           let targetOpacity = 0.6;
           let ease: "linear" | "easeOut" | "easeInOut" = "linear";
           
           if (p.phase === "INHALE") {
              targetScale = 1.0; 
              ease = "easeOut";
           } else if (p.phase === "EXHALE") {
              targetScale = 0.5;
              targetOpacity = 0.4;
              ease = "easeInOut";
           } else if (p.phase === "HOLD") {
              targetScale = 1.0;
           } else {
              targetScale = 0.5;
              targetOpacity = 0.2;
           }
           
           orbControls.start({
             scale: targetScale,
             opacity: targetOpacity,
             transition: { duration: p.duration, ease }
           });
        }
        
        // Countdown timer loop for the exact duration of the phase
        await new Promise<void>((resolve) => {
          let currentTick = p.duration;
          
          sessionRef.current.timerId = setInterval(() => {
            currentTick -= 1;
            if (currentTick <= 0) {
              if (sessionRef.current.timerId) clearInterval(sessionRef.current.timerId);
              setTimeLeft(0);
              resolve();
            } else {
              setTimeLeft(currentTick);
            }
          }, 1000);
        });
      }
    }
    
    if (sessionRef.current.active) {
       setActivePhaseName("DONE");
       const sessions = parseInt(localStorage.getItem("unwind_breathe_sessions") || "0");
       localStorage.setItem("unwind_breathe_sessions", (sessions + 1).toString());
    }
  };

  const cancelSession = () => {
    sessionRef.current.active = false;
    if (sessionRef.current.timerId) clearInterval(sessionRef.current.timerId);
    setActivePhaseName("IDLE");
    orbControls.stop();
    orbControls.set({ scale: 0.5, opacity: 0.2 });
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      sessionRef.current.active = false;
      if (sessionRef.current.timerId) clearInterval(sessionRef.current.timerId);
    };
  }, []);

  const isIdle = activePhaseName === "IDLE";
  const isDone = activePhaseName === "DONE";

  const getPhaseLabel = () => {
    if (isIdle) return "Start";
    if (isDone) return "Done";
    if (activePhaseName === "INHALE") return "Inhale...";
    if (activePhaseName === "HOLD") return "Hold...";
    if (activePhaseName === "EXHALE") return "Exhale...";
    if (activePhaseName === "HOLD_EMPTY") return "Hold...";
    return "";
  };
  
  // Set initial orb state
  useEffect(() => {
    if (isIdle) {
      orbControls.set({ scale: 0.5, opacity: 0.2 });
    }
  }, [isIdle, orbControls]);

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
                      onClick={() => {
                        setPatternId(key);
                        // Reset orb animation for the new pattern
                        orbControls.set({ scale: 0.5, opacity: 0.2 });
                      }}
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
                   animate={orbControls}
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
                onClick={cancelSession}
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

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Settings, Play, Pause, X, Volume2, VolumeX, Moon, Zap, ArrowLeft, RefreshCw, ArrowRight } from "lucide-react";
import { getSetting, setSetting } from "@/lib/db";
import { motion, useAnimation } from "framer-motion";

type PatternType = "4-7-8" | "box" | "sigh" | "custom";
type Phase = "IDLE" | "INHALE" | "HOLD" | "EXHALE" | "HOLD_EMPTY" | "DONE";

interface Pattern {
  id: PatternType;
  name: string;
  description: string;
  phases: { phase: Phase; duration: number }[];
  rounds: number;
}

const DEFAULT_PATTERNS: Record<Exclude<PatternType, "custom">, Pattern> = {
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
  
  // Custom Pattern State
  const [customInhale, setCustomInhale] = useState(4);
  const [customHold, setCustomHold] = useState(4);
  const [customExhale, setCustomExhale] = useState(4);
  const [customHoldEmpty, setCustomHoldEmpty] = useState(4);
  const [customRounds, setCustomRounds] = useState(4);
  
  const getPattern = (): Pattern => {
    if (patternId === "custom") {
      const phases: { phase: Phase; duration: number }[] = [];
      if (customInhale > 0) phases.push({ phase: "INHALE", duration: customInhale });
      if (customHold > 0) phases.push({ phase: "HOLD", duration: customHold });
      if (customExhale > 0) phases.push({ phase: "EXHALE", duration: customExhale });
      if (customHoldEmpty > 0) phases.push({ phase: "HOLD_EMPTY", duration: customHoldEmpty });
      
      return {
        id: "custom",
        name: "Custom Pattern",
        description: "Your personalized breathing rhythm.",
        rounds: customRounds,
        phases
      };
    }
    return DEFAULT_PATTERNS[patternId];
  };

  const pattern = getPattern();
  
  const [activePhaseName, setActivePhaseName] = useState<Phase>("IDLE");
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phaseTotalTime, setPhaseTotalTime] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const orbControls = useAnimation();
  const sessionRef = useRef<{ active: boolean; paused: boolean; timerId: NodeJS.Timeout | null }>({ active: false, paused: false, timerId: null });

  // Update ref when state changes
  useEffect(() => {
    sessionRef.current.paused = isPaused;
  }, [isPaused]);

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
    if (!soundEnabled || sessionRef.current.paused) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      
      // Ambient Singing Bowl style
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc1.type = "sine";
      osc2.type = "triangle";
      
      filter.type = "lowpass";
      filter.Q.value = 1;
      
      const baseFreq = phase === "INHALE" ? 220 : phase === "EXHALE" ? 180 : 200;
      const endFreq = phase === "INHALE" ? 330 : phase === "EXHALE" ? 140 : 200;
      
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 1.0);
      
      osc2.frequency.setValueAtTime(baseFreq * 1.01, ctx.currentTime); // slight detune
      osc2.frequency.exponentialRampToValueAtTime(endFreq * 1.01, ctx.currentTime + 1.0);
      
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 1.0);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.5);
      osc2.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.warn("Audio not supported or blocked");
    }
  }, [soundEnabled]);

  const triggerHaptic = useCallback((type: "tick" | "phase") => {
    if (soundEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
      if (type === "phase") navigator.vibrate([50, 50, 50]);
      else navigator.vibrate(20);
    }
  }, [soundEnabled]);

  const animateOrb = (phase: Phase, duration: number, isResuming = false) => {
    if (prefersReducedMotion) return;
    
    let targetScale = 1;
    let targetOpacity = 0.6;
    let ease: "linear" | "easeOut" | "easeInOut" = "linear";
    
    if (phase === "INHALE") {
       targetScale = 1.0; 
       ease = "easeOut";
    } else if (phase === "EXHALE") {
       targetScale = 0.5;
       targetOpacity = 0.4;
       ease = "easeInOut";
    } else if (phase === "HOLD") {
       targetScale = 1.0;
    } else {
       targetScale = 0.5;
       targetOpacity = 0.2;
    }
    
    orbControls.start({
      scale: targetScale,
      opacity: targetOpacity,
      transition: { duration, ease }
    });
  };

  const startSession = async () => {
    sessionRef.current.active = true;
    sessionRef.current.paused = false;
    setIsPaused(false);
    
    triggerHaptic("phase");
    
    for (let r = 1; r <= pattern.rounds; r++) {
      if (!sessionRef.current.active) break;
      setRound(r);
      
      for (const p of pattern.phases) {
        if (!sessionRef.current.active) break;
        
        setActivePhaseName(p.phase);
        setTimeLeft(p.duration);
        setPhaseTotalTime(p.duration);
        
        if (!sessionRef.current.paused) {
          playTone(p.phase);
          triggerHaptic("phase");
          animateOrb(p.phase, p.duration);
        }
        
        // Timer Loop
        await new Promise<void>((resolve) => {
          let currentTick = p.duration;
          let wasPaused = false;
          
          sessionRef.current.timerId = setInterval(() => {
            if (sessionRef.current.paused) {
              if (!wasPaused) {
                orbControls.stop(); // Stop animation on pause
                wasPaused = true;
              }
              return; // Skip tick
            }
            
            if (wasPaused) {
              // Resumed
              animateOrb(p.phase, currentTick, true);
              wasPaused = false;
            }

            currentTick -= 1;
            triggerHaptic("tick");
            
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
       const sessions = await getSetting("unwind_breathe_sessions", 0);
       await setSetting("unwind_breathe_sessions", sessions + 1);
    }
  };

  const cancelSession = () => {
    sessionRef.current.active = false;
    if (sessionRef.current.timerId) clearInterval(sessionRef.current.timerId);
    setActivePhaseName("IDLE");
    setIsPaused(false);
    orbControls.stop();
    orbControls.set({ scale: 0.5, opacity: 0.2 });
  };
  
  const togglePause = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering startSession if clicking orb
    setIsPaused(p => !p);
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
    if (isIdle) return "START";
    if (isDone) return "Done";
    if (isPaused) return "Paused";
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
  
  // Calculate stroke dash offset for the SVG ring
  const ringCircumference = 2 * Math.PI * 136; // r=136 for a 272px box
  const ringProgress = isIdle || isDone ? 1 : (timeLeft / phaseTotalTime);
  const strokeDashoffset = ringCircumference * (1 - ringProgress);

  return (
    <div className={`flex-1 bg-dots-bg text-ink selection:bg-ink selection:text-paper flex flex-col transition-colors duration-1000 ${
      !isIdle && !isDone && activePhaseName === "INHALE" ? "bg-frame" : ""
    }`}>
      
      {/* Header controls */}
      <div className="absolute top-24 right-4 md:right-8 z-50 flex items-center gap-4">
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 brutal-border bg-paper rounded-full hover:bg-frame transition-colors focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
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
            <div className="flex justify-center mt-12 w-full max-w-sm">
              <Link 
                href="/my-unwind" 
                className="brutal-btn brutal-btn-primary w-full py-4 text-center font-mono font-bold text-lg flex items-center justify-center gap-2"
              >
                [ LOG_SESSION.EXE ] <ArrowRight className="w-5 h-5 arrow-icon" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {isIdle && (
              <div className="mb-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 w-full">
                <div className="flex flex-wrap justify-center bg-frame brutal-border p-1 gap-1">
                  {(Object.keys(DEFAULT_PATTERNS) as Array<Exclude<PatternType, "custom">>).map(key => (
                    <button
                      key={key}
                      onClick={() => setPatternId(key)}
                      className={`px-4 py-2 font-bold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 ${patternId === key ? 'bg-ink text-paper' : 'hover:bg-paper'}`}
                    >
                      {DEFAULT_PATTERNS[key].name}
                    </button>
                  ))}
                  <button
                      onClick={() => setPatternId("custom")}
                      className={`px-4 py-2 font-bold text-sm transition-colors flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 ${patternId === "custom" ? 'bg-ink text-paper' : 'hover:bg-paper'}`}
                    >
                      <Settings className="w-4 h-4" /> Custom
                  </button>
                </div>
                
                {patternId === "custom" && (
                  <div className="w-full max-w-sm mt-4 p-6 bg-paper brutal-border shadow-hard-sm text-left grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-mono font-bold uppercase block mb-1">Inhale ({customInhale}s)</label>
                       <input type="range" min="0" max="10" value={customInhale} onChange={e => setCustomInhale(parseInt(e.target.value))} className="w-full brutal-slider" />
                     </div>
                     <div>
                       <label className="text-xs font-mono font-bold uppercase block mb-1">Hold ({customHold}s)</label>
                       <input type="range" min="0" max="10" value={customHold} onChange={e => setCustomHold(parseInt(e.target.value))} className="w-full brutal-slider" />
                     </div>
                     <div>
                       <label className="text-xs font-mono font-bold uppercase block mb-1">Exhale ({customExhale}s)</label>
                       <input type="range" min="0" max="10" value={customExhale} onChange={e => setCustomExhale(parseInt(e.target.value))} className="w-full brutal-slider" />
                     </div>
                     <div>
                       <label className="text-xs font-mono font-bold uppercase block mb-1">Hold ({customHoldEmpty}s)</label>
                       <input type="range" min="0" max="10" value={customHoldEmpty} onChange={e => setCustomHoldEmpty(parseInt(e.target.value))} className="w-full brutal-slider" />
                     </div>
                     <div className="col-span-2 mt-2">
                       <label className="text-xs font-mono font-bold uppercase block mb-1">Rounds ({customRounds})</label>
                       <input type="range" min="1" max="10" value={customRounds} onChange={e => setCustomRounds(parseInt(e.target.value))} className="w-full brutal-slider" />
                     </div>
                  </div>
                )}
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

            <div className="relative">
               {/* SVG Progress Ring */}
               <svg 
                 className={`absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90 pointer-events-none transition-opacity duration-500 ${isIdle ? 'opacity-0' : 'opacity-100'}`}
                 viewBox="0 0 288 288"
               >
                 <circle
                   cx="144" cy="144" r="136"
                   fill="transparent"
                   stroke="var(--color-frame)"
                   strokeWidth="8"
                 />
                 <motion.circle
                   cx="144" cy="144" r="136"
                   fill="transparent"
                   stroke="var(--color-ink)"
                   strokeWidth="8"
                   strokeDasharray={ringCircumference}
                   animate={{ strokeDashoffset }}
                   transition={{ duration: 1, ease: "linear" }}
                 />
               </svg>

               <button
                 onClick={isIdle ? startSession : togglePause}
                 className={`w-72 h-72 rounded-full border-4 border-ink bg-paper shadow-hard flex items-center justify-center relative overflow-hidden focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-8 ${isIdle || !isDone ? "cursor-pointer hover:shadow-hard-hover active:translate-y-1 active:translate-x-1 active:shadow-none transition-all" : "cursor-default"}`}
               >
                 {/* The animating background orb */}
                 {!prefersReducedMotion ? (
                    <motion.div
                      className="absolute inset-0 bg-ink rounded-full"
                      style={{ originX: 0.5, originY: 0.5 }}
                      initial={{ scale: 0.5, opacity: 0.2 }}
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
                   
                   {!isIdle && isPaused && (
                     <div className="absolute top-10 text-ink bg-paper px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border-2 border-ink shadow-hard-sm">
                       Tap to Resume
                     </div>
                   )}
                 </div>
               </button>
            </div>

            {!isIdle && (
              <div className="mt-12 flex gap-8">
                 <button
                   onClick={togglePause}
                   className="brutal-btn brutal-btn-ghost flex items-center gap-2 text-sm font-bold font-mono px-4 py-2"
                 >
                   {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                   {isPaused ? "[ RESUME ]" : "[ PAUSE ]"}
                 </button>
                 <button
                   onClick={cancelSession}
                   className="brutal-btn brutal-btn-destructive flex items-center gap-2 text-sm font-bold font-mono px-4 py-2"
                 >
                   [ CANCEL.EXE ]
                 </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Phase = "IDLE" | "INHALE" | "HOLD" | "EXHALE" | "DONE";

export default function BreathePage() {
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);

  const phaseRef = useRef(phase);
  const roundRef = useRef(round);

  useEffect(() => {
    phaseRef.current = phase;
    roundRef.current = round;
  }, [phase, round]);

  useEffect(() => {
    if (phase === "IDLE" || phase === "DONE") return;

    let duration = 0;
    if (phase === "INHALE") duration = 4;
    if (phase === "HOLD") duration = 7;
    if (phase === "EXHALE") duration = 8;

    setTimeLeft(duration);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Transition to next phase
          setTimeout(() => {
            if (phaseRef.current === "INHALE") setPhase("HOLD");
            else if (phaseRef.current === "HOLD") setPhase("EXHALE");
            else if (phaseRef.current === "EXHALE") {
              if (roundRef.current >= 4) {
                setPhase("DONE");
              } else {
                setRound((r) => r + 1);
                setPhase("INHALE");
              }
            }
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, round]);

  const startSession = () => {
    setRound(1);
    setPhase("INHALE");
  };

  const getOrbScale = () => {
    if (phase === "IDLE" || phase === "DONE") return "scale-50";
    if (phase === "INHALE")
      return "scale-100 transition-transform duration-[4000ms] ease-out";
    if (phase === "HOLD") return "scale-100";
    if (phase === "EXHALE")
      return "scale-50 transition-transform duration-[8000ms] ease-in-out";
    return "scale-50";
  };

  const getPhaseLabel = () => {
    if (phase === "IDLE") return "Start";
    if (phase === "INHALE") return "Inhale...";
    if (phase === "HOLD") return "Hold...";
    if (phase === "EXHALE") return "Exhale...";
    if (phase === "DONE") return "Done";
  };

  return (
    <div className="flex-1 bg-dots-bg text-ink selection:bg-ink selection:text-paper flex flex-col">
      <main className="max-w-3xl mx-auto px-4 py-24 flex-1 flex flex-col items-center justify-center text-center">
        {phase === "DONE" ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <h1 className="font-display text-5xl md:text-7xl mb-6">Nice.</h1>
            <p className="font-sans text-xl text-grey-text mb-12">
              Feeling steadier? Taking a moment to breathe is the best reset.
            </p>
            <Link
              href="/tips"
              className="brutal-btn inline-flex items-center gap-2 px-8 py-4 font-bold text-lg"
            >
              Explore Recovery Tips <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-5xl md:text-7xl mb-8">
              4-7-8 Breathing
            </h1>
            <p className="font-sans text-xl text-grey-text mb-12 h-8">
              {phase === "IDLE"
                ? "Inhale for 4s, hold for 7s, exhale for 8s. Repeat 4 times."
                : `Round ${round} of 4`}
            </p>

            <button
              onClick={phase === "IDLE" ? startSession : undefined}
              className={`w-64 h-64 rounded-full border-4 border-ink bg-paper shadow-hard flex items-center justify-center relative overflow-hidden ${phase === "IDLE" ? "cursor-pointer hover:shadow-hard-hover active:translate-y-1 active:translate-x-1 active:shadow-none transition-all" : "cursor-default"}`}
            >
              {/* The animating background orb */}
              <div
                className={`absolute inset-0 bg-frame opacity-50 rounded-full ${getOrbScale()}`}
                style={{ transformOrigin: "center" }}
              />

              {/* Text content inside orb */}
              <div className="z-10 flex flex-col items-center">
                <span className="font-display text-3xl">{getPhaseLabel()}</span>
                {phase !== "IDLE" && (
                  <span className="font-mono text-xl mt-2">{timeLeft}s</span>
                )}
              </div>
            </button>

            {phase !== "IDLE" && (
              <button
                onClick={() => setPhase("IDLE")}
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

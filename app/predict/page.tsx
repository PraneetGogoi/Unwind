"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

type Status = "IDLE" | "LOADING" | "TYPING_LOG" | "SHOW_RESULT" | "SIMULATOR";

const TERMINAL_LOGS = [
  "> Initializing burnout predictor...",
  "> Loading weights...",
  "> Analyzing feature set...",
  "> Scoring cognitive load...",
  "> Done.",
];

export default function PredictorPage() {
  const [status, setStatus] = useState<Status>("IDLE");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  // Terminal log typing state
  const [logIndex, setLogIndex] = useState(0);

  // Animated gauge state
  const [displayScore, setDisplayScore] = useState(0);

  const [formData, setFormData] = useState({
    age: 28,
    experience_years: 5,
    daily_work_hours: 8,
    sleep_hours: 7,
    caffeine_intake: 2,
    bugs_per_day: 5,
    commits_per_day: 10,
    meetings_per_day: 3,
    screen_time: 10,
    exercise_hours: 1,
    stress_level: 50,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: parseFloat(e.target.value) || 0,
    }));
  };

  const getTopDrivers = () => {
    const drivers = [];
    if (formData.stress_level >= 60) drivers.push({ name: "High Stress", category: "focus" });
    if (formData.sleep_hours <= 6) drivers.push({ name: "Low Sleep", category: "sleep" });
    if (formData.caffeine_intake >= 4) drivers.push({ name: "High Caffeine", category: "caffeine" });
    if (formData.meetings_per_day >= 5) drivers.push({ name: "Meeting Overload", category: "meetings" });
    if (formData.screen_time >= 10) drivers.push({ name: "High Screen Time", category: "screen-time" });
    if (formData.exercise_hours <= 1) drivers.push({ name: "Low Movement", category: "movement" });
    
    return drivers.slice(0, 3);
  };

  const INPUT_CONFIG = {
    age: { min: 18, max: 80, step: 1 },
    experience_years: { min: 0, max: 50, step: 1 },
    daily_work_hours: { min: 0, max: 24, step: 0.5 },
    sleep_hours: { min: 0, max: 24, step: 0.5 },
    caffeine_intake: { min: 0, max: 20, step: 1 },
    bugs_per_day: { min: 0, max: 50, step: 1 },
    commits_per_day: { min: 0, max: 50, step: 1 },
    meetings_per_day: { min: 0, max: 20, step: 1 },
    screen_time: { min: 0, max: 24, step: 0.5 },
    exercise_hours: { min: 0, max: 10, step: 0.5 },
    stress_level: { min: 0, max: 100, step: 1 },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("LOADING");
    setLogIndex(0);
    setDisplayScore(0);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
      setStatus("TYPING_LOG");
      
      // Save to localStorage history
      const history = JSON.parse(localStorage.getItem("unwind_history") || "[]");
      history.push({
        timestamp: new Date().toISOString(),
        inputs: formData,
        result: data
      });
      localStorage.setItem("unwind_history", JSON.stringify(history));
      // Save latest for dashboard
      localStorage.setItem("unwind_latest_prediction", JSON.stringify({ inputs: formData, result: data }));
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the prediction API.");
      setStatus("IDLE");
    }
  };

  // Handle terminal log typing effect
  useEffect(() => {
    if (status === "TYPING_LOG") {
      if (logIndex < TERMINAL_LOGS.length) {
        const timer = setTimeout(() => {
          setLogIndex((i) => i + 1);
        }, 300); // 300ms per line
        return () => clearTimeout(timer);
      } else {
        setTimeout(() => setStatus("SHOW_RESULT"), 400);
      }
    }
  }, [status, logIndex]);

  // Debounced simulator updates
  useEffect(() => {
    if (status !== "SIMULATOR") return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error("Simulator API error", err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData, status]);

  // Handle gauge animation
  useEffect(() => {
    if ((status === "SHOW_RESULT" || status === "SIMULATOR") && result) {
      // Determine a fake "score" based on risk level for the dial if not provided by API
      // Since API returns Low, Moderate, High, we map it:
      const targetScore =
        result.burnout_level === "High"
          ? 85
          : result.burnout_level === "Moderate"
            ? 55
            : 25;

      setDisplayScore(targetScore);
    }
  }, [status, result]);

  const getRiskColor = (level: string) => {
    if (level === "High") return "var(--high)";
    if (level === "Moderate") return "var(--medium)";
    return "var(--low)";
  };

  return (
    <div className="flex-1 bg-dots-bg text-ink selection:bg-ink selection:text-paper">
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="font-display text-5xl md:text-7xl mb-4">
            Burnout Predictor
          </h1>
          <p className="font-sans text-xl text-grey-text max-w-2xl">
            Input your weekly averages. Our machine learning model will analyze
            your cognitive load and predict your burnout risk.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8 brutal-card bg-paper p-8 relative">
            <div className="absolute top-0 left-0 right-0 h-10 border-b-2 border-ink flex items-center px-4 bg-frame">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
                <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
              </div>
              <div className="mx-auto font-mono text-xs font-bold">
                predictor_form.exe
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {Object.entries(formData).map(([key, value]) => {
                const config = INPUT_CONFIG[key as keyof typeof INPUT_CONFIG];
                return (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="font-bold text-sm uppercase tracking-wide flex justify-between">
                      <span>{key.replace(/_/g, " ")}</span>
                      <span className="text-grey-text">{value}</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        name={key}
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        value={value}
                        onChange={handleChange}
                        className="flex-1 accent-ink h-2 bg-frame brutal-border appearance-none cursor-pointer"
                      />
                      <input
                        type="number"
                        name={key}
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        value={value}
                        onChange={handleChange}
                        className="w-20 brutal-border bg-dots-bg p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ink"
                      />
                    </div>
                  </div>
                );
              })}
              <div className="sm:col-span-2 mt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={status === "LOADING" || status === "TYPING_LOG"}
                  className="flex-1 brutal-btn py-4 text-xl font-bold flex items-center justify-center gap-2"
                >
                  {status === "LOADING" || status === "TYPING_LOG" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Run Prediction Model"
                  )}
                  {status === "IDLE" || status === "SHOW_RESULT" ? (
                    <ArrowRight />
                  ) : null}
                </button>
                {(status === "SHOW_RESULT" || status === "SIMULATOR") && (
                  <button
                    type="button"
                    onClick={() => setStatus("SIMULATOR")}
                    className="brutal-btn py-4 px-6 text-xl font-bold flex items-center justify-center gap-2 border-dashed bg-transparent hover:bg-ink hover:text-paper"
                  >
                    What-If Simulator
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="md:col-span-4 flex flex-col gap-8">
            <div className="brutal-card bg-paper p-6 relative flex-1 flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-10 border-b-2 border-ink flex items-center px-4 bg-frame">
                <div className="font-mono text-xs font-bold">result.log</div>
              </div>

              <div className="mt-8 flex-1 flex flex-col">
                {status === "IDLE" && (
                  <div className="text-grey-text italic mt-4">
                    Awaiting input parameters...
                  </div>
                )}

                {(status === "TYPING_LOG" || status === "SHOW_RESULT") && (
                  <div className="font-mono text-sm space-y-1 mb-6">
                    {TERMINAL_LOGS.slice(0, logIndex).map((log, i) => (
                      <div
                        key={i}
                        className="animate-in fade-in slide-in-from-bottom-1"
                      >
                        {log}
                      </div>
                    ))}
                    {status === "TYPING_LOG" &&
                      logIndex < TERMINAL_LOGS.length && (
                        <div className="animate-pulse">_</div>
                      )}
                  </div>
                )}

                {(status === "SHOW_RESULT" || status === "SIMULATOR") && result && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm text-grey-text uppercase mb-2">
                      Prediction
                    </h3>

                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className="font-display text-5xl flex-1"
                        style={{ color: getRiskColor(result.burnout_level) }}
                      >
                        {result.burnout_level} Risk
                      </div>
                      <div className="w-16 h-16 rounded-full brutal-border flex items-center justify-center font-mono font-bold text-xl relative overflow-hidden bg-frame">
                        <div
                          className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                          style={{
                            height: `${displayScore}%`,
                            backgroundColor: getRiskColor(result.burnout_level),
                            opacity: 0.2,
                          }}
                        />
                        {displayScore}
                      </div>
                    </div>

                    {status === "SIMULATOR" && (
                      <div className="mb-6 p-4 border-2 border-ink bg-frame border-dashed animate-in fade-in zoom-in duration-300">
                        <h3 className="font-bold text-sm text-ink uppercase mb-4">Simulator Mode</h3>
                        <p className="text-sm text-grey-text mb-4">Adjust your inputs on the left. Watch how your risk score changes in real-time.</p>
                      </div>
                    )}

                    <h3 className="font-bold text-sm text-grey-text uppercase mb-3">
                      Key Factors
                    </h3>
                    <div className="space-y-4 mb-8">
                      {/* Factor 1 */}
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span>Work/Life Balance</span>
                          <span>
                            {result.metrics.work_life_balance.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-frame brutal-border overflow-hidden">
                          <div
                            className="h-full bg-ink"
                            style={{
                              width: `${Math.min(100, result.metrics.work_life_balance * 20)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Factor 2 */}
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span>Cognitive Load</span>
                          <span>
                            {result.metrics.cognitive_load.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-frame brutal-border overflow-hidden">
                          <div
                            className="h-full bg-ink"
                            style={{
                              width: `${Math.min(100, result.metrics.cognitive_load * 10)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Factor 3 */}
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span>Caffeine / Sleep</span>
                          <span>
                            {result.metrics.caffeine_per_sleep.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-frame brutal-border overflow-hidden">
                          <div
                            className="h-full bg-ink"
                            style={{
                              width: `${Math.min(100, result.metrics.caffeine_per_sleep * 30)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {getTopDrivers().length > 0 && (
                      <div className="mb-8">
                        <h3 className="font-bold text-sm text-grey-text uppercase mb-3">Top Actionable Drivers</h3>
                        <div className="flex flex-wrap gap-3">
                          {getTopDrivers().map((driver, idx) => (
                            <Link
                              key={idx}
                              href={`/tips#${driver.category}`}
                              className="px-4 py-2 border-2 border-ink text-sm font-bold bg-frame hover:bg-ink hover:text-paper transition-colors"
                            >
                              {driver.name} &rarr;
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto">
                      <Link
                        href="/tips"
                        className="text-sm font-bold underline underline-offset-4 hover:text-grey-text flex items-center gap-1"
                      >
                        View recommended habits{" "}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

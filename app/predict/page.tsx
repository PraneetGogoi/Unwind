"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Status = "IDLE" | "LOADING" | "SHOW_RESULT" | "SIMULATOR";

export default function PredictorPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("IDLE");
  const [baseResult, setBaseResult] = useState<any>(null);
  const [baseFormData, setBaseFormData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

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
    if (status === "SIMULATOR") {
      setStatus("IDLE");
      setBaseResult(null);
      setBaseFormData(null);
    }
    
    setStatus("LOADING");

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setBaseResult(data);
      setBaseFormData({...formData});
      setStatus("SHOW_RESULT");
      
      const history = JSON.parse(localStorage.getItem("unwind_history") || "[]");
      history.push({
        timestamp: new Date().toISOString(),
        inputs: formData,
        result: data
      });
      localStorage.setItem("unwind_history", JSON.stringify(history));
      localStorage.setItem("unwind_latest_prediction", JSON.stringify({ inputs: formData, result: data }));
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the prediction API.");
      setStatus("IDLE");
    }
  };

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
        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error("Simulator API error", err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData, status]);

  const getRiskColor = (level: string) => {
    if (level === "High") return "var(--high)";
    if (level === "Moderate" || level === "Medium") return "var(--medium)";
    return "var(--low)";
  };

  const getDiffText = (key: string, value: number) => {
    if (!result || !result.baseline_stats) return null;
    const base = result.baseline_stats[key];
    if (!base) return null;
    const diff = value - base;
    if (Math.abs(diff) < 0.1) return "Average";
    const dir = diff > 0 ? "higher" : "lower";
    return `${Math.abs(diff).toFixed(1)} ${dir} than avg`;
  };

  const getContributions = () => {
    if (!result || !result.baseline_stats) return [];
    const b = result.baseline_stats;
    const c = [];
    
    const directBad = ['stress_level', 'meetings_per_day', 'bugs_per_day', 'caffeine_intake', 'screen_time', 'daily_work_hours'];
    const inverseBad = ['sleep_hours', 'exercise_hours'];

    for (const key of directBad) {
      if (formData[key as keyof typeof formData] > b[key] * 1.1) {
        c.push({ key, name: key.replace(/_/g, " "), value: formData[key as keyof typeof formData] - b[key], type: "up" });
      } else if (formData[key as keyof typeof formData] < b[key] * 0.9) {
        c.push({ key, name: key.replace(/_/g, " "), value: b[key] - formData[key as keyof typeof formData], type: "down" });
      }
    }

    for (const key of inverseBad) {
      if (formData[key as keyof typeof formData] < b[key] * 0.9) {
        c.push({ key, name: key.replace(/_/g, " "), value: b[key] - formData[key as keyof typeof formData], type: "up" });
      } else if (formData[key as keyof typeof formData] > b[key] * 1.1) {
        c.push({ key, name: key.replace(/_/g, " "), value: formData[key as keyof typeof formData] - b[key], type: "down" });
      }
    }

    return c.sort((a, b) => b.value - a.value).slice(0, 5);
  };

  const handleAddPlan = () => {
    const topDriver = getContributions().find(c => c.type === "up");
    let focusName = "Sleep";
    if (topDriver) {
      if (topDriver.key.includes("screen")) focusName = "Screen time";
      if (topDriver.key.includes("exercise")) focusName = "Movement";
      if (topDriver.key.includes("meetings")) focusName = "Meetings";
      if (topDriver.key.includes("work")) focusName = "Boundaries";
      if (topDriver.key.includes("caffeine")) focusName = "Caffeine";
    }
    
    localStorage.setItem("unwind_focus", JSON.stringify({ title: focusName, color: "var(--ink)" }));
    router.push("/my-unwind");
  };

  return (
    <div className="flex-1 bg-dots-bg text-ink selection:bg-ink selection:text-paper">
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="font-display text-5xl md:text-7xl mb-4">
            Burnout Predictor
          </h1>
          <p className="font-sans text-xl text-grey-text max-w-2xl">
            Input your weekly averages. Our model analyzes your cognitive load against 7,000 developers to predict burnout risk.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 brutal-card bg-paper p-8 relative flex flex-col h-full">
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
              className="mt-8 flex-1 flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto max-h-[60vh] pr-2">
                {Object.entries(formData).map(([key, value]) => {
                  const config = INPUT_CONFIG[key as keyof typeof INPUT_CONFIG];
                  const diffText = getDiffText(key, value);
                  
                  return (
                    <div key={key} className="flex flex-col gap-2">
                      <label className="font-bold text-sm uppercase tracking-wide flex justify-between">
                        <span>{key.replace(/_/g, " ")}</span>
                        <span className="text-ink">{value}</span>
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
                      </div>
                      {diffText && (
                        <div className="text-[10px] font-mono text-grey-text uppercase mt-1">
                          {diffText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-4 pt-4 border-t-2 border-ink">
                <button
                  type="submit"
                  disabled={status === "LOADING"}
                  className="flex-1 brutal-btn py-4 text-lg font-bold flex items-center justify-center gap-2"
                >
                  {status === "LOADING" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    status === "SIMULATOR" ? "Reset to Baseline" : "Run Prediction"
                  )}
                  {status === "IDLE" || status === "SHOW_RESULT" ? (
                    <ArrowRight className="w-5 h-5" />
                  ) : null}
                </button>
                {(status === "SHOW_RESULT" || status === "SIMULATOR") && (
                  <button
                    type="button"
                    onClick={() => setStatus("SIMULATOR")}
                    className={`py-4 px-6 text-lg font-bold flex items-center justify-center border-2 border-dashed transition-colors ${status === "SIMULATOR" ? "bg-ink text-paper border-ink" : "border-ink hover:bg-frame"}`}
                  >
                    What-If Simulator
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-6 flex flex-col h-full">
            <div className="brutal-card bg-paper p-6 relative flex-1 flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-10 border-b-2 border-ink flex items-center px-4 bg-frame">
                <div className="font-mono text-xs font-bold">result.log</div>
              </div>

              <div className="mt-8 flex-1 flex flex-col">
                {status === "IDLE" && (
                  <div className="text-grey-text italic mt-4 font-mono">
                    Awaiting input parameters...
                  </div>
                )}



                {(status === "SHOW_RESULT" || status === "SIMULATOR") && result && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
                    
                    {status === "SIMULATOR" && baseResult && (
                      <div className="mb-6 p-4 border-2 border-ink bg-frame animate-in fade-in zoom-in duration-300">
                        <h3 className="font-bold text-sm text-ink uppercase mb-2">Simulator Mode</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-xs font-mono text-grey-text mb-1">Baseline</div>
                            <div className="font-bold" style={{ color: getRiskColor(baseResult.burnout_level) }}>{baseResult.burnout_level}</div>
                          </div>
                          <ArrowRight className="w-4 h-4" />
                          <div className="flex-1">
                            <div className="text-xs font-mono text-grey-text mb-1">Simulated</div>
                            <div className="font-bold" style={{ color: getRiskColor(result.burnout_level) }}>{result.burnout_level}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mb-8">
                      <h3 className="font-bold text-sm text-grey-text uppercase tracking-widest">
                        Predicted Class
                      </h3>
                      <div
                        className="font-display text-6xl leading-none"
                        style={{ color: getRiskColor(result.burnout_level) }}
                      >
                        {result.burnout_level} Risk
                      </div>
                      
                      {/* Probabilities */}
                      {result.probabilities && (
                        <div className="mt-4 flex gap-1 h-6 w-full brutal-border overflow-hidden bg-frame p-1">
                          {["Low", "Medium", "High"].map(level => {
                            const p = result.probabilities[level] || 0;
                            if (p === 0) return null;
                            return (
                              <div 
                                key={level}
                                className="h-full flex items-center justify-center text-[10px] font-bold text-paper transition-all"
                                style={{ width: `${p * 100}%`, backgroundColor: getRiskColor(level) }}
                                title={`${level}: ${(p * 100).toFixed(1)}%`}
                              >
                                {p > 0.15 ? `${(p * 100).toFixed(0)}%` : ""}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {result.burnout_level === "High" && (
                      <div className="mb-8 bg-paper border-2 border-high p-4 flex gap-3">
                        <Info className="text-high shrink-0 w-5 h-5" />
                        <p className="text-sm font-bold text-ink">
                          This isn't medical advice — if it's more than a rough week, talking to a professional is a strong move. Take it easy.
                        </p>
                      </div>
                    )}

                    <h3 className="font-bold text-sm text-grey-text uppercase mb-4 tracking-widest">
                      Contribution Breakdown
                    </h3>
                    <div className="space-y-4 mb-8 flex-1">
                      {getContributions().map((c, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-mono font-bold">
                            <span className="uppercase">{c.name}</span>
                            <span className={c.type === "up" ? "text-high" : "text-low"}>
                              {c.type === "up" ? "↑ Increased Risk" : "↓ Lowered Risk"}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-frame brutal-border overflow-hidden relative">
                            {/* Center line */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-ink z-10" />
                            {c.type === "up" ? (
                              <div className="absolute left-1/2 top-0 bottom-0 bg-high" style={{ width: `${Math.min(50, c.value * 10)}%` }} />
                            ) : (
                              <div className="absolute right-1/2 top-0 bottom-0 bg-low" style={{ width: `${Math.min(50, c.value * 10)}%` }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-6 border-t-2 border-ink">
                      <button
                        onClick={handleAddPlan}
                        className="w-full brutal-btn py-3 text-sm font-bold flex items-center justify-center gap-2 bg-ink text-paper"
                      >
                        Add to my weekly plan <ArrowRight className="w-4 h-4" />
                      </button>
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

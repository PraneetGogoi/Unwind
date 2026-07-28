"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ArrowRight, Loader2 } from "lucide-react";

export default function PredictorPage() {
  const [loading, setLoading] = useState(false);
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
    stress_level: 50
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: parseFloat(e.target.value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the prediction API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dots-bg text-ink selection:bg-ink selection:text-paper">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="font-display text-5xl md:text-7xl mb-4">Burnout Predictor</h1>
          <p className="font-sans text-xl text-grey-text max-w-2xl">
            Input your weekly averages. Our machine learning model trained on 7,000 developers will analyze your cognitive load and predict your burnout risk.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8 brutal-card bg-paper p-8 relative">
            <div className="absolute top-0 left-0 right-0 h-10 border-b-2 border-ink flex items-center px-4 bg-frame">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
                <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
              </div>
              <div className="mx-auto font-mono text-xs font-bold">predictor_form.exe</div>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <label className="font-bold text-sm mb-2 uppercase tracking-wide">
                    {key.replace(/_/g, " ")}
                  </label>
                  <input 
                    type="number"
                    name={key}
                    step="0.1"
                    value={value}
                    onChange={handleChange}
                    className="brutal-border bg-dots-bg p-3 font-mono focus:outline-none focus:ring-2 focus:ring-ink"
                  />
                </div>
              ))}
              <div className="sm:col-span-2 mt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full brutal-btn py-4 text-xl font-bold flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Run Prediction Model"} 
                  {!loading && <ArrowRight />}
                </button>
              </div>
            </form>
          </div>

          <div className="md:col-span-4 flex flex-col gap-8">
            <div className="brutal-card bg-paper p-6 relative flex-1">
              <div className="absolute top-0 left-0 right-0 h-10 border-b-2 border-ink flex items-center px-4 bg-frame">
                <div className="font-mono text-xs font-bold">result.log</div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-bold text-sm text-grey-text uppercase mb-2">Prediction</h3>
                {result ? (
                  <div>
                    <div className="font-display text-5xl mb-6">
                      {result.burnout_level} Risk
                    </div>
                    
                    <h3 className="font-bold text-sm text-grey-text uppercase mb-2">Calculated Metrics</h3>
                    <ul className="space-y-3 font-mono text-sm">
                      <li className="flex justify-between border-b-2 border-ink border-dashed pb-1">
                        <span>Work/Life Balance</span>
                        <span className="font-bold">{result.metrics.work_life_balance}</span>
                      </li>
                      <li className="flex justify-between border-b-2 border-ink border-dashed pb-1">
                        <span>Cognitive Load</span>
                        <span className="font-bold">{result.metrics.cognitive_load}</span>
                      </li>
                      <li className="flex justify-between border-b-2 border-ink border-dashed pb-1">
                        <span>Productivity Ratio</span>
                        <span className="font-bold">{result.metrics.productivity_ratio}</span>
                      </li>
                      <li className="flex justify-between border-b-2 border-ink border-dashed pb-1">
                        <span>Caffeine/Sleep</span>
                        <span className="font-bold">{result.metrics.caffeine_per_sleep}</span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="text-grey-text italic mt-4">
                    Awaiting input parameters...
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

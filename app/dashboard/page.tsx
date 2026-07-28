"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getSignalAveragesChart, getBoxPlotChart, getSegmentChart, getRadarChart } from "@/lib/charts";
const PlotlyChart = dynamic(
  () => import("@/components/PlotlyChart").then((mod) => mod.PlotlyChart),
  { ssr: false }
);

// ── Data baked from model.ipynb (RandomForest, 7,000 developers) ──
const DISTRIBUTION = { Low: 1593, Medium: 3625, High: 1782 };
const TOTAL = DISTRIBUTION.Low + DISTRIBUTION.Medium + DISTRIBUTION.High;

const RISK_COLORS: Record<string, string> = {
  Low: "#2f9e57",
  Medium: "#e0932f",
  High: "#d1493f",
};

// Sorted ascending so the strongest predictor renders at the top of the h-bar chart.
const FEATURE_IMPORTANCE: { feature: string; importance: number }[] = [
  { feature: "experience_years", importance: 0.0065 },
  { feature: "age", importance: 0.0069 },
  { feature: "commits_per_day", importance: 0.0073 },
  { feature: "caffeine_intake", importance: 0.0078 },
  { feature: "exercise_hours", importance: 0.0113 },
  { feature: "sleep_hours", importance: 0.0154 },
  { feature: "caffeine_per_sleep", importance: 0.018 },
  { feature: "meetings_per_day", importance: 0.0196 },
  { feature: "productivity_ratio", importance: 0.0208 },
  { feature: "bugs_per_day", importance: 0.0323 },
  { feature: "screen_time", importance: 0.0332 },
  { feature: "daily_work_hours", importance: 0.0462 },
  { feature: "work_life_balance", importance: 0.0638 },
  { feature: "cognitive_load", importance: 0.0956 },
  { feature: "stress_level", importance: 0.615 },
];

const prettify = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const MONO = "JetBrains Mono, ui-monospace, monospace";

export default function DashboardPage() {
  const [userMetrics, setUserMetrics] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("unwind_latest_prediction");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserMetrics(parsed.inputs);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const signalChart = getSignalAveragesChart(userMetrics);
  const boxChart = getBoxPlotChart(userMetrics);
  const segmentChart = getSegmentChart();
  const radarChart = getRadarChart();



  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dots-bg text-ink selection:bg-ink selection:text-paper">
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="font-display text-5xl md:text-7xl mb-4">
          Burnout Analytics
        </h1>
        <p className="font-sans text-xl text-grey-text max-w-2xl mb-8">
          What the model learned from 7,000 developers — how burnout risk is
          distributed, and which signals drive it most.
        </p>

        {userMetrics && (
          <div className="brutal-card bg-[#3b82f6]/10 border-[#3b82f6] p-4 mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="w-4 h-4 text-[#3b82f6] rotate-45">★</div>
            <p className="font-sans text-sm text-ink">
              <strong>You are here.</strong> We found your latest prediction from the Predict tool. 
              The blue star marker on the charts below shows where your habits fall compared to the population.
            </p>
          </div>
        )}

        {/* charts */}
        <div className="brutal-card bg-paper p-8">
          <div className="h-10 border-b-2 border-ink flex items-center px-4 bg-frame -mx-8 -mt-8 mb-8">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
              <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
            </div>
            <div className="mx-auto font-mono text-xs font-bold">
              dashboard.html
            </div>
          </div>

          <div className="flex flex-col gap-12">
            <section>
              <h2 className="font-display text-2xl mb-1">
                Signal Averages by Risk Level
              </h2>
              <p className="font-sans text-sm text-grey-text mb-4">
                High-burnout developers tend to have higher stress and work hours, but lower sleep.
              </p>
              <PlotlyChart
                data={signalChart.data}
                height={400}
                layout={{
                  ...signalChart.layout,
                  font: { family: MONO, color: "#1a365d", size: 12 },
                  margin: { l: 60, r: 20, t: 40, b: 40 },
                  yaxis: { rangemode: "tozero" }
                }}
              />
            </section>

            <section>
              <h2 className="font-display text-2xl mb-1">Stress Distribution (Spread)</h2>
              <p className="font-sans text-sm text-grey-text mb-4">
                Box plots show the median and quartiles of stress levels across the three burnout groups.
              </p>
              <PlotlyChart
                data={boxChart.data}
                height={400}
                layout={{
                  ...boxChart.layout,
                  font: { family: MONO, color: "#1a365d", size: 12 },
                  margin: { l: 60, r: 20, t: 40, b: 40 },
                  yaxis: { rangemode: "tozero" }
                }}
              />
            </section>

            <div className="grid md:grid-cols-2 gap-12">
              <section>
                <h2 className="font-display text-2xl mb-1">Risk by Experience</h2>
                <p className="font-sans text-sm text-grey-text mb-4">
                  Seniors and Principals make up a distinct proportion of burnout groups.
                </p>
                <PlotlyChart
                  data={segmentChart.data}
                  height={350}
                  layout={{
                    ...segmentChart.layout,
                    font: { family: MONO, color: "#1a365d", size: 12 },
                    margin: { l: 40, r: 20, t: 40, b: 40 },
                  }}
                />
              </section>

              <section>
                <h2 className="font-display text-2xl mb-1">Risk Profile Radar</h2>
                <p className="font-sans text-sm text-grey-text mb-4">
                  The distinct "shape" of a high-risk vs low-risk lifestyle across all factors.
                </p>
                <PlotlyChart
                  data={radarChart.data}
                  height={350}
                  layout={{
                    ...radarChart.layout,
                    font: { family: MONO, color: "#1a365d", size: 12 },
                    margin: { l: 40, r: 40, t: 40, b: 40 },
                  }}
                />
              </section>
            </div>
          </div>
        </div>

        <p className="font-mono text-[11px] text-grey-text mt-6">
          Source: RandomForest feature importances from model.ipynb · trained on
          developer_burnout_dataset_7000.csv
        </p>
      </main>
    </div>
  );
}

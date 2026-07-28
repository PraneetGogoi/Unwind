"use client";

import { PlotlyChart } from "@/components/PlotlyChart";

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
  const levels = ["Low", "Medium", "High"] as const;

  const distributionData: Plotly.Data[] = [
    {
      type: "bar",
      x: [...levels],
      y: levels.map((l) => DISTRIBUTION[l]),
      marker: {
        color: levels.map((l) => RISK_COLORS[l]),
        line: { color: "#1a365d", width: 2 },
      },
      text: levels.map(
        (l) =>
          `${DISTRIBUTION[l].toLocaleString()}  (${((DISTRIBUTION[l] / TOTAL) * 100).toFixed(1)}%)`,
      ),
      textposition: "outside",
      hovertemplate: "%{x}: %{y:,} devs<extra></extra>",
    },
  ];

  const importanceData: Plotly.Data[] = [
    {
      type: "bar",
      orientation: "h",
      x: FEATURE_IMPORTANCE.map((f) => f.importance),
      y: FEATURE_IMPORTANCE.map((f) => prettify(f.feature)),
      marker: { color: "#1a365d", line: { color: "#1a365d", width: 0 } },
      text: FEATURE_IMPORTANCE.map((f) => f.importance.toFixed(3)),
      textposition: "outside",
      hovertemplate: "%{y}: %{x:.3f}<extra></extra>",
    },
  ];

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

        {/* model summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { k: "Developers", v: "7,000" },
            { k: "Best model", v: "Gradient Boosting" },
            { k: "Accuracy", v: "98.7%" },
            { k: "ROC-AUC", v: "0.996" },
          ].map((s) => (
            <div key={s.k} className="brutal-card bg-paper p-4">
              <div className="font-mono text-[11px] uppercase tracking-wide text-grey-text">
                {s.k}
              </div>
              <div className="font-display text-2xl mt-1">{s.v}</div>
            </div>
          ))}
        </div>

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
                Burnout Distribution
              </h2>
              <p className="font-sans text-sm text-grey-text mb-4">
                Most developers land at moderate risk; the high-risk tail is the
                group worth watching.
              </p>
              <PlotlyChart
                data={distributionData}
                height={340}
                layout={{
                  font: { family: MONO, color: "#1a365d", size: 12 },
                  showlegend: false,
                  bargap: 0.45,
                  margin: { l: 60, r: 20, t: 20, b: 40 },
                  yaxis: { title: { text: "Developers" }, rangemode: "tozero" },
                  xaxis: { title: { text: "" } },
                }}
              />
            </section>

            <section>
              <h2 className="font-display text-2xl mb-1">Feature Importance</h2>
              <p className="font-sans text-sm text-grey-text mb-4">
                Stress level dominates — it alone accounts for ~62% of the
                model&apos;s decisions. Cognitive load and work-life balance are
                distant seconds.
              </p>
              <PlotlyChart
                data={importanceData}
                height={520}
                layout={{
                  font: { family: MONO, color: "#1a365d", size: 12 },
                  showlegend: false,
                  margin: { l: 150, r: 50, t: 20, b: 40 },
                  xaxis: { title: { text: "Importance" }, rangemode: "tozero" },
                  yaxis: { automargin: true },
                }}
              />
            </section>
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

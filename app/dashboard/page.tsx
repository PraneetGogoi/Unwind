"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, AlertCircle } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { getSignalAveragesChart, getBoxPlotChart, getSegmentChart, getRadarChart, getCorrelationHeatmap } from "@/lib/charts";
import { useTheme } from "@/components/theme-provider";

const PlotlyChart = dynamic(
  () => import("@/components/PlotlyChart").then((mod) => mod.PlotlyChart),
  { ssr: false }
);

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

function getFeatureChart(fontColor: string) {
  return {
    data: [
      {
        type: "bar",
        x: FEATURE_IMPORTANCE.map((f) => f.importance),
        y: FEATURE_IMPORTANCE.map((f) => prettify(f.feature)),
        orientation: "h",
        marker: {
          color: FEATURE_IMPORTANCE.map((f) =>
            f.feature === "stress_level"
              ? "#f87171"
              : f.importance > 0.04
              ? "#fbbf24"
              : "#94a3b8"
          ),
        },
      },
    ],
    layout: {
      title: { text: "What Drives Burnout (Feature Importance)" },
      margin: { l: 150, r: 20, t: 40, b: 40 },
      xaxis: { title: { text: "Importance Score (0-1)" } },
      font: { family: MONO, color: fontColor, size: 12 },
      annotations: [
        {
          x: 0.615,
          y: "Stress Level",
          xref: "x",
          yref: "y",
          text: "This single feature drives >60% of risk",
          showarrow: true,
          arrowhead: 2,
          ax: -40,
          ay: 40,
          font: { size: 11, color: fontColor },
          arrowcolor: fontColor,
          bgcolor: fontColor === "#fdfbf7" ? "#222" : "#fff",
          bordercolor: fontColor,
          borderwidth: 1,
          borderpad: 4
        }
      ]
    },
  };
}

// Simple heuristic to give the user a visceral percentile feel
function getStressPercentile(stress: number) {
  // Approximate based on dataset median (~50)
  if (stress > 80) return "higher than 85%";
  if (stress > 60) return "higher than 65%";
  if (stress > 40) return "about average for";
  if (stress > 20) return "lower than 75%";
  return "lower than 90%";
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const [predictionData, setPredictionData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("you-vs-data");

  const fontColor = theme === "dark" ? "#fdfbf7" : "#1a365d";

  useEffect(() => {
    const saved = localStorage.getItem("unwind_latest_prediction");
    if (saved) {
      try {
        setPredictionData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse prediction", e);
      }
    }
  }, []);

  const userMetrics = predictionData?.inputs;
  const prediction = predictionData?.result?.prediction;
  const topDrivers = predictionData?.result?.top_drivers || [];

  const signalChart = getSignalAveragesChart(userMetrics);
  const boxChart = getBoxPlotChart(userMetrics);
  const segmentChart = getSegmentChart();
  const radarChart = getRadarChart();
  const featureChart = getFeatureChart(fontColor);
  const correlationChart = getCorrelationHeatmap(fontColor);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dots-bg text-ink selection:bg-ink selection:text-paper">
      <main className="max-w-5xl mx-auto px-4 py-16">
        
        {/* Empty State */}
        {!predictionData && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="font-display text-5xl md:text-7xl mb-4">Burnout Analytics</h1>
            <div className="brutal-card bg-paper border-2 border-ink shadow-hard p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 text-high font-mono font-bold uppercase tracking-widest mb-4">
                  <AlertCircle className="w-5 h-5" />
                  Missing Baseline
                </div>
                <h2 className="font-display text-3xl mb-4">You haven't run a prediction yet.</h2>
                <p className="font-sans text-lg text-grey-text">
                  The dashboard is most powerful when it can compare your specific habits against the 7,000 developers in our dataset. 
                  Run a quick assessment to unlock personalized insights and see exactly where you stand.
                </p>
              </div>
              <Link href="/predict" className="brutal-btn brutal-btn-primary px-8 py-4 font-bold text-lg whitespace-nowrap">
                Predict My Risk
              </Link>
            </div>
          </div>
        )}

        {/* Personalized Synthesis Header */}
        {predictionData && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 text-ink font-mono font-bold uppercase tracking-widest mb-4">
              <Activity className="w-5 h-5" />
              Your Insights
            </div>
            <h1 className="font-display text-4xl md:text-5xl leading-tight mb-6">
              Your overall risk is <span className={prediction === "High" ? "text-high" : prediction === "Medium" ? "text-medium" : "text-low"}>{prediction}</span>. 
              Your stress level is {getStressPercentile(userMetrics.stress_level)} the population.
            </h1>
            
            {topDrivers.length > 0 && (
              <p className="font-sans text-xl text-grey-text mb-8">
                Your highest driving risk factors right now are <strong>{prettify(topDrivers[0].feature)}</strong> and <strong>{topDrivers[1] ? prettify(topDrivers[1].feature) : "Cognitive Load"}</strong>.
              </p>
            )}

            <div className="flex gap-4">
              <Link href="/tips" className="brutal-btn brutal-btn-primary px-6 py-3 font-bold flex items-center gap-2">
                View Action Plan <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Tabbed Charts */}
        <div className="brutal-card bg-paper border-2 border-ink shadow-hard animate-in fade-in zoom-in-95 duration-500">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            {/* Fake browser chrome acting as Tab list */}
            <div className="border-b-2 border-ink bg-frame flex flex-col md:flex-row items-start md:items-center justify-between pl-4">
              <div className="flex gap-2 py-4 md:py-0">
                <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
                <div className="w-3 h-3 rounded-full border-2 border-ink bg-paper"></div>
              </div>
              
              <Tabs.List className="flex flex-1 md:justify-center w-full md:w-auto overflow-x-auto hide-scrollbar">
                <Tabs.Trigger 
                  value="you-vs-data" 
                  className="px-6 py-4 font-mono font-bold uppercase text-sm tracking-wide border-l-2 md:border-x-2 border-transparent data-[state=active]:border-ink data-[state=active]:bg-paper data-[state=active]:border-b-paper data-[state=active]:mb-[-2px] hover:bg-ink/5 transition-colors whitespace-nowrap"
                >
                  You vs Data
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="population" 
                  className="px-6 py-4 font-mono font-bold uppercase text-sm tracking-wide border-r-2 border-transparent data-[state=active]:border-ink data-[state=active]:bg-paper data-[state=active]:border-b-paper data-[state=active]:mb-[-2px] hover:bg-ink/5 transition-colors whitespace-nowrap"
                >
                  Population
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="drivers" 
                  className="px-6 py-4 font-mono font-bold uppercase text-sm tracking-wide border-r-2 border-transparent data-[state=active]:border-ink data-[state=active]:bg-paper data-[state=active]:border-b-paper data-[state=active]:mb-[-2px] hover:bg-ink/5 transition-colors whitespace-nowrap"
                >
                  Burnout Drivers
                </Tabs.Trigger>
              </Tabs.List>
            </div>

            {/* Tab Contents */}
            <div className="p-4 md:p-8">
              
              <Tabs.Content value="you-vs-data" className="flex flex-col gap-12 animate-in fade-in duration-500">
                {!predictionData ? (
                  <div className="text-center py-20 text-muted-foreground font-mono">
                    Data unavailable. Run a prediction first.
                  </div>
                ) : (
                  <>
                    <section>
                      <h2 className="font-display text-2xl mb-1">Risk Profile Radar</h2>
                      <p className="font-sans text-sm text-grey-text mb-4">
                        The distinct "shape" of your lifestyle compared to the high/low risk averages.
                      </p>
                      <div className="border-2 border-ink bg-dots-bg/50 p-2">
                        <PlotlyChart
                          data={radarChart.data}
                          height={450}
                          layout={{
                            ...radarChart.layout,
                            font: { family: MONO, color: fontColor, size: 12 },
                            margin: { l: 40, r: 40, t: 40, b: 40 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent'
                          }}
                        />
                      </div>
                    </section>

                    <section>
                      <h2 className="font-display text-2xl mb-1">Signal Averages</h2>
                      <p className="font-sans text-sm text-grey-text mb-4">
                        See where your exact metrics (blue star) land relative to burnout cohorts.
                      </p>
                      <div className="border-2 border-ink bg-dots-bg/50 p-2">
                        <PlotlyChart
                          data={signalChart.data as any}
                          height={400}
                          layout={{
                            ...signalChart.layout,
                            font: { family: MONO, color: fontColor, size: 12 },
                            margin: { l: 60, r: 20, t: 40, b: 40 },
                            yaxis: { rangemode: "tozero" },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent'
                          }}
                        />
                      </div>
                    </section>
                  </>
                )}
              </Tabs.Content>

              <Tabs.Content value="population" className="flex flex-col gap-12 animate-in fade-in duration-500">
                <section>
                  <h2 className="font-display text-2xl mb-1">Stress Distribution (Spread)</h2>
                  <p className="font-sans text-sm text-grey-text mb-4">
                    Box plots showing the median and quartiles of stress levels across the three burnout groups.
                  </p>
                  <div className="border-2 border-ink bg-dots-bg/50 p-2">
                    <PlotlyChart
                      data={boxChart.data as any}
                      height={400}
                      layout={{
                        ...boxChart.layout,
                        font: { family: MONO, color: fontColor, size: 12 },
                        margin: { l: 60, r: 20, t: 40, b: 40 },
                        yaxis: { rangemode: "tozero" },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent'
                      }}
                    />
                  </div>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-1">Risk by Experience Segment</h2>
                  <p className="font-sans text-sm text-grey-text mb-4">
                    Seniors and Principals make up a distinct proportion of burnout groups.
                  </p>
                  <div className="border-2 border-ink bg-dots-bg/50 p-2">
                    <PlotlyChart
                      data={segmentChart.data as any}
                      height={400}
                      layout={{
                        ...segmentChart.layout,
                        font: { family: MONO, color: fontColor, size: 12 },
                        margin: { l: 40, r: 20, t: 40, b: 40 },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent'
                      }}
                    />
                  </div>
                </section>
              </Tabs.Content>

              <Tabs.Content value="drivers" className="animate-in fade-in duration-500">
                <section>
                  <h2 className="font-display text-2xl mb-1">Global Feature Importance</h2>
                  <p className="font-sans text-sm text-grey-text mb-4">
                    The relative weight of each habit in driving burnout across all 7,000 developers.
                  </p>
                  <div className="border-2 border-ink bg-dots-bg/50 p-2">
                    <PlotlyChart
                      data={featureChart.data as any}
                      height={500}
                      layout={{
                        ...featureChart.layout,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent'
                      }}
                    />
                  </div>
                </section>

                <section className="mt-12">
                  <h2 className="font-display text-2xl mb-1">Behavioral Correlation Matrix</h2>
                  <p className="font-sans text-sm text-grey-text mb-4">
                    Explore which habits move together. For instance, notice how High Meetings closely correlate with High Stress.
                  </p>
                  <div className="border-2 border-ink bg-dots-bg/50 p-2 overflow-x-auto">
                    <PlotlyChart
                      data={correlationChart.data as any}
                      height={600}
                      layout={{
                        ...correlationChart.layout,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent'
                      }}
                    />
                  </div>
                </section>
              </Tabs.Content>

            </div>
          </Tabs.Root>
        </div>

        <p className="font-mono text-[11px] text-grey-text mt-6 text-center">
          Source: RandomForest metrics from model.ipynb · trained on
          developer_burnout_dataset_7000.csv
        </p>
      </main>
    </div>
  );
}

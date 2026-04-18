import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PlotlyChart } from "@/components/PlotlyChart";
import { loadBurnoutData, Row, BURNOUT_COLORS, BURNOUT_ORDER, mean, groupBy } from "@/lib/burnout-data";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Brain, Coffee, Moon } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Unwind" },
      { name: "description", content: "Interactive analytics on developer burnout: distributions, correlations, tiers." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => { loadBurnoutData().then(setRows); }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Live analytics</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">The state of developer burnout.</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Every chart is interactive — hover, zoom, pan, and download. Data: 7,000 cleaned developer records.
          </p>
        </header>

        {!rows ? <DashboardSkeleton /> : <Charts rows={rows} />}
      </div>
    </AppLayout>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint?: string }) {
  return (
    <Card className="p-5 shadow-soft border-0 glass">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="font-display text-3xl mt-3">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </Card>
  );
}

function Charts({ rows }: { rows: Row[] }) {
  const stats = useMemo(() => ({
    avgStress: mean(rows.map(r => r.stress_level)).toFixed(1),
    avgSleep: mean(rows.map(r => r.sleep_hours)).toFixed(2),
    avgWork: mean(rows.map(r => r.daily_work_hours)).toFixed(2),
    avgCaffeine: mean(rows.map(r => r.caffeine_intake)).toFixed(2),
    highPct: ((rows.filter(r => r.burnout_level === "High").length / rows.length) * 100).toFixed(0),
  }), [rows]);

  // 1. Distribution donut
  const distCounts = BURNOUT_ORDER.map(l => rows.filter(r => r.burnout_level === l).length);
  const distData = [{
    type: "pie", hole: 0.6,
    labels: [...BURNOUT_ORDER], values: distCounts,
    marker: { colors: BURNOUT_ORDER.map(l => BURNOUT_COLORS[l]) },
    textinfo: "label+percent", textposition: "outside",
  }] as Plotly.Data[];

  // 2. Avg stress by experience tier
  const tierGroups = groupBy(rows, r => r.exp_tier);
  const tierOrder = ["Junior", "Mid", "Senior", "Principal"].filter(t => tierGroups[t]);
  const tierData: Plotly.Data[] = BURNOUT_ORDER.map(level => ({
    type: "bar", name: level,
    x: tierOrder,
    y: tierOrder.map(t => tierGroups[t].filter(r => r.burnout_level === level).length),
    marker: { color: BURNOUT_COLORS[level] },
  }));

  // 3. Sleep vs stress scatter
  const scatterData: Plotly.Data[] = BURNOUT_ORDER.map(level => {
    const sub = rows.filter(r => r.burnout_level === level);
    return {
      type: "scattergl", mode: "markers", name: level,
      x: sub.map(r => r.sleep_hours),
      y: sub.map(r => r.stress_level),
      marker: { color: BURNOUT_COLORS[level], size: 6, opacity: 0.55 },
    };
  });

  // 4. Box: work hours by burnout level
  const boxData: Plotly.Data[] = BURNOUT_ORDER.map(level => ({
    type: "box", name: level,
    y: rows.filter(r => r.burnout_level === level).map(r => r.daily_work_hours),
    marker: { color: BURNOUT_COLORS[level] }, boxmean: true,
  }));

  // 5. Correlation heatmap (selected numeric features)
  const features = ["daily_work_hours", "sleep_hours", "caffeine_intake", "bugs_per_day", "commits_per_day", "meetings_per_day", "screen_time", "exercise_hours", "stress_level"] as const;
  const matrix = features.map(a => features.map(b => corr(rows.map(r => r[a] as number), rows.map(r => r[b] as number))));
  const heatData: Plotly.Data[] = [{
    type: "heatmap",
    z: matrix, x: [...features], y: [...features],
    colorscale: [[0, "#3498db"], [0.5, "#f7f7f7"], [1, "#e74c3c"]],
    zmin: -1, zmax: 1,
  }];

  // 6. Age group avg stress
  const ageOrder = ["20-25", "26-30", "31-35", "36-40", "41-44"];
  const ageGroups = groupBy(rows, r => r.age_group);
  const ageData: Plotly.Data[] = [{
    type: "bar",
    x: ageOrder.filter(g => ageGroups[g]),
    y: ageOrder.filter(g => ageGroups[g]).map(g => mean(ageGroups[g].map(r => r.stress_level))),
    marker: { color: ageOrder.filter(g => ageGroups[g]).map((_, i) => `hsl(${190 + i * 25}, 60%, 55%)`) },
    text: ageOrder.filter(g => ageGroups[g]).map(g => mean(ageGroups[g].map(r => r.stress_level)).toFixed(1)),
    textposition: "outside",
  }];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Activity} label="Avg stress" value={stats.avgStress} hint="0–100 scale" />
        <Stat icon={Moon} label="Avg sleep" value={`${stats.avgSleep}h`} />
        <Stat icon={Brain} label="Avg work" value={`${stats.avgWork}h/day`} />
        <Stat icon={Coffee} label="High burnout" value={`${stats.highPct}%`} hint="of all developers" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Burnout distribution" subtitle="Share of developers by level">
          <PlotlyChart data={distData} height={340} />
        </ChartCard>
        <ChartCard title="Burnout by experience tier" subtitle="Stacked counts across career stages">
          <PlotlyChart data={tierData} layout={{ barmode: "stack" }} height={340} />
        </ChartCard>
        <ChartCard title="Sleep vs stress" subtitle="Each dot is a developer. Less sleep → more stress.">
          <PlotlyChart data={scatterData} layout={{ xaxis: { title: { text: "Sleep (h)" } }, yaxis: { title: { text: "Stress (0–100)" } } }} height={380} />
        </ChartCard>
        <ChartCard title="Daily work hours by burnout" subtitle="Box plot — medians, quartiles, outliers">
          <PlotlyChart data={boxData} layout={{ yaxis: { title: { text: "Work hours" } } }} height={380} />
        </ChartCard>
        <ChartCard title="Feature correlation" subtitle="Pearson r — red=positive, blue=negative" className="lg:col-span-2">
          <PlotlyChart data={heatData} height={460} />
        </ChartCard>
        <ChartCard title="Average stress by age group" subtitle="Where in a career does pressure peak?" className="lg:col-span-2">
          <PlotlyChart data={ageData} layout={{ yaxis: { title: { text: "Avg stress" } } }} height={340} />
        </ChartCard>
      </div>
    </>
  );
}

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`p-5 shadow-soft border-0 glass ${className}`}>
      <div className="mb-3">
        <h3 className="font-display text-xl">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

function corr(x: number[], y: number[]) {
  const n = Math.min(x.length, y.length);
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sx += x[i]; sy += y[i]; sxx += x[i] * x[i]; syy += y[i] * y[i]; sxy += x[i] * y[i]; }
  const num = n * sxy - sx * sy;
  const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
  return den === 0 ? 0 : num / den;
}

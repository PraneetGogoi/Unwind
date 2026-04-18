import Papa from "papaparse";

export type Row = {
  age: number;
  experience_years: number;
  daily_work_hours: number;
  sleep_hours: number;
  caffeine_intake: number;
  bugs_per_day: number;
  commits_per_day: number;
  meetings_per_day: number;
  screen_time: number;
  exercise_hours: number;
  stress_level: number;
  burnout_level: "Low" | "Medium" | "High";
  work_life_balance: number;
  productivity_ratio: number;
  cognitive_load: number;
  caffeine_per_sleep: number;
  exp_tier: string;
  age_group: string;
};

let cache: Row[] | null = null;

export async function loadBurnoutData(): Promise<Row[]> {
  if (cache) return cache;
  const res = await fetch("/data/developer_burnout_cleaned.csv");
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
  cache = (parsed.data as Row[]).filter((r) => r && r.burnout_level);
  return cache;
}

export const BURNOUT_COLORS: Record<string, string> = {
  Low: "#2ecc71",
  Medium: "#f39c12",
  High: "#e74c3c",
};

export const BURNOUT_ORDER = ["Low", "Medium", "High"] as const;

export function groupBy<T, K extends string | number>(arr: T[], key: (t: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of arr) {
    const k = key(item);
    (out[k] ||= [] as T[]).push(item);
  }
  return out;
}

export function mean(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/* ── Rule-based burnout predictor (derived from notebook insights) ── */
export type PredictorInput = {
  daily_work_hours: number;
  sleep_hours: number;
  caffeine_intake: number;
  bugs_per_day: number;
  meetings_per_day: number;
  screen_time: number;
  exercise_hours: number;
};

export type PredictionResult = {
  level: "Low" | "Medium" | "High";
  score: number; // 0..100
  drivers: { label: string; impact: number }[];
};

export function predictBurnout(i: PredictorInput): PredictionResult {
  // Normalize each factor to 0..1 risk contribution
  const f = {
    work: clamp((i.daily_work_hours - 6) / 8),       // >14h = max
    sleep: clamp((7 - i.sleep_hours) / 5),           // <2h = max
    caffeine: clamp((i.caffeine_intake - 2) / 6),
    bugs: clamp(i.bugs_per_day / 20),
    meetings: clamp(i.meetings_per_day / 9),
    screen: clamp((i.screen_time - 6) / 12),
    exercise: clamp((1.5 - i.exercise_hours) / 1.5),
  };
  // Weighted sum (weights informed by notebook feature importance)
  const weights = { work: 0.22, sleep: 0.2, caffeine: 0.08, bugs: 0.12, meetings: 0.1, screen: 0.13, exercise: 0.15 };
  let score = 0;
  const drivers: { label: string; impact: number }[] = [];
  for (const k of Object.keys(weights) as (keyof typeof weights)[]) {
    const c = f[k] * weights[k];
    score += c;
    drivers.push({ label: prettyLabel(k), impact: Math.round(c * 100) });
  }
  drivers.sort((a, b) => b.impact - a.impact);
  const pct = Math.round(score * 100);
  const level: "Low" | "Medium" | "High" = pct < 35 ? "Low" : pct < 65 ? "Medium" : "High";
  return { level, score: pct, drivers: drivers.slice(0, 4) };
}

function clamp(v: number) { return Math.max(0, Math.min(1, v)); }
function prettyLabel(k: string) {
  return ({
    work: "Long work hours",
    sleep: "Sleep deficit",
    caffeine: "High caffeine",
    bugs: "Bug load",
    meetings: "Meeting overload",
    screen: "Screen time",
    exercise: "Low exercise",
  } as Record<string, string>)[k] ?? k;
}

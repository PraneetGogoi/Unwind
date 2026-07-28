import chartData from "./chart_data.json";

// Shared color palette matching the dataset analysis
const PALETTE = {
  Low: "#2ecc71",
  Medium: "#f39c12",
  High: "#e74c3c",
  User: "#3b82f6" // Blue for "You are here"
};

const BURNOUT_ORDER = ["Low", "Medium", "High"];

// 1. Signal Averages (Bar chart)
export function getSignalAveragesChart(userMetrics?: any) {
  const features = ["stress_level", "sleep_hours", "daily_work_hours"];
  const featureNames = ["Stress", "Sleep", "Work Hours"];
  
  const data: any[] = BURNOUT_ORDER.map(level => {
    return {
      x: featureNames,
      y: features.map(f => (chartData.signal_averages as any)[level][f]),
      name: level,
      type: "bar",
      marker: { color: PALETTE[level as keyof typeof PALETTE] }
    };
  });

  if (userMetrics) {
    data.push({
      x: featureNames,
      y: [userMetrics.stress_level, userMetrics.sleep_hours, userMetrics.daily_work_hours],
      name: "You",
      type: "scatter",
      mode: "markers",
      marker: { color: PALETTE.User, size: 16, symbol: "star" }
    });
  }

  return {
    data,
    layout: {
      barmode: "group",
      title: { text: "Average Signals by Risk Level" }
    }
  };
}

// 2. Box Plots (Spread of Cognitive Load)
export function getBoxPlotChart(userMetrics?: any) {
  const data: any[] = BURNOUT_ORDER.map(level => {
    const stats = (chartData.box_plots as any)[level].stress_level;
    return {
      type: "box",
      name: level,
      q1: [stats.q1],
      median: [stats.median],
      q3: [stats.q3],
      lowerfence: [stats.min],
      upperfence: [stats.max],
      marker: { color: PALETTE[level as keyof typeof PALETTE] }
    };
  });

  if (userMetrics) {
    data.push({
      x: ["You"],
      y: [userMetrics.stress_level],
      name: "You",
      type: "scatter",
      mode: "markers",
      marker: { color: PALETTE.User, size: 16, symbol: "star" }
    });
  }

  return {
    data,
    layout: {
      title: { text: "Stress Level Distribution" }
    }
  };
}

// 3. Burnout by Segment (Stacked Bar)
export function getSegmentChart() {
  const tiers = ["Junior", "Mid", "Senior", "Principal"];
  
  const data: any[] = BURNOUT_ORDER.map(level => {
    return {
      x: tiers,
      y: tiers.map(tier => (chartData.segments as any)[tier][level] || 0),
      name: level,
      type: "bar",
      marker: { color: PALETTE[level as keyof typeof PALETTE] }
    };
  });

  return {
    data,
    layout: {
      barmode: "stack",
      title: { text: "Burnout Risk by Experience Tier" }
    }
  };
}

// 4. Radar Profile
export function getRadarChart() {
  const features = ["daily_work_hours", "sleep_hours", "meetings_per_day", "stress_level", "bugs_per_day"];
  const displayNames = ["Work Hrs", "Sleep", "Meetings", "Stress", "Bugs"];
  
  const data: any[] = BURNOUT_ORDER.map(level => {
    const r = features.map(f => (chartData.radar as any)[level][f]);
    return {
      type: "scatterpolar",
      r: [...r, r[0]], // close the loop
      theta: [...displayNames, displayNames[0]],
      fill: "toself",
      name: level,
      line: { color: PALETTE[level as keyof typeof PALETTE] }
    };
  });

  return {
    data,
    layout: {
      polar: {
        radialaxis: { visible: false, range: [0, 1] }
      },
      title: { text: "Risk Profiles (Normalized)" }
    }
  };
}

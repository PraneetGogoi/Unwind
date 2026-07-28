"use client";

import { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";
import { useTheme } from "@/components/theme-provider";

type Props = {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  className?: string;
  height?: number;
};

export function PlotlyChart({
  data,
  layout,
  config,
  className,
  height = 360,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    const dark = theme === "dark";
    const baseLayout: Partial<Plotly.Layout> = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: {
        family: "'JetBrains Mono', ui-monospace, monospace",
        color: dark ? "#fdfbf7" : "#1a365d",
        size: 12,
      },
      margin: { l: 50, r: 20, t: 40, b: 50 },
      xaxis: {
        showgrid: false,
        zeroline: false,
        linecolor: dark ? "#fdfbf7" : "#1a365d",
        linewidth: 2,
        mirror: true,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        linecolor: dark ? "#fdfbf7" : "#1a365d",
        linewidth: 2,
        mirror: true,
      },
      legend: { bgcolor: "rgba(0,0,0,0)" },
      colorway: dark ? ["#fdfbf7", "#94a3b8"] : ["#1a365d", "#475569"],
      ...layout,
    };
    Plotly.newPlot(ref.current, data, baseLayout, {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"],
      ...config,
    });
    return () => {
      if (ref.current) Plotly.purge(ref.current);
    };
  }, [data, layout, config, theme]);

  return (
    <div ref={ref} className={className} style={{ width: "100%", height }} />
  );
}

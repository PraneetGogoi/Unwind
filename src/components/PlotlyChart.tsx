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

export function PlotlyChart({ data, layout, config, className, height = 360 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    const dark = theme === "dark";
    const baseLayout: Partial<Plotly.Layout> = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: {
        family: "Plus Jakarta Sans, system-ui, sans-serif",
        color: dark ? "#e6edf3" : "#1f2933",
        size: 12,
      },
      margin: { l: 50, r: 20, t: 40, b: 50 },
      xaxis: { gridcolor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", zerolinecolor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
      yaxis: { gridcolor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", zerolinecolor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
      legend: { bgcolor: "rgba(0,0,0,0)" },
      colorway: ["#2ecc71", "#f39c12", "#e74c3c", "#3498db", "#9b59b6", "#1abc9c"],
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

  return <div ref={ref} className={className} style={{ width: "100%", height }} />;
}

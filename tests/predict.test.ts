import { describe, it, expect, vi } from "vitest";
import { getSignalAveragesChart } from "../src/lib/charts";

// Mock the JSON data so we aren't dependent on the actual JSON contents for the basic structure test
vi.mock("../src/lib/chart_data.json", () => ({
  default: {
    signal_averages: {
      Low: { cognitive_load: 1, sleep_hours: 8, daily_work_hours: 7 },
      Medium: { cognitive_load: 3, sleep_hours: 7, daily_work_hours: 8 },
      High: { cognitive_load: 5, sleep_hours: 5, daily_work_hours: 10 },
    },
  },
}));

describe("Charts Logic", () => {
  it("should generate baseline signal averages without user metrics", () => {
    const chart = getSignalAveragesChart();
    expect(chart.data).toHaveLength(3); // Low, Medium, High
    expect(chart.data[0].name).toBe("Low");
    expect(chart.data[0].type).toBe("bar");
    expect(chart.layout.barmode).toBe("group");
  });

  it("should append user metrics as a scatter plot if provided", () => {
    const userMetrics = {
      cognitive_load: 4,
      sleep_hours: 6,
      daily_work_hours: 9,
    };
    const chart = getSignalAveragesChart(userMetrics);
    
    expect(chart.data).toHaveLength(4); // Low, Medium, High, You
    const userSeries = chart.data[3];
    expect(userSeries.name).toBe("You");
    expect(userSeries.type).toBe("scatter");
    expect(userSeries.y).toEqual([4, 6, 9]);
    expect(userSeries.marker.symbol).toBe("star");
  });
});

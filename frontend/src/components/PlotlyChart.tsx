import Plotly from "plotly.js-dist-min";
import { useRef, useEffect } from "react";

const PLOTLY_THEME = {
  colorway: ["#4F46E5", "#818CF8", "#A5B4FC", "#6366F1", "#312E81"],
  font: { family: "Inter, sans-serif", size: 12 },
  paper_bgcolor: "white",
  plot_bgcolor: "white",
  showlegend: false,
};

interface PlotlyChartProps {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
}

export function PlotlyChart({ data, layout }: PlotlyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      Plotly.newPlot(
        chartRef.current,
        data,
        { ...layout, ...PLOTLY_THEME, autosize: true },
        { responsive: true },
      );
    }
    return () => {
      if (chartRef.current) Plotly.purge(chartRef.current);
    };
  }, [data, layout]);

  return <div ref={chartRef} className="w-full" />;
}

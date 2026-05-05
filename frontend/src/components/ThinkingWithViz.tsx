import type Plotly from "plotly.js-dist-min";
import { ThinkingBlock } from "./ThinkingBlock";
import { PlotlyChart } from "./PlotlyChart";
import { DataTable } from "./DataTable";

export type Visualization =
  | {
      type: "figure";
      figure: { data: Plotly.Data[]; layout: Partial<Plotly.Layout> };
    }
  | {
      type: "table";
      columns: string[];
      rows: (string | number)[][];
      title: string;
    };

interface ThinkingWithVizProps {
  thinking: string;
  isStreaming: boolean;
  viz: Visualization;
}

export function ThinkingWithViz({
  thinking,
  isStreaming,
  viz,
}: ThinkingWithVizProps) {
  return (
    <>
      <div className="border rounded-lg p-3">
        <ThinkingBlock content={thinking} isStreaming={isStreaming} />
      </div>
      {viz.type === "figure" ? (
        <PlotlyChart data={viz.figure.data} layout={viz.figure.layout} />
      ) : (
        <DataTable columns={viz.columns} rows={viz.rows} title={viz.title} />
      )}
    </>
  );
}

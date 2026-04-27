import json
from typing import Literal

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pydantic_ai import RunContext

from agent.context import AgentContext


async def visualize(
    ctx: RunContext[AgentContext],
    code: str,
    title: str,
    result_type: Literal["figure", "table"],
    description: str,
) -> str:
    """Create a visualization from the last query result.

    Args:
        ctx: Injected context with current DataFrame.
        code: Python code to create the visualization.
              Use `df` for the data, `px` for plotly.express,
              `go` for plotly.graph_objects, `pd` for pandas.
              Must create a `fig` variable (for figures) or `result` variable (for tables).
        title: Title of the visualization.
        result_type: Either "figure" (Plotly chart) or "table" (formatted DataFrame).
        description: Description of what this visualization shows.
    """
    if ctx.deps.current_dataframe is None:
        return "Error: No data available. Call query_data first."

    df = ctx.deps.current_dataframe

    try:
        namespace = {
            "df": df.copy(),
            "pd": pd,
            "px": px,
            "go": go,
        }
        exec(code, namespace)

        if result_type == "figure":
            fig = namespace.get("fig")
            if fig is None:
                return "Error: Code must create a 'fig' variable (plotly Figure)."

            return json.dumps(
                {"type": "figure", "title": title, "figure": json.loads(fig.to_json())}
            )

        elif result_type == "table":
            result = namespace.get("result", df)

            return json.dumps(
                {
                    "type": "table",
                    "title": title,
                    "columns": result.columns.tolist(),
                    "rows": result.head(50).values.tolist(),
                }
            )

        else:
            return (
                f"Error: Unknown result_type '{result_type}'. Use 'figure' or 'table'."
            )

    except Exception as e:
        return f"Error creating visualization: {e}"

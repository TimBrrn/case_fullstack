from pathlib import Path
import re
import pandas as pd

# ---------------------------------------------------------------------------
# Dataset loading
# ---------------------------------------------------------------------------


def load_datasets(data_dir: str = "data") -> tuple[dict[str, pd.DataFrame], str]:
    """Load all CSV files from data_dir. Returns (datasets_dict, info_string)."""
    data_path = Path(data_dir)
    if not data_path.exists():
        data_path.mkdir(parents=True, exist_ok=True)
        return {}, "No datasets available."

    datasets: dict[str, pd.DataFrame] = {}
    info_lines: list[str] = []

    for csv_file in sorted(data_path.glob("*.csv")):
        # Sanitize name to be a valid SQL table name
        name = re.sub(r"[^a-zA-Z0-9_]", "_", csv_file.stem).strip("_").lower()
        df = pd.read_csv(csv_file)
        datasets[name] = df

        cols = ", ".join(df.columns.tolist())
        info_lines.append(
            f"- **{name}** ({df.shape[0]} rows, {df.shape[1]} columns)\n"
            f"  Columns: {cols}"
        )

    if not info_lines:
        return {}, "No datasets available. Add CSV files to the data/ directory."

    return datasets, "\n".join(info_lines)

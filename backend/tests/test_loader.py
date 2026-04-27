import pandas as pd
from agent.loader import load_datasets


class TestLoadDatasets:
    def test_single_csv(self, tmp_path):
        csv_file = tmp_path / "sales.csv"
        csv_file.write_text("product,price\nA,10\nB,20\n")

        datasets, info = load_datasets(str(tmp_path))

        assert "sales" in datasets
        assert datasets["sales"].shape == (2, 2)
        assert list(datasets["sales"].columns) == ["product", "price"]
        assert "sales" in info

    def test_multiple_csv(self, tmp_path):
        (tmp_path / "cars.csv").write_text("make,year\nToyota,2020\n")
        (tmp_path / "users.csv").write_text("name,age\nAlice,30\n")

        datasets, info = load_datasets(str(tmp_path))

        assert len(datasets) == 2
        assert "cars" in datasets
        assert "users" in datasets

    def test_add_new_csv(self, tmp_path):
        """Adding a new CSV file should be picked up by load_datasets."""
        (tmp_path / "initial.csv").write_text("col1,col2\n1,2\n")

        datasets_before, _ = load_datasets(str(tmp_path))
        assert len(datasets_before) == 1

        # Add a new CSV file
        (tmp_path / "new_data.csv").write_text("x,y,z\n10,20,30\n")

        datasets_after, info = load_datasets(str(tmp_path))
        assert len(datasets_after) == 2
        assert "new_data" in datasets_after
        assert datasets_after["new_data"].shape == (1, 3)

    def test_empty_directory(self, tmp_path):
        datasets, info = load_datasets(str(tmp_path))
        assert datasets == {}
        assert "No datasets" in info

    def test_nonexistent_directory(self, tmp_path):
        fake_path = tmp_path / "does_not_exist"
        datasets, info = load_datasets(str(fake_path))
        assert datasets == {}
        assert fake_path.exists()  # Directory was created

    def test_special_characters_in_filename(self, tmp_path):
        """Filenames with special characters should be sanitized to valid SQL names."""
        csv_file = tmp_path / "my-data (2).csv"
        csv_file.write_text("a,b\n1,2\n")

        datasets, _ = load_datasets(str(tmp_path))
        # Name must be sanitized: no dashes, no parentheses
        keys = list(datasets.keys())
        assert len(keys) == 1
        assert "-" not in keys[0]
        assert "(" not in keys[0]

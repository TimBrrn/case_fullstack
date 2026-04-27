interface DataTableProps {
  columns: string[];
  rows: (string | number)[][];
  title: string;
}

export function DataTable({ columns, rows, title }: DataTableProps) {
  return (
    <div>
      <p className="text-sm font-semibold mb-2">{title}</p>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="border border-gray-200 px-3 py-1 text-left bg-gray-50"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-gray-200 px-3 py-1">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

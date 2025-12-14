import { PivotResult, formatPivotValue } from '@/lib/reports/pivot-engine';
import { cn } from '@/lib/utils';

interface PivotTableProps {
  result: PivotResult | null;
  decimals?: number;
}

const PivotTable = ({ result, decimals = 2 }: PivotTableProps) => {
  if (!result || result.rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm border rounded-lg bg-gray-50">
        配置行维度和数值字段后，报表将在此显示
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            {result.headers.map((headerRow, rowIndex) => (
              <tr key={rowIndex} className="bg-[#F1F8F4]">
                {headerRow.map((header, colIndex) => (
                  <th
                    key={colIndex}
                    className={cn(
                      "h-10 px-3 text-left font-semibold text-gray-700 border-b-2 border-[#00B04D] whitespace-nowrap",
                      colIndex > 0 && "border-l border-gray-200"
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {result.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "border-b transition-colors",
                  row[0]?.isTotal || row[0]?.isGrandTotal
                    ? "bg-[#E8F0EC] font-semibold"
                    : "hover:bg-[#F8FBFA]"
                )}
              >
                {row.map((cell, colIndex) => {
                  const isNumeric = typeof cell.value === 'number';
                  const isNegative = isNumeric && (cell.value as number) < 0;
                  
                  return (
                    <td
                      key={colIndex}
                      rowSpan={cell.rowSpan}
                      colSpan={cell.colSpan}
                      className={cn(
                        "px-3 py-2.5 align-middle",
                        colIndex > 0 && "border-l border-gray-100",
                        isNumeric && "text-right font-mono",
                        isNegative && "text-red-600",
                        cell.isTotal && "font-medium",
                        cell.isGrandTotal && "font-bold text-[#00B04D]"
                      )}
                    >
                      {isNumeric ? formatPivotValue(cell.value, decimals) : cell.value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PivotTable;

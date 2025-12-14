import { useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ViewToggle } from "./ViewToggle";

interface ProvinceData {
  name: string;
  capacity: number;
  generation: number;
  color: string;
}

interface StationData {
  name: string;
  generation: number;
  province: string;
}

interface RegionalProductionChartProps {
  provinceData: ProvinceData[];
  stationData: StationData[];
}

export const RegionalProductionChart = ({ provinceData, stationData }: RegionalProductionChartProps) => {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  const totalCapacity = provinceData.reduce((sum, p) => sum + p.capacity, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex gap-2">
          <button
            className={`text-xs px-2 py-1 rounded ${chartType === "pie" ? "bg-blue-500/30 text-blue-300" : "text-gray-400 hover:text-gray-200"}`}
            onClick={() => setChartType("pie")}
          >
            装机分布
          </button>
          <button
            className={`text-xs px-2 py-1 rounded ${chartType === "bar" ? "bg-blue-500/30 text-blue-300" : "text-gray-400 hover:text-gray-200"}`}
            onClick={() => setChartType("bar")}
          >
            发电排名
          </button>
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {view === "chart" ? (
        chartType === "pie" ? (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={provinceData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="capacity"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "hsl(200, 15%, 50%)", strokeWidth: 1 }}
              >
                {provinceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} MW`, "装机容量"]}
                contentStyle={{
                  background: "hsla(210, 50%, 12%, 0.95)",
                  border: "1px solid hsla(200, 80%, 40%, 0.3)",
                  borderRadius: "4px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stationData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={55} />
              <Tooltip
                formatter={(value: number) => [`${value} 万kWh`, "发电量"]}
                contentStyle={{
                  background: "hsla(210, 50%, 12%, 0.95)",
                  border: "1px solid hsla(200, 80%, 40%, 0.3)",
                  borderRadius: "4px",
                }}
              />
              <Bar dataKey="generation" fill="hsl(149, 80%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      ) : (
        <div className="overflow-auto max-h-[180px]">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>省份/场站</th>
                <th className="text-right">装机(MW)</th>
                <th className="text-right">发电量(万kWh)</th>
                <th className="text-right">占比</th>
              </tr>
            </thead>
            <tbody>
              {provinceData.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td className="text-right font-mono">{p.capacity}</td>
                  <td className="text-right font-mono">{p.generation.toFixed(2)}</td>
                  <td className="text-right font-mono">{((p.capacity / totalCapacity) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

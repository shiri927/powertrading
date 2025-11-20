import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

// 生成价格数据
const generatePriceData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    dayAheadClearPrice: 300 + Math.random() * 200,
    realTimeClearPrice: 320 + Math.random() * 180,
    dayAheadPrice: 280 + Math.random() * 220,
    realTimePrice: 300 + Math.random() * 200,
  }));
};

// 生成电量数据
const generateVolumeData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    dayAheadClearVolume: 1000 + Math.random() * 500,
    realTimeClearVolume: 1100 + Math.random() * 600,
    dayAheadVolume: 950 + Math.random() * 550,
    realTimeVolume: 1050 + Math.random() * 650,
  }));
};

// 生成表格数据
const generateTableData = () => {
  const priceData = generatePriceData();
  const volumeData = generateVolumeData();
  return priceData.map((price, i) => ({
    ...price,
    ...volumeData[i],
  }));
};

const priceChartConfig = {
  dayAheadClearPrice: {
    label: "日前出清电价",
    color: "#3b82f6",
  },
  realTimeClearPrice: {
    label: "实时出清电价",
    color: "#ef4444",
  },
  dayAheadPrice: {
    label: "日前电价",
    color: "#3b82f6",
  },
  realTimePrice: {
    label: "实时电价",
    color: "#ef4444",
  },
};

const volumeChartConfig = {
  dayAheadClearVolume: {
    label: "日前出清电量",
    color: "#3b82f6",
  },
  realTimeClearVolume: {
    label: "实时出清电量",
    color: "#ef4444",
  },
  dayAheadVolume: {
    label: "日前电量",
    color: "#3b82f6",
  },
  realTimeVolume: {
    label: "实时电量",
    color: "#ef4444",
  },
};

const Clearing = () => {
  const priceData = generatePriceData();
  const volumeData = generateVolumeData();
  const tableData = generateTableData();

  return (
    <div className="p-8 space-y-6 bg-[#1a1d21] min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-white">出清管理</h1>
        <p className="text-gray-400 mt-2">
          分时段交易、省内外现货出清结果管理
        </p>
      </div>

      {/* 价格图表 */}
      <Card className="bg-[#25282d] border-[#3a3d45]">
        <CardHeader>
          <CardTitle className="text-white text-lg">出清电价</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={priceChartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3d45" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line 
                  type="monotone" 
                  dataKey="dayAheadClearPrice" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="realTimeClearPrice" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="dayAheadPrice" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="realTimePrice" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 电量图表 */}
      <Card className="bg-[#25282d] border-[#3a3d45]">
        <CardHeader>
          <CardTitle className="text-white text-lg">出清电量</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={volumeChartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={volumeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3d45" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area 
                  type="monotone" 
                  dataKey="dayAheadClearVolume" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="realTimeClearVolume" 
                  fill="#ef4444" 
                  fillOpacity={0.3}
                  stroke="#ef4444"
                  strokeWidth={2}
                />
                <Bar 
                  dataKey="dayAheadVolume" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="realTimeVolume" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card className="bg-[#25282d] border-[#3a3d45]">
        <CardHeader>
          <CardTitle className="text-white text-lg">详细数据</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[#3a3d45]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#2d3139] hover:bg-[#2d3139] border-[#3a3d45]">
                  <TableHead className="text-gray-300 font-semibold text-xs">时段</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-xs text-right">日前出清电价</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-xs text-right">实时出清电价</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-xs text-right">日前电价</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-xs text-right">实时电价</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-xs text-right">日前出清电量</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-xs text-right">实时出清电量</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-xs text-right">日前电量</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-xs text-right">实时电量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow 
                    key={index} 
                    className="bg-[#25282d] hover:bg-[#2d3139] border-[#3a3d45]"
                  >
                    <TableCell className="text-gray-300 font-medium">{row.time}</TableCell>
                    <TableCell className="text-gray-300 font-mono text-right text-xs">
                      {row.dayAheadClearPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono text-right text-xs">
                      {row.realTimeClearPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono text-right text-xs">
                      {row.dayAheadPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono text-right text-xs">
                      {row.realTimePrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono text-right text-xs">
                      {row.dayAheadClearVolume.toFixed(0)}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono text-right text-xs">
                      {row.realTimeClearVolume.toFixed(0)}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono text-right text-xs">
                      {row.dayAheadVolume.toFixed(0)}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono text-right text-xs">
                      {row.realTimeVolume.toFixed(0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clearing;

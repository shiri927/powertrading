import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { TrendingUp, Zap, BarChart3 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// 模拟用电量分析数据
const generateLoadAnalysisData = () => {
  return {
    byTimeSlot: [
      { name: "峰时段", value: 35, color: "#ef4444" },
      { name: "平时段", value: 40, color: "#f59e0b" },
      { name: "谷时段", value: 25, color: "#10b981" },
    ],
    byVoltage: [
      { name: "110kV", value: 28000, percentage: 45 },
      { name: "35kV", value: 19600, percentage: 32 },
      { name: "10kV", value: 14400, percentage: 23 },
    ],
    byCustomerType: [
      { type: "工业", load: 32000, percentage: 52, growth: 5.2 },
      { type: "商业", load: 18000, percentage: 29, growth: 3.8 },
      { type: "居民", load: 12000, percentage: 19, growth: 2.1 },
    ],
    hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      industrial: 1200 + Math.sin(i / 24 * Math.PI * 2) * 400,
      commercial: 700 + Math.sin(i / 24 * Math.PI * 2) * 200,
      residential: 450 + Math.sin((i - 6) / 24 * Math.PI * 2) * 150,
    })),
  };
};

const LoadAnalysis = () => {
  const [analysisData] = useState(generateLoadAnalysisData());

  const chartConfig = {
    industrial: { label: "工业", color: "#ef4444" },
    commercial: { label: "商业", color: "#f59e0b" },
    residential: { label: "居民", color: "#10b981" },
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">用电量分析</h1>
        <p className="text-muted-foreground mt-2">
          多维度用电数据分析
        </p>
      </div>

      <div className="space-y-4">
        {/* 分析指标概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">总用电量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">62,000</div>
              <p className="text-xs text-muted-foreground mt-1">MWh</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">代理用户数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">156</div>
              <p className="text-xs text-muted-foreground mt-1">户</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">户均用电量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">397</div>
              <p className="text-xs text-muted-foreground mt-1">MWh/户</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">环比增长</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-green-600">+4.2%</div>
              <p className="text-xs text-muted-foreground mt-1">较上月</p>
            </CardContent>
          </Card>
        </div>

        {/* 时段分析 & 电压等级分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                时段用电分布
              </CardTitle>
              <CardDescription>峰平谷时段电量占比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysisData.byTimeSlot}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analysisData.byTimeSlot.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {analysisData.byTimeSlot.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-mono">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                电压等级分布
              </CardTitle>
              <CardDescription>不同电压等级用电量统计</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisData.byVoltage} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#00B04D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2">
                {analysisData.byVoltage.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono">{item.value.toLocaleString()} MWh</span>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 客户类型分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">客户类型用电分析</CardTitle>
            <CardDescription>不同客户类型的用电量构成与增长情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="bg-[#F1F8F4]">
                  <tr className="border-b">
                    <th className="h-10 px-4 text-left align-middle font-semibold text-xs">客户类型</th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-xs">用电量 (MWh)</th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-xs">占比</th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-xs">同比增长</th>
                    <th className="h-10 px-4 text-center align-middle font-semibold text-xs">趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.byCustomerType.map((row, index) => (
                    <tr key={index} className="border-b transition-colors hover:bg-[#F8FBFA]">
                      <td className="p-4 align-middle font-medium">{row.type}</td>
                      <td className="p-4 align-middle text-right font-mono text-xs">{row.load.toLocaleString()}</td>
                      <td className="p-4 align-middle text-right font-mono text-xs">{row.percentage}%</td>
                      <td className="p-4 align-middle text-right font-mono text-xs text-green-600">+{row.growth}%</td>
                      <td className="p-4 align-middle text-center">
                        <TrendingUp className="h-4 w-4 text-green-600 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 24小时负荷分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">24小时负荷分布</CardTitle>
            <CardDescription>各客户类型分时段用电负荷曲线</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysisData.hourlyDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" label={{ value: '负荷 (MW)', angle: -90, position: 'insideLeft' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="industrial" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="commercial" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="residential" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoadAnalysis;

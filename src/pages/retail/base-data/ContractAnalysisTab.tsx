import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ComposedChart, ReferenceLine } from "recharts";
import { TrendingUp, BarChart3, FileText, Layers } from "lucide-react";

// 合同数据
const contractData = [
  { id: "C001", name: "2025年度中长期购电合同", tradingCenter: "山西交易中心", tradingUnit: "山东省场站A", type: "年度合同", startDate: "2025-01-01", endDate: "2025-12-31", volume: 50000, avgPrice: 385.5, status: "执行中" },
  { id: "C002", name: "省间现货月度合同", tradingCenter: "国家交易中心", tradingUnit: "山东省场站B", type: "月度合同", startDate: "2025-11-01", endDate: "2025-11-30", volume: 3200, avgPrice: 420.3, status: "执行中" },
  { id: "C003", name: "日滚动交易合同", tradingCenter: "山东交易中心", tradingUnit: "山西省场站A", type: "日滚动", startDate: "2025-11-20", endDate: "2025-11-21", volume: 800, avgPrice: 395.8, status: "已完成" },
  { id: "C004", name: "绿证交易合同", tradingCenter: "绿证交易平台", tradingUnit: "浙江省场站A", type: "绿证", startDate: "2025-11-01", endDate: "2025-12-31", volume: 1000, avgPrice: 50.0, status: "执行中" },
  { id: "C005", name: "省内现货双边合同", tradingCenter: "山西交易中心", tradingUnit: "山西省场站B", type: "现货双边", startDate: "2025-11-15", endDate: "2025-12-15", volume: 4500, avgPrice: 405.2, status: "执行中" },
];

// 仓位分析数据
const generatePositionData = () => 
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    volume: 800 + Math.random() * 400,
    avgPrice: 350 + Math.random() * 100,
    marketPrice: 360 + Math.random() * 90,
    contracts: Math.floor(2 + Math.random() * 3),
  }));

// 年度仓位数据
const generateYearlyPositionData = () => 
  Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}月`,
    volume: 8000 + Math.random() * 4000,
    avgPrice: 380 + Math.random() * 50,
    marketPrice: 390 + Math.random() * 45,
    settled: 7500 + Math.random() * 3500,
    remaining: 500 + Math.random() * 500,
  }));

// 多日仓位数据
const generateMultiDayPositionData = () => 
  Array.from({ length: 14 }, (_, i) => ({
    date: `12/${(i + 1).toString().padStart(2, '0')}`,
    volume: 300 + Math.random() * 200,
    avgPrice: 370 + Math.random() * 60,
    marketPrice: 375 + Math.random() * 55,
    settled: 280 + Math.random() * 180,
  }));

const chartConfig = {
  volume: { label: "持仓电量", color: "#00B04D" },
  avgPrice: { label: "加权均价", color: "#f59e0b" },
  marketPrice: { label: "市场均价", color: "#94a3b8" },
  settled: { label: "结算电量", color: "#3b82f6" },
  remaining: { label: "剩余仓位", color: "#10b981" },
};

const ContractAnalysisTab = () => {
  const [analysisParams, setAnalysisParams] = useState({ dimension: "unit", dateRange: "2025-11" });
  const [periodTab, setPeriodTab] = useState("monthly");
  const [aggregationDimension, setAggregationDimension] = useState("unit");

  const positionData = useMemo(() => generatePositionData(), []);
  const yearlyData = useMemo(() => generateYearlyPositionData(), []);
  const multiDayData = useMemo(() => generateMultiDayPositionData(), []);

  // 计算统计指标
  const totalVolume = contractData.reduce((sum, c) => sum + c.volume, 0);
  const weightedAvgPrice = contractData.reduce((sum, c) => sum + c.avgPrice * c.volume, 0) / totalVolume;
  const settledVolume = Math.round(totalVolume * 0.72);
  const remainingVolume = totalVolume - settledVolume;
  const uniqueUnits = new Set(contractData.map(c => c.tradingUnit)).size;

  return (
    <div className="space-y-4">
      {/* 分析条件 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">分析条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>日期范围</Label>
              <Input type="month" value={analysisParams.dateRange} onChange={(e) => setAnalysisParams({ ...analysisParams, dateRange: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button className="w-full"><TrendingUp className="h-4 w-4 mr-2" />分析</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计指标 - 6个卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="h-4 w-4" />合同总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{contractData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">活跃合同</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />总持仓电量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />加权平均电价
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{weightedAvgPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">元/MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Layers className="h-4 w-4" />覆盖交易单元
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{uniqueUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">个</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">结算电量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-700">{settledVolume.toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">MWh (72%)</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">剩余仓位</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-green-700">{remainingVolume.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">MWh (28%)</p>
          </CardContent>
        </Card>
      </div>

      {/* 聚合维度快捷按钮 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">数据聚合方式</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={aggregationDimension === "unit" ? "default" : "outline"} 
                size="sm"
                onClick={() => setAggregationDimension("unit")}
              >
                按交易单元
              </Button>
              <Button 
                variant={aggregationDimension === "period" ? "default" : "outline"} 
                size="sm"
                onClick={() => setAggregationDimension("period")}
              >
                按时段
              </Button>
              <Button 
                variant={aggregationDimension === "date" ? "default" : "outline"} 
                size="sm"
                onClick={() => setAggregationDimension("date")}
              >
                按日期
              </Button>
              <Button 
                variant={aggregationDimension === "type" ? "default" : "outline"} 
                size="sm"
                onClick={() => setAggregationDimension("type")}
              >
                按合同类型
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 仓位分析周期Tab */}
      <Tabs value={periodTab} onValueChange={setPeriodTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="yearly">年度仓位</TabsTrigger>
          <TabsTrigger value="monthly">月度仓位</TabsTrigger>
          <TabsTrigger value="multiday">多日仓位</TabsTrigger>
        </TabsList>

        {/* 年度仓位 */}
        <TabsContent value="yearly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" />年度持仓电量分布</CardTitle>
                <CardDescription>按月度展示持仓与结算电量</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="volume" fill="#00B04D" radius={[4, 4, 0, 0]} name="持仓电量" />
                      <Bar dataKey="settled" fill="#3b82f6" radius={[4, 4, 0, 0]} name="结算电量" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" />年度均价趋势</CardTitle>
                <CardDescription>持仓均价与市场均价对比</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="avgPrice" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="持仓均价" />
                      <Line type="monotone" dataKey="marketPrice" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="市场均价" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 月度仓位 */}
        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" />持仓电量分布</CardTitle>
                <CardDescription>24小时分时段持仓电量</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={positionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="volume" fill="#00B04D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" />持仓均价趋势</CardTitle>
                <CardDescription>24小时分时段均价与市场价对比</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={positionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="avgPrice" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="持仓均价" />
                      <Line type="monotone" dataKey="marketPrice" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="市场均价" />
                      <ReferenceLine y={weightedAvgPrice} stroke="#00B04D" strokeDasharray="3 3" label={{ value: '加权均价', fill: '#00B04D', fontSize: 10 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 多日仓位 */}
        <TabsContent value="multiday" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" />多日持仓电量</CardTitle>
                <CardDescription>近14日持仓与结算对比</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={multiDayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="volume" fill="#00B04D" radius={[4, 4, 0, 0]} name="持仓电量" />
                      <Bar dataKey="settled" fill="#3b82f6" radius={[4, 4, 0, 0]} name="结算电量" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" />多日均价趋势</CardTitle>
                <CardDescription>持仓均价与市场价格对比</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={multiDayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="avgPrice" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="持仓均价" />
                      <Line type="monotone" dataKey="marketPrice" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="市场均价" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 详细数据表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">仓位明细数据</CardTitle>
          <CardDescription>各时段持仓电量、均价及合同数量</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[400px] overflow-y-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                <tr className="border-b">
                  <th className="h-10 px-4 text-left align-middle font-semibold text-xs">时段</th>
                  <th className="h-10 px-4 text-right align-middle font-semibold text-xs">持仓电量 (MWh)</th>
                  <th className="h-10 px-4 text-right align-middle font-semibold text-xs">加权均价 (元/MWh)</th>
                  <th className="h-10 px-4 text-right align-middle font-semibold text-xs">市场均价 (元/MWh)</th>
                  <th className="h-10 px-4 text-right align-middle font-semibold text-xs">价差 (元/MWh)</th>
                  <th className="h-10 px-4 text-right align-middle font-semibold text-xs">合同数量</th>
                </tr>
              </thead>
              <tbody>
                {positionData.map((row, index) => {
                  const priceDiff = row.avgPrice - row.marketPrice;
                  return (
                    <tr key={index} className="border-b transition-colors hover:bg-[#F8FBFA]">
                      <td className="p-4 align-middle font-mono text-xs">{row.hour}</td>
                      <td className="p-4 align-middle text-right font-mono text-xs">{row.volume.toFixed(2)}</td>
                      <td className="p-4 align-middle text-right font-mono text-xs">{row.avgPrice.toFixed(2)}</td>
                      <td className="p-4 align-middle text-right font-mono text-xs">{row.marketPrice.toFixed(2)}</td>
                      <td className={`p-4 align-middle text-right font-mono text-xs ${priceDiff < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {priceDiff.toFixed(2)}
                      </td>
                      <td className="p-4 align-middle text-right font-mono text-xs">{row.contracts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractAnalysisTab;

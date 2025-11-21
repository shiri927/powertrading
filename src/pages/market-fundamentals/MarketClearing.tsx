import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/MetricCard";
import { MultiDateRangePicker, DateRange } from "@/components/MultiDateRangePicker";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from "recharts";
import { BarChart3, Table2, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import * as XLSX from "xlsx";
import { format, addHours, startOfDay } from "date-fns";

type TimeGranularity = "96" | "24" | "day" | "month";
type DataDisplay = "all" | "dayAhead" | "intraday";
type AnalysisMethod = "trend" | "comparison";
type DisplayFormat = "flat" | "grouped" | "summary";
type ViewMode = "chart" | "table";

interface ClearingDataPoint {
  time: string;
  dayAheadPrice: number;
  realtimePrice: number;
  regulatedPrice?: number;
  volume?: number;
  deviation?: number;
}

// Mock data generation functions
const generateClearingData = (
  granularity: TimeGranularity,
  dateRanges: DateRange[],
  displayFormat: DisplayFormat,
  dataDisplay: DataDisplay
): ClearingDataPoint[] => {
  const data: ClearingDataPoint[] = [];
  const pointsPerDay = granularity === "96" ? 96 : granularity === "24" ? 24 : 1;

  dateRanges.forEach((range) => {
    const daysDiff = Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let day = 0; day < daysDiff; day++) {
      const currentDate = new Date(range.start);
      currentDate.setDate(currentDate.getDate() + day);

      if (granularity === "day") {
        const dayAhead = 400 + Math.random() * 150;
        const realtime = dayAhead + (Math.random() - 0.5) * 80;
        data.push({
          time: format(currentDate, "yyyy-MM-dd"),
          dayAheadPrice: dayAhead,
          realtimePrice: realtime,
          regulatedPrice: dayAhead * 0.95,
          volume: 8000 + Math.random() * 4000,
          deviation: ((realtime - dayAhead) / dayAhead) * 100,
        });
      } else {
        for (let point = 0; point < pointsPerDay; point++) {
          const hour = granularity === "96" ? point * 0.25 : point;
          const basePrice = 350 + Math.sin((hour / 24) * Math.PI * 2) * 100 + Math.random() * 50;
          const dayAhead = basePrice + (Math.random() - 0.5) * 40;
          const realtime = basePrice + (Math.random() - 0.5) * 60;
          
          const timePoint = granularity === "96" 
            ? format(addHours(startOfDay(currentDate), Math.floor(hour)), "HH:mm")
            : `${String(point).padStart(2, '0')}:00`;

          data.push({
            time: displayFormat === "flat" ? `${format(currentDate, "MM-dd")} ${timePoint}` : timePoint,
            dayAheadPrice: dayAhead,
            realtimePrice: realtime,
            regulatedPrice: dayAhead * 0.95,
            volume: 300 + Math.random() * 200,
            deviation: ((realtime - dayAhead) / dayAhead) * 100,
          });
        }
      }
    }
  });

  // Apply display format aggregation
  if (displayFormat === "grouped" && granularity !== "day") {
    const grouped = new Map<string, ClearingDataPoint[]>();
    data.forEach(point => {
      const timeKey = point.time.split(' ')[1] || point.time;
      if (!grouped.has(timeKey)) grouped.set(timeKey, []);
      grouped.get(timeKey)!.push(point);
    });

    return Array.from(grouped.entries()).map(([time, points]) => ({
      time,
      dayAheadPrice: points.reduce((sum, p) => sum + p.dayAheadPrice, 0) / points.length,
      realtimePrice: points.reduce((sum, p) => sum + p.realtimePrice, 0) / points.length,
      regulatedPrice: points.reduce((sum, p) => sum + (p.regulatedPrice || 0), 0) / points.length,
      volume: points.reduce((sum, p) => sum + (p.volume || 0), 0) / points.length,
      deviation: points.reduce((sum, p) => sum + (p.deviation || 0), 0) / points.length,
    }));
  }

  if (displayFormat === "summary" && granularity !== "day") {
    const summary = new Map<string, ClearingDataPoint[]>();
    data.forEach(point => {
      const timeKey = point.time.includes(' ') ? point.time.split(' ')[1] : point.time;
      if (!summary.has(timeKey)) summary.set(timeKey, []);
      summary.get(timeKey)!.push(point);
    });

    return Array.from(summary.entries()).map(([time, points]) => ({
      time,
      dayAheadPrice: points.reduce((sum, p) => sum + p.dayAheadPrice, 0) / points.length,
      realtimePrice: points.reduce((sum, p) => sum + p.realtimePrice, 0) / points.length,
      regulatedPrice: points.reduce((sum, p) => sum + (p.regulatedPrice || 0), 0) / points.length,
      volume: points.reduce((sum, p) => sum + (p.volume || 0), 0) / points.length,
      deviation: points.reduce((sum, p) => sum + (p.deviation || 0), 0) / points.length,
    }));
  }

  return data;
};

const MarketClearing = () => {
  const [activeTab, setActiveTab] = useState("intra-price");
  const [dateRanges, setDateRanges] = useState<DateRange[]>([
    { start: new Date(2025, 10, 1), end: new Date(2025, 10, 10) }
  ]);
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>("24");
  const [dataDisplay, setDataDisplay] = useState<DataDisplay>("all");
  const [showRegulatedPrice, setShowRegulatedPrice] = useState(false);
  const [analysisMethod, setAnalysisMethod] = useState<AnalysisMethod>("trend");
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("flat");
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const [showDeviation, setShowDeviation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Generate data based on filters
  const chartData = useMemo(() => {
    return generateClearingData(timeGranularity, dateRanges, displayFormat, dataDisplay);
  }, [timeGranularity, dateRanges, displayFormat, dataDisplay]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (chartData.length === 0) return { maxDA: 0, minDA: 0, avgDA: 0, maxRT: 0, minRT: 0, avgRT: 0 };
    
    const dayAheadPrices = chartData.map(d => d.dayAheadPrice);
    const realtimePrices = chartData.map(d => d.realtimePrice);
    
    return {
      maxDA: Math.max(...dayAheadPrices),
      minDA: Math.min(...dayAheadPrices),
      avgDA: dayAheadPrices.reduce((a, b) => a + b, 0) / dayAheadPrices.length,
      maxRT: Math.max(...realtimePrices),
      minRT: Math.min(...realtimePrices),
      avgRT: realtimePrices.reduce((a, b) => a + b, 0) / realtimePrices.length,
    };
  }, [chartData]);

  // Sort and paginate data for table view
  const tableData = useMemo(() => {
    let sorted = [...chartData];
    
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof ClearingDataPoint];
        const bVal = b[sortConfig.key as keyof ClearingDataPoint];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [chartData, sortConfig, currentPage, pageSize]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(chartData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Market Clearing Data");
    XLSX.writeFile(wb, `market_clearing_${format(new Date(), "yyyyMMdd")}.xlsx`);
  };

  const handleQuery = () => {
    // Trigger data refresh by updating state
    setCurrentPage(1);
  };

  const handleReset = () => {
    setDateRanges([{ start: new Date(2025, 10, 1), end: new Date(2025, 10, 10) }]);
    setTimeGranularity("24");
    setDataDisplay("all");
    setShowRegulatedPrice(false);
    setAnalysisMethod("trend");
    setDisplayFormat("flat");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(chartData.length / pageSize);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">市场出清</h1>
        <p className="text-muted-foreground mt-2">
          市场出清价格与电量的多维度分析
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="intra-price">省内统一出清价格</TabsTrigger>
          <TabsTrigger value="intra-volume">省内出清电量</TabsTrigger>
          <TabsTrigger value="inter-price">省间统一出清价格</TabsTrigger>
          <TabsTrigger value="inter-power">省间出清电力</TabsTrigger>
          <TabsTrigger value="spot-overview">省内现货出清概况</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Filter Bar */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>选择日期</Label>
                  <MultiDateRangePicker value={dateRanges} onChange={setDateRanges} />
                </div>

                <div className="space-y-2">
                  <Label>时间颗粒度</Label>
                  <Select value={timeGranularity} onValueChange={(v) => setTimeGranularity(v as TimeGranularity)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="96">96点 (15分钟)</SelectItem>
                      <SelectItem value="24">24点 (1小时)</SelectItem>
                      <SelectItem value="day">日</SelectItem>
                      <SelectItem value="month">月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>数据展示</Label>
                  <Select value={dataDisplay} onValueChange={(v) => setDataDisplay(v as DataDisplay)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="dayAhead">日前</SelectItem>
                      <SelectItem value="intraday">日内</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="regulated" 
                    checked={showRegulatedPrice}
                    onCheckedChange={(checked) => setShowRegulatedPrice(checked as boolean)}
                  />
                  <Label htmlFor="regulated" className="cursor-pointer">查看调控后价格</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Label>分析方式:</Label>
                  <Tabs value={analysisMethod} onValueChange={(v) => setAnalysisMethod(v as AnalysisMethod)}>
                    <TabsList>
                      <TabsTrigger value="trend">趋势</TabsTrigger>
                      <TabsTrigger value="comparison">对比</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center gap-2">
                  <Label>展示形式:</Label>
                  <Tabs value={displayFormat} onValueChange={(v) => setDisplayFormat(v as DisplayFormat)}>
                    <TabsList>
                      <TabsTrigger value="flat">平铺展示</TabsTrigger>
                      <TabsTrigger value="grouped">分组聚合</TabsTrigger>
                      <TabsTrigger value="summary">汇总聚合</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button onClick={handleQuery}>查询</Button>
                  <Button variant="outline" onClick={handleReset}>重置</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="最大值"
              value={`¥${metrics.maxDA.toFixed(2)}`}
              description={`实时: ¥${metrics.maxRT.toFixed(2)}`}
              icon={TrendingUp}
              changeType="neutral"
            />
            <MetricCard
              title="最小值"
              value={`¥${metrics.minDA.toFixed(2)}`}
              description={`实时: ¥${metrics.minRT.toFixed(2)}`}
              icon={TrendingDown}
              changeType="neutral"
            />
            <MetricCard
              title="平均值"
              value={`¥${metrics.avgDA.toFixed(2)}`}
              description={`实时: ¥${metrics.avgRT.toFixed(2)}`}
              icon={Minus}
              changeType="neutral"
            />
          </div>

          {/* View Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {activeTab === "intra-price" && "省内统一出清价格"}
                  {activeTab === "intra-volume" && "省内出清电量"}
                  {activeTab === "inter-price" && "省间统一出清价格"}
                  {activeTab === "inter-power" && "省间出清电力"}
                  {activeTab === "spot-overview" && "省内现货出清概况"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeviation(!showDeviation)}
                  >
                    {showDeviation ? "隐藏偏差" : "显示偏差"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}
                  >
                    {viewMode === "chart" ? <Table2 className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    下载数据
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "chart" ? (
                <ResponsiveContainer width="100%" height={500}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      yAxisId="price"
                      label={{ value: '价格 (元/兆瓦时)', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 11 }}
                    />
                    {showDeviation && (
                      <YAxis 
                        yAxisId="deviation"
                        orientation="right"
                        label={{ value: '偏差 (%)', angle: 90, position: 'insideRight' }}
                        tick={{ fontSize: 11 }}
                      />
                    )}
                    <Tooltip />
                    <Legend />
                    {(dataDisplay === "all" || dataDisplay === "dayAhead") && (
                      <Line 
                        yAxisId="price"
                        type="monotone" 
                        dataKey="dayAheadPrice" 
                        stroke="#0088FE" 
                        name="日前价格"
                        strokeWidth={2}
                      />
                    )}
                    {(dataDisplay === "all" || dataDisplay === "intraday") && (
                      <Line 
                        yAxisId="price"
                        type="monotone" 
                        dataKey="realtimePrice" 
                        stroke="#00C49F" 
                        name="实时价格"
                        strokeWidth={2}
                      />
                    )}
                    {showRegulatedPrice && (
                      <Line 
                        yAxisId="price"
                        type="monotone" 
                        dataKey="regulatedPrice" 
                        stroke="#FF8042" 
                        strokeDasharray="5 5"
                        name="调控后价格"
                        strokeWidth={2}
                      />
                    )}
                    {showDeviation && (
                      <Bar 
                        yAxisId="deviation"
                        dataKey="deviation" 
                        fill="#FFBB28" 
                        name="偏差"
                        opacity={0.6}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-auto max-h-[500px]">
                    <table className="w-full">
                      <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                        <tr className="border-b-2 border-[#00B04D]">
                          <th className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-[#E8F0EC]" onClick={() => handleSort('time')}>
                            时间点 {sortConfig?.key === 'time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="text-right p-3 text-sm font-medium cursor-pointer hover:bg-[#E8F0EC]" onClick={() => handleSort('dayAheadPrice')}>
                            日前价格 (¥/MWh) {sortConfig?.key === 'dayAheadPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="text-right p-3 text-sm font-medium cursor-pointer hover:bg-[#E8F0EC]" onClick={() => handleSort('realtimePrice')}>
                            实时价格 (¥/MWh) {sortConfig?.key === 'realtimePrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          {showRegulatedPrice && (
                            <th className="text-right p-3 text-sm font-medium">调控后价格 (¥/MWh)</th>
                          )}
                          <th className="text-right p-3 text-sm font-medium cursor-pointer hover:bg-[#E8F0EC]" onClick={() => handleSort('deviation')}>
                            偏差 (%) {sortConfig?.key === 'deviation' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="text-right p-3 text-sm font-medium">电量 (MWh)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, index) => (
                          <tr key={index} className="border-b hover:bg-[#F8FBFA]">
                            <td className="p-3 text-sm">{row.time}</td>
                            <td className="p-3 text-sm text-right font-mono">¥{row.dayAheadPrice.toFixed(2)}</td>
                            <td className="p-3 text-sm text-right font-mono">¥{row.realtimePrice.toFixed(2)}</td>
                            {showRegulatedPrice && (
                              <td className="p-3 text-sm text-right font-mono">¥{row.regulatedPrice?.toFixed(2)}</td>
                            )}
                            <td className={`p-3 text-sm text-right font-mono ${
                              (row.deviation || 0) > 0 ? 'text-destructive' : (row.deviation || 0) < 0 ? 'text-[#00A86B]' : ''
                            }`}>
                              {row.deviation?.toFixed(2)}%
                            </td>
                            <td className="p-3 text-sm text-right font-mono">{row.volume?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      显示第 {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, chartData.length)} 条，共 {chartData.length} 条
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10条/页</SelectItem>
                          <SelectItem value="20">20条/页</SelectItem>
                          <SelectItem value="50">50条/页</SelectItem>
                          <SelectItem value="100">100条/页</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                      >
                        上一页
                      </Button>
                      <span className="text-sm">第 {currentPage} / {totalPages} 页</span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketClearing;

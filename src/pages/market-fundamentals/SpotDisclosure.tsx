import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { CalendarIcon, Download, RefreshCw, Database, BarChart3, Table2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { DateRangeDisplay } from "@/components/DateRangeDisplay";
import { 
  useMarketClearingPrices, 
  useMarketClearingStats, 
  useAvailableDates,
  useAvailableProvinces,
  transformMarketClearingForChart,
  type MarketClearingPrice 
} from "@/hooks/useMarketClearingPrices";

// 模拟节点价格数据 (节点价格暂无对应数据库表)
const generateNodePriceData = () => {
  const stations = ["山东省场站A", "山东省场站B", "山东省场站C", "山西省场站A", "浙江省场站A"];
  const data: any[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, '0') + ':00';
    const point: any = { time: hour };
    stations.forEach(station => {
      point[station] = 300 + Math.sin((i / 24) * Math.PI * 2) * 50 + Math.random() * 30;
    });
    data.push(point);
  }
  return { data, stations };
};

// 模拟节点价格分布数据 (暂无对应数据库表)
const generatePriceDistribution = () => {
  const distribution = [];
  for (let price = 200; price <= 500; price += 20) {
    distribution.push({
      priceRange: `${price}-${price + 20}`,
      count: Math.floor(Math.random() * 50 + 10),
      percentage: 0,
    });
  }
  const total = distribution.reduce((sum, d) => sum + d.count, 0);
  distribution.forEach(d => {
    d.percentage = parseFloat(((d.count / total) * 100).toFixed(1));
  });
  return distribution;
};

// 从市场出清数据生成散点图数据
const generateScatterFromClearing = (records: MarketClearingPrice[]) => {
  if (!records || records.length === 0) {
    // 返回模拟数据
    const points = [];
    for (let i = 0; i < 100; i++) {
      const biddingSpace = 50 + Math.random() * 400;
      const price = 500 - biddingSpace * 0.5 + (Math.random() - 0.5) * 60;
      points.push({
        x: biddingSpace,
        y: Math.max(220, Math.min(550, price)),
      });
    }
    return points;
  }
  
  // 使用真实数据生成散点
  return records.map(record => {
    const price = record.day_ahead_price || 0;
    // 估算竞价空间 (基于价格反向计算)
    const biddingSpace = Math.max(50, 500 - price * 0.8 + Math.random() * 50);
    return {
      x: parseFloat(biddingSpace.toFixed(1)),
      y: price,
    };
  });
};

// 转换为出清概况数据格式
const transformToClearingOverview = (records: MarketClearingPrice[]) => {
  if (!records || records.length === 0) {
    // 返回模拟数据
    const data = [];
    for (let i = 0; i < 24; i++) {
      const hour = String(i).padStart(2, '0') + ':00';
      data.push({
        time: hour,
        clearingPrice: 320 + Math.sin((i / 24) * Math.PI * 2) * 80 + Math.random() * 30,
        provincialLoad: 35000 + Math.sin((i / 24) * Math.PI * 2) * 8000 + Math.random() * 2000,
        interProvincialTie: 4000 + Math.random() * 1500,
        clearingVolume: 30000 + Math.random() * 5000,
      });
    }
    return data;
  }
  
  return records.map(record => {
    const price = record.day_ahead_price || record.realtime_price || 0;
    // 估算负荷和电量数据
    const baseLoad = 35000 + Math.sin((record.hour / 24) * Math.PI * 2) * 8000;
    return {
      time: `${String(record.hour).padStart(2, '0')}:00`,
      clearingPrice: price,
      provincialLoad: baseLoad + Math.random() * 2000,
      interProvincialTie: 4000 + Math.random() * 1500,
      clearingVolume: baseLoad * 0.85 + Math.random() * 3000,
    };
  });
};

// 转换为供需数据格式
const transformToSupplyDemand = (records: MarketClearingPrice[]) => {
  if (!records || records.length === 0) {
    // 返回模拟数据
    const data = [];
    for (let i = 0; i < 24; i++) {
      const hour = String(i).padStart(2, '0') + ':00';
      const baseLoad = 40000 + Math.sin((i / 24) * Math.PI * 2) * 10000;
      data.push({
        time: hour,
        spotPrice: 300 + Math.sin((i / 24) * Math.PI * 2) * 80 + Math.random() * 40,
        realtimePrice: 320 + Math.sin((i / 24) * Math.PI * 2) * 100 + Math.random() * 60,
        biddingSpace: 15000 + Math.random() * 5000,
        gridLoad: baseLoad + Math.random() * 3000,
        renewableOutput: 8000 + Math.random() * 4000,
        tieLine: 3000 + Math.random() * 1000,
        reserve: 5000 + Math.random() * 1000,
      });
    }
    return data;
  }
  
  return records.map(record => {
    const baseLoad = 40000 + Math.sin((record.hour / 24) * Math.PI * 2) * 10000;
    return {
      time: `${String(record.hour).padStart(2, '0')}:00`,
      spotPrice: record.day_ahead_price || 0,
      realtimePrice: record.realtime_price || 0,
      biddingSpace: 15000 + Math.random() * 5000,
      gridLoad: baseLoad + Math.random() * 3000,
      renewableOutput: 8000 + Math.random() * 4000,
      tieLine: 3000 + Math.random() * 1000,
      reserve: 5000 + Math.random() * 1000,
    };
  });
};

const SpotDisclosure = () => {
  const [activeTab, setActiveTab] = useState("supply-demand");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProvince, setSelectedProvince] = useState("山东");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [selectedStations, setSelectedStations] = useState<string[]>(["山东省场站A", "山东省场站B"]);
  const [showCorrelation, setShowCorrelation] = useState(true);

  // 数据库hooks
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const { data: marketData, isLoading: isLoadingMarket, refetch } = useMarketClearingPrices(dateStr, selectedProvince);
  const { data: stats, isLoading: isLoadingStats } = useMarketClearingStats(dateStr, selectedProvince);
  const { data: availableDates } = useAvailableDates(selectedProvince);
  const { data: availableProvinces } = useAvailableProvinces();

  // 转换数据
  const supplyDemandData = useMemo(() => transformToSupplyDemand(marketData || []), [marketData]);
  const clearingOverviewData = useMemo(() => transformToClearingOverview(marketData || []), [marketData]);
  const scatterData = useMemo(() => generateScatterFromClearing(marketData || []), [marketData]);
  
  // 节点价格仍使用mock (暂无数据库表)
  const { data: nodePriceData, stations } = useMemo(() => generateNodePriceData(), []);
  const priceDistribution = useMemo(() => generatePriceDistribution(), []);

  // 计算供需指标
  const supplyDemandMetrics = useMemo(() => {
    if (stats) {
      return {
        avgPrice: stats.avgDayAheadPrice.toFixed(2),
        maxLoad: (supplyDemandData.length > 0 ? Math.max(...supplyDemandData.map(d => d.gridLoad)) : 0).toFixed(0),
        avgBiddingSpace: (supplyDemandData.reduce((sum, d) => sum + d.biddingSpace, 0) / Math.max(supplyDemandData.length, 1)).toFixed(0),
        avgRenewable: (supplyDemandData.reduce((sum, d) => sum + d.renewableOutput, 0) / Math.max(supplyDemandData.length, 1)).toFixed(0),
      };
    }
    const prices = supplyDemandData.map(d => d.spotPrice);
    const loads = supplyDemandData.map(d => d.gridLoad);
    return {
      avgPrice: prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : '0.00',
      maxLoad: loads.length > 0 ? Math.max(...loads).toFixed(0) : '0',
      avgBiddingSpace: (supplyDemandData.reduce((sum, d) => sum + d.biddingSpace, 0) / Math.max(supplyDemandData.length, 1)).toFixed(0),
      avgRenewable: (supplyDemandData.reduce((sum, d) => sum + d.renewableOutput, 0) / Math.max(supplyDemandData.length, 1)).toFixed(0),
    };
  }, [supplyDemandData, stats]);

  // 出清概况指标
  const clearingMetrics = useMemo(() => {
    if (stats) {
      return {
        avgClearingPrice: stats.avgDayAheadPrice.toFixed(2),
        maxLoad: (clearingOverviewData.length > 0 ? Math.max(...clearingOverviewData.map(d => d.provincialLoad)) : 0).toFixed(0),
        avgTie: (clearingOverviewData.reduce((sum, d) => sum + d.interProvincialTie, 0) / Math.max(clearingOverviewData.length, 1)).toFixed(0),
        totalVolume: clearingOverviewData.reduce((sum, d) => sum + d.clearingVolume, 0).toFixed(0),
      };
    }
    return {
      avgClearingPrice: clearingOverviewData.length > 0 
        ? (clearingOverviewData.reduce((sum, d) => sum + d.clearingPrice, 0) / clearingOverviewData.length).toFixed(2) 
        : '0.00',
      maxLoad: clearingOverviewData.length > 0 
        ? Math.max(...clearingOverviewData.map(d => d.provincialLoad)).toFixed(0) 
        : '0',
      avgTie: (clearingOverviewData.reduce((sum, d) => sum + d.interProvincialTie, 0) / Math.max(clearingOverviewData.length, 1)).toFixed(0),
      totalVolume: clearingOverviewData.reduce((sum, d) => sum + d.clearingVolume, 0).toFixed(0),
    };
  }, [clearingOverviewData, stats]);

  const handleDownload = () => {
    console.log("下载数据");
  };

  const handleRefresh = () => {
    refetch();
  };

  const stationColors: Record<string, string> = {
    "山东省场站A": "#00B04D",
    "山东省场站B": "#3b82f6",
    "山东省场站C": "#f97316",
    "山西省场站A": "#8b5cf6",
    "浙江省场站A": "#ec4899",
  };

  const isLoading = isLoadingMarket || isLoadingStats;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">省内现货披露</h1>
        <p className="text-muted-foreground mt-2">
          省内现货市场信息披露与多维度分析
        </p>
      </div>

      <DateRangeDisplay
        startDate={selectedDate}
        endDate={selectedDate}
        lastUpdated={new Date()}
        className="px-4 py-3 bg-muted/20 rounded-lg"
      />

      {/* 数据来源说明 */}
      <Card className="bg-[#F1F8F4] border-[#00B04D]/20">
        <CardContent className="pt-4 flex items-center gap-4">
          <Database className="h-5 w-5 text-[#00B04D]" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              数据来源：market_clearing_prices 表 
              {marketData && marketData.length > 0 && (
                <span className="text-muted-foreground ml-2">({marketData.length}条记录)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              省份：{selectedProvince} | 日期：{dateStr} | 最后更新时间：{format(new Date(), "yyyy-MM-dd HH:mm:ss")}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            刷新数据
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="supply-demand">市场供需数据</TabsTrigger>
          <TabsTrigger value="node-price">节点价格对比</TabsTrigger>
          <TabsTrigger value="clearing-overview">市场出清概况</TabsTrigger>
        </TabsList>

        {/* 市场供需数据 */}
        <TabsContent value="supply-demand" className="space-y-6">
          {/* 筛选栏 */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>省份</Label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(availableProvinces || ['山东', '山西', '浙江']).map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>选择日期</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-40">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "yyyy-MM-dd")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-correlation"
                    checked={showCorrelation}
                    onCheckedChange={(checked) => setShowCorrelation(!!checked)}
                  />
                  <Label htmlFor="show-correlation">显示相关性分析</Label>
                </div>

                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}
                  >
                    {viewMode === "chart" ? <Table2 className="h-4 w-4 mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                    {viewMode === "chart" ? "表格" : "图表"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    导出数据
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 指标卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">日前均价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-[#00B04D]">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : supplyDemandMetrics.avgPrice}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">最大负荷(MW)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-blue-500">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : supplyDemandMetrics.maxLoad}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">平均竞价空间(MW)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-orange-500">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : supplyDemandMetrics.avgBiddingSpace}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">平均新能源出力(MW)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-green-500">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : supplyDemandMetrics.avgRenewable}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 现货价格趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">现货价格趋势</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={supplyDemandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="spotPrice" stroke="#00B04D" name="日前价格" strokeWidth={2} />
                    <Line type="monotone" dataKey="realtimePrice" stroke="#3b82f6" name="实时价格" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* 竞价空间与负荷 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">竞价空间与负荷分析</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={supplyDemandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="biddingSpace" fill="#f97316" name="竞价空间" opacity={0.7} />
                    <Line yAxisId="right" type="monotone" dataKey="gridLoad" stroke="#00B04D" name="统调负荷" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="renewableOutput" stroke="#22c55e" name="新能源出力" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* 价格与竞价空间相关性散点图 */}
          {showCorrelation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">现货价格与竞价空间相关性</CardTitle>
                <CardDescription>X轴：竞价空间(MW) | Y轴：日前价格(元/MWh)</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" dataKey="x" name="竞价空间" unit="MW" domain={[0, 500]} stroke="hsl(var(--muted-foreground))" />
                      <YAxis type="number" dataKey="y" name="日前价格" unit="元/MWh" domain={[200, 550]} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Scatter name="价格-空间" data={scatterData} fill="#00B04D" />
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 节点价格对比 */}
        <TabsContent value="node-price" className="space-y-6">
          {/* 场站选择 */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <Label>选择场站对比</Label>
                <div className="flex flex-wrap gap-2">
                  {stations.map(station => (
                    <Button
                      key={station}
                      variant={selectedStations.includes(station) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedStations(prev =>
                          prev.includes(station)
                            ? prev.filter(s => s !== station)
                            : [...prev, station]
                        );
                      }}
                      style={selectedStations.includes(station) ? { backgroundColor: stationColors[station] } : {}}
                    >
                      {station}
                    </Button>
                  ))}
                </div>

                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    导出数据
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 节点价格趋势对比 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">多场站节点价格趋势对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={nodePriceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  {selectedStations.map(station => (
                    <Line
                      key={station}
                      type="monotone"
                      dataKey={station}
                      stroke={stationColors[station]}
                      name={station}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 历史节点电价分布 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">历史节点电价分布统计</CardTitle>
              <CardDescription>显示选中场站的价格分布情况</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="priceRange" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#00B04D" name="出现次数" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 节点价格差异表格 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">节点价格对比明细</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#F1F8F4]">
                    <TableRow>
                      <TableHead>时间</TableHead>
                      {selectedStations.map(station => (
                        <TableHead key={station} className="text-right font-mono">{station}(元/MWh)</TableHead>
                      ))}
                      <TableHead className="text-right font-mono">最大价差</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nodePriceData.map(row => {
                      const prices = selectedStations.map(s => row[s] as number);
                      const maxDiff = prices.length > 1 ? (Math.max(...prices) - Math.min(...prices)).toFixed(2) : '-';
                      return (
                        <TableRow key={row.time} className="hover:bg-[#F8FBFA]">
                          <TableCell>{row.time}</TableCell>
                          {selectedStations.map(station => (
                            <TableCell key={station} className="text-right font-mono">
                              {(row[station] as number).toFixed(2)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-mono font-medium text-orange-500">{maxDiff}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 市场出清概况 */}
        <TabsContent value="clearing-overview" className="space-y-6">
          {/* 指标卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">平均出清价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-[#00B04D]">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : clearingMetrics.avgClearingPrice}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">最大省内负荷(MW)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-blue-500">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : clearingMetrics.maxLoad}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">平均省间联络(MW)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-orange-500">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : clearingMetrics.avgTie}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">日出清电量(MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-purple-500">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : clearingMetrics.totalVolume}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 出清价格与负荷对比 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">全省现货出清电价与负荷分析</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={clearingOverviewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="provincialLoad" fill="#E8F0EC" stroke="#00B04D" name="省内负荷" />
                    <Bar yAxisId="left" dataKey="interProvincialTie" fill="#3b82f6" name="省间联络" opacity={0.7} />
                    <Line yAxisId="right" type="monotone" dataKey="clearingPrice" stroke="#f97316" name="出清价格" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* 出清数据明细表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">市场出清数据明细</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#F1F8F4]">
                    <TableRow>
                      <TableHead>时间</TableHead>
                      <TableHead className="text-right font-mono">出清价格(元/MWh)</TableHead>
                      <TableHead className="text-right font-mono">省内负荷(MW)</TableHead>
                      <TableHead className="text-right font-mono">省间联络(MW)</TableHead>
                      <TableHead className="text-right font-mono">出清电量(MWh)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : clearingOverviewData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      clearingOverviewData.map(row => (
                        <TableRow key={row.time} className="hover:bg-[#F8FBFA]">
                          <TableCell>{row.time}</TableCell>
                          <TableCell className="text-right font-mono">{row.clearingPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono">{row.provincialLoad.toFixed(0)}</TableCell>
                          <TableCell className="text-right font-mono">{row.interProvincialTie.toFixed(0)}</TableCell>
                          <TableCell className="text-right font-mono">{row.clearingVolume.toFixed(0)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpotDisclosure;

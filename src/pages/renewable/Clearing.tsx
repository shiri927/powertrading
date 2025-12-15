import { useState, useMemo } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarIcon, Search, RotateCcw, Download, BarChart3, Table as TableIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useClearingRecordsByDate, useClearingStats, transformClearingDataForChart } from "@/hooks/useClearingRecords";

// 分时段交易出清数据 (保留Mock数据用于分时段交易)
const generateSegmentClearingData = () => {
  const tradingTypes = ["集中竞价", "滚动撮合", "挂牌交易", "双边协商"];
  return Array.from({ length: 20 }, (_, i) => ({
    id: `T${(i + 1).toString().padStart(3, '0')}`,
    tradingType: tradingTypes[i % tradingTypes.length],
    tradingUnit: ["山东省场站A", "山东省场站B", "山西省场站A", "浙江省场站A"][i % 4],
    tradingSequence: `第${Math.floor(i / 4) + 1}序`,
    period: `${(i % 24).toString().padStart(2, '0')}:00-${((i % 24) + 1).toString().padStart(2, '0')}:00`,
    clearPrice: 300 + Math.random() * 150,
    clearVolume: 50 + Math.random() * 100,
    bidPrice: 280 + Math.random() * 160,
    status: Math.random() > 0.2 ? "已出清" : "未出清",
    clearTime: `2025-12-14 ${(9 + i % 8).toString().padStart(2, '0')}:${(Math.floor(Math.random() * 60)).toString().padStart(2, '0')}`,
  }));
};

const priceChartConfig = {
  dayAheadClearPrice: { label: "日前出清电价", color: "#00B04D" },
  realTimeClearPrice: { label: "实时出清电价", color: "#f59e0b" },
};

const volumeChartConfig = {
  dayAheadClearVolume: { label: "日前出清电量", color: "#00B04D" },
  realTimeClearVolume: { label: "实时出清电量", color: "#f59e0b" },
};

const Clearing = () => {
  // 分时段交易出清状态
  const [segmentDate, setSegmentDate] = useState<Date | undefined>(new Date());
  const [tradingType, setTradingType] = useState<string>("all");
  const [tradingUnit, setTradingUnit] = useState<string>("all");
  const [tradingSequence, setTradingSequence] = useState<string>("all");
  const [aggregateDimension, setAggregateDimension] = useState<string>("time");
  const [region, setRegion] = useState<string>("all");

  // 省内现货出清状态
  const [spotDate, setSpotDate] = useState<Date | undefined>(new Date());
  const [spotUnit, setSpotUnit] = useState<string>("all");
  const [spotDataType, setSpotDataType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  // 使用数据库数据
  const dateStr = spotDate ? format(spotDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
  const { data: clearingRecords = [], isLoading: isLoadingRecords } = useClearingRecordsByDate(dateStr);
  const { data: clearingStats, isLoading: isLoadingStats } = useClearingStats(dateStr);

  // 转换为图表数据
  const spotData = useMemo(() => {
    if (clearingRecords.length > 0) {
      return transformClearingDataForChart(clearingRecords);
    }
    // 如果数据库无数据，使用生成的数据
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      dayAheadClearPrice: 300 + Math.random() * 200,
      realTimeClearPrice: 320 + Math.random() * 180,
      dayAheadClearVolume: 80 + Math.random() * 60,
      realTimeClearVolume: 75 + Math.random() * 65,
      priceDeviation: (Math.random() - 0.5) * 40,
      volumeDeviation: (Math.random() - 0.5) * 20,
    }));
  }, [clearingRecords]);

  const segmentData = generateSegmentClearingData();

  // 根据筛选条件过滤分时段数据
  const filteredSegmentData = segmentData.filter(item => {
    if (tradingType !== "all" && item.tradingType !== tradingType) return false;
    if (tradingUnit !== "all" && item.tradingUnit !== tradingUnit) return false;
    if (tradingSequence !== "all" && item.tradingSequence !== tradingSequence) return false;
    return true;
  });

  // 计算统计指标
  const segmentStats = {
    totalVolume: filteredSegmentData.reduce((sum, item) => sum + item.clearVolume, 0),
    avgPrice: filteredSegmentData.reduce((sum, item) => sum + item.clearPrice, 0) / filteredSegmentData.length,
    clearCount: filteredSegmentData.filter(item => item.status === "已出清").length,
    totalCount: filteredSegmentData.length,
  };

  const spotStats = clearingStats || {
    avgDayAheadPrice: spotData.reduce((sum, item) => sum + item.dayAheadClearPrice, 0) / spotData.length,
    avgRealtimePrice: spotData.reduce((sum, item) => sum + item.realTimeClearPrice, 0) / spotData.length,
    totalDayAheadVolume: spotData.reduce((sum, item) => sum + item.dayAheadClearVolume, 0),
    totalRealtimeVolume: spotData.reduce((sum, item) => sum + item.realTimeClearVolume, 0),
  };

  const showDayAhead = spotDataType === "all" || spotDataType === "dayAhead";
  const showRealTime = spotDataType === "all" || spotDataType === "realTime";

  const isLoading = isLoadingRecords || isLoadingStats;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">出清管理</h1>
        <p className="text-muted-foreground mt-2">
          分时段交易、省内现货出清结果管理与分析
        </p>
      </div>

      <Tabs defaultValue="segment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-[#F1F8F4]">
          <TabsTrigger value="segment">分时段交易出清</TabsTrigger>
          <TabsTrigger value="spot">省内现货出清</TabsTrigger>
        </TabsList>

        {/* 分时段交易出清 */}
        <TabsContent value="segment" className="space-y-6">
          {/* 筛选栏 */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">交易方式</label>
                  <Select value={tradingType} onValueChange={setTradingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择交易方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="集中竞价">集中竞价</SelectItem>
                      <SelectItem value="滚动撮合">滚动撮合</SelectItem>
                      <SelectItem value="挂牌交易">挂牌交易</SelectItem>
                      <SelectItem value="双边协商">双边协商</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">区域</label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择区域" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部区域</SelectItem>
                      <SelectItem value="shandong">山东</SelectItem>
                      <SelectItem value="shanxi">山西</SelectItem>
                      <SelectItem value="zhejiang">浙江</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">交易单元</label>
                  <Select value={tradingUnit} onValueChange={setTradingUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择交易单元" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="山东省场站A">山东省场站A</SelectItem>
                      <SelectItem value="山东省场站B">山东省场站B</SelectItem>
                      <SelectItem value="山西省场站A">山西省场站A</SelectItem>
                      <SelectItem value="浙江省场站A">浙江省场站A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">交易序列</label>
                  <Select value={tradingSequence} onValueChange={setTradingSequence}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择交易序列" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部序列</SelectItem>
                      <SelectItem value="第1序">第1序</SelectItem>
                      <SelectItem value="第2序">第2序</SelectItem>
                      <SelectItem value="第3序">第3序</SelectItem>
                      <SelectItem value="第4序">第4序</SelectItem>
                      <SelectItem value="第5序">第5序</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">日期:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {segmentDate ? format(segmentDate, "yyyy-MM-dd") : "选择日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={segmentDate} onSelect={setSegmentDate} locale={zhCN} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">聚合维度:</span>
                  <Select value={aggregateDimension} onValueChange={setAggregateDimension}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">时间维度</SelectItem>
                      <SelectItem value="space">空间维度</SelectItem>
                      <SelectItem value="sequence">交易序列</SelectItem>
                      <SelectItem value="type">交易方式</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Button size="sm"><Search className="h-4 w-4 mr-1" />查询</Button>
                  <Button variant="outline" size="sm"><RotateCcw className="h-4 w-4 mr-1" />重置</Button>
                  <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />导出</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">总出清电量</p>
                <p className="text-2xl font-bold text-primary font-mono">{segmentStats.totalVolume.toFixed(1)} MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">平均出清价格</p>
                <p className="text-2xl font-bold text-primary font-mono">¥ {segmentStats.avgPrice.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">出清成功率</p>
                <p className="text-2xl font-bold text-green-600 font-mono">
                  {((segmentStats.clearCount / segmentStats.totalCount) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">交易笔数</p>
                <p className="text-2xl font-bold text-primary font-mono">{segmentStats.totalCount} 笔</p>
              </CardContent>
            </Card>
          </div>

          {/* 数据表格 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">出清明细</CardTitle>
              <CardDescription>按 {aggregateDimension === "time" ? "时间" : aggregateDimension === "space" ? "空间" : aggregateDimension === "sequence" ? "交易序列" : "交易方式"} 维度聚合展示</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                    <TableRow>
                      <TableHead>交易编号</TableHead>
                      <TableHead>交易方式</TableHead>
                      <TableHead>交易单元</TableHead>
                      <TableHead>交易序列</TableHead>
                      <TableHead>时段</TableHead>
                      <TableHead className="text-right">出清价格 (¥/MWh)</TableHead>
                      <TableHead className="text-right">出清电量 (MWh)</TableHead>
                      <TableHead className="text-right">申报价格 (¥/MWh)</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>出清时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSegmentData.map((row) => (
                      <TableRow key={row.id} className="hover:bg-[#F8FBFA]">
                        <TableCell className="font-mono">{row.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.tradingType}</Badge>
                        </TableCell>
                        <TableCell>{row.tradingUnit}</TableCell>
                        <TableCell>{row.tradingSequence}</TableCell>
                        <TableCell className="font-mono">{row.period}</TableCell>
                        <TableCell className="text-right font-mono">{row.clearPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{row.clearVolume.toFixed(1)}</TableCell>
                        <TableCell className="text-right font-mono">{row.bidPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={row.status === "已出清" ? "default" : "secondary"}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{row.clearTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 省内现货出清 */}
        <TabsContent value="spot" className="space-y-6">
          {/* 筛选栏 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">交易单元:</span>
                  <Select value={spotUnit} onValueChange={setSpotUnit}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="选择交易单元" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="sd-a">山东省场站A</SelectItem>
                      <SelectItem value="sd-b">山东省场站B</SelectItem>
                      <SelectItem value="sx-a">山西省场站A</SelectItem>
                      <SelectItem value="zj-a">浙江省场站A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">数据类型:</span>
                  <Select value={spotDataType} onValueChange={setSpotDataType}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="dayAhead">日前</SelectItem>
                      <SelectItem value="realTime">实时</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">日期:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {spotDate ? format(spotDate, "yyyy-MM-dd") : "选择日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={spotDate} onSelect={setSpotDate} locale={zhCN} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "chart" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("chart")}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />图表
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    <TableIcon className="h-4 w-4 mr-1" />表格
                  </Button>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Button size="sm"><Search className="h-4 w-4 mr-1" />查询</Button>
                  <Button variant="outline" size="sm"><RotateCcw className="h-4 w-4 mr-1" />重置</Button>
                  <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />导出</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">日前均价</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-primary font-mono">¥ {spotStats.avgDayAheadPrice.toFixed(2)}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">实时均价</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-warning mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-warning font-mono">¥ {spotStats.avgRealtimePrice.toFixed(2)}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">日前总电量</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-primary font-mono">{spotStats.totalDayAheadVolume.toFixed(1)} MWh</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">实时总电量</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-warning mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-warning font-mono">{spotStats.totalRealtimeVolume.toFixed(1)} MWh</p>
                )}
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#00B04D]" />
              <span className="ml-2 text-muted-foreground">加载出清数据中...</span>
            </div>
          ) : viewMode === "chart" ? (
            <>
              {/* 价格图表 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">出清电价曲线</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={priceChartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spotData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} label={{ value: '电价 (¥/MWh)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        {showDayAhead && <Line type="monotone" dataKey="dayAheadClearPrice" stroke="#00B04D" strokeWidth={2} dot={false} />}
                        {showRealTime && <Line type="monotone" dataKey="realTimeClearPrice" stroke="#f59e0b" strokeWidth={2} dot={false} />}
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* 电量图表 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">出清电量曲线</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={volumeChartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={spotData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        {showDayAhead && <Bar dataKey="dayAheadClearVolume" fill="#00B04D" fillOpacity={0.7} radius={[4, 4, 0, 0]} />}
                        {showRealTime && <Bar dataKey="realTimeClearVolume" fill="#f59e0b" fillOpacity={0.7} radius={[4, 4, 0, 0]} />}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            /* 表格视图 */
            <Card>
              <CardHeader>
                <CardTitle className="text-base">出清明细数据</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                      <TableRow>
                        <TableHead>时段</TableHead>
                        {showDayAhead && <TableHead className="text-right">日前出清价格</TableHead>}
                        {showRealTime && <TableHead className="text-right">实时出清价格</TableHead>}
                        {showDayAhead && <TableHead className="text-right">日前出清电量</TableHead>}
                        {showRealTime && <TableHead className="text-right">实时出清电量</TableHead>}
                        <TableHead className="text-right">价格偏差</TableHead>
                        <TableHead className="text-right">电量偏差</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spotData.map((row, index) => (
                        <TableRow key={index} className="hover:bg-[#F8FBFA]">
                          <TableCell className="font-mono">{row.time}</TableCell>
                          {showDayAhead && <TableCell className="text-right font-mono">{row.dayAheadClearPrice.toFixed(2)}</TableCell>}
                          {showRealTime && <TableCell className="text-right font-mono">{row.realTimeClearPrice.toFixed(2)}</TableCell>}
                          {showDayAhead && <TableCell className="text-right font-mono">{row.dayAheadClearVolume.toFixed(1)}</TableCell>}
                          {showRealTime && <TableCell className="text-right font-mono">{row.realTimeClearVolume.toFixed(1)}</TableCell>}
                          <TableCell className={cn("text-right font-mono", row.priceDeviation > 0 ? "text-red-600" : "text-green-600")}>
                            {row.priceDeviation > 0 ? '+' : ''}{row.priceDeviation.toFixed(2)}
                          </TableCell>
                          <TableCell className={cn("text-right font-mono", row.volumeDeviation > 0 ? "text-red-600" : "text-green-600")}>
                            {row.volumeDeviation > 0 ? '+' : ''}{row.volumeDeviation.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Clearing;

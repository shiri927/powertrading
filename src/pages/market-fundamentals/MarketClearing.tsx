import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/MetricCard";
import { MultiDateRangePicker, DateRange } from "@/components/MultiDateRangePicker";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from "recharts";
import { BarChart3, Table2, Download, TrendingUp, TrendingDown, Minus, Upload, Loader2, Maximize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { format } from "date-fns";

type TimeGranularity = "96" | "24" | "day" | "month";
type DataDisplay = "all" | "dayAhead" | "intraday";
type AnalysisMethod = "trend" | "comparison";
type DisplayFormat = "flat" | "grouped" | "summary";
type ViewMode = "chart" | "table";

interface ClearingDataPoint {
  time: string;
  dayAheadPrice: number | null;
  realtimePrice: number | null;
  regulatedPrice?: number;
  volume?: number;
  deviation?: number;
}

interface DBPriceRecord {
  id: string;
  province: string;
  price_date: string;
  hour: number;
  day_ahead_price: number | null;
  realtime_price: number | null;
}

const MarketClearing = () => {
  const [activeTab, setActiveTab] = useState("intra-price");
  const [province, setProvince] = useState("山东");
  const [dateRanges, setDateRanges] = useState<DateRange[]>([
    { start: new Date(2024, 0, 1), end: new Date(2024, 0, 31) }
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
  const [brushRange, setBrushRange] = useState<{ startIndex: number; endIndex: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const dayAheadFileRef = useRef<HTMLInputElement>(null);
  const realtimeFileRef = useRef<HTMLInputElement>(null);
  const [dayAheadFile, setDayAheadFile] = useState<File | null>(null);
  const [realtimeFile, setRealtimeFile] = useState<File | null>(null);

  // Fetch data from database
  const { data: dbData, isLoading, refetch } = useQuery({
    queryKey: ['market-clearing-prices', province, dateRanges],
    queryFn: async () => {
      const startDate = dateRanges.length > 0 
        ? format(Math.min(...dateRanges.map(r => r.start.getTime())), 'yyyy-MM-dd')
        : '2024-01-01';
      const endDate = dateRanges.length > 0
        ? format(Math.max(...dateRanges.map(r => r.end.getTime())), 'yyyy-MM-dd')
        : '2024-12-31';

      const { data, error } = await supabase
        .from('market_clearing_prices')
        .select('*')
        .eq('province', province)
        .gte('price_date', startDate)
        .lte('price_date', endDate)
        .order('price_date', { ascending: true })
        .order('hour', { ascending: true });

      if (error) throw error;
      return data as DBPriceRecord[];
    },
  });

  // Transform database data to chart format
  const chartData = useMemo(() => {
    if (!dbData || dbData.length === 0) return [];

    const processedData: ClearingDataPoint[] = [];

    if (timeGranularity === "day") {
      // Aggregate by day
      const dayMap = new Map<string, { dayAhead: number[]; realtime: number[] }>();
      
      dbData.forEach(record => {
        const dateKey = record.price_date;
        if (!dayMap.has(dateKey)) {
          dayMap.set(dateKey, { dayAhead: [], realtime: [] });
        }
        const day = dayMap.get(dateKey)!;
        if (record.day_ahead_price !== null) day.dayAhead.push(record.day_ahead_price);
        if (record.realtime_price !== null) day.realtime.push(record.realtime_price);
      });

      dayMap.forEach((values, date) => {
        const avgDA = values.dayAhead.length > 0 
          ? values.dayAhead.reduce((a, b) => a + b, 0) / values.dayAhead.length 
          : null;
        const avgRT = values.realtime.length > 0
          ? values.realtime.reduce((a, b) => a + b, 0) / values.realtime.length
          : null;
        
        processedData.push({
          time: date,
          dayAheadPrice: avgDA,
          realtimePrice: avgRT,
          regulatedPrice: avgDA ? avgDA * 0.95 : undefined,
          deviation: avgDA && avgRT ? ((avgRT - avgDA) / avgDA) * 100 : undefined,
        });
      });
    } else if (timeGranularity === "month") {
      // Aggregate by month
      const monthMap = new Map<string, { dayAhead: number[]; realtime: number[] }>();
      
      dbData.forEach(record => {
        const monthKey = record.price_date.substring(0, 7); // YYYY-MM
        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, { dayAhead: [], realtime: [] });
        }
        const month = monthMap.get(monthKey)!;
        if (record.day_ahead_price !== null) month.dayAhead.push(record.day_ahead_price);
        if (record.realtime_price !== null) month.realtime.push(record.realtime_price);
      });

      monthMap.forEach((values, month) => {
        const avgDA = values.dayAhead.length > 0 
          ? values.dayAhead.reduce((a, b) => a + b, 0) / values.dayAhead.length 
          : null;
        const avgRT = values.realtime.length > 0
          ? values.realtime.reduce((a, b) => a + b, 0) / values.realtime.length
          : null;
        
        processedData.push({
          time: month,
          dayAheadPrice: avgDA,
          realtimePrice: avgRT,
          regulatedPrice: avgDA ? avgDA * 0.95 : undefined,
          deviation: avgDA && avgRT ? ((avgRT - avgDA) / avgDA) * 100 : undefined,
        });
      });
    } else {
      // Hourly data (24-point)
      if (displayFormat === "flat") {
        dbData.forEach(record => {
          processedData.push({
            time: `${record.price_date} ${String(record.hour).padStart(2, '0')}:00`,
            dayAheadPrice: record.day_ahead_price,
            realtimePrice: record.realtime_price,
            regulatedPrice: record.day_ahead_price ? record.day_ahead_price * 0.95 : undefined,
            deviation: record.day_ahead_price && record.realtime_price 
              ? ((record.realtime_price - record.day_ahead_price) / record.day_ahead_price) * 100 
              : undefined,
          });
        });
      } else {
        // Grouped or summary - aggregate by hour across all dates
        const hourMap = new Map<number, { dayAhead: number[]; realtime: number[] }>();
        
        dbData.forEach(record => {
          if (!hourMap.has(record.hour)) {
            hourMap.set(record.hour, { dayAhead: [], realtime: [] });
          }
          const hour = hourMap.get(record.hour)!;
          if (record.day_ahead_price !== null) hour.dayAhead.push(record.day_ahead_price);
          if (record.realtime_price !== null) hour.realtime.push(record.realtime_price);
        });

        Array.from(hourMap.entries())
          .sort((a, b) => a[0] - b[0])
          .forEach(([hour, values]) => {
            const avgDA = values.dayAhead.length > 0 
              ? values.dayAhead.reduce((a, b) => a + b, 0) / values.dayAhead.length 
              : null;
            const avgRT = values.realtime.length > 0
              ? values.realtime.reduce((a, b) => a + b, 0) / values.realtime.length
              : null;
            
            processedData.push({
              time: `${String(hour).padStart(2, '0')}:00`,
              dayAheadPrice: avgDA,
              realtimePrice: avgRT,
              regulatedPrice: avgDA ? avgDA * 0.95 : undefined,
              deviation: avgDA && avgRT ? ((avgRT - avgDA) / avgDA) * 100 : undefined,
            });
          });
      }
    }

    return processedData;
  }, [dbData, timeGranularity, displayFormat]);

  // Calculate visible data based on brush range
  const visibleData = useMemo(() => {
    if (!brushRange || chartData.length === 0) return chartData;
    return chartData.slice(brushRange.startIndex, brushRange.endIndex + 1);
  }, [chartData, brushRange]);

  // Calculate metrics from visible data (responds to brush range)
  const metrics = useMemo(() => {
    if (visibleData.length === 0) return { maxDA: 0, minDA: 0, avgDA: 0, maxRT: 0, minRT: 0, avgRT: 0 };
    
    const dayAheadPrices = visibleData.map(d => d.dayAheadPrice).filter((p): p is number => p !== null);
    const realtimePrices = visibleData.map(d => d.realtimePrice).filter((p): p is number => p !== null);
    
    return {
      maxDA: dayAheadPrices.length > 0 ? Math.max(...dayAheadPrices) : 0,
      minDA: dayAheadPrices.length > 0 ? Math.min(...dayAheadPrices) : 0,
      avgDA: dayAheadPrices.length > 0 ? dayAheadPrices.reduce((a, b) => a + b, 0) / dayAheadPrices.length : 0,
      maxRT: realtimePrices.length > 0 ? Math.max(...realtimePrices) : 0,
      minRT: realtimePrices.length > 0 ? Math.min(...realtimePrices) : 0,
      avgRT: realtimePrices.length > 0 ? realtimePrices.reduce((a, b) => a + b, 0) / realtimePrices.length : 0,
    };
  }, [visibleData]);

  // Sort and paginate data for table view (uses visible data)
  const tableData = useMemo(() => {
    let sorted = [...visibleData];
    
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof ClearingDataPoint];
        const bVal = b[sortConfig.key as keyof ClearingDataPoint];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return 0;
      });
    }

    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [visibleData, sortConfig, currentPage, pageSize]);

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
    XLSX.writeFile(wb, `market_clearing_${province}_${format(new Date(), "yyyyMMdd")}.xlsx`);
  };

  const handleQuery = () => {
    setCurrentPage(1);
    refetch();
  };

  const handleReset = () => {
    setDateRanges([{ start: new Date(2024, 0, 1), end: new Date(2024, 0, 31) }]);
    setTimeGranularity("24");
    setDataDisplay("all");
    setShowRegulatedPrice(false);
    setAnalysisMethod("trend");
    setDisplayFormat("flat");
    setCurrentPage(1);
    setBrushRange(null);
  };

  const handleBrushReset = () => {
    setBrushRange(null);
  };

  const handleImport = async () => {
    if (!dayAheadFile && !realtimeFile) {
      toast.error("请选择至少一个CSV文件");
      return;
    }

    setIsImporting(true);
    try {
      let dayAheadCsv = '';
      let realtimeCsv = '';

      if (dayAheadFile) {
        dayAheadCsv = await dayAheadFile.text();
      }
      if (realtimeFile) {
        realtimeCsv = await realtimeFile.text();
      }

      const { data, error } = await supabase.functions.invoke('import-market-prices', {
        body: { dayAheadCsv, realtimeCsv, province }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`成功导入 ${data.totalRecords} 条记录`);
        setDayAheadFile(null);
        setRealtimeFile(null);
        if (dayAheadFileRef.current) dayAheadFileRef.current.value = '';
        if (realtimeFileRef.current) realtimeFileRef.current.value = '';
        refetch();
      } else {
        toast.error(data.message || "导入失败");
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error("导入失败，请检查文件格式");
    } finally {
      setIsImporting(false);
    }
  };

  const totalPages = Math.ceil(visibleData.length / pageSize);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">市场出清</h1>
        <p className="text-muted-foreground mt-2">
          市场出清价格与电量的多维度分析（数据来源：数据库）
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
          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">数据导入</CardTitle>
              <CardDescription>上传CSV文件导入电价数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label>省份</Label>
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="山东">山东</SelectItem>
                      <SelectItem value="山西">山西</SelectItem>
                      <SelectItem value="浙江">浙江</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>日前电价CSV</Label>
                  <input
                    ref={dayAheadFileRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => setDayAheadFile(e.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#F1F8F4] file:text-[#00B04D] hover:file:bg-[#E8F0EC]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>实时电价CSV</Label>
                  <input
                    ref={realtimeFileRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => setRealtimeFile(e.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#F1F8F4] file:text-[#00B04D] hover:file:bg-[#E8F0EC]"
                  />
                </div>
                <Button onClick={handleImport} disabled={isImporting || (!dayAheadFile && !realtimeFile)}>
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      导入中...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      导入数据
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter Bar */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>省份</Label>
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="山东">山东</SelectItem>
                      <SelectItem value="山西">山西</SelectItem>
                      <SelectItem value="浙江">浙江</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      <SelectItem value="intraday">实时</SelectItem>
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
              title="日前价格最大值"
              value={`¥${metrics.maxDA.toFixed(2)}`}
              description={`实时最大: ¥${metrics.maxRT.toFixed(2)}`}
              icon={TrendingUp}
              changeType="neutral"
            />
            <MetricCard
              title="日前价格最小值"
              value={`¥${metrics.minDA.toFixed(2)}`}
              description={`实时最小: ¥${metrics.minRT.toFixed(2)}`}
              icon={TrendingDown}
              changeType="neutral"
            />
            <MetricCard
              title="日前价格平均值"
              value={`¥${metrics.avgDA.toFixed(2)}`}
              description={`实时平均: ¥${metrics.avgRT.toFixed(2)}`}
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
                  {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {brushRange && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBrushReset}
                    >
                      <Maximize2 className="h-4 w-4 mr-1" />
                      重置视图
                    </Button>
                  )}
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
              {isLoading ? (
                <div className="flex items-center justify-center h-[500px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                  暂无数据，请先导入CSV文件或调整查询条件
                </div>
              ) : viewMode === "chart" ? (
                <div className="space-y-2">
                  {brushRange && chartData.length > 0 && (
                    <div className="text-sm text-muted-foreground px-2">
                      当前显示: {chartData[brushRange.startIndex]?.time} 至 {chartData[brushRange.endIndex]?.time}
                      （共 {brushRange.endIndex - brushRange.startIndex + 1} 个数据点）
                    </div>
                  )}
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
                      <Tooltip 
                        formatter={(value: number | null, name: string) => {
                          if (value === null) return ['--', name];
                          if (name.includes('偏差')) return [`${value.toFixed(2)}%`, name];
                          return [`¥${value.toFixed(2)}`, name];
                        }}
                      />
                      <Legend verticalAlign="top" />
                      <Brush 
                        dataKey="time"
                        height={40}
                        stroke="#00B04D"
                        fill="#F1F8F4"
                        travellerWidth={10}
                        onChange={(range) => {
                          if (range && typeof range.startIndex === 'number' && typeof range.endIndex === 'number') {
                            setBrushRange({ startIndex: range.startIndex, endIndex: range.endIndex });
                          }
                        }}
                        startIndex={brushRange?.startIndex}
                        endIndex={brushRange?.endIndex}
                      />
                      {(dataDisplay === "all" || dataDisplay === "dayAhead") && (
                        <Line 
                          yAxisId="price"
                          type="monotone" 
                          dataKey="dayAheadPrice" 
                          stroke="#0088FE" 
                          name="日前价格"
                          strokeWidth={2}
                          connectNulls
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
                          connectNulls
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
                          connectNulls
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-auto max-h-[500px]">
                    <table className="w-full">
                      <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                        <tr className="border-b-2 border-[#00B04D]">
                          <th className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-[#E8F0EC]" onClick={() => handleSort('time')}>
                            时间点 {sortConfig?.key === 'time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          {(dataDisplay === "all" || dataDisplay === "dayAhead") && (
                            <th className="text-right p-3 text-sm font-medium cursor-pointer hover:bg-[#E8F0EC]" onClick={() => handleSort('dayAheadPrice')}>
                              日前价格 (¥/MWh) {sortConfig?.key === 'dayAheadPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                          )}
                          {(dataDisplay === "all" || dataDisplay === "intraday") && (
                            <th className="text-right p-3 text-sm font-medium cursor-pointer hover:bg-[#E8F0EC]" onClick={() => handleSort('realtimePrice')}>
                              实时价格 (¥/MWh) {sortConfig?.key === 'realtimePrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                          )}
                          {showRegulatedPrice && (
                            <th className="text-right p-3 text-sm font-medium">调控后价格 (¥/MWh)</th>
                          )}
                          <th className="text-right p-3 text-sm font-medium cursor-pointer hover:bg-[#E8F0EC]" onClick={() => handleSort('deviation')}>
                            偏差 (%) {sortConfig?.key === 'deviation' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, index) => (
                          <tr key={index} className="border-b hover:bg-[#F8FBFA]">
                            <td className="p-3 text-sm">{row.time}</td>
                            {(dataDisplay === "all" || dataDisplay === "dayAhead") && (
                              <td className="p-3 text-sm text-right font-mono">
                                {row.dayAheadPrice !== null ? `¥${row.dayAheadPrice.toFixed(2)}` : '--'}
                              </td>
                            )}
                            {(dataDisplay === "all" || dataDisplay === "intraday") && (
                              <td className="p-3 text-sm text-right font-mono">
                                {row.realtimePrice !== null ? `¥${row.realtimePrice.toFixed(2)}` : '--'}
                              </td>
                            )}
                            {showRegulatedPrice && (
                              <td className="p-3 text-sm text-right font-mono">
                                {row.regulatedPrice !== undefined ? `¥${row.regulatedPrice.toFixed(2)}` : '--'}
                              </td>
                            )}
                            <td className={`p-3 text-sm text-right font-mono ${
                              (row.deviation || 0) > 0 ? 'text-destructive' : (row.deviation || 0) < 0 ? 'text-[#00A86B]' : ''
                            }`}>
                              {row.deviation !== undefined ? `${row.deviation.toFixed(2)}%` : '--'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      显示第 {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, visibleData.length)} 条，共 {visibleData.length} 条
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
                      <span className="text-sm">第 {currentPage} / {totalPages || 1} 页</span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages || totalPages === 0}
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

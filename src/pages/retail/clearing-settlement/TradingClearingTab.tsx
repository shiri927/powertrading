import { useState, useMemo } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarIcon, Search, RotateCcw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useClearingRecordsByDate } from "@/hooks/useClearingRecords";

const priceChartConfig = {
  dayAheadClearPrice: { label: "日前出清电价", color: "#3b82f6" },
  realTimeClearPrice: { label: "实时出清电价", color: "#ef4444" },
  dayAheadPrice: { label: "日前电价", color: "#3b82f6" },
  realTimePrice: { label: "实时电价", color: "#ef4444" },
};

const volumeChartConfig = {
  dayAheadClearVolume: { label: "日前出清电量", color: "#3b82f6" },
  realTimeClearVolume: { label: "实时出清电量", color: "#ef4444" },
  dayAheadVolume: { label: "日前电量", color: "#3b82f6" },
  realTimeVolume: { label: "实时电量", color: "#ef4444" },
};

const TradingClearingTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 10, 5));
  const [tradingMethod, setTradingMethod] = useState<string>("all");
  const [queryScope, setQueryScope] = useState<string>("all");
  const [tradingUnit, setTradingUnit] = useState<string>("all");
  const [timePeriod, setTimePeriod] = useState<string>("day");
  const [tradingSequence, setTradingSequence] = useState<string>("all");
  const [dataType, setDataType] = useState<string>("all");
  
  // 使用数据库数据
  const clearingDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(2025, 10, 5), 'yyyy-MM-dd');
  const { data: clearingRecords, isLoading } = useClearingRecordsByDate(clearingDate);

  // 转换数据库数据为图表格式
  const { priceData, volumeData, tableData } = useMemo(() => {
    if (!clearingRecords || clearingRecords.length === 0) {
      // 返回空数据结构
      return { 
        priceData: Array.from({ length: 24 }, (_, i) => ({
          time: `${i.toString().padStart(2, '0')}:00`,
          dayAheadClearPrice: 0,
          realTimeClearPrice: 0,
        })),
        volumeData: Array.from({ length: 24 }, (_, i) => ({
          time: `${i.toString().padStart(2, '0')}:00`,
          dayAheadClearVolume: 0,
          realTimeClearVolume: 0,
        })),
        tableData: []
      };
    }

    const priceByHour: Record<number, { dayAhead: number[], realTime: number[] }> = {};
    const volumeByHour: Record<number, { dayAhead: number[], realTime: number[] }> = {};

    clearingRecords.forEach(record => {
      if (!priceByHour[record.hour]) {
        priceByHour[record.hour] = { dayAhead: [], realTime: [] };
        volumeByHour[record.hour] = { dayAhead: [], realTime: [] };
      }
      if (record.day_ahead_clear_price) priceByHour[record.hour].dayAhead.push(record.day_ahead_clear_price);
      if (record.realtime_clear_price) priceByHour[record.hour].realTime.push(record.realtime_clear_price);
      if (record.day_ahead_clear_volume) volumeByHour[record.hour].dayAhead.push(record.day_ahead_clear_volume);
      if (record.realtime_clear_volume) volumeByHour[record.hour].realTime.push(record.realtime_clear_volume);
    });

    const priceData = Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      dayAheadClearPrice: priceByHour[i]?.dayAhead.length ? 
        priceByHour[i].dayAhead.reduce((a, b) => a + b, 0) / priceByHour[i].dayAhead.length : 0,
      realTimeClearPrice: priceByHour[i]?.realTime.length ? 
        priceByHour[i].realTime.reduce((a, b) => a + b, 0) / priceByHour[i].realTime.length : 0,
    }));

    const volumeData = Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      dayAheadClearVolume: volumeByHour[i]?.dayAhead.length ? 
        volumeByHour[i].dayAhead.reduce((a, b) => a + b, 0) : 0,
      realTimeClearVolume: volumeByHour[i]?.realTime.length ? 
        volumeByHour[i].realTime.reduce((a, b) => a + b, 0) : 0,
    }));

    const tableData = priceData.map((p, i) => ({
      ...p,
      ...volumeData[i],
    }));

    return { priceData, volumeData, tableData };
  }, [clearingRecords]);

  const showDayAhead = dataType === "all" || dataType === "dayAhead";
  const showRealTime = dataType === "all" || dataType === "realTime";

  const handleReset = () => {
    setSelectedDate(new Date(2025, 10, 5));
    setTradingMethod("all");
    setQueryScope("all");
    setTradingUnit("all");
    setTimePeriod("day");
    setTradingSequence("all");
    setDataType("all");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B04D]" />
        <span className="ml-2 text-muted-foreground">加载出清数据...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 增强筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 交易方式 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">交易方式:</span>
              <Select value={tradingMethod} onValueChange={setTradingMethod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="centralized">集中竞价</SelectItem>
                  <SelectItem value="rolling">滚动撮合</SelectItem>
                  <SelectItem value="listing">挂牌交易</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 查询范围 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">查询范围:</span>
              <Select value={queryScope} onValueChange={setQueryScope}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全量</SelectItem>
                  <SelectItem value="region">区域</SelectItem>
                  <SelectItem value="unit">特定交易单元</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 交易单元 */}
            {queryScope === "unit" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">交易单元:</span>
                <Select value={tradingUnit} onValueChange={setTradingUnit}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="unit001">交易单元001</SelectItem>
                    <SelectItem value="unit002">交易单元002</SelectItem>
                    <SelectItem value="unit003">交易单元003</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 时间周期 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">时间周期:</span>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">日</SelectItem>
                  <SelectItem value="week">周</SelectItem>
                  <SelectItem value="month">月</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 交易序列 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">交易序列:</span>
              <Select value={tradingSequence} onValueChange={setTradingSequence}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部序列</SelectItem>
                  <SelectItem value="seq1">第一序列</SelectItem>
                  <SelectItem value="seq2">第二序列</SelectItem>
                  <SelectItem value="seq3">第三序列</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 数据类型 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">数据类型:</span>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="dayAhead">日前</SelectItem>
                  <SelectItem value="realTime">实时</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 日期 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">日期:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-[140px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "yyyy-MM-dd") : "选择日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={zhCN} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="default" size="sm" className="bg-[#00B04D] hover:bg-[#009644]">
                <Search className="h-4 w-4 mr-1" />
                查询
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 价格图表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">出清电价</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={priceChartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {showDayAhead && <Line type="monotone" dataKey="dayAheadClearPrice" stroke="#3b82f6" strokeWidth={2} dot={false} />}
                {showRealTime && <Line type="monotone" dataKey="realTimeClearPrice" stroke="#ef4444" strokeWidth={2} dot={false} />}
                {showDayAhead && <Line type="monotone" dataKey="dayAheadPrice" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />}
                {showRealTime && <Line type="monotone" dataKey="realTimePrice" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 电量图表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">出清电量</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={volumeChartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={volumeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {showDayAhead && <Area type="monotone" dataKey="dayAheadClearVolume" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" strokeWidth={2} />}
                {showRealTime && <Area type="monotone" dataKey="realTimeClearVolume" fill="#ef4444" fillOpacity={0.3} stroke="#ef4444" strokeWidth={2} />}
                {showDayAhead && <Bar dataKey="dayAheadVolume" fill="#3b82f6" fillOpacity={0.6} radius={[4, 4, 0, 0]} />}
                {showRealTime && <Bar dataKey="realTimeVolume" fill="#ef4444" fillOpacity={0.6} radius={[4, 4, 0, 0]} />}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">详细数据</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[400px] overflow-y-auto relative">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                <tr className="border-b border-[#00B04D]/30">
                  <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">时段</th>
                  <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">交易方式</th>
                  {showDayAhead && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">日前出清电价</th>}
                  {showRealTime && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">实时出清电价</th>}
                  {showDayAhead && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">日前出清电量</th>}
                  {showRealTime && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">实时出清电量</th>}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="border-b transition-colors hover:bg-[#F8FBFA]">
                    <td className="p-4 align-middle font-medium">{row.time}</td>
                    <td className="p-4 align-middle text-center">
                      <span className="px-2 py-1 rounded text-xs bg-[#F1F8F4] text-[#00B04D]">
                        {tradingMethod === "all" ? (index % 3 === 0 ? "集中竞价" : index % 3 === 1 ? "滚动撮合" : "挂牌交易") : 
                          tradingMethod === "centralized" ? "集中竞价" : tradingMethod === "rolling" ? "滚动撮合" : "挂牌交易"}
                      </span>
                    </td>
                    {showDayAhead && <td className="p-4 align-middle text-right font-mono text-xs">{row.dayAheadClearPrice.toFixed(2)}</td>}
                    {showRealTime && <td className="p-4 align-middle text-right font-mono text-xs">{row.realTimeClearPrice.toFixed(2)}</td>}
                    {showDayAhead && <td className="p-4 align-middle text-right font-mono text-xs">{row.dayAheadClearVolume.toFixed(0)}</td>}
                    {showRealTime && <td className="p-4 align-middle text-right font-mono text-xs">{row.realTimeClearVolume.toFixed(0)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingClearingTab;

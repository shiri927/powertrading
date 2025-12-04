import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarIcon, Search, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2025, 10, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(2025, 10, 30));
  const [tradingCenter, setTradingCenter] = useState<string>("all");
  const [dataType, setDataType] = useState<string>("all");
  
  const priceData = generatePriceData();
  const volumeData = generateVolumeData();
  const tableData = generateTableData();

  // 根据数据类型过滤显示的数据键
  const showDayAhead = dataType === "all" || dataType === "dayAhead";
  const showRealTime = dataType === "all" || dataType === "realTime";

  const handleReset = () => {
    setStartDate(new Date(2025, 10, 1));
    setEndDate(new Date(2025, 10, 30));
    setTradingCenter("all");
    setDataType("all");
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">出清管理</h1>
        <p className="text-muted-foreground mt-2">
          分时段交易、省内外现货出清结果管理
        </p>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 交易中心 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">交易中心:</span>
              <Select value={tradingCenter} onValueChange={setTradingCenter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="选择交易中心" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="shandong">山东</SelectItem>
                  <SelectItem value="shanxi">山西</SelectItem>
                  <SelectItem value="zhejiang">浙江</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 数据类型 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">数据类型:</span>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="选择数据类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="dayAhead">日前</SelectItem>
                  <SelectItem value="realTime">实时</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 开始日期 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">开始日期:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "yyyy-MM-dd") : "选择日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={zhCN}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 结束日期 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">结束日期:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "yyyy-MM-dd") : "选择日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={zhCN}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="default" size="sm">
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
                <XAxis 
                  dataKey="time" 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                  label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {showDayAhead && (
                  <Line 
                    type="monotone" 
                    dataKey="dayAheadClearPrice" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {showRealTime && (
                  <Line 
                    type="monotone" 
                    dataKey="realTimeClearPrice" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {showDayAhead && (
                  <Line 
                    type="monotone" 
                    dataKey="dayAheadPrice" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
                {showRealTime && (
                  <Line 
                    type="monotone" 
                    dataKey="realTimePrice" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
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
                <XAxis 
                  dataKey="time" 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                  label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {showDayAhead && (
                  <Area 
                    type="monotone" 
                    dataKey="dayAheadClearVolume" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                )}
                {showRealTime && (
                  <Area 
                    type="monotone" 
                    dataKey="realTimeClearVolume" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                )}
                {showDayAhead && (
                  <Bar 
                    dataKey="dayAheadVolume" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                    radius={[4, 4, 0, 0]}
                  />
                )}
                {showRealTime && (
                  <Bar 
                    dataKey="realTimeVolume" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                    radius={[4, 4, 0, 0]}
                  />
                )}
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
          <div className="rounded-md border max-h-[500px] overflow-y-auto relative">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                <tr className="border-b bg-[#F1F8F4]">
                  <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">时段</th>
                  {showDayAhead && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">日前出清电价</th>}
                  {showRealTime && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">实时出清电价</th>}
                  {showDayAhead && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">日前电价</th>}
                  {showRealTime && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">实时电价</th>}
                  {showDayAhead && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">日前出清电量</th>}
                  {showRealTime && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">实时出清电量</th>}
                  {showDayAhead && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">日前电量</th>}
                  {showRealTime && <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">实时电量</th>}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="border-b transition-colors hover:bg-[#F8FBFA]">
                    <td className="p-4 align-middle font-medium">{row.time}</td>
                    {showDayAhead && (
                      <td className="p-4 align-middle text-right font-mono text-xs">
                        {row.dayAheadClearPrice.toFixed(2)}
                      </td>
                    )}
                    {showRealTime && (
                      <td className="p-4 align-middle text-right font-mono text-xs">
                        {row.realTimeClearPrice.toFixed(2)}
                      </td>
                    )}
                    {showDayAhead && (
                      <td className="p-4 align-middle text-right font-mono text-xs">
                        {row.dayAheadPrice.toFixed(2)}
                      </td>
                    )}
                    {showRealTime && (
                      <td className="p-4 align-middle text-right font-mono text-xs">
                        {row.realTimePrice.toFixed(2)}
                      </td>
                    )}
                    {showDayAhead && (
                      <td className="p-4 align-middle text-right font-mono text-xs">
                        {row.dayAheadClearVolume.toFixed(0)}
                      </td>
                    )}
                    {showRealTime && (
                      <td className="p-4 align-middle text-right font-mono text-xs">
                        {row.realTimeClearVolume.toFixed(0)}
                      </td>
                    )}
                    {showDayAhead && (
                      <td className="p-4 align-middle text-right font-mono text-xs">
                        {row.dayAheadVolume.toFixed(0)}
                      </td>
                    )}
                    {showRealTime && (
                      <td className="p-4 align-middle text-right font-mono text-xs">
                        {row.realTimeVolume.toFixed(0)}
                      </td>
                    )}
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

export default Clearing;

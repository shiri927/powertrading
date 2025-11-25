import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis, ReferenceArea } from "recharts";
import { CalendarIcon, Download, ArrowUpDown, BarChart3, Table2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRangeDisplay } from "@/components/DateRangeDisplay";
import { validateLoadValue } from "@/lib/data-validation";

const tabs = [
  { id: "thermal-space", label: "火电竞价空间" },
  { id: "total-generation", label: "发电总出力" },
  { id: "renewable-load", label: "新能源负荷" },
  { id: "dispatched-load", label: "统调负荷" },
  { id: "transmission-plan", label: "外送电计划" },
  { id: "non-market-generation", label: "非市场化机组出力" },
  { id: "renewable-load-inter", label: "新能源负荷（省间）" },
  { id: "dispatched-load-inter", label: "统调负荷（省间）" },
];

const chartData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  dayAhead: 15000 - i * 200 + Math.random() * 1000,
  realTime: 14500 - i * 180 + Math.random() * 1000,
  forecast: 14800 - i * 190 + Math.random() * 1000,
  actual: 14600 - i * 185 + Math.random() * 1000,
}));

const tableData = [
  { date: "2024-11-02", maxValue: 13618.830, maxTime: "00:00", minValue: 2800.120, minTime: "12:15", avgValue: 8209.475, avgTime: "全时段" },
  { date: "2024-11-03", maxValue: 14120.450, maxTime: "01:30", minValue: 3200.450, minTime: "13:00", avgValue: 8660.450, avgTime: "全时段" },
  { date: "2024-11-04", maxValue: 13890.670, maxTime: "02:15", minValue: 2950.780, minTime: "11:45", avgValue: 8420.725, avgTime: "全时段" },
];

// 生成散点图数据：竞价空间 vs 日前电价预测
const generateScatterData = (date: string, color: string, basePrice: number, priceSlope: number) => {
  const points = [];
  // 生成40-50个散点
  for (let i = 0; i < 45; i++) {
    const biddingSpace = 50 + Math.random() * 400; // 50-450 MW
    const price = basePrice + priceSlope * biddingSpace + (Math.random() - 0.5) * 60; // 添加随机波动
    points.push({
      x: biddingSpace,
      y: Math.max(220, Math.min(550, price)), // 限制在合理范围
      date,
      color,
    });
  }
  return points;
};

const scatterData = [
  ...generateScatterData('2025-07-01', '#ff6b6b', 520, -0.5), // 红色，从高价开始，负斜率
  ...generateScatterData('2025-07-02', '#4ecdc4', 490, -0.45), // 青色
  ...generateScatterData('2025-07-03', '#ffd93d', 460, -0.4), // 黄色
];

// 按日期分组散点数据
const scatterByDate = {
  '2025-07-01': scatterData.filter(d => d.date === '2025-07-01'),
  '2025-07-02': scatterData.filter(d => d.date === '2025-07-02'),
  '2025-07-03': scatterData.filter(d => d.date === '2025-07-03'),
};

// 为每个日期计算趋势线（线性回归）
const calculateTrendLine = (points: any[]) => {
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return [
    { x: 50, y: slope * 50 + intercept },
    { x: 450, y: slope * 450 + intercept },
  ];
};

const trendLines = {
  '2025-07-01': calculateTrendLine(scatterByDate['2025-07-01']),
  '2025-07-02': calculateTrendLine(scatterByDate['2025-07-02']),
  '2025-07-03': calculateTrendLine(scatterByDate['2025-07-03']),
};

const MarketSupplyDemand = () => {
  const [activeTab, setActiveTab] = useState("thermal-space");
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const [timeGranularity, setTimeGranularity] = useState("96");
  const [dataDisplay, setDataDisplay] = useState("all");
  const [priceControl, setPriceControl] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("trend");
  const [displayFormat, setDisplayFormat] = useState("tiled");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // 散点图缩放相关状态
  const [scatterZoom, setScatterZoom] = useState({
    left: 0,
    right: 500,
    bottom: 200,
    top: 550,
    refAreaLeft: null as number | null,
    refAreaRight: null as number | null,
    refAreaBottom: null as number | null,
    refAreaTop: null as number | null,
  });
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleDownload = () => {
    console.log("下载数据");
  };

  // 散点图缩放处理函数
  const handleScatterMouseDown = (e: any) => {
    if (e && e.activeLabel !== undefined) {
      setScatterZoom({
        ...scatterZoom,
        refAreaLeft: e.activeLabel,
        refAreaBottom: e.activePayload?.[0]?.payload?.y || scatterZoom.bottom,
      });
      setIsSelecting(true);
    }
  };

  const handleScatterMouseMove = (e: any) => {
    if (isSelecting && e && e.activeLabel !== undefined) {
      setScatterZoom({
        ...scatterZoom,
        refAreaLeft: scatterZoom.refAreaLeft,
        refAreaRight: e.activeLabel,
        refAreaBottom: scatterZoom.refAreaBottom,
        refAreaTop: e.activePayload?.[0]?.payload?.y || scatterZoom.top,
      });
    }
  };

  const handleScatterMouseUp = () => {
    if (isSelecting && scatterZoom.refAreaLeft && scatterZoom.refAreaRight) {
      let { refAreaLeft, refAreaRight, refAreaBottom, refAreaTop } = scatterZoom;

      // 确保左右顺序正确
      if (refAreaLeft > refAreaRight) {
        [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
      }
      if (refAreaBottom && refAreaTop && refAreaBottom > refAreaTop) {
        [refAreaBottom, refAreaTop] = [refAreaTop, refAreaBottom];
      }

      // 设置新的缩放范围
      setScatterZoom({
        left: refAreaLeft,
        right: refAreaRight,
        bottom: refAreaBottom || scatterZoom.bottom,
        top: refAreaTop || scatterZoom.top,
        refAreaLeft: null,
        refAreaRight: null,
        refAreaBottom: null,
        refAreaTop: null,
      });
    }
    setIsSelecting(false);
  };

  const handleResetScatterZoom = () => {
    setScatterZoom({
      left: 0,
      right: 500,
      bottom: 200,
      top: 550,
      refAreaLeft: null,
      refAreaRight: null,
      refAreaBottom: null,
      refAreaTop: null,
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">市场供需</h1>
        <p className="text-muted-foreground mt-2">
          市场供需平衡与分析
        </p>
      </div>

      <DateRangeDisplay
        startDate={new Date(2025, 10, 1)}
        endDate={new Date(2025, 10, 20)}
        lastUpdated={new Date()}
        className="px-4 py-3 bg-muted/20 rounded-lg"
      />

      <Card>
        <CardContent className="pt-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-8 w-full mb-6">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Query Filters */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">选择日期</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange ? format(dateRange, "yyyy-MM-dd") : "选择日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">时间颗粒度</span>
                <Select value={timeGranularity} onValueChange={setTimeGranularity}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="96">96点(15min)</SelectItem>
                    <SelectItem value="24">24点(1h)</SelectItem>
                    <SelectItem value="day">日</SelectItem>
                    <SelectItem value="month">月</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">数据展示</span>
                <Select value={dataDisplay} onValueChange={setDataDisplay}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="day-ahead">日前</SelectItem>
                    <SelectItem value="intraday">日内</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={priceControl ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriceControl(!priceControl)}
                >
                  价格调控
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">分析方式</span>
                <div className="flex gap-1 border rounded-md">
                  <Button
                    variant={analysisMode === "trend" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setAnalysisMode("trend")}
                  >
                    趋势
                  </Button>
                  <Button
                    variant={analysisMode === "comparison" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setAnalysisMode("comparison")}
                  >
                    对比
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">展示形式</span>
                <div className="flex gap-1 border rounded-md">
                  <Button
                    variant={displayFormat === "tiled" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setDisplayFormat("tiled")}
                  >
                    平铺展示
                  </Button>
                  <Button
                    variant={displayFormat === "grouped" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setDisplayFormat("grouped")}
                  >
                    分组聚合
                  </Button>
                  <Button
                    variant={displayFormat === "summary" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setDisplayFormat("summary")}
                  >
                    汇总聚合
                  </Button>
                </div>
              </div>

              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}
                >
                  {viewMode === "chart" ? <Table2 className="h-4 w-4 mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                  {viewMode === "chart" ? "图表" : "表格"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  下载数据
                </Button>
              </div>
            </div>

            {/* Content for each tab */}
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-normal text-muted-foreground">最大值(MW)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">13,618.830</div>
                      <p className="text-xs text-muted-foreground mt-1">时刻: 00:00</p>
                      <p className="text-xs text-chart-2 mt-1">日期: 16,888.000</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-normal text-muted-foreground">最小值(MW)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">-14,799.940</div>
                      <p className="text-xs text-muted-foreground mt-1">时刻: 12:15</p>
                      <p className="text-xs text-chart-2 mt-1">日期: -17,655.000</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-normal text-muted-foreground">平均值(MW)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-chart-3">3,493.746</div>
                      <p className="text-xs text-muted-foreground mt-1">时刻: 全时段</p>
                      <p className="text-xs text-chart-2 mt-1">日期: 6,947.115</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                {viewMode === "chart" ? (
                  <div className="space-y-4">
                    {/* 散点图：竞价空间 vs 日前电价预测 */}
                    {tab.id === "thermal-space" && (
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">日前电价预测与竞价空间预测散点图</CardTitle>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetScatterZoom}
                                disabled={scatterZoom.left === 0 && scatterZoom.right === 500 && scatterZoom.bottom === 200 && scatterZoom.top === 550}
                              >
                                <Maximize2 className="h-4 w-4 mr-2" />
                                重置缩放
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <ZoomIn className="h-4 w-4" />
                            提示：鼠标拖拽选择区域进行缩放
                          </div>
                          <ResponsiveContainer width="100%" height={400}>
                            <ScatterChart 
                              margin={{ top: 20, right: 80, bottom: 20, left: 20 }}
                              onMouseDown={handleScatterMouseDown}
                              onMouseMove={handleScatterMouseMove}
                              onMouseUp={handleScatterMouseUp}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis 
                                type="number" 
                                dataKey="x" 
                                name="竞价空间预测" 
                                unit="MW"
                                domain={[scatterZoom.left, scatterZoom.right]}
                                label={{ value: '竞价空间预测(MW)', position: 'insideBottom', offset: -10 }}
                                stroke="hsl(var(--muted-foreground))"
                                allowDataOverflow
                              />
                              <YAxis 
                                type="number" 
                                dataKey="y" 
                                name="日前电价预测" 
                                unit="元/MWh"
                                domain={[scatterZoom.bottom, scatterZoom.top]}
                                stroke="hsl(var(--muted-foreground))"
                                allowDataOverflow
                              />
                              <ZAxis range={[40, 40]} />
                              <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--background))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '6px',
                                }}
                                formatter={(value: number, name: string) => {
                                  if (name === '日前电价预测') return [`${value.toFixed(2)} 元/MWh`, '日前电价预测'];
                                  if (name === '竞价空间预测') return [`${value.toFixed(2)} MW`, '竞价空间预测'];
                                  return [value, name];
                                }}
                              />
                              <Legend 
                                verticalAlign="top" 
                                align="right"
                                wrapperStyle={{ paddingBottom: '20px' }}
                                formatter={(value) => {
                                  const labels: { [key: string]: string } = {
                                    'scatter-2025-07-01': '2025-07-01',
                                    'scatter-2025-07-02': '2025-07-02',
                                    'scatter-2025-07-03': '2025-07-03',
                                  };
                                  return labels[value] || value;
                                }}
                              />
                              
                              {/* 选择区域高亮 */}
                              {scatterZoom.refAreaLeft && scatterZoom.refAreaRight && (
                                <ReferenceArea
                                  x1={scatterZoom.refAreaLeft}
                                  x2={scatterZoom.refAreaRight}
                                  y1={scatterZoom.refAreaBottom || scatterZoom.bottom}
                                  y2={scatterZoom.refAreaTop || scatterZoom.top}
                                  strokeOpacity={0.3}
                                  fill="hsl(var(--primary))"
                                  fillOpacity={0.1}
                                />
                              )}
                              
                              {/* 散点和趋势线 - 2025-07-01 */}
                              <Scatter 
                                name="scatter-2025-07-01" 
                                data={scatterByDate['2025-07-01']} 
                                fill="#ff6b6b"
                                opacity={0.6}
                              />
                              <Scatter 
                                data={trendLines['2025-07-01']} 
                                fill="none"
                                line={{ stroke: '#ff6b6b', strokeWidth: 2 }}
                                shape={() => null}
                              />
                              
                              {/* 散点和趋势线 - 2025-07-02 */}
                              <Scatter 
                                name="scatter-2025-07-02" 
                                data={scatterByDate['2025-07-02']} 
                                fill="#4ecdc4"
                                opacity={0.6}
                              />
                              <Scatter 
                                data={trendLines['2025-07-02']} 
                                fill="none"
                                line={{ stroke: '#4ecdc4', strokeWidth: 2 }}
                                shape={() => null}
                              />
                              
                              {/* 散点和趋势线 - 2025-07-03 */}
                              <Scatter 
                                name="scatter-2025-07-03" 
                                data={scatterByDate['2025-07-03']} 
                                fill="#ffd93d"
                                opacity={0.6}
                              />
                              <Scatter 
                                data={trendLines['2025-07-03']} 
                                fill="none"
                                line={{ stroke: '#ffd93d', strokeWidth: 2 }}
                                shape={() => null}
                              />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Line Chart */}
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">出力/MW</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            火电竞价空间-日前 | 火电竞价空间-实时 | 正偏差 | 负偏差
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="dayAhead"
                              stroke="hsl(var(--primary))"
                              name="火电竞价空间-日前"
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="realTime"
                              stroke="hsl(var(--chart-2))"
                              name="火电竞价空间-实时"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Bar Chart */}
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">偏差值</CardTitle>
                          <div className="flex gap-4">
                            <Select defaultValue="day-ahead">
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="day-ahead">火电竞价空间-日前</SelectItem>
                                <SelectItem value="real-time">火电竞价空间-实时</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select defaultValue="realtime">
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="realtime">火电竞价空间-实时</SelectItem>
                                <SelectItem value="day-ahead">火电竞价空间-日前</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                              对标分析
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="forecast" fill="hsl(var(--chart-3))" name="正偏差" />
                            <Bar dataKey="actual" fill="hsl(var(--chart-4))" name="负偏差" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  /* Table View */
                  <Card>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("date")}>
                                日期
                                <ArrowUpDown className="h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("maxValue")}>
                                最大值(MW)
                                <ArrowUpDown className="h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead>时刻</TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("minValue")}>
                                最小值(MW)
                                <ArrowUpDown className="h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead>时刻</TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("avgValue")}>
                                平均值(MW)
                                <ArrowUpDown className="h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead>时刻</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.date}</TableCell>
                              <TableCell className="font-medium">{row.maxValue.toLocaleString()}</TableCell>
                              <TableCell>{row.maxTime}</TableCell>
                              <TableCell className="font-medium text-destructive">{row.minValue.toLocaleString()}</TableCell>
                              <TableCell>{row.minTime}</TableCell>
                              <TableCell className="font-medium">{row.avgValue.toLocaleString()}</TableCell>
                              <TableCell>{row.avgTime}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          上一页
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          第 {currentPage} 页
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          下一页
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketSupplyDemand;

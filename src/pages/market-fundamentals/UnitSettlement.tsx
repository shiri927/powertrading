import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from "recharts";
import { CalendarIcon, Download, RefreshCw, Database, TrendingUp, TrendingDown, Zap, Sun, Wind, Droplets, Atom, BarChart3, Table2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// 发电类型配置
const powerTypes = [
  { id: "thermal", name: "火电", color: "#f97316", icon: Zap },
  { id: "wind", name: "风电", color: "#22c55e", icon: Wind },
  { id: "solar", name: "光伏", color: "#eab308", icon: Sun },
  { id: "hydro", name: "水电", color: "#3b82f6", icon: Droplets },
  { id: "nuclear", name: "核电", color: "#8b5cf6", icon: Atom },
];

// 模拟日电量数据
const generateDailyVolumeData = () => {
  const data = [];
  for (let i = 1; i <= 30; i++) {
    data.push({
      date: `11-${String(i).padStart(2, '0')}`,
      thermal: 8000 + Math.random() * 2000,
      wind: 1500 + Math.random() * 1000,
      solar: 800 + Math.random() * 600,
      hydro: 500 + Math.random() * 300,
      nuclear: 1200 + Math.random() * 200,
      total: 0,
    });
    data[i - 1].total = data[i - 1].thermal + data[i - 1].wind + data[i - 1].solar + data[i - 1].hydro + data[i - 1].nuclear;
  }
  return data;
};

// 模拟日结算价格数据
const generateDailyPriceData = () => {
  const data = [];
  for (let i = 1; i <= 30; i++) {
    data.push({
      date: `11-${String(i).padStart(2, '0')}`,
      thermal: 350 + Math.random() * 80 - 40,
      wind: 280 + Math.random() * 60 - 30,
      solar: 260 + Math.random() * 50 - 25,
      hydro: 300 + Math.random() * 40 - 20,
      nuclear: 320 + Math.random() * 30 - 15,
      average: 0,
    });
    const weights = [0.65, 0.15, 0.08, 0.05, 0.07];
    data[i - 1].average = 
      data[i - 1].thermal * weights[0] + 
      data[i - 1].wind * weights[1] + 
      data[i - 1].solar * weights[2] + 
      data[i - 1].hydro * weights[3] + 
      data[i - 1].nuclear * weights[4];
  }
  return data;
};

// 模拟结算明细数据
const generateSettlementDetails = () => {
  const details = [];
  const dates = Array.from({ length: 10 }, (_, i) => `2024-11-${String(i + 1).padStart(2, '0')}`);
  
  dates.forEach(date => {
    powerTypes.forEach(type => {
      details.push({
        id: `${date}-${type.id}`,
        date,
        powerType: type.name,
        volume: (Math.random() * 1000 + 500).toFixed(2),
        price: (Math.random() * 100 + 280).toFixed(2),
        amount: 0,
        status: Math.random() > 0.2 ? "已结算" : "待结算",
      });
      details[details.length - 1].amount = (parseFloat(details[details.length - 1].volume) * parseFloat(details[details.length - 1].price)).toFixed(2);
    });
  });
  
  return details;
};

const UnitSettlement = () => {
  const [activeTab, setActiveTab] = useState("volume");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeGranularity, setTimeGranularity] = useState("day");
  const [selectedPowerTypes, setSelectedPowerTypes] = useState<string[]>(powerTypes.map(t => t.id));
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const volumeData = useMemo(() => generateDailyVolumeData(), []);
  const priceData = useMemo(() => generateDailyPriceData(), []);
  const settlementDetails = useMemo(() => generateSettlementDetails(), []);

  // 计算统计指标
  const volumeMetrics = useMemo(() => {
    const lastDay = volumeData[volumeData.length - 1];
    const avgTotal = volumeData.reduce((sum, d) => sum + d.total, 0) / volumeData.length;
    return {
      totalToday: lastDay.total.toFixed(0),
      thermalPercent: ((lastDay.thermal / lastDay.total) * 100).toFixed(1),
      renewablePercent: (((lastDay.wind + lastDay.solar) / lastDay.total) * 100).toFixed(1),
      avgDaily: avgTotal.toFixed(0),
    };
  }, [volumeData]);

  const priceMetrics = useMemo(() => {
    const prices = priceData.map(d => d.average);
    return {
      maxPrice: Math.max(...prices).toFixed(2),
      minPrice: Math.min(...prices).toFixed(2),
      avgPrice: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
      thermalAvg: (priceData.reduce((sum, d) => sum + d.thermal, 0) / priceData.length).toFixed(2),
    };
  }, [priceData]);

  const handleDownload = () => {
    console.log("下载结算数据");
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">机组结算披露</h1>
        <p className="text-muted-foreground mt-2">
          发电侧结算信息展示与分析（数据来源：山东交易中心自动抓取）
        </p>
      </div>

      {/* 数据来源说明 */}
      <Card className="bg-[#F1F8F4] border-[#00B04D]/20">
        <CardContent className="pt-4 flex items-center gap-4">
          <Database className="h-5 w-5 text-[#00B04D]" />
          <div className="flex-1">
            <p className="text-sm font-medium">数据自动同步自山东电力交易中心</p>
            <p className="text-xs text-muted-foreground">最后更新时间：{format(new Date(), "yyyy-MM-dd HH:mm:ss")}</p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新数据
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="volume">发电侧日电量</TabsTrigger>
          <TabsTrigger value="price">发电侧日结算价格</TabsTrigger>
          <TabsTrigger value="detail">结算明细</TabsTrigger>
        </TabsList>

        {/* 筛选栏 */}
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-4">
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
                <Label>时间粒度</Label>
                <Select value={timeGranularity} onValueChange={setTimeGranularity}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">日</SelectItem>
                    <SelectItem value="month">月</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label>电源类型</Label>
                <div className="flex gap-2">
                  {powerTypes.map(type => (
                    <Button
                      key={type.id}
                      variant={selectedPowerTypes.includes(type.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedPowerTypes(prev =>
                          prev.includes(type.id)
                            ? prev.filter(t => t !== type.id)
                            : [...prev, type.id]
                        );
                      }}
                      style={selectedPowerTypes.includes(type.id) ? { backgroundColor: type.color } : {}}
                    >
                      {type.name}
                    </Button>
                  ))}
                </div>
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

        {/* 发电侧日电量 */}
        <TabsContent value="volume" className="space-y-6">
          {/* 指标卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">当日总电量(MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-[#00B04D]">{volumeMetrics.totalToday}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">火电占比(%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-orange-500">{volumeMetrics.thermalPercent}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">新能源占比(%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-green-500">{volumeMetrics.renewablePercent}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">日均电量(MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-blue-500">{volumeMetrics.avgDaily}</div>
              </CardContent>
            </Card>
          </div>

          {/* 电量堆积图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">分电源类型日电量趋势</CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === "chart" ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    {powerTypes.map(type => (
                      selectedPowerTypes.includes(type.id) && (
                        <Bar key={type.id} dataKey={type.id} stackId="a" fill={type.color} name={type.name} />
                      )
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-[#F1F8F4]">
                      <TableRow>
                        <TableHead>日期</TableHead>
                        {powerTypes.map(type => (
                          <TableHead key={type.id} className="text-right font-mono">{type.name}(MWh)</TableHead>
                        ))}
                        <TableHead className="text-right font-mono">合计(MWh)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {volumeData.map(row => (
                        <TableRow key={row.date} className="hover:bg-[#F8FBFA]">
                          <TableCell>{row.date}</TableCell>
                          {powerTypes.map(type => (
                            <TableCell key={type.id} className="text-right font-mono">
                              {row[type.id as keyof typeof row]?.toFixed(2)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-mono font-medium">{row.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 发电侧日结算价格 */}
        <TabsContent value="price" className="space-y-6">
          {/* 价格指标卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">最高均价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-red-500 flex items-center gap-2">
                  {priceMetrics.maxPrice}
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">最低均价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-green-500 flex items-center gap-2">
                  {priceMetrics.minPrice}
                  <TrendingDown className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">加权均价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-[#00B04D]">{priceMetrics.avgPrice}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">火电均价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-orange-500">{priceMetrics.thermalAvg}</div>
              </CardContent>
            </Card>
          </div>

          {/* 价格趋势图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">分电源类型日结算价格趋势</CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === "chart" ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    {powerTypes.map(type => (
                      selectedPowerTypes.includes(type.id) && (
                        <Line
                          key={type.id}
                          type="monotone"
                          dataKey={type.id}
                          stroke={type.color}
                          name={type.name}
                          strokeWidth={2}
                          dot={false}
                        />
                      )
                    ))}
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#000"
                      strokeDasharray="5 5"
                      name="加权均价"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-[#F1F8F4]">
                      <TableRow>
                        <TableHead>日期</TableHead>
                        {powerTypes.map(type => (
                          <TableHead key={type.id} className="text-right font-mono">{type.name}(元/MWh)</TableHead>
                        ))}
                        <TableHead className="text-right font-mono">加权均价</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceData.map(row => (
                        <TableRow key={row.date} className="hover:bg-[#F8FBFA]">
                          <TableCell>{row.date}</TableCell>
                          {powerTypes.map(type => (
                            <TableCell key={type.id} className="text-right font-mono">
                              {row[type.id as keyof typeof row]?.toFixed(2)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-mono font-medium">{row.average.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 结算明细 */}
        <TabsContent value="detail" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">结算数据明细</CardTitle>
              <CardDescription>可按电源类型、日期范围筛选，支持导出Excel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#F1F8F4]">
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>电源类型</TableHead>
                      <TableHead className="text-right font-mono">电量(MWh)</TableHead>
                      <TableHead className="text-right font-mono">结算价(元/MWh)</TableHead>
                      <TableHead className="text-right font-mono">结算金额(元)</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlementDetails.map(row => (
                      <TableRow key={row.id} className="hover:bg-[#F8FBFA]">
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.powerType}</TableCell>
                        <TableCell className="text-right font-mono">{row.volume}</TableCell>
                        <TableCell className="text-right font-mono">{row.price}</TableCell>
                        <TableCell className="text-right font-mono">{row.amount}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded text-xs",
                            row.status === "已结算" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          )}>
                            {row.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
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

export default UnitSettlement;

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { CalendarIcon, Download, RefreshCw, Database, TrendingUp, TrendingDown, BarChart3, Table2 } from "lucide-react";
import { format, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

// 交易类型配置
const transactionTypes = [
  { id: "centralized", name: "集中竞价", color: "#00B04D" },
  { id: "rolling", name: "滚动撮合", color: "#3b82f6" },
  { id: "bilateral", name: "双边协商", color: "#f97316" },
  { id: "listing", name: "挂牌交易", color: "#8b5cf6" },
];

// 模拟历史序列价格数据
const generateHistoricalPriceData = () => {
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const month = format(subMonths(new Date(), i), "yyyy-MM");
    data.push({
      month,
      centralized: 320 + Math.random() * 60 - 30,
      rolling: 310 + Math.random() * 50 - 25,
      bilateral: 340 + Math.random() * 40 - 20,
      listing: 300 + Math.random() * 45 - 22,
      volume: 50000 + Math.random() * 20000,
    });
  }
  return data;
};

// 模拟集中竞价详细数据
const generateCentralizedBiddingData = () => {
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const month = format(subMonths(new Date(), i), "yyyy-MM");
    data.push({
      month,
      thermalPrice: 350 + Math.random() * 50 - 25,
      renewablePrice: 280 + Math.random() * 40 - 20,
      avgPrice: 320 + Math.random() * 45 - 22,
      volume: 30000 + Math.random() * 15000,
      participants: Math.floor(80 + Math.random() * 40),
    });
  }
  return data;
};

// 模拟滚动撮合数据
const generateRollingMatchData = () => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), "MM-dd");
    data.push({
      date,
      successRate: 75 + Math.random() * 20,
      avgPrice: 310 + Math.random() * 40 - 20,
      buyVolume: 5000 + Math.random() * 3000,
      sellVolume: 4500 + Math.random() * 3500,
      matchedVolume: 4000 + Math.random() * 2500,
    });
  }
  return data;
};

// 模拟市场成交行情汇总
const generateMarketSummaryData = () => {
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const month = format(subMonths(new Date(), i), "yyyy-MM");
    const centralized = 25000 + Math.random() * 10000;
    const rolling = 15000 + Math.random() * 8000;
    const bilateral = 20000 + Math.random() * 12000;
    const listing = 8000 + Math.random() * 5000;
    const total = centralized + rolling + bilateral + listing;
    data.push({
      month,
      centralized,
      rolling,
      bilateral,
      listing,
      total,
      avgPrice: 325 + Math.random() * 30 - 15,
    });
  }
  return data;
};

// 模拟价格分布数据
const generatePriceDistributionData = () => {
  const distribution = [];
  for (let price = 250; price <= 400; price += 10) {
    distribution.push({
      priceRange: `${price}-${price + 10}`,
      centralized: Math.floor(Math.random() * 40 + 5),
      rolling: Math.floor(Math.random() * 30 + 3),
    });
  }
  return distribution;
};

const MediumLongTerm = () => {
  const [activeTab, setActiveTab] = useState("historical");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(transactionTypes.map(t => t.id));
  const [timeRange, setTimeRange] = useState("12m");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const historicalPriceData = useMemo(() => generateHistoricalPriceData(), []);
  const centralizedBiddingData = useMemo(() => generateCentralizedBiddingData(), []);
  const rollingMatchData = useMemo(() => generateRollingMatchData(), []);
  const marketSummaryData = useMemo(() => generateMarketSummaryData(), []);
  const priceDistributionData = useMemo(() => generatePriceDistributionData(), []);

  // 计算汇总指标
  const summaryMetrics = useMemo(() => {
    const lastMonth = marketSummaryData[marketSummaryData.length - 1];
    const totalVolume = marketSummaryData.reduce((sum, d) => sum + d.total, 0);
    const avgPrice = marketSummaryData.reduce((sum, d) => sum + d.avgPrice, 0) / marketSummaryData.length;
    return {
      monthlyVolume: lastMonth.total.toFixed(0),
      yearlyVolume: totalVolume.toFixed(0),
      avgPrice: avgPrice.toFixed(2),
      centralizedRatio: ((lastMonth.centralized / lastMonth.total) * 100).toFixed(1),
    };
  }, [marketSummaryData]);

  const handleDownload = () => {
    console.log("下载中长期行情数据");
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">中长期行情</h1>
        <p className="text-muted-foreground mt-2">
          中长期市场成交行情与历史价格分析
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
          <TabsTrigger value="historical">历史序列价格</TabsTrigger>
          <TabsTrigger value="centralized">集中竞价分析</TabsTrigger>
          <TabsTrigger value="rolling">滚动撮合分析</TabsTrigger>
          <TabsTrigger value="summary">市场成交汇总</TabsTrigger>
        </TabsList>

        {/* 历史序列价格 */}
        <TabsContent value="historical" className="space-y-6">
          {/* 筛选栏 */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>时间范围</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3m">近3个月</SelectItem>
                      <SelectItem value="6m">近6个月</SelectItem>
                      <SelectItem value="12m">近12个月</SelectItem>
                      <SelectItem value="24m">近24个月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>交易类型</Label>
                  <div className="flex gap-2">
                    {transactionTypes.map(type => (
                      <Button
                        key={type.id}
                        variant={selectedTypes.includes(type.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedTypes(prev =>
                            prev.includes(type.id)
                              ? prev.filter(t => t !== type.id)
                              : [...prev, type.id]
                          );
                        }}
                        style={selectedTypes.includes(type.id) ? { backgroundColor: type.color } : {}}
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

          {/* 价格趋势图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">不同交易类型历史价格趋势</CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === "chart" ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={historicalPriceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    {transactionTypes.map(type => (
                      selectedTypes.includes(type.id) && (
                        <Line
                          key={type.id}
                          yAxisId="left"
                          type="monotone"
                          dataKey={type.id}
                          stroke={type.color}
                          name={type.name + "(元/MWh)"}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      )
                    ))}
                    <Bar yAxisId="right" dataKey="volume" fill="#E8F0EC" name="成交量(MWh)" opacity={0.5} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-[#F1F8F4]">
                      <TableRow>
                        <TableHead>月份</TableHead>
                        {transactionTypes.map(type => (
                          <TableHead key={type.id} className="text-right font-mono">{type.name}(元/MWh)</TableHead>
                        ))}
                        <TableHead className="text-right font-mono">成交量(MWh)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalPriceData.map(row => (
                        <TableRow key={row.month} className="hover:bg-[#F8FBFA]">
                          <TableCell>{row.month}</TableCell>
                          {transactionTypes.map(type => (
                            <TableCell key={type.id} className="text-right font-mono">
                              {(row[type.id as keyof typeof row] as number)?.toFixed(2)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-mono">{row.volume.toFixed(0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 价格分布直方图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">交易价格分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceDistributionData}>
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
                  <Bar dataKey="centralized" fill="#00B04D" name="集中竞价" />
                  <Bar dataKey="rolling" fill="#3b82f6" name="滚动撮合" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 集中竞价分析 */}
        <TabsContent value="centralized" className="space-y-6">
          {/* 指标卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">火电均价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-orange-500">
                  {(centralizedBiddingData.reduce((sum, d) => sum + d.thermalPrice, 0) / centralizedBiddingData.length).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">新能源均价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-green-500">
                  {(centralizedBiddingData.reduce((sum, d) => sum + d.renewablePrice, 0) / centralizedBiddingData.length).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">综合均价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-[#00B04D]">
                  {(centralizedBiddingData.reduce((sum, d) => sum + d.avgPrice, 0) / centralizedBiddingData.length).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">月均参与方</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-blue-500">
                  {Math.round(centralizedBiddingData.reduce((sum, d) => sum + d.participants, 0) / centralizedBiddingData.length)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 集中竞价价格趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">集中竞价价格趋势（含火电历史数据）</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={centralizedBiddingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="thermalPrice" stroke="#f97316" name="火电价格" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="renewablePrice" stroke="#22c55e" name="新能源价格" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="avgPrice" stroke="#00B04D" name="综合均价" strokeWidth={2} strokeDasharray="5 5" />
                  <Bar yAxisId="right" dataKey="volume" fill="#E8F0EC" name="成交量(MWh)" opacity={0.5} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 滚动撮合分析 */}
        <TabsContent value="rolling" className="space-y-6">
          {/* 指标卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">平均撮合成功率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-[#00B04D]">
                  {(rollingMatchData.reduce((sum, d) => sum + d.successRate, 0) / rollingMatchData.length).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">平均成交价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-blue-500">
                  {(rollingMatchData.reduce((sum, d) => sum + d.avgPrice, 0) / rollingMatchData.length).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">日均撮合量(MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-orange-500">
                  {(rollingMatchData.reduce((sum, d) => sum + d.matchedVolume, 0) / rollingMatchData.length).toFixed(0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">买卖盘比例</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-purple-500">
                  {(rollingMatchData.reduce((sum, d) => sum + d.buyVolume, 0) / rollingMatchData.reduce((sum, d) => sum + d.sellVolume, 0)).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 撮合成功率与价格趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">滚动撮合成功率与价格波动</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={rollingMatchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="successRate" fill="#E8F0EC" stroke="#00B04D" name="撮合成功率(%)" />
                  <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#3b82f6" name="成交均价" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 买卖盘深度 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">买卖盘深度展示</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rollingMatchData.slice(-14)}>
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
                  <Bar dataKey="buyVolume" fill="#22c55e" name="买盘量(MWh)" />
                  <Bar dataKey="sellVolume" fill="#ef4444" name="卖盘量(MWh)" />
                  <Bar dataKey="matchedVolume" fill="#00B04D" name="撮合量(MWh)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 市场成交汇总 */}
        <TabsContent value="summary" className="space-y-6">
          {/* 汇总指标 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">当月成交量(MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-[#00B04D]">{summaryMetrics.monthlyVolume}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">年度累计成交(MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-blue-500">{summaryMetrics.yearlyVolume}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">年均成交价(元/MWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-orange-500">{summaryMetrics.avgPrice}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">集中竞价占比(%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-purple-500">{summaryMetrics.centralizedRatio}</div>
              </CardContent>
            </Card>
          </div>

          {/* 月度成交量堆积图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">月度成交量统计</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={marketSummaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  {transactionTypes.map(type => (
                    <Bar key={type.id} dataKey={type.id} stackId="a" fill={type.color} name={type.name} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 成交均价趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">成交均价趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marketSummaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="avgPrice" stroke="#00B04D" name="月均成交价(元/MWh)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 交易类型占比明细 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">交易类型月度明细</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#F1F8F4]">
                    <TableRow>
                      <TableHead>月份</TableHead>
                      {transactionTypes.map(type => (
                        <TableHead key={type.id} className="text-right font-mono">{type.name}(MWh)</TableHead>
                      ))}
                      <TableHead className="text-right font-mono">合计(MWh)</TableHead>
                      <TableHead className="text-right font-mono">均价(元/MWh)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketSummaryData.map(row => (
                      <TableRow key={row.month} className="hover:bg-[#F8FBFA]">
                        <TableCell>{row.month}</TableCell>
                        {transactionTypes.map(type => (
                          <TableCell key={type.id} className="text-right font-mono">
                            {(row[type.id as keyof typeof row] as number).toFixed(0)}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-mono font-medium">{row.total.toFixed(0)}</TableCell>
                        <TableCell className="text-right font-mono">{row.avgPrice.toFixed(2)}</TableCell>
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

export default MediumLongTerm;

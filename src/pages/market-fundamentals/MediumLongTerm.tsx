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
import { CalendarIcon, Download, RefreshCw, Database, TrendingUp, TrendingDown, BarChart3, Table2, Loader2 } from "lucide-react";
import { format, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useHistoricalPriceData,
  useCentralizedBiddingData,
  useRollingMatchData,
  useMarketSummaryData,
  usePriceDistributionData,
} from "@/hooks/useMediumLongTermData";

// 交易类型配置
const transactionTypes = [
  { id: "centralized", name: "集中竞价", color: "#00B04D" },
  { id: "rolling", name: "滚动撮合", color: "#3b82f6" },
  { id: "bilateral", name: "双边协商", color: "#f97316" },
  { id: "listing", name: "挂牌交易", color: "#8b5cf6" },
];

// 时间范围映射
const timeRangeMap: Record<string, number> = {
  '3m': 3,
  '6m': 6,
  '12m': 12,
  '24m': 24,
};

const MediumLongTerm = () => {
  const [activeTab, setActiveTab] = useState("historical");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(transactionTypes.map(t => t.id));
  const [timeRange, setTimeRange] = useState("12m");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  // 使用数据库hooks
  const months = timeRangeMap[timeRange] || 12;
  const { data: historicalPriceData = [], isLoading: loadingHistorical } = useHistoricalPriceData(months);
  const { data: centralizedBiddingData = [], isLoading: loadingCentralized } = useCentralizedBiddingData(months);
  const { data: rollingMatchData = [], isLoading: loadingRolling } = useRollingMatchData(30);
  const { data: marketSummaryData = [], isLoading: loadingSummary } = useMarketSummaryData(months);
  const { data: priceDistributionData = [], isLoading: loadingDistribution } = usePriceDistributionData();

  const isLoading = loadingHistorical || loadingCentralized || loadingRolling || loadingSummary || loadingDistribution;

  // 计算汇总指标
  const summaryMetrics = useMemo(() => {
    if (!marketSummaryData || marketSummaryData.length === 0) {
      return {
        monthlyVolume: '0',
        yearlyVolume: '0',
        avgPrice: '0.00',
        centralizedRatio: '0.0',
      };
    }

    const lastMonth = marketSummaryData[marketSummaryData.length - 1];
    const totalVolume = marketSummaryData.reduce((sum, d) => sum + d.total, 0);
    const avgPrice = marketSummaryData.reduce((sum, d) => sum + d.avgPrice, 0) / marketSummaryData.length;
    return {
      monthlyVolume: lastMonth.total.toFixed(0),
      yearlyVolume: totalVolume.toFixed(0),
      avgPrice: avgPrice.toFixed(2),
      centralizedRatio: lastMonth.total > 0 
        ? ((lastMonth.centralized / lastMonth.total) * 100).toFixed(1)
        : '0.0',
    };
  }, [marketSummaryData]);

  const handleDownload = () => {
    console.log("下载中长期行情数据");
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#00B04D]" />
          <p className="text-muted-foreground">加载中长期行情数据...</p>
        </div>
      </div>
    );
  }

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

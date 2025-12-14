import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from "recharts";
import { DateRangeDisplay } from "@/components/DateRangeDisplay";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// 月度收益数据 - 拆分现货为日前/实时
const monthlyRevenue = [
  { month: "1月", 中长期: 1850, 基数: 620, 日前现货: 720, 实时现货: 260, total: 3450, 中长期完成率: 94.2, 日前完成率: 97.8, 实时完成率: 96.5 },
  { month: "2月", 中长期: 1720, 基数: 580, 日前现货: 680, 实时现货: 240, total: 3220, 中长期完成率: 93.8, 日前完成率: 98.2, 实时完成率: 97.1 },
  { month: "3月", 中长期: 1920, 基数: 650, 日前现货: 780, 实时现货: 270, total: 3620, 中长期完成率: 95.5, 日前完成率: 98.6, 实时完成率: 97.8 },
  { month: "4月", 中长期: 1880, 基数: 630, 日前现货: 750, 实时现货: 270, total: 3530, 中长期完成率: 94.8, 日前完成率: 98.1, 实时完成率: 97.2 },
  { month: "5月", 中长期: 2050, 基数: 680, 日前现货: 850, 实时现货: 300, total: 3880, 中长期完成率: 96.2, 日前完成率: 98.8, 实时完成率: 98.0 },
  { month: "6月", 中长期: 2100, 基数: 700, 日前现货: 880, 实时现货: 320, total: 4000, 中长期完成率: 95.2, 日前完成率: 98.5, 实时完成率: 97.8 },
];

// 收益构成 - 拆分现货为日前/实时
const revenueComposition = [
  { name: "中长期收益", value: 11520, color: "hsl(var(--chart-1))" },
  { name: "基数收益", value: 3860, color: "hsl(var(--chart-2))" },
  { name: "日前现货", value: 4660, color: "hsl(var(--chart-3))" },
  { name: "实时现货", value: 1660, color: "hsl(var(--chart-4))" },
];

// 电量构成
const electricityComposition = [
  { name: "中长期电量", value: 28500, color: "hsl(var(--chart-1))" },
  { name: "基数电量", value: 9800, color: "hsl(var(--chart-2))" },
  { name: "日前电量", value: 12200, color: "hsl(var(--chart-3))" },
  { name: "实时电量", value: 4500, color: "hsl(var(--chart-4))" },
];

// 度电收益趋势
const unitRevenue = [
  { month: "1月", 度电收益: 385, 行业均值: 378 },
  { month: "2月", 度电收益: 392, 行业均值: 380 },
  { month: "3月", 度电收益: 388, 行业均值: 382 },
  { month: "4月", 度电收益: 395, 行业均值: 385 },
  { month: "5月", 度电收益: 402, 行业均值: 387 },
  { month: "6月", 度电收益: 408, 行业均值: 390 },
];

// 交易完成情况
const tradingCompletion = {
  mediumLongTerm: { target: 11800, actual: 11232, rate: 95.2 },
  dayAhead: { target: 6200, actual: 6107, rate: 98.5 },
  realtime: { target: 850, actual: 831, rate: 97.8 },
  utilizationHours: 1256,
};

// 结算单数据
const settlementData = [
  { period: "2025-01", electricity: 1385.2, fee: 442.5, avgPrice: 319.5, deviation: -2.8, deviationFee: -8.9 },
  { period: "2025-02", electricity: 1298.6, fee: 415.2, avgPrice: 319.8, deviation: 1.5, deviationFee: 4.8 },
  { period: "2025-03", electricity: 1456.8, fee: 468.2, avgPrice: 321.2, deviation: -1.2, deviationFee: -3.9 },
  { period: "2025-04", electricity: 1425.3, fee: 458.6, avgPrice: 321.8, deviation: 0.8, deviationFee: 2.6 },
  { period: "2025-05", electricity: 1568.4, fee: 512.8, avgPrice: 327.0, deviation: -0.5, deviationFee: -1.6 },
  { period: "2025-06", electricity: 1612.5, fee: 532.4, avgPrice: 330.2, deviation: 1.2, deviationFee: 4.0 },
];

const Generation = () => {
  const totalRevenue = revenueComposition.reduce((sum, item) => sum + item.value, 0);
  const totalElectricity = electricityComposition.reduce((sum, item) => sum + item.value, 0);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">发电侧收益分析</h1>
        <p className="text-muted-foreground mt-2">
          中长期交易完成情况、现货交易（日前、实时）完成情况统计展示
        </p>
      </div>

      <DateRangeDisplay
        startDate={new Date(2025, 0, 1)}
        endDate={new Date(2025, 5, 30)}
        lastUpdated={new Date()}
        label="统计周期"
        className="px-4 py-3 bg-muted/20 rounded-lg"
      />

      {/* 收益概览 - 第一行 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总收益</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">
              ¥{(totalRevenue / 1000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">年累计</p>
          </CardContent>
        </Card>
        {revenueComposition.map((item, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                ¥{(item.value / 1000).toFixed(2)}M
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                占比 {((item.value / totalRevenue) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 交易完成率指标卡 - 第二行 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-[hsl(var(--chart-1))]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">中长期完成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">{tradingCompletion.mediumLongTerm.rate}%</span>
              {getTrendIcon(tradingCompletion.mediumLongTerm.rate - 95)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {tradingCompletion.mediumLongTerm.actual.toLocaleString()} / {tradingCompletion.mediumLongTerm.target.toLocaleString()} MWh
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[hsl(var(--chart-3))]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">日前交易完成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">{tradingCompletion.dayAhead.rate}%</span>
              {getTrendIcon(tradingCompletion.dayAhead.rate - 95)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {tradingCompletion.dayAhead.actual.toLocaleString()} / {tradingCompletion.dayAhead.target.toLocaleString()} MWh
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[hsl(var(--chart-4))]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">实时交易完成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">{tradingCompletion.realtime.rate}%</span>
              {getTrendIcon(tradingCompletion.realtime.rate - 95)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {tradingCompletion.realtime.actual} / {tradingCompletion.realtime.target} MWh
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">发电利用小时</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">{tradingCompletion.utilizationHours}h</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">年累计等效利用小时</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="monthly">月度收益</TabsTrigger>
          <TabsTrigger value="composition">收益构成</TabsTrigger>
          <TabsTrigger value="settlement">结算概览</TabsTrigger>
          <TabsTrigger value="unit">度电收益</TabsTrigger>
        </TabsList>

        {/* 月度收益趋势 - 增强版 */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>月度收益趋势</CardTitle>
              <CardDescription>
                按交易类型分解的月度收益对比（含完成率趋势）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: '收益 (万元)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[90, 100]}
                    label={{ value: '完成率 (%)', angle: 90, position: 'insideRight' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="中长期" stackId="a" fill="hsl(var(--chart-1))" name="中长期" />
                  <Bar yAxisId="left" dataKey="基数" stackId="a" fill="hsl(var(--chart-2))" name="基数" />
                  <Bar yAxisId="left" dataKey="日前现货" stackId="a" fill="hsl(var(--chart-3))" name="日前现货" />
                  <Bar yAxisId="left" dataKey="实时现货" stackId="a" fill="hsl(var(--chart-4))" name="实时现货" />
                  <Line yAxisId="right" type="monotone" dataKey="中长期完成率" stroke="hsl(var(--chart-1))" strokeWidth={2} strokeDasharray="5 5" name="中长期完成率" dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="日前完成率" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="5 5" name="日前完成率" dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 收益构成 - 增加电量维度 */}
        <TabsContent value="composition">
          <Card>
            <CardHeader>
              <CardTitle>收益与电量构成分析</CardTitle>
              <CardDescription>
                年度总收益与电量按交易类型占比
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* 收益构成 */}
                <div>
                  <h4 className="font-semibold mb-4 text-center">收益构成</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={revenueComposition}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${((entry.value / totalRevenue) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueComposition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `¥${(value / 1000).toFixed(2)}M`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 电量构成 */}
                <div>
                  <h4 className="font-semibold mb-4 text-center">电量构成</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={electricityComposition}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${((entry.value / totalElectricity) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {electricityComposition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()} MWh`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 构成明细列表 */}
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {revenueComposition.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success font-mono">
                        ¥{(item.value / 1000).toFixed(2)}M
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {electricityComposition[idx]?.value.toLocaleString()} MWh
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 结算概览 - 新增Tab */}
        <TabsContent value="settlement">
          <Card>
            <CardHeader>
              <CardTitle>结算单概览</CardTitle>
              <CardDescription>
                日清分单及月结算单关键性经营指标汇总
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F1F8F4]">
                      <TableHead className="font-semibold">结算周期</TableHead>
                      <TableHead className="text-right font-mono">电量 (MWh)</TableHead>
                      <TableHead className="text-right font-mono">电费 (万元)</TableHead>
                      <TableHead className="text-right font-mono">均价 (元/MWh)</TableHead>
                      <TableHead className="text-right font-mono">偏差 (%)</TableHead>
                      <TableHead className="text-right font-mono">偏差考核费 (万元)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlementData.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-[#F8FBFA]">
                        <TableCell className="font-medium">{row.period}</TableCell>
                        <TableCell className="text-right font-mono">{row.electricity.toFixed(1)}</TableCell>
                        <TableCell className="text-right font-mono text-success">{row.fee.toFixed(1)}</TableCell>
                        <TableCell className="text-right font-mono">{row.avgPrice.toFixed(1)}</TableCell>
                        <TableCell className={`text-right font-mono ${row.deviation >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {row.deviation >= 0 ? '+' : ''}{row.deviation.toFixed(1)}%
                        </TableCell>
                        <TableCell className={`text-right font-mono ${row.deviationFee >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {row.deviationFee >= 0 ? '+' : ''}{row.deviationFee.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* 汇总行 */}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell>合计</TableCell>
                      <TableCell className="text-right font-mono">
                        {settlementData.reduce((sum, r) => sum + r.electricity, 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-success">
                        {settlementData.reduce((sum, r) => sum + r.fee, 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {(settlementData.reduce((sum, r) => sum + r.avgPrice, 0) / settlementData.length).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right font-mono">-</TableCell>
                      <TableCell className={`text-right font-mono ${settlementData.reduce((sum, r) => sum + r.deviationFee, 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {settlementData.reduce((sum, r) => sum + r.deviationFee, 0) >= 0 ? '+' : ''}
                        {settlementData.reduce((sum, r) => sum + r.deviationFee, 0).toFixed(1)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* 月度结算趋势图 */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4">月度结算趋势</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={settlementData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="period" className="text-xs" />
                    <YAxis 
                      yAxisId="left"
                      label={{ value: '电量/电费', angle: -90, position: 'insideLeft' }}
                      className="text-xs" 
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      label={{ value: '均价 (元/MWh)', angle: 90, position: 'insideRight' }}
                      className="text-xs" 
                    />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="electricity" fill="hsl(var(--chart-1))" name="电量 (MWh)" />
                    <Bar yAxisId="left" dataKey="fee" fill="hsl(var(--chart-2))" name="电费 (万元)" />
                    <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="hsl(var(--primary))" strokeWidth={2} name="均价" dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 度电收益 */}
        <TabsContent value="unit">
          <Card>
            <CardHeader>
              <CardTitle>度电收益趋势</CardTitle>
              <CardDescription>
                单位电量收益与行业均值对比
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={unitRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    label={{ value: '度电收益 (元/MWh)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="度电收益" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="度电收益"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="行业均值" 
                    stroke="hsl(var(--chart-4))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="行业均值"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Generation;

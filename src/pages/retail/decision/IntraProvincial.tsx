import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart } from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 决策收益分析数据
const decisionData = [
  { time: "00:00", optimal: 85, actual: 78, market: 72 },
  { time: "03:00", optimal: 88, actual: 82, market: 75 },
  { time: "06:00", optimal: 92, actual: 88, market: 80 },
  { time: "09:00", optimal: 95, actual: 90, market: 85 },
  { time: "12:00", optimal: 90, actual: 86, market: 82 },
  { time: "15:00", optimal: 87, actual: 83, market: 78 },
  { time: "18:00", optimal: 93, actual: 89, market: 84 },
  { time: "21:00", optimal: 89, actual: 85, market: 80 },
];

const profitData = [
  { month: "1月", profit: 1200, cost: 800, revenue: 2000 },
  { month: "2月", profit: 1500, cost: 850, revenue: 2350 },
  { month: "3月", profit: 1800, cost: 900, revenue: 2700 },
  { month: "4月", profit: 1650, cost: 880, revenue: 2530 },
  { month: "5月", profit: 2100, cost: 950, revenue: 3050 },
  { month: "6月", profit: 2300, cost: 1000, revenue: 3300 },
];

const riskData = [
  { scenario: "乐观", probability: 30, revenue: 3500 },
  { scenario: "基准", probability: 50, revenue: 2800 },
  { scenario: "保守", probability: 20, revenue: 2200 },
];

// 模型优化数据
const priceData = [
  { time: "00:15", price: 310 },
  { time: "02:00", price: 295 },
  { time: "03:45", price: 285 },
  { time: "05:30", price: 300 },
  { time: "07:15", price: 340 },
  { time: "09:00", price: 320 },
  { time: "10:45", price: 50 },
  { time: "12:30", price: 45 },
  { time: "14:15", price: 40 },
  { time: "16:00", price: 380 },
  { time: "17:45", price: 420 },
  { time: "19:30", price: 360 },
  { time: "21:15", price: 320 },
  { time: "23:00", price: 280 },
];

const revenueData = [
  { time: "00:15", mjepm: 5000, mlpm: -2000 },
  { time: "01:45", mjepm: 8000, mlpm: 3000 },
  { time: "03:15", mjepm: 12000, mlpm: 8000 },
  { time: "04:45", mjepm: 15000, mlpm: 10000 },
  { time: "06:15", mjepm: 18000, mlpm: 12000 },
  { time: "07:45", mjepm: 22000, mlpm: 15000 },
  { time: "09:15", mjepm: 28000, mlpm: 20000 },
  { time: "10:45", mjepm: 35000, mlpm: 25000 },
  { time: "12:15", mjepm: 42000, mlpm: 30000 },
  { time: "13:45", mjepm: 50000, mlpm: 35000 },
  { time: "15:15", mjepm: 58000, mlpm: 42000 },
  { time: "16:45", mjepm: 65000, mlpm: 50000 },
  { time: "18:15", mjepm: 62000, mlpm: 48000 },
  { time: "19:45", mjepm: 58000, mlpm: 45000 },
  { time: "21:15", mjepm: 52000, mlpm: 40000 },
  { time: "22:45", mjepm: 45000, mlpm: 35000 },
];

// 现货电价分析数据
const hourlyData = [
  { hour: "00", price: 285, volume: 1200, avgPrice: 280 },
  { hour: "01", price: 275, volume: 1150, avgPrice: 270 },
  { hour: "02", price: 270, volume: 1100, avgPrice: 265 },
  { hour: "03", price: 265, volume: 1080, avgPrice: 262 },
  { hour: "04", price: 268, volume: 1120, avgPrice: 265 },
  { hour: "05", price: 280, volume: 1200, avgPrice: 275 },
  { hour: "06", price: 310, volume: 1350, avgPrice: 305 },
  { hour: "07", price: 340, volume: 1500, avgPrice: 335 },
  { hour: "08", price: 365, volume: 1650, avgPrice: 360 },
  { hour: "09", price: 380, volume: 1750, avgPrice: 375 },
  { hour: "10", price: 350, volume: 1600, avgPrice: 345 },
  { hour: "11", price: 320, volume: 1450, avgPrice: 315 },
  { hour: "12", price: 310, volume: 1400, avgPrice: 305 },
  { hour: "13", price: 305, volume: 1380, avgPrice: 300 },
  { hour: "14", price: 315, volume: 1420, avgPrice: 310 },
  { hour: "15", price: 330, volume: 1500, avgPrice: 325 },
  { hour: "16", price: 355, volume: 1620, avgPrice: 350 },
  { hour: "17", price: 385, volume: 1780, avgPrice: 380 },
  { hour: "18", price: 420, volume: 1950, avgPrice: 415 },
  { hour: "19", price: 450, volume: 2100, avgPrice: 445 },
  { hour: "20", price: 410, volume: 1850, avgPrice: 405 },
  { hour: "21", price: 370, volume: 1680, avgPrice: 365 },
  { hour: "22", price: 330, volume: 1500, avgPrice: 325 },
  { hour: "23", price: 300, volume: 1350, avgPrice: 295 },
];

const peakValleyData = [
  { period: "尖峰", hours: 4, avgPrice: 435, volume: 7800 },
  { period: "高峰", hours: 8, avgPrice: 355, volume: 12600 },
  { period: "平段", hours: 8, avgPrice: 305, volume: 11200 },
  { period: "低谷", hours: 4, avgPrice: 270, volume: 4500 },
];

export default function IntraProvincial() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">省内现货策略</h1>
          <p className="text-muted-foreground mt-2">
            省内现货市场交易策略分析、模型优化与决策收益评估
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">省份：</span>
            <Select defaultValue="shanxi">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shanxi">山西省</SelectItem>
                <SelectItem value="shandong">山东省</SelectItem>
                <SelectItem value="zhejiang">浙江省</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">日期：</span>
            <Button variant="outline" size="sm">2025-11-19</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analysis">电价分析</TabsTrigger>
          <TabsTrigger value="optimization">模型优化</TabsTrigger>
          <TabsTrigger value="decision">决策收益</TabsTrigger>
        </TabsList>

        {/* 现货电价分析 */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">当前电价</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-1">¥335</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 8.3%</span> 较上时段
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">日均电价</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-2">¥328</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 3.2%</span> 较昨日
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">峰谷差</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-3">¥185</div>
                <p className="text-sm text-muted-foreground mt-2">
                  最高 ¥450 / 最低 ¥265
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">交易量</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-4">36.1万</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-red-500">↓ 2.1%</span> 较昨日
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>24小时电价走势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: '交易量 (MWh)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="hsl(var(--chart-1))" name="实时电价" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="avgPrice" stroke="hsl(var(--chart-2))" name="均价" strokeWidth={2} strokeDasharray="5 5" />
                  <Bar yAxisId="right" dataKey="volume" fill="hsl(var(--chart-3))" name="交易量" opacity={0.3} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>时段电价分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakValleyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgPrice" fill="hsl(var(--chart-1))" name="平均电价 (元/MWh)" />
                  <Bar dataKey="hours" fill="hsl(var(--chart-2))" name="时段时长 (小时)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 模型优化分析 */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">模型准确率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-1">92.5%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 1.2%</span> 较上周
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">预测误差</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-2">±15元</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500">↓ 3元</span> 较上周
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">优化收益</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-3">+18.5%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  相比基准策略提升
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>电价预测对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--chart-1))" name="实际电价" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>累计收益对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: '累计收益 (元)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="mjepm" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" name="MJEPM策略" />
                  <Area type="monotone" dataKey="mlpm" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" name="MLPM策略" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 决策收益分析 */}
        <TabsContent value="decision" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">总收益</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-1">¥12,550</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 15.3%</span> 较上期
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">决策准确率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-2">89.5%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 2.1%</span> 较上期
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">优化潜力</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-3">+8.2%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  预计可提升收益
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>决策效果对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={decisionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: '收益指数', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="optimal" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" name="最优策略" />
                  <Area type="monotone" dataKey="actual" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" name="实际决策" />
                  <Area type="monotone" dataKey="market" stackId="3" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" name="市场平均" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>收益构成分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: '金额 (万元)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="收入" />
                  <Bar dataKey="cost" fill="hsl(var(--chart-2))" name="成本" />
                  <Bar dataKey="profit" fill="hsl(var(--chart-3))" name="利润" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>风险场景分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskData.map((item) => (
                  <div key={item.scenario} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{item.scenario}场景</div>
                      <div className="text-sm text-muted-foreground">概率: {item.probability}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-chart-1">¥{item.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">预期收益</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

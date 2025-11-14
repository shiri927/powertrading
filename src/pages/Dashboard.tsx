import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const revenueData = [
  { month: "Jan", midTerm: 4200, spot: 2400, total: 6600 },
  { month: "Feb", midTerm: 3800, spot: 2800, total: 6600 },
  { month: "Mar", midTerm: 5100, spot: 3200, total: 8300 },
  { month: "Apr", midTerm: 4500, spot: 3800, total: 8300 },
  { month: "May", midTerm: 5800, spot: 4200, total: 10000 },
  { month: "Jun", midTerm: 5200, spot: 4800, total: 10000 },
];

const priceData = [
  { time: "00:00", dayAhead: 320, realTime: 315 },
  { time: "04:00", dayAhead: 280, realTime: 285 },
  { time: "08:00", dayAhead: 420, realTime: 425 },
  { time: "12:00", dayAhead: 480, realTime: 475 },
  { time: "16:00", dayAhead: 520, realTime: 515 },
  { time: "20:00", dayAhead: 450, realTime: 460 },
];

const Dashboard = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">数据概览</h1>
        <p className="text-muted-foreground mt-2">
          实时监控与分析电力交易运营情况
        </p>
      </div>

      {/* Tabs for Generation/Retail Side */}
      <Tabs defaultValue="generation" className="w-full">
        <TabsList>
          <TabsTrigger value="generation">发电侧</TabsTrigger>
          <TabsTrigger value="retail">售电侧</TabsTrigger>
        </TabsList>

        <TabsContent value="generation" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="总收益"
              value="¥10.2M"
              change="较上月 +12.5%"
              changeType="positive"
              icon={DollarSign}
            />
            <MetricCard
              title="现货市场收益"
              value="¥4.8M"
              change="较上月 +8.3%"
              changeType="positive"
              icon={TrendingUp}
            />
            <MetricCard
              title="发电量"
              value="28,450 MWh"
              change="较上月 +5.2%"
              changeType="positive"
              icon={Zap}
            />
            <MetricCard
              title="平均现货价格"
              value="¥426/MWh"
              change="较上月 -2.1%"
              changeType="negative"
              icon={Clock}
            />
          </div>

          {/* Revenue Analysis Chart */}
          <Card>
            <CardHeader>
              <CardTitle>收益分析</CardTitle>
              <CardDescription>
                中长期与现货市场收益趋势对比
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="midTerm" 
                    stackId="1"
                    stroke="hsl(var(--chart-1))" 
                    fill="hsl(var(--chart-1))"
                    name="中长期收益"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spot" 
                    stackId="1"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))"
                    name="现货收益"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Price Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>趋势分析</CardTitle>
              <CardDescription>
                日前与实时节点电价对比
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="dayAhead" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="日前电价"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="realTime" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="实时电价"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>发电表现</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">中长期交易</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">18,250 MWh</span>
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">现货交易（日前）</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">6,420 MWh</span>
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">现货交易（实时）</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">3,780 MWh</span>
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>价格表现</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">平均结算价格</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">¥412/MWh</span>
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">峰值价格</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">¥585/MWh</span>
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">谷值价格</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">¥245/MWh</span>
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retail" className="space-y-6">
          {/* Key Metrics for Retail */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="总收益"
              value="¥8.5M"
              change="较上月 +15.2%"
              changeType="positive"
              icon={DollarSign}
            />
            <MetricCard
              title="客户数量"
              value="2,450"
              change="+125 新增客户"
              changeType="positive"
              icon={TrendingUp}
            />
            <MetricCard
              title="总用电量"
              value="32,800 MWh"
              change="较上月 +7.8%"
              changeType="positive"
              icon={Zap}
            />
            <MetricCard
              title="平均单位收益"
              value="¥0.259/kWh"
              change="较上月 +3.5%"
              changeType="positive"
              icon={Clock}
            />
          </div>

          {/* Customer Revenue Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>用户收益分析</CardTitle>
              <CardDescription>
                按客户群体划分的收益分布
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="total" 
                    fill="hsl(var(--chart-1))"
                    name="总收益"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

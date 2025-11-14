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
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Real-time monitoring and analysis of power trading operations
        </p>
      </div>

      {/* Tabs for Generation/Retail Side */}
      <Tabs defaultValue="generation" className="w-full">
        <TabsList>
          <TabsTrigger value="generation">Generation Side (发电侧)</TabsTrigger>
          <TabsTrigger value="retail">Retail Side (售电侧)</TabsTrigger>
        </TabsList>

        <TabsContent value="generation" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value="¥10.2M"
              change="+12.5% from last month"
              changeType="positive"
              icon={DollarSign}
            />
            <MetricCard
              title="Spot Market Revenue"
              value="¥4.8M"
              change="+8.3% from last month"
              changeType="positive"
              icon={TrendingUp}
            />
            <MetricCard
              title="Generation Volume"
              value="28,450 MWh"
              change="+5.2% from last month"
              changeType="positive"
              icon={Zap}
            />
            <MetricCard
              title="Average Spot Price"
              value="¥426/MWh"
              change="-2.1% from last month"
              changeType="negative"
              icon={Clock}
            />
          </div>

          {/* Revenue Analysis Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis (收益分析)</CardTitle>
              <CardDescription>
                Mid-term vs Spot Market Revenue Trends
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
                    name="Mid-term Revenue (中长期收益)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spot" 
                    stackId="1"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))"
                    name="Spot Revenue (现货收益)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Price Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Price Trend Analysis (趋势分析)</CardTitle>
              <CardDescription>
                Day-ahead vs Real-time Node Prices
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
                    name="Day-ahead Price (日前电价)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="realTime" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Real-time Price (实时电价)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generation Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mid-term Trading</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">18,250 MWh</span>
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Spot Trading (Day-ahead)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">6,420 MWh</span>
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Spot Trading (Real-time)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">3,780 MWh</span>
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Settlement Price</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">¥412/MWh</span>
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Peak Price</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">¥585/MWh</span>
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valley Price</span>
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
              title="Total Revenue"
              value="¥8.5M"
              change="+15.2% from last month"
              changeType="positive"
              icon={DollarSign}
            />
            <MetricCard
              title="Customer Base"
              value="2,450"
              change="+125 new customers"
              changeType="positive"
              icon={TrendingUp}
            />
            <MetricCard
              title="Total Consumption"
              value="32,800 MWh"
              change="+7.8% from last month"
              changeType="positive"
              icon={Zap}
            />
            <MetricCard
              title="Avg Unit Revenue"
              value="¥0.259/kWh"
              change="+3.5% from last month"
              changeType="positive"
              icon={Clock}
            />
          </div>

          {/* Customer Revenue Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Revenue Analysis (用户收益分析)</CardTitle>
              <CardDescription>
                Revenue distribution by customer segments
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
                    name="Total Revenue (总收益)"
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

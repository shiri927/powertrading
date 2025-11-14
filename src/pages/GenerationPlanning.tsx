import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Calendar, 
  TrendingUp,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const planOverview = {
  totalUnits: 24,
  completed: 18,
  pending: 4,
  draft: 2
};

const monthlyPlan = [
  { month: "Jan", plan: 8500, actual: 8320, completion: 97.9 },
  { month: "Feb", plan: 7800, actual: 7650, completion: 98.1 },
  { month: "Mar", plan: 9200, actual: 8950, completion: 97.3 },
  { month: "Apr", plan: 8600, actual: 8480, completion: 98.6 },
  { month: "May", plan: 9500, actual: 9280, completion: 97.7 },
  { month: "Jun", plan: 9100, actual: null, completion: null },
];

const planBreakdown = [
  { type: "Mid-term", volume: 52000, price: 385, revenue: 20020 },
  { type: "Green Power", volume: 8500, price: 420, revenue: 3570 },
  { type: "Spot Market", volume: 18200, price: 428, revenue: 7790 },
  { type: "Non-market", volume: 3200, price: 365, revenue: 1168 },
];

const powerForecast = [
  { hour: 0, forecasted: 350, actual: 345 },
  { hour: 4, forecasted: 280, actual: 275 },
  { hour: 8, forecasted: 520, actual: 528 },
  { hour: 12, forecasted: 680, actual: 672 },
  { hour: 16, forecasted: 720, actual: 715 },
  { hour: 20, forecasted: 580, actual: 590 },
];

const GenerationPlanning = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">发电计划管理</h1>
          <p className="text-muted-foreground mt-2">
            新能源发电计划与功率预测
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新建计划
        </Button>
      </div>

      {/* Plan Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">交易单元总数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planOverview.totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">交易单元</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{planOverview.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((planOverview.completed / planOverview.totalUnits) * 100).toFixed(1)}% 完成率
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待发布</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{planOverview.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">待发布计划</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">草稿</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planOverview.draft}</div>
            <p className="text-xs text-muted-foreground mt-1">制定中</p>
          </CardContent>
        </Card>
      </div>

      {/* Annual Plan Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>年度发电计划追踪</CardTitle>
          <CardDescription>
            月度计划与实际发电量对比及完成率
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyPlan}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis 
                yAxisId="left"
                label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft' }}
                className="text-xs" 
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                label={{ value: '完成率 (%)', angle: 90, position: 'insideRight' }}
                className="text-xs" 
              />
              <Tooltip />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="plan" 
                fill="hsl(var(--chart-1))"
                name="计划"
              />
              <Bar 
                yAxisId="left"
                dataKey="actual" 
                fill="hsl(var(--chart-2))"
                name="实际"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="completion" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="完成率 (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Plan Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>商业计划分解</CardTitle>
          <CardDescription>
            按交易类型统计的收益追踪
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {planBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{item.type}</span>
                    <Badge variant="outline">
                      {item.volume.toLocaleString()} MWh
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-success">
                      ¥{item.revenue.toLocaleString()}K
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg ¥{item.price}/MWh
                    </div>
                  </div>
                </div>
                <Progress 
                  value={item.type === "Mid-term" ? 95 : item.type === "Green Power" ? 88 : 92} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>年累完成率</span>
                  <span>{item.type === "Mid-term" ? "95%" : item.type === "Green Power" ? "88%" : "92%"}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Short-term Power Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            短期功率预测
          </CardTitle>
          <CardDescription>
            24小时发电量预测与实际出力对比
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">预测准确率</div>
              <div className="text-xl font-bold text-success">96.8%</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">峰值预测</div>
              <div className="text-xl font-bold">720 MW</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">谷值预测</div>
              <div className="text-xl font-bold">280 MW</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={powerForecast}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="hour" 
                label={{ value: '小时', position: 'insideBottom', offset: -5 }}
                className="text-xs" 
              />
              <YAxis 
                label={{ value: '功率输出 (MW)', angle: -90, position: 'insideLeft' }}
                className="text-xs" 
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="forecasted" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="预测"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                name="实际出力"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerationPlanning;

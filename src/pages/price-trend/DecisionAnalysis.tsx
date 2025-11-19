import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Button } from "@/components/ui/button";

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

export default function DecisionAnalysis() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">决策收益分析</h1>
          <p className="text-muted-foreground mt-2">
            分析交易决策的收益表现与市场对比
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
            <span className="text-sm text-muted-foreground">分析周期：</span>
            <Select defaultValue="month">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">日</SelectItem>
                <SelectItem value="week">周</SelectItem>
                <SelectItem value="month">月</SelectItem>
                <SelectItem value="year">年</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
            <CardTitle className="text-base">优化空间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">6.8%</div>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="text-orange-500">可提升收益</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 决策效果对比 */}
        <Card>
          <CardHeader>
            <CardTitle>决策效果对比</CardTitle>
            <p className="text-sm text-muted-foreground">收益率 (%)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={decisionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="optimal" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="最优决策" />
                <Area type="monotone" dataKey="actual" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="实际决策" />
                <Area type="monotone" dataKey="market" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="市场平均" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 收益构成分析 */}
        <Card>
          <CardHeader>
            <CardTitle>收益构成分析</CardTitle>
            <p className="text-sm text-muted-foreground">金额 (万元)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="总收入" />
                <Bar dataKey="cost" fill="#ef4444" name="总成本" />
                <Bar dataKey="profit" fill="#3b82f6" name="净利润" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 风险场景分析 */}
      <Card>
        <CardHeader>
          <CardTitle>风险场景分析</CardTitle>
          <p className="text-sm text-muted-foreground">不同市场情景下的收益预期</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskData.map((scenario) => (
              <Card key={scenario.scenario}>
                <CardHeader>
                  <CardTitle className="text-lg">{scenario.scenario}场景</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">概率</p>
                      <p className="text-2xl font-bold text-foreground">{scenario.probability}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">预期收益</p>
                      <p className="text-2xl font-bold text-chart-1">¥{scenario.revenue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

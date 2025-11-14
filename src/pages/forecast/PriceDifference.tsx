import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ResponsiveContainer 
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

// 价差预测数据
const priceDifferenceData = Array.from({ length: 96 }, (_, i) => ({
  point: i + 1,
  预测价差: Math.random() * 100 - 50,
  修正价差: Math.random() * 90 - 45,
}));

// 价差分布统计
const distributionData = [
  { range: "< -50", count: 145 },
  { range: "-50~-20", count: 280 },
  { range: "-20~0", count: 520 },
  { range: "0~20", count: 680 },
  { range: "20~50", count: 420 },
  { range: "> 50", count: 255 },
];

const PriceDifference = () => {
  const avgDifference = 12.5;
  const direction = avgDifference > 0 ? "上涨" : "下跌";
  
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">价差预测</h1>
        <p className="text-muted-foreground mt-2">
          现货市场日前与实时电价价差预测分析
        </p>
      </div>

      {/* 价差趋势预测 */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">平均价差预测</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {avgDifference > 0 ? '+' : ''}{avgDifference}
              </div>
              <Badge variant={avgDifference > 0 ? "default" : "secondary"}>
                元/MWh
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">价差方向</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {avgDifference > 0 ? (
                <TrendingUp className="h-8 w-8 text-success" />
              ) : (
                <TrendingDown className="h-8 w-8 text-destructive" />
              )}
              <span className="text-2xl font-bold">{direction}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">预测准确率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">89.2%</div>
              <Badge variant="outline">近30日</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 96点价差预测曲线 */}
      <Card>
        <CardHeader>
          <CardTitle>日内96点价差预测</CardTitle>
          <CardDescription>
            修正前后价差预测对比（实时电价 - 日前电价）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={priceDifferenceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="point" 
                label={{ value: '时段点', position: 'insideBottom', offset: -5 }}
                className="text-xs" 
              />
              <YAxis 
                label={{ value: '价差 (元/MWh)', angle: -90, position: 'insideLeft' }}
                className="text-xs" 
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="预测价差" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name="修正前"
              />
              <Line 
                type="monotone" 
                dataKey="修正价差" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                name="修正后"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 价差分布统计 */}
      <Card>
        <CardHeader>
          <CardTitle>历史价差分布统计</CardTitle>
          <CardDescription>
            近30日价差区间分布情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="range" 
                label={{ value: '价差区间 (元/MWh)', position: 'insideBottom', offset: -5 }}
                className="text-xs" 
              />
              <YAxis 
                label={{ value: '出现次数', angle: -90, position: 'insideLeft' }}
                className="text-xs" 
              />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" name="次数" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceDifference;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const energyPriceData = [
  { month: "1月", coal: 880, naturalGas: 3200, crude: 580 },
  { month: "2月", coal: 875, naturalGas: 3150, crude: 575 },
  { month: "3月", coal: 890, naturalGas: 3280, crude: 590 },
  { month: "4月", coal: 905, naturalGas: 3350, crude: 605 },
  { month: "5月", coal: 895, naturalGas: 3300, crude: 595 },
  { month: "6月", coal: 910, naturalGas: 3400, crude: 610 },
];

const EnergyQuotes = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">能源行情</h1>
        <p className="text-muted-foreground mt-2">
          主要能源品种价格走势与市场分析
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              动力煤
            </CardTitle>
            <CardDescription>秦皇岛港5500大卡</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">¥910</div>
            <p className="text-sm text-muted-foreground mt-1">元/吨</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-chart-3">
              <TrendingUp className="h-4 w-4" />
              <span>+3.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-chart-2" />
              天然气
            </CardTitle>
            <CardDescription>LNG现货价格</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">¥3,400</div>
            <p className="text-sm text-muted-foreground mt-1">元/吨</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-destructive">
              <TrendingDown className="h-4 w-4" />
              <span>-1.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-4" />
              原油
            </CardTitle>
            <CardDescription>布伦特原油</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4">$610</div>
            <p className="text-sm text-muted-foreground mt-1">元/桶</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-chart-3">
              <TrendingUp className="h-4 w-4" />
              <span>+2.8%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>能源价格走势</CardTitle>
          <CardDescription>近6个月主要能源价格对比</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={energyPriceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: '价格', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="coal" fill="hsl(var(--primary))" name="动力煤 (元/吨)" />
              <Bar dataKey="naturalGas" fill="hsl(var(--chart-2))" name="天然气 (元/吨)" />
              <Bar dataKey="crude" fill="hsl(var(--chart-4))" name="原油 (元/桶)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyQuotes;

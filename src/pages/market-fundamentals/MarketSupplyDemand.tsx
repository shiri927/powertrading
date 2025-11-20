import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

const supplyDemandData = [
  { hour: 0, supply: 15200, demand: 12500, reserve: 2700 },
  { hour: 4, supply: 12800, demand: 10200, reserve: 2600 },
  { hour: 8, supply: 18500, demand: 15800, reserve: 2700 },
  { hour: 12, supply: 21200, demand: 18500, reserve: 2700 },
  { hour: 16, supply: 22800, demand: 19800, reserve: 3000 },
  { hour: 20, supply: 20100, demand: 17200, reserve: 2900 },
  { hour: 23, supply: 16500, demand: 13800, reserve: 2700 },
];

const MarketSupplyDemand = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">市场供需</h1>
        <p className="text-muted-foreground mt-2">
          市场供需平衡与备用容量分析
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              当前供电
            </CardTitle>
            <CardDescription>实时供电能力</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">21,200</div>
            <p className="text-sm text-muted-foreground mt-1">兆瓦</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-chart-2" />
              当前负荷
            </CardTitle>
            <CardDescription>实时电力需求</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">18,500</div>
            <p className="text-sm text-muted-foreground mt-1">兆瓦</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>备用容量</CardTitle>
            <CardDescription>供需差额</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">2,700</div>
            <p className="text-sm text-muted-foreground mt-1">兆瓦</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>24小时供需平衡</CardTitle>
          <CardDescription>供电、需求与备用容量趋势</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={supplyDemandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                label={{ value: '时段 (小时)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis label={{ value: '功率 (兆瓦)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="supply" 
                stroke="hsl(var(--primary))" 
                name="供电" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="demand" 
                stroke="hsl(var(--chart-2))" 
                name="需求" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="reserve" 
                stroke="hsl(var(--chart-3))" 
                name="备用容量" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketSupplyDemand;

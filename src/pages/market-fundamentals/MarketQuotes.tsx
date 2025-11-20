import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const spotPriceData = [
  { hour: 0, provincial: 280, interProvincial: 285 },
  { hour: 4, provincial: 245, interProvincial: 250 },
  { hour: 8, provincial: 380, interProvincial: 375 },
  { hour: 12, provincial: 450, interProvincial: 445 },
  { hour: 16, provincial: 520, interProvincial: 515 },
  { hour: 20, provincial: 480, interProvincial: 485 },
  { hour: 23, provincial: 320, interProvincial: 325 },
];

const MarketQuotes = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">市场行情</h1>
        <p className="text-muted-foreground mt-2">
          实时市场价格与交易行情分析
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              省内现货价格
            </CardTitle>
            <CardDescription>当前价格</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">¥450</div>
            <p className="text-sm text-muted-foreground mt-1">元/兆瓦时</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              省间现货价格
            </CardTitle>
            <CardDescription>当前价格</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">¥445</div>
            <p className="text-sm text-muted-foreground mt-1">元/兆瓦时</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>价差</CardTitle>
            <CardDescription>省内-省间</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">¥5</div>
            <p className="text-sm text-muted-foreground mt-1">元/兆瓦时</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>24小时价格走势</CardTitle>
          <CardDescription>省内与省间现货电价对比</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={spotPriceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                label={{ value: '时段 (小时)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis label={{ value: '价格 (元/兆瓦时)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="provincial" 
                stroke="hsl(var(--primary))" 
                name="省内现货" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="interProvincial" 
                stroke="hsl(var(--chart-2))" 
                name="省间现货" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketQuotes;

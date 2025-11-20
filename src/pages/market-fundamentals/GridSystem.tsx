import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const systemLoadData = [
  { hour: 0, load: 12500, capacity: 15000 },
  { hour: 4, load: 10200, capacity: 15000 },
  { hour: 8, load: 15800, capacity: 15000 },
  { hour: 12, load: 18500, capacity: 15000 },
  { hour: 16, load: 19800, capacity: 15000 },
  { hour: 20, load: 17200, capacity: 15000 },
  { hour: 23, load: 13800, capacity: 15000 },
];

const GridSystem = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">电网系统</h1>
        <p className="text-muted-foreground mt-2">
          电网运行状态与系统负荷监测
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              系统负荷
            </CardTitle>
            <CardDescription>当前负荷</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">18,500</div>
            <p className="text-sm text-muted-foreground mt-1">兆瓦</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-chart-2" />
              系统容量
            </CardTitle>
            <CardDescription>总装机容量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">15,000</div>
            <p className="text-sm text-muted-foreground mt-1">兆瓦</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>负荷率</CardTitle>
            <CardDescription>当前负荷率</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">81%</div>
            <p className="text-sm text-muted-foreground mt-1">容量利用率</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>运行状态</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-lg">正常</Badge>
            <p className="text-sm text-muted-foreground mt-2">稳定运行中</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>系统负荷曲线</CardTitle>
          <CardDescription>24小时负荷与容量对比</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={systemLoadData}>
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
                dataKey="load" 
                stroke="hsl(var(--primary))" 
                name="系统负荷" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="capacity" 
                stroke="hsl(var(--chart-2))" 
                name="系统容量" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            系统告警
          </CardTitle>
          <CardDescription>当前系统告警信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-chart-4 bg-muted/50 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">负荷预警</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    预计18:00-20:00时段负荷接近系统容量上限
                  </p>
                </div>
                <Badge variant="outline">低风险</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GridSystem;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

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

const distributionData = [
  { range: "0-100", count: 3 },
  { range: "100-200", count: 0 },
  { range: "200-300", count: 5 },
  { range: "300-400", count: 12 },
  { range: "400-500", count: 2 },
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

const incomeData = [
  { time: "00:15", mjepmRevenue: 2000, mlpmRevenue: 1500, mjepmSystem: 2.5, mlpmSystem: 2.0 },
  { time: "01:45", mjepmRevenue: 2200, mlpmRevenue: 1800, mjepmSystem: 3.0, mlpmSystem: 2.5 },
  { time: "03:15", mjepmRevenue: 2500, mlpmRevenue: 2000, mjepmSystem: 3.5, mlpmSystem: 3.0 },
  { time: "04:45", mjepmRevenue: 2800, mlpmRevenue: 2300, mjepmSystem: 4.0, mlpmSystem: 3.5 },
  { time: "06:15", mjepmRevenue: 3200, mlpmRevenue: 2600, mjepmSystem: 4.5, mlpmSystem: 4.0 },
  { time: "07:45", mjepmRevenue: 3600, mlpmRevenue: 3000, mjepmSystem: 5.0, mlpmSystem: 4.5 },
  { time: "09:15", mjepmRevenue: 4000, mlpmRevenue: 3400, mjepmSystem: 5.5, mlpmSystem: 5.0 },
  { time: "10:45", mjepmRevenue: 4200, mlpmRevenue: 3600, mjepmSystem: 5.0, mlpmSystem: 4.8 },
  { time: "12:15", mjepmRevenue: 4000, mlpmRevenue: 3400, mjepmSystem: 4.5, mlpmSystem: 4.2 },
  { time: "13:45", mjepmRevenue: 3800, mlpmRevenue: 3200, mjepmSystem: 4.0, mlpmSystem: 3.8 },
  { time: "15:15", mjepmRevenue: 3500, mlpmRevenue: 3000, mjepmSystem: 3.5, mlpmSystem: 3.2 },
];

const improvementData = [
  { time: "00:15", mjepm: 15, mlpm: 12 },
  { time: "04:45", mjepm: 18, mlpm: 15 },
  { time: "09:15", mjepm: 22, mlpm: 18 },
  { time: "13:45", mjepm: 25, mlpm: 20 },
  { time: "18:15", mjepm: 20, mlpm: 17 },
  { time: "22:45", mjepm: 16, mlpm: 13 },
];

export default function ModelOptimization() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">模型优化分析</h1>
          <p className="text-muted-foreground mt-2">
            基于历史数据和机器学习算法优化电价预测模型
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
            <span className="text-sm text-muted-foreground">数据更新时间：</span>
            <Button variant="outline" size="sm">2025-11-19</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 电价预测 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>电价预测</span>
              <Select defaultValue="current">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">当前</SelectItem>
                  <SelectItem value="tomorrow">明日</SelectItem>
                  <SelectItem value="week">本周</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
            <p className="text-sm text-muted-foreground">电价 (元/MWh)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceData}>
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
                <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 预测收益情况 */}
        <Card>
          <CardHeader>
            <CardTitle>预测收益情况</CardTitle>
            <p className="text-sm text-muted-foreground">收益 (元)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
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
                <Line type="monotone" dataKey="mjepm" stroke="#3b82f6" strokeWidth={2} name="MJEPM-收益" />
                <Line type="monotone" dataKey="mlpm" stroke="#10b981" strokeWidth={2} name="MLPM-收益" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 电价分布 */}
        <Card>
          <CardHeader>
            <CardTitle>电价分布</CardTitle>
            <p className="text-sm text-muted-foreground">电价 (元/MWh)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 预测度电收益 */}
        <Card>
          <CardHeader>
            <CardTitle>预测度电收益</CardTitle>
            <p className="text-sm text-muted-foreground">度电收益 (元)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Bar yAxisId="left" dataKey="mjepmRevenue" fill="#3b82f6" name="MJEPM-度电收益" />
                <Bar yAxisId="left" dataKey="mlpmRevenue" fill="#10b981" name="MLPM-度电收益" />
                <Line yAxisId="right" type="monotone" dataKey="mjepmSystem" stroke="#f59e0b" strokeWidth={2} name="MJEPM-跟踪系统" />
                <Line yAxisId="right" type="monotone" dataKey="mlpmSystem" stroke="#8b5cf6" strokeWidth={2} name="MLPM-跟踪系统" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 预测空间提升 */}
      <Card>
        <CardHeader>
          <CardTitle>预测空间提升</CardTitle>
          <p className="text-sm text-muted-foreground">提升空间 (%)</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={improvementData}>
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
              <Line type="monotone" dataKey="mjepm" stroke="#3b82f6" strokeWidth={2} name="MJEPM" />
              <Line type="monotone" dataKey="mlpm" stroke="#10b981" strokeWidth={2} name="MLPM" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

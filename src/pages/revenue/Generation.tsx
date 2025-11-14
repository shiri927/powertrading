import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

// 月度收益数据
const monthlyRevenue = [
  { month: "1月", 中长期: 1850, 基数: 620, 现货: 980, total: 3450 },
  { month: "2月", 中长期: 1720, 基数: 580, 现货: 920, total: 3220 },
  { month: "3月", 中长期: 1920, 基数: 650, 现货: 1050, total: 3620 },
  { month: "4月", 中长期: 1880, 基数: 630, 现货: 1020, total: 3530 },
  { month: "5月", 中长期: 2050, 基数: 680, 现货: 1150, total: 3880 },
  { month: "6月", 中长期: 2100, 基数: 700, 现货: 1200, total: 4000 },
];

// 收益构成
const revenueComposition = [
  { name: "中长期收益", value: 11520, color: "hsl(var(--chart-1))" },
  { name: "基数收益", value: 3860, color: "hsl(var(--chart-2))" },
  { name: "现货收益", value: 6320, color: "hsl(var(--chart-3))" },
];

// 度电收益趋势
const unitRevenue = [
  { month: "1月", 度电收益: 385, 行业均值: 378 },
  { month: "2月", 度电收益: 392, 行业均值: 380 },
  { month: "3月", 度电收益: 388, 行业均值: 382 },
  { month: "4月", 度电收益: 395, 行业均值: 385 },
  { month: "5月", 度电收益: 402, 行业均值: 387 },
  { month: "6月", 度电收益: 408, 行业均值: 390 },
];

const Generation = () => {
  const totalRevenue = revenueComposition.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">发电侧收益分析</h1>
        <p className="text-muted-foreground mt-2">
          多维度发电收益分析与趋势追踪
        </p>
      </div>

      {/* 收益概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总收益</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ¥{(totalRevenue / 1000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">年累计</p>
          </CardContent>
        </Card>
        {revenueComposition.map((item, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{(item.value / 1000).toFixed(2)}M
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                占比 {((item.value / totalRevenue) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="monthly">月度收益</TabsTrigger>
          <TabsTrigger value="composition">收益构成</TabsTrigger>
          <TabsTrigger value="unit">度电收益</TabsTrigger>
        </TabsList>

        {/* 月度收益趋势 */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>月度收益趋势</CardTitle>
              <CardDescription>
                按交易类型分解的月度收益对比
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    label={{ value: '收益 (万元)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="中长期" stackId="a" fill="hsl(var(--chart-1))" name="中长期" />
                  <Bar dataKey="基数" stackId="a" fill="hsl(var(--chart-2))" name="基数" />
                  <Bar dataKey="现货" stackId="a" fill="hsl(var(--chart-3))" name="现货" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 收益构成 */}
        <TabsContent value="composition">
          <Card>
            <CardHeader>
              <CardTitle>收益构成分析</CardTitle>
              <CardDescription>
                年度总收益按交易类型占比
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueComposition}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${((entry.value / totalRevenue) * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueComposition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {revenueComposition.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success">
                          ¥{(item.value / 1000).toFixed(2)}M
                        </div>
                        <Badge variant="outline">
                          {((item.value / totalRevenue) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 度电收益 */}
        <TabsContent value="unit">
          <Card>
            <CardHeader>
              <CardTitle>度电收益趋势</CardTitle>
              <CardDescription>
                单位电量收益与行业均值对比
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={unitRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    label={{ value: '度电收益 (元/MWh)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="度电收益" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="度电收益"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="行业均值" 
                    stroke="hsl(var(--chart-4))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="行业均值"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Generation;

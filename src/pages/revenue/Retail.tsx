import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar,
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

// 用户收益数据
const userRevenue = [
  { name: "用户A", 用电量: 1250, 收入: 485, 套餐: "套餐1" },
  { name: "用户B", 用电量: 980, 收入: 378, 套餐: "套餐2" },
  { name: "用户C", 用电量: 1580, 收入: 612, 套餐: "套餐1" },
  { name: "用户D", 用电量: 720, 收入: 282, 套餐: "套餐3" },
  { name: "用户E", 用电量: 1120, 收入: 435, 套餐: "套餐2" },
];

// 套餐收益分布
const packageRevenue = [
  { name: "套餐1", value: 1097, users: 5, color: "hsl(var(--chart-1))" },
  { name: "套餐2", value: 813, users: 3, color: "hsl(var(--chart-2))" },
  { name: "套餐3", value: 282, users: 2, color: "hsl(var(--chart-3))" },
];

// 月度收益趋势
const monthlyRevenue = [
  { month: "1月", 收入: 1850, 用电量: 4820 },
  { month: "2月", 收入: 1720, 用电量: 4580 },
  { month: "3月", 收入: 1920, 用电量: 5120 },
  { month: "4月", 收入: 1880, 用电量: 4950 },
  { month: "5月", 收入: 2050, 用电量: 5380 },
  { month: "6月", 收入: 2192, 用电量: 5650 },
];

const Retail = () => {
  const totalRevenue = packageRevenue.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">售电侧收益分析</h1>
        <p className="text-muted-foreground mt-2">
          按用户和套餐维度的收益分析
        </p>
      </div>

      {/* 收益概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总收入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">
              ¥{(totalRevenue / 1000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">年累计</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">服务用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{userRevenue.length}</div>
            <p className="text-xs text-muted-foreground mt-1">活跃用户</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">平均收入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              ¥{(totalRevenue / userRevenue.length).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">每户年均</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">套餐类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{packageRevenue.length}</div>
            <p className="text-xs text-muted-foreground mt-1">在售套餐</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">按用户分析</TabsTrigger>
          <TabsTrigger value="package">按套餐分析</TabsTrigger>
          <TabsTrigger value="monthly">月度趋势</TabsTrigger>
        </TabsList>

        {/* 按用户分析 */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>用户收益排行</CardTitle>
              <CardDescription>
                各用户用电量与收入统计
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: '用电量 (MWh)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    label={{ value: '收入 (万元)', angle: 90, position: 'insideRight' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="用电量" fill="hsl(var(--chart-1))" name="用电量" />
                  <Bar yAxisId="right" dataKey="收入" fill="hsl(var(--chart-2))" name="收入" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-3">
                {userRevenue.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{idx + 1}</Badge>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.套餐}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success">¥{user.收入}K</div>
                      <div className="text-sm text-muted-foreground">{user.用电量} MWh</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 按套餐分析 */}
        <TabsContent value="package">
          <Card>
            <CardHeader>
              <CardTitle>套餐收益分布</CardTitle>
              <CardDescription>
                不同套餐类型的收益贡献
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={packageRevenue}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${((entry.value / totalRevenue) * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {packageRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {packageRevenue.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.users} 户
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success">
                          ¥{item.value}K
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

        {/* 月度趋势 */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>月度收益趋势</CardTitle>
              <CardDescription>
                月度收入与用电量变化趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: '收入 (万元)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    label={{ value: '用电量 (MWh)', angle: 90, position: 'insideRight' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="收入" fill="hsl(var(--chart-1))" name="收入" />
                  <Bar yAxisId="right" dataKey="用电量" fill="hsl(var(--chart-2))" name="用电量" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Retail;

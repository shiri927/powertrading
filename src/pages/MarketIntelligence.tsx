import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { TrendingUp, AlertCircle, FileText } from "lucide-react";

const spotPriceData = [
  { hour: 0, provincial: 280, interProvincial: 285, load: 12500 },
  { hour: 4, provincial: 245, interProvincial: 250, load: 10200 },
  { hour: 8, provincial: 380, interProvincial: 375, load: 15800 },
  { hour: 12, provincial: 450, interProvincial: 445, load: 18500 },
  { hour: 16, provincial: 520, interProvincial: 515, load: 19800 },
  { hour: 20, provincial: 480, interProvincial: 485, load: 17200 },
  { hour: 23, provincial: 320, interProvincial: 325, load: 13800 },
];

const midTermData = [
  { month: "Jan", firePrice: 385, renewablePrice: 362 },
  { month: "Feb", firePrice: 378, renewablePrice: 355 },
  { month: "Mar", firePrice: 392, renewablePrice: 368 },
  { month: "Apr", firePrice: 405, renewablePrice: 375 },
  { month: "May", firePrice: 398, renewablePrice: 370 },
  { month: "Jun", firePrice: 412, renewablePrice: 382 },
];

const settlementData = [
  { type: "Wind", volume: 8500, price: 368, revenue: 3128 },
  { type: "Solar", volume: 6200, price: 372, revenue: 2306 },
  { type: "Coal", volume: 12800, price: 405, revenue: 5184 },
  { type: "Hydro", volume: 4500, price: 358, revenue: 1611 },
];

const policyNews = [
  {
    id: 1,
    title: "Notice on New Energy Grid Integration Policy Updates",
    date: "2024-03-15",
    type: "Policy",
    priority: "high"
  },
  {
    id: 2,
    title: "Q1 2024 Spot Market Settlement Guidelines",
    date: "2024-03-10",
    type: "Guideline",
    priority: "medium"
  },
  {
    id: 3,
    title: "Mid-term Trading Platform Maintenance Announcement",
    date: "2024-03-08",
    type: "Notice",
    priority: "low"
  },
];

const MarketIntelligence = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">市场情报</h1>
        <p className="text-muted-foreground mt-2">
          全面的市场数据分析与政策资讯
        </p>
      </div>

      {/* Policy & News Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            政策文章与市场公告
          </CardTitle>
          <CardDescription>
            宁夏交易中心最新公告通知
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {policyNews.map((news) => (
              <div 
                key={news.id} 
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{news.title}</h3>
                    <Badge variant={
                      news.priority === "high" ? "destructive" : 
                      news.priority === "medium" ? "default" : "secondary"
                    }>
                      {news.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{news.date}</p>
                </div>
                {news.priority === "high" && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Tabs */}
      <Tabs defaultValue="spot" className="w-full">
        <TabsList>
          <TabsTrigger value="spot">现货市场</TabsTrigger>
          <TabsTrigger value="midterm">中长期交易</TabsTrigger>
          <TabsTrigger value="settlement">结算披露</TabsTrigger>
        </TabsList>

        {/* Spot Market Tab */}
        <TabsContent value="spot" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">省内现货</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥428/MWh</div>
                <p className="text-xs text-success mt-1">较昨日 +5.2%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">省间现货</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥435/MWh</div>
                <p className="text-xs text-success mt-1">较昨日 +3.8%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">系统负荷</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18,250 MW</div>
                <p className="text-xs text-muted-foreground mt-1">当前负荷</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>省内/省间现货电价</CardTitle>
              <CardDescription>
                24小时现货电价对比及系统负荷
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={spotPriceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="hour" 
                    label={{ value: '小时', position: 'insideBottom', offset: -5 }}
                    className="text-xs" 
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: '价格 (¥/MWh)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ value: '负荷 (MW)', angle: 90, position: 'insideRight' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="provincial" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="省内现货"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="interProvincial" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="省间现货"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="load" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="系统负荷"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mid-term Trading Tab */}
        <TabsContent value="midterm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>中长期市场行情</CardTitle>
              <CardDescription>
                按能源类型统计的历史价格趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={midTermData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="firePrice" 
                    fill="hsl(var(--chart-4))"
                    name="火电"
                  />
                  <Bar 
                    dataKey="renewablePrice" 
                    fill="hsl(var(--chart-3))"
                    name="新能源"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>交易方式</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">集中竞价</span>
                  <span className="text-sm font-medium">¥392/MWh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">滚动撮合</span>
                  <span className="text-sm font-medium">¥385/MWh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">直接交易</span>
                  <span className="text-sm font-medium">¥378/MWh</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>市场统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">总成交量</span>
                  <span className="text-sm font-medium">125,400 MWh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">活跃参与方</span>
                  <span className="text-sm font-medium">342</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">平均合约时长</span>
                  <span className="text-sm font-medium">6.5 个月</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settlement Disclosure Tab */}
        <TabsContent value="settlement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>机组结算披露</CardTitle>
              <CardDescription>
                按能源类型统计的发电侧结算信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    dataKey="volume" 
                    name="电量 (MWh)"
                    label={{ value: '电量 (MWh)', position: 'insideBottom', offset: -5 }}
                    className="text-xs"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="price" 
                    name="价格 (¥/MWh)"
                    label={{ value: '结算价格 (¥/MWh)', angle: -90, position: 'insideLeft' }}
                    className="text-xs"
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter 
                    name="能源类型" 
                    data={settlementData} 
                    fill="hsl(var(--chart-1))"
                  />
                </ScatterChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-2">
                <h4 className="font-medium text-sm">按能源类型统计结算汇总</h4>
                <div className="space-y-2">
                  {settlementData.map((item) => (
                    <div 
                      key={item.type}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <span className="text-sm font-medium">{item.type}</span>
                      <div className="flex gap-6 text-sm">
                        <span className="text-muted-foreground">
                          电量: <span className="font-medium text-foreground">{item.volume} MWh</span>
                        </span>
                        <span className="text-muted-foreground">
                          价格: <span className="font-medium text-foreground">¥{item.price}/MWh</span>
                        </span>
                        <span className="text-muted-foreground">
                          收益: <span className="font-medium text-success">¥{item.revenue}K</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketIntelligence;

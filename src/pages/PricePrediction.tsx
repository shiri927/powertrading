import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, AlertTriangle, Target } from "lucide-react";

const priceForecast = [
  { time: "00:00", predicted: 285, actual: 280, confidence: 0.92 },
  { time: "04:00", predicted: 252, actual: 245, confidence: 0.89 },
  { time: "08:00", predicted: 385, actual: 380, confidence: 0.94 },
  { time: "12:00", predicted: 455, actual: 450, confidence: 0.91 },
  { time: "16:00", predicted: 518, actual: 520, confidence: 0.88 },
  { time: "20:00", predicted: 475, actual: 480, confidence: 0.90 },
  { time: "24:00", predicted: 315, actual: null, confidence: 0.87 },
];

const priceDiffData = [
  { time: "00:00", diff: 5, predicted: 4, upper: 8, lower: 1 },
  { time: "04:00", diff: -3, predicted: -2, upper: 2, lower: -6 },
  { time: "08:00", diff: 8, predicted: 7, upper: 12, lower: 3 },
  { time: "12:00", diff: -5, predicted: -6, upper: -2, lower: -10 },
  { time: "16:00", diff: 12, predicted: 10, upper: 15, lower: 5 },
  { time: "20:00", diff: -8, predicted: -7, upper: -3, lower: -12 },
];

const supplyDemandForecast = [
  { day: "Day 1", renewableOutput: 8500, load: 18200, thermal: 9800 },
  { day: "Day 3", renewableOutput: 9200, load: 17800, thermal: 8700 },
  { day: "Day 5", renewableOutput: 7800, load: 18600, thermal: 10900 },
  { day: "Day 7", renewableOutput: 8900, load: 18100, thermal: 9300 },
  { day: "Day 10", renewableOutput: 9500, load: 17500, thermal: 8100 },
  { day: "Day 15", renewableOutput: 8200, load: 18400, thermal: 10300 },
];

const PricePrediction = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">价格预测与分析</h1>
        <p className="text-muted-foreground mt-2">
          AI驱动的市场分析与价格预测工具
        </p>
      </div>

      {/* Prediction Tabs */}
      <Tabs defaultValue="spot-price" className="w-full">
        <TabsList>
          <TabsTrigger value="spot-price">现货电价预测</TabsTrigger>
          <TabsTrigger value="price-diff">价差预测</TabsTrigger>
          <TabsTrigger value="supply-demand">供需预测</TabsTrigger>
        </TabsList>

        {/* Spot Price Prediction */}
        <TabsContent value="spot-price" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  预测准确率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">92.4%</div>
                <p className="text-xs text-muted-foreground mt-1">过去7天平均</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">明日峰值价格</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥518/MWh</div>
                <p className="text-xs text-warning mt-1">预计出现在16:00</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">明日谷值价格</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥252/MWh</div>
                <p className="text-xs text-muted-foreground mt-1">预计出现在04:00</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>日前电价预测</CardTitle>
              <CardDescription>
                预测电价与实际电价对比及置信区间
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="outline">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  96点预测曲线可用
                </Badge>
                <Badge variant="secondary">
                  置信度: 89.5%
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={priceForecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis 
                    label={{ value: '价格 (¥/MWh)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="实际电价"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="预测电价"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">预测因素</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">天气状况</span>
                    <span className="font-medium">晴朗，有风</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">新能源出力预测</span>
                    <span className="font-medium">高 (9,200 MW)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">负荷预测</span>
                    <span className="font-medium">正常 (18,100 MW)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">煤价趋势</span>
                    <span className="font-medium text-success">平稳</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Difference Prediction */}
        <TabsContent value="price-diff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                日前与实时电价价差预测
              </CardTitle>
              <CardDescription>
                现货市场套利机会分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={priceDiffData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis 
                    label={{ value: '价差 (¥/MWh)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="upper" 
                    stroke="hsl(var(--chart-3))" 
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.2}
                    name="上限"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lower" 
                    stroke="hsl(var(--chart-3))" 
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.2}
                    name="下限"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="预测价差"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diff" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="实际价差"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="p-3 border border-border rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">方向准确率</div>
                  <div className="text-lg font-bold text-success">87.3%</div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">数值预测误差</div>
                  <div className="text-lg font-bold">±3.2 ¥/MWh</div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">套利机会</div>
                  <div className="text-lg font-bold text-warning">4 个时段</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>价差驱动因素分析</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">竞价空间差异</span>
                  <span className="text-sm font-medium text-primary">高影响</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">新能源预测偏差</span>
                  <span className="text-sm font-medium text-secondary">中影响</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">负荷预测准确性</span>
                  <span className="text-sm font-medium text-muted-foreground">低影响</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supply & Demand Forecast */}
        <TabsContent value="supply-demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>15日供需预测</CardTitle>
              <CardDescription>
                新能源出力、火电发电与负荷预测
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={supplyDemandForecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis 
                    label={{ value: '功率 (MW)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="renewableOutput" 
                    stackId="1"
                    stroke="hsl(var(--chart-3))" 
                    fill="hsl(var(--chart-3))"
                    name="新能源出力"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="thermal" 
                    stackId="1"
                    stroke="hsl(var(--chart-4))" 
                    fill="hsl(var(--chart-4))"
                    name="火电"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="load" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="负荷预测"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>7日竞价空间预测</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">明日</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">2,850 MW</span>
                    <Badge variant="outline">中等</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">第3日</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">3,420 MW</span>
                    <Badge variant="default">高</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">第7日</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">2,180 MW</span>
                    <Badge variant="secondary">低</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>区域间输电</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">输入预测</span>
                  <span className="text-sm font-medium">1,250 MW</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">输出预测</span>
                  <span className="text-sm font-medium">850 MW</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">净位置</span>
                  <span className="text-sm font-medium text-success">+400 MW</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricePrediction;

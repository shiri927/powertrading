import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// 新能源出力预测数据（未来15天）
const renewableOutputData = Array.from({ length: 15 }, (_, i) => ({
  day: `第${i + 1}天`,
  风电: Math.floor(Math.random() * 3000 + 2000),
  光伏: Math.floor(Math.random() * 2500 + 1500),
}));

// 负荷预测数据
const loadForecastData = Array.from({ length: 15 }, (_, i) => ({
  day: `第${i + 1}天`,
  预测负荷: Math.floor(Math.random() * 5000 + 8000),
  历史负荷: Math.floor(Math.random() * 5000 + 7800),
}));

// 火电竞价空间预测（未来7天）
const thermalBiddingData = Array.from({ length: 7 }, (_, i) => ({
  day: `第${i + 1}天`,
  竞价空间: Math.floor(Math.random() * 1500 + 500),
  历史均值: Math.floor(Math.random() * 1400 + 600),
}));

const SupplyDemand = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">市场供需预测</h1>
        <p className="text-muted-foreground mt-2">
          未来15天新能源出力、负荷及火电竞价空间预测
        </p>
      </div>

      <Tabs defaultValue="renewable" className="space-y-6">
        <TabsList>
          <TabsTrigger value="renewable">新能源出力预测</TabsTrigger>
          <TabsTrigger value="load">负荷预测</TabsTrigger>
          <TabsTrigger value="thermal">火电竞价空间</TabsTrigger>
        </TabsList>

        {/* 新能源出力预测 */}
        <TabsContent value="renewable" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>未来15天新能源出力预测</CardTitle>
              <CardDescription>
                全省风电、光伏发电出力预测曲线
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={renewableOutputData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis 
                    label={{ value: '出力 (MW)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="风电" fill="hsl(var(--chart-1))" name="风电" />
                  <Bar dataKey="光伏" fill="hsl(var(--chart-2))" name="光伏" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 负荷预测 */}
        <TabsContent value="load" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>未来15天负荷预测</CardTitle>
              <CardDescription>
                全省用电负荷预测与历史对比
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={loadForecastData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis 
                    label={{ value: '负荷 (MW)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="预测负荷" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="预测负荷"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="历史负荷" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="历史负荷"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 火电竞价空间 */}
        <TabsContent value="thermal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>未来7天火电竞价空间预测</CardTitle>
              <CardDescription>
                火电机组可竞价空间及历史行为分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={thermalBiddingData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis 
                    label={{ value: '竞价空间 (MW)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="竞价空间" fill="hsl(var(--chart-4))" name="竞价空间" />
                  <Bar dataKey="历史均值" fill="hsl(var(--chart-5))" name="历史均值" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplyDemand;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area, ReferenceLine
} from "recharts";
import { Cloud, Wind, Flame, FileText, TrendingUp, TrendingDown, Target, Activity } from "lucide-react";

// 生成96点电价预测数据
const generate96PointData = () => {
  const data = [];
  for (let i = 0; i < 96; i++) {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const basePrice = hour >= 8 && hour <= 20 ? 400 + Math.random() * 200 : 200 + Math.random() * 100;
    const actual = basePrice * (0.9 + Math.random() * 0.2);
    data.push({
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      predicted: Math.round(basePrice),
      actual: Math.round(actual),
      upperBound: Math.round(basePrice * 1.1),
      lowerBound: Math.round(basePrice * 0.9),
    });
  }
  return data;
};

// 生成24点电价预测数据
const generate24PointData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    const basePrice = i >= 8 && i <= 20 ? 420 + Math.random() * 180 : 220 + Math.random() * 80;
    const actual = basePrice * (0.9 + Math.random() * 0.2);
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      predicted: Math.round(basePrice),
      actual: Math.round(actual),
      upperBound: Math.round(basePrice * 1.1),
      lowerBound: Math.round(basePrice * 0.9),
    });
  }
  return data;
};

// 历史电价分布数据
const priceDistributionData = [
  { range: "0-100", count: 45 },
  { range: "100-200", count: 180 },
  { range: "200-300", count: 320 },
  { range: "300-400", count: 280 },
  { range: "400-500", count: 150 },
  { range: "500-600", count: 80 },
  { range: "600-700", count: 35 },
  { range: "700+", count: 15 },
];

// 历史日电价趋势（近30天）
const historicalTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (30 - i));
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    avgPrice: Math.round(280 + Math.random() * 120),
    maxPrice: Math.round(500 + Math.random() * 200),
    minPrice: Math.round(100 + Math.random() * 80),
  };
});

const SpotPriceForecast = () => {
  const [province, setProvince] = useState("shandong");
  const [granularity, setGranularity] = useState("96");
  const priceData = granularity === "96" ? generate96PointData() : generate24PointData();

  // 计算统计指标
  const avgPredicted = Math.round(priceData.reduce((sum, d) => sum + d.predicted, 0) / priceData.length);
  const maxPredicted = Math.max(...priceData.map(d => d.predicted));
  const minPredicted = Math.min(...priceData.map(d => d.predicted));
  const accuracy = 92.5;

  return (
    <div className="space-y-6">
      {/* 筛选条件 */}
      <div className="flex items-center gap-4">
        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择省份" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shandong">山东省</SelectItem>
            <SelectItem value="shanxi">山西省</SelectItem>
            <SelectItem value="zhejiang">浙江省</SelectItem>
          </SelectContent>
        </Select>
        <Select value={granularity} onValueChange={setGranularity}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="时间粒度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="96">96点</SelectItem>
            <SelectItem value="24">24点</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 预测因素面板 */}
      <Card className="bg-[#F8FBFA]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">预测影响因素</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <Cloud className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">气象数据</p>
                <p className="text-sm font-medium">多云转晴</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <Wind className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">新能源出力</p>
                <p className="text-sm font-medium">6,530 MW</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <Activity className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">竞价空间</p>
                <p className="text-sm font-medium">10,200 MW</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">动力煤价格</p>
                <p className="text-sm font-medium">¥850/吨</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-muted-foreground">政策因素</p>
                <p className="text-sm font-medium">无重大影响</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Target className="h-5 w-5 text-[#00B04D]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">预测准确率</p>
                <p className="text-xl font-bold font-mono text-[#00B04D]">{accuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">峰值电价</p>
                <p className="text-xl font-bold font-mono">{maxPredicted} ¥/MWh</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingDown className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">谷值电价</p>
                <p className="text-xl font-bold font-mono">{minPredicted} ¥/MWh</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">日均电价</p>
                <p className="text-xl font-bold font-mono">{avgPredicted} ¥/MWh</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 预测图表 */}
      <Tabs defaultValue="prediction" className="space-y-4">
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="prediction">电价预测曲线</TabsTrigger>
          <TabsTrigger value="comparison">预测vs实际对比</TabsTrigger>
          <TabsTrigger value="distribution">历史电价分布</TabsTrigger>
          <TabsTrigger value="trend">历史趋势分析</TabsTrigger>
        </TabsList>

        <TabsContent value="prediction">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">日前{granularity}点电价预测曲线</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={granularity === "96" ? 11 : 1} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="#e0f2fe" name="预测上界" />
                  <Area type="monotone" dataKey="lowerBound" stroke="transparent" fill="#ffffff" name="预测下界" />
                  <Line type="monotone" dataKey="predicted" stroke="#00B04D" strokeWidth={2} name="预测电价" dot={false} />
                  <ReferenceLine y={avgPredicted} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: `均值: ${avgPredicted}`, position: 'right', fontSize: 10 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">预测电价 vs 实际电价对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={granularity === "96" ? 11 : 1} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predicted" stroke="#00B04D" strokeWidth={2} name="预测电价" dot={false} />
                  <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} name="实际电价" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">历史电价分布（近30天）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={priceDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" tick={{ fontSize: 12 }} label={{ value: '电价区间 (¥/MWh)', position: 'bottom', fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} label={{ value: '出现次数', angle: -90, position: 'left', fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00B04D" name="出现次数" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">电价特征统计</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-[#F8FBFA] rounded-lg">
                      <span className="text-sm text-muted-foreground">最高电价</span>
                      <span className="font-mono font-bold text-red-600">¥782/MWh</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#F8FBFA] rounded-lg">
                      <span className="text-sm text-muted-foreground">最低电价</span>
                      <span className="font-mono font-bold text-blue-600">¥85/MWh</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#F8FBFA] rounded-lg">
                      <span className="text-sm text-muted-foreground">平均电价</span>
                      <span className="font-mono font-bold">¥325/MWh</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#F8FBFA] rounded-lg">
                      <span className="text-sm text-muted-foreground">标准差</span>
                      <span className="font-mono font-bold">¥128/MWh</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#F8FBFA] rounded-lg">
                      <span className="text-sm text-muted-foreground">峰谷价差</span>
                      <span className="font-mono font-bold text-[#00B04D]">¥697/MWh</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">历史日电价趋势（近30天）</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={historicalTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="maxPrice" stroke="#ef4444" fill="#fecaca" name="最高电价" />
                  <Area type="monotone" dataKey="minPrice" stroke="#3b82f6" fill="#dbeafe" name="最低电价" />
                  <Line type="monotone" dataKey="avgPrice" stroke="#00B04D" strokeWidth={2} name="平均电价" dot={{ fill: "#00B04D" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpotPriceForecast;

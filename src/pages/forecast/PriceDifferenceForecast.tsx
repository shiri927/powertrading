import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area, ReferenceLine, Cell
} from "recharts";
import { TrendingUp, TrendingDown, Target, Activity, ArrowUp, ArrowDown, Minus } from "lucide-react";

// 生成96点价差预测数据
const generate96PointPriceDiffData = () => {
  const data = [];
  for (let i = 0; i < 96; i++) {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    // 价差在峰时段更大
    const baseDiff = hour >= 8 && hour <= 20 ? 20 + Math.random() * 60 : -20 + Math.random() * 40;
    const confidence = 75 + Math.random() * 20;
    data.push({
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      priceDiff: Math.round(baseDiff),
      upperBound: Math.round(baseDiff + 15),
      lowerBound: Math.round(baseDiff - 15),
      confidence: Math.round(confidence),
      direction: baseDiff > 10 ? "up" : baseDiff < -10 ? "down" : "flat",
    });
  }
  return data;
};

// 价差分布数据
const priceDiffDistributionData = [
  { range: "<-50", count: 25, color: "#ef4444" },
  { range: "-50~-30", count: 45, color: "#f97316" },
  { range: "-30~-10", count: 80, color: "#fbbf24" },
  { range: "-10~10", count: 120, color: "#9ca3af" },
  { range: "10~30", count: 95, color: "#84cc16" },
  { range: "30~50", count: 65, color: "#22c55e" },
  { range: ">50", count: 35, color: "#00B04D" },
];

// 时段置信度数据
const confidenceByPeriodData = [
  { period: "00:00-04:00", accuracy: 88, avgConfidence: 82 },
  { period: "04:00-08:00", accuracy: 85, avgConfidence: 78 },
  { period: "08:00-12:00", accuracy: 78, avgConfidence: 72 },
  { period: "12:00-16:00", accuracy: 82, avgConfidence: 75 },
  { period: "16:00-20:00", accuracy: 75, avgConfidence: 70 },
  { period: "20:00-24:00", accuracy: 86, avgConfidence: 80 },
];

// 驱动因素分析数据
const driverFactors = [
  { factor: "新能源出力波动", impact: 35, direction: "positive" },
  { factor: "负荷预测偏差", impact: 25, direction: "negative" },
  { factor: "火电机组调节", impact: 20, direction: "positive" },
  { factor: "联络线计划调整", impact: 12, direction: "negative" },
  { factor: "市场情绪", impact: 8, direction: "neutral" },
];

const PriceDifferenceForecast = () => {
  const [province, setProvince] = useState("shandong");
  const priceDiffData = generate96PointPriceDiffData();

  // 计算统计指标
  const avgDiff = Math.round(priceDiffData.reduce((sum, d) => sum + d.priceDiff, 0) / priceDiffData.length);
  const upCount = priceDiffData.filter(d => d.direction === "up").length;
  const downCount = priceDiffData.filter(d => d.direction === "down").length;
  const avgConfidence = Math.round(priceDiffData.reduce((sum, d) => sum + d.confidence, 0) / priceDiffData.length);
  const directionAccuracy = 85.3;

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
        <Badge variant="outline" className="bg-[#F1F8F4] text-[#00B04D]">
          价差 = 日前电价 - 实时电价
        </Badge>
      </div>

      {/* 预测概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均价差预测</p>
                <p className={`text-xl font-bold font-mono ${avgDiff >= 0 ? 'text-[#00B04D]' : 'text-red-600'}`}>
                  {avgDiff >= 0 ? '+' : ''}{avgDiff} ¥/MWh
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-[#00B04D]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">价差方向</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-[#00B04D]">↑ {upCount}点</span>
                  <span className="text-sm font-mono text-red-600">↓ {downCount}点</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均置信度</p>
                <p className="text-xl font-bold font-mono">{avgConfidence}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Target className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">方向准确率</p>
                <p className="text-xl font-bold font-mono text-[#00B04D]">{directionAccuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 预测图表 */}
      <Tabs defaultValue="prediction" className="space-y-4">
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="prediction">价差预测曲线</TabsTrigger>
          <TabsTrigger value="distribution">价差分布</TabsTrigger>
          <TabsTrigger value="confidence">时段置信度</TabsTrigger>
          <TabsTrigger value="drivers">驱动因素</TabsTrigger>
        </TabsList>

        <TabsContent value="prediction">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">96点价差预测曲线（含置信区间和方向信号）</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={priceDiffData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={11} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm">
                              价差预测: <span className={`font-mono ${data.priceDiff >= 0 ? 'text-[#00B04D]' : 'text-red-600'}`}>
                                {data.priceDiff >= 0 ? '+' : ''}{data.priceDiff} ¥/MWh
                              </span>
                            </p>
                            <p className="text-sm">置信区间: [{data.lowerBound}, {data.upperBound}]</p>
                            <p className="text-sm">置信度: {data.confidence}%</p>
                            <p className="text-sm flex items-center gap-1">
                              方向: 
                              {data.direction === "up" && <ArrowUp className="h-4 w-4 text-[#00B04D]" />}
                              {data.direction === "down" && <ArrowDown className="h-4 w-4 text-red-600" />}
                              {data.direction === "flat" && <Minus className="h-4 w-4 text-gray-500" />}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="#dcfce7" name="置信上界" />
                  <Area type="monotone" dataKey="lowerBound" stroke="transparent" fill="#ffffff" name="置信下界" />
                  <Line type="monotone" dataKey="priceDiff" stroke="#00B04D" strokeWidth={2} name="价差预测" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">历史价差分布（近30天）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={priceDiffDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" tick={{ fontSize: 12 }} label={{ value: '价差区间 (¥/MWh)', position: 'bottom', fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} label={{ value: '出现次数', angle: -90, position: 'left', fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="出现次数">
                        {priceDiffDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">价差特征统计</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-[#F8FBFA] rounded-lg">
                      <span className="text-sm text-muted-foreground">正价差占比</span>
                      <span className="font-mono font-bold text-[#00B04D]">58.2%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#F8FBFA] rounded-lg">
                      <span className="text-sm text-muted-foreground">负价差占比</span>
                      <span className="font-mono font-bold text-red-600">32.5%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#F8FBFA] rounded-lg">
                      <span className="text-sm text-muted-foreground">零附近占比</span>
                      <span className="font-mono font-bold text-gray-600">9.3%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#F8FBFA] rounded-lg">
                      <span className="text-sm text-muted-foreground">最大正价差</span>
                      <span className="font-mono font-bold text-[#00B04D]">+85 ¥/MWh</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#F8FBFA] rounded-lg">
                      <span className="text-sm text-muted-foreground">最大负价差</span>
                      <span className="font-mono font-bold text-red-600">-62 ¥/MWh</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">时段置信度与准确率分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">各时段预测准确率</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={confidenceByPeriodData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="period" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="#00B04D" name="准确率 (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-4">各时段平均置信度</h4>
                  <div className="space-y-4">
                    {confidenceByPeriodData.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.period}</span>
                          <span className="font-mono">{item.avgConfidence}%</span>
                        </div>
                        <Progress value={item.avgConfidence} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">价差驱动因素分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">影响因素贡献度</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={driverFactors} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="factor" tick={{ fontSize: 12 }} width={120} />
                      <Tooltip />
                      <Bar dataKey="impact" name="影响度 (%)">
                        {driverFactors.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.direction === "positive" ? "#00B04D" : entry.direction === "negative" ? "#ef4444" : "#9ca3af"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">因素解读</h4>
                  <div className="space-y-3">
                    {driverFactors.map((factor, index) => (
                      <div key={index} className="p-3 bg-[#F8FBFA] rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{factor.factor}</span>
                          <Badge 
                            variant="outline" 
                            className={
                              factor.direction === "positive" ? "bg-green-50 text-[#00B04D] border-[#00B04D]" :
                              factor.direction === "negative" ? "bg-red-50 text-red-600 border-red-600" :
                              "bg-gray-50 text-gray-600 border-gray-600"
                            }
                          >
                            {factor.direction === "positive" ? "扩大价差" : factor.direction === "negative" ? "缩小价差" : "中性"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          影响权重: {factor.impact}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PriceDifferenceForecast;

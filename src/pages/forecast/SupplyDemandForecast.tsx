import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, ComposedChart
} from "recharts";
import { Wind, Sun, Zap, TrendingUp, Activity } from "lucide-react";

// 生成15天新能源出力预测数据
const generateRenewableData = () => {
  const data = [];
  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const windBase = 3000 + Math.random() * 2000;
    const solarBase = 2000 + Math.random() * 1500;
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      windP10: Math.round(windBase * 0.7),
      windP50: Math.round(windBase),
      windP90: Math.round(windBase * 1.3),
      solarP10: Math.round(solarBase * 0.75),
      solarP50: Math.round(solarBase),
      solarP90: Math.round(solarBase * 1.25),
    });
  }
  return data;
};

// 生成15天负荷预测数据
const generateLoadData = () => {
  const data = [];
  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const loadBase = 35000 + Math.random() * 10000;
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      predicted: Math.round(loadBase),
      historical: Math.round(loadBase * (0.95 + Math.random() * 0.1)),
      upperBound: Math.round(loadBase * 1.05),
      lowerBound: Math.round(loadBase * 0.95),
    });
  }
  return data;
};

// 生成15天联络线预测数据
const generateTieLineData = () => {
  const data = [];
  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const inflow = 2000 + Math.random() * 1500;
    const outflow = 1500 + Math.random() * 1000;
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      netPosition: Math.round(inflow - outflow),
    });
  }
  return data;
};

// 生成7天火电竞价空间预测
const generateThermalBiddingData = () => {
  const data = [];
  const baseDate = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const space = 8000 + Math.random() * 4000;
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      biddingSpace: Math.round(space),
      historicalAvg: Math.round(space * (0.9 + Math.random() * 0.2)),
      predicted: Math.round(space),
    });
  }
  return data;
};

// 历史竞价行为分析数据
const biddingBehaviorData = [
  { range: "0-200", count: 45, rate: 78 },
  { range: "200-300", count: 120, rate: 85 },
  { range: "300-400", count: 280, rate: 92 },
  { range: "400-500", count: 180, rate: 88 },
  { range: "500-600", count: 95, rate: 72 },
  { range: "600+", count: 40, rate: 55 },
];

const SupplyDemandForecast = () => {
  const [province, setProvince] = useState("shandong");
  const renewableData = generateRenewableData();
  const loadData = generateLoadData();
  const tieLineData = generateTieLineData();
  const thermalData = generateThermalBiddingData();

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
          预测周期: 15天
        </Badge>
      </div>

      {/* 指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Wind className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">风电出力预测</p>
                <p className="text-xl font-bold font-mono">3,850 MW</p>
                <p className="text-xs text-muted-foreground">P50 均值</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Sun className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">光伏出力预测</p>
                <p className="text-xl font-bold font-mono">2,680 MW</p>
                <p className="text-xs text-muted-foreground">P50 均值</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">统调负荷预测</p>
                <p className="text-xl font-bold font-mono">42,500 MW</p>
                <p className="text-xs text-muted-foreground">峰值预测</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Activity className="h-5 w-5 text-[#00B04D]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">竞价空间预测</p>
                <p className="text-xl font-bold font-mono">10,200 MW</p>
                <p className="text-xs text-muted-foreground">7日均值</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 预测图表 */}
      <Tabs defaultValue="renewable" className="space-y-4">
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="renewable">新能源出力预测</TabsTrigger>
          <TabsTrigger value="load">负荷预测</TabsTrigger>
          <TabsTrigger value="tieline">联络线预测</TabsTrigger>
          <TabsTrigger value="thermal">火电竞价空间</TabsTrigger>
          <TabsTrigger value="behavior">历史竞价行为</TabsTrigger>
        </TabsList>

        <TabsContent value="renewable">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">15天新能源出力预测（P10/P50/P90置信区间）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 风电预测 */}
                <div>
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Wind className="h-4 w-4 text-blue-600" /> 风电出力预测
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={renewableData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="windP90" stackId="1" stroke="#93c5fd" fill="#dbeafe" name="P90" />
                      <Area type="monotone" dataKey="windP50" stackId="2" stroke="#3b82f6" fill="#93c5fd" name="P50" />
                      <Area type="monotone" dataKey="windP10" stackId="3" stroke="#1d4ed8" fill="#3b82f6" name="P10" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* 光伏预测 */}
                <div>
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-600" /> 光伏出力预测
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={renewableData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="solarP90" stackId="1" stroke="#fcd34d" fill="#fef3c7" name="P90" />
                      <Area type="monotone" dataKey="solarP50" stackId="2" stroke="#f59e0b" fill="#fcd34d" name="P50" />
                      <Area type="monotone" dataKey="solarP10" stackId="3" stroke="#d97706" fill="#f59e0b" name="P10" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="load">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">15天负荷预测（含历史对比）</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={loadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="#e0f2fe" name="上界" />
                  <Area type="monotone" dataKey="lowerBound" stroke="transparent" fill="#ffffff" name="下界" />
                  <Line type="monotone" dataKey="predicted" stroke="#00B04D" strokeWidth={2} name="预测负荷" dot={{ fill: "#00B04D" }} />
                  <Line type="monotone" dataKey="historical" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="历史同期" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tieline">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">15天联络线预测（输入/输出/净位置）</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={tieLineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inflow" fill="#3b82f6" name="输入电量" />
                  <Bar dataKey="outflow" fill="#f59e0b" name="输出电量" />
                  <Line type="monotone" dataKey="netPosition" stroke="#00B04D" strokeWidth={2} name="净位置" dot={{ fill: "#00B04D" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thermal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">7天火电竞价空间预测</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={thermalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="biddingSpace" fill="#00B04D" name="预测竞价空间" />
                  <Line type="monotone" dataKey="historicalAvg" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="历史平均" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">历史竞价行为分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">报价分布</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={biddingBehaviorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" tick={{ fontSize: 12 }} label={{ value: '报价区间 (¥/MWh)', position: 'bottom', fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="报价次数" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-4">中标率分析</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={biddingBehaviorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" tick={{ fontSize: 12 }} label={{ value: '报价区间 (¥/MWh)', position: 'bottom', fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#00B04D" strokeWidth={2} name="中标率 (%)" dot={{ fill: "#00B04D" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplyDemandForecast;

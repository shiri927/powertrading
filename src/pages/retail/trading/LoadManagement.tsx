import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Activity, Brain, Zap, BarChart3, AlertCircle, Loader2, RefreshCw, Download, Calendar, Clock } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, ComposedChart, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

// ============ 用电量预测数据 ============
const generateHistoricalComparisonData = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const baseLoad = 45 + Math.sin(i / 24 * Math.PI * 2) * 15;
    const predicted = baseLoad + Math.random() * 4;
    const actual = baseLoad + Math.random() * 5;
    const deviation = ((actual - predicted) / predicted * 100);
    return {
      hour: `${i.toString().padStart(2, '0')}:00`,
      actual,
      predicted,
      deviation: Math.abs(deviation),
      deviationValue: actual - predicted,
    };
  });
};

// 生成多日历史预测对比数据
const generateMultiDayPredictionData = () => {
  const days = 7;
  return Array.from({ length: days }, (_, dayIdx) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - dayIdx));
    const dateStr = date.toISOString().split('T')[0];
    
    const totalPredicted = 800 + Math.random() * 200;
    const totalActual = totalPredicted * (0.95 + Math.random() * 0.1);
    const deviation = Math.abs((totalActual - totalPredicted) / totalPredicted * 100);
    
    return {
      date: dateStr,
      displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
      predicted: totalPredicted,
      actual: totalActual,
      deviation,
    };
  });
};

// ============ 用电量分析数据 ============
const generateLoadAnalysisData = () => {
  return {
    byTimeSlot: [
      { name: "峰时段", value: 35, color: "#ef4444", electricity: 21700 },
      { name: "平时段", value: 40, color: "#f59e0b", electricity: 24800 },
      { name: "谷时段", value: 25, color: "#10b981", electricity: 15500 },
    ],
    byVoltage: [
      { name: "110kV", value: 28000, percentage: 45, customers: 12 },
      { name: "35kV", value: 19600, percentage: 32, customers: 45 },
      { name: "10kV", value: 14400, percentage: 23, customers: 99 },
    ],
    byCustomerType: [
      { type: "工业", load: 32000, percentage: 52, growth: 5.2, customers: 48 },
      { type: "商业", load: 18000, percentage: 29, growth: 3.8, customers: 67 },
      { type: "居民", load: 12000, percentage: 19, growth: 2.1, customers: 41 },
    ],
    hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      industrial: 1200 + Math.sin(i / 24 * Math.PI * 2) * 400,
      commercial: 700 + Math.sin(i / 24 * Math.PI * 2) * 200,
      residential: 450 + Math.sin((i - 6) / 24 * Math.PI * 2) * 150,
      total: 0,
    })).map(d => ({ ...d, total: d.industrial + d.commercial + d.residential })),
    monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}月`,
      usage: 50000 + Math.sin(i / 12 * Math.PI * 2) * 15000 + Math.random() * 5000,
      lastYear: 48000 + Math.sin(i / 12 * Math.PI * 2) * 14000 + Math.random() * 5000,
    })),
  };
};

const LoadManagement = () => {
  const { toast } = useToast();
  
  // ============ 用电量预测状态 ============
  const [predictionParams, setPredictionParams] = useState({
    customerType: "all",
    voltage: "all",
    timeRange: "24h",
  });
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [historicalData] = useState(generateHistoricalComparisonData());
  const [multiDayData] = useState(generateMultiDayPredictionData());
  
  // ============ 用电量分析状态 ============
  const [analysisData] = useState(generateLoadAnalysisData());
  const [analysisTimeRange, setAnalysisTimeRange] = useState("month");

  // ============ 用电量预测逻辑 ============
  const handlePrediction = async () => {
    setIsPredicting(true);
    try {
      const historicalInput = { avgDailyLoad: 1100, peakLoad: 62, valleyLoad: 35, loadFactor: 75 };
      const weatherInput = { avgTemp: 15, maxTemp: 22, minTemp: 8, humidity: 65, condition: "多云" };

      const { data, error } = await supabase.functions.invoke('predict-load', {
        body: {
          historicalData: historicalInput,
          weatherData: weatherInput,
          customerType: predictionParams.customerType === "industrial" ? "工业用户" :
                         predictionParams.customerType === "commercial" ? "商业用户" : 
                         predictionParams.customerType === "residential" ? "居民用户" : "全部用户",
          voltage: predictionParams.voltage,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.success && data?.data) {
        setPredictionData(data.data);
        toast({
          title: "预测完成",
          description: `AI已完成负荷预测分析，整体置信度：${data.data.summary.overallConfidence}%`,
        });
      } else {
        throw new Error("预测结果格式异常");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "预测失败",
        description: error.message || "AI预测服务异常，请稍后重试",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  // 计算预测偏差统计
  const deviationStats = useMemo(() => {
    const deviations = historicalData.map(d => d.deviation);
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    const maxDeviation = Math.max(...deviations);
    const accuracy = 100 - avgDeviation;
    
    // 偏差分布
    const underEstimate = historicalData.filter(d => d.deviationValue < 0).length;
    const overEstimate = historicalData.filter(d => d.deviationValue > 0).length;
    
    return { avgDeviation, maxDeviation, accuracy, underEstimate, overEstimate };
  }, [historicalData]);

  // 多日偏差统计
  const multiDayStats = useMemo(() => {
    const avgDeviation = multiDayData.reduce((sum, d) => sum + d.deviation, 0) / multiDayData.length;
    const maxDeviation = Math.max(...multiDayData.map(d => d.deviation));
    const totalPredicted = multiDayData.reduce((sum, d) => sum + d.predicted, 0);
    const totalActual = multiDayData.reduce((sum, d) => sum + d.actual, 0);
    return { avgDeviation, maxDeviation, totalPredicted, totalActual };
  }, [multiDayData]);

  const predictionChartConfig = {
    actual: { label: "实际用电", color: "#00B04D" },
    predicted: { label: "预测用电", color: "#3b82f6" },
    deviation: { label: "偏差率", color: "#f59e0b" },
  };

  const analysisChartConfig = {
    industrial: { label: "工业", color: "#ef4444" },
    commercial: { label: "商业", color: "#f59e0b" },
    residential: { label: "居民", color: "#10b981" },
    total: { label: "合计", color: "#3b82f6" },
    usage: { label: "本年", color: "#00B04D" },
    lastYear: { label: "去年", color: "#9ca3af" },
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">用电负荷管理</h1>
        <p className="text-muted-foreground mt-2">
          综合用电量预测与分析，为批发及零售交易提供决策依据
        </p>
      </div>

      <Tabs defaultValue="prediction" className="space-y-4">
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="prediction" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            用电量预测
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            用电量分析
          </TabsTrigger>
        </TabsList>

        {/* ============ 用电量预测 Tab ============ */}
        <TabsContent value="prediction" className="space-y-4">
          {/* 预测控制面板 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />AI智能预测
              </CardTitle>
              <CardDescription>
                综合考虑气象数据、历史用电数据等多种因素，采用大数据分析挖掘技术实现零售用户用电量预测
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>用户类型</Label>
                  <Select value={predictionParams.customerType} onValueChange={(value) => setPredictionParams({ ...predictionParams, customerType: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部用户</SelectItem>
                      <SelectItem value="industrial">工业用户</SelectItem>
                      <SelectItem value="commercial">商业用户</SelectItem>
                      <SelectItem value="residential">居民用户</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>电压等级</Label>
                  <Select value={predictionParams.voltage} onValueChange={(value) => setPredictionParams({ ...predictionParams, voltage: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="110kV">110kV</SelectItem>
                      <SelectItem value="35kV">35kV</SelectItem>
                      <SelectItem value="10kV">10kV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>预测时段</Label>
                  <Select value={predictionParams.timeRange} onValueChange={(value) => setPredictionParams({ ...predictionParams, timeRange: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">未来24小时</SelectItem>
                      <SelectItem value="48h">未来48小时</SelectItem>
                      <SelectItem value="7d">未来7天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button className="w-full bg-[#00B04D] hover:bg-[#009644]" onClick={handlePrediction} disabled={isPredicting}>
                    {isPredicting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI预测中...</> : <><Brain className="h-4 w-4 mr-2" />开始预测</>}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />导出报告
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI预测结果 */}
          {predictionData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">预测总电量</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{predictionData.summary.totalPredictedLoad.toFixed(0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">MWh</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">峰值负荷</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{predictionData.summary.peakLoad.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground mt-1">{predictionData.summary.peakHour}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">谷值负荷</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{predictionData.summary.valleyLoad.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground mt-1">{predictionData.summary.valleyHour}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">置信度</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{predictionData.summary.overallConfidence.toFixed(0)}%</div>
                    <Badge variant={predictionData.summary.overallConfidence > 85 ? "default" : "secondary"} className={predictionData.summary.overallConfidence > 85 ? "bg-[#00B04D] mt-1" : "mt-1"}>
                      {predictionData.summary.overallConfidence > 85 ? "高置信" : "中等置信"}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">关键因素</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {predictionData.summary.keyFactors.slice(0, 2).map((factor: string, idx: number) => (
                        <p key={idx} className="text-xs text-muted-foreground truncate">{factor}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />负荷预测曲线</span>
                    <Button variant="outline" size="sm" onClick={handlePrediction} disabled={isPredicting}>
                      <RefreshCw className={`h-4 w-4 mr-1 ${isPredicting ? 'animate-spin' : ''}`} />重新预测
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={predictionChartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={predictionData.predictions}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="hour" className="text-xs" />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Area type="monotone" dataKey="upperBound" stroke="none" fill="#93c5fd" fillOpacity={0.2} name="置信区间" />
                        <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#93c5fd" fillOpacity={0.2} />
                        <Line type="monotone" dataKey="predictedLoad" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="预测负荷" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </>
          )}

          {/* 历史预测偏差分析 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />历史预测偏差分析
              </CardTitle>
              <CardDescription>展示历史预测结果与实际用电量的对比，分析预测偏差</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 偏差统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-[#F1F8F4]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">平均偏差率</p>
                    <div className="text-2xl font-bold font-mono">{deviationStats.avgDeviation.toFixed(2)}%</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#F1F8F4]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">最大偏差率</p>
                    <div className="text-2xl font-bold font-mono">{deviationStats.maxDeviation.toFixed(2)}%</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#F1F8F4]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">预测准确率</p>
                    <div className="text-2xl font-bold font-mono text-[#00B04D]">{deviationStats.accuracy.toFixed(1)}%</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#F1F8F4]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">低估时段</p>
                    <div className="text-2xl font-bold font-mono">{deviationStats.underEstimate}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#F1F8F4]">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">高估时段</p>
                    <div className="text-2xl font-bold font-mono">{deviationStats.overEstimate}</div>
                  </CardContent>
                </Card>
              </div>

              {/* 24小时预测vs实际对比图 */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />24小时分时对比
                </h4>
                <ChartContainer config={predictionChartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" unit="%" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line yAxisId="left" type="monotone" dataKey="actual" stroke="#00B04D" strokeWidth={2} dot={{ r: 2 }} name="实际用电" />
                      <Line yAxisId="left" type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} name="预测用电" />
                      <Bar yAxisId="right" dataKey="deviation" fill="#f59e0b" fillOpacity={0.5} name="偏差率%" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* 近7日预测偏差趋势 */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />近7日预测偏差趋势
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground">7日平均偏差</p>
                      <div className="text-xl font-bold font-mono">{multiDayStats.avgDeviation.toFixed(2)}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground">7日预测总量</p>
                      <div className="text-xl font-bold font-mono">{(multiDayStats.totalPredicted / 1000).toFixed(1)} GWh</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground">7日实际总量</p>
                      <div className="text-xl font-bold font-mono">{(multiDayStats.totalActual / 1000).toFixed(1)} GWh</div>
                    </CardContent>
                  </Card>
                </div>
                <ChartContainer config={predictionChartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={multiDayData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="displayDate" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="predicted" fill="#3b82f6" name="预测用电" />
                      <Bar dataKey="actual" fill="#00B04D" name="实际用电" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI预测说明 */}
          {!predictionData && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">AI用电量预测说明</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      系统采用AI大数据分析技术，综合考虑历史用电数据、气象条件、用户类型、电压等级等多种因素，
                      为零售用户提供精准的用电量预测，为批发及零售交易决策提供数据支撑。点击"开始预测"按钮启动AI分析引擎。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ============ 用电量分析 Tab ============ */}
        <TabsContent value="analysis" className="space-y-4">
          {/* 筛选控制 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>统计周期：</Label>
              <Select value={analysisTimeRange} onValueChange={setAnalysisTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">本周</SelectItem>
                  <SelectItem value="month">本月</SelectItem>
                  <SelectItem value="quarter">本季度</SelectItem>
                  <SelectItem value="year">本年</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />导出分析报告
            </Button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" />总用电量
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">62,000</div>
                <p className="text-xs text-muted-foreground mt-1">MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">代理用户数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">156</div>
                <p className="text-xs text-muted-foreground mt-1">户</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">户均用电量</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">397</div>
                <p className="text-xs text-muted-foreground mt-1">MWh/户</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">环比增长</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-[#00B04D]">+4.2%</div>
                <p className="text-xs text-muted-foreground mt-1">较上月</p>
              </CardContent>
            </Card>
          </div>

          {/* 时段分布和电压等级分布 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />时段用电分布
                </CardTitle>
                <CardDescription>峰平谷时段电量构成</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={analysisData.byTimeSlot} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={90} 
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analysisData.byTimeSlot.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any, name: any, props: any) => [`${props.payload.electricity} MWh`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analysisData.byTimeSlot.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slot.color }} />
                        <span>{slot.name}</span>
                      </div>
                      <span className="font-mono">{slot.electricity.toLocaleString()} MWh</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />电压等级分布
                </CardTitle>
                <CardDescription>不同电压等级用户电量占比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisData.byVoltage} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={60} />
                      <Tooltip formatter={(value: any) => [`${value.toLocaleString()} MWh`, '用电量']} />
                      <Bar dataKey="value" fill="#00B04D" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analysisData.byVoltage.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span>{v.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{v.customers}户</span>
                        <span className="font-mono">{v.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 用户类型分布 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">用户类型用电分析</CardTitle>
              <CardDescription>工业、商业、居民用户用电量构成与增长趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F1F8F4]">
                    <tr className="border-b-2 border-[#00B04D]">
                      <th className="text-left p-3 text-sm font-semibold">用户类型</th>
                      <th className="text-right p-3 text-sm font-semibold">用电量(MWh)</th>
                      <th className="text-right p-3 text-sm font-semibold">占比</th>
                      <th className="text-right p-3 text-sm font-semibold">用户数</th>
                      <th className="text-right p-3 text-sm font-semibold">同比增长</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.byCustomerType.map((type, idx) => (
                      <tr key={idx} className="border-b hover:bg-[#F8FBFA]">
                        <td className="p-3 font-medium">{type.type}</td>
                        <td className="p-3 text-right font-mono">{type.load.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono">{type.percentage}%</td>
                        <td className="p-3 text-right font-mono">{type.customers}</td>
                        <td className="p-3 text-right font-mono text-[#00B04D]">+{type.growth}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 24小时负荷曲线 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">24小时负荷曲线</CardTitle>
              <CardDescription>各类型用户分时段负荷分布</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={analysisChartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analysisData.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="industrial" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="工业" />
                    <Area type="monotone" dataKey="commercial" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="商业" />
                    <Area type="monotone" dataKey="residential" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="居民" />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="合计" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* 月度用电趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">月度用电趋势</CardTitle>
              <CardDescription>本年与去年同期对比</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={analysisChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="usage" fill="#00B04D" name="本年" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastYear" fill="#9ca3af" name="去年" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadManagement;

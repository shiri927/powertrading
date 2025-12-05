import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Activity, Brain, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, ComposedChart } from "recharts";

// 模拟历史数据生成
const generateHistoricalData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    actual: 45 + Math.sin(i / 24 * Math.PI * 2) * 15 + Math.random() * 5,
    predicted: 45 + Math.sin(i / 24 * Math.PI * 2) * 15 + Math.random() * 4,
  }));
};

const LoadPrediction = () => {
  const { toast } = useToast();
  const [predictionParams, setPredictionParams] = useState({
    customerType: "industrial",
    voltage: "110kV",
    days: 7,
  });
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [historicalData] = useState(generateHistoricalData());

  // AI负荷预测
  const handlePrediction = async () => {
    setIsPredicting(true);
    try {
      const historicalInput = {
        avgDailyLoad: 1100,
        peakLoad: 62,
        valleyLoad: 35,
        loadFactor: 75,
      };

      const weatherInput = {
        avgTemp: 15,
        maxTemp: 22,
        minTemp: 8,
        humidity: 65,
        condition: "多云",
      };

      const { data, error } = await supabase.functions.invoke('predict-load', {
        body: {
          historicalData: historicalInput,
          weatherData: weatherInput,
          customerType: predictionParams.customerType === "industrial" ? "工业用户" :
                         predictionParams.customerType === "commercial" ? "商业用户" : "居民用户",
          voltage: predictionParams.voltage,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

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
      console.error("Prediction error:", error);
      toast({
        variant: "destructive",
        title: "预测失败",
        description: error.message || "AI预测服务异常，请稍后重试",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  // 计算偏差统计
  const calculateDeviationStats = () => {
    const deviations = historicalData.map(d => Math.abs(d.predicted - d.actual));
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    const maxDeviation = Math.max(...deviations);
    const accuracy = 100 - (avgDeviation / historicalData[0].actual * 100);
    return { avgDeviation, maxDeviation, accuracy };
  };

  const deviationStats = calculateDeviationStats();

  const chartConfig = {
    actual: { label: "实际负荷", color: "#00B04D" },
    predicted: { label: "预测负荷", color: "#3b82f6" },
    upperBound: { label: "置信上界", color: "#93c5fd" },
    lowerBound: { label: "置信下界", color: "#93c5fd" },
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">用电量预测</h1>
        <p className="text-muted-foreground mt-2">
          AI驱动的负荷预测分析
        </p>
      </div>

      <div className="space-y-4">
        {/* 预测参数配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI负荷预测
            </CardTitle>
            <CardDescription>基于历史数据和气象条件的智能负荷预测</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>客户类型</Label>
                <Select value={predictionParams.customerType} onValueChange={(value) => setPredictionParams({ ...predictionParams, customerType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industrial">工业用户</SelectItem>
                    <SelectItem value="commercial">商业用户</SelectItem>
                    <SelectItem value="residential">居民用户</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>电压等级</Label>
                <Select value={predictionParams.voltage} onValueChange={(value) => setPredictionParams({ ...predictionParams, voltage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="110kV">110kV</SelectItem>
                    <SelectItem value="35kV">35kV</SelectItem>
                    <SelectItem value="10kV">10kV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>历史数据天数</Label>
                <Select value={predictionParams.days.toString()} onValueChange={(value) => setPredictionParams({ ...predictionParams, days: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7天</SelectItem>
                    <SelectItem value="14">14天</SelectItem>
                    <SelectItem value="30">30天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button className="w-full" onClick={handlePrediction} disabled={isPredicting}>
                  {isPredicting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI预测中...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      开始预测
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI预测结果 */}
        {predictionData && (
          <>
            {/* 预测摘要指标 */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">预测总电量</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{predictionData.summary.totalPredictedLoad.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">MWh</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">峰值负荷</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{predictionData.summary.peakLoad.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{predictionData.summary.peakHour}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">谷值负荷</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{predictionData.summary.valleyLoad.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{predictionData.summary.valleyHour}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">置信度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{predictionData.summary.overallConfidence.toFixed(0)}%</div>
                  <Badge variant={predictionData.summary.overallConfidence > 85 ? "default" : "secondary"} className="mt-1">
                    {predictionData.summary.overallConfidence > 85 ? "高置信" : "中等置信"}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">关键因素</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {predictionData.summary.keyFactors.slice(0, 2).map((factor: string, idx: number) => (
                      <p key={idx} className="text-xs text-muted-foreground truncate">{factor}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 预测曲线图 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    负荷预测曲线
                  </span>
                  <Button variant="outline" size="sm" onClick={handlePrediction} disabled={isPredicting}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${isPredicting ? 'animate-spin' : ''}`} />
                    重新预测
                  </Button>
                </CardTitle>
                <CardDescription>24小时分时段负荷预测与置信区间</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictionData.predictions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '负荷 (MW)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area
                        type="monotone"
                        dataKey="upperBound"
                        stroke="none"
                        fill="#93c5fd"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerBound"
                        stroke="none"
                        fill="#93c5fd"
                        fillOpacity={0.2}
                      />
                      <Line
                        type="monotone"
                        dataKey="predictedLoad"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* 预测详细数据 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">预测明细</CardTitle>
                <CardDescription>各时段负荷预测结果与预测依据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[400px] overflow-y-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                      <tr className="border-b">
                        <th className="h-10 px-4 text-left align-middle font-semibold text-xs">时段</th>
                        <th className="h-10 px-4 text-right align-middle font-semibold text-xs">预测负荷(MW)</th>
                        <th className="h-10 px-4 text-right align-middle font-semibold text-xs">置信下界(MW)</th>
                        <th className="h-10 px-4 text-right align-middle font-semibold text-xs">置信上界(MW)</th>
                        <th className="h-10 px-4 text-right align-middle font-semibold text-xs">置信度</th>
                        <th className="h-10 px-4 text-left align-middle font-semibold text-xs">预测依据</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictionData.predictions.map((row: any, index: number) => (
                        <tr key={index} className="border-b transition-colors hover:bg-[#F8FBFA]">
                          <td className="p-4 align-middle font-mono text-xs">{row.hour}</td>
                          <td className="p-4 align-middle text-right font-mono text-xs">{row.predictedLoad.toFixed(2)}</td>
                          <td className="p-4 align-middle text-right font-mono text-xs">{row.lowerBound.toFixed(2)}</td>
                          <td className="p-4 align-middle text-right font-mono text-xs">{row.upperBound.toFixed(2)}</td>
                          <td className="p-4 align-middle text-right">
                            <Badge variant={row.confidence > 85 ? "default" : "secondary"} className="text-xs">
                              {row.confidence}%
                            </Badge>
                          </td>
                          <td className="p-4 align-middle text-xs max-w-md truncate">{row.reasoning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 历史预测准确性分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              历史预测准确性
            </CardTitle>
            <CardDescription>预测值与实际值对比分析</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 准确性指标 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">平均偏差</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{deviationStats.avgDeviation.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">MW</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">最大偏差</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{deviationStats.maxDeviation.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">MW</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">预测准确率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{deviationStats.accuracy.toFixed(1)}%</div>
                  <Badge variant={deviationStats.accuracy > 90 ? "default" : "secondary"} className="mt-1">
                    {deviationStats.accuracy > 90 ? "优秀" : "良好"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* 对比图表 */}
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" label={{ value: '负荷 (MW)', angle: -90, position: 'insideLeft' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="actual" stroke="#00B04D" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 提示信息 */}
      {!predictionData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">AI负荷预测说明</h4>
                <p className="text-sm text-blue-800 mt-1">
                  系统采用AI大数据分析技术，综合考虑历史用电数据、气象条件、客户类型等多种因素，
                  为您提供24小时分时段负荷预测。点击"开始预测"按钮启动AI分析引擎。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LoadPrediction;

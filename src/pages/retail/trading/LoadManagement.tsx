import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Activity, Brain, Zap, BarChart3, AlertCircle, Loader2, RefreshCw, Users, DollarSign, Target, AlertTriangle, Eye } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, ComposedChart, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from "recharts";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// ============ 用电量预测数据 ============
const generateHistoricalData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    actual: 45 + Math.sin(i / 24 * Math.PI * 2) * 15 + Math.random() * 5,
    predicted: 45 + Math.sin(i / 24 * Math.PI * 2) * 15 + Math.random() * 4,
  }));
};

// ============ 用电量分析数据 ============
const generateLoadAnalysisData = () => {
  return {
    byTimeSlot: [
      { name: "峰时段", value: 35, color: "#ef4444" },
      { name: "平时段", value: 40, color: "#f59e0b" },
      { name: "谷时段", value: 25, color: "#10b981" },
    ],
    byVoltage: [
      { name: "110kV", value: 28000, percentage: 45 },
      { name: "35kV", value: 19600, percentage: 32 },
      { name: "10kV", value: 14400, percentage: 23 },
    ],
    byCustomerType: [
      { type: "工业", load: 32000, percentage: 52, growth: 5.2 },
      { type: "商业", load: 18000, percentage: 29, growth: 3.8 },
      { type: "居民", load: 12000, percentage: 19, growth: 2.1 },
    ],
    hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      industrial: 1200 + Math.sin(i / 24 * Math.PI * 2) * 400,
      commercial: 700 + Math.sin(i / 24 * Math.PI * 2) * 200,
      residential: 450 + Math.sin((i - 6) / 24 * Math.PI * 2) * 150,
    })),
  };
};

// ============ 用能管理数据 ============
const mockCustomers = [
  { id: "C001", name: "华能热电厂", type: "工业", voltage: "110kV", contract: "固定价", avgUsage: 4500 },
  { id: "C002", name: "万达广场", type: "商业", voltage: "35kV", contract: "浮动价", avgUsage: 2800 },
  { id: "C003", name: "绿城小区", type: "居民", voltage: "10kV", contract: "阶梯价", avgUsage: 1200 },
  { id: "C004", name: "中石化炼油厂", type: "工业", voltage: "110kV", contract: "固定价", avgUsage: 5200 },
  { id: "C005", name: "银泰百货", type: "商业", voltage: "35kV", contract: "浮动价", avgUsage: 1800 },
];

const generateEnergyUsageData = () => {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 29 + i);
    return date.toISOString().split('T')[0];
  });
  
  return mockCustomers.flatMap(customer => 
    dates.map(date => ({
      customerId: customer.id,
      customerName: customer.name,
      date,
      predictedUsage: customer.avgUsage * (0.9 + Math.random() * 0.2),
      actualUsage: customer.avgUsage * (0.85 + Math.random() * 0.3),
      peakRatio: 30 + Math.random() * 10,
      flatRatio: 45 + Math.random() * 10,
      valleyRatio: 15 + Math.random() * 10,
      profit: customer.avgUsage * 0.05 * (0.8 + Math.random() * 0.4),
    }))
  );
};

const mockCustomerQuality = mockCustomers.map(c => ({
  ...c,
  qualityScore: 60 + Math.random() * 40,
  deviationRate: Math.random() * 15,
  profitability: 0.03 + Math.random() * 0.04,
  category: Math.random() > 0.7 ? "优质" : Math.random() > 0.4 ? "普通" : "关注",
}));

const LoadManagement = () => {
  const { toast } = useToast();
  
  // ============ 用电量预测状态 ============
  const [predictionParams, setPredictionParams] = useState({
    customerType: "industrial",
    voltage: "110kV",
    days: 7,
  });
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [historicalData] = useState(generateHistoricalData());
  
  // ============ 用电量分析状态 ============
  const [analysisData] = useState(generateLoadAnalysisData());
  
  // ============ 用能管理状态 ============
  const [energyTimeRange, setEnergyTimeRange] = useState("30d");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [energyUsageData] = useState(generateEnergyUsageData());
  const [customerQuality] = useState(mockCustomerQuality);

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
                         predictionParams.customerType === "commercial" ? "商业用户" : "居民用户",
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

  const calculateDeviationStats = () => {
    const deviations = historicalData.map(d => Math.abs(d.predicted - d.actual));
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    const maxDeviation = Math.max(...deviations);
    const accuracy = 100 - (avgDeviation / historicalData[0].actual * 100);
    return { avgDeviation, maxDeviation, accuracy };
  };

  const deviationStats = calculateDeviationStats();

  // ============ 用能管理计算 ============
  const energyStats = useMemo(() => {
    const totalEnergy = energyUsageData.reduce((sum, d) => sum + d.actualUsage, 0);
    const avgDeviation = energyUsageData.reduce((sum, d) => sum + Math.abs(d.predictedUsage - d.actualUsage) / d.predictedUsage * 100, 0) / energyUsageData.length;
    const peakRatio = energyUsageData.reduce((sum, d) => sum + d.peakRatio, 0) / energyUsageData.length;
    const flatRatio = energyUsageData.reduce((sum, d) => sum + d.flatRatio, 0) / energyUsageData.length;
    const valleyRatio = energyUsageData.reduce((sum, d) => sum + d.valleyRatio, 0) / energyUsageData.length;
    const totalProfit = energyUsageData.reduce((sum, d) => sum + d.profit, 0);
    const excellentCustomers = customerQuality.filter(c => c.category === "优质").length;
    return { totalEnergy, avgDeviation, peakRatio, flatRatio, valleyRatio, totalProfit, excellentCustomers };
  }, [energyUsageData, customerQuality]);

  const trendData = useMemo(() => {
    const grouped: Record<string, { date: string; totalUsage: number; predictedUsage: number }> = {};
    energyUsageData.forEach(d => {
      if (!grouped[d.date]) grouped[d.date] = { date: d.date, totalUsage: 0, predictedUsage: 0 };
      grouped[d.date].totalUsage += d.actualUsage;
      grouped[d.date].predictedUsage += d.predictedUsage;
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [energyUsageData]);

  const peakValleyData = [
    { name: "峰时段", value: energyStats.peakRatio, color: "#ef4444" },
    { name: "平时段", value: energyStats.flatRatio, color: "#f59e0b" },
    { name: "谷时段", value: energyStats.valleyRatio, color: "#10b981" },
  ];

  const deviationRanking = useMemo(() => {
    const customerDeviations = mockCustomers.map(c => {
      const customerData = energyUsageData.filter(d => d.customerId === c.id);
      const avgDev = customerData.reduce((sum, d) => sum + Math.abs(d.predictedUsage - d.actualUsage) / d.predictedUsage * 100, 0) / customerData.length;
      return { ...c, avgDeviation: avgDev };
    });
    return customerDeviations.sort((a, b) => b.avgDeviation - a.avgDeviation);
  }, [energyUsageData]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "优质": return "#10b981";
      case "普通": return "#f59e0b";
      case "关注": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = { "优质": "bg-green-100 text-green-800", "普通": "bg-yellow-100 text-yellow-800", "关注": "bg-red-100 text-red-800" };
    return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category}</Badge>;
  };

  const customerDetail = useMemo(() => {
    if (!selectedCustomer) return null;
    const customer = mockCustomers.find(c => c.id === selectedCustomer);
    const usage = energyUsageData.filter(d => d.customerId === selectedCustomer);
    const quality = customerQuality.find(c => c.id === selectedCustomer);
    return { customer, usage, quality };
  }, [selectedCustomer, energyUsageData, customerQuality]);

  const predictionChartConfig = {
    actual: { label: "实际负荷", color: "#00B04D" },
    predicted: { label: "预测负荷", color: "#3b82f6" },
    upperBound: { label: "置信上界", color: "#93c5fd" },
    lowerBound: { label: "置信下界", color: "#93c5fd" },
  };

  const analysisChartConfig = {
    industrial: { label: "工业", color: "#ef4444" },
    commercial: { label: "商业", color: "#f59e0b" },
    residential: { label: "居民", color: "#10b981" },
  };

  const energyChartConfig = {
    totalUsage: { label: "实际用电", color: "#00B04D" },
    predictedUsage: { label: "预测用电", color: "#3b82f6" },
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">用电管理</h1>
        <p className="text-muted-foreground mt-2">综合用电预测、分析与能源管理</p>
      </div>

      <Tabs defaultValue="energy" className="space-y-4">
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="energy">用能管理</TabsTrigger>
          <TabsTrigger value="prediction">用电量预测</TabsTrigger>
          <TabsTrigger value="analysis">用电量分析</TabsTrigger>
        </TabsList>

        {/* ============ 用能管理 Tab ============ */}
        <TabsContent value="energy" className="space-y-4">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" />总用电量
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{(energyStats.totalEnergy / 1000).toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">万kWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />平均偏差率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{energyStats.avgDeviation.toFixed(1)}%</div>
                <Badge variant={energyStats.avgDeviation < 10 ? "default" : "destructive"} className="mt-1">
                  {energyStats.avgDeviation < 10 ? "正常" : "偏高"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />峰平谷比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold font-mono">
                  {energyStats.peakRatio.toFixed(0)}:{energyStats.flatRatio.toFixed(0)}:{energyStats.valleyRatio.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">峰:平:谷</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />总收益
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-green-600">{(energyStats.totalProfit / 10000).toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-1">万元</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />优质客户
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{energyStats.excellentCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">/ {mockCustomers.length} 户</p>
              </CardContent>
            </Card>
          </div>

          {/* 用电趋势图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">用电趋势</CardTitle>
              <CardDescription>近30天用电量趋势对比</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={energyChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => v.slice(5)} />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="totalUsage" stroke="#00B04D" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="predictedUsage" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* 峰平谷分布和偏差排名 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">峰平谷分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={peakValleyData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                        {peakValleyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />偏差排名
                </CardTitle>
                <CardDescription>偏差率最高的客户</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deviationRanking.slice(0, 5).map((customer, idx) => (
                    <div key={customer.id} className="flex items-center justify-between p-2 rounded hover:bg-[#F8FBFA] cursor-pointer"
                      onClick={() => { setSelectedCustomer(customer.id); setShowDetail(true); }}>
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#F1F8F4] flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                      <Badge variant={customer.avgDeviation > 10 ? "destructive" : "secondary"}>
                        {customer.avgDeviation.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 客户质量矩阵 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">客户质量分析</CardTitle>
              <CardDescription>基于偏差率和收益率的客户分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-[#F1F8F4]">
                    <tr className="border-b">
                      <th className="h-10 px-4 text-left font-semibold text-xs">客户名称</th>
                      <th className="h-10 px-4 text-left font-semibold text-xs">类型</th>
                      <th className="h-10 px-4 text-right font-semibold text-xs">质量评分</th>
                      <th className="h-10 px-4 text-right font-semibold text-xs">偏差率</th>
                      <th className="h-10 px-4 text-right font-semibold text-xs">收益率</th>
                      <th className="h-10 px-4 text-center font-semibold text-xs">等级</th>
                      <th className="h-10 px-4 text-center font-semibold text-xs">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerQuality.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-[#F8FBFA]">
                        <td className="p-4 font-medium">{customer.name}</td>
                        <td className="p-4">{customer.type}</td>
                        <td className="p-4 text-right font-mono">{customer.qualityScore.toFixed(0)}</td>
                        <td className="p-4 text-right font-mono">{customer.deviationRate.toFixed(1)}%</td>
                        <td className="p-4 text-right font-mono text-green-600">{(customer.profitability * 100).toFixed(2)}%</td>
                        <td className="p-4 text-center">{getCategoryBadge(customer.category)}</td>
                        <td className="p-4 text-center">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedCustomer(customer.id); setShowDetail(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 客户详情 Sheet */}
          <Sheet open={showDetail} onOpenChange={setShowDetail}>
            <SheetContent className="w-[500px] sm:w-[600px]">
              <SheetHeader>
                <SheetTitle>{customerDetail?.customer?.name}</SheetTitle>
                <SheetDescription>客户用电详情</SheetDescription>
              </SheetHeader>
              {customerDetail && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">客户类型</p>
                      <p className="font-medium">{customerDetail.customer?.type}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">电压等级</p>
                      <p className="font-medium">{customerDetail.customer?.voltage}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">质量评分</p>
                      <p className="font-medium">{customerDetail.quality?.qualityScore.toFixed(0)}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">客户等级</p>
                      {getCategoryBadge(customerDetail.quality?.category || "")}
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </TabsContent>

        {/* ============ 用电量预测 Tab ============ */}
        <TabsContent value="prediction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />AI负荷预测
              </CardTitle>
              <CardDescription>基于历史数据和气象条件的智能负荷预测</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>客户类型</Label>
                  <Select value={predictionParams.customerType} onValueChange={(value) => setPredictionParams({ ...predictionParams, customerType: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    {isPredicting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI预测中...</> : <><Brain className="h-4 w-4 mr-2" />开始预测</>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <Badge variant={predictionData.summary.overallConfidence > 85 ? "default" : "secondary"} className="mt-1">
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
                        <Area type="monotone" dataKey="upperBound" stroke="none" fill="#93c5fd" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#93c5fd" fillOpacity={0.2} />
                        <Line type="monotone" dataKey="predictedLoad" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5" />历史预测准确性</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">平均偏差</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{deviationStats.avgDeviation.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">MW</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">最大偏差</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{deviationStats.maxDeviation.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">MW</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">预测准确率</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{deviationStats.accuracy.toFixed(1)}%</div>
                    <Badge variant={deviationStats.accuracy > 90 ? "default" : "secondary"} className="mt-1">
                      {deviationStats.accuracy > 90 ? "优秀" : "良好"}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
              <ChartContainer config={predictionChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="actual" stroke="#00B04D" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

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
        </TabsContent>

        {/* ============ 用电量分析 Tab ============ */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">总用电量</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">62,000</div>
                <p className="text-xs text-muted-foreground mt-1">MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">代理用户数</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">156</div>
                <p className="text-xs text-muted-foreground mt-1">户</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">户均用电量</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">397</div>
                <p className="text-xs text-muted-foreground mt-1">MWh/户</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">环比增长</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-green-600">+4.2%</div>
                <p className="text-xs text-muted-foreground mt-1">较上月</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5" />时段用电分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analysisData.byTimeSlot} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                        {analysisData.byTimeSlot.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" />电压等级分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={analysisChartConfig} className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisData.byVoltage}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#00B04D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">客户类型用电分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-[#F1F8F4]">
                    <tr className="border-b">
                      <th className="h-10 px-4 text-left font-semibold text-xs">客户类型</th>
                      <th className="h-10 px-4 text-right font-semibold text-xs">用电量 (MWh)</th>
                      <th className="h-10 px-4 text-right font-semibold text-xs">占比</th>
                      <th className="h-10 px-4 text-right font-semibold text-xs">同比增长</th>
                      <th className="h-10 px-4 text-center font-semibold text-xs">趋势</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.byCustomerType.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-[#F8FBFA]">
                        <td className="p-4 font-medium">{row.type}</td>
                        <td className="p-4 text-right font-mono text-xs">{row.load.toLocaleString()}</td>
                        <td className="p-4 text-right font-mono text-xs">{row.percentage}%</td>
                        <td className="p-4 text-right font-mono text-xs text-green-600">+{row.growth}%</td>
                        <td className="p-4 text-center"><TrendingUp className="h-4 w-4 text-green-600 inline" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">24小时负荷分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={analysisChartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysisData.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="industrial" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="commercial" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="residential" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
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

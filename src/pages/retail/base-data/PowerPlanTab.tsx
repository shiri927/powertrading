import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Plus, TrendingUp, TrendingDown, ChevronDown, Download, Upload, Loader2, RefreshCw, Clock } from "lucide-react";
import { usePowerPlanData } from "@/hooks/usePowerPlanData";
import { usePowerPlanTimeSeries } from "@/hooks/usePowerPlanTimeSeries";

const chartConfig = {
  planned: { label: "计划电量", color: "#3b82f6" },
  actual: { label: "预测电量", color: "#10b981" },
  settled: { label: "结算电量", color: "#00B04D" },
  completion: { label: "完成率", color: "#f59e0b" },
  deviationRate: { label: "偏差率", color: "#ef4444" },
  workday: { label: "工作日曲线", color: "#00B04D" },
  weekend: { label: "周末曲线", color: "#3b82f6" },
  holiday: { label: "节假日曲线", color: "#f59e0b" },
  predicted: { label: "预测功率", color: "#8b5cf6" },
  deviation: { label: "偏差率", color: "#ef4444" },
};

const PowerPlanTab = () => {
  const [curveTab, setCurveTab] = useState("overview");
  const [curveOpen, setCurveOpen] = useState(false);
  const [timeSeriesMonth, setTimeSeriesMonth] = useState("1");
  
  const { 
    metrics: powerPlanMetrics, 
    monthlyData: powerPlanData, 
    settlementAnalysis, 
    typicalCurves: typicalCurveData,
    isLoading,
    refetch 
  } = usePowerPlanData();

  const {
    timeSeriesData,
    isLoading: isTimeSeriesLoading,
    fetchAggregatedTimeSeries,
  } = usePowerPlanTimeSeries();

  // 加载时序数据
  useEffect(() => {
    fetchAggregatedTimeSeries(2025, parseInt(timeSeriesMonth));
  }, [timeSeriesMonth, fetchAggregatedTimeSeries]);

  return (
    <div className="space-y-4">
      {/* 刷新按钮 */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          刷新数据
        </Button>
      </div>

      {/* 指标概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading && powerPlanMetrics.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          powerPlanMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                {metric.subValue && (
                  <Badge 
                    variant={metric.status === "success" ? "default" : metric.status === "warning" ? "secondary" : "outline"} 
                    className="mt-2"
                  >
                    {metric.subValue}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 结算数据统计分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            结算数据统计分析
          </CardTitle>
          <CardDescription>预测电量与结算电量对比分析</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {settlementAnalysis.map((item, index) => (
              <div key={index} className="p-4 rounded-lg border bg-[#F8FBFA]">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono">{item.value}</span>
                  <span className="text-sm text-muted-foreground">{item.unit}</span>
                </div>
                <div className={`flex items-center gap-1 mt-2 text-xs ${
                  item.status === "success" ? "text-green-600" : 
                  item.status === "warning" ? "text-amber-600" :
                  item.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {item.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {item.change}
                </div>
              </div>
            ))}
          </div>
          
          {/* 结算分析图表 */}
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={powerPlanData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" domain={[-15, 15]} label={{ value: '偏差率 (%)', angle: 90, position: 'insideRight' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar yAxisId="left" dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} name="预测电量" />
                <Bar yAxisId="left" dataKey="settled" fill="#00B04D" radius={[4, 4, 0, 0]} name="结算电量" />
                <Line yAxisId="right" type="monotone" dataKey="deviationRate" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="偏差率" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />新建年度计划</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新建年度电量计划</DialogTitle>
              <DialogDescription>填写年度电量计划信息</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>交易单元</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="选择交易单元" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit-a">山东省场站A</SelectItem>
                      <SelectItem value="unit-b">山东省场站B</SelectItem>
                      <SelectItem value="unit-c">山西省场站A</SelectItem>
                      <SelectItem value="unit-d">浙江省场站A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>计划年份</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="选择年份" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>计划总电量 (MWh)</Label>
                <Input type="number" placeholder="输入年度计划总电量" />
              </div>
              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea placeholder="输入备注信息" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">取消</Button>
              <Button>确认创建</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline"><Plus className="h-4 w-4 mr-2" />新建月度计划</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新建月度电量计划</DialogTitle>
              <DialogDescription>填写月度电量计划信息</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>交易单元</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="选择交易单元" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit-a">单元A</SelectItem>
                      <SelectItem value="unit-b">单元B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>计划月份</Label>
                  <Input type="month" defaultValue="2025-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>计划电量 (MWh)</Label>
                <Input type="number" placeholder="输入月度计划电量" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">取消</Button>
              <Button>确认创建</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 电量计划完成情况图表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">电量计划完成情况</CardTitle>
          <CardDescription>月度计划电量与实际电量对比</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={powerPlanData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: '完成率 (%)', angle: 90, position: 'insideRight' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar yAxisId="left" dataKey="planned" fill="#3b82f6" radius={[4, 4, 0, 0]} name="计划电量" />
                <Bar yAxisId="left" dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} name="预测电量" />
                <Line yAxisId="right" type="monotone" dataKey="completion" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="完成率" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 发电计划时序分析 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                发电计划时序分析
              </CardTitle>
              <CardDescription>24小时计划/预测/实际功率对比</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">选择月份:</Label>
              <Select value={timeSeriesMonth} onValueChange={setTimeSeriesMonth}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}月</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isTimeSeriesLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : timeSeriesData.length > 0 ? (
            <div className="space-y-4">
              {/* 时序图表 */}
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" label={{ value: '功率 (MW)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" domain={[-20, 20]} label={{ value: '偏差率 (%)', angle: 90, position: 'insideRight' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area yAxisId="left" type="monotone" dataKey="planned" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={2} name="计划功率" />
                    <Line yAxisId="left" type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="预测功率" />
                    <Line yAxisId="left" type="monotone" dataKey="actual" stroke="#00B04D" strokeWidth={2} dot={{ r: 3 }} name="实际功率" />
                    <Line yAxisId="right" type="monotone" dataKey="deviation" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="偏差率" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* 时序数据统计 */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 rounded-lg border bg-[#F8FBFA]">
                  <p className="text-xs text-muted-foreground">计划功率峰值</p>
                  <p className="text-lg font-bold font-mono">
                    {Math.max(...timeSeriesData.map(d => d.planned)).toFixed(2)} <span className="text-xs font-normal text-muted-foreground">MW</span>
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-[#F8FBFA]">
                  <p className="text-xs text-muted-foreground">实际功率峰值</p>
                  <p className="text-lg font-bold font-mono">
                    {Math.max(...timeSeriesData.filter(d => d.actual != null).map(d => d.actual!)).toFixed(2)} <span className="text-xs font-normal text-muted-foreground">MW</span>
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-[#F8FBFA]">
                  <p className="text-xs text-muted-foreground">平均偏差率</p>
                  <p className="text-lg font-bold font-mono">
                    {(timeSeriesData.reduce((sum, d) => sum + Math.abs(d.deviation), 0) / timeSeriesData.length).toFixed(2)} <span className="text-xs font-normal text-muted-foreground">%</span>
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-[#F8FBFA]">
                  <p className="text-xs text-muted-foreground">最大偏差时段</p>
                  <p className="text-lg font-bold font-mono">
                    {timeSeriesData.reduce((max, d) => Math.abs(d.deviation) > Math.abs(max.deviation) ? d : max, timeSeriesData[0])?.hour || '--'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              暂无时序数据
            </div>
          )}
        </CardContent>
      </Card>

      <Collapsible open={curveOpen} onOpenChange={setCurveOpen}>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <div>
                  <CardTitle className="text-lg">典型曲线维护</CardTitle>
                  <CardDescription>管理用户典型负荷曲线（工作日/周末/节假日）</CardDescription>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${curveOpen ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Tabs value={curveTab} onValueChange={setCurveTab}>
                  <TabsList>
                    <TabsTrigger value="overview">曲线概览</TabsTrigger>
                    <TabsTrigger value="workday">工作日曲线</TabsTrigger>
                    <TabsTrigger value="weekend">周末曲线</TabsTrigger>
                    <TabsTrigger value="holiday">节假日曲线</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" />导入</Button>
                  <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />导出</Button>
                </div>
              </div>

              {curveTab === "overview" && (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={typicalCurveData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '负荷 (MW)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area type="monotone" dataKey="workday" stroke="#00B04D" fill="#00B04D" fillOpacity={0.3} name="工作日" />
                      <Area type="monotone" dataKey="weekend" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="周末" />
                      <Area type="monotone" dataKey="holiday" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="节假日" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {curveTab !== "overview" && (
                <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-[#F1F8F4]">
                      <TableRow>
                        <TableHead className="w-20">时段</TableHead>
                        {Array.from({ length: 12 }, (_, i) => (
                          <TableHead key={i} className="text-center text-xs w-16">{i.toString().padStart(2, '0')}:00</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-[#F8FBFA]">
                        <TableCell className="font-medium text-xs">00-11时</TableCell>
                        {typicalCurveData.slice(0, 12).map((item, i) => (
                          <TableCell key={i} className="text-center">
                            <Input 
                              type="number" 
                              className="w-14 h-7 text-xs text-center p-1" 
                              defaultValue={Math.round(curveTab === "workday" ? item.workday : curveTab === "weekend" ? item.weekend : item.holiday)} 
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="hover:bg-[#F8FBFA]">
                        <TableCell className="font-medium text-xs">12-23时</TableCell>
                        {typicalCurveData.slice(12, 24).map((item, i) => (
                          <TableCell key={i} className="text-center">
                            <Input 
                              type="number" 
                              className="w-14 h-7 text-xs text-center p-1" 
                              defaultValue={Math.round(curveTab === "workday" ? item.workday : curveTab === "weekend" ? item.weekend : item.holiday)} 
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default PowerPlanTab;

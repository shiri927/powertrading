import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Cell } from "recharts";
import { ChevronDown, ChevronUp, Brain, Target, AlertTriangle, TrendingUp, TrendingDown, Zap, Calculator, CheckCircle2, Download, Clock, Settings, Loader2 } from "lucide-react";
import { useMarketClearingPrices } from "@/hooks/useMarketClearingPrices";

// 生成24小时申报策略数据
const generateBiddingData = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const base = 150 + Math.sin(i / 24 * Math.PI * 2) * 50;
    const aiOptimized = base * (0.95 + Math.random() * 0.1);
    const manualAdjust = aiOptimized + (Math.random() - 0.5) * 10;
    const expectedRevenue = (manualAdjust * (25 + Math.random() * 15));
    return {
      time: `${i.toString().padStart(2, '0')}:00`,
      originalLoad: base.toFixed(1),
      aiOptimized: aiOptimized.toFixed(1),
      manualAdjust: manualAdjust.toFixed(1),
      finalBid: manualAdjust.toFixed(1),
      expectedRevenue: expectedRevenue.toFixed(0),
    };
  });
};

// 从交易单元提取省份
const getProvinceFromUnit = (unit: string): string => {
  if (unit.includes('山东')) return '山东';
  if (unit.includes('山西')) return '山西';
  if (unit.includes('浙江')) return '浙江';
  return '山东';
};

const RetailIntraProvincialSpotTab = () => {
  const [selectedUnit, setSelectedUnit] = useState("山东售电公司A");
  const [adjustMode, setAdjustMode] = useState("semi-auto");
  const [adjustRatio, setAdjustRatio] = useState([0]);
  const [showOptimization, setShowOptimization] = useState(true);
  const [useAiStrategy, setUseAiStrategy] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2025-12-15'); // 使用有数据的日期

  // 根据选中的交易单元获取省份
  const selectedProvince = useMemo(() => getProvinceFromUnit(selectedUnit), [selectedUnit]);

  // 从数据库获取市场出清价格数据
  const { data: marketClearingData, isLoading: isLoadingPrices } = useMarketClearingPrices(selectedDate, selectedProvince);

  // 转换为价差预测图表数据
  const priceDiffData = useMemo(() => {
    if (!marketClearingData || marketClearingData.length === 0) {
      // 如果没有数据，返回空数组
      return [];
    }
    
    return marketClearingData.map(record => ({
      hour: `${String(record.hour).padStart(2, '0')}:00`,
      dayAheadPrice: record.day_ahead_price || 0,
      realtimePrice: record.realtime_price || 0,
      priceDiff: (record.day_ahead_price || 0) - (record.realtime_price || 0),
    }));
  }, [marketClearingData]);

  // 计算统计指标
  const priceStats = useMemo(() => {
    if (priceDiffData.length === 0) {
      return { avgDayAhead: 0, avgRealtime: 0, avgDiff: 0, maxDiff: 0, minDiff: 0 };
    }
    
    const dayAheadPrices = priceDiffData.map(d => d.dayAheadPrice);
    const realtimePrices = priceDiffData.map(d => d.realtimePrice);
    const diffs = priceDiffData.map(d => d.priceDiff);
    
    return {
      avgDayAhead: dayAheadPrices.reduce((a, b) => a + b, 0) / dayAheadPrices.length,
      avgRealtime: realtimePrices.reduce((a, b) => a + b, 0) / realtimePrices.length,
      avgDiff: diffs.reduce((a, b) => a + b, 0) / diffs.length,
      maxDiff: Math.max(...diffs),
      minDiff: Math.min(...diffs),
    };
  }, [priceDiffData]);

  // 计算价差Y轴的对称范围（0在中心）
  const maxAbsDiff = useMemo(() => {
    if (priceDiffData.length === 0) return 50;
    const maxAbs = Math.max(...priceDiffData.map(d => Math.abs(d.priceDiff)));
    return Math.ceil(maxAbs / 10) * 10 + 10; // 向上取整到10的倍数并留余量
  }, [priceDiffData]);

  const biddingData = useMemo(() => generateBiddingData(), []);

  // 运筹优化结果
  const optimizationResult = useMemo(() => ({
    optimalPurchase: 3580,
    expectedSpreadRevenue: 42.5,
    expectedDeviationCost: 2.8,
    netRevenue: 39.7,
    objective: "max Σ(负荷量 × 价差收益) - 偏差考核成本",
    constraints: [
      { name: "购电量约束", formula: "0 ≤ Q_buy ≤ 450 MWh/时段", status: "satisfied" },
      { name: "负荷匹配约束", formula: "|Q_buy - Q_load| / Q_load ≤ 5%", status: "satisfied" },
      { name: "持仓约束", formula: "Q_position ≤ 2000 MWh", status: "satisfied" },
      { name: "风险约束", formula: "VaR ≤ 50万元", status: "warning" },
    ],
  }), []);

  return (
    <div className="space-y-6">
      {/* 筛选栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择交易单元" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="山东售电公司A">山东售电公司A</SelectItem>
              <SelectItem value="山东售电公司B">山东售电公司B</SelectItem>
              <SelectItem value="山西售电公司A">山西售电公司A</SelectItem>
              <SelectItem value="浙江售电公司A">浙江售电公司A</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-[140px]">
              <Clock className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['2025-12-15', '2025-12-14', '2025-12-13', '2025-12-12', '2025-12-11', '2025-12-10', '2025-12-09'].map(date => (
                <SelectItem key={date} value={date}>{date}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Label className="text-sm">调整模式：</Label>
            <Select value={adjustMode} onValueChange={setAdjustMode}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semi-auto">半人工</SelectItem>
                <SelectItem value="manual">纯人工</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            导出策略
          </Button>
          <Button className="bg-[#00B04D] hover:bg-[#009040]">
            <Zap className="h-4 w-4 mr-1" />
            一键下发
          </Button>
        </div>
      </div>

      {/* 价差预测分析区 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            价差预测分析
          </CardTitle>
          <CardDescription>日前价格 vs 实时价格 vs 价差（日前-实时）| 省份：{selectedProvince} | 日期：{selectedDate}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPrices ? (
            <div className="flex items-center justify-center h-[280px]">
              <Loader2 className="h-8 w-8 animate-spin text-[#00B04D]" />
              <span className="ml-2 text-muted-foreground">加载价格数据...</span>
            </div>
          ) : priceDiffData.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground">
              暂无 {selectedProvince} {selectedDate} 的价格数据
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={priceDiffData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  {/* 左Y轴 - 价格 */}
                  <YAxis 
                    yAxisId="left"
                    label={{ value: '价格 (元/MWh)', angle: -90, position: 'insideLeft', fontSize: 11 }} 
                    tick={{ fontSize: 11 }}
                  />
                  {/* 右Y轴 - 价差（0在中心） */}
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[-maxAbsDiff, maxAbsDiff]}
                    label={{ value: '价差 (元/MWh)', angle: 90, position: 'insideRight', fontSize: 11 }} 
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(2)} 元/MWh`,
                      name === 'dayAheadPrice' ? '日前价格' : 
                      name === 'realtimePrice' ? '实时价格' : '价差(日前-实时)'
                    ]}
                    labelFormatter={(label) => `时间：${label}`}
                  />
                  <Legend 
                    formatter={(value) => 
                      value === 'dayAheadPrice' ? '日前价格' : 
                      value === 'realtimePrice' ? '实时价格' : '价差(日前-实时)'
                    }
                  />
                  
                  {/* 价差柱状图 - 使用右轴，正值绿色，负值红色 */}
                  <Bar 
                    yAxisId="right"
                    dataKey="priceDiff" 
                    name="priceDiff"
                    opacity={0.7}
                  >
                    {priceDiffData.map((entry, index) => (
                      <Cell key={index} fill={entry.priceDiff >= 0 ? '#00B04D' : '#ef4444'} />
                    ))}
                  </Bar>
                  
                  {/* 日前价格曲线 - 蓝色 + 24个数据点 */}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="dayAheadPrice" 
                    stroke="#1976D2" 
                    strokeWidth={2} 
                    name="dayAheadPrice" 
                    dot={{ r: 3, fill: '#1976D2', strokeWidth: 0 }}
                  />
                  
                  {/* 实时价格曲线 - 橙色 + 24个数据点 */}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="realtimePrice" 
                    stroke="#FF9800" 
                    strokeWidth={2} 
                    name="realtimePrice" 
                    dot={{ r: 3, fill: '#FF9800', strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              {/* 统计指标卡片 */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-[#F1F8F4] rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">日前均价</p>
                  <p className="text-lg font-bold font-mono text-[#1976D2]">{priceStats.avgDayAhead.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">元/MWh</p>
                </div>
                <div className="p-3 bg-[#F1F8F4] rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">实时均价</p>
                  <p className="text-lg font-bold font-mono text-[#FF9800]">{priceStats.avgRealtime.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">元/MWh</p>
                </div>
                <div className="p-3 bg-[#F1F8F4] rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">平均价差</p>
                  <p className={`text-lg font-bold font-mono ${priceStats.avgDiff >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                    {priceStats.avgDiff >= 0 ? '+' : ''}{priceStats.avgDiff.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">元/MWh</p>
                </div>
                <div className="p-3 bg-[#F1F8F4] rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">最大价差</p>
                  <p className={`text-lg font-bold font-mono ${priceStats.maxDiff >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                    {priceStats.maxDiff >= 0 ? '+' : ''}{priceStats.maxDiff.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">元/MWh</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {/* AI智能策略优化区 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#00B04D]" />
              AI智能策略优化
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">启用AI策略</span>
              <Switch checked={useAiStrategy} onCheckedChange={setUseAiStrategy} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F1F8F4] rounded-lg">
                <p className="text-xs text-muted-foreground">AI电价预测</p>
                <p className="text-lg font-bold font-mono text-[#00B04D]">¥342.5/MWh</p>
                <p className="text-xs text-muted-foreground">置信度 87%</p>
              </div>
              <div className="p-3 bg-[#F1F8F4] rounded-lg">
                <p className="text-xs text-muted-foreground">策略增益</p>
                <p className="text-lg font-bold font-mono text-green-600">+12.3%</p>
                <p className="text-xs text-muted-foreground">较基准策略</p>
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-[#00B04D] text-[#00B04D]">市场情绪</Badge>
                <span className="text-sm font-medium">偏多</span>
              </div>
              <p className="text-xs text-muted-foreground">推荐操作：低价时段增加购入，锁定价差收益</p>
            </div>
          </CardContent>
        </Card>

        {/* 运筹优化求解区 */}
        <Card className="col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[#00B04D]" />
                运筹优化求解
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowOptimization(!showOptimization)}>
                {showOptimization ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showOptimization && (
              <>
                {/* 目标函数 */}
                <div className="p-3 bg-[#F1F8F4] rounded-lg border-l-4 border-[#00B04D]">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-[#00B04D]" />
                    <span className="text-sm font-medium">目标函数</span>
                  </div>
                  <code className="text-sm font-mono text-[#00B04D]">{optimizationResult.objective}</code>
                </div>

                {/* 约束条件 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">约束条件</p>
                  <div className="grid grid-cols-2 gap-2">
                    {optimizationResult.constraints.map((c, i) => (
                      <div key={i} className="p-2 bg-muted/30 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">{c.name}</p>
                          <code className="text-xs font-mono text-muted-foreground">{c.formula}</code>
                        </div>
                        {c.status === "satisfied" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 优化结果指标 */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-[#F1F8F4] rounded-lg text-center">
                <p className="text-xs text-muted-foreground">最优购电量</p>
                <p className="text-lg font-bold font-mono">{optimizationResult.optimalPurchase} MWh</p>
              </div>
              <div className="p-3 bg-[#F1F8F4] rounded-lg text-center">
                <p className="text-xs text-muted-foreground">预期价差收益</p>
                <p className="text-lg font-bold font-mono text-green-600">¥{optimizationResult.expectedSpreadRevenue}万</p>
              </div>
              <div className="p-3 bg-[#F1F8F4] rounded-lg text-center">
                <p className="text-xs text-muted-foreground">预期偏差成本</p>
                <p className="text-lg font-bold font-mono text-red-500">¥{optimizationResult.expectedDeviationCost}万</p>
              </div>
              <div className="p-3 bg-[#E8F5E9] rounded-lg text-center border border-[#00B04D]">
                <p className="text-xs text-muted-foreground">净收益</p>
                <p className="text-lg font-bold font-mono text-[#00B04D]">¥{optimizationResult.netRevenue}万</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 申报策略调整区 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            申报策略调整
          </CardTitle>
          <CardDescription>
            {adjustMode === "semi-auto" ? "基于AI优化策略进行微调" : "完全自定义申报策略"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="adjust" className="space-y-4">
            <TabsList>
              <TabsTrigger value="adjust">批量调整</TabsTrigger>
              <TabsTrigger value="detail">分时调整</TabsTrigger>
            </TabsList>
            <TabsContent value="adjust" className="space-y-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4 flex-1">
                  <Label className="text-sm whitespace-nowrap">整体调整幅度：</Label>
                  <Slider
                    value={adjustRatio}
                    onValueChange={setAdjustRatio}
                    min={-20}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <span className="font-mono text-sm w-16 text-right">{adjustRatio[0] > 0 ? '+' : ''}{adjustRatio[0]}%</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">预览调整</Button>
                  <Button size="sm" className="bg-[#00B04D] hover:bg-[#009040]">应用调整</Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">尖峰时段+5%</Button>
                <Button variant="outline" size="sm">低谷时段-5%</Button>
                <Button variant="outline" size="sm">恢复AI推荐</Button>
                <Button variant="outline" size="sm">恢复原始值</Button>
              </div>
            </TabsContent>
            <TabsContent value="detail">
              <p className="text-sm text-muted-foreground">点击下方表格中的单元格可进行分时段调整</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 96点申报策略曲线表格 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">24小时申报策略曲线</CardTitle>
              <CardDescription>原始负荷 → AI优化 → 人工调整 → 最终申报</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                导出Excel
              </Button>
              <Button variant="outline" size="sm">历史记录</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-[#F1F8F4] sticky top-0 z-10">
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead className="text-right">原始负荷预测 (MW)</TableHead>
                  <TableHead className="text-right">AI优化量 (MW)</TableHead>
                  <TableHead className="text-right">人工调整量 (MW)</TableHead>
                  <TableHead className="text-right">最终申报量 (MW)</TableHead>
                  <TableHead className="text-right">预期收益 (¥)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {biddingData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-[#F8FBFA]">
                    <TableCell className="font-mono">{row.time}</TableCell>
                    <TableCell className="text-right font-mono">{row.originalLoad}</TableCell>
                    <TableCell className="text-right font-mono text-[#00B04D]">{row.aiOptimized}</TableCell>
                    <TableCell className="text-right font-mono">{row.manualAdjust}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{row.finalBid}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">{row.expectedRevenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetailIntraProvincialSpotTab;

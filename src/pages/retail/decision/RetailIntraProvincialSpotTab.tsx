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
  const [adjustMode, setAdjustMode] = useState("auto");
  const [adjustRatio, setAdjustRatio] = useState([0]);
  const [showOptimization, setShowOptimization] = useState(true);
  const [useAiStrategy, setUseAiStrategy] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2025-12-15'); // 使用有数据的日期

  // 根据选中的交易单元获取省份
  const selectedProvince = useMemo(() => getProvinceFromUnit(selectedUnit), [selectedUnit]);

  // 从数据库获取市场出清价格数据
  const { data: marketClearingData, isLoading: isLoadingPrices } = useMarketClearingPrices(selectedDate, selectedProvince);

  // 转换为96点价差预测图表数据
  const priceDiffData = useMemo(() => {
    if (!marketClearingData || marketClearingData.length === 0) {
      return [];
    }
    
    return marketClearingData
      .sort((a, b) => {
        if (a.hour !== b.hour) return a.hour - b.hour;
        return (a.quarter || 1) - (b.quarter || 1);
      })
      .map(record => {
        const quarter = record.quarter || 1;
        const minutes = ['00', '15', '30', '45'][quarter - 1];
        return {
          time: `${String(record.hour).padStart(2, '0')}:${minutes}`,
          hourValue: record.hour + (quarter - 1) * 0.25, // 用于X轴数值定位
          dayAheadPrice: record.day_ahead_price || 0,
          realtimePrice: record.realtime_price || 0,
          priceDiff: (record.day_ahead_price || 0) - (record.realtime_price || 0),
        };
      });
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
            <SelectTrigger className="w-[180px] bg-[#1a3a5c]/80 border-[#2a4a6c] text-white">
              <SelectValue placeholder="选择交易单元" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a3a5c] border-[#2a4a6c]">
              <SelectItem value="山东售电公司A" className="text-white hover:bg-[#2a4a6c]">山东售电公司A</SelectItem>
              <SelectItem value="山东售电公司B" className="text-white hover:bg-[#2a4a6c]">山东售电公司B</SelectItem>
              <SelectItem value="山西售电公司A" className="text-white hover:bg-[#2a4a6c]">山西售电公司A</SelectItem>
              <SelectItem value="浙江售电公司A" className="text-white hover:bg-[#2a4a6c]">浙江售电公司A</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-[140px] bg-[#1a3a5c]/80 border-[#2a4a6c] text-white">
              <Clock className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a3a5c] border-[#2a4a6c]">
              {['2025-12-15', '2025-12-14', '2025-12-13', '2025-12-12', '2025-12-11', '2025-12-10', '2025-12-09'].map(date => (
                <SelectItem key={date} value={date} className="text-white hover:bg-[#2a4a6c]">{date}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-slate-300">调整模式：</Label>
            <Select value={adjustMode} onValueChange={setAdjustMode}>
              <SelectTrigger className="w-[120px] bg-[#1a3a5c]/80 border-[#2a4a6c] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a3a5c] border-[#2a4a6c]">
                <SelectItem value="auto" className="text-white hover:bg-[#2a4a6c]">自动</SelectItem>
                <SelectItem value="manual" className="text-white hover:bg-[#2a4a6c]">人工</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#2a4a6c] text-slate-300 hover:bg-[#2a4a6c]">
            <Download className="h-4 w-4 mr-1" />
            导出策略
          </Button>
          <Button className="bg-[#00B04D] hover:bg-[#009040] text-white">
            <Zap className="h-4 w-4 mr-1" />
            一键下发
          </Button>
        </div>
      </div>

      {/* 价差预测分析区 */}
      <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-white">
            <TrendingUp className="h-4 w-4 text-[#00B04D]" />
            价差预测分析
          </CardTitle>
          <CardDescription className="text-slate-400">日前价格 vs 实时价格 vs 价差（日前-实时）| 省份：{selectedProvince} | 日期：{selectedDate}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPrices ? (
            <div className="flex items-center justify-center h-[280px]">
              <Loader2 className="h-8 w-8 animate-spin text-[#00B04D]" />
              <span className="ml-2 text-slate-400">加载价格数据...</span>
            </div>
          ) : priceDiffData.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-slate-400">
              暂无 {selectedProvince} {selectedDate} 的价格数据
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={priceDiffData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a4a6c" />
                  <XAxis 
                    dataKey="hourValue"
                    type="number"
                    domain={[1, 24]}
                    ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]}
                    tickFormatter={(value) => `${String(Math.floor(value)).padStart(2, '0')}:00`}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    stroke="#475569"
                  />
                  {/* 左Y轴 - 价格 */}
                  <YAxis 
                    yAxisId="left"
                    label={{ value: '价格 (元/MWh)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }} 
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    stroke="#475569"
                  />
                  {/* 右Y轴 - 价差（0在中心） */}
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[-maxAbsDiff, maxAbsDiff]}
                    label={{ value: '价差 (元/MWh)', angle: 90, position: 'insideRight', fontSize: 11, fill: '#94a3b8' }} 
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    stroke="#475569"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a3a5c', border: '1px solid #2a4a6c', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(2)} 元/MWh`,
                      name === 'dayAheadPrice' ? '日前价格' : 
                      name === 'realtimePrice' ? '实时价格' : '价差(日前-实时)'
                    ]}
                    labelFormatter={(label) => {
                      const item = priceDiffData.find(d => d.hourValue === label);
                      return item ? `时间：${item.time}` : `时间：${label}`;
                    }}
                  />
                  <Legend 
                    formatter={(value) => 
                      value === 'dayAheadPrice' ? '日前价格' : 
                      value === 'realtimePrice' ? '实时价格' : '价差(日前-实时)'
                    }
                    wrapperStyle={{ color: '#94a3b8' }}
                  />
                  
                  {/* 价差柱状图 - 使用右轴，正值绿色，负值红色 */}
                  <Bar 
                    yAxisId="right"
                    dataKey="priceDiff" 
                    name="priceDiff"
                    opacity={0.7}
                  >
                    {priceDiffData.map((entry, index) => (
                      <Cell key={index} fill={entry.priceDiff >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                  
                  {/* 日前价格曲线 - 蓝色 + 96个数据点 */}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="dayAheadPrice" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    name="dayAheadPrice" 
                    dot={{ r: 2, fill: '#3b82f6', strokeWidth: 0 }}
                  />
                  
                  {/* 实时价格曲线 - 橙色 + 96个数据点 */}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="realtimePrice" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    name="realtimePrice" 
                    dot={{ r: 2, fill: '#f59e0b', strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              {/* 统计指标卡片 */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-[#0d2137] rounded-lg text-center border border-[#2a4a6c]">
                  <p className="text-xs text-slate-400">日前均价</p>
                  <p className="text-lg font-bold font-mono text-blue-400">{priceStats.avgDayAhead.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">元/MWh</p>
                </div>
                <div className="p-3 bg-[#0d2137] rounded-lg text-center border border-[#2a4a6c]">
                  <p className="text-xs text-slate-400">实时均价</p>
                  <p className="text-lg font-bold font-mono text-amber-400">{priceStats.avgRealtime.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">元/MWh</p>
                </div>
                <div className="p-3 bg-[#0d2137] rounded-lg text-center border border-[#2a4a6c]">
                  <p className="text-xs text-slate-400">平均价差</p>
                  <p className={`text-lg font-bold font-mono ${priceStats.avgDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {priceStats.avgDiff >= 0 ? '+' : ''}{priceStats.avgDiff.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">元/MWh</p>
                </div>
                <div className="p-3 bg-[#0d2137] rounded-lg text-center border border-[#2a4a6c]">
                  <p className="text-xs text-slate-400">最大价差</p>
                  <p className={`text-lg font-bold font-mono ${priceStats.maxDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {priceStats.maxDiff >= 0 ? '+' : ''}{priceStats.maxDiff.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">元/MWh</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {/* AI智能策略优化区 */}
        <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Brain className="h-4 w-4 text-[#00B04D]" />
              AI智能策略优化
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">启用AI策略</span>
              <Switch checked={useAiStrategy} onCheckedChange={setUseAiStrategy} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#0d2137] rounded-lg border border-[#2a4a6c]">
                <p className="text-xs text-slate-400">AI电价预测</p>
                <p className="text-lg font-bold font-mono text-[#00B04D]">¥342.5/MWh</p>
                <p className="text-xs text-slate-500">置信度 87%</p>
              </div>
              <div className="p-3 bg-[#0d2137] rounded-lg border border-[#2a4a6c]">
                <p className="text-xs text-slate-400">策略增益</p>
                <p className="text-lg font-bold font-mono text-emerald-400">+12.3%</p>
                <p className="text-xs text-slate-500">较基准策略</p>
              </div>
            </div>
            <div className="p-3 bg-[#0d2137]/80 rounded-lg border border-[#2a4a6c]">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-[#00B04D] text-[#00B04D]">市场情绪</Badge>
                <span className="text-sm font-medium text-amber-400">偏多</span>
              </div>
              <p className="text-xs text-slate-400">推荐操作：低价时段增加购入，锁定价差收益</p>
            </div>
          </CardContent>
        </Card>

        {/* 运筹优化求解区 */}
        <Card className="col-span-2 bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Calculator className="h-4 w-4 text-[#00B04D]" />
                运筹优化求解
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-[#2a4a6c]" onClick={() => setShowOptimization(!showOptimization)}>
                {showOptimization ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showOptimization && (
              <>
                {/* 目标函数 */}
                <div className="p-3 bg-[#0d2137] rounded-lg border-l-4 border-[#00B04D]">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-[#00B04D]" />
                    <span className="text-sm font-medium text-white">目标函数</span>
                  </div>
                  <code className="text-sm font-mono text-[#00B04D]">{optimizationResult.objective}</code>
                </div>

                {/* 约束条件 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-300">约束条件</p>
                  <div className="grid grid-cols-2 gap-2">
                    {optimizationResult.constraints.map((c, i) => (
                      <div key={i} className="p-2 bg-[#0d2137]/80 rounded-lg flex items-center justify-between border border-[#2a4a6c]">
                        <div>
                          <p className="text-xs font-medium text-slate-300">{c.name}</p>
                          <code className="text-xs font-mono text-slate-500">{c.formula}</code>
                        </div>
                        {c.status === "satisfied" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 优化结果指标 */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-[#0d2137] rounded-lg text-center border border-[#2a4a6c]">
                <p className="text-xs text-slate-400">最优购电量</p>
                <p className="text-lg font-bold font-mono text-cyan-400">{optimizationResult.optimalPurchase} MWh</p>
              </div>
              <div className="p-3 bg-[#0d2137] rounded-lg text-center border border-[#2a4a6c]">
                <p className="text-xs text-slate-400">预期价差收益</p>
                <p className="text-lg font-bold font-mono text-emerald-400">¥{optimizationResult.expectedSpreadRevenue}万</p>
              </div>
              <div className="p-3 bg-[#0d2137] rounded-lg text-center border border-[#2a4a6c]">
                <p className="text-xs text-slate-400">预期偏差成本</p>
                <p className="text-lg font-bold font-mono text-rose-400">¥{optimizationResult.expectedDeviationCost}万</p>
              </div>
              <div className="p-3 bg-[#0d2137] rounded-lg text-center border border-[#00B04D]/50 border-2">
                <p className="text-xs text-slate-400">净收益</p>
                <p className="text-lg font-bold font-mono text-[#00B04D]">¥{optimizationResult.netRevenue}万</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 申报策略调整区 */}
      <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-white">
            <Settings className="h-4 w-4" />
            申报策略调整
          </CardTitle>
          <CardDescription className="text-slate-400">
            {adjustMode === "semi-auto" ? "基于AI优化策略进行微调" : "完全自定义申报策略"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="adjust" className="space-y-4">
            <TabsList className="bg-[#0d2137] border border-[#2a4a6c]">
              <TabsTrigger value="adjust" className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white text-slate-300">批量调整</TabsTrigger>
              <TabsTrigger value="detail" className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white text-slate-300">分时调整</TabsTrigger>
            </TabsList>
            <TabsContent value="adjust" className="space-y-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4 flex-1">
                  <Label className="text-sm whitespace-nowrap text-slate-300">整体调整幅度：</Label>
                  <Slider
                    value={adjustRatio}
                    onValueChange={setAdjustRatio}
                    min={-20}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <span className="font-mono text-sm w-16 text-right text-white">{adjustRatio[0] > 0 ? '+' : ''}{adjustRatio[0]}%</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-[#2a4a6c] text-slate-300 hover:bg-[#2a4a6c]">预览调整</Button>
                  <Button size="sm" className="bg-[#00B04D] hover:bg-[#009040] text-white">应用调整</Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-[#2a4a6c] text-slate-300 hover:bg-[#2a4a6c]">尖峰时段+5%</Button>
                <Button variant="outline" size="sm" className="border-[#2a4a6c] text-slate-300 hover:bg-[#2a4a6c]">低谷时段-5%</Button>
                <Button variant="outline" size="sm" className="border-[#2a4a6c] text-slate-300 hover:bg-[#2a4a6c]">恢复AI推荐</Button>
                <Button variant="outline" size="sm" className="border-[#2a4a6c] text-slate-300 hover:bg-[#2a4a6c]">恢复原始值</Button>
              </div>
            </TabsContent>
            <TabsContent value="detail">
              <p className="text-sm text-slate-400">点击下方表格中的单元格可进行分时段调整</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 96点申报策略曲线表格 */}
      <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">24小时申报策略曲线</CardTitle>
              <CardDescription className="text-slate-400">原始负荷 → AI优化 → 人工调整 → 最终申报</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-[#2a4a6c] text-slate-300 hover:bg-[#2a4a6c]">
                <Download className="h-4 w-4 mr-1" />
                导出Excel
              </Button>
              <Button variant="outline" size="sm" className="border-[#2a4a6c] text-slate-300 hover:bg-[#2a4a6c]">历史记录</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[#2a4a6c] max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-[#0d2137] sticky top-0 z-10">
                <TableRow className="border-[#2a4a6c] hover:bg-[#0d2137]">
                  <TableHead className="text-slate-300">时间</TableHead>
                  <TableHead className="text-right text-slate-300">原始负荷预测 (MW)</TableHead>
                  <TableHead className="text-right text-slate-300">AI优化量 (MW)</TableHead>
                  <TableHead className="text-right text-slate-300">人工调整量 (MW)</TableHead>
                  <TableHead className="text-right text-slate-300">最终申报量 (MW)</TableHead>
                  <TableHead className="text-right text-slate-300">预期收益 (¥)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {biddingData.map((row, i) => (
                  <TableRow key={i} className="border-[#2a4a6c] hover:bg-[#2a4a6c]/30">
                    <TableCell className="font-mono text-white">{row.time}</TableCell>
                    <TableCell className="text-right font-mono text-slate-300">{row.originalLoad}</TableCell>
                    <TableCell className="text-right font-mono text-[#00B04D]">{row.aiOptimized}</TableCell>
                    <TableCell className="text-right font-mono text-cyan-300">{row.manualAdjust}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-white">{row.finalBid}</TableCell>
                    <TableCell className="text-right font-mono text-emerald-400">{row.expectedRevenue}</TableCell>
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

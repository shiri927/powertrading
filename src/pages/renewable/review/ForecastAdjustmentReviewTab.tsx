import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { format, subDays } from "date-fns";
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart,
  ReferenceLine,
  ReferenceArea,
  Bar
} from "recharts";
import { cn } from "@/lib/utils";
import { useReviewData, ForecastAdjustmentData, ForecastEffectivenessMetrics } from "@/hooks/useReviewData";
import { supabase } from "@/integrations/supabase/client";

// ============= 数据结构定义 =============

interface StrategyOptimizationAdvice {
  id: string;
  category: 'warning' | 'suggestion' | 'improvement';
  title: string;
  description: string;
  targetPeriods?: string[];
  expectedImprovement?: string;
}

interface TradingUnit {
  id: string;
  unit_name: string;
  trading_center: string;
}

// ============= 辅助函数 =============

const generateOptimizationAdvice = (data: ForecastAdjustmentData[]): StrategyOptimizationAdvice[] => {
  const overPeriods = data.filter(d => d.adjustmentStatus === 'over').map(d => d.timePoint);
  const underPeriods = data.filter(d => d.adjustmentStatus === 'under').map(d => d.timePoint);
  
  const advice: StrategyOptimizationAdvice[] = [];
  
  if (overPeriods.length > 0) {
    advice.push({
      id: '1',
      category: 'warning',
      title: '调整过度时段建议',
      description: `以下时段申报量明显高于实际出力，建议降低调整幅度10-15%以减少偏差考核。`,
      targetPeriods: overPeriods.slice(0, 5),
      expectedImprovement: '预计可降低考核费用约15%',
    });
  }
  
  if (underPeriods.length > 0) {
    advice.push({
      id: '2',
      category: 'suggestion',
      title: '调整不足时段建议',
      description: `以下时段申报量低于实际出力，存在收益损失机会。建议增加调整力度5-10%以获取更多收益。`,
      targetPeriods: underPeriods.slice(0, 5),
      expectedImprovement: '预计可增加收益约8%',
    });
  }
  
  advice.push({
    id: '3',
    category: 'improvement',
    title: '天气敏感时段策略',
    description: '在多云或风力变化较大的时段，建议采用更保守的调整策略，将调整幅度控制在±5%以内。',
    expectedImprovement: '可有效降低极端天气带来的偏差风险',
  });
  
  advice.push({
    id: '4',
    category: 'suggestion',
    title: '偏差考核费用控制',
    description: '建议建立实时监控机制，当累计偏差接近阈值时自动触发预警，及时调整后续时段申报策略。',
    expectedImprovement: '预计可降低月度考核费用20-30%',
  });

  return advice;
};

// ============= 组件 =============

const ForecastAdjustmentReviewTab = () => {
  const [tradingCenter, setTradingCenter] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [granularity, setGranularity] = useState<'24' | '96'>('24');
  const [isAdviceOpen, setIsAdviceOpen] = useState(true);
  const [showCurves, setShowCurves] = useState({ original: true, declared: true, actual: true });
  const [localLoading, setLocalLoading] = useState(true);
  const [powerCurveData, setPowerCurveData] = useState<ForecastAdjustmentData[]>([]);
  const [tradingUnits, setTradingUnits] = useState<TradingUnit[]>([]);
  // 使用数据库中实际存在的日期范围（load_predictions: 2025-11-01 to 2025-11-07）
  const [dateRange, setDateRange] = useState({
    start: '2025-11-01',
    end: '2025-11-07',
  });

  const { fetchForecastAdjustmentData, calculateForecastEffectiveness } = useReviewData();

  // 加载数据
  const loadData = async () => {
    setLocalLoading(true);
    try {
      // 获取交易单元
      const { data: units } = await supabase
        .from('trading_units')
        .select('id, unit_name, trading_center')
        .eq('is_active', true)
        .eq('trading_category', 'renewable');
      
      if (units) {
        setTradingUnits(units);
      }

      // 获取预测调整数据
      const unitIds = units?.map(u => u.id) || [];
      const data = await fetchForecastAdjustmentData(
        dateRange.start, 
        dateRange.end, 
        unitIds.length > 0 ? unitIds : undefined,
        granularity
      );
      setPowerCurveData(data);
    } catch (error) {
      console.error('Error loading forecast adjustment data:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [granularity]);

  // 过滤数据
  const filteredData = useMemo(() => {
    let result = powerCurveData;
    if (tradingCenter !== 'all') {
      const centerMap: Record<string, string> = {
        'shandong': '山东',
        'shanxi': '山西',
        'zhejiang': '浙江'
      };
      result = result.filter(item => item.tradingUnit.includes(centerMap[tradingCenter] || ''));
    }
    if (selectedUnit !== 'all') {
      result = result.filter(item => item.tradingUnit === selectedUnit);
    }
    return result;
  }, [powerCurveData, tradingCenter, selectedUnit]);

  // 按时间点聚合数据用于图表
  const chartData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      if (!acc[item.timePoint]) {
        acc[item.timePoint] = {
          timePoint: item.timePoint,
          originalForecast: 0,
          declaredPower: 0,
          actualOutput: 0,
          deviation: 0,
          deviationRate: 0,
          dayAheadRevenue: 0,
          realTimeRevenue: 0,
          assessmentFee: 0,
          count: 0,
          adjustmentStatus: 'normal' as 'over' | 'under' | 'normal',
        };
      }
      acc[item.timePoint].originalForecast += item.originalForecast;
      acc[item.timePoint].declaredPower += item.declaredPower;
      acc[item.timePoint].actualOutput += item.actualOutput;
      acc[item.timePoint].deviation += item.deviation;
      acc[item.timePoint].deviationRate += item.deviationRate;
      acc[item.timePoint].dayAheadRevenue += item.dayAheadRevenue;
      acc[item.timePoint].realTimeRevenue += item.realTimeRevenue;
      acc[item.timePoint].assessmentFee += item.assessmentFee;
      acc[item.timePoint].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped)
      .map((item: any) => {
        const avgDeviationRate = item.deviationRate / item.count;
        const avgDeviation = item.deviation / item.count;
        let adjustmentStatus: 'over' | 'under' | 'normal' = 'normal';
        if (avgDeviationRate > 10) {
          adjustmentStatus = avgDeviation > 0 ? 'over' : 'under';
        }
        return {
          ...item,
          deviationRate: avgDeviationRate,
          adjustmentStatus,
        };
      })
      .sort((a, b) => a.timePoint.localeCompare(b.timePoint));
  }, [filteredData]);

  const effectiveness = useMemo(() => calculateForecastEffectiveness(filteredData), [filteredData, calculateForecastEffectiveness]);
  const optimizationAdvice = useMemo(() => generateOptimizationAdvice(filteredData), [filteredData]);

  // 偏差对收益影响数据
  const deviationImpactData = useMemo(() => {
    return chartData.map(d => ({
      timePoint: d.timePoint,
      dayAheadRevenue: d.dayAheadRevenue / 1000,
      realTimeRevenue: d.realTimeRevenue / 1000,
      assessmentFee: -d.assessmentFee / 1000,
      deviationRate: d.deviationRate,
    }));
  }, [chartData]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'over': return <Badge variant="destructive" className="text-xs">调整过度</Badge>;
      case 'under': return <Badge className="text-xs bg-yellow-500 hover:bg-yellow-500">调整不足</Badge>;
      case 'normal': return <Badge className="text-xs bg-[#00B04D] hover:bg-[#00B04D]">调整合理</Badge>;
      default: return null;
    }
  };

  const getAdviceIcon = (category: string) => {
    switch (category) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'suggestion': return <Lightbulb className="w-4 h-4 text-blue-500" />;
      case 'improvement': return <Target className="w-4 h-4 text-[#00B04D]" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (localLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00B04D]" />
        <span className="ml-2 text-muted-foreground">加载预测功率调整数据...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 筛选控制栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={tradingCenter} onValueChange={setTradingCenter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="全部交易中心" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部交易中心</SelectItem>
                <SelectItem value="shandong">山东交易中心</SelectItem>
                <SelectItem value="shanxi">山西交易中心</SelectItem>
                <SelectItem value="zhejiang">浙江交易中心</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="全部交易单元" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部交易单元</SelectItem>
                {tradingUnits.map(unit => (
                  <SelectItem key={unit.id} value={unit.unit_name}>{unit.unit_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm">
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border-0 text-xs font-mono outline-none"
              />
              <span>-</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border-0 text-xs font-mono outline-none"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#F1F8F4] rounded px-3 py-1">
              <button 
                className={cn("text-sm px-2 py-1 rounded", granularity === '24' && "font-bold text-[#00B04D] bg-white")}
                onClick={() => setGranularity('24')}
              >
                24点
              </button>
              <button 
                className={cn("text-sm px-2 py-1 rounded", granularity === '96' && "font-bold text-[#00B04D] bg-white")}
                onClick={() => setGranularity('96')}
              >
                96点
              </button>
            </div>

            <Button size="sm" onClick={loadData}>
              <Filter className="w-4 h-4 mr-2" />
              查询
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setTradingCenter('all');
              setSelectedUnit('all');
            }}>重置</Button>

            <Button variant="outline" size="sm" className="ml-auto" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 调整策略有效性评估 */}
      <Card className="border-[#00B04D]/30 bg-[#F8FBFA]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00B04D]" />
            调整策略有效性评估
          </CardTitle>
          <CardDescription>基于申报曲线与实际出力对比的综合评估</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold font-mono text-[#00B04D]">
                {effectiveness.effectiveRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">调整有效率</div>
              <div className="text-xs text-muted-foreground">调整方向正确时段占比</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className={cn(
                "text-2xl font-bold font-mono",
                effectiveness.revenueIncrement > 0 ? "text-[#00B04D]" : "text-red-500"
              )}>
                {effectiveness.revenueIncrement > 0 ? '+' : ''}{(effectiveness.revenueIncrement / 10000).toFixed(2)}万
              </div>
              <div className="text-sm text-muted-foreground mt-1">调整收益增量</div>
              <div className="text-xs text-muted-foreground">相比原始预测增加收益</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold font-mono text-red-500">
                -{(effectiveness.assessmentImpact / 10000).toFixed(2)}万
              </div>
              <div className="text-sm text-muted-foreground mt-1">偏差考核影响</div>
              <div className="text-xs text-muted-foreground">因调整产生的考核费用</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className={cn(
                "text-2xl font-bold font-mono",
                effectiveness.netRevenueChange > 0 ? "text-[#00B04D]" : "text-red-500"
              )}>
                {effectiveness.netRevenueChange > 0 ? '+' : ''}{(effectiveness.netRevenueChange / 10000).toFixed(2)}万
              </div>
              <div className="text-sm text-muted-foreground mt-1">净收益变化</div>
              <div className="text-xs text-muted-foreground">扣除考核费后净收益</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold font-mono text-red-500">
                {effectiveness.overAdjustmentPeriods}
              </div>
              <div className="text-sm text-muted-foreground mt-1">调整过度时段</div>
              <div className="text-xs text-muted-foreground">申报量明显高于实际</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold font-mono text-yellow-500">
                {effectiveness.underAdjustmentPeriods}
              </div>
              <div className="text-sm text-muted-foreground mt-1">调整不足时段</div>
              <div className="text-xs text-muted-foreground">申报量低于实际出力</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 三曲线对比图 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">三曲线对比分析</CardTitle>
              <CardDescription className="text-xs">原始功率预测 vs 申报曲线 vs 实际出力</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={showCurves.original}
                  onChange={(e) => setShowCurves(prev => ({ ...prev, original: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-gray-500">原始预测</span>
              </Label>
              <Label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={showCurves.declared}
                  onChange={(e) => setShowCurves(prev => ({ ...prev, declared: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-[#00B04D]">申报曲线</span>
              </Label>
              <Label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={showCurves.actual}
                  onChange={(e) => setShowCurves(prev => ({ ...prev, actual: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-orange-500">实际出力</span>
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              暂无数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                <XAxis dataKey="timePoint" tick={{ fontSize: 10 }} interval={granularity === '24' ? 0 : 7} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: '功率 (MW)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                <Tooltip 
                  contentStyle={{ fontSize: 11, backgroundColor: 'white', border: '1px solid #E8F0EC' }}
                  formatter={(value: number, name: string) => [value.toFixed(2) + ' MW', name]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                
                {/* 偏差区域高亮 */}
                {chartData.map((d, i) => {
                  if (d.adjustmentStatus === 'over') {
                    return (
                      <ReferenceArea 
                        key={i}
                        x1={d.timePoint} 
                        x2={chartData[i + 1]?.timePoint || d.timePoint}
                        fill="rgba(239, 68, 68, 0.1)"
                        strokeOpacity={0}
                      />
                    );
                  }
                  if (d.adjustmentStatus === 'under') {
                    return (
                      <ReferenceArea 
                        key={i}
                        x1={d.timePoint} 
                        x2={chartData[i + 1]?.timePoint || d.timePoint}
                        fill="rgba(234, 179, 8, 0.1)"
                        strokeOpacity={0}
                      />
                    );
                  }
                  return null;
                })}
                
                {showCurves.original && (
                  <Line 
                    type="monotone" 
                    dataKey="originalForecast" 
                    stroke="#888888" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="原始功率预测"
                  />
                )}
                {showCurves.declared && (
                  <Line 
                    type="monotone" 
                    dataKey="declaredPower" 
                    stroke="#00B04D" 
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#00B04D' }}
                    name="申报曲线"
                  />
                )}
                {showCurves.actual && (
                  <Line 
                    type="monotone" 
                    dataKey="actualOutput" 
                    stroke="#FFA500" 
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#FFA500' }}
                    name="实际出力"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* 调整过度/不足识别表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">调整过度/不足识别分析</CardTitle>
          <CardDescription className="text-xs">标识问题时段，优化申报策略</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                <TableRow>
                  <TableHead className="text-xs">时段</TableHead>
                  <TableHead className="text-xs">交易单元</TableHead>
                  <TableHead className="text-xs text-right">原始预测(MW)</TableHead>
                  <TableHead className="text-xs text-right">申报电量(MW)</TableHead>
                  <TableHead className="text-xs text-right">实际出力(MW)</TableHead>
                  <TableHead className="text-xs text-right">偏差量(MW)</TableHead>
                  <TableHead className="text-xs text-right">偏差率(%)</TableHead>
                  <TableHead className="text-xs text-center">评估标签</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.filter(d => d.adjustmentStatus !== 'normal').length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      暂无偏差异常数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.filter(d => d.adjustmentStatus !== 'normal').slice(0, 30).map((d, idx) => (
                    <TableRow key={idx} className={cn(
                      "hover:bg-[#F8FBFA]",
                      d.adjustmentStatus === 'over' && "bg-red-50",
                      d.adjustmentStatus === 'under' && "bg-yellow-50",
                    )}>
                      <TableCell className="text-xs font-mono">{d.timePoint}</TableCell>
                      <TableCell className="text-xs">{d.tradingUnit}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{d.originalForecast.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{d.declaredPower.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{d.actualOutput.toFixed(2)}</TableCell>
                      <TableCell className={cn(
                        "text-xs text-right font-mono",
                        d.deviation > 0 ? "text-red-500" : "text-[#00B04D]"
                      )}>
                        {d.deviation > 0 ? '+' : ''}{d.deviation.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">{d.deviationRate.toFixed(1)}%</TableCell>
                      <TableCell className="text-center">{getStatusLabel(d.adjustmentStatus)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 申报策略优化建议 */}
      <Collapsible open={isAdviceOpen} onOpenChange={setIsAdviceOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-[#F8FBFA] transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                  申报策略优化建议
                </CardTitle>
                {isAdviceOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              <CardDescription>基于复盘分析自动生成的优化建议</CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {optimizationAdvice.map(item => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "p-4 rounded-lg border",
                      item.category === 'warning' && "border-orange-200 bg-orange-50",
                      item.category === 'suggestion' && "border-blue-200 bg-blue-50",
                      item.category === 'improvement' && "border-green-200 bg-green-50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getAdviceIcon(item.category)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                        {item.targetPeriods && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.targetPeriods.map(period => (
                              <Badge key={period} variant="outline" className="text-xs">
                                {period}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {item.expectedImprovement && (
                          <div className="text-xs text-[#00B04D] mt-2 font-medium">
                            {item.expectedImprovement}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 偏差对收益影响分析图表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">偏差对收益影响分析</CardTitle>
          <CardDescription className="text-xs">偏差率与收益/考核费用关联性</CardDescription>
        </CardHeader>
        <CardContent>
          {deviationImpactData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              暂无数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={deviationImpactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                <XAxis dataKey="timePoint" tick={{ fontSize: 10 }} interval={granularity === '24' ? 0 : 7} />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 10 }} 
                  label={{ value: '收入 (千元)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 10 }} 
                  label={{ value: '偏差率 (%)', angle: 90, position: 'insideRight', style: { fontSize: 10 } }}
                />
                <Tooltip 
                  contentStyle={{ fontSize: 11, backgroundColor: 'white', border: '1px solid #E8F0EC' }}
                  formatter={(value: number, name: string) => [value.toFixed(2), name]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine yAxisId="left" y={0} stroke="#666" strokeDasharray="3 3" />
                <Bar yAxisId="left" dataKey="dayAheadRevenue" fill="#00B04D" name="日前收益(千元)" />
                <Bar yAxisId="left" dataKey="realTimeRevenue" fill="#20B2AA" name="实时收益(千元)" />
                <Bar yAxisId="left" dataKey="assessmentFee" fill="#FF6B6B" name="考核扣费(千元)" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="deviationRate" 
                  stroke="#9333EA" 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="偏差率(%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastAdjustmentReviewTab;

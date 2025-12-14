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
  MinusCircle
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useState, useMemo } from "react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Area, 
  AreaChart, 
  ComposedChart,
  ReferenceLine,
  ReferenceArea
} from "recharts";
import { cn } from "@/lib/utils";

// ============= 数据结构定义 =============

interface PowerCurveData {
  timePoint: string;
  originalForecast: number;
  declaredPower: number;
  actualOutput: number;
  deviation: number;
  deviationRate: number;
  adjustmentStatus: 'over' | 'under' | 'normal';
  dayAheadRevenue: number;
  realTimeRevenue: number;
  assessmentFee: number;
}

interface AdjustmentEffectivenessMetrics {
  effectiveRate: number;
  revenueIncrement: number;
  assessmentImpact: number;
  netRevenueChange: number;
  overAdjustmentPeriods: number;
  underAdjustmentPeriods: number;
  normalPeriods: number;
}

interface StrategyOptimizationAdvice {
  id: string;
  category: 'warning' | 'suggestion' | 'improvement';
  title: string;
  description: string;
  targetPeriods?: string[];
  expectedImprovement?: string;
}

interface ForecastAdjustmentTreeNode {
  key: string;
  label: string;
  level: number;
  comprehensiveSettlement: number;
  mediumLongTermRevenue: number;
  spotRevenue: number;
  recoveryFee: number;
  assessmentFee: number;
  deviationElectricityFee: number;
  comprehensiveDeductionRevenue: number;
  comprehensiveDeductionPrice: number;
  children?: ForecastAdjustmentTreeNode[];
}

type ForecastAggregationDimension = 'tradingUnit' | 'date' | 'timePoint';

// ============= 模拟数据生成 =============

const generatePowerCurveData = (granularity: '24' | '96'): PowerCurveData[] => {
  const points = granularity === '24' ? 24 : 96;
  const data: PowerCurveData[] = [];

  for (let i = 0; i < points; i++) {
    const hour = granularity === '24' ? i : Math.floor(i / 4);
    const minute = granularity === '24' ? 0 : (i % 4) * 15;
    const timePoint = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const isPeakHour = hour >= 8 && hour <= 22;
    const baseOutput = isPeakHour ? 120 + Math.random() * 40 : 60 + Math.random() * 30;
    
    const originalForecast = baseOutput;
    const adjustmentRatio = (Math.random() - 0.5) * 0.3;
    const declaredPower = originalForecast * (1 + adjustmentRatio);
    const actualOutput = originalForecast * (1 + (Math.random() - 0.5) * 0.2);
    
    const deviation = declaredPower - actualOutput;
    const deviationRate = Math.abs(deviation / declaredPower) * 100;
    
    let adjustmentStatus: 'over' | 'under' | 'normal';
    if (deviationRate > 10) {
      adjustmentStatus = deviation > 0 ? 'over' : 'under';
    } else {
      adjustmentStatus = 'normal';
    }

    const dayAheadRevenue = declaredPower * (250 + Math.random() * 100);
    const realTimeRevenue = actualOutput * (240 + Math.random() * 120);
    const assessmentFee = deviationRate > 5 ? Math.abs(deviation) * (20 + Math.random() * 30) : 0;

    data.push({
      timePoint,
      originalForecast,
      declaredPower,
      actualOutput,
      deviation,
      deviationRate,
      adjustmentStatus,
      dayAheadRevenue,
      realTimeRevenue,
      assessmentFee,
    });
  }

  return data;
};

const calculateEffectivenessMetrics = (data: PowerCurveData[]): AdjustmentEffectivenessMetrics => {
  const overPeriods = data.filter(d => d.adjustmentStatus === 'over').length;
  const underPeriods = data.filter(d => d.adjustmentStatus === 'under').length;
  const normalPeriods = data.filter(d => d.adjustmentStatus === 'normal').length;
  
  const effectiveRate = (normalPeriods / data.length) * 100;
  
  const totalDayAheadRevenue = data.reduce((sum, d) => sum + d.dayAheadRevenue, 0);
  const totalRealTimeRevenue = data.reduce((sum, d) => sum + d.realTimeRevenue, 0);
  const totalAssessmentFee = data.reduce((sum, d) => sum + d.assessmentFee, 0);
  
  const revenueIncrement = (totalDayAheadRevenue - totalRealTimeRevenue) * 0.1;
  const netRevenueChange = revenueIncrement - totalAssessmentFee;

  return {
    effectiveRate,
    revenueIncrement,
    assessmentImpact: totalAssessmentFee,
    netRevenueChange,
    overAdjustmentPeriods: overPeriods,
    underAdjustmentPeriods: underPeriods,
    normalPeriods,
  };
};

const generateOptimizationAdvice = (data: PowerCurveData[]): StrategyOptimizationAdvice[] => {
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

const generateTreeData = (dimension: ForecastAggregationDimension): ForecastAdjustmentTreeNode[] => {
  const dates = ['20240506', '20240508', '20240516', '20240520'];
  const units = ['山东省场站A', '山东省场站B', '山西省场站A'];
  
  const totalNode: ForecastAdjustmentTreeNode = {
    key: 'total',
    label: '合计',
    level: 0,
    comprehensiveSettlement: 0,
    mediumLongTermRevenue: 0,
    spotRevenue: 0,
    recoveryFee: 0,
    assessmentFee: 0,
    deviationElectricityFee: 0,
    comprehensiveDeductionRevenue: 0,
    comprehensiveDeductionPrice: 0,
    children: [],
  };

  if (dimension === 'date') {
    totalNode.children = dates.map(date => {
      const settlement = (Math.random() - 0.5) * 100000;
      return {
        key: date,
        label: date,
        level: 1,
        comprehensiveSettlement: settlement,
        mediumLongTermRevenue: settlement * 0.6,
        spotRevenue: settlement * 0.3,
        recoveryFee: -Math.abs(settlement * 0.05),
        assessmentFee: -Math.abs(settlement * 0.05),
        deviationElectricityFee: Math.abs(settlement * 0.02),
        comprehensiveDeductionRevenue: settlement * 0.9,
        comprehensiveDeductionPrice: 250 + Math.random() * 50,
      };
    });
  } else if (dimension === 'tradingUnit') {
    totalNode.children = units.map(unit => {
      const settlement = (Math.random() - 0.5) * 150000;
      return {
        key: unit,
        label: unit,
        level: 1,
        comprehensiveSettlement: settlement,
        mediumLongTermRevenue: settlement * 0.6,
        spotRevenue: settlement * 0.3,
        recoveryFee: -Math.abs(settlement * 0.05),
        assessmentFee: -Math.abs(settlement * 0.05),
        deviationElectricityFee: Math.abs(settlement * 0.02),
        comprehensiveDeductionRevenue: settlement * 0.9,
        comprehensiveDeductionPrice: 250 + Math.random() * 50,
      };
    });
  }

  totalNode.children?.forEach(child => {
    totalNode.comprehensiveSettlement += child.comprehensiveSettlement;
    totalNode.mediumLongTermRevenue += child.mediumLongTermRevenue;
    totalNode.spotRevenue += child.spotRevenue;
    totalNode.recoveryFee += child.recoveryFee;
    totalNode.assessmentFee += child.assessmentFee;
  });

  return [totalNode];
};

// ============= 组件 =============

const ForecastAdjustmentReviewTab = () => {
  const [tradingCenter, setTradingCenter] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [granularity, setGranularity] = useState<'24' | '96'>('24');
  const [dimension, setDimension] = useState<ForecastAggregationDimension>('date');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['total']));
  const [isAdviceOpen, setIsAdviceOpen] = useState(true);
  const [showCurves, setShowCurves] = useState({ original: true, declared: true, actual: true });

  const tradingUnits = ['山东省场站A', '山东省场站B', '山西省场站A', '山西省场站B', '浙江省场站A', '浙江省场站B'];
  
  const powerCurveData = useMemo(() => generatePowerCurveData(granularity), [granularity]);
  const effectiveness = useMemo(() => calculateEffectivenessMetrics(powerCurveData), [powerCurveData]);
  const optimizationAdvice = useMemo(() => generateOptimizationAdvice(powerCurveData), [powerCurveData]);
  const treeData = useMemo(() => generateTreeData(dimension), [dimension]);

  // 偏差对收益影响数据
  const deviationImpactData = useMemo(() => {
    return powerCurveData.map(d => ({
      timePoint: d.timePoint,
      dayAheadRevenue: d.dayAheadRevenue / 1000,
      realTimeRevenue: d.realTimeRevenue / 1000,
      assessmentFee: -d.assessmentFee / 1000,
      deviationRate: d.deviationRate,
    }));
  }, [powerCurveData]);

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const getValueColor = (value: number) => {
    if (value > 0) return "text-[#00B04D]";
    if (value < 0) return "text-red-500";
    return "";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'under': return <MinusCircle className="w-4 h-4 text-yellow-500" />;
      case 'normal': return <CheckCircle2 className="w-4 h-4 text-[#00B04D]" />;
      default: return null;
    }
  };

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

  const renderTreeRow = (node: ForecastAdjustmentTreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedKeys.has(node.key);

    return (
      <>
        <tr key={node.key} className="hover:bg-[#F8FBFA] border-b border-gray-100">
          <td className="p-2">
            <div style={{ paddingLeft: `${level * 12}px` }} className="flex items-center gap-1">
              {hasChildren && (
                <button onClick={() => toggleExpand(node.key)} className="p-0">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              )}
              <span className={cn(level === 0 && "font-bold")}>{node.label}</span>
            </div>
          </td>
          <td className={cn("text-right p-2 font-mono text-xs", getValueColor(node.comprehensiveSettlement))}>
            {node.comprehensiveSettlement.toFixed(2)}
          </td>
        </tr>
        {isExpanded && hasChildren && node.children!.map(child => renderTreeRow(child, level + 1))}
      </>
    );
  };

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
                <SelectItem value="center1">交易中心1</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="全部交易单元" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部交易单元</SelectItem>
                {tradingUnits.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm">
              <span className="font-mono">20240501</span>
              <span>-</span>
              <span className="font-mono">20240520</span>
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

            <Button size="sm">查询</Button>
            <Button variant="outline" size="sm">重置</Button>

            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 调整策略有效性评估（核心新增） */}
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

      {/* 三曲线对比图（核心新增） */}
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
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={powerCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
              <XAxis dataKey="timePoint" tick={{ fontSize: 10 }} interval={granularity === '24' ? 0 : 7} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: '功率 (MW)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
              <Tooltip 
                contentStyle={{ fontSize: 11, backgroundColor: 'white', border: '1px solid #E8F0EC' }}
                formatter={(value: number, name: string) => [value.toFixed(2) + ' MW', name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              
              {/* 偏差区域高亮 */}
              {powerCurveData.map((d, i) => {
                if (d.adjustmentStatus === 'over') {
                  return (
                    <ReferenceArea 
                      key={i}
                      x1={d.timePoint} 
                      x2={powerCurveData[i + 1]?.timePoint || d.timePoint}
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
                      x2={powerCurveData[i + 1]?.timePoint || d.timePoint}
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
        </CardContent>
      </Card>

      {/* 调整过度/不足识别表格（核心新增） */}
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
                  <TableHead className="text-xs text-right">原始预测(MW)</TableHead>
                  <TableHead className="text-xs text-right">申报电量(MW)</TableHead>
                  <TableHead className="text-xs text-right">实际出力(MW)</TableHead>
                  <TableHead className="text-xs text-right">偏差量(MW)</TableHead>
                  <TableHead className="text-xs text-right">偏差率(%)</TableHead>
                  <TableHead className="text-xs text-center">评估标签</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {powerCurveData.filter(d => d.adjustmentStatus !== 'normal').slice(0, 20).map((d, idx) => (
                  <TableRow key={idx} className={cn(
                    "hover:bg-[#F8FBFA]",
                    d.adjustmentStatus === 'over' && "bg-red-50",
                    d.adjustmentStatus === 'under' && "bg-yellow-50",
                  )}>
                    <TableCell className="text-xs font-mono">{d.timePoint}</TableCell>
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
                ))}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastAdjustmentReviewTab;

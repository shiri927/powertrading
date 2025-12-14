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
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle2,
  Star
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useState, useMemo } from "react";
import { format } from "date-fns";
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
  ReferenceLine
} from "recharts";
import { cn } from "@/lib/utils";

// ============= 数据结构定义 =============

interface IntraSpotReviewData {
  date: string;
  tradingUnit: string;
  realTimeMeasuredVolume: number;
  comprehensiveVolume: number;
  baseVolume: number;
  mediumLongTermVolume: number;
  dayAheadClearingVolume: number;
  comprehensivePrice: number;
  arithmeticAvgPrice: number;
  mediumLongTermPrice: number;
  realTimeBuyPrice: number;
  realTimeSellPrice: number;
  dayAheadBuyPrice: number;
  dayAheadSellPrice: number;
  comprehensiveRevenue: number;
  mediumLongTermRevenue: number;
  spotRevenue: number;
  deviationRecoveryFee: number;
  assessmentFee: number;
  deviationVolume: number;
  deviationRate: number;
  // 新增字段
  stationBidPrice: number;        // 场站申报价格
  marketClearingPrice: number;    // 市场出清价格
  priceSpread: number;            // 价差
}

interface IntraSummaryStats {
  totalRevenue: number;
  totalVolume: number;
  avgPrice: number;
  mediumLongTermRevenue: number;
  mediumLongTermVolume: number;
  mediumLongTermAvgPrice: number;
  spotRevenue: number;
  spotVolume: number;
  spotAvgPrice: number;
  assessmentFee: number;
  assessmentPrice: number;
  deviationRecoveryFee: number;
  marketAvgPerformance: number;
}

interface StrategyEffectivenessMetrics {
  strategyScore: number;
  quoteAccuracy: number;
  revenueGoalRate: number;
  deviationControlRating: 'excellent' | 'good' | 'average' | 'needsImprovement';
}

interface OptimizationAdvice {
  id: string;
  type: 'warning' | 'suggestion' | 'improvement';
  title: string;
  description: string;
  targetPeriods?: string[];
}

type AggregationDimension = 'tradingUnit' | 'date';

// ============= 模拟数据生成 =============

const generateIntraProvincialData = (days: number = 20): IntraSpotReviewData[] => {
  const data: IntraSpotReviewData[] = [];
  const units = ['山东省场站A', '山东省场站B', '山西省场站A', '山西省场站B'];
  const startDate = new Date('2024-05-01');

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = format(date, 'MM-dd');

    units.forEach(unit => {
      const baseVolume = 500 + Math.random() * 500;
      const mediumLongTermVolume = 1000 + Math.random() * 2000;
      const dayAheadVolume = 500 + Math.random() * 1000;
      const realTimeVolume = dayAheadVolume * (0.95 + Math.random() * 0.1);
      const comprehensiveVolume = baseVolume + mediumLongTermVolume + dayAheadVolume;

      const mediumLongTermPrice = 280 + Math.random() * 80;
      const dayAheadBuyPrice = 200 + Math.random() * 80;
      const dayAheadSellPrice = dayAheadBuyPrice * 1.08;
      const realTimeBuyPrice = dayAheadBuyPrice * (0.9 + Math.random() * 0.2);
      const realTimeSellPrice = realTimeBuyPrice * 1.08;

      const comprehensivePrice = (
        (mediumLongTermVolume * mediumLongTermPrice) +
        (dayAheadVolume * dayAheadBuyPrice) +
        (realTimeVolume * realTimeBuyPrice)
      ) / comprehensiveVolume;

      const stationBidPrice = dayAheadBuyPrice * (0.95 + Math.random() * 0.1);
      const marketClearingPrice = dayAheadBuyPrice;
      const priceSpread = stationBidPrice - marketClearingPrice;

      const arithmeticAvgPrice = (mediumLongTermPrice + dayAheadBuyPrice + realTimeBuyPrice) / 3;
      const mediumLongTermRevenue = mediumLongTermVolume * mediumLongTermPrice;
      const spotRevenue = (dayAheadVolume * dayAheadBuyPrice) + (realTimeVolume * realTimeBuyPrice);
      const comprehensiveRevenue = mediumLongTermRevenue + spotRevenue;

      data.push({
        date: dateStr,
        tradingUnit: unit,
        realTimeMeasuredVolume: realTimeVolume,
        comprehensiveVolume,
        baseVolume,
        mediumLongTermVolume,
        dayAheadClearingVolume: dayAheadVolume,
        comprehensivePrice,
        arithmeticAvgPrice,
        mediumLongTermPrice,
        realTimeBuyPrice,
        realTimeSellPrice,
        dayAheadBuyPrice,
        dayAheadSellPrice,
        comprehensiveRevenue,
        mediumLongTermRevenue,
        spotRevenue,
        deviationRecoveryFee: Math.random() * 8000 + 2000,
        assessmentFee: Math.random() * 4000 + 1000,
        deviationVolume: Math.abs(dayAheadVolume - realTimeVolume),
        deviationRate: Math.abs((dayAheadVolume - realTimeVolume) / dayAheadVolume) * 100,
        stationBidPrice,
        marketClearingPrice,
        priceSpread,
      });
    });
  }

  return data;
};

const calculateIntraSummary = (data: IntraSpotReviewData[]): IntraSummaryStats => {
  const totalRevenue = data.reduce((sum, item) => sum + item.comprehensiveRevenue, 0);
  const totalVolume = data.reduce((sum, item) => sum + item.comprehensiveVolume, 0);
  const avgPrice = totalVolume > 0 ? totalRevenue / totalVolume : 0;

  const mediumLongTermRevenue = data.reduce((sum, item) => sum + item.mediumLongTermRevenue, 0);
  const mediumLongTermVolume = data.reduce((sum, item) => sum + item.mediumLongTermVolume, 0);
  const mediumLongTermAvgPrice = mediumLongTermVolume > 0 ? mediumLongTermRevenue / mediumLongTermVolume : 0;

  const spotRevenue = data.reduce((sum, item) => sum + item.spotRevenue, 0);
  const spotVolume = data.reduce((sum, item) => sum + item.dayAheadClearingVolume + item.realTimeMeasuredVolume, 0);
  const spotAvgPrice = spotVolume > 0 ? spotRevenue / spotVolume : 0;

  const assessmentFee = data.reduce((sum, item) => sum + item.assessmentFee, 0);
  const deviationRecoveryFee = data.reduce((sum, item) => sum + item.deviationRecoveryFee, 0);
  const assessmentPrice = totalVolume > 0 ? assessmentFee / totalVolume : 0;

  const marketAvgPerformance = 5.2 + Math.random() * 10 - 5;

  return {
    totalRevenue,
    totalVolume,
    avgPrice,
    mediumLongTermRevenue,
    mediumLongTermVolume,
    mediumLongTermAvgPrice,
    spotRevenue,
    spotVolume,
    spotAvgPrice,
    assessmentFee,
    assessmentPrice,
    deviationRecoveryFee,
    marketAvgPerformance,
  };
};

const calculateStrategyEffectiveness = (data: IntraSpotReviewData[]): StrategyEffectivenessMetrics => {
  const avgDeviationRate = data.reduce((sum, item) => sum + item.deviationRate, 0) / data.length;
  const quoteAccuracy = 100 - avgDeviationRate;
  const strategyScore = Math.min(100, Math.max(0, 85 + Math.random() * 15));
  const revenueGoalRate = 95 + Math.random() * 10;
  
  let deviationControlRating: 'excellent' | 'good' | 'average' | 'needsImprovement';
  if (avgDeviationRate < 3) deviationControlRating = 'excellent';
  else if (avgDeviationRate < 5) deviationControlRating = 'good';
  else if (avgDeviationRate < 8) deviationControlRating = 'average';
  else deviationControlRating = 'needsImprovement';

  return {
    strategyScore,
    quoteAccuracy,
    revenueGoalRate,
    deviationControlRating,
  };
};

const generateOptimizationAdvice = (): OptimizationAdvice[] => {
  return [
    {
      id: '1',
      type: 'suggestion',
      title: '高价时段策略优化',
      description: '建议在09:00-11:00和18:00-21:00高价时段增加报价幅度5-8%，历史数据显示这些时段出清价格波动较大。',
      targetPeriods: ['09:00-11:00', '18:00-21:00'],
    },
    {
      id: '2',
      type: 'warning',
      title: '偏差控制预警',
      description: '近期偏差率呈上升趋势，建议优化功率预测模型或调整报价策略以降低偏差考核费用。',
    },
    {
      id: '3',
      type: 'improvement',
      title: '低价时段策略调整',
      description: '02:00-06:00低价时段可适当减少报量，将电量转移至高价时段以提升综合收益。',
      targetPeriods: ['02:00-06:00'],
    },
    {
      id: '4',
      type: 'suggestion',
      title: '中长期合同配比建议',
      description: '当前中长期合同占比偏高，建议适当增加现货市场参与度以获取更高收益弹性。',
    },
  ];
};

const aggregateData = (data: IntraSpotReviewData[], dimension: AggregationDimension) => {
  const grouped = data.reduce((acc, item) => {
    const key = dimension === 'tradingUnit' ? item.tradingUnit : item.date;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, IntraSpotReviewData[]>);

  return Object.entries(grouped).map(([key, items]) => ({
    [dimension]: key,
    tradingUnit: dimension === 'tradingUnit' ? key : items[0].tradingUnit,
    date: dimension === 'date' ? key : items[0].date,
    comprehensiveVolume: items.reduce((sum, item) => sum + item.comprehensiveVolume, 0),
    comprehensivePrice: items.reduce((sum, item) => sum + item.comprehensivePrice, 0) / items.length,
    comprehensiveRevenue: items.reduce((sum, item) => sum + item.comprehensiveRevenue, 0),
    stationBidPrice: items.reduce((sum, item) => sum + item.stationBidPrice, 0) / items.length,
    marketClearingPrice: items.reduce((sum, item) => sum + item.marketClearingPrice, 0) / items.length,
    priceSpread: items.reduce((sum, item) => sum + item.priceSpread, 0) / items.length,
  }));
};

// ============= 组件 =============

const IntraProvincialReviewTab = () => {
  const [tradingCenter, setTradingCenter] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [dimension, setDimension] = useState<AggregationDimension>('tradingUnit');
  const [isAdviceOpen, setIsAdviceOpen] = useState(true);

  const rawData = useMemo(() => generateIntraProvincialData(20), []);
  const stats = useMemo(() => calculateIntraSummary(rawData), [rawData]);
  const effectiveness = useMemo(() => calculateStrategyEffectiveness(rawData), [rawData]);
  const advice = useMemo(() => generateOptimizationAdvice(), []);
  const aggregatedData = useMemo(() => aggregateData(rawData, dimension), [rawData, dimension]);

  const stationOverviewData = useMemo(() => {
    const grouped = rawData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = { date: item.date, comprehensiveVolume: 0, comprehensivePrice: 0, arithmeticAvgPrice: 0, count: 0 };
      }
      acc[item.date].comprehensiveVolume += item.comprehensiveVolume;
      acc[item.date].comprehensivePrice += item.comprehensivePrice;
      acc[item.date].arithmeticAvgPrice += item.arithmeticAvgPrice;
      acc[item.date].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      date: item.date,
      comprehensiveVolume: item.comprehensiveVolume,
      comprehensivePrice: item.comprehensivePrice / item.count,
      arithmeticAvgPrice: item.arithmeticAvgPrice / item.count,
    }));
  }, [rawData]);

  // 历史交易与市场对比数据
  const marketComparisonData = useMemo(() => {
    return stationOverviewData.map(item => ({
      date: item.date,
      stationBidPrice: item.comprehensivePrice * (0.95 + Math.random() * 0.1),
      marketClearingPrice: item.comprehensivePrice,
      priceSpread: (item.comprehensivePrice * (0.95 + Math.random() * 0.1)) - item.comprehensivePrice,
    }));
  }, [stationOverviewData]);

  const getDeviationRatingBadge = (rating: string) => {
    const config = {
      excellent: { label: '优秀', variant: 'default' as const, className: 'bg-[#00B04D] hover:bg-[#00B04D]' },
      good: { label: '良好', variant: 'secondary' as const, className: 'bg-blue-500 hover:bg-blue-500 text-white' },
      average: { label: '一般', variant: 'outline' as const, className: 'border-orange-500 text-orange-500' },
      needsImprovement: { label: '需改进', variant: 'destructive' as const, className: '' },
    };
    const { label, variant, className } = config[rating as keyof typeof config] || config.average;
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  const getAdviceIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'suggestion': return <Lightbulb className="w-4 h-4 text-blue-500" />;
      case 'improvement': return <Target className="w-4 h-4 text-[#00B04D]" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
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
                <SelectItem value="shandong">山东交易中心</SelectItem>
                <SelectItem value="shanxi">山西交易中心</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="全部交易单元" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部交易单元</SelectItem>
                <SelectItem value="山东省场站A">山东省场站A</SelectItem>
                <SelectItem value="山东省场站B">山东省场站B</SelectItem>
                <SelectItem value="山西省场站A">山西省场站A</SelectItem>
                <SelectItem value="山西省场站B">山西省场站B</SelectItem>
              </SelectContent>
            </Select>

            <Button size="sm">
              <Filter className="w-4 h-4 mr-2" />
              查询
            </Button>
            <Button variant="outline" size="sm">重置</Button>

            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 指标卡片区（6个） */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">综合</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">收入</span>
                <span className="text-lg font-bold font-mono text-right">
                  {(stats.totalRevenue / 10000).toFixed(2)}万元
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电量</span>
                <span className="text-sm font-mono text-right">
                  {stats.totalVolume.toFixed(2)} MWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电价</span>
                <span className="text-sm font-mono text-right">
                  {stats.avgPrice.toFixed(2)} 元/MWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">中长期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">收入</span>
                <span className="text-lg font-bold font-mono text-right">
                  {(stats.mediumLongTermRevenue / 10000).toFixed(2)}万元
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电量</span>
                <span className="text-sm font-mono text-right">
                  {stats.mediumLongTermVolume.toFixed(2)} MWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电价</span>
                <span className="text-sm font-mono text-right">
                  {stats.mediumLongTermAvgPrice.toFixed(2)} 元/MWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">现货</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">收入</span>
                <span className="text-lg font-bold font-mono text-right">
                  {(stats.spotRevenue / 10000).toFixed(2)}万元
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电量</span>
                <span className="text-sm font-mono text-right">
                  {stats.spotVolume.toFixed(2)} MWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电价</span>
                <span className="text-sm font-mono text-right">
                  {stats.spotAvgPrice.toFixed(2)} 元/MWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">现货考核</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">考核电费</span>
                <span className="text-lg font-bold font-mono text-right text-red-500">
                  {(stats.assessmentFee / 10000).toFixed(2)}万元
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">考核电价</span>
                <span className="text-sm font-mono text-right">
                  {stats.assessmentPrice.toFixed(2)} 元/MWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">偏差回收费用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">回收费用</span>
                <span className="text-lg font-bold font-mono text-right text-orange-500">
                  {(stats.deviationRecoveryFee / 10000).toFixed(2)}万元
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">环比变化</span>
                <span className="text-sm font-mono text-right flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-[#00B04D]" />
                  -5.2%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">市场整体表现</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">相对市场均值</span>
                <span className={cn(
                  "text-lg font-bold font-mono text-right",
                  stats.marketAvgPerformance > 0 ? "text-[#00B04D]" : "text-red-500"
                )}>
                  {stats.marketAvgPerformance > 0 ? '+' : ''}{stats.marketAvgPerformance.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">排名</span>
                <span className="text-sm font-mono text-right flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  前15%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 策略有效性评估卡片 */}
      <Card className="border-[#00B04D]/30 bg-[#F8FBFA]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#00B04D]" />
            策略有效性评估
          </CardTitle>
          <CardDescription>基于历史数据的策略综合评估</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-[#00B04D]">
                {effectiveness.strategyScore.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">策略得分</div>
              <div className="text-xs text-muted-foreground">(1-100分)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-blue-600">
                {effectiveness.quoteAccuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">报价准确率</div>
              <div className="text-xs text-muted-foreground">报价与出清价匹配度</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-orange-500">
                {effectiveness.revenueGoalRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">收益目标达成率</div>
              <div className="text-xs text-muted-foreground">实际收益/目标收益</div>
            </div>
            <div className="text-center">
              <div className="mb-2">
                {getDeviationRatingBadge(effectiveness.deviationControlRating)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">偏差控制评级</div>
              <div className="text-xs text-muted-foreground">基于偏差率综合评估</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 报价策略优化建议 */}
      <Collapsible open={isAdviceOpen} onOpenChange={setIsAdviceOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-[#F8FBFA] transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                  报价策略优化建议
                </CardTitle>
                {isAdviceOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              <CardDescription>基于复盘数据生成的AI优化建议</CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {advice.map(item => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "p-4 rounded-lg border",
                      item.type === 'warning' && "border-orange-200 bg-orange-50",
                      item.type === 'suggestion' && "border-blue-200 bg-blue-50",
                      item.type === 'improvement' && "border-green-200 bg-green-50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getAdviceIcon(item.type)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                        {item.targetPeriods && (
                          <div className="flex gap-1 mt-2">
                            {item.targetPeriods.map(period => (
                              <Badge key={period} variant="outline" className="text-xs">
                                {period}
                              </Badge>
                            ))}
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

      {/* 主内容区 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">聚合维度选择</CardTitle>
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant={dimension === 'tradingUnit' ? 'default' : 'outline'}
                onClick={() => setDimension('tradingUnit')}
              >
                交易单元
              </Button>
              <Button 
                size="sm" 
                variant={dimension === 'date' ? 'default' : 'outline'}
                onClick={() => setDimension('date')}
              >
                日期
              </Button>
            </div>
            <Button className="w-full mt-2" size="sm">聚合</Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                  <TableRow>
                    <TableHead className="text-xs">{dimension === 'tradingUnit' ? '交易单元' : '日期'}</TableHead>
                    <TableHead className="text-xs text-right">综合电量</TableHead>
                    <TableHead className="text-xs text-right">综合电价</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregatedData.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-[#F8FBFA]">
                      <TableCell className="text-xs">
                        {dimension === 'tradingUnit' ? item.tradingUnit : item.date}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {item.comprehensiveVolume.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {item.comprehensivePrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-4">
          {/* 历史交易与市场对比图表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">历史交易与市场对比</CardTitle>
              <CardDescription className="text-xs">场站申报价格 vs 市场出清价格</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={marketComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ fontSize: 11, backgroundColor: 'white', border: '1px solid #E8F0EC' }}
                    formatter={(value: number, name: string) => [value.toFixed(2), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="priceSpread" 
                    fill="#00B04D" 
                    stroke="none"
                    fillOpacity={0.3}
                    name="价差收益区域"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stationBidPrice" 
                    stroke="#00B04D" 
                    strokeWidth={2} 
                    name="场站申报价格"
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="marketClearingPrice" 
                    stroke="#FFA500" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    name="市场出清价格"
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">场站总览</CardTitle>
              <CardDescription className="text-xs">综合电量与电价趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={stationOverviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ fontSize: 11, backgroundColor: 'white', border: '1px solid #E8F0EC' }}
                    formatter={(value: number, name: string) => [value.toFixed(2), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="comprehensiveVolume" fill="#00B04D" name="综合电量" />
                  <Line yAxisId="right" type="monotone" dataKey="comprehensivePrice" stroke="#00B04D" strokeWidth={2} name="综合电价" />
                  <Line yAxisId="right" type="monotone" dataKey="arithmeticAvgPrice" stroke="#FFA500" strokeWidth={2} strokeDasharray="5 5" name="算术均价" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntraProvincialReviewTab;

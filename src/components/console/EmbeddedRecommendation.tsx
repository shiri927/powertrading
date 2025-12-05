import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RecommendationCard } from '@/components/recommendation/RecommendationCard';
import { ReasoningPanel } from '@/components/recommendation/ReasoningPanel';
import { RecommendationEngine, StrategyRecommendation } from '@/lib/trading/recommendation-engine';
import { generatePredictionData } from '@/lib/data-generation/prediction-data';
import { generateMarketData } from '@/lib/data-generation/market-data';
import { RefreshCw, Lightbulb, TrendingUp, Clock, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTradingStore } from '@/store/tradingStore';
import { useRealtimeData } from '@/hooks/useRealtimeData';

interface EmbeddedRecommendationProps {
  onApplyRecommendation: (recommendation: StrategyRecommendation) => void;
}

export const EmbeddedRecommendation = ({ onApplyRecommendation }: EmbeddedRecommendationProps) => {
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [isLoading, setIsLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const {
    strategies,
    currentPrediction,
    currentMarket,
    currentRecommendations,
    selectedRecommendation,
    isRealtimeEnabled,
    setRecommendations,
    setSelectedRecommendation,
    setPrediction,
    setMarket,
    toggleRealtime,
    workflow,
  } = useTradingStore();

  useRealtimeData(isRealtimeEnabled, 10000);

  useEffect(() => {
    if (!currentPrediction) {
      const prediction = generatePredictionData(48, '1hour')[0];
      setPrediction(prediction);
    }
    if (!currentMarket) {
      const market = generateMarketData();
      setMarket(market);
    }
  }, []);

  useEffect(() => {
    if (isRealtimeEnabled && currentPrediction && currentMarket && strategies.length > 0) {
      loadRecommendations();
    }
  }, [currentPrediction, currentMarket, isRealtimeEnabled]);

  const loadRecommendations = () => {
    if (!currentPrediction || !currentMarket || strategies.length === 0) {
      toast.error('数据未就绪', { description: '请等待数据加载完成' });
      return;
    }

    setIsLoading(true);
    if (!isRealtimeEnabled) {
      toast.info('正在分析', { description: '基于最新市场数据生成推荐...' });
    }

    setTimeout(() => {
      try {
        const engine = new RecommendationEngine();
        const results = engine.recommend(
          currentPrediction,
          currentMarket,
          strategies,
          riskTolerance
        );

        setRecommendations(results);
        setIsLoading(false);

        if (!isRealtimeEnabled && results.length > 0) {
          toast.success('推荐生成完成', {
            description: `为您推荐了 ${results.length} 个策略`,
          });
        }
      } catch (error) {
        console.error('推荐生成失败:', error);
        setIsLoading(false);
        toast.error('推荐失败', { description: '请稍后重试' });
      }
    }, 800);
  };

  useEffect(() => {
    if (currentPrediction && currentMarket && strategies.length > 0) {
      loadRecommendations();
    }
  }, [riskTolerance, strategies]);

  const handleViewDetails = (recommendation: StrategyRecommendation) => {
    setSelectedRecommendation(recommendation);
    setDetailsDialogOpen(true);
  };

  const handleApply = (recommendation: StrategyRecommendation) => {
    toast.success('正在应用推荐策略', {
      description: `策略: ${recommendation.strategy.name}`,
    });
    onApplyRecommendation(recommendation);
  };

  const handleRefresh = () => {
    const prediction = generatePredictionData(48, '1hour')[0];
    setPrediction(prediction);
    const market = generateMarketData();
    setMarket(market);
    loadRecommendations();
  };

  return (
    <div className="space-y-4">
      {/* 当前市场状态 */}
      <Card className="border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">当前市场状态</CardTitle>
              <CardDescription>实时市场数据和预测信息</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className={`h-4 w-4 ${isRealtimeEnabled ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                <Label htmlFor="realtime-embed" className="text-xs text-muted-foreground">
                  实时推送
                </Label>
                <Switch
                  id="realtime-embed"
                  checked={isRealtimeEnabled}
                  onCheckedChange={toggleRealtime}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                更新: {workflow.lastRecommendationTime 
                  ? format(workflow.lastRecommendationTime, 'HH:mm:ss', { locale: zhCN })
                  : '--:--:--'}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center p-3 bg-[#F8FBFA] rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">当前时间</div>
              <div className="font-mono font-semibold">
                {format(new Date(), 'HH:mm', { locale: zhCN })}
              </div>
            </div>
            <div className="text-center p-3 bg-[#F8FBFA] rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">现货价格</div>
              <div className="font-mono font-semibold">
                {currentMarket?.spotPrice.toFixed(2) || '--'} 元/MWh
              </div>
            </div>
            <div className="text-center p-3 bg-[#F8FBFA] rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">P50预测</div>
              <div className="font-mono font-semibold">
                {currentPrediction?.p50.toFixed(1) || '--'} MW
              </div>
            </div>
            <div className="text-center p-3 bg-[#F8FBFA] rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">置信度</div>
              <div className="font-mono font-semibold">
                {currentPrediction?.confidence.toFixed(0) || '--'}%
              </div>
            </div>
            <div className="text-center p-3 bg-[#F8FBFA] rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">市场情绪</div>
              <Badge 
                variant={
                  currentMarket?.sentiment === 'bullish' ? 'default' : 
                  currentMarket?.sentiment === 'bearish' ? 'destructive' : 
                  'secondary'
                }
              >
                {currentMarket?.sentiment === 'bullish' ? '看涨' : 
                 currentMarket?.sentiment === 'bearish' ? '看跌' : '中性'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 控制面板 */}
      <div className="flex items-end gap-4 p-4 bg-[#F1F8F4] rounded-lg">
        <div className="flex-1 space-y-2">
          <Label>风险偏好</Label>
          <Select 
            value={riskTolerance} 
            onValueChange={(value: any) => setRiskTolerance(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="conservative">保守型 - 优先安全性</SelectItem>
              <SelectItem value="moderate">稳健型 - 平衡收益风险</SelectItem>
              <SelectItem value="aggressive">激进型 - 追求高收益</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          刷新推荐
        </Button>
      </div>

      {/* 推荐结果 */}
      {currentRecommendations.length > 0 ? (
        <>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">智能推荐结果</h3>
            <Badge variant="outline">{currentRecommendations.length} 个策略</Badge>
            {isRealtimeEnabled && (
              <Badge variant="default" className="ml-auto">
                <Radio className="h-3 w-3 mr-1 animate-pulse" />
                实时更新中
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {currentRecommendations.map((recommendation, index) => (
              <RecommendationCard
                key={index}
                recommendation={recommendation}
                rank={index}
                onViewDetails={() => handleViewDetails(recommendation)}
                onApply={() => handleApply(recommendation)}
              />
            ))}
          </div>
        </>
      ) : !isLoading && (
        <Card className="border">
          <CardContent className="py-16 text-center text-muted-foreground">
            <TrendingUp className="h-10 w-10 mx-auto mb-4 opacity-50" />
            <p className="text-base">暂无推荐策略</p>
            <p className="text-sm mt-2">当前市场条件下暂无合适的策略推荐，请稍后刷新</p>
          </CardContent>
        </Card>
      )}

      {/* 运行中提示 */}
      {isLoading && (
        <Card className="border">
          <CardContent className="py-16 text-center">
            <RefreshCw className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-base font-medium">正在生成推荐...</p>
            <p className="text-sm text-muted-foreground mt-2">分析市场数据并评估策略</p>
          </CardContent>
        </Card>
      )}

      {/* 详情对话框 */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              {selectedRecommendation?.strategy.name} - 详细分析
            </DialogTitle>
            <DialogDescription>
              完整的推荐理由、操作步骤和风险提示
            </DialogDescription>
          </DialogHeader>
          {selectedRecommendation && (
            <ReasoningPanel recommendation={selectedRecommendation} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

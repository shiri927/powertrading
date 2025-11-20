import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RecommendationCard } from '@/components/recommendation/RecommendationCard';
import { ReasoningPanel } from '@/components/recommendation/ReasoningPanel';
import { RecommendationEngine, StrategyRecommendation } from '@/lib/trading/recommendation-engine';
import { TradingStrategy, PRESET_STRATEGIES } from '@/lib/trading/strategy-types';
import { generatePredictionData } from '@/lib/data-generation/prediction-data';
import { generateMarketData } from '@/lib/data-generation/market-data';
import { RefreshCw, Lightbulb, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const RecommendationTab = () => {
  const navigate = useNavigate();
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [recommendations, setRecommendations] = useState<StrategyRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<StrategyRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // 模拟策略列表
  const strategies: TradingStrategy[] = PRESET_STRATEGIES.map((s, i) => ({
    ...s,
    id: `preset_${i}`,
    isActive: false,
  }));

  const loadRecommendations = () => {
    setIsLoading(true);
    toast.info('正在分析', { description: '基于最新市场数据生成推荐...' });

    setTimeout(() => {
      try {
        // 生成当前预测数据
        const currentPrediction = generatePredictionData(48, '1hour')[0];
        
        // 生成市场数据
        const marketData = generateMarketData();

        // 运行推荐引擎
        const engine = new RecommendationEngine();
        const results = engine.recommend(
          currentPrediction,
          marketData,
          strategies,
          riskTolerance
        );

        setRecommendations(results);
        setLastUpdateTime(new Date());
        setIsLoading(false);

        if (results.length > 0) {
          toast.success('推荐生成完成', {
            description: `基于当前市场条件，为您推荐了 ${results.length} 个策略`,
          });
        } else {
          toast.info('暂无推荐', {
            description: '当前市场条件下暂无合适的策略推荐',
          });
        }
      } catch (error) {
        console.error('推荐生成失败:', error);
        setIsLoading(false);
        toast.error('推荐失败', { description: '请稍后重试' });
      }
    }, 1500);
  };

  useEffect(() => {
    loadRecommendations();
  }, [riskTolerance]);

  const handleViewDetails = (recommendation: StrategyRecommendation) => {
    setSelectedRecommendation(recommendation);
    setDetailsDialogOpen(true);
  };

  const handleApplyRecommendation = (recommendation: StrategyRecommendation) => {
    // 生成申报数据
    const bidData = {
      tradingUnit: '十二回路一期',
      strategy: recommendation.strategy.name,
      actions: recommendation.suggestedActions,
      fromRecommendation: true,
    };

    toast.success('正在生成申报方案', {
      description: `策略: ${recommendation.strategy.name}`,
    });

    // 跳转到交易操作台（预填充数据）
    setTimeout(() => {
      navigate('/renewable/console', {
        state: { prefillData: bidData }
      });
    }, 500);
  };

  // 当前市场状态（模拟）
  const currentMarket = generateMarketData();
  const currentPrediction = generatePredictionData(1, '1hour')[0];

  return (
    <div className="space-y-6">
      {/* 当前市场状态 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">当前市场状态</CardTitle>
              <CardDescription>实时市场数据和预测信息</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              更新时间: {format(lastUpdateTime, 'HH:mm:ss', { locale: zhCN })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-[#F8FBFA] rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">当前时间</div>
              <div className="font-mono font-semibold">
                {format(new Date(), 'HH:mm', { locale: zhCN })}
              </div>
            </div>
            <div className="text-center p-3 bg-[#F8FBFA] rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">现货价格</div>
              <div className="font-mono font-semibold">
                {currentMarket.spotPrice.toFixed(2)} 元/MWh
              </div>
            </div>
            <div className="text-center p-3 bg-[#F8FBFA] rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">P50预测</div>
              <div className="font-mono font-semibold">
                {currentPrediction.p50.toFixed(1)} MW
              </div>
            </div>
            <div className="text-center p-3 bg-[#F8FBFA] rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">置信度</div>
              <div className="font-mono font-semibold">
                {currentPrediction.confidence.toFixed(0)}%
              </div>
            </div>
            <div className="text-center p-3 bg-[#F8FBFA] rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">市场情绪</div>
              <Badge 
                variant={
                  currentMarket.sentiment === 'bullish' ? 'default' : 
                  currentMarket.sentiment === 'bearish' ? 'destructive' : 
                  'secondary'
                }
              >
                {currentMarket.sentiment === 'bullish' ? '看涨' : 
                 currentMarket.sentiment === 'bearish' ? '看跌' : '中性'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 控制面板 */}
      <div className="flex items-end gap-4">
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
          onClick={loadRecommendations}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          刷新推荐
        </Button>
      </div>

      {/* 推荐结果 */}
      {recommendations.length > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">智能推荐结果</h2>
            <Badge variant="outline">{recommendations.length} 个策略</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation, index) => (
              <RecommendationCard
                key={index}
                recommendation={recommendation}
                rank={index}
                onViewDetails={() => handleViewDetails(recommendation)}
                onApply={() => handleApplyRecommendation(recommendation)}
              />
            ))}
          </div>
        </>
      ) : !isLoading && (
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">暂无推荐策略</p>
            <p className="text-sm mt-2">当前市场条件下暂无合适的策略推荐，请稍后刷新</p>
          </CardContent>
        </Card>
      )}

      {/* 运行中提示 */}
      {isLoading && (
        <Card>
          <CardContent className="py-20 text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-lg font-medium">正在生成推荐...</p>
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

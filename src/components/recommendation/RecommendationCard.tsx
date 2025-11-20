import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StrategyRecommendation } from '@/lib/trading/recommendation-engine';
import { STRATEGY_TYPE_LABELS, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '@/lib/trading/strategy-types';
import { TrendingUp, Eye, Zap, AlertTriangle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  recommendation: StrategyRecommendation;
  rank: number;
  onViewDetails: () => void;
  onApply: () => void;
}

const RANK_LABELS = ['🥇 最优推荐', '🥈 次优推荐', '🥉 备选方案'];
const RANK_COLORS = ['border-yellow-500', 'border-gray-400', 'border-orange-400'];

export const RecommendationCard = ({ 
  recommendation, 
  rank, 
  onViewDetails, 
  onApply 
}: RecommendationCardProps) => {
  const { strategy, expectedReturn, riskScore, confidence } = recommendation;

  return (
    <Card className={cn(
      "transition-all hover:shadow-lg",
      rank < 3 && RANK_COLORS[rank]
    )}>
      <CardContent className="p-5 space-y-4">
        {/* 头部 - 排名和策略名称 */}
        <div className="space-y-2">
          {rank < 3 && (
            <Badge variant="default" className="bg-primary mb-2">
              {RANK_LABELS[rank]}
            </Badge>
          )}
          <h3 className="font-bold text-lg">{strategy.name}</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {STRATEGY_TYPE_LABELS[strategy.type]}
            </Badge>
            <Badge 
              variant="secondary" 
              className={cn("text-xs", RISK_LEVEL_COLORS[strategy.riskLevel])}
            >
              {RISK_LEVEL_LABELS[strategy.riskLevel]}
            </Badge>
          </div>
        </div>

        {/* 关键指标 */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">预期收益</div>
            <div className="font-bold text-base text-green-600 flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4" />
              +{expectedReturn.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">风险评分</div>
            <div className="font-bold text-base flex items-center justify-center gap-1">
              <AlertTriangle className={cn(
                "h-4 w-4",
                riskScore <= 4 ? "text-green-600" : riskScore <= 7 ? "text-orange-600" : "text-red-600"
              )} />
              <span className={cn(
                riskScore <= 4 ? "text-green-600" : riskScore <= 7 ? "text-orange-600" : "text-red-600"
              )}>
                {riskScore}/10
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">置信度</div>
            <div className="font-bold text-base flex items-center justify-center gap-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600">{confidence.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* 建议操作预览 */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">建议操作:</div>
          <div className="space-y-1.5">
            {recommendation.suggestedActions.slice(0, 2).map((action, index) => (
              <div 
                key={index} 
                className="text-xs bg-[#F8FBFA] rounded p-2 flex items-start gap-2"
              >
                <Badge 
                  variant={action.action === 'buy' ? 'default' : 'secondary'}
                  className="text-xs h-5 px-2"
                >
                  {action.action === 'buy' ? '买入' : action.action === 'sell' ? '卖出' : '持有'}
                </Badge>
                <div className="flex-1">
                  <div className="font-medium">{action.time} {action.amount} MW</div>
                  <div className="text-muted-foreground">{action.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onViewDetails}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            查看详情
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={onApply}
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            一键生成申报
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

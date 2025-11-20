import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TradingStrategy, STRATEGY_TYPE_LABELS, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '@/lib/trading/strategy-types';
import { TrendingUp, Eye, Edit2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StrategyCardProps {
  strategy: TradingStrategy;
  isActive?: boolean;
  onView: (strategy: TradingStrategy) => void;
  onEdit: (strategy: TradingStrategy) => void;
  onToggleActive?: (strategy: TradingStrategy) => void;
}

export const StrategyCard = ({ 
  strategy, 
  isActive = false,
  onView, 
  onEdit,
  onToggleActive 
}: StrategyCardProps) => {
  return (
    <Card className={cn(
      "cursor-pointer transition-all hover:shadow-md",
      isActive && "border-primary border-2"
    )}>
      <CardContent className="p-4 space-y-3">
        {/* 头部 - 策略名称和类型 */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-1">{strategy.name}</h3>
            {strategy.isActive && (
              <Badge variant="default" className="bg-primary text-xs shrink-0">
                运行中
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {STRATEGY_TYPE_LABELS[strategy.type]}
          </Badge>
        </div>

        {/* 描述 */}
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {strategy.description}
        </p>

        {/* 关键指标 */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">风险等级</span>
            <Badge 
              variant="secondary" 
              className={cn("text-xs", RISK_LEVEL_COLORS[strategy.riskLevel])}
            >
              {RISK_LEVEL_LABELS[strategy.riskLevel]}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">预期收益</span>
            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{strategy.expectedReturn}%
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={() => onView(strategy)}
          >
            <Eye className="h-3 w-3 mr-1" />
            查看
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={() => onEdit(strategy)}
          >
            <Edit2 className="h-3 w-3 mr-1" />
            编辑
          </Button>
          {onToggleActive && (
            <Button
              variant={strategy.isActive ? "destructive" : "default"}
              size="sm"
              className="text-xs h-8 px-2"
              onClick={() => onToggleActive(strategy)}
            >
              {strategy.isActive ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

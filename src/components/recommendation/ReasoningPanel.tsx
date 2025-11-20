import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StrategyRecommendation } from '@/lib/trading/recommendation-engine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertCircle, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ReasoningPanelProps {
  recommendation: StrategyRecommendation;
  historicalAverageReturn?: number;
}

export const ReasoningPanel = ({ 
  recommendation, 
  historicalAverageReturn = 5.5 
}: ReasoningPanelProps) => {
  // 对比数据
  const comparisonData = [
    {
      name: '推荐策略',
      return: recommendation.expectedReturn,
      label: `+${recommendation.expectedReturn.toFixed(1)}%`,
    },
    {
      name: '历史平均',
      return: historicalAverageReturn,
      label: `+${historicalAverageReturn.toFixed(1)}%`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 推荐理由分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            推荐理由分析
          </CardTitle>
          <CardDescription>基于当前市场条件的综合分析</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 市场分析 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-sm">市场分析</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              {recommendation.marketAnalysis}
            </p>
          </div>

          <Separator />

          {/* 策略匹配度 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-sm">策略匹配度分析</span>
            </div>
            <ul className="space-y-2 pl-6">
              {recommendation.reasoning.map((reason, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* 风险提示 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="font-semibold text-sm">风险提示</span>
            </div>
            <ul className="space-y-2 pl-6">
              {recommendation.riskWarning.map((warning, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-orange-600 mt-1">⚠</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 详细操作步骤 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">详细操作步骤</CardTitle>
          <CardDescription>建议的交易执行计划</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendation.suggestedActions.map((action, index) => (
              <div 
                key={index}
                className="border rounded-lg p-4 space-y-2 hover:bg-[#F8FBFA] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={action.action === 'buy' ? 'default' : 'secondary'}
                      className="h-6"
                    >
                      步骤 {index + 1}
                    </Badge>
                    <span className="font-semibold">
                      {action.action === 'buy' ? '🔵 买入' : action.action === 'sell' ? '🔴 卖出' : '⏸️ 持有'}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">{action.time}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">交易数量: </span>
                    <span className="font-mono font-semibold">{action.amount} MW</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">预期价格: </span>
                    <span className="font-mono font-semibold">{action.expectedPrice.toFixed(2)} 元/MWh</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground bg-background rounded p-2">
                  💡 {action.reason}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 收益对比分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">收益对比分析</CardTitle>
          <CardDescription>
            采用推荐策略 vs 历史平均策略的预期收益对比
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '11px', fontFamily: 'Roboto Mono' }}
                label={{ 
                  value: '收益率 (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: '11px' }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, '预期收益']}
              />
              <Bar dataKey="return" radius={[8, 8, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#00B04D' : '#888888'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* 数值对比 */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">推荐策略收益</div>
              <div className="text-lg font-bold text-green-600">
                +{recommendation.expectedReturn.toFixed(2)}%
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">历史平均收益</div>
              <div className="text-lg font-bold text-gray-600">
                +{historicalAverageReturn.toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-center text-sm">
            <span className="text-muted-foreground">预计提升收益: </span>
            <span className="font-bold text-primary">
              +{(recommendation.expectedReturn - historicalAverageReturn).toFixed(2)} 百分点
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

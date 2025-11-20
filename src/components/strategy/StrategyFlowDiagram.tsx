import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TradingStrategy } from '@/lib/trading/strategy-types';
import { ArrowRight, CheckCircle, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';

interface StrategyFlowDiagramProps {
  strategy: TradingStrategy;
}

export const StrategyFlowDiagram = ({ strategy }: StrategyFlowDiagramProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">策略执行流程</CardTitle>
        <CardDescription>可视化展示策略的决策逻辑和执行步骤</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 步骤1: 数据输入 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-32 text-sm font-medium text-muted-foreground">
              步骤 1
            </div>
            <div className="flex-1">
              <div className="bg-[#F1F8F4] border-2 border-primary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">数据输入</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• AI功率预测 (P10/P50/P90)</li>
                  <li>• 实时现货价格</li>
                  <li>• 市场供需数据</li>
                  <li>• 预测置信度</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* 步骤2: 条件判断 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-32 text-sm font-medium text-muted-foreground">
              步骤 2
            </div>
            <div className="flex-1">
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-sm">触发条件判断</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {strategy.triggerConditions.minP50Forecast && (
                    <div className="bg-white rounded p-2">
                      <span className="text-muted-foreground">P50预测 ≥ </span>
                      <span className="font-mono font-semibold">{strategy.triggerConditions.minP50Forecast} MW</span>
                    </div>
                  )}
                  {strategy.triggerConditions.minSpotPrice && (
                    <div className="bg-white rounded p-2">
                      <span className="text-muted-foreground">现货价格 ≥ </span>
                      <span className="font-mono font-semibold">{strategy.triggerConditions.minSpotPrice} 元/MWh</span>
                    </div>
                  )}
                  {strategy.triggerConditions.minConfidence && (
                    <div className="bg-white rounded p-2">
                      <span className="text-muted-foreground">置信度 ≥ </span>
                      <span className="font-mono font-semibold">{strategy.triggerConditions.minConfidence}%</span>
                    </div>
                  )}
                  {strategy.triggerConditions.timeWindow && (
                    <div className="bg-white rounded p-2">
                      <span className="text-muted-foreground">时间窗口: </span>
                      <span className="font-mono font-semibold">
                        {strategy.triggerConditions.timeWindow.start} - {strategy.triggerConditions.timeWindow.end}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center">
              <ArrowRight className="h-6 w-6 text-green-600" />
              <span className="text-xs text-green-600 mt-1">满足条件</span>
            </div>
            <div className="flex flex-col items-center">
              <XCircle className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">不满足</span>
            </div>
          </div>

          {/* 步骤3: 交易决策 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-32 text-sm font-medium text-muted-foreground">
              步骤 3
            </div>
            <div className="flex-1">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-sm">生成交易信号</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded p-2">
                    <span className="text-muted-foreground">交易方向: </span>
                    <span className="font-semibold">买入/卖出</span>
                  </div>
                  <div className="bg-white rounded p-2">
                    <span className="text-muted-foreground">交易数量: </span>
                    <span className="font-mono font-semibold">≤ {strategy.tradingParams.singleTradeLimit} MW</span>
                  </div>
                  <div className="bg-white rounded p-2">
                    <span className="text-muted-foreground">最大仓位: </span>
                    <span className="font-mono font-semibold">{strategy.tradingParams.maxPosition} MW</span>
                  </div>
                  <div className="bg-white rounded p-2">
                    <span className="text-muted-foreground">日交易限制: </span>
                    <span className="font-mono font-semibold">{strategy.tradingParams.dailyTradeLimit} 次</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* 步骤4: 风险控制 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-32 text-sm font-medium text-muted-foreground">
              步骤 4
            </div>
            <div className="flex-1">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-semibold text-sm">风险检查</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white rounded p-2">
                    <span className="text-muted-foreground">止损点: </span>
                    <span className="font-mono font-semibold text-red-600">{strategy.riskControl.stopLoss}%</span>
                  </div>
                  <div className="bg-white rounded p-2">
                    <span className="text-muted-foreground">止盈点: </span>
                    <span className="font-mono font-semibold text-green-600">{strategy.riskControl.takeProfit}%</span>
                  </div>
                  <div className="bg-white rounded p-2">
                    <span className="text-muted-foreground">最大回撤: </span>
                    <span className="font-mono font-semibold text-orange-600">{strategy.riskControl.maxDrawdown}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* 步骤5: 执行申报 */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-32 text-sm font-medium text-muted-foreground">
              步骤 5
            </div>
            <div className="flex-1">
              <div className="bg-[#F1F8F4] border-2 border-primary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">执行交易申报</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• 生成申报方案</li>
                  <li>• 提交交易中心</li>
                  <li>• 记录执行日志</li>
                  <li>• 监控执行结果</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

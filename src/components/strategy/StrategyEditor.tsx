import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TradingStrategy, strategySchema, STRATEGY_TYPE_LABELS, RISK_LEVEL_LABELS, StrategyType, RiskLevel } from '@/lib/trading/strategy-types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Trash2 } from 'lucide-react';

interface StrategyEditorProps {
  strategy?: TradingStrategy;
  onSave: (strategy: TradingStrategy) => void;
  onDelete?: (strategyId: string) => void;
  onCancel?: () => void;
}

export const StrategyEditor = ({ strategy, onSave, onDelete, onCancel }: StrategyEditorProps) => {
  const form = useForm<TradingStrategy>({
    resolver: zodResolver(strategySchema),
    defaultValues: strategy || {
      id: `strategy_${Date.now()}`,
      name: '',
      type: 'custom',
      description: '',
      riskLevel: 'medium',
      expectedReturn: 10,
      triggerConditions: {
        minP50Forecast: 100,
        minSpotPrice: 300,
        minConfidence: 85,
      },
      tradingParams: {
        maxPosition: 200,
        singleTradeLimit: 50,
        dailyTradeLimit: 10,
      },
      riskControl: {
        stopLoss: 3,
        takeProfit: 8,
        maxDrawdown: 10,
      },
      isActive: false,
    },
  });

  const handleSubmit = (data: TradingStrategy) => {
    onSave(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
            <CardDescription>设置策略的基本属性和类型</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>策略名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入策略名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>策略类型 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background z-50">
                        {Object.entries(STRATEGY_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>风险等级 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background z-50">
                        {Object.entries(RISK_LEVEL_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expectedReturn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预期收益率 (%) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>预期年化收益率</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>策略描述</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="请描述策略的核心思路和适用场景"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 触发条件 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">触发条件</CardTitle>
            <CardDescription>设置策略的执行触发条件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="triggerConditions.minP50Forecast"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>最小P50预测功率 (MW)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="100"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>当P50预测功率大于此值时触发</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="triggerConditions.minSpotPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>最小现货价格 (元/MWh)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="300"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>当现货价格大于此值时触发</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="triggerConditions.minConfidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>最小置信度 (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="85"
                      min="0"
                      max="100"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>当预测置信度大于此值时触发</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="triggerConditions.timeWindow.start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>交易时间窗口 - 开始</FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="triggerConditions.timeWindow.end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>交易时间窗口 - 结束</FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 交易参数 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">交易参数</CardTitle>
            <CardDescription>设置交易的仓位和频率限制</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="tradingParams.maxPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>最大仓位 (MW) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>允许的最大持仓量</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tradingParams.singleTradeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>单笔限额 (MW) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>单次交易的最大数量</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tradingParams.dailyTradeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日交易次数上限 *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>每日最多交易次数</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 风险控制 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">风险控制</CardTitle>
            <CardDescription>设置止损止盈和回撤限制</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="riskControl.stopLoss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>止损点 (%) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>当亏损达到此比例时自动止损</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="riskControl.takeProfit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>止盈点 (%) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>当收益达到此比例时自动止盈</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="riskControl.maxDrawdown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>最大回撤 (%) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>允许的最大回撤比例</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-between items-center">
          <div>
            {strategy && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(strategy.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除策略
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
            )}
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              保存策略
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

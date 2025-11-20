import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import { BacktestChart } from '@/components/charts/BacktestChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Calendar as CalendarIcon, Play, Square, Download, TrendingUp, TrendingDown, Activity, Target, Clock, Award } from 'lucide-react';
import { BacktestEngine, BacktestResult } from '@/lib/trading/backtest-engine';
import { TradingStrategy, PRESET_STRATEGIES } from '@/lib/trading/strategy-types';
import { generatePredictionData } from '@/lib/data-generation/prediction-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const BacktestTab = () => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('preset_0');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: subMonths(new Date(), 6),
    end: new Date(),
  });
  const [initialCapital, setInitialCapital] = useState<number>(1000000);
  const [initialPosition, setInitialPosition] = useState<number>(500);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  // 模拟策略列表（实际应该从全局状态获取）
  const strategies: TradingStrategy[] = PRESET_STRATEGIES.map((s, i) => ({
    ...s,
    id: `preset_${i}`,
    isActive: false,
  }));

  const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);

  const runBacktest = async () => {
    if (!selectedStrategy) {
      toast.error('请选择策略');
      return;
    }

    setIsRunning(true);
    toast.info('开始回测', { description: '正在计算历史数据...' });

    // 模拟异步执行
    setTimeout(() => {
      try {
        // 生成历史数据（6个月的小时数据）
        const hours = Math.floor(
          (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60)
        );
        const historicalData = generatePredictionData(hours, '1hour');

        // 运行回测引擎
        const engine = new BacktestEngine(selectedStrategy, historicalData, initialCapital);
        const backtestResult = engine.run();

        setResult(backtestResult);
        setIsRunning(false);

        toast.success('回测完成', {
          description: `总收益率: ${backtestResult.totalReturn.toFixed(2)}%，共执行 ${backtestResult.totalTrades} 笔交易`,
        });
      } catch (error) {
        console.error('回测失败:', error);
        setIsRunning(false);
        toast.error('回测失败', { description: '请检查参数设置' });
      }
    }, 2000);
  };

  const stopBacktest = () => {
    setIsRunning(false);
    toast.info('回测已停止');
  };

  const exportReport = () => {
    if (!result) return;

    const report = {
      strategy: selectedStrategy?.name,
      dateRange: {
        start: format(dateRange.start, 'yyyy-MM-dd'),
        end: format(dateRange.end, 'yyyy-MM-dd'),
      },
      initialCapital,
      result: {
        totalReturn: result.totalReturn,
        sharpeRatio: result.sharpeRatio,
        maxDrawdown: result.maxDrawdown,
        winRate: result.winRate,
        totalTrades: result.totalTrades,
      },
      trades: result.trades,
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backtest_${selectedStrategy?.name}_${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
    
    toast.success('报告已导出');
  };

  return (
    <div className="space-y-6">
      {/* 回测参数设置区 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">回测参数设置</CardTitle>
          <CardDescription>配置回测的策略、时间范围和初始资金</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 策略选择 */}
            <div className="space-y-2">
              <Label>策略选择</Label>
              <Select value={selectedStrategyId} onValueChange={setSelectedStrategyId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {strategies.map(strategy => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 日期范围 */}
            <div className="space-y-2">
              <Label>开始日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.start, 'PPP', { locale: zhCN })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.start}
                    onSelect={(date) => date && setDateRange({ ...dateRange, start: date })}
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>结束日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.end, 'PPP', { locale: zhCN })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.end}
                    onSelect={(date) => date && setDateRange({ ...dateRange, end: date })}
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 初始资金 */}
            <div className="space-y-2">
              <Label>初始资金 (元)</Label>
              <Input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
                className="font-mono"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-4">
            {!isRunning ? (
              <Button onClick={runBacktest}>
                <Play className="h-4 w-4 mr-2" />
                开始回测
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopBacktest}>
                <Square className="h-4 w-4 mr-2" />
                停止
              </Button>
            )}
            <Button variant="outline" onClick={exportReport} disabled={!result}>
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 回测结果 */}
      {result && (
        <>
          {/* 关键指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <MetricCard
              title="累计收益率"
              value={`${result.totalReturn > 0 ? '+' : ''}${result.totalReturn.toFixed(2)}%`}
              description={`初始资金 ${(initialCapital / 10000).toFixed(0)}万`}
              icon={TrendingUp}
              change={result.totalReturn > 0 ? '盈利' : '亏损'}
              changeType={result.totalReturn > 0 ? 'positive' : 'negative'}
            />
            <MetricCard
              title="夏普比率"
              value={result.sharpeRatio.toFixed(2)}
              description="风险调整后收益"
              icon={Activity}
              change={result.sharpeRatio > 1 ? '优秀' : result.sharpeRatio > 0 ? '良好' : '较差'}
              changeType={result.sharpeRatio > 1 ? 'positive' : result.sharpeRatio > 0 ? 'neutral' : 'negative'}
            />
            <MetricCard
              title="最大回撤"
              value={`${result.maxDrawdown.toFixed(2)}%`}
              description="最大损失幅度"
              icon={TrendingDown}
              change={result.maxDrawdown < 10 ? '风险较低' : result.maxDrawdown < 20 ? '风险中等' : '风险较高'}
              changeType={result.maxDrawdown < 10 ? 'positive' : result.maxDrawdown < 20 ? 'neutral' : 'negative'}
            />
            <MetricCard
              title="胜率"
              value={`${result.winRate.toFixed(1)}%`}
              description={`共 ${result.totalTrades} 笔交易`}
              icon={Target}
              change={result.winRate > 60 ? '胜率高' : result.winRate > 50 ? '胜率中等' : '胜率较低'}
              changeType={result.winRate > 60 ? 'positive' : result.winRate > 50 ? 'neutral' : 'negative'}
            />
            <MetricCard
              title="平均持仓时长"
              value={`${result.avgHoldingTime.toFixed(1)}小时`}
              description="每次交易平均时长"
              icon={Clock}
              change={`${result.totalTrades} 笔交易`}
              changeType="neutral"
            />
          </div>

          {/* 累计收益曲线图 */}
          <Card>
            <CardHeader>
              <CardTitle>累计收益曲线</CardTitle>
              <CardDescription>
                回测期间的资产变化和收益率走势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BacktestChart data={result.equityCurve} initialCapital={initialCapital} />
            </CardContent>
          </Card>

          {/* 详细交易记录表格 */}
          <Card>
            <CardHeader>
              <CardTitle>详细交易记录</CardTitle>
              <CardDescription>
                所有交易的完整记录，包括时间、操作、价格、数量和盈亏
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                    <TableRow>
                      <TableHead className="text-center">序号</TableHead>
                      <TableHead className="text-center">日期时间</TableHead>
                      <TableHead className="text-center">操作</TableHead>
                      <TableHead className="text-right">价格 (元/MW)</TableHead>
                      <TableHead className="text-right">数量 (MW)</TableHead>
                      <TableHead className="text-right">盈亏 (元)</TableHead>
                      <TableHead className="text-right">收益率 (%)</TableHead>
                      <TableHead className="text-right">累计资产 (元)</TableHead>
                      <TableHead>备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.trades.map((trade, index) => (
                      <TableRow key={index} className="hover:bg-[#F8FBFA]">
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="text-center font-mono text-xs">
                          {format(new Date(trade.timestamp), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={trade.action === 'buy' ? 'default' : 'secondary'}>
                            {trade.action === 'buy' ? '买入' : '卖出'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {trade.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {trade.amount.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={trade.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                            {trade.profit > 0 ? '+' : ''}{trade.profit.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={trade.profitRate > 0 ? 'text-green-600' : 'text-red-600'}>
                            {trade.profitRate > 0 ? '+' : ''}{trade.profitRate.toFixed(3)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {trade.cumulativeCapital.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {trade.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}

      {/* 无结果提示 */}
      {!result && !isRunning && (
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">请选择策略和参数，点击"开始回测"查看结果</p>
          </CardContent>
        </Card>
      )}

      {/* 运行中提示 */}
      {isRunning && (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="flex flex-col items-center gap-4">
              <Activity className="h-12 w-12 animate-pulse text-primary" />
              <div>
                <p className="text-lg font-medium">回测运行中...</p>
                <p className="text-sm text-muted-foreground mt-2">正在计算历史数据并执行策略</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

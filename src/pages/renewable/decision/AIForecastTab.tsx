import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import { PredictionChart } from '@/components/charts/PredictionChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, RefreshCw, TrendingUp, TrendingDown, Zap, Clock, Calendar as CalendarClock, Award } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  generatePredictionData, 
  calculatePredictionMetrics, 
  generateErrorAnalysis,
  PredictionData 
} from '@/lib/data-generation/prediction-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AIForecastTab = () => {
  const [tradingUnit, setTradingUnit] = useState('unit1');
  const [date, setDate] = useState<Date>(new Date());
  const [granularity, setGranularity] = useState<'15min' | '1hour' | 'day'>('1hour');
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPredictionData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const hours = granularity === 'day' ? 168 : 48; // 7天或48小时
      const data = generatePredictionData(hours, granularity);
      setPredictionData(data);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadPredictionData();
  }, [tradingUnit, granularity]);

  const metrics = calculatePredictionMetrics(predictionData);
  const errorAnalysis = generateErrorAnalysis(predictionData);

  // 偏差分析数据（用于柱状图）
  const deviationData = errorAnalysis.slice(0, 24).map(item => ({
    time: item.timeSlot,
    deviation: item.deviation,
  }));

  return (
    <div className="space-y-6">
      {/* 顶部指标卡片区 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="超短期准确率"
          value={`${metrics.ultraShortTerm.accuracy.toFixed(1)}%`}
          description="0-4小时"
          icon={Zap}
          change={metrics.ultraShortTerm.accuracy > 90 ? '预测优秀' : '需要改进'}
          changeType={metrics.ultraShortTerm.accuracy > 90 ? 'positive' : 'neutral'}
        />
        <MetricCard
          title="短期准确率"
          value={`${metrics.shortTerm.accuracy.toFixed(1)}%`}
          description="4-24小时"
          icon={Clock}
          change={metrics.shortTerm.accuracy > 85 ? '预测良好' : '需要改进'}
          changeType={metrics.shortTerm.accuracy > 85 ? 'positive' : 'neutral'}
        />
        <MetricCard
          title="中期准确率"
          value={`${metrics.mediumTerm.accuracy.toFixed(1)}%`}
          description="1-7天"
          icon={CalendarClock}
          change={metrics.mediumTerm.accuracy > 80 ? '预测达标' : '需要改进'}
          changeType={metrics.mediumTerm.accuracy > 80 ? 'positive' : 'neutral'}
        />
        <MetricCard
          title="综合评分"
          value={`${metrics.overallScore.toFixed(1)}分`}
          description="加权平均"
          icon={Award}
          change={metrics.overallScore > 85 ? '整体优秀' : '有待提升'}
          changeType={metrics.overallScore > 85 ? 'positive' : 'neutral'}
        />
      </div>

      {/* 主图表区域和控制面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧主图表区 */}
        <div className="lg:col-span-3 space-y-6">
          {/* P10/P50/P90 预测曲线图 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                AI功率预测曲线
              </CardTitle>
              <CardDescription>
                P10/P50/P90 置信区间预测（绿色区域为预测不确定范围）
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <PredictionChart data={predictionData} granularity={granularity} />
              )}
            </CardContent>
          </Card>

          {/* 预测 vs 实际偏差图 */}
          <Card>
            <CardHeader>
              <CardTitle>预测偏差分析</CardTitle>
              <CardDescription>
                每小时预测值与实际值的偏差（正值表示高估，负值表示低估）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deviationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px', fontFamily: 'Roboto Mono' }}
                    label={{ 
                      value: '偏差 (MW)', 
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
                    formatter={(value: number) => [`${value.toFixed(2)} MW`, '偏差']}
                  />
                  <Bar dataKey="deviation" radius={[4, 4, 0, 0]}>
                    {deviationData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.deviation > 0 ? '#FF4500' : '#00B04D'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 误差统计表格 */}
          <Card>
            <CardHeader>
              <CardTitle>详细误差统计</CardTitle>
              <CardDescription>
                各时段预测准确性统计（仅显示已有实际数据的时段）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                    <TableRow>
                      <TableHead className="text-center">时段</TableHead>
                      <TableHead className="text-right">预测值 (MW)</TableHead>
                      <TableHead className="text-right">实际值 (MW)</TableHead>
                      <TableHead className="text-right">偏差 (MW)</TableHead>
                      <TableHead className="text-right">偏差率 (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorAnalysis.map((item, index) => (
                      <TableRow key={index} className="hover:bg-[#F8FBFA]">
                        <TableCell className="text-center">{item.timeSlot}</TableCell>
                        <TableCell className="text-right font-mono">
                          {item.predicted.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.actual.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={item.deviation > 0 ? 'text-red-600' : 'text-green-600'}>
                            {item.deviation > 0 ? '+' : ''}{item.deviation.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={Math.abs(item.deviationPercent) > 10 ? 'text-red-600' : 'text-green-600'}>
                            {item.deviationPercent > 0 ? '+' : ''}{item.deviationPercent.toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 右侧控制面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 控制面板 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">控制面板</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 交易单元选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">交易单元</label>
                <Select value={tradingUnit} onValueChange={setTradingUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit1">山东省场站A</SelectItem>
                    <SelectItem value="unit2">山东省场站B</SelectItem>
                    <SelectItem value="unit3">山西省场站A</SelectItem>
                    <SelectItem value="unit4">山西省场站B</SelectItem>
                    <SelectItem value="unit5">浙江省场站A</SelectItem>
                    <SelectItem value="unit6">浙江省场站B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 日期选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">预测日期</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, 'PPP', { locale: zhCN })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      locale={zhCN}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 时间粒度切换 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">时间粒度</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={granularity === '15min' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGranularity('15min')}
                  >
                    15分钟
                  </Button>
                  <Button
                    variant={granularity === '1hour' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGranularity('1hour')}
                  >
                    1小时
                  </Button>
                  <Button
                    variant={granularity === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGranularity('day')}
                  >
                    日
                  </Button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2 pt-2">
                <Button 
                  className="w-full" 
                  onClick={loadPredictionData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  刷新数据
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  导出预测数据
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 预测说明卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">预测说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">当前预测时间</p>
                <p className="text-muted-foreground font-mono">
                  {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">模型版本</p>
                <p className="text-muted-foreground">v2.3.1 (2024-11)</p>
              </div>
              <div>
                <p className="font-medium mb-1">置信区间解释</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• <span className="font-semibold">P90</span>: 乐观预测，90%概率低于此值</li>
                  <li>• <span className="font-semibold">P50</span>: 中位预测，最可能出现的值</li>
                  <li>• <span className="font-semibold">P10</span>: 保守预测，10%概率低于此值</li>
                </ul>
              </div>
              <div className="pt-2 border-t">
                <p className="font-medium mb-1 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  预测趋势
                </p>
                <p className="text-muted-foreground text-xs">
                  未来4小时功率预计保持稳定，下午时段预计小幅上升
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

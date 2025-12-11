import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, TrendingUp, TrendingDown, BarChart3, Table2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, addMinutes } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  ComposedChart, LineChart, ScatterChart, BarChart,
  Line, Scatter, Bar, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { toast } from "sonner";
import { MarketTrendDialog } from "./medium-long-term/MarketTrendDialog";
import { RealtimeTrackingDialog } from "./medium-long-term/RealtimeTrackingDialog";
import { HistoricalAnalysisDialog } from "./medium-long-term/HistoricalAnalysisDialog";

// 数据接口定义
interface StationData {
  id: string;
  name: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  trend: 'up' | 'down' | 'stable';
}

interface MarketQuote {
  time: string;
  buyerQuote: number;
  sellerQuote: number;
  transactionPrice: number;
  volume: number;
  buyerMin: number;
  buyerMax: number;
  sellerMin: number;
  sellerMax: number;
}

interface PositionData {
  time: string;
  positionVolume: number;
  positionValue: number;
  estimatedPnL: number;
}

interface IndicatorData {
  id: string;
  name: string;
  currentValue: number;
  change: number;
  changePercent: number;
  buyPrice?: number;
  sellPrice?: number;
  type: 'price' | 'volume' | 'spread';
}

interface TradingSession {
  id: string;
  targetDate: Date;
  sessionName: string;
  openTime: string;
  closeTime: string;
  status: 'pending' | 'open' | 'closed';
}

type TimeInterval = '5' | '10' | '30' | '60' | 'all';

// Mock数据生成函数
const generateStations = (): StationData[] => {
  const stationNames = [
    '山东省场站A', '山东省场站B', '山东省场站C', '山东省场站D', 
    '山西省场站A', '山西省场站B', '山西省场站C', '浙江省场站A'
  ];
  
  return stationNames.map((name, i) => ({
    id: `station-${i}`,
    name,
    currentPrice: 220 + Math.random() * 40,
    priceChange: (Math.random() - 0.5) * 10,
    priceChangePercent: (Math.random() - 0.5) * 5,
    volume: 5000 + Math.random() * 3000,
    trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable',
  }));
};

const DATA_INTERVAL_MINUTES = 5;
const DATA_POINTS_PER_DAY = Math.floor((24 * 60) / DATA_INTERVAL_MINUTES);

const generateMarketData = (points: number): MarketQuote[] => {
  const basePrice = 235;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return Array.from({ length: points }, (_, i) => {
    const timestamp = addMinutes(startOfDay, i * DATA_INTERVAL_MINUTES);
    const minutesSinceStart = timestamp.getHours() * 60 + timestamp.getMinutes();
    const normalizedHour = minutesSinceStart / (24 * 60);
    const timeFactor = Math.sin(normalizedHour * Math.PI * 2) * 15;
    const transaction = basePrice + timeFactor + (Math.random() - 0.5) * 8;
    const buyBase = transaction - 3 - Math.random() * 2;
    const sellBase = transaction + 3 + Math.random() * 2;
    
    return {
      time: format(timestamp, 'HH:mm'),
      buyerQuote: buyBase,
      sellerQuote: sellBase,
      transactionPrice: transaction,
      volume: Math.max(0, 3000 + Math.random() * 2000 + timeFactor * 100),
      buyerMin: buyBase - Math.random() * 3,
      buyerMax: buyBase + Math.random() * 3,
      sellerMin: sellBase - Math.random() * 3,
      sellerMax: sellBase + Math.random() * 3,
    };
  });
};

const generatePositionData = (): PositionData[] => {
  return Array.from({ length: 24 }, (_, hour) => {
    const baseVolume = 5000;
    const timeFactor = Math.sin(hour / 24 * Math.PI * 2) * 1000;
    const volume = baseVolume + timeFactor;
    
    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      positionVolume: volume,
      positionValue: volume * (230 + Math.random() * 20),
      estimatedPnL: (Math.random() - 0.5) * 50000,
    };
  });
};

const generateScatterData = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const base = 235 + Math.sin(i / 24 * Math.PI * 2) * 15;
    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      actual: base + (Math.random() - 0.5) * 10,
      predicted: base,
      buyer: base - 5 + (Math.random() - 0.5) * 4,
      seller: base + 5 + (Math.random() - 0.5) * 4,
    };
  });
};

const generateTradingSessions = (date: Date): TradingSession[] => {
  return [
    {
      id: '1',
      targetDate: date,
      sessionName: '主板交易',
      openTime: '20:00',
      closeTime: '21:30',
      status: 'closed',
    },
    {
      id: '2',
      targetDate: date,
      sessionName: '副榜交易',
      openTime: '09:30',
      closeTime: '11:00',
      status: 'open',
    },
    {
      id: '3',
      targetDate: date,
      sessionName: '早盘交易',
      openTime: '07:30',
      closeTime: '08:30',
      status: 'pending',
    },
  ];
};

const MediumLongTerm = () => {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [stations] = useState<StationData[]>(generateStations());
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('all');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [dataItem, setDataItem] = useState<string>('price');
  const [indicators, setIndicators] = useState<IndicatorData[]>([
    {
      id: '1',
      name: '买方报价',
      currentValue: 228.5,
      change: 2.3,
      changePercent: 1.02,
      buyPrice: 228.5,
      type: 'price',
    },
    {
      id: '2',
      name: '卖方报价',
      currentValue: 242.8,
      change: -1.5,
      changePercent: -0.61,
      sellPrice: 242.8,
      type: 'price',
    },
  ]);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const marketData = useMemo(() => generateMarketData(DATA_POINTS_PER_DAY), []);
  const filteredMarketData = useMemo(() => {
    if (timeInterval === 'all') {
      return marketData;
    }

    const minutes = Number(timeInterval);
    const pointsToKeep = Math.max(
      1,
      Math.min(marketData.length, Math.round(minutes / DATA_INTERVAL_MINUTES))
    );

    return marketData.slice(-pointsToKeep);
  }, [marketData, timeInterval]);
  const positionData = useMemo(() => generatePositionData(), []);
  const scatterData = useMemo(() => generateScatterData(), []);
  const tradingSessions = useMemo(() => generateTradingSessions(selectedDate), [selectedDate]);

  // 模拟实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      toast.success('数据已更新', {
        description: format(new Date(), 'HH:mm:ss', { locale: zhCN }),
      });
    }, 300000); // 5分钟

    return () => clearInterval(interval);
  }, []);

  const selectedStationData = selectedStation 
    ? stations.find(s => s.id === selectedStation)
    : stations[0];

  const currentPrice = selectedStationData?.currentPrice || 236.18;
  const priceChange = selectedStationData?.priceChange || 2.34;

  const handleAddIndicator = () => {
    const newIndicators: IndicatorData[] = [
      {
        id: Date.now().toString(),
        name: '成交均价',
        currentValue: 235.6,
        change: 1.2,
        changePercent: 0.51,
        type: 'price',
      },
      {
        id: (Date.now() + 1).toString(),
        name: '价差百分比',
        currentValue: 6.26,
        change: 0.5,
        changePercent: 8.67,
        type: 'spread',
      },
      {
        id: (Date.now() + 2).toString(),
        name: '成交量',
        currentValue: 45628,
        change: 2341,
        changePercent: 5.41,
        type: 'volume',
      },
    ];
    
    const availableIndicators = newIndicators.filter(
      ni => !indicators.some(i => i.name === ni.name)
    );
    
    if (availableIndicators.length > 0) {
      setIndicators([...indicators, availableIndicators[0]]);
      toast.success('已添加指标');
    } else {
      toast.info('所有指标已添加');
    }
  };

  const handleRemoveIndicator = (id: string) => {
    setIndicators(indicators.filter(i => i.id !== id));
    toast.success('已移除指标');
  };

  const handleSessionSelect = (session: TradingSession) => {
    toast.success(`已选择交易场次: ${session.sessionName}`);
    setShowSessionDialog(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* 顶部控制栏 */}
      <div className="border-b bg-card px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">中长期交易综合查询</h1>
            <p className="text-sm text-muted-foreground mt-1">月内合同交易决策分析</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">当前价格</span>
              <span className="text-2xl font-bold font-mono text-foreground">{currentPrice.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">元/MWh</span>
              {priceChange >= 0 ? (
                <Badge className="bg-success/10 text-success hover:bg-success/20">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {priceChange.toFixed(2)}
                </Badge>
              ) : (
                <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  {Math.abs(priceChange).toFixed(2)}
                </Badge>
              )}
            </div>

            <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  标的日
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>选择交易场次</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      locale={zhCN}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-3">
                      {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })} 交易场次
                    </p>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {tradingSessions.map(session => (
                          <Card
                            key={session.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleSessionSelect(session)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{session.sessionName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.openTime} - {session.closeTime}
                                  </p>
                                </div>
                                <Badge variant={
                                  session.status === 'open' ? 'default' :
                                  session.status === 'closed' ? 'secondary' : 'outline'
                                }>
                                  {session.status === 'open' ? '进行中' :
                                   session.status === 'closed' ? '已结束' : '未开始'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="text-sm text-muted-foreground">
              每5分钟统计一次 | 最后更新: {format(lastUpdate, 'HH:mm:ss')}
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧场站面板 */}
        <div className="w-64 border-r bg-card overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3">场站选择</h3>
            <Select value={dataItem} onValueChange={setDataItem}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">价格</SelectItem>
                <SelectItem value="volume">成交量</SelectItem>
                <SelectItem value="buyer">买方报价</SelectItem>
                <SelectItem value="seller">卖方报价</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="p-2 space-y-2">
              {stations.map(station => (
                <Card
                  key={station.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedStation === station.id && "ring-2 ring-primary shadow-md"
                  )}
                  onClick={() => setSelectedStation(station.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm">{station.name}</p>
                      {station.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : station.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono">
                          {station.currentPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">元/MWh</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={cn(
                          "font-mono",
                          station.priceChange >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {station.priceChange >= 0 ? '+' : ''}{station.priceChange.toFixed(2)}
                        </span>
                        <span className={cn(
                          "font-mono",
                          station.priceChangePercent >= 0 ? "text-success" : "text-destructive"
                        )}>
                          ({station.priceChangePercent >= 0 ? '+' : ''}{station.priceChangePercent.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        成交量: <span className="font-mono">{station.volume.toFixed(0)}</span> MWh
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* 中央分析区 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 上面板: 时段散点图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">时段价格分布</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedStationData?.name} - 24小时价格走势与预测
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--primary))"
                    strokeDasharray="5 5"
                    name="预测价格"
                    dot={false}
                  />
                  <Scatter 
                    dataKey="actual" 
                    fill="#00B04D"
                    name="实际成交价"
                  />
                  <Scatter 
                    dataKey="buyer" 
                    fill="hsl(var(--success))"
                    name="买方报价"
                    opacity={0.6}
                  />
                  <Scatter 
                    dataKey="seller" 
                    fill="hsl(var(--destructive))"
                    name="卖方报价"
                    opacity={0.6}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 中面板: 全国大盘 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">全国大盘</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    每一段最新的市场成交均价以及买卖双方的报价
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Tabs 
                    value={timeInterval} 
                    onValueChange={(value) => setTimeInterval(value as TimeInterval)}
                  >
                    <TabsList>
                      <TabsTrigger value="5">5分钟</TabsTrigger>
                      <TabsTrigger value="10">10分钟</TabsTrigger>
                      <TabsTrigger value="30">30分钟</TabsTrigger>
                      <TabsTrigger value="60">60分钟</TabsTrigger>
                      <TabsTrigger value="all">全部</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
                  >
                    {viewMode === 'chart' ? <Table2 className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'chart' ? (
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={filteredMarketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="buyerMax"
                      fill="hsl(var(--success) / 0.2)"
                      stroke="none"
                      name="买方范围上限"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="buyerMin"
                      fill="hsl(var(--success) / 0.1)"
                      stroke="none"
                      name="买方范围下限"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="sellerMax"
                      fill="hsl(var(--destructive) / 0.2)"
                      stroke="none"
                      name="卖方范围上限"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="sellerMin"
                      fill="hsl(var(--destructive) / 0.1)"
                      stroke="none"
                      name="卖方范围下限"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="transactionPrice"
                      stroke="#00B04D"
                      strokeWidth={2}
                      name="市场成交均价"
                      dot={false}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="buyerQuote"
                      stroke="hsl(var(--success))"
                      strokeWidth={1.5}
                      name="买方报价"
                      dot={false}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sellerQuote"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={1.5}
                      name="卖方报价"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-[#F1F8F4]">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium">时间</th>
                        <th className="p-3 text-right text-sm font-medium">买方报价</th>
                        <th className="p-3 text-right text-sm font-medium">卖方报价</th>
                        <th className="p-3 text-right text-sm font-medium">成交均价</th>
                        <th className="p-3 text-right text-sm font-medium">成交量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMarketData.slice(-10).map((item, i) => (
                        <tr key={i} className="border-t hover:bg-[#F8FBFA]">
                          <td className="p-3 text-sm">{item.time}</td>
                          <td className="p-3 text-sm text-right font-mono text-success">
                            {item.buyerQuote.toFixed(2)}
                          </td>
                          <td className="p-3 text-sm text-right font-mono text-destructive">
                            {item.sellerQuote.toFixed(2)}
                          </td>
                          <td className="p-3 text-sm text-right font-mono">
                            {item.transactionPrice.toFixed(2)}
                          </td>
                          <td className="p-3 text-sm text-right font-mono">
                            {item.volume.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 下面板: 持仓估值 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">持仓估值变动估算</CardTitle>
              <p className="text-sm text-muted-foreground">
                假定功率恒定发电量以及当前合同的持仓电量
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={positionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="positionVolume"
                    stroke="#00B04D"
                    strokeWidth={2}
                    name="预估持仓电量 (MW)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="positionValue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="持仓价值 (元)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="estimatedPnL"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    name="估值差异 (元)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 二级弹窗触发按钮 */}
          <div className="grid grid-cols-3 gap-4">
            <MarketTrendDialog />
            <RealtimeTrackingDialog />
            <HistoricalAnalysisDialog />
          </div>
        </div>

        {/* 右侧指标面板 */}
        <div className="w-80 border-l bg-card overflow-y-auto">
          <div className="p-4 border-b">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleAddIndicator}
            >
              <Plus className="h-4 w-4" />
              指标面板
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4 space-y-3">
              {indicators.map(indicator => (
                <Card key={indicator.id} className="relative group">
                  <CardContent className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveIndicator(indicator.id)}
                    >
                      ×
                    </Button>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {indicator.name}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-mono">
                          {indicator.currentValue.toFixed(2)}
                        </span>
                        {indicator.type === 'price' && (
                          <span className="text-xs text-muted-foreground">元/MWh</span>
                        )}
                        {indicator.type === 'volume' && (
                          <span className="text-xs text-muted-foreground">MWh</span>
                        )}
                        {indicator.type === 'spread' && (
                          <span className="text-xs text-muted-foreground">%</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={indicator.change >= 0 ? 'default' : 'destructive'} className="font-mono text-xs">
                          {indicator.change >= 0 ? '+' : ''}{indicator.change.toFixed(2)}
                        </Badge>
                        <span className={cn(
                          "text-xs font-mono",
                          indicator.changePercent >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {indicator.changePercent >= 0 ? '+' : ''}{indicator.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      {(indicator.buyPrice || indicator.sellPrice) && (
                        <div className="pt-2 border-t space-y-1 text-xs">
                          {indicator.buyPrice && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">买入价:</span>
                              <span className="font-mono text-success">{indicator.buyPrice.toFixed(2)}</span>
                            </div>
                          )}
                          {indicator.sellPrice && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">卖出价:</span>
                              <span className="font-mono text-destructive">{indicator.sellPrice.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default MediumLongTerm;

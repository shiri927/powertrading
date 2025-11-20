import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Terminal, Plus, Upload, Download, Copy, Clock, Send, Minus, X, Pencil, Trash2, HelpCircle, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

// 省间现货申报相关类型定义
interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  powerRatio: number | null;
  powerFixed: number | null;
  price: number | null;
}

interface BidScheme {
  id: string;
  name: string;
  targetDate: Date | null;
  tradingUnits: string[];
  selectedUnitsCount: number;
  totalUnitsCount: number;
  limitCondition: string;
  powerStrategy: string;
  priceStrategy: string;
  timeSlots: TimeSlot[];
}

// 日滚动交易申报相关类型定义
interface RollingTimePoint {
  id: string;
  timePoint: number;
  checked: boolean;
  tradingDirection: 'sell' | 'no-trade' | 'buy' | 'unlimited';
  maxLimitPrice: number;
  minLimitPrice: number;
  buyLimitVolume: number;
  sellLimitVolume: number;
  referenceValue: string;
  ratio: number;
  fixedValue: number;
  declarationPrice: number;
}

interface RollingScheme {
  id: string;
  schemeNumber: string;
  schemeName: string;
  tradingDate: string;
  tradingUnit: string;
  timePoints: RollingTimePoint[];
}

// 模拟24小时申报数据
const generateBidData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i + 1,
    buyDirection: i >= 6 && i <= 22,
    priceUp: (300 + Math.random() * 500).toFixed(2),
    priceDown: (200 + Math.random() * 300).toFixed(2),
    buyEnergy: (95 + Math.random() * 10).toFixed(3),
    sellEnergy: (850 + Math.random() * 100).toFixed(3),
    participation: i % 3 === 0 ? "撤单后盖" : i % 5 === 0 ? "交易撤盖" : "撤单后盖",
    limit1Energy: [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 20, 21, 22].includes(i) ? (10 + Math.random() * 50).toFixed(0) : "0",
    limit1Price: [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 20, 21, 22].includes(i) ? (250 + Math.random() * 350).toFixed(2) : "0.00",
    bidStatus: i % 4 === 0 ? "success" : i % 3 === 0 ? "pending" : "none",
    winRate: [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 20, 21, 22].includes(i) ? `${(30 + Math.random() * 70).toFixed(0)}%` : `${(0).toFixed(0)}%`,
  }));
};

// 生成日滚动交易24个时点数据
const generateRollingTimePoints = (): RollingTimePoint[] => {
  return Array.from({ length: 24 }, (_, i) => ({
    id: `point-${i + 1}`,
    timePoint: i + 1,
    checked: false,
    tradingDirection: 'no-trade' as const,
    maxLimitPrice: 1500.00,
    minLimitPrice: 0.00,
    buyLimitVolume: 0.000,
    sellLimitVolume: 0.000,
    referenceValue: '策略首选',
    ratio: 0,
    fixedValue: 0.000,
    declarationPrice: 0.00
  }));
};

// 生成模拟日滚动交易申报方案数据
const generateMockRollingSchemes = (): RollingScheme[] => {
  return [
    {
      id: 'rolling-scheme-1',
      schemeNumber: '20250217',
      schemeName: '零售策略1',
      tradingDate: '2025年02月17日滚动交易(2025-2-19)',
      tradingUnit: '零售单元',
      timePoints: generateRollingTimePoints()
    }
  ];
};

// 生成模拟省内现货申报方案数据
const generateMockIntraProvincialSchemes = (): BidScheme[] => {
  return [
    {
      id: 'scheme-1',
      name: '单一价格，按时段申报电力方-1',
      targetDate: new Date(),
      tradingUnits: ['零售单元1', '零售单元2'],
      selectedUnitsCount: 2,
      totalUnitsCount: 5,
      limitCondition: '自动分配',
      powerStrategy: '按照最大预测申报',
      priceStrategy: '固定价格',
      timeSlots: [
        {
          id: 'slot-1',
          startTime: '0015',
          endTime: '0830',
          powerRatio: 85,
          powerFixed: 45,
          price: 320.5
        },
        {
          id: 'slot-2',
          startTime: '0845',
          endTime: '1445',
          powerRatio: 100,
          powerFixed: 55,
          price: 410.25
        },
        {
          id: 'slot-3',
          startTime: '1500',
          endTime: '2400',
          powerRatio: 90,
          powerFixed: 60,
          price: 380.75
        }
      ]
    }
  ];
};

const Console = () => {
  const [bidData, setBidData] = useState(generateBidData());
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentScheme, setCurrentScheme] = useState("scheme1");
  const [tradeDirections, setTradeDirections] = useState<Record<number, number>>({});
  
  // 日滚动交易申报状态
  const [rollingSchemeNumber, setRollingSchemeNumber] = useState('20250217');
  const [rollingTradingDate, setRollingTradingDate] = useState('2025年02月17日滚动交易(2025-2-19)');
  const [rollingSchemes, setRollingSchemes] = useState<RollingScheme[]>(generateMockRollingSchemes());
  const [activeRollingSchemeId, setActiveRollingSchemeId] = useState('rolling-scheme-1');
  const [rollingTradingUnit, setRollingTradingUnit] = useState('零售单元');
  const [strategyMode, setStrategyMode] = useState<'ratio' | 'fixed'>('ratio');
  const [showUnitSection, setShowUnitSection] = useState(true);
  
  // 省内现货申报状态
  const [intraProvTradingCenter, setIntraProvTradingCenter] = useState('shanxi');
  const [intraProvMarketType, setIntraProvMarketType] = useState<'day-ahead' | 'intraday'>('day-ahead');
  const [intraProvDateRange, setIntraProvDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(Date.now() + 86400000)
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [intraProvSchemes, setIntraProvSchemes] = useState<BidScheme[]>(generateMockIntraProvincialSchemes());
  const [intraProvViewMode, setIntraProvViewMode] = useState<'ratio' | 'fixed' | 'price'>('ratio');
  
  // 实时时钟更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleRowSelection = (hour: number) => {
    setSelectedRows(prev => 
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const setTradeDirection = (hour: number, direction: number) => {
    setTradeDirections(prev => ({
      ...prev,
      [hour]: direction
    }));
  };
  
  // 省内现货申报操作函数
  const addNewIntraProvScheme = () => {
    const newScheme: BidScheme = {
      id: `scheme-${Date.now()}`,
      name: `单一价格，按时段申报电力方-${intraProvSchemes.length + 1}`,
      targetDate: null,
      tradingUnits: [],
      selectedUnitsCount: 0,
      totalUnitsCount: 5,
      limitCondition: '待设置',
      powerStrategy: '按照最大预测申报',
      priceStrategy: '按照最大预测申报',
      timeSlots: [
        {
          id: `slot-${Date.now()}-1`,
          startTime: '0015',
          endTime: '2400',
          powerRatio: 100,
          powerFixed: 50,
          price: 350
        }
      ]
    };
    setIntraProvSchemes(prev => [...prev, newScheme]);
  };
  
  const removeIntraProvScheme = (schemeId: string) => {
    setIntraProvSchemes(prev => prev.filter(s => s.id !== schemeId));
  };
  
  const updateIntraProvScheme = (schemeId: string, updates: Partial<BidScheme>) => {
    setIntraProvSchemes(prev => prev.map(s => 
      s.id === schemeId ? { ...s, ...updates } : s
    ));
  };
  
  const addTimeSlotToIntraProvScheme = (schemeId: string) => {
    const scheme = intraProvSchemes.find(s => s.id === schemeId);
    if (!scheme) return;
    
    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      startTime: '0015',
      endTime: '2400',
      powerRatio: 100,
      powerFixed: 50,
      price: 350
    };
    
    updateIntraProvScheme(schemeId, {
      timeSlots: [...scheme.timeSlots, newSlot]
    });
  };
  
  const removeTimeSlotFromIntraProvScheme = (schemeId: string, slotId: string) => {
    const scheme = intraProvSchemes.find(s => s.id === schemeId);
    if (!scheme) return;
    
    updateIntraProvScheme(schemeId, {
      timeSlots: scheme.timeSlots.filter(slot => slot.id !== slotId)
    });
  };
  
  const updateTimeSlotInIntraProvScheme = (schemeId: string, slotId: string, updates: Partial<TimeSlot>) => {
    const scheme = intraProvSchemes.find(s => s.id === schemeId);
    if (!scheme) return;
    
    updateIntraProvScheme(schemeId, {
      timeSlots: scheme.timeSlots.map(slot => 
        slot.id === slotId ? { ...slot, ...updates } : slot
      )
    });
  };

  // 日滚动交易操作函数
  const updateRollingTimePoint = (pointId: string, updates: Partial<RollingTimePoint>) => {
    const scheme = rollingSchemes.find(s => s.id === activeRollingSchemeId);
    if (!scheme) return;
    
    const updatedScheme = {
      ...scheme,
      timePoints: scheme.timePoints.map(point =>
        point.id === pointId ? { ...point, ...updates } : point
      )
    };
    
    setRollingSchemes(prev => prev.map(s =>
      s.id === activeRollingSchemeId ? updatedScheme : s
    ));
  };

  const toggleAllTimePoints = (checked: boolean) => {
    const scheme = rollingSchemes.find(s => s.id === activeRollingSchemeId);
    if (!scheme) return;
    
    const updatedScheme = {
      ...scheme,
      timePoints: scheme.timePoints.map(point => ({ ...point, checked }))
    };
    
    setRollingSchemes(prev => prev.map(s =>
      s.id === activeRollingSchemeId ? updatedScheme : s
    ));
  };

  const batchUpdateTradingDirection = (direction: RollingTimePoint['tradingDirection']) => {
    const scheme = rollingSchemes.find(s => s.id === activeRollingSchemeId);
    if (!scheme) return;
    
    const updatedScheme = {
      ...scheme,
      timePoints: scheme.timePoints.map(point =>
        point.checked ? { ...point, tradingDirection: direction } : point
      )
    };
    
    setRollingSchemes(prev => prev.map(s =>
      s.id === activeRollingSchemeId ? updatedScheme : s
    ));
  };

  const activeRollingScheme = rollingSchemes.find(s => s.id === activeRollingSchemeId);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">交易操作台</h1>
        <p className="text-muted-foreground mt-2">
          售电交易申报与执行管理
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            交易执行中心
          </CardTitle>
          <CardDescription>
            售电侧交易申报与监控平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="centralized" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="centralized">集中竞价申报</TabsTrigger>
              <TabsTrigger value="rolling">日滚动交易申报</TabsTrigger>
              <TabsTrigger value="intra-provincial">省内现货申报</TabsTrigger>
            </TabsList>
            
            {/* Tab 1: 集中竞价申报 */}
            <TabsContent value="centralized" className="space-y-4">
              <div className="flex items-center justify-between bg-[#F1F8F4] p-3 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#00B04D]" />
                    <span className="text-sm font-medium">
                      {currentTime.toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-[#00B04D] text-[#00B04D]">
                    售电业务侧
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    导入方案
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    导出方案
                  </Button>
                  <Button className="bg-[#00B04D] hover:bg-[#009644]" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    提交申报
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-sm mb-2 block">交易中心</Label>
                  <Select defaultValue="shanxi">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shanxi">山西</SelectItem>
                      <SelectItem value="shandong">山东</SelectItem>
                      <SelectItem value="zhejiang">浙江</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">市场类型</Label>
                  <Select defaultValue="day-ahead">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day-ahead">日前</SelectItem>
                      <SelectItem value="intraday">日内</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">申报方案</Label>
                  <Select value={currentScheme} onValueChange={setCurrentScheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheme1">零售方案1</SelectItem>
                      <SelectItem value="scheme2">零售方案2</SelectItem>
                      <SelectItem value="scheme3">零售方案3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">零售单元</Label>
                  <Select defaultValue="unit1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit1">零售单元1</SelectItem>
                      <SelectItem value="unit2">零售单元2</SelectItem>
                      <SelectItem value="unit3">零售单元3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                      <tr className="border-b-2 border-[#00B04D]">
                        <th className="h-12 px-4 text-left align-middle font-semibold text-sm">小时</th>
                        <th className="h-12 px-4 text-left align-middle font-semibold text-sm">交易方向</th>
                        <th className="h-12 px-4 text-right align-middle font-semibold text-sm">上限价格</th>
                        <th className="h-12 px-4 text-right align-middle font-semibold text-sm">下限价格</th>
                        <th className="h-12 px-4 text-right align-middle font-semibold text-sm">买入电量</th>
                        <th className="h-12 px-4 text-right align-middle font-semibold text-sm">卖出电量</th>
                        <th className="h-12 px-4 text-left align-middle font-semibold text-sm">参与方式</th>
                        <th className="h-12 px-4 text-right align-middle font-semibold text-sm">限价1电量</th>
                        <th className="h-12 px-4 text-right align-middle font-semibold text-sm">限价1价格</th>
                        <th className="h-12 px-4 text-left align-middle font-semibold text-sm">申报状态</th>
                        <th className="h-12 px-4 text-right align-middle font-semibold text-sm">中标率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bidData.map((row) => (
                        <tr 
                          key={row.hour} 
                          className={`border-b transition-colors hover:bg-[#F8FBFA] ${selectedRows.includes(row.hour) ? 'bg-[#F1F8F4]' : ''}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={selectedRows.includes(row.hour)}
                                onCheckedChange={() => toggleRowSelection(row.hour)}
                              />
                              <span className="font-mono font-medium">{row.hour}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              {[0, 1, 2, 3].map(dir => (
                                <button
                                  key={dir}
                                  onClick={() => setTradeDirection(row.hour, dir)}
                                  className={`w-8 h-8 rounded border transition-colors ${
                                    tradeDirections[row.hour] === dir 
                                      ? 'bg-[#00B04D] text-white border-[#00B04D]' 
                                      : 'border-gray-300 hover:border-[#00B04D]'
                                  }`}
                                >
                                  {dir === 0 ? '卖' : dir === 1 ? '无' : dir === 2 ? '买' : '不'}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-right font-mono text-sm">{row.priceUp}</td>
                          <td className="p-4 text-right font-mono text-sm">{row.priceDown}</td>
                          <td className="p-4 text-right font-mono text-sm">{row.buyEnergy}</td>
                          <td className="p-4 text-right font-mono text-sm">{row.sellEnergy}</td>
                          <td className="p-4 text-sm">{row.participation}</td>
                          <td className="p-4 text-right font-mono text-sm">{row.limit1Energy}</td>
                          <td className="p-4 text-right font-mono text-sm">{row.limit1Price}</td>
                          <td className="p-4">
                            {row.bidStatus === 'success' && <Badge className="bg-[#00B04D] hover:bg-[#009644]">已申报</Badge>}
                            {row.bidStatus === 'pending' && <Badge variant="outline" className="border-orange-500 text-orange-500">待申报</Badge>}
                            {row.bidStatus === 'none' && <Badge variant="outline">未申报</Badge>}
                          </td>
                          <td className="p-4 text-right font-mono text-sm font-bold text-[#00B04D]">{row.winRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab 2: 日滚动交易申报 */}
            <TabsContent value="rolling" className="space-y-4">
              <div className="flex items-center justify-between bg-[#F1F8F4] p-3 rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#00B04D]" />
                    <span className="text-sm font-medium">
                      {currentTime.toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-[#00B04D] text-[#00B04D]">
                    售电业务侧
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    导入方案
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    导出方案
                  </Button>
                  <Button className="bg-[#00B04D] hover:bg-[#009644]" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    提交申报
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm mb-2 block">方案编号</Label>
                  <Input 
                    value={rollingSchemeNumber}
                    onChange={(e) => setRollingSchemeNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">交易日期</Label>
                  <Input 
                    value={rollingTradingDate}
                    onChange={(e) => setRollingTradingDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">零售单元</Label>
                  <Select value={rollingTradingUnit} onValueChange={setRollingTradingUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="零售单元">零售单元</SelectItem>
                      <SelectItem value="零售单元1">零售单元1</SelectItem>
                      <SelectItem value="零售单元2">零售单元2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {activeRollingScheme && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-[#F8FBFA] p-3 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold">{activeRollingScheme.schemeName}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => toggleAllTimePoints(true)}>
                            全选
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleAllTimePoints(false)}>
                            取消全选
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => batchUpdateTradingDirection('sell')} className="text-red-600">
                            批量卖出
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => batchUpdateTradingDirection('buy')} className="text-green-600">
                            批量买入
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => batchUpdateTradingDirection('no-trade')}>
                            批量不交易
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border overflow-hidden">
                      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="w-full border-collapse">
                          <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                            <tr className="border-b-2 border-[#00B04D]">
                              <th className="h-12 px-4 text-left align-middle font-semibold text-sm">
                                <Checkbox 
                                  checked={activeRollingScheme.timePoints.every(p => p.checked)}
                                  onCheckedChange={(checked) => toggleAllTimePoints(checked as boolean)}
                                />
                              </th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-sm">时点</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-sm">交易方向</th>
                              <th className="h-12 px-4 text-right align-middle font-semibold text-sm">最高限价</th>
                              <th className="h-12 px-4 text-right align-middle font-semibold text-sm">最低限价</th>
                              <th className="h-12 px-4 text-right align-middle font-semibold text-sm">买限制量</th>
                              <th className="h-12 px-4 text-right align-middle font-semibold text-sm">卖限制量</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-sm">参考值</th>
                              <th className="h-12 px-4 text-right align-middle font-semibold text-sm">比例</th>
                              <th className="h-12 px-4 text-right align-middle font-semibold text-sm">固定值</th>
                              <th className="h-12 px-4 text-right align-middle font-semibold text-sm">申报电价</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeRollingScheme.timePoints.map((point) => (
                              <tr 
                                key={point.id} 
                                className={`border-b transition-colors hover:bg-[#F8FBFA] ${point.checked ? 'bg-[#F1F8F4]' : ''}`}
                              >
                                <td className="p-4">
                                  <Checkbox 
                                    checked={point.checked}
                                    onCheckedChange={(checked) => updateRollingTimePoint(point.id, { checked: checked as boolean })}
                                  />
                                </td>
                                <td className="p-4">
                                  <span className="font-mono font-medium">{point.timePoint}:00</span>
                                </td>
                                <td className="p-4">
                                  <Select 
                                    value={point.tradingDirection}
                                    onValueChange={(value) => updateRollingTimePoint(point.id, { tradingDirection: value as RollingTimePoint['tradingDirection'] })}
                                  >
                                    <SelectTrigger className="h-9 w-28">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="sell">卖出</SelectItem>
                                      <SelectItem value="no-trade">不交易</SelectItem>
                                      <SelectItem value="buy">买入</SelectItem>
                                      <SelectItem value="unlimited">不限</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="p-4">
                                  <Input 
                                    type="number"
                                    value={point.maxLimitPrice}
                                    onChange={(e) => updateRollingTimePoint(point.id, { maxLimitPrice: parseFloat(e.target.value) })}
                                    className="h-9 text-right font-mono text-sm w-24"
                                  />
                                </td>
                                <td className="p-4">
                                  <Input 
                                    type="number"
                                    value={point.minLimitPrice}
                                    onChange={(e) => updateRollingTimePoint(point.id, { minLimitPrice: parseFloat(e.target.value) })}
                                    className="h-9 text-right font-mono text-sm w-24"
                                  />
                                </td>
                                <td className="p-4">
                                  <Input 
                                    type="number"
                                    value={point.buyLimitVolume}
                                    onChange={(e) => updateRollingTimePoint(point.id, { buyLimitVolume: parseFloat(e.target.value) })}
                                    className="h-9 text-right font-mono text-sm w-24"
                                  />
                                </td>
                                <td className="p-4">
                                  <Input 
                                    type="number"
                                    value={point.sellLimitVolume}
                                    onChange={(e) => updateRollingTimePoint(point.id, { sellLimitVolume: parseFloat(e.target.value) })}
                                    className="h-9 text-right font-mono text-sm w-24"
                                  />
                                </td>
                                <td className="p-4">
                                  <Select 
                                    value={point.referenceValue}
                                    onValueChange={(value) => updateRollingTimePoint(point.id, { referenceValue: value })}
                                  >
                                    <SelectTrigger className="h-9 w-28">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="策略首选">策略首选</SelectItem>
                                      <SelectItem value="最大化收益">最大化收益</SelectItem>
                                      <SelectItem value="最小化成本">最小化成本</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="p-4">
                                  <Input 
                                    type="number"
                                    value={point.ratio}
                                    onChange={(e) => updateRollingTimePoint(point.id, { ratio: parseFloat(e.target.value) })}
                                    className="h-9 text-right font-mono text-sm w-20"
                                  />
                                </td>
                                <td className="p-4">
                                  <Input 
                                    type="number"
                                    value={point.fixedValue}
                                    onChange={(e) => updateRollingTimePoint(point.id, { fixedValue: parseFloat(e.target.value) })}
                                    className="h-9 text-right font-mono text-sm w-24"
                                  />
                                </td>
                                <td className="p-4">
                                  <Input 
                                    type="number"
                                    value={point.declarationPrice}
                                    onChange={(e) => updateRollingTimePoint(point.id, { declarationPrice: parseFloat(e.target.value) })}
                                    className="h-9 text-right font-mono text-sm w-24"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Tab 3: 省内现货申报 */}
            <TabsContent value="intra-provincial" className="space-y-4">
              <div className="flex items-center justify-between bg-[#F1F8F4] p-3 rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#00B04D]" />
                    <span className="text-sm font-medium">
                      {currentTime.toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-[#00B04D] text-[#00B04D]">
                    售电业务侧
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    导入方案
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    导出方案
                  </Button>
                  <Button className="bg-[#00B04D] hover:bg-[#009644]" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    提交申报
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm mb-2 block">交易中心</Label>
                  <Select value={intraProvTradingCenter} onValueChange={setIntraProvTradingCenter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shanxi">山西</SelectItem>
                      <SelectItem value="shandong">山东</SelectItem>
                      <SelectItem value="zhejiang">浙江</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">市场类型</Label>
                  <Select 
                    value={intraProvMarketType}
                    onValueChange={(value) => setIntraProvMarketType(value as 'day-ahead' | 'intraday')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day-ahead">日前</SelectItem>
                      <SelectItem value="intraday">日内</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">日期范围</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {intraProvDateRange?.from ? (
                          intraProvDateRange.to ? (
                            <>
                              {format(intraProvDateRange.from, "PPP", { locale: zhCN })} -{" "}
                              {format(intraProvDateRange.to, "PPP", { locale: zhCN })}
                            </>
                          ) : (
                            format(intraProvDateRange.from, "PPP", { locale: zhCN })
                          )
                        ) : (
                          <span>选择日期</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={intraProvDateRange?.from}
                        selected={{
                          from: intraProvDateRange?.from!,
                          to: intraProvDateRange?.to
                        }}
                        onSelect={(range: any) => {
                          if (range?.from) {
                            setIntraProvDateRange({
                              from: range.from,
                              to: range.to || range.from
                            });
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Button size="sm" onClick={addNewIntraProvScheme}>
                    <Plus className="h-4 w-4 mr-2" />
                    新增方案
                  </Button>
                  <ToggleGroup type="single" value={intraProvViewMode} onValueChange={(v) => v && setIntraProvViewMode(v as typeof intraProvViewMode)}>
                    <ToggleGroupItem value="ratio" size="sm">按比例</ToggleGroupItem>
                    <ToggleGroupItem value="fixed" size="sm">按固定值</ToggleGroupItem>
                    <ToggleGroupItem value="price" size="sm">仅电价</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              <div className="space-y-4">
                {intraProvSchemes.map((scheme) => (
                  <Card key={scheme.id} className="overflow-hidden">
                    <CardHeader className="bg-[#F8FBFA] py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">{scheme.name}</CardTitle>
                          <Badge variant="outline">
                            {scheme.selectedUnitsCount}/{scheme.totalUnitsCount} 零售单元
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Copy className="h-4 w-4 mr-2" />
                            复制
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removeIntraProvScheme(scheme.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">目标日期</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal h-9 text-xs">
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {scheme.targetDate ? format(scheme.targetDate, "yyyy-MM-dd") : "选择日期"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={scheme.targetDate || undefined}
                                onSelect={(date) => updateIntraProvScheme(scheme.id, { targetDate: date || null })}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-xs">限制条件</Label>
                          <Input 
                            value={scheme.limitCondition}
                            onChange={(e) => updateIntraProvScheme(scheme.id, { limitCondition: e.target.value })}
                            className="h-9 text-xs"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-xs">电力</Label>
                          <Select 
                            value={scheme.powerStrategy}
                            onValueChange={(value) => updateIntraProvScheme(scheme.id, { powerStrategy: value })}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="按照最大预测申报">按照最大预测申报</SelectItem>
                              <SelectItem value="按比例申报">按比例申报</SelectItem>
                              <SelectItem value="固定值申报">固定值申报</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-xs">电价</Label>
                          <Select 
                            value={scheme.priceStrategy}
                            onValueChange={(value) => updateIntraProvScheme(scheme.id, { priceStrategy: value })}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="按照最大预测申报">按照最大预测申报</SelectItem>
                              <SelectItem value="固定价格">固定价格</SelectItem>
                              <SelectItem value="分段价格">分段价格</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="rounded-md border max-h-[300px] overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                            <tr className="border-b">
                              <th className="h-10 px-2 text-left align-middle font-semibold text-gray-700 text-xs">时间段</th>
                              {intraProvViewMode !== 'price' && (
                                <>
                                  {intraProvViewMode === 'ratio' && (
                                    <th className="h-10 px-2 text-right align-middle font-semibold text-gray-700 text-xs">比例(%)</th>
                                  )}
                                  {intraProvViewMode === 'fixed' && (
                                    <th className="h-10 px-2 text-right align-middle font-semibold text-gray-700 text-xs">固定值(MW)</th>
                                  )}
                                </>
                              )}
                              <th className="h-10 px-2 text-right align-middle font-semibold text-gray-700 text-xs">电价(元/MWh)</th>
                              <th className="h-10 px-2 text-center align-middle font-semibold text-gray-700 text-xs">操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scheme.timeSlots.map((slot) => (
                              <tr key={slot.id} className="border-b transition-colors hover:bg-[#F8FBFA]">
                                <td className="p-2 align-middle">
                                  <div className="flex items-center gap-1">
                                    <Input 
                                      value={slot.startTime}
                                      onChange={(e) => updateTimeSlotInIntraProvScheme(scheme.id, slot.id, { startTime: e.target.value })}
                                      className="h-8 w-16 text-xs font-mono text-center"
                                      placeholder="00:15"
                                    />
                                    <span className="text-xs text-gray-500">-</span>
                                    <Input 
                                      value={slot.endTime}
                                      onChange={(e) => updateTimeSlotInIntraProvScheme(scheme.id, slot.id, { endTime: e.target.value })}
                                      className="h-8 w-16 text-xs font-mono text-center"
                                      placeholder="24:00"
                                    />
                                  </div>
                                </td>
                                {intraProvViewMode !== 'price' && (
                                  <td className="p-2 align-middle text-right">
                                    {intraProvViewMode === 'ratio' && (
                                      <Input 
                                        type="number"
                                        value={slot.powerRatio || ''}
                                        onChange={(e) => updateTimeSlotInIntraProvScheme(scheme.id, slot.id, { powerRatio: parseFloat(e.target.value) || null })}
                                        className="h-8 w-20 text-xs font-mono text-right"
                                      />
                                    )}
                                    {intraProvViewMode === 'fixed' && (
                                      <Input 
                                        type="number"
                                        value={slot.powerFixed || ''}
                                        onChange={(e) => updateTimeSlotInIntraProvScheme(scheme.id, slot.id, { powerFixed: parseFloat(e.target.value) || null })}
                                        className="h-8 w-20 text-xs font-mono text-right"
                                      />
                                    )}
                                  </td>
                                )}
                                <td className="p-2 align-middle text-right">
                                  <Input 
                                    type="number"
                                    value={slot.price || ''}
                                    onChange={(e) => updateTimeSlotInIntraProvScheme(scheme.id, slot.id, { price: parseFloat(e.target.value) || null })}
                                    className="h-8 w-24 text-xs font-mono text-right"
                                  />
                                </td>
                                <td className="p-2 align-middle text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-7 w-7 p-0"
                                      onClick={() => removeTimeSlotFromIntraProvScheme(scheme.id, slot.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => addTimeSlotToIntraProvScheme(scheme.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        添加时间段
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Console;

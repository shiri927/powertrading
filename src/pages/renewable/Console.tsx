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
import { Terminal, Plus, Upload, Download, Copy, Clock, Send, Minus, X, Pencil, Trash2, HelpCircle, ChevronDown, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useTradingStore } from "@/store/tradingStore";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import IntraProvincialSpotBidding from "@/components/console/IntraProvincialSpotBidding";

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
      schemeName: '绿略应计1',
      tradingDate: '2025年02月17日滚动交易(2025-2-19)',
      tradingUnit: '交易单元',
      timePoints: generateRollingTimePoints()
    }
  ];
};

// 生成模拟省间现货申报方案数据
const generateMockInterProvincialSchemes = (): BidScheme[] => {
  return [
    {
      id: 'scheme-1',
      name: '单一价格，按时段申报电力方-1',
      targetDate: new Date(),
      tradingUnits: ['单元1', '单元2'],
      selectedUnitsCount: 2,
      totalUnitsCount: 5,
      limitCondition: '日前限额 1000MWh',
      powerStrategy: '按照最大预测申报',
      priceStrategy: '按照最大预测申报',
      timeSlots: [
        {
          id: 'slot-1-1',
          startTime: '0015',
          endTime: '0800',
          powerRatio: 80,
          powerFixed: 50,
          price: 320.50
        },
        {
          id: 'slot-1-2',
          startTime: '0800',
          endTime: '1200',
          powerRatio: 100,
          powerFixed: 75,
          price: 450.00
        },
        {
          id: 'slot-1-3',
          startTime: '1200',
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
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingBid, setPendingBid } = useTradingStore();
  
  const [bidData, setBidData] = useState(generateBidData());
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentScheme, setCurrentScheme] = useState("scheme1");
  const [tradeDirections, setTradeDirections] = useState<Record<number, number>>({});
  const [showRecommendationAlert, setShowRecommendationAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("centralized");
  
  // 省间现货申报状态
  const [interProvTradingCenter, setInterProvTradingCenter] = useState('shanxi');
  const [interProvMarketType, setInterProvMarketType] = useState<'day-ahead' | 'intraday'>('day-ahead');
  const [interProvDateRange, setInterProvDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(Date.now() + 86400000)
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [interProvSchemes, setInterProvSchemes] = useState<BidScheme[]>(generateMockInterProvincialSchemes());
  const [viewMode, setViewMode] = useState<'ratio' | 'fixed' | 'price'>('ratio');
  
  // 省内现货申报状态
  const [intraProvTradingCenter, setIntraProvTradingCenter] = useState('shanxi');
  const [intraProvMarketType, setIntraProvMarketType] = useState<'day-ahead' | 'intraday'>('day-ahead');
  const [intraProvDateRange, setIntraProvDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(Date.now() + 86400000)
  });
  const [intraProvSchemes, setIntraProvSchemes] = useState<BidScheme[]>(generateMockInterProvincialSchemes());
  const [intraProvViewMode, setIntraProvViewMode] = useState<'ratio' | 'fixed' | 'price'>('ratio');
  
  // 日滚动交易申报状态
  const [rollingSchemeNumber, setRollingSchemeNumber] = useState('20250217');
  const [rollingTradingDate, setRollingTradingDate] = useState('2025年02月17日滚动交易(2025-2-19)');
  const [rollingSchemes, setRollingSchemes] = useState<RollingScheme[]>(generateMockRollingSchemes());
  const [activeRollingSchemeId, setActiveRollingSchemeId] = useState('rolling-scheme-1');
  const [rollingTradingUnit, setRollingTradingUnit] = useState('交易单元');
  const [strategyMode, setStrategyMode] = useState<'ratio' | 'fixed'>('ratio');
  const [showUnitSection, setShowUnitSection] = useState(true);

  // 处理来自推荐系统的预填充数据
  useEffect(() => {
    const prefillData = location.state?.prefillData || pendingBid;
    
    if (prefillData && prefillData.fromRecommendation) {
      // 自动切换到省内现货申报 Tab
      setActiveTab("intra-provincial");
      
      // 生成基于推荐策略的申报方案
      const recommendedScheme: BidScheme = {
        id: `scheme-recommended-${Date.now()}`,
        name: `AI推荐方案 - ${prefillData.strategy || '智能策略'}`,
        targetDate: new Date(),
        tradingUnits: [prefillData.tradingUnit || '山东省场站A'],
        selectedUnitsCount: 1,
        totalUnitsCount: 5,
        limitCondition: '日前限额 1000MWh',
        powerStrategy: '按照AI推荐执行',
        priceStrategy: '按照AI推荐执行',
        timeSlots: prefillData.actions?.map((action: any, index: number) => ({
          id: `slot-rec-${index}`,
          startTime: action.time.replace(':', ''),
          endTime: index < prefillData.actions.length - 1 
            ? prefillData.actions[index + 1].time.replace(':', '')
            : '2400',
          powerRatio: null,
          powerFixed: action.amount,
          price: action.expectedPrice
        })) || []
      };

      // 添加到省内现货申报方案列表
      setIntraProvSchemes(prev => [recommendedScheme, ...prev]);

      // 显示提示信息
      setShowRecommendationAlert(true);
      toast.success('AI推荐方案已自动填充', {
        description: `策略: ${prefillData.strategy}，已切换到省内现货申报页面`,
        duration: 5000,
      });

      // 清除 pendingBid 和 location.state
      setPendingBid(null);
      
      // 清除 location.state（避免刷新页面时重复处理）
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, pendingBid]);
  
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
  
  // 省间现货申报操作函数
  const addNewInterProvScheme = () => {
    const newScheme: BidScheme = {
      id: `scheme-${Date.now()}`,
      name: `单一价格，按时段申报电力方-${interProvSchemes.length + 1}`,
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
    setInterProvSchemes(prev => [...prev, newScheme]);
  };
  
  const removeInterProvScheme = (schemeId: string) => {
    setInterProvSchemes(prev => prev.filter(s => s.id !== schemeId));
  };
  
  const updateInterProvScheme = (schemeId: string, updates: Partial<BidScheme>) => {
    setInterProvSchemes(prev => prev.map(s => 
      s.id === schemeId ? { ...s, ...updates } : s
    ));
  };
  
  const addTimeSlot = (schemeId: string) => {
    const scheme = interProvSchemes.find(s => s.id === schemeId);
    if (!scheme) return;
    
    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      startTime: '',
      endTime: '',
      powerRatio: null,
      powerFixed: null,
      price: null
    };
    
    updateInterProvScheme(schemeId, {
      timeSlots: [...scheme.timeSlots, newSlot]
    });
  };
  
  const removeTimeSlot = (schemeId: string, slotId: string) => {
    const scheme = interProvSchemes.find(s => s.id === schemeId);
    if (!scheme) return;
    
    updateInterProvScheme(schemeId, {
      timeSlots: scheme.timeSlots.filter(s => s.id !== slotId)
    });
  };
  
  const updateTimeSlot = (schemeId: string, slotId: string, updates: Partial<TimeSlot>) => {
    const scheme = interProvSchemes.find(s => s.id === schemeId);
    if (!scheme) return;
    
    updateInterProvScheme(schemeId, {
      timeSlots: scheme.timeSlots.map(s => 
        s.id === slotId ? { ...s, ...updates } : s
      )
    });
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
  
  const addIntraProvTimeSlot = (schemeId: string) => {
    const scheme = intraProvSchemes.find(s => s.id === schemeId);
    if (!scheme) return;
    
    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      startTime: '',
      endTime: '',
      powerRatio: null,
      powerFixed: null,
      price: null
    };
    
    updateIntraProvScheme(schemeId, {
      timeSlots: [...scheme.timeSlots, newSlot]
    });
  };
  
  const removeIntraProvTimeSlot = (schemeId: string, slotId: string) => {
    const scheme = intraProvSchemes.find(s => s.id === schemeId);
    if (!scheme) return;
    
    updateIntraProvScheme(schemeId, {
      timeSlots: scheme.timeSlots.filter(s => s.id !== slotId)
    });
  };
  
  const updateIntraProvTimeSlot = (schemeId: string, slotId: string, updates: Partial<TimeSlot>) => {
    const scheme = intraProvSchemes.find(s => s.id === schemeId);
    if (!scheme) return;
    
    updateIntraProvScheme(schemeId, {
      timeSlots: scheme.timeSlots.map(s => 
        s.id === slotId ? { ...s, ...updates } : s
      )
    });
  };

  // 日滚动交易申报操作函数
  const activeRollingScheme = rollingSchemes.find(s => s.id === activeRollingSchemeId);
  const allTimePointsChecked = activeRollingScheme?.timePoints.every(p => p.checked) || false;

  const updateRollingTimePoint = (pointId: string, updates: Partial<RollingTimePoint>) => {
    setRollingSchemes(prev => prev.map(scheme => 
      scheme.id === activeRollingSchemeId
        ? {
            ...scheme,
            timePoints: scheme.timePoints.map(point =>
              point.id === pointId ? { ...point, ...updates } : point
            )
          }
        : scheme
    ));
  };

  const handleSelectAllTimePoints = (checked: boolean) => {
    setRollingSchemes(prev => prev.map(scheme =>
      scheme.id === activeRollingSchemeId
        ? {
            ...scheme,
            timePoints: scheme.timePoints.map(point => ({ ...point, checked }))
          }
        : scheme
    ));
  };

  const handleOneClickSell = () => {
    const selectedPoints = activeRollingScheme?.timePoints.filter(p => p.checked) || [];
    if (selectedPoints.length === 0) {
      return;
    }
    selectedPoints.forEach(point => {
      updateRollingTimePoint(point.id, { tradingDirection: 'sell' });
    });
  };

  const handleOneClickBuy = () => {
    const selectedPoints = activeRollingScheme?.timePoints.filter(p => p.checked) || [];
    if (selectedPoints.length === 0) {
      return;
    }
    selectedPoints.forEach(point => {
      updateRollingTimePoint(point.id, { tradingDirection: 'buy' });
    });
  };

  const handleOneClickHighestPrice = () => {
    const selectedPoints = activeRollingScheme?.timePoints.filter(p => p.checked) || [];
    if (selectedPoints.length === 0) {
      return;
    }
    selectedPoints.forEach(point => {
      updateRollingTimePoint(point.id, { declarationPrice: point.maxLimitPrice });
    });
  };

  const handleOneClickLowestPrice = () => {
    const selectedPoints = activeRollingScheme?.timePoints.filter(p => p.checked) || [];
    if (selectedPoints.length === 0) {
      return;
    }
    selectedPoints.forEach(point => {
      updateRollingTimePoint(point.id, { declarationPrice: point.minLimitPrice });
    });
  };

  const addNewRollingScheme = () => {
    const newScheme: RollingScheme = {
      id: `rolling-scheme-${Date.now()}`,
      schemeNumber: `${Date.now()}`,
      schemeName: `方案${rollingSchemes.length + 1}`,
      tradingDate: format(new Date(), 'yyyy年MM月dd日滚动交易'),
      tradingUnit: '交易单元',
      timePoints: generateRollingTimePoints()
    };
    setRollingSchemes(prev => [...prev, newScheme]);
    setActiveRollingSchemeId(newScheme.id);
  };

  const exportRollingScheme = () => {
    const scheme = rollingSchemes.find(s => s.id === activeRollingSchemeId);
    if (!scheme) return;
    const json = JSON.stringify(scheme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rolling-scheme-${scheme.schemeNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">交易操作台</h1>
        <p className="text-muted-foreground mt-2">
          中长期、日前、实时交易申报与执行
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            交易执行中心
          </CardTitle>
          <CardDescription>
            统一的交易申报与监控平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* AI推荐方案提示 */}
          {showRecommendationAlert && (
            <Alert className="mb-6 border-primary bg-primary/5">
              <Sparkles className="h-5 w-5 text-primary" />
              <AlertTitle className="flex items-center justify-between">
                <span>AI推荐方案已自动填充</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowRecommendationAlert(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertTitle>
              <AlertDescription className="text-sm">
                智能决策系统已根据当前市场条件和AI预测，为您生成了最优交易方案。
                该方案已添加到"省内现货申报"的方案列表中，请检查后提交申报。
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="centralized">集中竞价申报</TabsTrigger>
              <TabsTrigger value="rolling">日滚动交易申报</TabsTrigger>
              <TabsTrigger value="inter-provincial">省间现货申报</TabsTrigger>
              <TabsTrigger value="intra-provincial">
                省内现货申报
                {showRecommendationAlert && (
                  <Badge variant="default" className="ml-2 h-5 px-1.5 text-[10px]">
                    AI推荐
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="centralized" className="space-y-4">
              {/* 筛选条件区 */}
              <div className="flex items-center gap-4 flex-wrap">
                <Select defaultValue="shanxi">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shanxi">山西省交易中心</SelectItem>
                    <SelectItem value="shandong">山东省交易中心</SelectItem>
                    <SelectItem value="zhejiang">浙江省交易中心</SelectItem>
                  </SelectContent>
                </Select>

                <Input type="date" defaultValue="2024-04-15" className="w-48" />

                <Select defaultValue="next-month">
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next-month">2024年4月21-30日下午2时段电能采购交易</SelectItem>
                    <SelectItem value="current-month">2024年4月1-20日交易</SelectItem>
                  </SelectContent>
                </Select>

                <Button>查询</Button>
              </div>

              {/* 方案标签页 */}
              <div className="flex items-center gap-2 border-b border-border">
                <Button 
                  variant={currentScheme === "scheme1" ? "default" : "ghost"}
                  onClick={() => setCurrentScheme("scheme1")}
                  size="sm"
                >
                  交易员1
                </Button>
                <Button 
                  variant={currentScheme === "scheme2" ? "default" : "ghost"}
                  onClick={() => setCurrentScheme("scheme2")}
                  size="sm"
                >
                  交易员2
                </Button>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  新增
                </Button>
              </div>

              {/* 操作按钮区 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select defaultValue="unit1">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="交易单元" />
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

                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    挂单预期时间
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    一次报价
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    一次中标
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    二次中标
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                    二次结选
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    保护机报价：出清 0
                  </span>
                  <Badge variant="secondary">固定金额</Badge>
                  <Input type="number" defaultValue="0" className="w-24" />
                </div>
              </div>

              {/* 申报表格 */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="w-16">时点</TableHead>
                      <TableHead>
                        交易方向
                        <div className="text-xs text-muted-foreground font-normal mt-1">
                          (卖出、不交易、买入、无策略)
                        </div>
                      </TableHead>
                      <TableHead>价格上限<br />(元/MWh)</TableHead>
                      <TableHead>价格下限<br />(元/MWh)</TableHead>
                      <TableHead>买入期能<br />(%)</TableHead>
                      <TableHead>卖出期能<br />(%)</TableHead>
                      <TableHead>参与度</TableHead>
                      <TableHead>限一中能等价<br />(MWh)</TableHead>
                      <TableHead>限一中能报价<br />(元/MWh)</TableHead>
                      <TableHead>参全能</TableHead>
                      <TableHead>限二中能等价<br />(MWh)</TableHead>
                      <TableHead>限二中能报价<br />(元/MWh)</TableHead>
                      <TableHead>中标价格比<br />(%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bidData.map((row) => (
                      <TableRow key={row.hour} className="hover:bg-muted/30">
                        <TableCell>
                          <Checkbox 
                            checked={selectedRows.includes(row.hour)}
                            onCheckedChange={() => toggleRowSelection(row.hour)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{row.hour}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant={tradeDirections[row.hour] === 0 ? "destructive" : "outline"}
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => setTradeDirection(row.hour, 0)}
                              title="卖出"
                            >
                              卖
                            </Button>
                            <Button 
                              size="sm" 
                              variant={tradeDirections[row.hour] === 1 ? "secondary" : "outline"}
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => setTradeDirection(row.hour, 1)}
                              title="不交易"
                            >
                              无
                            </Button>
                            <Button 
                              size="sm" 
                              variant={tradeDirections[row.hour] === 2 ? "default" : "outline"}
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => setTradeDirection(row.hour, 2)}
                              title="买入"
                            >
                              买
                            </Button>
                            <Button 
                              size="sm" 
                              variant={tradeDirections[row.hour] === 3 ? "ghost" : "outline"}
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => setTradeDirection(row.hour, 3)}
                              title="无策略"
                            >
                              -
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{row.priceUp}</TableCell>
                        <TableCell>{row.priceDown}</TableCell>
                        <TableCell>{row.buyEnergy}</TableCell>
                        <TableCell>{row.sellEnergy}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {row.participation}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.limit1Energy}</TableCell>
                        <TableCell>{row.limit1Price}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {row.participation}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.limit1Energy}</TableCell>
                        <TableCell>{row.limit1Price}</TableCell>
                        <TableCell>{row.winRate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 底部操作按钮 */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    连续扭选
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    导入
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    导出
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-1" />
                    定时申报
                  </Button>
                  <Button>
                    <Send className="h-4 w-4 mr-1" />
                    立即申报
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rolling" className="space-y-4">
              {/* Top Filter and Clock Area */}
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Input
                    value={rollingSchemeNumber}
                    onChange={(e) => setRollingSchemeNumber(e.target.value)}
                    className="w-32"
                    placeholder="方案编号"
                  />
                  <Select value={rollingTradingDate} onValueChange={setRollingTradingDate}>
                    <SelectTrigger className="w-64">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025年02月17日滚动交易(2025-2-19)">
                        2025年02月17日滚动交易(2025-2-19)
                      </SelectItem>
                      <SelectItem value="2025年02月18日滚动交易(2025-2-20)">
                        2025年02月18日滚动交易(2025-2-20)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-[#00B04D] hover:bg-[#009644]">查询</Button>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold">
                    {format(currentTime, 'HH:mm:ss')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
                  </div>
                </div>
              </div>

              {/* Operation Button Bar */}
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    {activeRollingScheme?.schemeName || '绿略应计1'}
                  </Badge>
                  <Button variant="outline" onClick={addNewRollingScheme}>
                    <Plus className="h-4 w-4 mr-1" />
                    新增
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">状态查询</Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    保存
                  </Button>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-1" />
                    立即申报
                  </Button>
                  <Button className="bg-[#00B04D] hover:bg-[#009644]">
                    <Clock className="h-4 w-4 mr-1" />
                    定时申报
                  </Button>
                  <Button variant="outline" onClick={exportRollingScheme}>
                    <Upload className="h-4 w-4 mr-1" />
                    导出
                  </Button>
                </div>
              </div>

              {/* Control Panel */}
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-lg border">
                <Select value={rollingTradingUnit} onValueChange={setRollingTradingUnit}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="交易单元" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="山东省场站A">山东省场站A</SelectItem>
                    <SelectItem value="山东省场站B">山东省场站B</SelectItem>
                    <SelectItem value="山西省场站A">山西省场站A</SelectItem>
                    <SelectItem value="山西省场站B">山西省场站B</SelectItem>
                    <SelectItem value="浙江省场站A">浙江省场站A</SelectItem>
                    <SelectItem value="浙江省场站B">浙江省场站B</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-sm cursor-help">
                          接受限额方向调询
                          <HelpCircle className="h-4 w-4 text-red-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>点击查询当前交易单元的限额信息</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleOneClickSell}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                      一键卖出
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleOneClickBuy}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                      一键买入
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleOneClickHighestPrice}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      一键最高价
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleOneClickLowestPrice}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      一键最低价
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span>策略首选</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="radio" 
                        name="strategy-mode" 
                        checked={strategyMode === 'ratio'}
                        onChange={() => setStrategyMode('ratio')}
                        className="cursor-pointer"
                      />
                      <span>比例</span>
                      <Input 
                        type="number" 
                        value="0" 
                        className="w-16 h-7 text-xs text-right"
                        disabled={strategyMode !== 'ratio'}
                      />
                    </div>
                    <span className="mx-1">/</span>
                    <div className="flex items-center gap-1">
                      <span>固定值</span>
                      <Input 
                        type="number" 
                        value="0.000" 
                        className="w-20 h-7 text-xs text-right font-mono"
                        disabled={strategyMode !== 'fixed'}
                      />
                    </div>
                  </div>
                  <Button className="bg-[#00B04D] hover:bg-[#009644]" size="sm">
                    批量设置
                  </Button>
                </div>
              </div>

              {/* Collapsible Section */}
              <div className="bg-white rounded-lg border">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#F8FBFA]"
                  onClick={() => setShowUnitSection(!showUnitSection)}
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform ${showUnitSection ? '' : '-rotate-90'}`}
                    />
                    <span className="font-medium">交易单元</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {showUnitSection && (
                  <div className="p-3 border-t">
                    <p className="text-sm text-muted-foreground">交易单元详细信息...</p>
                  </div>
                )}
              </div>

              {/* Main Data Table */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                      <tr className="border-b-2 border-[#00B04D]">
                        <th className="h-10 px-4 text-left align-middle font-semibold text-xs">
                          <Checkbox 
                            checked={allTimePointsChecked}
                            onCheckedChange={handleSelectAllTimePoints}
                          />
                        </th>
                        <th className="h-10 px-4 text-center align-middle font-semibold text-xs">
                          时点
                        </th>
                        <th className="h-10 px-4 text-center align-middle font-semibold text-xs">
                          交易方向
                          <div className="text-[10px] font-normal text-gray-500 mt-1">
                            (卖出、不交易、买入、无限制)
                          </div>
                        </th>
                        <th className="h-10 px-4 text-right align-middle font-semibold text-xs">
                          最高限价
                          <div className="text-[10px] font-normal text-gray-500 mt-1">(元/MWh)</div>
                        </th>
                        <th className="h-10 px-4 text-right align-middle font-semibold text-xs">
                          最低限价
                          <div className="text-[10px] font-normal text-gray-500 mt-1">(元/MWh)</div>
                        </th>
                        <th className="h-10 px-4 text-right align-middle font-semibold text-xs">
                          买入限量
                          <div className="text-[10px] font-normal text-gray-500 mt-1">(MWh)</div>
                        </th>
                        <th className="h-10 px-4 text-right align-middle font-semibold text-xs">
                          卖出限量
                          <div className="text-[10px] font-normal text-gray-500 mt-1">(MWh)</div>
                        </th>
                        <th className="h-10 px-4 text-center align-middle font-semibold text-xs" colSpan={3}>
                          申报电价
                        </th>
                        <th className="h-10 px-4 text-right align-middle font-semibold text-xs">
                          申报电价
                          <div className="text-[10px] font-normal text-gray-500 mt-1">(元/MWh)</div>
                        </th>
                      </tr>
                      <tr className="border-b bg-[#E8F0EC]">
                        <th colSpan={7}></th>
                        <th className="h-8 px-2 text-center align-middle font-medium text-xs">
                          参考值
                        </th>
                        <th className="h-8 px-2 text-center align-middle font-medium text-xs">
                          比例(%)
                        </th>
                        <th className="h-8 px-2 text-center align-middle font-medium text-xs">
                          固定值(MWh)
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {activeRollingScheme?.timePoints.map((point) => (
                        <tr 
                          key={point.id}
                          className="border-b transition-colors hover:bg-[#F8FBFA]"
                        >
                          <td className="p-4 align-middle">
                            <Checkbox 
                              checked={point.checked}
                              onCheckedChange={(checked) => 
                                updateRollingTimePoint(point.id, { checked: !!checked })
                              }
                            />
                          </td>
                          
                          <td className="p-4 align-middle text-center font-medium">
                            {point.timePoint}
                          </td>
                          
                          <td className="p-4 align-middle">
                            <TooltipProvider>
                              <div className="flex items-center justify-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <input 
                                      type="radio"
                                      name={`direction-${point.id}`}
                                      checked={point.tradingDirection === 'sell'}
                                      onChange={() => updateRollingTimePoint(point.id, { tradingDirection: 'sell' })}
                                      className="cursor-pointer"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent><p>卖出</p></TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <input 
                                      type="radio"
                                      name={`direction-${point.id}`}
                                      checked={point.tradingDirection === 'no-trade'}
                                      onChange={() => updateRollingTimePoint(point.id, { tradingDirection: 'no-trade' })}
                                      className="cursor-pointer"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent><p>不交易</p></TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <input 
                                      type="radio"
                                      name={`direction-${point.id}`}
                                      checked={point.tradingDirection === 'buy'}
                                      onChange={() => updateRollingTimePoint(point.id, { tradingDirection: 'buy' })}
                                      className="cursor-pointer"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent><p>买入</p></TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <input 
                                      type="radio"
                                      name={`direction-${point.id}`}
                                      checked={point.tradingDirection === 'unlimited'}
                                      onChange={() => updateRollingTimePoint(point.id, { tradingDirection: 'unlimited' })}
                                      className="cursor-pointer"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent><p>无限制</p></TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </td>
                          
                          <td className="p-4 align-middle">
                            <Input 
                              type="number"
                              value={point.maxLimitPrice}
                              onChange={(e) => updateRollingTimePoint(point.id, { 
                                maxLimitPrice: parseFloat(e.target.value) 
                              })}
                              className="w-28 text-right font-mono text-xs"
                              step="0.01"
                            />
                          </td>
                          
                          <td className="p-4 align-middle">
                            <Input 
                              type="number"
                              value={point.minLimitPrice}
                              onChange={(e) => updateRollingTimePoint(point.id, { 
                                minLimitPrice: parseFloat(e.target.value) 
                              })}
                              className="w-28 text-right font-mono text-xs"
                              step="0.01"
                            />
                          </td>
                          
                          <td className="p-4 align-middle">
                            <Input 
                              type="number"
                              value={point.buyLimitVolume}
                              onChange={(e) => updateRollingTimePoint(point.id, { 
                                buyLimitVolume: parseFloat(e.target.value) 
                              })}
                              className="w-28 text-right font-mono text-xs"
                              step="0.001"
                            />
                          </td>
                          
                          <td className="p-4 align-middle">
                            <Input 
                              type="number"
                              value={point.sellLimitVolume}
                              onChange={(e) => updateRollingTimePoint(point.id, { 
                                sellLimitVolume: parseFloat(e.target.value) 
                              })}
                              className="w-28 text-right font-mono text-xs"
                              step="0.001"
                            />
                          </td>
                          
                          <td className="p-2 align-middle text-center">
                            <span className="text-xs text-muted-foreground">
                              {point.referenceValue}
                            </span>
                          </td>
                          
                          <td className="p-2 align-middle">
                            <Input 
                              type="number"
                              value={point.ratio}
                              onChange={(e) => updateRollingTimePoint(point.id, { 
                                ratio: parseFloat(e.target.value) 
                              })}
                              className="w-20 text-right font-mono text-xs"
                              disabled={strategyMode !== 'ratio'}
                            />
                          </td>
                          
                          <td className="p-2 align-middle">
                            <Input 
                              type="number"
                              value={point.fixedValue}
                              onChange={(e) => updateRollingTimePoint(point.id, { 
                                fixedValue: parseFloat(e.target.value) 
                              })}
                              className="w-24 text-right font-mono text-xs"
                              disabled={strategyMode !== 'fixed'}
                              step="0.001"
                            />
                          </td>
                          
                          <td className="p-4 align-middle text-right">
                            <span className="font-mono text-xs">
                              {point.declarationPrice.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inter-provincial" className="space-y-4">
              {/* 顶部筛选与时钟区域 */}
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-4 flex-wrap">
                  <Select value={interProvTradingCenter} onValueChange={setInterProvTradingCenter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shanxi">山西电力交易中心</SelectItem>
                      <SelectItem value="shandong">山东电力交易中心</SelectItem>
                      <SelectItem value="zhejiang">浙江电力交易中心</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={interProvMarketType === 'day-ahead' ? 'default' : 'outline'}
                      onClick={() => setInterProvMarketType('day-ahead')}
                      size="sm"
                    >
                      日前
                    </Button>
                    <Button 
                      variant={interProvMarketType === 'intraday' ? 'default' : 'outline'}
                      onClick={() => setInterProvMarketType('intraday')}
                      size="sm"
                    >
                      日内
                    </Button>
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-64 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {interProvDateRange.from && interProvDateRange.to ? (
                          <>
                            {format(interProvDateRange.from, "yyyy-MM-dd", { locale: zhCN })} 至{" "}
                            {format(interProvDateRange.to, "yyyy-MM-dd", { locale: zhCN })}
                          </>
                        ) : (
                          <span>选择日期范围</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={interProvDateRange.from}
                        onSelect={(date) => date && setInterProvDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Button className="bg-[#00B04D] hover:bg-[#009644]">
                    查询
                  </Button>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {format(currentTime, "HH:mm:ss")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(currentTime, "yyyy年MM月dd日 EEEE", { locale: zhCN })}
                  </div>
                </div>
              </div>
              
              {/* 操作按钮栏 */}
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">方案组1</Badge>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm" onClick={addNewInterProvScheme}>
                    <Plus className="h-4 w-4 mr-1" />
                    新增
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">限额查询</Button>
                  <Button variant="outline" size="sm">挂单状态</Button>
                  <Button variant="outline" size="sm">保存</Button>
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-1" />
                    立即申报
                  </Button>
                  <Button className="bg-[#00B04D] hover:bg-[#009644]" size="sm">
                    <Send className="h-4 w-4 mr-1" />
                    生效申报
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    导出
                  </Button>
                </div>
              </div>
              
              {/* 视图控制区域 */}
              <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border">
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as any)}>
                  <ToggleGroupItem value="ratio" aria-label="电力比例">
                    电力比例（%）
                  </ToggleGroupItem>
                  <ToggleGroupItem value="fixed" aria-label="电力固定值">
                    电力固定值（MWh）
                  </ToggleGroupItem>
                  <ToggleGroupItem value="price" aria-label="电价">
                    电价（元/MWh）
                  </ToggleGroupItem>
                </ToggleGroup>
                
                <Button variant="outline" size="sm" className="border-[#00B04D] text-[#00B04D] hover:bg-[#F1F8F4]">
                  模板配置
                </Button>
              </div>
              
              {/* 方案卡片网格 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {interProvSchemes.map((scheme) => (
                  <Card key={scheme.id} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 bg-[#F8FBFA]">
                      <CardTitle className="text-base font-semibold">{scheme.name}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeInterProvScheme(scheme.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      {/* 基本配置区 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">标的日</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal h-9 text-xs">
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {scheme.targetDate ? format(scheme.targetDate, "yyyy-MM-dd") : "请选择日期"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={scheme.targetDate || undefined}
                                onSelect={(date) => updateInterProvScheme(scheme.id, { targetDate: date || null })}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-xs">交易单元</Label>
                          <Select 
                            value={scheme.selectedUnitsCount.toString()}
                            onValueChange={(value) => updateInterProvScheme(scheme.id, { selectedUnitsCount: parseInt(value) })}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder={`${scheme.selectedUnitsCount}/${scheme.totalUnitsCount} 已交易单元`} />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: scheme.totalUnitsCount + 1 }, (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i}/{scheme.totalUnitsCount} 已交易单元
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-1.5 col-span-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">限额条件</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-red-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">限额条件说明：交易单元的最大电量限制</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Input 
                            value={scheme.limitCondition}
                            onChange={(e) => updateInterProvScheme(scheme.id, { limitCondition: e.target.value })}
                            className="h-9 text-xs"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-xs">电力</Label>
                          <Select 
                            value={scheme.powerStrategy}
                            onValueChange={(value) => updateInterProvScheme(scheme.id, { powerStrategy: value })}
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
                            onValueChange={(value) => updateInterProvScheme(scheme.id, { priceStrategy: value })}
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
                      
                      {/* 时段数据表格 */}
                      <div className="rounded-md border max-h-[300px] overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                            <tr className="border-b">
                              <th className="h-10 px-2 text-left align-middle font-semibold text-gray-700 text-xs">时间段</th>
                              {viewMode !== 'price' && (
                                <>
                                  {viewMode === 'ratio' && (
                                    <th className="h-10 px-2 text-right align-middle font-semibold text-gray-700 text-xs">比例(%)</th>
                                  )}
                                  {viewMode === 'fixed' && (
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
                                      type="text"
                                      value={slot.startTime}
                                      onChange={(e) => updateTimeSlot(scheme.id, slot.id, { startTime: e.target.value })}
                                      placeholder="0015"
                                      className="w-14 h-8 text-xs font-mono text-center"
                                      maxLength={4}
                                    />
                                    <span className="text-xs text-muted-foreground">-</span>
                                    <Input 
                                      type="text"
                                      value={slot.endTime}
                                      onChange={(e) => updateTimeSlot(scheme.id, slot.id, { endTime: e.target.value })}
                                      placeholder="2400"
                                      className="w-14 h-8 text-xs font-mono text-center"
                                      maxLength={4}
                                    />
                                  </div>
                                </td>
                                {viewMode !== 'price' && (
                                  <>
                                    {viewMode === 'ratio' && (
                                      <td className="p-2 align-middle">
                                        <Input 
                                          type="number"
                                          value={slot.powerRatio ?? ''}
                                          onChange={(e) => updateTimeSlot(scheme.id, slot.id, { powerRatio: e.target.value ? parseFloat(e.target.value) : null })}
                                          className="w-20 h-8 text-xs font-mono text-right"
                                        />
                                      </td>
                                    )}
                                    {viewMode === 'fixed' && (
                                      <td className="p-2 align-middle">
                                        <Input 
                                          type="number"
                                          value={slot.powerFixed ?? ''}
                                          onChange={(e) => updateTimeSlot(scheme.id, slot.id, { powerFixed: e.target.value ? parseFloat(e.target.value) : null })}
                                          className="w-20 h-8 text-xs font-mono text-right"
                                        />
                                      </td>
                                    )}
                                  </>
                                )}
                                <td className="p-2 align-middle">
                                  <Input 
                                    type="number"
                                    value={slot.price ?? ''}
                                    onChange={(e) => updateTimeSlot(scheme.id, slot.id, { price: e.target.value ? parseFloat(e.target.value) : null })}
                                    className="w-24 h-8 text-xs font-mono text-right"
                                    step="0.01"
                                  />
                                </td>
                                <td className="p-2 align-middle">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 w-7 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => removeTimeSlot(scheme.id, slot.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* 添加时段按钮 */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => addTimeSlot(scheme.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        新增
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                {/* 添加新方案卡片按钮 */}
                <Card 
                  className="border-2 border-dashed border-gray-300 hover:border-[#00B04D] hover:bg-[#F8FBFA] cursor-pointer transition-colors min-h-[400px] flex items-center justify-center"
                  onClick={addNewInterProvScheme}
                >
                  <div className="text-center">
                    <Plus className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">添加新方案</p>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="intra-provincial" className="space-y-4">
              <IntraProvincialSpotBidding showRecommendationAlert={showRecommendationAlert} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Console;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon, 
  Download, 
  Filter, 
  ChevronRight, 
  ChevronDown,
  FileText,
  DollarSign,
  Zap,
  TrendingUpIcon
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Area, 
  AreaChart, 
  ComposedChart 
} from "recharts";
import { cn } from "@/lib/utils";

// ============= 数据结构定义 =============

interface PositionContract {
  id: string;
  tradingUnit: string;
  contractType: string;
  startDate: string;
  endDate: string;
  contractVolume: number;
  contractPrice: number;
  totalValue: number;
}

interface TradingUnitNode {
  id: string;
  name: string;
  type: 'group' | 'station' | 'unit';
  children?: TradingUnitNode[];
  contracts: PositionContract[];
}

interface TimeSeriesPosition {
  time: string;
  price: number;
  volume: number;
  revenue: number;
}

// ============= 模拟数据生成 =============

const generateTradingUnitTree = (): TradingUnitNode[] => {
  return [
    {
      id: '1',
      name: '新庄厂/场站电池组合同',
      type: 'station',
      contracts: [],
      children: [
        {
          id: '1-1',
          name: '十二回路一期',
          type: 'unit',
          contracts: generateContracts('十二回路一期', 8),
        },
      ],
    },
    {
      id: '2',
      name: '达坂城厂/场站电池组合同',
      type: 'station',
      contracts: [],
      children: [
        {
          id: '2-1',
          name: '达坂城一期',
          type: 'unit',
          contracts: generateContracts('达坂城一期', 10),
        },
        {
          id: '2-2',
          name: '达坂城二期',
          type: 'unit',
          contracts: generateContracts('达坂城二期', 7),
        },
      ],
    },
    {
      id: '3',
      name: '叶青城厂/场站电池组合同',
      type: 'station',
      contracts: [],
      children: [
        {
          id: '3-1',
          name: '小草湖一期',
          type: 'unit',
          contracts: generateContracts('小草湖一期', 9),
        },
        {
          id: '3-2',
          name: '小草湖二期',
          type: 'unit',
          contracts: generateContracts('小草湖二期', 6),
        },
      ],
    },
    {
      id: '4',
      name: '新疆能建新能源有限公司',
      type: 'unit',
      contracts: generateContracts('新疆能建新能源有限公司', 12),
    },
  ];
};

const generateContracts = (unitName: string, count: number): PositionContract[] => {
  const types = ['月度交易', '旬交易', '日滚动交易'];
  return Array.from({ length: count }, (_, i) => {
    const volume = 500 + Math.random() * 1000;
    const price = 250 + Math.random() * 150;
    return {
      id: `${unitName}-${i + 1}`,
      tradingUnit: unitName,
      contractType: types[Math.floor(Math.random() * types.length)],
      startDate: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
      endDate: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-28`,
      contractVolume: volume,
      contractPrice: price,
      totalValue: volume * price,
    };
  });
};

const generateTimeSeriesData = (
  selectedUnits: string[],
  allNodes: TradingUnitNode[],
  granularity: string,
  dateRange: { from: Date | undefined; to: Date | undefined }
): TimeSeriesPosition[] => {
  const contracts = getAllContracts(selectedUnits, allNodes);
  const points = granularity === '24point' ? 24 : granularity === 'hour' ? 96 : granularity === 'day' ? 30 : 12;
  
  return Array.from({ length: points }, (_, i) => {
    const basePrice = 280 + Math.random() * 120;
    const baseVolume = contracts.reduce((sum, c) => sum + c.contractVolume, 0) / points;
    const volume = baseVolume * (0.8 + Math.random() * 0.4);
    
    let timeLabel = '';
    if (granularity === '24point') {
      timeLabel = `${String(i).padStart(2, '0')}:00`;
    } else if (granularity === 'hour') {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    } else if (granularity === 'day') {
      timeLabel = `${i + 1}日`;
    } else {
      timeLabel = `${i + 1}月`;
    }
    
    return {
      time: timeLabel,
      price: basePrice,
      volume: volume,
      revenue: basePrice * volume,
    };
  });
};

const getAllContracts = (selectedIds: string[], nodes: TradingUnitNode[]): PositionContract[] => {
  let contracts: PositionContract[] = [];
  
  const traverse = (node: TradingUnitNode) => {
    if (selectedIds.includes(node.id)) {
      contracts = [...contracts, ...node.contracts];
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  
  nodes.forEach(traverse);
  return contracts;
};

// ============= 树形选择组件 =============

const TradingUnitTree = ({ 
  nodes, 
  selectedIds, 
  onSelectionChange 
}: { 
  nodes: TradingUnitNode[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(['1', '2', '3']);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCheckChange = (nodeId: string, checked: boolean) => {
    const node = findNode(nodeId, nodes);
    if (!node) return;

    let newSelectedIds = [...selectedIds];
    const allChildIds = getAllChildIds(node);
    
    if (checked) {
      newSelectedIds = [...new Set([...newSelectedIds, nodeId, ...allChildIds])];
    } else {
      newSelectedIds = newSelectedIds.filter(id => 
        id !== nodeId && !allChildIds.includes(id)
      );
    }
    
    onSelectionChange(newSelectedIds);
  };

  const findNode = (id: string, nodes: TradingUnitNode[]): TradingUnitNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(id, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const getAllChildIds = (node: TradingUnitNode): string[] => {
    let ids: string[] = [];
    if (node.children) {
      node.children.forEach(child => {
        ids.push(child.id);
        ids = [...ids, ...getAllChildIds(child)];
      });
    }
    return ids;
  };

  const renderNode = (node: TradingUnitNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.includes(node.id);
    const isChecked = selectedIds.includes(node.id);

    return (
      <div key={node.id}>
        <div 
          className={cn(
            "flex items-center gap-2 py-2 px-2 hover:bg-[#F8FBFA] rounded cursor-pointer",
            level > 0 && "ml-6"
          )}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.id)}
              className="flex-shrink-0 w-4 h-4"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          <Checkbox
            checked={isChecked}
            onCheckedChange={(checked) => handleCheckChange(node.id, checked as boolean)}
            className="flex-shrink-0"
          />
          
          <span className="text-sm flex-1">{node.name}</span>
          
          {node.contracts.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {node.contracts.length}
            </Badge>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {nodes.map(node => renderNode(node))}
    </div>
  );
};

// ============= 详情表格对话框 =============

const PositionDetailDialog = ({ 
  contracts 
}: { 
  contracts: PositionContract[] 
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          查询持仓明细
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>持仓合同明细</DialogTitle>
          <DialogDescription>
            共 {contracts.length} 条持仓合同记录
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
              <TableRow>
                <TableHead>合同编号</TableHead>
                <TableHead>交易单元</TableHead>
                <TableHead>合同类型</TableHead>
                <TableHead>起始日期</TableHead>
                <TableHead>结束日期</TableHead>
                <TableHead className="text-right">合同电量(MWh)</TableHead>
                <TableHead className="text-right">合同电价(元/MWh)</TableHead>
                <TableHead className="text-right">总价值(元)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-[#F8FBFA]">
                  <TableCell className="font-mono">{contract.id}</TableCell>
                  <TableCell>{contract.tradingUnit}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{contract.contractType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{contract.startDate}</TableCell>
                  <TableCell className="font-mono">{contract.endDate}</TableCell>
                  <TableCell className="text-right font-mono">
                    {contract.contractVolume.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {contract.contractPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {contract.totalValue.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// ============= 中长期策略复盘主组件 =============

const MediumLongTermReview = () => {
  const [tradingUnitTree] = useState<TradingUnitNode[]>(generateTradingUnitTree());
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(['1-1', '2-1']);
  const [contractType, setContractType] = useState<string>('all');
  const [granularity, setGranularity] = useState<string>('day');
  const [mergeDisplay, setMergeDisplay] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 11, 31),
  });

  const selectedContracts = useMemo(() => {
    const contracts = getAllContracts(selectedUnitIds, tradingUnitTree);
    if (contractType === 'all') return contracts;
    return contracts.filter(c => c.contractType === contractType);
  }, [selectedUnitIds, contractType, tradingUnitTree]);

  const timeSeriesData = useMemo(() => {
    return generateTimeSeriesData(selectedUnitIds, tradingUnitTree, granularity, dateRange);
  }, [selectedUnitIds, granularity, dateRange, tradingUnitTree]);

  const stats = useMemo(() => {
    const totalValue = selectedContracts.reduce((sum, c) => sum + c.totalValue, 0);
    const totalVolume = selectedContracts.reduce((sum, c) => sum + c.contractVolume, 0);
    const avgPrice = totalVolume > 0 ? totalValue / totalVolume : 0;
    
    return {
      totalValue,
      totalVolume,
      avgPrice,
    };
  }, [selectedContracts]);

  return (
    <div className="flex gap-6">
      {/* 左侧持仓总览 */}
      <div className="w-[280px] flex-shrink-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">持仓总览</CardTitle>
            <CardDescription className="text-xs">
              选择交易单元查看持仓分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <TradingUnitTree
                nodes={tradingUnitTree}
                selectedIds={selectedUnitIds}
                onSelectionChange={setSelectedUnitIds}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* 右侧主区域 */}
      <div className="flex-1 space-y-6">
        {/* 筛选控制区 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs mb-2 block">起止日期</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to ? (
                        <>
                          {format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })} -{" "}
                          {format(dateRange.to, "yyyy-MM-dd", { locale: zhCN })}
                        </>
                      ) : (
                        <span>选择日期范围</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                      locale={zhCN}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="w-[180px]">
                <Label className="text-xs mb-2 block">合同类型</Label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="月度交易">月度交易</SelectItem>
                    <SelectItem value="旬交易">旬交易</SelectItem>
                    <SelectItem value="日滚动交易">日滚动交易</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button>
                <Filter className="w-4 h-4 mr-2" />
                查询
              </Button>

              <PositionDetailDialog contracts={selectedContracts} />

              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 统计指标卡片 */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#00B04D]" />
                持仓总电价
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                ¥{(stats.totalValue / 10000).toFixed(2)}万
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                已选中 {selectedContracts.length} 个合同
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00B04D]" />
                持仓总电量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {(stats.totalVolume / 1000).toFixed(2)}GWh
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                合计 {stats.totalVolume.toFixed(2)} MWh
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-[#00B04D]" />
                持仓均价
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {stats.avgPrice.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                元/MWh
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 图表区域标题 */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            场站交易单元选择：
            <span className="text-[#00B04D] ml-2">
              {selectedUnitIds.length > 0 
                ? `已选 ${selectedUnitIds.length} 个单元` 
                : '请在左侧选择交易单元'}
            </span>
          </h3>
        </div>

        {/* 图表控制区 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label className="text-sm">时间粒度：</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'hour', label: '96点15分钟' },
                    { value: 'day', label: '日' },
                    { value: 'month', label: '月' },
                    { value: '24point', label: '24点2时' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={granularity === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGranularity(option.value)}
                      className={cn(
                        granularity === option.value && "bg-[#00B04D] hover:bg-[#00A86B]"
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm">合并展示</Label>
                <Switch
                  checked={mergeDisplay}
                  onCheckedChange={setMergeDisplay}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 电价折线图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">持仓电价分析</CardTitle>
            <CardDescription className="text-xs">单位：元/MWh</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                  label={{ 
                    value: '电价 (元/MWh)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 12 }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E8F0EC',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} 元/MWh`, '电价']}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#00B04D" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#00B04D' }}
                  activeDot={{ r: 5 }}
                  name="持仓电价"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 电量面积图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">持仓电量分析</CardTitle>
            <CardDescription className="text-xs">单位：MWh</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                  label={{ 
                    value: '电量 (MWh)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 12 }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E8F0EC',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} MWh`, '电量']}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="rect"
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#00B04D" 
                  strokeWidth={2}
                  fill="#00B04D"
                  fillOpacity={0.3}
                  name="持仓电量"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ============= 省内现货复盘数据 =============

interface IntraSpotReviewData {
  date: string;
  tradingUnit: string;
  realTimeMeasuredVolume: number;
  comprehensiveVolume: number;
  baseVolume: number;
  mediumLongTermVolume: number;
  dayAheadClearingVolume: number;
  comprehensivePrice: number;
  arithmeticAvgPrice: number;
  mediumLongTermPrice: number;
  realTimeBuyPrice: number;
  realTimeSellPrice: number;
  dayAheadBuyPrice: number;
  dayAheadSellPrice: number;
  comprehensiveRevenue: number;
  mediumLongTermRevenue: number;
  spotRevenue: number;
  deviationRecoveryFee: number;
  assessmentFee: number;
  deviationVolume: number;
  deviationRate: number;
}

interface IntraSummaryStats {
  totalRevenue: number;
  totalVolume: number;
  avgPrice: number;
  mediumLongTermRevenue: number;
  mediumLongTermVolume: number;
  mediumLongTermAvgPrice: number;
  spotRevenue: number;
  spotVolume: number;
  spotAvgPrice: number;
  assessmentFee: number;
  assessmentPrice: number;
}

const generateIntraProvincialData = (days: number = 20): IntraSpotReviewData[] => {
  const data: IntraSpotReviewData[] = [];
  const units = ['场站A', '场站B', '场站C', '场站D'];
  const startDate = new Date('2024-05-01');

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = format(date, 'MM-dd');

    units.forEach(unit => {
      const baseVolume = 500 + Math.random() * 500;
      const mediumLongTermVolume = 1000 + Math.random() * 2000;
      const dayAheadVolume = 500 + Math.random() * 1000;
      const realTimeVolume = dayAheadVolume * (0.95 + Math.random() * 0.1);
      const comprehensiveVolume = baseVolume + mediumLongTermVolume + dayAheadVolume;

      const mediumLongTermPrice = 280 + Math.random() * 80;
      const dayAheadBuyPrice = 200 + Math.random() * 80;
      const dayAheadSellPrice = dayAheadBuyPrice * 1.08;
      const realTimeBuyPrice = dayAheadBuyPrice * (0.9 + Math.random() * 0.2);
      const realTimeSellPrice = realTimeBuyPrice * 1.08;

      const comprehensivePrice = (
        (mediumLongTermVolume * mediumLongTermPrice) +
        (dayAheadVolume * dayAheadBuyPrice) +
        (realTimeVolume * realTimeBuyPrice)
      ) / comprehensiveVolume;

      const arithmeticAvgPrice = (mediumLongTermPrice + dayAheadBuyPrice + realTimeBuyPrice) / 3;
      const mediumLongTermRevenue = mediumLongTermVolume * mediumLongTermPrice;
      const spotRevenue = (dayAheadVolume * dayAheadBuyPrice) + (realTimeVolume * realTimeBuyPrice);
      const comprehensiveRevenue = mediumLongTermRevenue + spotRevenue;

      data.push({
        date: dateStr,
        tradingUnit: unit,
        realTimeMeasuredVolume: realTimeVolume,
        comprehensiveVolume,
        baseVolume,
        mediumLongTermVolume,
        dayAheadClearingVolume: dayAheadVolume,
        comprehensivePrice,
        arithmeticAvgPrice,
        mediumLongTermPrice,
        realTimeBuyPrice,
        realTimeSellPrice,
        dayAheadBuyPrice,
        dayAheadSellPrice,
        comprehensiveRevenue,
        mediumLongTermRevenue,
        spotRevenue,
        deviationRecoveryFee: Math.random() * 8000 + 2000,
        assessmentFee: Math.random() * 4000 + 1000,
        deviationVolume: Math.abs(dayAheadVolume - realTimeVolume),
        deviationRate: Math.abs((dayAheadVolume - realTimeVolume) / dayAheadVolume) * 100,
      });
    });
  }

  return data;
};

const calculateIntraSummary = (data: IntraSpotReviewData[]): IntraSummaryStats => {
  const totalRevenue = data.reduce((sum, item) => sum + item.comprehensiveRevenue, 0);
  const totalVolume = data.reduce((sum, item) => sum + item.comprehensiveVolume, 0);
  const avgPrice = totalVolume > 0 ? totalRevenue / totalVolume : 0;

  const mediumLongTermRevenue = data.reduce((sum, item) => sum + item.mediumLongTermRevenue, 0);
  const mediumLongTermVolume = data.reduce((sum, item) => sum + item.mediumLongTermVolume, 0);
  const mediumLongTermAvgPrice = mediumLongTermVolume > 0 ? mediumLongTermRevenue / mediumLongTermVolume : 0;

  const spotRevenue = data.reduce((sum, item) => sum + item.spotRevenue, 0);
  const spotVolume = data.reduce((sum, item) => sum + item.dayAheadClearingVolume + item.realTimeMeasuredVolume, 0);
  const spotAvgPrice = spotVolume > 0 ? spotRevenue / spotVolume : 0;

  const assessmentFee = data.reduce((sum, item) => sum + item.assessmentFee, 0);
  const assessmentPrice = totalVolume > 0 ? assessmentFee / totalVolume : 0;

  return {
    totalRevenue,
    totalVolume,
    avgPrice,
    mediumLongTermRevenue,
    mediumLongTermVolume,
    mediumLongTermAvgPrice,
    spotRevenue,
    spotVolume,
    spotAvgPrice,
    assessmentFee,
    assessmentPrice,
  };
};

const aggregateIntraData = (
  data: IntraSpotReviewData[],
  dimension: 'tradingUnit' | 'date'
): IntraSpotReviewData[] => {
  const grouped = data.reduce((acc, item) => {
    const key = dimension === 'tradingUnit' ? item.tradingUnit : item.date;
    if (!acc[key]) {
      acc[key] = { ...item };
    } else {
      acc[key].realTimeMeasuredVolume += item.realTimeMeasuredVolume;
      acc[key].comprehensiveVolume += item.comprehensiveVolume;
      acc[key].baseVolume += item.baseVolume;
      acc[key].mediumLongTermVolume += item.mediumLongTermVolume;
      acc[key].dayAheadClearingVolume += item.dayAheadClearingVolume;
      acc[key].comprehensiveRevenue += item.comprehensiveRevenue;
      acc[key].mediumLongTermRevenue += item.mediumLongTermRevenue;
      acc[key].spotRevenue += item.spotRevenue;
      acc[key].deviationRecoveryFee += item.deviationRecoveryFee;
      acc[key].assessmentFee += item.assessmentFee;
      acc[key].deviationVolume += item.deviationVolume;
    }
    return acc;
  }, {} as Record<string, IntraSpotReviewData>);

  Object.values(grouped).forEach(item => {
    item.comprehensivePrice = item.comprehensiveRevenue / item.comprehensiveVolume;
    item.mediumLongTermPrice = item.mediumLongTermRevenue / item.mediumLongTermVolume;
    item.arithmeticAvgPrice = (item.mediumLongTermPrice + item.dayAheadBuyPrice + item.realTimeBuyPrice) / 3;
    item.deviationRate = (item.deviationVolume / item.dayAheadClearingVolume) * 100;
  });

  return Object.values(grouped);
};

// ============= 省间现货复盘数据 =============

// ============= 省间现货复盘数据结构 =============

interface InterSpotReviewData {
  date: string;
  timePoint: string;
  tradingUnit: string;
  dayAheadVolume: number;
  dayAheadPrice: number;
  dayAheadRevenue: number;
  intraDayVolume: number;
  intraDayPrice: number;
  intraDayRevenue: number;
  intraProvincialRealTimePrice: number;
  profitLossDiff: number;
}

interface InterTreeNode {
  key: string;
  label: string;
  level: number;
  dayAheadVolume: number;
  dayAheadPrice: number;
  intraDayVolume: number;
  intraDayPrice: number;
  intraProvincialPrice: number;
  profitLossDiff: number;
  children?: InterTreeNode[];
}

type InterAggregationDimension = 'tradingUnit' | 'date' | 'timePoint';

// ============= 省间现货复盘数据生成 =============

const generateInterSpotReviewData = (
  startDate: string,
  endDate: string,
  tradingUnits: string[],
  granularity: '24' | '96'
): InterSpotReviewData[] => {
  const data: InterSpotReviewData[] = [];
  const dates = ['20240506', '20240516', '20240520'];
  const sampleTimePoints = ['1015', '1030', '1045', '1100', '1115', '1130', '1145', '1200'];
  
  dates.forEach(date => {
    tradingUnits.forEach(unit => {
      sampleTimePoints.forEach(timePoint => {
        const dayAheadVolume = 0.1 + Math.random() * 0.4;
        const intraDayVolume = 0.05 + Math.random() * 0.25;
        const dayAheadPrice = 180 + Math.random() * 80;
        const intraDayPrice = 200 + Math.random() * 60;
        const intraProvincialPrice = 190 + Math.random() * 70;
        
        const dayAheadRevenue = dayAheadVolume * dayAheadPrice;
        const intraDayRevenue = intraDayVolume * intraDayPrice;
        const interRevenue = dayAheadRevenue + intraDayRevenue;
        const assumedIntraRevenue = (dayAheadVolume + intraDayVolume) * intraProvincialPrice;
        const profitLossDiff = interRevenue - assumedIntraRevenue;
        
        data.push({
          date,
          timePoint,
          tradingUnit: unit,
          dayAheadVolume,
          dayAheadPrice,
          dayAheadRevenue,
          intraDayVolume,
          intraDayPrice,
          intraDayRevenue,
          intraProvincialRealTimePrice: intraProvincialPrice,
          profitLossDiff,
        });
      });
    });
  });
  
  return data;
};

const buildInterTreeData = (
  rawData: InterSpotReviewData[],
  dimension: InterAggregationDimension
): InterTreeNode[] => {
  const totalNode: InterTreeNode = {
    key: 'total',
    label: '合计',
    level: 0,
    dayAheadVolume: 0,
    intraDayVolume: 0,
    dayAheadPrice: 0,
    intraDayPrice: 0,
    intraProvincialPrice: 0,
    profitLossDiff: 0,
  };
  
  let totalDayAheadRevenue = 0;
  let totalIntraDayRevenue = 0;
  let totalIntraProvincialCost = 0;
  
  rawData.forEach(item => {
    totalNode.dayAheadVolume += item.dayAheadVolume;
    totalNode.intraDayVolume += item.intraDayVolume;
    totalNode.profitLossDiff += item.profitLossDiff;
    totalDayAheadRevenue += item.dayAheadRevenue;
    totalIntraDayRevenue += item.intraDayRevenue;
    totalIntraProvincialCost += (item.dayAheadVolume + item.intraDayVolume) * item.intraProvincialRealTimePrice;
  });
  
  totalNode.dayAheadPrice = totalNode.dayAheadVolume > 0 ? totalDayAheadRevenue / totalNode.dayAheadVolume : 0;
  totalNode.intraDayPrice = totalNode.intraDayVolume > 0 ? totalIntraDayRevenue / totalNode.intraDayVolume : 0;
  totalNode.intraProvincialPrice = (totalNode.dayAheadVolume + totalNode.intraDayVolume) > 0 
    ? totalIntraProvincialCost / (totalNode.dayAheadVolume + totalNode.intraDayVolume) : 0;
  
  if (dimension === 'date') {
    const grouped = rawData.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {} as Record<string, InterSpotReviewData[]>);
    
    const children: InterTreeNode[] = Object.entries(grouped).map(([date, items]) => {
      let dateDayAheadRevenue = 0;
      let dateIntraDayRevenue = 0;
      let dateIntraProvincialCost = 0;
      
      const dateNode: InterTreeNode = {
        key: date,
        label: date,
        level: 1,
        dayAheadVolume: items.reduce((sum, item) => sum + item.dayAheadVolume, 0),
        intraDayVolume: items.reduce((sum, item) => sum + item.intraDayVolume, 0),
        profitLossDiff: items.reduce((sum, item) => sum + item.profitLossDiff, 0),
        dayAheadPrice: 0,
        intraDayPrice: 0,
        intraProvincialPrice: 0,
      };
      
      items.forEach(item => {
        dateDayAheadRevenue += item.dayAheadRevenue;
        dateIntraDayRevenue += item.intraDayRevenue;
        dateIntraProvincialCost += (item.dayAheadVolume + item.intraDayVolume) * item.intraProvincialRealTimePrice;
      });
      
      dateNode.dayAheadPrice = dateNode.dayAheadVolume > 0 ? dateDayAheadRevenue / dateNode.dayAheadVolume : 0;
      dateNode.intraDayPrice = dateNode.intraDayVolume > 0 ? dateIntraDayRevenue / dateNode.intraDayVolume : 0;
      dateNode.intraProvincialPrice = (dateNode.dayAheadVolume + dateNode.intraDayVolume) > 0 
        ? dateIntraProvincialCost / (dateNode.dayAheadVolume + dateNode.intraDayVolume) : 0;
      
      dateNode.children = items.map(item => ({
        key: `${date}-${item.timePoint}`,
        label: item.timePoint,
        level: 2,
        dayAheadVolume: item.dayAheadVolume,
        dayAheadPrice: item.dayAheadPrice,
        intraDayVolume: item.intraDayVolume,
        intraDayPrice: item.intraDayPrice,
        intraProvincialPrice: item.intraProvincialRealTimePrice,
        profitLossDiff: item.profitLossDiff,
      }));
      
      return dateNode;
    });
    
    totalNode.children = children;
  } else if (dimension === 'tradingUnit') {
    const grouped = rawData.reduce((acc, item) => {
      if (!acc[item.tradingUnit]) acc[item.tradingUnit] = [];
      acc[item.tradingUnit].push(item);
      return acc;
    }, {} as Record<string, InterSpotReviewData[]>);
    
    const children: InterTreeNode[] = Object.entries(grouped).map(([unit, items]) => {
      let unitDayAheadRevenue = 0;
      let unitIntraDayRevenue = 0;
      let unitIntraProvincialCost = 0;
      
      const unitNode: InterTreeNode = {
        key: unit,
        label: unit,
        level: 1,
        dayAheadVolume: items.reduce((sum, item) => sum + item.dayAheadVolume, 0),
        intraDayVolume: items.reduce((sum, item) => sum + item.intraDayVolume, 0),
        profitLossDiff: items.reduce((sum, item) => sum + item.profitLossDiff, 0),
        dayAheadPrice: 0,
        intraDayPrice: 0,
        intraProvincialPrice: 0,
      };
      
      items.forEach(item => {
        unitDayAheadRevenue += item.dayAheadRevenue;
        unitIntraDayRevenue += item.intraDayRevenue;
        unitIntraProvincialCost += (item.dayAheadVolume + item.intraDayVolume) * item.intraProvincialRealTimePrice;
      });
      
      unitNode.dayAheadPrice = unitNode.dayAheadVolume > 0 ? unitDayAheadRevenue / unitNode.dayAheadVolume : 0;
      unitNode.intraDayPrice = unitNode.intraDayVolume > 0 ? unitIntraDayRevenue / unitNode.intraDayVolume : 0;
      unitNode.intraProvincialPrice = (unitNode.dayAheadVolume + unitNode.intraDayVolume) > 0 
        ? unitIntraProvincialCost / (unitNode.dayAheadVolume + unitNode.intraDayVolume) : 0;
      
      const dateGrouped = items.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
      }, {} as Record<string, InterSpotReviewData[]>);
      
      unitNode.children = Object.entries(dateGrouped).map(([date, dateItems]) => {
        let dateDayAheadRevenue = 0;
        let dateIntraDayRevenue = 0;
        let dateIntraProvincialCost = 0;
        
        const dateNode: InterTreeNode = {
          key: `${unit}-${date}`,
          label: date,
          level: 2,
          dayAheadVolume: dateItems.reduce((sum, item) => sum + item.dayAheadVolume, 0),
          intraDayVolume: dateItems.reduce((sum, item) => sum + item.intraDayVolume, 0),
          profitLossDiff: dateItems.reduce((sum, item) => sum + item.profitLossDiff, 0),
          dayAheadPrice: 0,
          intraDayPrice: 0,
          intraProvincialPrice: 0,
        };
        
        dateItems.forEach(item => {
          dateDayAheadRevenue += item.dayAheadRevenue;
          dateIntraDayRevenue += item.intraDayRevenue;
          dateIntraProvincialCost += (item.dayAheadVolume + item.intraDayVolume) * item.intraProvincialRealTimePrice;
        });
        
        dateNode.dayAheadPrice = dateNode.dayAheadVolume > 0 ? dateDayAheadRevenue / dateNode.dayAheadVolume : 0;
        dateNode.intraDayPrice = dateNode.intraDayVolume > 0 ? dateIntraDayRevenue / dateNode.intraDayVolume : 0;
        dateNode.intraProvincialPrice = (dateNode.dayAheadVolume + dateNode.intraDayVolume) > 0 
          ? dateIntraProvincialCost / (dateNode.dayAheadVolume + dateNode.intraDayVolume) : 0;
        
        return dateNode;
      });
      
      return unitNode;
    });
    
    totalNode.children = children;
  }
  
  return [totalNode];
};

const extractChartData = (
  rawData: InterSpotReviewData[],
  selectedKey: string,
  dimension: InterAggregationDimension
) => {
  let filteredData = rawData;
  
  if (dimension === 'date' && selectedKey !== 'all') {
    filteredData = rawData.filter(item => item.date === selectedKey);
  } else if (dimension === 'tradingUnit' && selectedKey !== 'all') {
    filteredData = rawData.filter(item => item.tradingUnit === selectedKey);
  }
  
  const grouped = filteredData.reduce((acc, item) => {
    if (!acc[item.timePoint]) {
      acc[item.timePoint] = {
        timePoint: item.timePoint,
        dayAheadVolume: 0,
        dayAheadPrice: 0,
        dayAheadPriceSum: 0,
        intraDayVolume: 0,
        intraDayPrice: 0,
        intraDayPriceSum: 0,
        intraProvincialPrice: 0,
        intraProvincialPriceSum: 0,
        profitLossDiff: 0,
        count: 0,
      };
    }
    acc[item.timePoint].dayAheadVolume += item.dayAheadVolume;
    acc[item.timePoint].intraDayVolume += item.intraDayVolume;
    acc[item.timePoint].profitLossDiff += item.profitLossDiff;
    acc[item.timePoint].dayAheadPriceSum += item.dayAheadPrice;
    acc[item.timePoint].intraDayPriceSum += item.intraDayPrice;
    acc[item.timePoint].intraProvincialPriceSum += item.intraProvincialRealTimePrice;
    acc[item.timePoint].count += 1;
    return acc;
  }, {} as Record<string, any>);
  
  Object.values(grouped).forEach((item: any) => {
    item.dayAheadPrice = item.dayAheadPriceSum / item.count;
    item.intraDayPrice = item.intraDayPriceSum / item.count;
    item.intraProvincialPrice = item.intraProvincialPriceSum / item.count;
  });
  
  return Object.values(grouped).sort((a: any, b: any) => 
    a.timePoint.localeCompare(b.timePoint)
  );
};

const InterTreeRow = ({ node, isExpanded, onToggle, level = 0 }: {
  node: InterTreeNode;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  level?: number;
}) => {
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <>
      <TableRow className="hover:bg-[#F8FBFA]">
        <TableCell className="text-xs">
          <div style={{ paddingLeft: `${level * 16}px` }} className="flex items-center gap-1">
            {hasChildren && (
              <button onClick={() => onToggle(node.key)} className="p-0.5 hover:bg-[#E8F0EC] rounded">
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            )}
            <span className={cn(node.level === 0 && "font-semibold")}>{node.label}</span>
          </div>
        </TableCell>
        <TableCell className="text-xs text-right font-mono">{node.dayAheadVolume.toFixed(3)}</TableCell>
        <TableCell className="text-xs text-right font-mono">{node.dayAheadPrice.toFixed(2)}</TableCell>
        <TableCell className="text-xs text-right font-mono">{node.intraDayVolume.toFixed(3)}</TableCell>
        <TableCell className="text-xs text-right font-mono">{node.intraDayPrice.toFixed(2)}</TableCell>
        <TableCell className="text-xs text-right font-mono">{node.intraProvincialPrice.toFixed(2)}</TableCell>
        <TableCell className={cn(
          "text-xs text-right font-mono font-semibold",
          node.profitLossDiff > 0 ? "text-[#00B04D]" : "text-red-500"
        )}>
          {node.profitLossDiff > 0 ? '+' : ''}{node.profitLossDiff.toFixed(2)}
        </TableCell>
      </TableRow>
      
      {isExpanded && hasChildren && node.children!.map((child) => (
        <InterTreeRow 
          key={child.key} 
          node={child} 
          isExpanded={isExpanded}
          onToggle={onToggle}
          level={level + 1}
        />
      ))}
    </>
  );
};

const InterProvincialReview = () => {
  const [tradingCenter, setTradingCenter] = useState('all');
  const [selectedUnits, setSelectedUnits] = useState(['全部交易单元']);
  const [granularity, setGranularity] = useState<'24' | '96'>('96');
  const [dimension, setDimension] = useState<InterAggregationDimension>('date');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['total']));
  const [selectedChartKey, setSelectedChartKey] = useState('20240506');
  
  const rawData = useMemo(() => 
    generateInterSpotReviewData('20240501', '20240520', ['交易单元1', '交易单元2'], granularity),
    [granularity]
  );
  
  const treeData = useMemo(() => 
    buildInterTreeData(rawData, dimension),
    [rawData, dimension]
  );
  
  const chartData = useMemo(() => 
    extractChartData(rawData, selectedChartKey, dimension),
    [rawData, selectedChartKey, dimension]
  );
  
  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };
  
  const dimensionOptions = useMemo(() => {
    if (dimension === 'date') {
      return Array.from(new Set(rawData.map(item => item.date)));
    } else if (dimension === 'tradingUnit') {
      return Array.from(new Set(rawData.map(item => item.tradingUnit)));
    }
    return [];
  }, [rawData, dimension]);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={tradingCenter} onValueChange={setTradingCenter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部交易单元</SelectItem>
                <SelectItem value="center1">交易中心1</SelectItem>
                <SelectItem value="center2">交易中心2</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 text-sm">
              <input 
                type="text" 
                value="20240501" 
                className="border border-border rounded px-2 py-1 w-24 text-xs"
                readOnly
              />
              <span>-</span>
              <input 
                type="text" 
                value="20240520" 
                className="border border-border rounded px-2 py-1 w-24 text-xs"
                readOnly
              />
            </div>
            
            <div className="flex items-center gap-2 bg-[#F1F8F4] rounded px-3 py-1">
              <span className="text-sm text-muted-foreground">24</span>
              <span className="text-sm font-bold text-[#00B04D]">96</span>
            </div>
            
            <Button size="sm">查询</Button>
            <Button size="sm" variant="outline">置宽</Button>
            
            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="text-sm font-medium mb-2">聚合维度的选择</div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={dimension === 'tradingUnit' ? 'default' : 'outline'}
                  onClick={() => setDimension('tradingUnit')}
                  className="text-xs"
                >
                  交易单元
                </Button>
                <Button 
                  size="sm" 
                  variant={dimension === 'date' ? 'default' : 'outline'}
                  onClick={() => setDimension('date')}
                  className="text-xs"
                >
                  日期
                </Button>
                <Button 
                  size="sm" 
                  variant={dimension === 'timePoint' ? 'default' : 'outline'}
                  onClick={() => setDimension('timePoint')}
                  className="text-xs"
                >
                  时点
                </Button>
                <Button size="sm" variant="outline" className="text-xs">+</Button>
              </div>
              <Button className="w-full mt-2" size="sm">聚合</Button>
            </CardHeader>
            
            <CardContent>
              <div className="text-xs font-medium mb-2 text-muted-foreground">省间日前/省间日内</div>
              <ScrollArea className="h-[700px]">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                      <TableRow>
                        <TableHead className="text-xs">聚合维度</TableHead>
                        <TableHead className="text-xs text-center border-l" colSpan={2}>省间日前</TableHead>
                        <TableHead className="text-xs text-center border-l" colSpan={2}>省间日内</TableHead>
                        <TableHead className="text-xs text-right border-l">省内实时电价</TableHead>
                        <TableHead className="text-xs text-right border-l">盈亏差额</TableHead>
                      </TableRow>
                      <TableRow className="bg-[#F1F8F4]">
                        <TableHead className="text-xs h-8"></TableHead>
                        <TableHead className="text-xs text-right h-8 border-l">电量</TableHead>
                        <TableHead className="text-xs text-right h-8">电价</TableHead>
                        <TableHead className="text-xs text-right h-8 border-l">电量</TableHead>
                        <TableHead className="text-xs text-right h-8">电价</TableHead>
                        <TableHead className="text-xs text-right h-8 border-l"></TableHead>
                        <TableHead className="text-xs text-right h-8 border-l"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {treeData.map(node => (
                        <InterTreeRow 
                          key={node.key} 
                          node={node} 
                          isExpanded={expandedKeys.has(node.key)}
                          onToggle={toggleExpand}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">全景汇总</CardTitle>
                <Select value={selectedChartKey} onValueChange={setSelectedChartKey}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {dimensionOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">盈亏差额</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis 
                      dataKey="timePoint" 
                      tick={{ fontSize: 11 }}
                      stroke="#666"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      stroke="#666"
                      label={{ value: '盈亏差额 单位：元', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                    />
                    <Tooltip 
                      contentStyle={{ fontSize: 11, backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 4 }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="profitLossDiff" fill="#FFA500" name="盈亏差额" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">电价对比</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis 
                      dataKey="timePoint" 
                      tick={{ fontSize: 11 }}
                      stroke="#666"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      stroke="#666"
                      label={{ value: '电价对比 单位：元/MWh', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                    />
                    <Tooltip 
                      contentStyle={{ fontSize: 11, backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 4 }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line 
                      type="monotone" 
                      dataKey="dayAheadPrice" 
                      stroke="#20B2AA" 
                      strokeWidth={2} 
                      name="省间日前电价"
                      dot={{ r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="intraDayPrice" 
                      stroke="#FF4500" 
                      strokeWidth={2} 
                      name="省间日内电价"
                      dot={{ r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="intraProvincialPrice" 
                      stroke="#FFA500" 
                      strokeWidth={2} 
                      name="省内实时电价"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">省间成交电量</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis 
                      dataKey="timePoint" 
                      tick={{ fontSize: 11 }}
                      stroke="#666"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      stroke="#666"
                      label={{ value: '省间成交电量 单位：MWh', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                    />
                    <Tooltip 
                      contentStyle={{ fontSize: 11, backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 4 }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="dayAheadVolume" fill="#1E90FF" name="省间日前" />
                    <Bar dataKey="intraDayVolume" fill="#FF6B6B" name="省间日内" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const generateInterProvincialData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}日`,
    bidPrice: 350 + Math.random() * 150,
    clearingPrice: 330 + Math.random() * 170,
    bidVolume: 60 + Math.random() * 40,
    clearingVolume: 55 + Math.random() * 45,
    profit: (Math.random() * 50000 - 10000).toFixed(0),
  }));
};

// ============= 主页面组件 =============

const IntraProvincialReview = () => {
  const [rawData] = useState<IntraSpotReviewData[]>(() => generateIntraProvincialData(20));
  const [tradingCenter, setTradingCenter] = useState('all');
  const [dataType, setDataType] = useState('all');
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['场站A', '场站B', '场站C', '场站D']);
  const [dimension, setDimension] = useState<'tradingUnit' | 'date'>('tradingUnit');

  const filteredData = useMemo(() => {
    return rawData.filter(item => selectedUnits.includes(item.tradingUnit));
  }, [rawData, selectedUnits]);

  const stats = useMemo(() => calculateIntraSummary(filteredData), [filteredData]);
  const aggregatedData = useMemo(() => aggregateIntraData(filteredData, dimension), [filteredData, dimension]);

  const stationOverviewData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = {
          date: item.date,
          comprehensiveVolume: 0,
          comprehensivePrice: 0,
          arithmeticAvgPrice: 0,
          revenue: 0,
        };
      }
      acc[item.date].comprehensiveVolume += item.comprehensiveVolume;
      acc[item.date].revenue += item.comprehensiveRevenue;
      acc[item.date].arithmeticAvgPrice += item.arithmeticAvgPrice;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      comprehensivePrice: item.revenue / item.comprehensiveVolume,
      arithmeticAvgPrice: item.arithmeticAvgPrice / selectedUnits.length,
    }));
  }, [filteredData, selectedUnits.length]);

  const volumeAnalysisData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = {
          date: item.date,
          baseVolume: 0,
          mediumLongTermVolume: 0,
          dayAheadClearingVolume: 0,
          realTimeMeasuredVolume: 0,
        };
      }
      acc[item.date].baseVolume += item.baseVolume;
      acc[item.date].mediumLongTermVolume += item.mediumLongTermVolume;
      acc[item.date].dayAheadClearingVolume += item.dayAheadClearingVolume;
      acc[item.date].realTimeMeasuredVolume += item.realTimeMeasuredVolume;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }, [filteredData]);

  const priceAnalysisData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = {
          date: item.date,
          comprehensivePrice: 0,
          mediumLongTermPrice: 0,
          realTimeBuyPrice: 0,
          realTimeSellPrice: 0,
          dayAheadBuyPrice: 0,
          dayAheadSellPrice: 0,
          count: 0,
        };
      }
      acc[item.date].comprehensivePrice += item.comprehensivePrice;
      acc[item.date].mediumLongTermPrice += item.mediumLongTermPrice;
      acc[item.date].realTimeBuyPrice += item.realTimeBuyPrice;
      acc[item.date].realTimeSellPrice += item.realTimeSellPrice;
      acc[item.date].dayAheadBuyPrice += item.dayAheadBuyPrice;
      acc[item.date].dayAheadSellPrice += item.dayAheadSellPrice;
      acc[item.date].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      date: item.date,
      comprehensivePrice: item.comprehensivePrice / item.count,
      mediumLongTermPrice: item.mediumLongTermPrice / item.count,
      realTimeBuyPrice: item.realTimeBuyPrice / item.count,
      realTimeSellPrice: item.realTimeSellPrice / item.count,
      dayAheadBuyPrice: item.dayAheadBuyPrice / item.count,
      dayAheadSellPrice: item.dayAheadSellPrice / item.count,
    }));
  }, [filteredData]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground mb-1 block">交易中心</label>
              <Select value={tradingCenter} onValueChange={setTradingCenter}>
                <SelectTrigger>
                  <SelectValue placeholder="交易中心" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="center1">交易中心1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground mb-1 block">类型</label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="spot">现货</SelectItem>
                  <SelectItem value="medium">中长期</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">交易单元</label>
              <Select 
                value={selectedUnits.join(',')} 
                onValueChange={(val) => setSelectedUnits(val.split(','))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部交易单元" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="场站A,场站B,场站C,场站D">全部交易单元</SelectItem>
                  <SelectItem value="场站A">场站A</SelectItem>
                  <SelectItem value="场站B">场站B</SelectItem>
                  <SelectItem value="场站C">场站C</SelectItem>
                  <SelectItem value="场站D">场站D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">日期范围</label>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                2024-05-01 至 2024-05-20
              </Button>
            </div>

            <Button>查询</Button>
            <Button variant="outline">查置</Button>

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary">微阶数据</Badge>
              <Badge variant="secondary">已返数据</Badge>
              <Button variant="outline" size="sm">切换维度</Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">综合统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">收入</span>
                <span className="text-lg font-bold font-mono text-right">
                  {(stats.totalRevenue / 10000).toFixed(2)}万元
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电量</span>
                <span className="text-sm font-mono text-right">
                  {stats.totalVolume.toFixed(2)} MWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电价</span>
                <span className="text-sm font-mono text-right">
                  {stats.avgPrice.toFixed(2)} 元/MWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">中长期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">收入</span>
                <span className="text-lg font-bold font-mono text-right">
                  {(stats.mediumLongTermRevenue / 10000).toFixed(2)}万元
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电量</span>
                <span className="text-sm font-mono text-right">
                  {stats.mediumLongTermVolume.toFixed(2)} MWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电价</span>
                <span className="text-sm font-mono text-right">
                  {stats.mediumLongTermAvgPrice.toFixed(2)} 元/MWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">现货</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">收入</span>
                <span className="text-lg font-bold font-mono text-right">
                  {(stats.spotRevenue / 10000).toFixed(2)}万元
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电量</span>
                <span className="text-sm font-mono text-right">
                  {stats.spotVolume.toFixed(2)} MWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电价</span>
                <span className="text-sm font-mono text-right">
                  {stats.spotAvgPrice.toFixed(2)} 元/MWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">现货考核</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">考核电费</span>
                <span className="text-lg font-bold font-mono text-right">
                  {(stats.assessmentFee / 10000).toFixed(2)}万元
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">考核电价</span>
                <span className="text-sm font-mono text-right">
                  {stats.assessmentPrice.toFixed(2)} 元/MWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">聚合维度选择</CardTitle>
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant={dimension === 'tradingUnit' ? 'default' : 'outline'}
                onClick={() => setDimension('tradingUnit')}
              >
                交易单元
              </Button>
              <Button 
                size="sm" 
                variant={dimension === 'date' ? 'default' : 'outline'}
                onClick={() => setDimension('date')}
              >
                日期
              </Button>
            </div>
            <Button className="w-full mt-2" size="sm">聚合</Button>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-medium mb-2 text-muted-foreground">全月序类型</div>
            <ScrollArea className="h-[800px]">
              <Table>
                <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                  <TableRow>
                    <TableHead className="text-xs">{dimension === 'tradingUnit' ? '交易单元' : '日期'}</TableHead>
                    <TableHead className="text-xs text-right">综合电量</TableHead>
                    <TableHead className="text-xs text-right">综合电价</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregatedData.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-[#F8FBFA]">
                      <TableCell className="text-xs">
                        {dimension === 'tradingUnit' ? item.tradingUnit : item.date}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {item.comprehensiveVolume.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {item.comprehensivePrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">场站总览</CardTitle>
              <CardDescription className="text-xs">综合电量与电价趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                comprehensiveVolume: { label: "综合电量", color: "hsl(var(--chart-1))" },
                comprehensivePrice: { label: "综合电价", color: "hsl(var(--chart-2))" },
                arithmeticAvgPrice: { label: "算术均价", color: "hsl(var(--chart-3))" },
              }} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={stationOverviewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="comprehensiveVolume" fill="#00B04D" name="综合电量" />
                    <Line yAxisId="right" type="monotone" dataKey="comprehensivePrice" stroke="#00B04D" strokeWidth={2} name="综合电价" />
                    <Line yAxisId="right" type="monotone" dataKey="arithmeticAvgPrice" stroke="#FFA500" strokeWidth={2} strokeDasharray="5 5" name="算术均价" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">电量分析</CardTitle>
              <CardDescription className="text-xs">各类电量构成情况</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                baseVolume: { label: "基数电量", color: "#90EE90" },
                mediumLongTermVolume: { label: "市场化中长期电量", color: "#00D65C" },
                dayAheadClearingVolume: { label: "日前出清电量", color: "#00B04D" },
                realTimeMeasuredVolume: { label: "实时计量电量", color: "#008F3D" },
              }} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="baseVolume" stackId="a" fill="#90EE90" name="基数电量" />
                    <Bar dataKey="mediumLongTermVolume" stackId="a" fill="#00D65C" name="市场化中长期电量" />
                    <Bar dataKey="dayAheadClearingVolume" stackId="a" fill="#00B04D" name="日前出清电量" />
                    <Bar dataKey="realTimeMeasuredVolume" stackId="a" fill="#008F3D" name="实时计量电量" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">电价分析</CardTitle>
              <CardDescription className="text-xs">各类电价变化趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                comprehensivePrice: { label: "综合电价", color: "#00B04D" },
                mediumLongTermPrice: { label: "中长期综合电价", color: "#FFA500" },
                realTimeBuyPrice: { label: "实时买入电价", color: "#1E90FF" },
                realTimeSellPrice: { label: "实时卖出电价", color: "#20B2AA" },
                dayAheadBuyPrice: { label: "日前买入电价", color: "#FF4500" },
                dayAheadSellPrice: { label: "日前卖出电价", color: "#9370DB" },
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="comprehensivePrice" stroke="#00B04D" strokeWidth={2} name="综合电价" />
                    <Line type="monotone" dataKey="mediumLongTermPrice" stroke="#FFA500" strokeWidth={2} name="中长期综合电价" />
                    <Line type="monotone" dataKey="realTimeBuyPrice" stroke="#1E90FF" strokeWidth={2} name="实时买入电价" />
                    <Line type="monotone" dataKey="realTimeSellPrice" stroke="#20B2AA" strokeWidth={2} name="实时卖出电价" />
                    <Line type="monotone" dataKey="dayAheadBuyPrice" stroke="#FF4500" strokeWidth={2} name="日前买入电价" />
                    <Line type="monotone" dataKey="dayAheadSellPrice" stroke="#9370DB" strokeWidth={2} name="日前卖出电价" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Review = () => {
  const [activeTab, setActiveTab] = useState("medium-long-term");

  const interProvincialData = generateInterProvincialData();

  const calculateStats = (data: any[], type: string) => {
    if (type === "inter-provincial") {
      const totalProfit = data.reduce((sum, item) => sum + parseFloat(item.profit), 0);
      const totalClearingVolume = data.reduce((sum, item) => sum + item.clearingVolume, 0);
      const avgPriceDeviation = data.reduce((sum, item) => sum + Math.abs(item.bidPrice - item.clearingPrice), 0) / data.length;
      const clearingRate = (totalClearingVolume / data.reduce((sum, item) => sum + item.bidVolume, 0)) * 100;
      return { totalProfit, totalClearingVolume, avgPriceDeviation, clearingRate };
    }
    return {};
  };

  const interStats = calculateStats(interProvincialData, "inter-provincial");

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">复盘分析</h1>
        <p className="text-muted-foreground mt-2">
          新能源发电交易策略复盘与收益优化
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="medium-long-term">中长期策略复盘</TabsTrigger>
          <TabsTrigger value="intra-provincial">省内现货复盘</TabsTrigger>
          <TabsTrigger value="inter-provincial">省间现货复盘</TabsTrigger>
        </TabsList>

        <TabsContent value="medium-long-term" className="mt-6">
          <MediumLongTermReview />
        </TabsContent>

        <TabsContent value="intra-provincial" className="mt-6">
          <IntraProvincialReview />
        </TabsContent>

        <TabsContent value="inter-provincial" className="mt-6">
          <InterProvincialReview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Review;

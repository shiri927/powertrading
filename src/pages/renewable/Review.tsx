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

const generateIntraProvincialData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}日`,
    predictedPrice: 300 + Math.random() * 200,
    actualPrice: 280 + Math.random() * 220,
    bidVolume: 50 + Math.random() * 30,
    clearingVolume: 45 + Math.random() * 35,
    revenue: 15000 + Math.random() * 10000,
  }));
};

// ============= 省间现货复盘数据 =============

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

const Review = () => {
  const [activeTab, setActiveTab] = useState("medium-long-term");

  const intraProvincialData = generateIntraProvincialData();
  const interProvincialData = generateInterProvincialData();

  // 简化的省内/省间统计
  const calculateStats = (data: any[], type: string) => {
    if (type === "intra-provincial") {
      const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
      const avgPriceDeviation = data.reduce((sum, item) => sum + Math.abs(item.predictedPrice - item.actualPrice), 0) / data.length;
      const totalClearingVolume = data.reduce((sum, item) => sum + item.clearingVolume, 0);
      const clearingRate = (totalClearingVolume / data.reduce((sum, item) => sum + item.bidVolume, 0)) * 100;
      return { totalRevenue, avgPriceDeviation, totalClearingVolume, clearingRate };
    } else {
      const totalProfit = data.reduce((sum, item) => sum + parseFloat(item.profit), 0);
      const totalClearingVolume = data.reduce((sum, item) => sum + item.clearingVolume, 0);
      const avgPriceDeviation = data.reduce((sum, item) => sum + Math.abs(item.bidPrice - item.clearingPrice), 0) / data.length;
      const clearingRate = (totalClearingVolume / data.reduce((sum, item) => sum + item.bidVolume, 0)) * 100;
      return { totalProfit, totalClearingVolume, avgPriceDeviation, clearingRate };
    }
  };

  const intraStats = calculateStats(intraProvincialData, "intra-provincial");
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

        <TabsContent value="intra-provincial" className="mt-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总收益</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  ¥{(intraStats.totalRevenue / 10000).toFixed(2)}万
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">出清率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {intraStats.clearingRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">出清总电量</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {intraStats.totalClearingVolume.toFixed(0)}MWh
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均价差</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {intraStats.avgPriceDeviation.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>省内现货价格对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={intraProvincialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predictedPrice" stroke="#00B04D" name="预测价格" strokeWidth={2} />
                  <Line type="monotone" dataKey="actualPrice" stroke="#FF6B6B" name="实际价格" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>出清电量分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={intraProvincialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bidVolume" fill="#00B04D" name="申报电量" />
                  <Bar dataKey="clearingVolume" fill="#00A86B" name="出清电量" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inter-provincial" className="mt-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总利润</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  ¥{(interStats.totalProfit / 10000).toFixed(2)}万
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">出清率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {interStats.clearingRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">出清总电量</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {interStats.totalClearingVolume.toFixed(0)}MWh
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均价差</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {interStats.avgPriceDeviation.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>省间现货价格对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={interProvincialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bidPrice" stroke="#00B04D" name="申报价格" strokeWidth={2} />
                  <Line type="monotone" dataKey="clearingPrice" stroke="#FF6B6B" name="出清价格" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>出清电量与利润分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={interProvincialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="clearingVolume" fill="#00B04D" name="出清电量" />
                  <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#FF6B6B" name="利润" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Review;

import { useState } from "react";
import { AIForecastTab } from "./decision/AIForecastTab";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Plus, FileText, Calendar as CalendarIcon, TrendingUp, Info, BarChart3, Bell, RefreshCw, Eye, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import PowerPlanTab from "@/pages/retail/base-data/PowerPlanTab";

// 合同分析数据生成
const generateContractData = () => {
  return [
    { id: "C001", name: "2025年度中长期购电合同", tradingCenter: "山西交易中心", tradingUnit: "山东省场站A", type: "年度合同", startDate: "2025-01-01", endDate: "2025-12-31", volume: 50000, avgPrice: 385.5, status: "执行中" },
    { id: "C002", name: "省间现货月度合同", tradingCenter: "国家交易中心", tradingUnit: "山东省场站B", type: "月度合同", startDate: "2025-11-01", endDate: "2025-11-30", volume: 3200, avgPrice: 420.3, status: "执行中" },
    { id: "C003", name: "日滚动交易合同", tradingCenter: "山东交易中心", tradingUnit: "山西省场站A", type: "日滚动", startDate: "2025-11-20", endDate: "2025-11-21", volume: 800, avgPrice: 395.8, status: "已完成" },
    { id: "C004", name: "绿证交易合同", tradingCenter: "绿证交易平台", tradingUnit: "浙江省场站A", type: "绿证", startDate: "2025-11-01", endDate: "2025-12-31", volume: 1000, avgPrice: 50.0, status: "执行中" },
    { id: "C005", name: "省内现货双边合同", tradingCenter: "山西交易中心", tradingUnit: "山西省场站B", type: "现货双边", startDate: "2025-11-15", endDate: "2025-12-15", volume: 4500, avgPrice: 405.2, status: "执行中" },
  ];
};

const generatePositionAnalysisData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    volume: 800 + Math.random() * 400,
    avgPrice: 350 + Math.random() * 100,
    contracts: Math.floor(2 + Math.random() * 3),
    productionForecast: 750 + Math.random() * 450, // 产能预测
    settlementVolume: 600 + Math.random() * 300, // 结算电量
  }));
};

// 待办事项数据
const generateTodoData = () => [
  { id: "T001", title: "月度集中竞价申报", center: "山东交易中心", deadline: "2025-12-02 11:00", priority: "high" as const, status: "pending" as const, countdown: "2天" },
  { id: "T002", title: "省间现货交易确认", center: "国家交易中心", deadline: "2025-12-05 12:00", priority: "high" as const, status: "in-progress" as const, countdown: "5天" },
  { id: "T003", title: "绿电交易方案编制", center: "山西交易中心", deadline: "2025-12-08 17:00", priority: "medium" as const, status: "pending" as const, countdown: "8天" },
  { id: "T004", title: "月内滚动交易申报", center: "浙江交易中心", deadline: "2025-12-10 16:00", priority: "low" as const, status: "pending" as const, countdown: "10天" },
];

// 公告数据
const generateAnnouncementData = () => [
  { id: "A001", title: "关于2025年1月月度集中竞价交易的公告", source: "山东交易中心", time: "2025-11-28 14:30", isRead: false },
  { id: "A002", title: "省间现货交易规则调整通知", source: "国家交易中心", time: "2025-11-27 10:00", isRead: true },
  { id: "A003", title: "绿电交易系统升级公告", source: "山西交易中心", time: "2025-11-26 16:45", isRead: true },
  { id: "A004", title: "2025年年度交易序列发布通知", source: "浙江交易中心", time: "2025-11-25 09:00", isRead: false },
];

const BaseData = () => {
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [analysisParams, setAnalysisParams] = useState({ dimension: "unit", period: "month", dateRange: "2025-11", settlementUnit: "all" });
  
  // 新增状态
  const [newPlanDialogOpen, setNewPlanDialogOpen] = useState(false);
  const [newContractDialogOpen, setNewContractDialogOpen] = useState(false);
  const [newPlanType, setNewPlanType] = useState<"year" | "month">("year");

  // 合同分析数据
  const contractData = generateContractData();
  const positionData = generatePositionAnalysisData();
  const todoData = generateTodoData();
  const announcementData = generateAnnouncementData();
  
  const analysisChartConfig = {
    volume: { label: "持仓电量", color: "#00B04D" },
    avgPrice: { label: "加权均价", color: "#f59e0b" },
  };

  // 交易单元列表
  const tradingUnits = [
    "山东省场站A", "山东省场站B", "山东省场站C", "山东省场站D", "山东省场站E",
    "山西省场站A", "山西省场站B", "山西省场站C", "山西省场站D", "山西省场站E",
    "浙江省场站A", "浙江省场站B", "浙江省场站C", "浙江省场站D", "浙江省场站E"
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">基础数据管理</h1>
        <p className="text-muted-foreground mt-2">
          新能源场站、机组及交易单元基础数据
        </p>
      </div>

      <Tabs defaultValue="trading-calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trading-calendar">交易日历</TabsTrigger>
          <TabsTrigger value="generation-plan">场站发电计划</TabsTrigger>
          <TabsTrigger value="power-prediction">短期功率预测</TabsTrigger>
          <TabsTrigger value="contract-management">合同管理</TabsTrigger>
          <TabsTrigger value="contract-analysis">合同分析</TabsTrigger>
        </TabsList>

        <TabsContent value="generation-plan">
          <PowerPlanTab />
        </TabsContent>

        <TabsContent value="contract-management" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">合约信息</h2>
            <div className="flex gap-2">
              <Button onClick={() => setNewContractDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                新建合同
              </Button>
              <Button variant="outline">合约分析</Button>
              <Button variant="outline">批量删除</Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">合约电量</div>
                <div className="text-2xl font-bold">519279.868 MWh</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">统计电量</div>
                <div className="text-2xl font-bold">451145.868 MWh</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">均价</div>
                <div className="text-2xl font-bold">317.74 元/MWh</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <Select defaultValue="all-units">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="交易单元" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-units">全部交易单元</SelectItem>
                    <SelectItem value="unit1">大山台二期</SelectItem>
                    <SelectItem value="unit2">大山台三期</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all-directions">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="方向" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-directions">全部方向</SelectItem>
                    <SelectItem value="buy">买入</SelectItem>
                    <SelectItem value="sell">卖出</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="合同名称/主体"
                  className="w-[300px]"
                />

                <Button>查询</Button>
                <Button variant="outline">重置</Button>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Table */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox />
                    </TableHead>
                    <TableHead>交易单元</TableHead>
                    <TableHead>方向</TableHead>
                    <TableHead className="min-w-[300px]">合同名称</TableHead>
                    <TableHead>合同类型</TableHead>
                    <TableHead>关联场站</TableHead>
                    <TableHead>执行周期</TableHead>
                    <TableHead>合约电量(MWh)</TableHead>
                    <TableHead>统计电量(MWh)</TableHead>
                    <TableHead>均价(元/MWh)</TableHead>
                    <TableHead>仓位计算</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      unit: "山东省场站A",
                      direction: "卖出",
                      name: "华能山东新能源有限责任公司_2024年山东省场站A年度直接交易用户双边协商电力直接交易（新能源）合同#99",
                      type: "省内",
                      station: "-",
                      period: "20240401-20240430",
                      contract: 4000,
                      stats: 4000,
                      price: 320
                    },
                    {
                      unit: "山东省场站B",
                      direction: "卖出",
                      name: "山东省电能服务有限公司_2024年山东省场站B月度直接交易用户双边协商电力直接交易（新能源）合同#16",
                      type: "省内",
                      station: "-",
                      period: "20240401-20240430",
                      contract: 1500,
                      stats: 1500,
                      price: 312
                    },
                    {
                      unit: "山西省场站A",
                      direction: "卖出",
                      name: "山西华能电有限公司_2024年山西省场站A月度直接交易用户双边协商电力直接交易（新能源）合同#2",
                      type: "省内",
                      station: "-",
                      period: "20240401-20240430",
                      contract: 10000,
                      stats: 10000,
                      price: 288
                    },
                    {
                      unit: "山西省场站B",
                      direction: "卖出",
                      name: "山西华越电子科技有限公司_2024年山西省场站B月度直接交易用户双边协商电力直接交易（新能源）合同#159",
                      type: "省内",
                      station: "-",
                      period: "20240401-20240430",
                      contract: 10000,
                      stats: 10000,
                      price: 332
                    },
                    {
                      unit: "浙江省场站A",
                      direction: "买入",
                      name: "浙江省场站A 2024年4月08日省内交易协议(2024-4-10)合同24",
                      type: "省内",
                      station: "-",
                      period: "20240410-20240410",
                      contract: -21,
                      stats: -21,
                      price: 328.77
                    },
                    {
                      unit: "浙江省场站A",
                      direction: "卖出",
                      name: "浙江省场站A 2024年4月09日省内交易协议(2024-4-11)合同60",
                      type: "省内",
                      station: "-",
                      period: "20240411-20240411",
                      contract: 102.935,
                      stats: 102.935,
                      price: 330.41
                    },
                    {
                      unit: "浙江省场站B",
                      direction: "卖出",
                      name: "浙江省场站B 2024年4月12日省内交易协议(2024-4-14)合同124",
                      type: "省内",
                      station: "-",
                      period: "20240414-20240414",
                      contract: 53.93,
                      stats: 53.93,
                      price: 339.97
                    },
                    {
                      unit: "浙江省场站B",
                      direction: "买入",
                      name: "浙江省场站B 2024年4月16日省内交易协议(2024-4-18)合同6",
                      type: "省内",
                      station: "-",
                      period: "20240418-20240418",
                      contract: -51,
                      stats: -51,
                      price: 48.66
                    },
                    {
                      unit: "山东省场站C",
                      direction: "卖出",
                      name: "山东省场站C 2024年4月21-30日下半分月挂牌分交易（滚动集约）合同143",
                      type: "省内",
                      station: "-",
                      period: "20240421-20240430",
                      contract: 1615.45,
                      stats: 1615.45,
                      price: 255.09
                    },
                    {
                      unit: "山西省场站C",
                      direction: "卖出",
                      name: "山西省场站C发电挂牌2024年4月01日省内挂牌交易",
                      type: "省内",
                      station: "-",
                      period: "20240401-20240401",
                      contract: 849.999,
                      stats: 849.999,
                      price: 311.69
                    },
                  ].map((contract, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>{contract.unit}</TableCell>
                      <TableCell>
                        <Badge variant={contract.direction === "卖出" ? "default" : "secondary"}>
                          {contract.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary cursor-pointer flex-shrink-0" />
                          <span className="truncate">{contract.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{contract.type}</TableCell>
                      <TableCell>{contract.station}</TableCell>
                      <TableCell>{contract.period}</TableCell>
                      <TableCell>{contract.contract}</TableCell>
                      <TableCell>{contract.stats}</TableCell>
                      <TableCell className="font-mono">{contract.price}</TableCell>
                      <TableCell>
                        <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract);
                              setContractDialogOpen(true);
                            }}
                          >
                            详情
                          </Button>
                          <Button variant="ghost" size="sm">编辑</Button>
                          <Button variant="ghost" size="sm">删除</Button>
                          <Button variant="ghost" size="sm">导出</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Contract Detail Dialog */}
          <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  合约详情
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6">
                {/* Left: Contract Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">合约主体</div>
                      <div className="font-medium">{selectedContract?.unit}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">交易方向</div>
                      <Badge variant={selectedContract?.direction === "卖出" ? "default" : "secondary"}>
                        {selectedContract?.direction}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">执行时段</div>
                      <div className="font-medium">{selectedContract?.period}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">仓位计算</div>
                      <Badge>参与</Badge>
                    </div>
                    <div className="col-span-2">
                      <div className="text-muted-foreground mb-1">合同名称</div>
                      <div className="font-medium text-xs break-words">{selectedContract?.name}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">合同类型</div>
                      <div className="font-medium">-/-</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">交易对手</div>
                      <div className="font-medium text-xs">华能山西新能源有限责任公司_晋源2024</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">签订时间</div>
                      <div className="font-medium">20231214</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">关联主合约</div>
                      <div className="font-medium">-</div>
                    </div>
                  </div>
                </div>

                {/* Right: Time Period Tabs and Data */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Tabs defaultValue="24" className="w-full">
                      <TabsList>
                        <TabsTrigger value="24">24</TabsTrigger>
                        <TabsTrigger value="96">96</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div className="flex justify-end text-sm">
                    <div className="space-x-4">
                      <span>合约总电量：<strong>4000MWh</strong></span>
                      <span>统计电价：<strong>320元/MWh</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time-based Data Table */}
              <div className="mt-6 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">日期</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                      {Array.from({ length: 16 }, (_, i) => {
                        const hour = i * 1.5;
                        const minutes = (hour % 1) * 60;
                        const displayHour = Math.floor(hour).toString().padStart(2, '0');
                        const displayMin = minutes.toString().padStart(2, '0');
                        return (
                          <TableHead key={i} className="text-center min-w-[60px]">
                            {displayHour}{displayMin}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 10 }, (_, dayIndex) => {
                      const date = `202404${(dayIndex + 1).toString().padStart(2, '0')}`;
                      return (
                        <>
                          <TableRow key={`${dayIndex}-energy`}>
                            <TableCell rowSpan={2} className="font-medium">{date}</TableCell>
                            <TableCell className="text-muted-foreground">电量</TableCell>
                            {Array.from({ length: 16 }, (_, i) => (
                              <TableCell key={i} className="text-center">1,389</TableCell>
                            ))}
                          </TableRow>
                          <TableRow key={`${dayIndex}-price`}>
                            <TableCell className="text-muted-foreground">电价</TableCell>
                            {Array.from({ length: 16 }, (_, i) => (
                              <TableCell key={i} className="text-center">320</TableCell>
                            ))}
                          </TableRow>
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="contract-analysis" className="space-y-4">
          {/* 分析条件 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">分析条件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>分析维度</Label>
                  <Select value={analysisParams.dimension} onValueChange={(value) => setAnalysisParams({ ...analysisParams, dimension: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit">按交易单元</SelectItem>
                      <SelectItem value="period">按时段</SelectItem>
                      <SelectItem value="contract">按合同类型</SelectItem>
                      <SelectItem value="date">按日期</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>分析周期</Label>
                  <Select value={analysisParams.period} onValueChange={(value) => setAnalysisParams({ ...analysisParams, period: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year">年度仓位</SelectItem>
                      <SelectItem value="month">月度仓位</SelectItem>
                      <SelectItem value="multi-day">多日仓位</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>日期范围</Label>
                  <Input type="month" value={analysisParams.dateRange} onChange={(e) => setAnalysisParams({ ...analysisParams, dateRange: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>结算单元</Label>
                  <Select value={analysisParams.settlementUnit} onValueChange={(value) => setAnalysisParams({ ...analysisParams, settlementUnit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部结算单元</SelectItem>
                      <SelectItem value="shandong-a">山东省场站A</SelectItem>
                      <SelectItem value="shandong-b">山东省场站B</SelectItem>
                      <SelectItem value="shanxi-a">山西省场站A</SelectItem>
                      <SelectItem value="zhejiang-a">浙江省场站A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    分析
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计指标 - 扩展为6个 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">合同总数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{contractData.length}</div>
                <p className="text-xs text-muted-foreground mt-1">活跃合同</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">总持仓电量</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{contractData.reduce((sum, c) => sum + c.volume, 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">加权均价</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {(contractData.reduce((sum, c) => sum + c.avgPrice * c.volume, 0) / contractData.reduce((sum, c) => sum + c.volume, 0)).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">元/MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">覆盖交易单元</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{new Set(contractData.map(c => c.tradingUnit)).size}</div>
                <p className="text-xs text-muted-foreground mt-1">个</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">结算电量</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-primary">{Math.round(positionData.reduce((sum, p) => sum + p.settlementVolume, 0)).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">剩余仓位</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-amber-600">
                  {Math.round(positionData.reduce((sum, p) => sum + p.volume - p.settlementVolume, 0)).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">MWh</p>
              </CardContent>
            </Card>
          </div>

          {/* 仓位分析图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  持仓电量分布
                </CardTitle>
                <CardDescription>24小时分时段持仓电量</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={analysisChartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={positionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="volume" fill="#00B04D" radius={[4, 4, 0, 0]} name="持仓电量" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  持仓均价与产能预测对比
                </CardTitle>
                <CardDescription>24小时分时段加权均价及产能预测</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={analysisChartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={positionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '电价/电量', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="avgPrice" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="加权均价(元/MWh)" />
                      <Line type="monotone" dataKey="productionForecast" stroke="#8884d8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} name="产能预测(MWh)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* 详细数据表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">仓位明细数据</CardTitle>
              <CardDescription>各时段持仓电量、均价及合同数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[400px] overflow-y-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b">
                      <th className="h-10 px-4 text-left align-middle font-semibold text-xs">时段</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-xs">持仓电量 (MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-xs">加权均价 (元/MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-xs">合同数量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positionData.map((row, index) => (
                      <tr key={index} className="border-b transition-colors hover:bg-[#F8FBFA]">
                        <td className="p-4 align-middle font-mono text-xs">{row.hour}</td>
                        <td className="p-4 align-middle text-right font-mono text-xs">{row.volume.toFixed(2)}</td>
                        <td className="p-4 align-middle text-right font-mono text-xs">{row.avgPrice.toFixed(2)}</td>
                        <td className="p-4 align-middle text-right font-mono text-xs">{row.contracts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 短期功率预测 Tab - 使用AI功率预测组件 */}
        <TabsContent value="power-prediction" className="space-y-6">
          <AIForecastTab />
        </TabsContent>

        {/* 交易日历 Tab - 优化布局 */}
        <TabsContent value="trading-calendar" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择交易中心" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部交易中心</SelectItem>
                  <SelectItem value="shandong">山东交易中心</SelectItem>
                  <SelectItem value="shanxi">山西交易中心</SelectItem>
                  <SelectItem value="zhejiang">浙江交易中心</SelectItem>
                  <SelectItem value="national">国家交易中心</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择交易类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="medium-long">中长期交易</SelectItem>
                  <SelectItem value="spot">现货交易</SelectItem>
                  <SelectItem value="green">绿电交易</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(new Date(), "yyyy-MM")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar mode="single" selected={new Date()} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Button>查询</Button>
              <Button variant="outline">重置</Button>
            </div>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              同步数据
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：日历 + 待办事项 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">交易日历</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar mode="single" className="rounded-md border pointer-events-auto" />
                </CardContent>
              </Card>

              {/* 待办事项 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    待办事项
                  </CardTitle>
                  <Badge variant="secondary">{todoData.filter(t => t.status === 'pending').length} 待处理</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {todoData.map((todo) => (
                      <div key={todo.id} className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        todo.status === 'in-progress' && "bg-blue-50 border-blue-200",
                        todo.status === 'pending' && todo.priority === 'high' && "bg-red-50 border-red-200"
                      )}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{todo.title}</span>
                            <Badge variant={todo.priority === 'high' ? 'destructive' : todo.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                              {todo.priority === 'high' ? '紧急' : todo.priority === 'medium' ? '中等' : '普通'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{todo.center}</span>
                            <span>截止：{todo.deadline}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-mono",
                            todo.priority === 'high' ? "text-red-500" : "text-muted-foreground"
                          )}>{todo.countdown}</span>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：交易安排 + 公告 */}
            <div className="space-y-6">
              {/* 最新公告 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    最新公告
                  </CardTitle>
                  <Badge variant="outline">{announcementData.filter(a => !a.isRead).length} 未读</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {announcementData.map((announcement) => (
                      <div key={announcement.id} className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                        !announcement.isRead && "bg-blue-50/50 border-blue-200"
                      )}>
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2",
                          announcement.isRead ? "bg-muted" : "bg-primary"
                        )} />
                        <div className="flex-1">
                          <p className={cn(
                            "text-sm line-clamp-1",
                            !announcement.isRead && "font-medium"
                          )}>{announcement.title}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{announcement.source}</span>
                            <span>{announcement.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 交易安排表 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">本月交易安排</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border max-h-[350px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                        <TableRow>
                          <TableHead>日期</TableHead>
                          <TableHead>交易中心</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>内容</TableHead>
                          <TableHead>时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { date: "2025-12-02", center: "山东交易中心", type: "中长期", content: "月度集中竞价", time: "09:00-11:00" },
                          { date: "2025-12-05", center: "国家交易中心", type: "省间现货", content: "省间电力交易", time: "10:00-12:00" },
                          { date: "2025-12-08", center: "山西交易中心", type: "绿电交易", content: "绿电交易申报", time: "09:00-17:00" },
                          { date: "2025-12-10", center: "浙江交易中心", type: "中长期", content: "月内滚动交易", time: "14:00-16:00" },
                          { date: "2025-12-12", center: "山东交易中心", type: "现货交易", content: "日前现货申报", time: "08:00-10:00" },
                          { date: "2025-12-15", center: "国家交易中心", type: "中长期", content: "年度双边协商", time: "全天" },
                        ].map((item, i) => (
                          <TableRow key={i} className="hover:bg-[#F8FBFA]">
                            <TableCell className="font-mono text-sm">{item.date}</TableCell>
                            <TableCell className="text-sm">{item.center}</TableCell>
                            <TableCell>
                              <Badge variant={
                                item.type === "中长期" ? "default" : 
                                item.type === "现货交易" ? "secondary" : 
                                "outline"
                              } className="text-xs">
                                {item.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{item.content}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{item.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 核电场信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">核电场信息</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* 场站分组 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">场站分组</label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue placeholder="选择场站分组" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">华能一组</SelectItem>
                      <SelectItem value="group2">华能二组</SelectItem>
                      <SelectItem value="group3">华能三组</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 交易统称 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">交易统称</label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue placeholder="选择交易统称" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">统称1</SelectItem>
                      <SelectItem value="name2">统称2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 平均可用电量 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">平均可用电量</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="3.1" className="flex-1" />
                    <span className="text-sm text-muted-foreground">MW</span>
                  </div>
                </div>

                {/* 铭牌电功率 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">铭牌电功率</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="49.5" className="flex-1" />
                    <span className="text-sm text-muted-foreground">kW</span>
                  </div>
                </div>

                {/* 申报场站名称 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">申报场站名称</label>
                  <Input 
                    defaultValue='原阳风电场新能源"南部跨流一体化市场"交易' 
                    placeholder="请输入申报场站名称"
                  />
                </div>

                {/* 场站类型 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">场站类型</label>
                  <Select defaultValue="wind">
                    <SelectTrigger>
                      <SelectValue placeholder="选择场站类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wind">风电</SelectItem>
                      <SelectItem value="solar">光伏</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 交易场站名称 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">交易场站名称</label>
                  <div className="flex items-center gap-2">
                    <Checkbox id="use-station-name" />
                    <Input 
                      defaultValue='南部跨流一体化"南部跨流一体化"方案协调新合作处' 
                      placeholder="请输入交易场站名称"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* 核发电省份 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">核发电省份</label>
                  <Select defaultValue="hebei">
                    <SelectTrigger>
                      <SelectValue placeholder="选择省份" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hebei">廊坊代码区电站 值</SelectItem>
                      <SelectItem value="shandong">山东</SelectItem>
                      <SelectItem value="shanxi">山西</SelectItem>
                      <SelectItem value="zhejiang">浙江</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 场站编码 */}
                <div className="space-y-2 col-span-2">
                  <label className="text-sm text-muted-foreground">场站编码</label>
                  <Input 
                    defaultValue="河南跨流十工程标准化批整理准确对流价值" 
                    placeholder="请输入场站编码"
                  />
                </div>
              </div>
            </div>

            {/* 核电场配置 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">核电场配置</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* 核温 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">核温</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="113.00" className="flex-1" />
                    <span className="text-sm text-muted-foreground">MW</span>
                  </div>
                </div>

                {/* 地址 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">地址</label>
                  <Input placeholder="请输入地址" />
                </div>

                {/* 期望运行/可达性/五道机 组合 */}
                <div className="space-y-2 col-span-2">
                  <label className="text-sm text-muted-foreground">期望运行</label>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="group">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group">集团</SelectItem>
                        <SelectItem value="individual">个人</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <span className="text-sm text-muted-foreground">可达性</span>
                    <Input type="number" className="w-[100px]" />
                    <span className="text-sm text-muted-foreground">年</span>
                    
                    <Select defaultValue="machine5">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="machine5">五道机</SelectItem>
                        <SelectItem value="machine3">三道机</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <span className="text-sm text-muted-foreground">反</span>
                  </div>
                </div>

                {/* 加装年份 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">加装年份</label>
                  <Input placeholder="请输入年份" />
                </div>

                {/* 级别编码 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">级别编码</label>
                  <Input defaultValue="翻越" placeholder="请输入级别编码" />
                </div>
              </div>
            </div>

            {/* 交易配置 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">交易配置</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* 上网时间 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">上网时间</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="250" className="flex-1" />
                    <span className="text-sm text-muted-foreground">元/MW/h</span>
                  </div>
                </div>

                {/* 邮件时钟 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">邮件时钟</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="0.26" className="flex-1" />
                    <span className="text-sm text-muted-foreground">元</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setEditDialogOpen(false)}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 新建发电计划对话框 */}
      <Dialog open={newPlanDialogOpen} onOpenChange={setNewPlanDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新建发电计划</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>计划类型</Label>
                <Select value={newPlanType} onValueChange={(value: "year" | "month") => setNewPlanType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year">年度计划</SelectItem>
                    <SelectItem value="month">月度计划</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>交易单元</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tradingUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{newPlanType === "year" ? "计划年份" : "计划月份"}</Label>
                <Input type={newPlanType === "year" ? "number" : "month"} placeholder={newPlanType === "year" ? "2025" : "2025-01"} />
              </div>
              <div className="space-y-2">
                <Label>计划电量 (MWh)</Label>
                <Input type="number" placeholder="请输入计划电量" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>备注信息</Label>
              <Textarea placeholder="请输入备注信息" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPlanDialogOpen(false)}>取消</Button>
            <Button onClick={() => setNewPlanDialogOpen(false)}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建合同对话框 */}
      <Dialog open={newContractDialogOpen} onOpenChange={setNewContractDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>新建合同</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>合同主体</Label>
                <Input placeholder="请输入合同主体" />
              </div>
              <div className="space-y-2">
                <Label>合同名称</Label>
                <Input placeholder="请输入合同名称" />
              </div>
              <div className="space-y-2">
                <Label>交易方向</Label>
                <Select defaultValue="sell">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">买入</SelectItem>
                    <SelectItem value="sell">卖出</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>合同类型</Label>
                <Select defaultValue="year">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year">年度合同</SelectItem>
                    <SelectItem value="month">月度合同</SelectItem>
                    <SelectItem value="daily">日滚动</SelectItem>
                    <SelectItem value="spot">现货双边</SelectItem>
                    <SelectItem value="green">绿证</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>执行开始时间</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>执行结束时间</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>合同电量 (MWh)</Label>
                <Input type="number" placeholder="请输入合同电量" />
              </div>
              <div className="space-y-2">
                <Label>均价 (元/MWh)</Label>
                <Input type="number" placeholder="请输入均价" />
              </div>
              <div className="space-y-2">
                <Label>关联场站</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无</SelectItem>
                    {tradingUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>仓位计算</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch id="position-calc" defaultChecked />
                  <Label htmlFor="position-calc" className="text-sm text-muted-foreground">参与仓位计算</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewContractDialogOpen(false)}>取消</Button>
            <Button onClick={() => setNewContractDialogOpen(false)}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BaseData;

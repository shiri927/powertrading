import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Plus, FileText, Calendar as CalendarIcon, TrendingUp, AlertCircle, CheckCircle, Clock, Edit, Info, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  }));
};

const BaseData = () => {
  const [selectedYear, setSelectedYear] = useState<Date>(new Date(2024, 0, 1));
  const [compareYear, setCompareYear] = useState<Date>(new Date(2023, 0, 1));
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [analysisParams, setAnalysisParams] = useState({ dimension: "unit", period: "month", dateRange: "2025-11" });

  // 合同分析数据
  const contractData = generateContractData();
  const positionData = generatePositionAnalysisData();
  
  const analysisChartConfig = {
    volume: { label: "持仓电量", color: "#00B04D" },
    avgPrice: { label: "加权均价", color: "#f59e0b" },
  };

  // 统计数据
  const stats = [
    { label: "交易单元总数", value: "155", icon: TrendingUp, color: "text-primary" },
    { label: "计划已完成数", value: "0", percentage: "0%", icon: CheckCircle, color: "text-muted-foreground" },
    { label: "待制定计划数", value: "155", percentage: "100%", icon: Clock, color: "text-warning", highlight: true },
    { label: "待发布计划数", value: "0", percentage: "0%", icon: AlertCircle, color: "text-muted-foreground" },
    { label: "修改待发布计划数", value: "0", percentage: "0%", icon: Edit, color: "text-muted-foreground" },
  ];

  // 交易单元列表
  const tradingUnits = [
    "山东省场站A", "山东省场站B", "山东省场站C", "山东省场站D", "山东省场站E",
    "山西省场站A", "山西省场站B", "山西省场站C", "山西省场站D", "山西省场站E",
    "浙江省场站A", "浙江省场站B", "浙江省场站C", "浙江省场站D", "浙江省场站E"
  ];

  // 图表数据
  const chartData = [
    { name: "天津摇橹", "2024综合绩益预测": 120000, "2023年规则量": 95000, "2023国库日新规划": 85000, "2023金风绩益预测": 110000 },
    { name: "电量竞价年", "2024综合绩益预测": 180000, "2023年规则量": 160000, "2023国库日新规划": 150000, "2023金风绩益预测": 170000 },
    { name: "南城沟一期", "2024综合绩益预测": 280000, "2023年规则量": 250000, "2023国库日新规划": 240000, "2023金风绩益预测": 260000 },
    { name: "攀长花5期", "2024综合绩益预测": 150000, "2023年规则量": 130000, "2023国库日新规划": 120000, "2023金风绩益预测": 140000 },
    { name: "布尔津", "2024综合绩益预测": 220000, "2023年规则量": 200000, "2023国库日新规划": 190000, "2023金风绩益预测": 210000 },
  ];

  // 表格数据
  const tableData = [
    { id: "合计", unit: "合计", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "" },
    { id: "1", unit: "山东省场站A", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "2", unit: "山东省场站B", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "3", unit: "山东省场站C", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "4", unit: "山东省场站D", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "5", unit: "山东省场站E", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "6", unit: "山西省场站A", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "7", unit: "山西省场站B", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "8", unit: "山西省场站C", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "9", unit: "山西省场站D", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "10", unit: "山西省场站E", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "11", unit: "浙江省场站A", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "12", unit: "浙江省场站B", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "13", unit: "浙江省场站C", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">基础数据管理</h1>
        <p className="text-muted-foreground mt-2">
          新能源场站、机组及交易单元基础数据
        </p>
      </div>

      <Tabs defaultValue="generation-plan" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="generation-plan">场站发电计划</TabsTrigger>
          <TabsTrigger value="power-prediction">短期功率预测</TabsTrigger>
          <TabsTrigger value="contract-management">合同管理</TabsTrigger>
          <TabsTrigger value="contract-analysis">合同分析</TabsTrigger>
          <TabsTrigger value="trading-calendar">交易日历</TabsTrigger>
        </TabsList>

        <TabsContent value="generation-plan" className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-5 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className={cn(stat.highlight && "border-warning")}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {stat.label}
                        <AlertCircle className="h-3 w-3" />
                      </p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                        {stat.percentage && (
                          <Badge variant={stat.highlight ? "default" : "secondary"} className="text-xs">
                            {stat.percentage}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* 左侧：筛选和图表 */}
            <div className="space-y-6">
              {/* 筛选条件 */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        {tradingUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select defaultValue="year">
                      <SelectTrigger>
                        <SelectValue placeholder="年计划" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="year">年计划</SelectItem>
                        <SelectItem value="month">月计划</SelectItem>
                      </SelectContent>
                    </Select>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedYear, "yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedYear}
                          onSelect={(date) => date && setSelectedYear(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      2023
                      <button className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <CalendarIcon className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={compareYear}
                          onSelect={(date) => date && setCompareYear(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">查询</Button>
                    <Button variant="outline" className="flex-1">重置</Button>
                  </div>
                </CardContent>
              </Card>

              {/* 图表 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">全省双边单元计划参考图</CardTitle>
                  <p className="text-xs text-muted-foreground">MWh</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="2024综合绩益预测" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="2023年规则量" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="2023国库日新规划" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                      <Line type="monotone" dataKey="2023金风绩益预测" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：数据表格 */}
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新建发电计划
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  操作日志
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">2024年计划合计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">交易单元</TableHead>
                          <TableHead>计划电量</TableHead>
                          <TableHead>经营电量</TableHead>
                          <TableHead>结算电量</TableHead>
                          <TableHead className="w-[60px]">EID</TableHead>
                          <TableHead className="w-[200px]">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">
                              {row.id === "合计" ? (
                                <div className="flex items-center gap-1">
                                  {row.unit}
                                  <span className="text-primary cursor-pointer">🔗</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  {row.unit}
                                  {row.eid && <span className="text-primary cursor-pointer">{row.eid}</span>}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{row.planVolume}</TableCell>
                            <TableCell>{row.operatingVolume}</TableCell>
                            <TableCell>{row.settlementVolume}</TableCell>
                            <TableCell></TableCell>
                            <TableCell>
                              {row.id !== "合计" && (
                                <div className="flex gap-1">
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="h-auto p-0 text-primary"
                                    onClick={() => {
                                      setEditingUnit(row);
                                      setEditDialogOpen(true);
                                    }}
                                  >
                                    编辑
                                  </Button>
                                  <span className="text-muted-foreground">|</span>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground">
                                    发布
                                  </Button>
                                  <span className="text-muted-foreground">|</span>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                                    月度分解对比
                                  </Button>
                                </div>
                              )}
                            </TableCell>
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

        <TabsContent value="contract-management" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">合约信息</h2>
            <div className="flex gap-2">
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
                      <TableCell>{contract.price}</TableCell>
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
                  <Label>&nbsp;</Label>
                  <Button className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    分析
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计指标 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">合同总数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{contractData.length}</div>
                <p className="text-xs text-muted-foreground mt-1">活跃合同数量</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">总持仓电量</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{contractData.reduce((sum, c) => sum + c.volume, 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">加权平均电价</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">
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
                <div className="text-3xl font-bold font-mono">{new Set(contractData.map(c => c.tradingUnit)).size}</div>
                <p className="text-xs text-muted-foreground mt-1">个</p>
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
                      <Bar dataKey="volume" fill="#00B04D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  持仓均价趋势
                </CardTitle>
                <CardDescription>24小时分时段加权平均电价</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={analysisChartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={positionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="avgPrice" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
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

        {/* 短期功率预测 Tab */}
        <TabsContent value="power-prediction" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择交易单元" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部交易单元</SelectItem>
                  {tradingUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(new Date(), "yyyy-MM-dd")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={new Date()} />
                </PopoverContent>
              </Popover>
              <Button>查询</Button>
              <Button variant="outline">重置</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                导出数据
              </Button>
            </div>
          </div>

          {/* 预测准确率指标卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">超短期准确率</p>
                    <p className="text-2xl font-bold text-primary font-mono">94.2%</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">短期准确率</p>
                    <p className="text-2xl font-bold text-primary font-mono">91.8%</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">平均预测偏差</p>
                    <p className="text-2xl font-bold text-warning font-mono">3.6%</p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-warning" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">预测覆盖率</p>
                    <p className="text-2xl font-bold text-primary font-mono">100%</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 功率预测图表 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">短期功率预测曲线</CardTitle>
                  <CardDescription>P10/P50/P90 置信区间与实际出力对比</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">15分钟</Badge>
                  <Badge variant="secondary">1小时</Badge>
                  <Badge variant="secondary">日</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={Array.from({ length: 96 }, (_, i) => {
                  const hour = Math.floor(i / 4);
                  const minute = (i % 4) * 15;
                  const baseValue = 80 + Math.sin(i / 10) * 30 + Math.random() * 10;
                  return {
                    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    p10: Math.max(0, baseValue - 15 - Math.random() * 5),
                    p50: baseValue,
                    p90: baseValue + 15 + Math.random() * 5,
                    actual: baseValue + (Math.random() - 0.5) * 10,
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={11} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 150]} unit=" MW" />
                  <Tooltip 
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: number) => [`${value.toFixed(1)} MW`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="p90" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" name="P90" dot={false} />
                  <Line type="monotone" dataKey="p50" stroke="#00B04D" strokeWidth={2} name="P50预测" dot={false} />
                  <Line type="monotone" dataKey="p10" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" name="P10" dot={false} />
                  <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} name="实际出力" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 预测偏差分析表格 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">预测偏差分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                    <TableRow>
                      <TableHead>时间</TableHead>
                      <TableHead className="text-right">预测功率 (MW)</TableHead>
                      <TableHead className="text-right">实际功率 (MW)</TableHead>
                      <TableHead className="text-right">偏差 (MW)</TableHead>
                      <TableHead className="text-right">偏差率 (%)</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const predicted = 80 + Math.sin(i / 3) * 30;
                      const actual = predicted + (Math.random() - 0.5) * 15;
                      const deviation = actual - predicted;
                      const deviationRate = (deviation / predicted) * 100;
                      return (
                        <TableRow key={i} className="hover:bg-[#F8FBFA]">
                          <TableCell className="font-mono">{`${i.toString().padStart(2, '0')}:00`}</TableCell>
                          <TableCell className="text-right font-mono">{predicted.toFixed(1)}</TableCell>
                          <TableCell className="text-right font-mono">{actual.toFixed(1)}</TableCell>
                          <TableCell className={cn("text-right font-mono", deviation > 0 ? "text-red-500" : "text-green-500")}>
                            {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}
                          </TableCell>
                          <TableCell className={cn("text-right font-mono", Math.abs(deviationRate) > 10 ? "text-red-500" : "text-green-500")}>
                            {deviationRate > 0 ? '+' : ''}{deviationRate.toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <Badge variant={Math.abs(deviationRate) > 10 ? "destructive" : "secondary"}>
                              {Math.abs(deviationRate) > 10 ? "偏差过大" : "正常"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 交易日历 Tab */}
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
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={new Date()} />
                </PopoverContent>
              </Popover>
              <Button>查询</Button>
              <Button variant="outline">重置</Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* 日历视图 */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-base">交易日历</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar mode="single" className="rounded-md border" />
              </CardContent>
            </Card>

            {/* 交易记录列表 */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="text-base">本月交易安排</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead>交易中心</TableHead>
                        <TableHead>交易类型</TableHead>
                        <TableHead>交易内容</TableHead>
                        <TableHead>交易时间</TableHead>
                        <TableHead>执行时段</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { date: "2025-12-02", center: "山东交易中心", type: "中长期", content: "月度集中竞价", time: "09:00-11:00", period: "2025-01" },
                        { date: "2025-12-05", center: "国家交易中心", type: "省间现货", content: "省间电力交易", time: "10:00-12:00", period: "2025-12-06" },
                        { date: "2025-12-08", center: "山西交易中心", type: "绿电交易", content: "绿电交易申报", time: "09:00-17:00", period: "2025-Q1" },
                        { date: "2025-12-10", center: "浙江交易中心", type: "中长期", content: "月内滚动交易", time: "14:00-16:00", period: "2025-12" },
                        { date: "2025-12-12", center: "山东交易中心", type: "现货交易", content: "日前现货申报", time: "08:00-10:00", period: "2025-12-13" },
                        { date: "2025-12-15", center: "国家交易中心", type: "中长期", content: "年度双边协商", time: "全天", period: "2026年" },
                        { date: "2025-12-18", center: "山西交易中心", type: "现货交易", content: "日内滚动交易", time: "每2小时", period: "2025-12-18" },
                        { date: "2025-12-20", center: "浙江交易中心", type: "绿电交易", content: "绿证交易", time: "10:00-15:00", period: "2026-Q1" },
                      ].map((item, i) => (
                        <TableRow key={i} className="hover:bg-[#F8FBFA]">
                          <TableCell className="font-mono">{item.date}</TableCell>
                          <TableCell>{item.center}</TableCell>
                          <TableCell>
                            <Badge variant={
                              item.type === "中长期" ? "default" : 
                              item.type === "现货交易" ? "secondary" : 
                              "outline"
                            }>
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.content}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">{item.time}</TableCell>
                          <TableCell className="font-mono">{item.period}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
};

export default BaseData;

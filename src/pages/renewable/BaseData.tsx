import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Plus, FileText, Calendar as CalendarIcon, TrendingUp, AlertCircle, CheckCircle, Clock, Edit, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const BaseData = () => {
  const [selectedYear, setSelectedYear] = useState<Date>(new Date(2024, 0, 1));
  const [compareYear, setCompareYear] = useState<Date>(new Date(2023, 0, 1));
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

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
    "电量竞价年", "天津摇橹", "全省", "虎跑山", "晨新光伏", "穆家庄", "望狐二一期", "望狐三期", "米嘉峪",
    "全牛", "孟县粤鑫风电场", "锦柏二期", "石哲", "金关树苗", "将军岭"
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
    { id: "1", unit: "天津摇橹", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "2", unit: "全省", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "3", unit: "虎跑山", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "4", unit: "晨新光伏", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "5", unit: "穆家庄", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "6", unit: "望狐二一期", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "7", unit: "望狐三期", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "8", unit: "米嘉峪", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "9", unit: "全牛", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "10", unit: "孟县粤鑫风电场", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "11", unit: "锦柏二期", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "12", unit: "石哲", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
    { id: "13", unit: "金关树苗", planVolume: "-", operatingVolume: "-", settlementVolume: "-", eid: "🔗" },
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generation-plan">场站发电计划</TabsTrigger>
          <TabsTrigger value="contract-management">合同管理</TabsTrigger>
          <TabsTrigger value="contract-analysis">合同分析</TabsTrigger>
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

          {/* 交易单元标签 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">0</Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  电量竞价年
                </Badge>
                {tradingUnits.slice(1).map((unit, index) => (
                  <span key={index} className="text-sm text-muted-foreground">
                    、{unit}
                  </span>
                ))}
                <span className="text-sm text-muted-foreground">...</span>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

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
                                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">
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
                      unit: "大山台二期",
                      direction: "卖出",
                      name: "华能山西新能源有限责任公司_晋源2024年大同平鲁天成风电场2024年年度直接交易用户双边协商电力直接交易（新能源）合同#99",
                      type: "省内",
                      station: "-",
                      period: "20240401-20240430",
                      contract: 4000,
                      stats: 4000,
                      price: 320
                    },
                    {
                      unit: "大山台三期",
                      direction: "卖出",
                      name: "山西省电能服务有限公司_晋源2024年天成平鲁天成风电场2024年4月月度直接交易用户双边协商电力直接交易（新能源）合同#16",
                      type: "省内",
                      station: "-",
                      period: "20240401-20240430",
                      contract: 1500,
                      stats: 1500,
                      price: 312
                    },
                    {
                      unit: "大山台三期",
                      direction: "卖出",
                      name: "山西晋华能电有限公司_晋源2024年天成平鲁天成风电场2024年4月月度直接交易用户双边协商电力直接交易（新能源）合同#2",
                      type: "省内",
                      station: "-",
                      period: "20240401-20240430",
                      contract: 10000,
                      stats: 10000,
                      price: 288
                    },
                    {
                      unit: "大山台三期",
                      direction: "卖出",
                      name: "山西华越电子科技有限公司_晋源2024年天成平鲁天成风电场2024年4月月度直接交易用户双边协商电力直接交易（新能源）合同#159",
                      type: "省内",
                      station: "-",
                      period: "20240401-20240430",
                      contract: 10000,
                      stats: 10000,
                      price: 332
                    },
                    {
                      unit: "大山台三期",
                      direction: "买入",
                      name: "天源平鲁天成风电场2024年4月08日省内交易协议(2024-4-10)合同24",
                      type: "省内",
                      station: "-",
                      period: "20240410-20240410",
                      contract: -21,
                      stats: -21,
                      price: 328.77
                    },
                    {
                      unit: "大山台三期",
                      direction: "卖出",
                      name: "天源平鲁天成风电场2024年4月09日省内交易协议(2024-4-11)合同60",
                      type: "省内",
                      station: "-",
                      period: "20240411-20240411",
                      contract: 102.935,
                      stats: 102.935,
                      price: 330.41
                    },
                    {
                      unit: "大山台三期",
                      direction: "卖出",
                      name: "天源平鲁天成风电场2024年4月12日省内交易协议(2024-4-14)合同124",
                      type: "省内",
                      station: "-",
                      period: "20240414-20240414",
                      contract: 53.93,
                      stats: 53.93,
                      price: 339.97
                    },
                    {
                      unit: "大山台三期",
                      direction: "买入",
                      name: "天源平鲁天成风电场2024年4月16日省内交易协议(2024-4-18)合同6",
                      type: "省内",
                      station: "-",
                      period: "20240418-20240418",
                      contract: -51,
                      stats: -51,
                      price: 48.66
                    },
                    {
                      unit: "大山台三期",
                      direction: "卖出",
                      name: "天源平鲁天成风电场2024年4月21-30日下半分月挂牌分交易（滚动集约）合同143",
                      type: "省内",
                      station: "-",
                      period: "20240421-20240430",
                      contract: 1615.45,
                      stats: 1615.45,
                      price: 255.09
                    },
                    {
                      unit: "大山台三期",
                      direction: "卖出",
                      name: "天源平鲁天成风电场发电挂牌2024年4月01日省内挂牌交易",
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

        <TabsContent value="contract-analysis">
          <Card>
            <CardHeader>
              <CardTitle>合同分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                合同分析功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BaseData;

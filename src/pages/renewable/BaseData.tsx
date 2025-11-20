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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Plus, FileText, Calendar as CalendarIcon, TrendingUp, AlertCircle, CheckCircle, Clock, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const BaseData = () => {
  const [selectedYear, setSelectedYear] = useState<Date>(new Date(2024, 0, 1));
  const [compareYear, setCompareYear] = useState<Date>(new Date(2023, 0, 1));

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

        <TabsContent value="contract-management">
          <Card>
            <CardHeader>
              <CardTitle>合同管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                合同管理功能开发中...
              </div>
            </CardContent>
          </Card>
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

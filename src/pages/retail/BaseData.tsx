import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, Search, TrendingUp, BarChart3, Eye, CalendarIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { cn } from "@/lib/utils";

// 模拟数据生成
const generatePowerPlanMetrics = () => {
  return [
    { label: "交易单元总数", value: "12", unit: "个" },
    { label: "计划已完成", value: "8", subValue: "66.7%", status: "success" },
    { label: "待制定计划", value: "3", subValue: "25.0%", status: "warning" },
    { label: "待发布计划", value: "1", subValue: "8.3%", status: "info" },
  ];
};

const generatePowerPlanData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}月`,
    planned: 8000 + Math.random() * 2000,
    actual: 7500 + Math.random() * 2500,
    completion: 85 + Math.random() * 15,
  }));
};

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

// 交易日历数据
const tradingCalendarData = [{
  date: "20240416",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年04月16日曲线交易(2024-4-18)",
  time: "1000-1600",
  period: "20240418-20240418"
}, {
  date: "20240416",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年04月16日曲线交易(2024-4-19)",
  time: "1000-1600",
  period: "20240419-20240419"
}, {
  date: "20240416",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年04月16日曲线交易(2024-4-20)",
  time: "1000-1600",
  period: "20240420-20240420"
}, {
  date: "20240416",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "发电商2024年4月21-30日『午后高峰调整交易』(现...",
  time: "1300-1500",
  period: "20240421-20240430"
}, {
  date: "20240416",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "发电商2024年4月21-30日『晚间高峰调整交易』(现...",
  time: "1000-1100",
  period: "20240421-20240430"
}, {
  date: "20240418",
  center: "山东电力交易中心",
  type: "交易序列",
  content: "2024年5月挂牌1号曲线交易",
  time: "0900-1100",
  period: "20240501-20240531"
}, {
  date: "20240418",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年5月挂牌1号1天临时组合交易补偿措施(组...",
  time: "0900-1200",
  period: "20240501-20240531"
}, {
  date: "20240424",
  center: "浙江电力交易中心",
  type: "交易序列",
  content: "发电商2024年5月5日晚间高峰组合交易(曲线交易)",
  time: "1300-1500",
  period: "20240501-20240531"
}, {
  date: "20240424",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "发电商2024年5月交易组合高峰时段交易",
  time: "0900-1100",
  period: "20240501-20240531"
}, {
  date: "20240425",
  center: "山东电力交易中心",
  type: "交易序列",
  content: "2024年5月1-10日上午时段组合交易(曲线交易)",
  time: "1000-1600",
  period: "20240501-20240510"
}];

const BaseData = () => {
  const [contractFilter, setContractFilter] = useState({ tradingCenter: "all", tradingUnit: "all", keyword: "" });
  const [analysisParams, setAnalysisParams] = useState({ dimension: "unit", period: "month", dateRange: "2025-11" });
  
  // 交易日历状态
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date(2024, 3, 1));
  const [calendarCenter, setCalendarCenter] = useState("all");
  const [calendarKeyword, setCalendarKeyword] = useState("");
  const [calendarFilterDate, setCalendarFilterDate] = useState<Date | undefined>();
  const [calendarTab, setCalendarTab] = useState("sequence");

  const powerPlanMetrics = generatePowerPlanMetrics();
  const powerPlanData = generatePowerPlanData();
  const contractData = generateContractData();
  const positionData = generatePositionAnalysisData();

  // 筛选交易日历数据
  const filteredCalendarData = useMemo(() => {
    return tradingCalendarData.filter(row => {
      if (calendarCenter !== "all") {
        const centerMap: Record<string, string> = {
          shanxi: "山西电力交易中心",
          shandong: "山东电力交易中心",
          zhejiang: "浙江电力交易中心"
        };
        if (row.center !== centerMap[calendarCenter]) return false;
      }
      if (calendarKeyword && !row.content.toLowerCase().includes(calendarKeyword.toLowerCase())) {
        return false;
      }
      if (calendarFilterDate) {
        const filterDateStr = format(calendarFilterDate, "yyyyMMdd");
        if (row.date !== filterDateStr) return false;
      }
      return true;
    });
  }, [calendarCenter, calendarKeyword, calendarFilterDate]);

  const handleCalendarReset = () => {
    setCalendarCenter("all");
    setCalendarKeyword("");
    setCalendarFilterDate(undefined);
  };

  // 筛选合同数据
  const filteredContracts = contractData.filter(contract => {
    const matchCenter = contractFilter.tradingCenter === "all" || contract.tradingCenter === contractFilter.tradingCenter;
    const matchUnit = contractFilter.tradingUnit === "all" || contract.tradingUnit === contractFilter.tradingUnit;
    const matchKeyword = !contractFilter.keyword || contract.name.includes(contractFilter.keyword) || contract.id.includes(contractFilter.keyword);
    return matchCenter && matchUnit && matchKeyword;
  });

  const chartConfig = {
    planned: { label: "计划电量", color: "#3b82f6" },
    actual: { label: "实际电量", color: "#10b981" },
    volume: { label: "持仓电量", color: "#00B04D" },
    avgPrice: { label: "加权均价", color: "#f59e0b" },
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">基础数据管理</h1>
        <p className="text-muted-foreground mt-2">
          交易日历、电量计划、合同管理及仓位分析
        </p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">交易日历</TabsTrigger>
          <TabsTrigger value="power-plan">电量计划</TabsTrigger>
          <TabsTrigger value="contract">合同管理</TabsTrigger>
          <TabsTrigger value="analysis">合同分析</TabsTrigger>
        </TabsList>

        {/* 交易日历 */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 日历选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">选择日期</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar 
                  mode="single" 
                  selected={calendarDate} 
                  onSelect={setCalendarDate} 
                  className="rounded-md border w-full" 
                />
              </CardContent>
            </Card>

            {/* 筛选条件 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">筛选条件</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      交易中心
                    </label>
                    <Select value={calendarCenter} onValueChange={setCalendarCenter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="shanxi">山西电力交易中心</SelectItem>
                        <SelectItem value="shandong">山东电力交易中心</SelectItem>
                        <SelectItem value="zhejiang">浙江电力交易中心</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      关键字
                    </label>
                    <Input 
                      placeholder="请输入关键字" 
                      value={calendarKeyword} 
                      onChange={e => setCalendarKeyword(e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      日期
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className={cn("w-full justify-start text-left font-normal", !calendarFilterDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {calendarFilterDate ? format(calendarFilterDate, "yyyy-MM-dd") : <span>选择日期</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar 
                          mode="single" 
                          selected={calendarFilterDate} 
                          onSelect={setCalendarFilterDate} 
                          initialFocus 
                          className="pointer-events-auto" 
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-end gap-2">
                    <Button variant="outline" onClick={handleCalendarReset}>重置</Button>
                    <Button>查询</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 交易记录 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Tabs value={calendarTab} onValueChange={setCalendarTab} className="w-full">
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="todo">待办</TabsTrigger>
                      <TabsTrigger value="notice">公告</TabsTrigger>
                      <TabsTrigger value="sequence">序列</TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">批量操作</Button>
                      <Button size="sm">+ 新建</Button>
                    </div>
                  </div>
                  
                  <TabsContent value="sequence" className="mt-4">
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox />
                            </TableHead>
                            <TableHead>日期</TableHead>
                            <TableHead>交易中心</TableHead>
                            <TableHead>类型</TableHead>
                            <TableHead className="min-w-[300px]">内容</TableHead>
                            <TableHead>交易时间</TableHead>
                            <TableHead>执行起止时间</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCalendarData.length > 0 ? filteredCalendarData.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Checkbox />
                              </TableCell>
                              <TableCell className="font-medium">{row.date}</TableCell>
                              <TableCell>{row.center}</TableCell>
                              <TableCell>{row.type}</TableCell>
                              <TableCell className="text-primary hover:underline cursor-pointer">
                                {row.content}
                              </TableCell>
                              <TableCell>{row.time}</TableCell>
                              <TableCell>{row.period}</TableCell>
                            </TableRow>
                          )) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                暂无符合条件的交易记录
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="todo">
                    <div className="text-center py-8 text-muted-foreground">
                      暂无待办事项
                    </div>
                  </TabsContent>

                  <TabsContent value="notice">
                    <div className="text-center py-8 text-muted-foreground">
                      暂无公告信息
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* 电量计划 */}
        <TabsContent value="power-plan" className="space-y-4">
          {/* 指标概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {powerPlanMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono">{metric.value}</span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  {metric.subValue && (
                    <Badge variant={metric.status === "success" ? "default" : metric.status === "warning" ? "secondary" : "outline"} className="mt-2">
                      {metric.subValue}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新建年度计划
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>新建年度电量计划</DialogTitle>
                  <DialogDescription>填写年度电量计划信息</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>交易单元</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择交易单元" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unit-a">山东省场站A</SelectItem>
                          <SelectItem value="unit-b">山东省场站B</SelectItem>
                          <SelectItem value="unit-c">山西省场站A</SelectItem>
                          <SelectItem value="unit-d">浙江省场站A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>计划年份</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择年份" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>计划总电量 (MWh)</Label>
                    <Input type="number" placeholder="输入年度计划总电量" />
                  </div>
                  <div className="space-y-2">
                    <Label>备注</Label>
                    <Textarea placeholder="输入备注信息" rows={3} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">取消</Button>
                  <Button>确认创建</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  新建月度计划
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>新建月度电量计划</DialogTitle>
                  <DialogDescription>填写月度电量计划信息</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>交易单元</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择交易单元" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unit-a">单元A</SelectItem>
                          <SelectItem value="unit-b">单元B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>计划月份</Label>
                      <Input type="month" defaultValue="2025-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>计划电量 (MWh)</Label>
                    <Input type="number" placeholder="输入月度计划电量" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">取消</Button>
                  <Button>确认创建</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 计划完成情况图表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">电量计划完成情况</CardTitle>
              <CardDescription>月度计划电量与实际电量对比</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={powerPlanData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" label={{ value: '电量 (MWh)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: '完成率 (%)', angle: 90, position: 'insideRight' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar yAxisId="left" dataKey="planned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="completion" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 合同管理 */}
        <TabsContent value="contract" className="space-y-4">
          {/* 筛选条件 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">合同检索</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>交易中心</Label>
                  <Select value={contractFilter.tradingCenter} onValueChange={(value) => setContractFilter({ ...contractFilter, tradingCenter: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="山西交易中心">山西交易中心</SelectItem>
                      <SelectItem value="山东交易中心">山东交易中心</SelectItem>
                      <SelectItem value="国家交易中心">国家交易中心</SelectItem>
                      <SelectItem value="绿证交易平台">绿证交易平台</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>交易单元</Label>
                  <Select value={contractFilter.tradingUnit} onValueChange={(value) => setContractFilter({ ...contractFilter, tradingUnit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="山东省场站A">山东省场站A</SelectItem>
                      <SelectItem value="山东省场站B">山东省场站B</SelectItem>
                      <SelectItem value="山西省场站A">山西省场站A</SelectItem>
                      <SelectItem value="山西省场站B">山西省场站B</SelectItem>
                      <SelectItem value="浙江省场站A">浙江省场站A</SelectItem>
                      <SelectItem value="浙江省场站B">浙江省场站B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>关键字</Label>
                  <Input 
                    placeholder="合同名称或编号" 
                    value={contractFilter.keyword}
                    onChange={(e) => setContractFilter({ ...contractFilter, keyword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    查询
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 合同列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>合同列表</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  导入合同
                </Button>
              </CardTitle>
              <CardDescription>共 {filteredContracts.length} 条合同</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[500px] overflow-y-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b">
                      <th className="h-10 px-4 text-left align-middle font-semibold text-xs">合同编号</th>
                      <th className="h-10 px-4 text-left align-middle font-semibold text-xs">合同名称</th>
                      <th className="h-10 px-4 text-left align-middle font-semibold text-xs">交易中心</th>
                      <th className="h-10 px-4 text-left align-middle font-semibold text-xs">交易单元</th>
                      <th className="h-10 px-4 text-left align-middle font-semibold text-xs">合同类型</th>
                      <th className="h-10 px-4 text-left align-middle font-semibold text-xs">执行期间</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-xs">合同电量</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-xs">平均电价</th>
                      <th className="h-10 px-4 text-center align-middle font-semibold text-xs">状态</th>
                      <th className="h-10 px-4 text-center align-middle font-semibold text-xs">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="border-b transition-colors hover:bg-[#F8FBFA]">
                        <td className="p-4 align-middle font-mono text-xs">{contract.id}</td>
                        <td className="p-4 align-middle text-xs">{contract.name}</td>
                        <td className="p-4 align-middle text-xs">{contract.tradingCenter}</td>
                        <td className="p-4 align-middle text-xs">{contract.tradingUnit}</td>
                        <td className="p-4 align-middle text-xs">{contract.type}</td>
                        <td className="p-4 align-middle text-xs font-mono">{contract.startDate} ~ {contract.endDate}</td>
                        <td className="p-4 align-middle text-right font-mono text-xs">{contract.volume.toLocaleString()}</td>
                        <td className="p-4 align-middle text-right font-mono text-xs">{contract.avgPrice.toFixed(2)}</td>
                        <td className="p-4 align-middle text-center">
                          <Badge variant={contract.status === "执行中" ? "default" : "secondary"} className="text-xs">
                            {contract.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>合同详情</DialogTitle>
                                <DialogDescription>{contract.name}</DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-6 py-4">
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-sm border-b pb-2">基础信息</h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">合同编号：</span>
                                      <span className="font-mono">{contract.id}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">交易中心：</span>
                                      <span>{contract.tradingCenter}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">交易单元：</span>
                                      <span>{contract.tradingUnit}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">合同类型：</span>
                                      <span>{contract.type}</span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">执行期间：</span>
                                      <span className="font-mono">{contract.startDate} 至 {contract.endDate}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">合同电量：</span>
                                      <span className="font-mono">{contract.volume.toLocaleString()} MWh</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">平均电价：</span>
                                      <span className="font-mono">{contract.avgPrice.toFixed(2)} 元/MWh</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-sm border-b pb-2">分时量价数据</h4>
                                  <ScrollArea className="h-[250px]">
                                    <table className="w-full text-xs">
                                      <thead className="bg-[#F1F8F4]">
                                        <tr>
                                          <th className="p-2 text-left">时段</th>
                                          <th className="p-2 text-right">电量(MWh)</th>
                                          <th className="p-2 text-right">电价(元/MWh)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Array.from({ length: 24 }, (_, i) => (
                                          <tr key={i} className="border-b hover:bg-[#F8FBFA]">
                                            <td className="p-2 font-mono">{i.toString().padStart(2, '0')}:00</td>
                                            <td className="p-2 text-right font-mono">{(contract.volume / 24).toFixed(0)}</td>
                                            <td className="p-2 text-right font-mono">{(contract.avgPrice + (Math.random() - 0.5) * 50).toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </ScrollArea>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 合同分析 */}
        <TabsContent value="analysis" className="space-y-4">
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
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
      </Tabs>
    </div>
  );
};

export default BaseData;

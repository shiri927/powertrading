import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  TrendingUpIcon,
  Eye,
  Upload,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Loader2
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useState, useMemo, useEffect, useCallback } from "react";
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
  ComposedChart,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useReviewData, ReviewContract, TradingUnitNode, IntraSpotReviewData, SettlementRevenueData, CustomerRevenueData } from "@/hooks/useReviewData";

// ============= 报告管理组件 =============
const analysisReportData = [
  { id: 1, name: "2024年11月交易复盘报告", category: "复盘报告", period: "2024年11月", author: "系统自动生成", status: "已生成", publishDate: "2024-11-28", views: 156, template: "标准月度模板" },
  { id: 2, name: "Q3季度收益分析报告", category: "收益分析", period: "2024年Q3", author: "分析团队", status: "已生成", publishDate: "2024-10-05", views: 203, template: "季度收益模板" },
  { id: 3, name: "2024年10月市场分析报告", category: "市场分析", period: "2024年10月", author: "系统自动生成", status: "已生成", publishDate: "2024-10-31", views: 98, template: "标准月度模板" },
  { id: 4, name: "年度经营总结报告", category: "年度总结", period: "2024年度", author: "业务部", status: "生成中", publishDate: "-", views: 0, template: "年度总结模板" },
  { id: 5, name: "客户收益对账报告", category: "对账报告", period: "2024年11月", author: "系统自动生成", status: "待审核", publishDate: "-", views: 0, template: "客户对账模板" },
];

const reportTemplates = [
  { id: 1, name: "标准月度模板", description: "包含月度交易数据、收益分析、策略评估", type: "月度" },
  { id: 2, name: "季度收益模板", description: "季度收益汇总、环比分析、趋势预测", type: "季度" },
  { id: 3, name: "年度总结模板", description: "年度经营成果、关键指标达成情况", type: "年度" },
  { id: 4, name: "客户对账模板", description: "客户维度收益明细、结算对账", type: "客户" },
];

const ReportManagementTab = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          基于交易结算及复盘分析数据，结合报告模版自动生成报告
        </p>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                上传模板
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>上传报告模板</DialogTitle>
                <DialogDescription>上传自定义报告模板文件（支持 .docx, .xlsx）</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>模板名称</Label>
                  <Input placeholder="请输入模板名称" />
                </div>
                <div className="space-y-2">
                  <Label>模板描述</Label>
                  <Textarea placeholder="请输入模板描述" />
                </div>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">点击或拖拽文件到此处上传</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">取消</Button>
                <Button className="bg-[#00B04D] hover:bg-[#009644]" onClick={() => toast.success("模板上传成功")}>上传</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#00B04D] hover:bg-[#009644]">
                <FileText className="h-4 w-4 mr-2" />
                生成报告
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>生成分析报告</DialogTitle>
                <DialogDescription>选择报告模板和数据范围自动生成报告</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>选择模板</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger><SelectValue placeholder="选择报告模板" /></SelectTrigger>
                    <SelectContent>
                      {reportTemplates.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{t.type}</Badge>
                            {t.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>数据周期</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      2024-11-01
                    </Button>
                    <span className="self-center">至</span>
                    <Button variant="outline" className="flex-1 justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      2024-11-30
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>报告名称</Label>
                  <Input placeholder="请输入报告名称" defaultValue="2024年11月交易复盘报告" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>取消</Button>
                <Button className="bg-[#00B04D] hover:bg-[#009644]" onClick={() => {
                  toast.success("报告生成任务已提交");
                  setIsCreateDialogOpen(false);
                }}>开始生成</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">总报告数</div>
            <div className="text-2xl font-bold text-[#00B04D]">86</div>
            <p className="text-xs text-muted-foreground mt-1">份报告</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">已生成</div>
            <div className="text-2xl font-bold">72</div>
            <p className="text-xs text-muted-foreground mt-1">份报告</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">待审核</div>
            <div className="text-2xl font-bold text-orange-500">8</div>
            <p className="text-xs text-muted-foreground mt-1">份报告</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">模板数量</div>
            <div className="text-2xl font-bold">{reportTemplates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">个模板</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">报告列表</CardTitle>
          <CardDescription>查看和管理自动生成的分析报告</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-[#F1F8F4]">
              <TableRow>
                <TableHead>报告名称</TableHead>
                <TableHead>类别</TableHead>
                <TableHead>使用模板</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>生成日期</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysisReportData.map((report) => (
                <TableRow key={report.id} className="hover:bg-[#F8FBFA]">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {report.name}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{report.category}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{report.template}</TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>
                    <Badge variant={report.status === "已生成" ? "default" : report.status === "生成中" ? "secondary" : "outline"}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{report.publishDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {report.status === "已生成" && (
                        <>
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" />查看</Button>
                          <Button variant="ghost" size="sm"><Download className="h-4 w-4 mr-1" />下载</Button>
                        </>
                      )}
                      {report.status === "待审核" && (
                        <Button variant="ghost" size="sm" className="text-[#00B04D]"><CheckCircle className="h-4 w-4 mr-1" />审核</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ============= 结算收益复盘组件 =============

const SettlementRevenueReview = () => {
  const { 
    settlementRevenue, 
    customerRevenue, 
    isLoading, 
    fetchSettlementRevenueSummary, 
    fetchCustomerRevenue 
  } = useReviewData();
  
  const [periodType, setPeriodType] = useState<"month" | "quarter" | "year">("month");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // 初始加载数据
  useEffect(() => {
    fetchSettlementRevenueSummary(periodType);
    fetchCustomerRevenue();
  }, [periodType, fetchSettlementRevenueSummary, fetchCustomerRevenue]);

  // 设置默认选中的周期
  useEffect(() => {
    if (settlementRevenue.length > 0 && !selectedPeriod) {
      setSelectedPeriod(settlementRevenue[settlementRevenue.length - 1].period);
    }
  }, [settlementRevenue, selectedPeriod]);

  const handleRefresh = () => {
    fetchSettlementRevenueSummary(periodType);
    fetchCustomerRevenue();
    toast.success("数据已刷新");
  };

  const currentPeriodData = useMemo(() => {
    const found = settlementRevenue.find(d => d.period === selectedPeriod);
    return found || {
      period: selectedPeriod,
      totalRevenue: 0,
      wholesaleExpense: 0,
      retailIncome: 0,
      grossProfit: 0,
      profitMargin: 0,
      yearOverYear: 0,
      monthOverMonth: 0,
    };
  }, [settlementRevenue, selectedPeriod]);
  
  const pieData = [
    { name: "中长期交易", value: 45, color: "#00B04D" },
    { name: "现货收入", value: 30, color: "#3b82f6" },
    { name: "偏差回收", value: 15, color: "#FFA500" },
    { name: "其他收入", value: 10, color: "#9370DB" },
  ];

  const weaknessAnalysis = [
    { issue: "10月份偏差考核费用偏高", impact: "-12.5万元", suggestion: "优化预测精度，加强日内调整" },
    { issue: "客户C利润率低于平均水平", impact: "-3.2%", suggestion: "重新协商合同价格或优化采购策略" },
    { issue: "现货市场波动导致采购成本上升", impact: "-8.3万元", suggestion: "增加中长期合约比例，锁定电价" },
  ];

  return (
    <div className="space-y-6">
      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label className="text-xs">统计周期</Label>
              <div className="flex gap-2">
                {[
                  { value: "month", label: "月度" },
                  { value: "quarter", label: "季度" },
                  { value: "year", label: "年度" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={periodType === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPeriodType(option.value as any);
                      setSelectedPeriod("");
                    }}
                    className={cn(periodType === option.value && "bg-[#00B04D] hover:bg-[#00A86B]")}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">选择周期</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="选择周期" /></SelectTrigger>
                <SelectContent>
                  {settlementRevenue.map(d => (
                    <SelectItem key={d.period} value={d.period}>{d.period}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="bg-[#00B04D] hover:bg-[#009644]" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              刷新
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />导出分析报告
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#00B04D]" />总收益
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#00B04D]">
              ¥{(currentPeriodData.grossProfit / 10000).toFixed(2)}万
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-xs flex items-center", currentPeriodData.yearOverYear > 0 ? "text-green-600" : "text-red-500")}>
                {currentPeriodData.yearOverYear > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                同比 {currentPeriodData.yearOverYear.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-red-500" />批发侧支出
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              ¥{(currentPeriodData.wholesaleExpense / 10000).toFixed(2)}万
            </div>
            <p className="text-xs text-muted-foreground mt-1">购电成本</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-[#00B04D]" />零售侧收入
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              ¥{(currentPeriodData.retailIncome / 10000).toFixed(2)}万
            </div>
            <p className="text-xs text-muted-foreground mt-1">售电收入</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-[#00B04D]" />利润率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {currentPeriodData.profitMargin.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-xs flex items-center", currentPeriodData.monthOverMonth > 0 ? "text-green-600" : "text-red-500")}>
                {currentPeriodData.monthOverMonth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                环比 {currentPeriodData.monthOverMonth.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 收入构成饼图 */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-base">收入构成分析</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 收益趋势图 */}
        <Card className="col-span-8">
          <CardHeader>
            <CardTitle className="text-base">收益趋势对比</CardTitle>
            <CardDescription className="text-xs">批发侧支出 vs 零售侧收入 vs 毛利润</CardDescription>
          </CardHeader>
          <CardContent>
            {settlementRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={settlementRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                  <Tooltip formatter={(value: number) => `¥${(value / 10000).toFixed(2)}万`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="wholesaleExpense" fill="#ef4444" name="批发侧支出" opacity={0.7} />
                  <Bar dataKey="retailIncome" fill="#3b82f6" name="零售侧收入" opacity={0.7} />
                  <Line type="monotone" dataKey="grossProfit" stroke="#00B04D" strokeWidth={2} name="毛利润" dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "暂无数据"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 客户维度收益分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">客户维度收益分析</CardTitle>
          <CardDescription className="text-xs">各客户收益贡献及利润率排名</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-[#F1F8F4]">
              <TableRow>
                <TableHead>客户名称</TableHead>
                <TableHead>价格模式</TableHead>
                <TableHead className="text-right">用电量(MWh)</TableHead>
                <TableHead className="text-right">售电收入(元)</TableHead>
                <TableHead className="text-right">购电成本(元)</TableHead>
                <TableHead className="text-right">利润(元)</TableHead>
                <TableHead className="text-right">利润率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerRevenue.length > 0 ? (
                customerRevenue.sort((a, b) => b.profit - a.profit).map((customer, i) => (
                  <TableRow key={customer.customerId || i} className="hover:bg-[#F8FBFA]">
                    <TableCell className="font-medium">{customer.customer}</TableCell>
                    <TableCell><Badge variant="outline">{customer.priceMode}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{customer.volume.toFixed(0)}</TableCell>
                    <TableCell className="text-right font-mono">{customer.revenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{customer.cost.toFixed(2)}</TableCell>
                    <TableCell className={cn("text-right font-mono font-semibold", customer.profit > 0 ? "text-[#00B04D]" : "text-red-500")}>
                      {customer.profit.toFixed(2)}
                    </TableCell>
                    <TableCell className={cn("text-right font-mono", customer.profitMargin > 20 ? "text-[#00B04D]" : customer.profitMargin < 10 ? "text-red-500" : "")}>
                      {customer.profitMargin.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {isLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : "暂无客户数据"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 薄弱环节分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            薄弱环节识别与优化建议
          </CardTitle>
          <CardDescription className="text-xs">基于历史数据分析识别经营薄弱点，提供优化建议</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-[#F1F8F4]">
              <TableRow>
                <TableHead>问题描述</TableHead>
                <TableHead>影响程度</TableHead>
                <TableHead>优化建议</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weaknessAnalysis.map((item, i) => (
                <TableRow key={i} className="hover:bg-[#F8FBFA]">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      {item.issue}
                    </div>
                  </TableCell>
                  <TableCell className="text-red-500 font-mono font-semibold">{item.impact}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.suggestion}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => toast.info("查看详细分析")}>
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ============= 树形选择组件 =============

const TradingUnitTree = ({ nodes, selectedIds, onSelectionChange }: { 
  nodes: TradingUnitNode[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(['1', '2', '3']);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCheckChange = (nodeId: string, checked: boolean) => {
    const node = findNode(nodeId, nodes);
    if (!node) return;
    let newSelectedIds = [...selectedIds];
    const allChildIds = getAllChildIds(node);
    if (checked) newSelectedIds = [...new Set([...newSelectedIds, nodeId, ...allChildIds])];
    else newSelectedIds = newSelectedIds.filter(id => id !== nodeId && !allChildIds.includes(id));
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
        <div className={cn("flex items-center gap-2 py-2 px-2 hover:bg-[#F8FBFA] rounded cursor-pointer", level > 0 && "ml-6")}>
          {hasChildren ? (
            <button onClick={() => toggleExpand(node.id)} className="flex-shrink-0 w-4 h-4">
              {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </button>
          ) : <div className="w-4" />}
          <Checkbox checked={isChecked} onCheckedChange={(checked) => handleCheckChange(node.id, checked as boolean)} className="flex-shrink-0" />
          <span className="text-sm flex-1">{node.name}</span>
          {node.contracts.length > 0 && <Badge variant="secondary" className="text-xs">{node.contracts.length}</Badge>}
        </div>
        {hasChildren && isExpanded && <div>{node.children!.map(child => renderNode(child, level + 1))}</div>}
      </div>
    );
  };

  return <div className="space-y-1">{nodes.map(node => renderNode(node))}</div>;
};

// ============= 详情表格对话框 =============

const PositionDetailDialog = ({ contracts }: { contracts: ReviewContract[] }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2" />查询持仓明细</Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>持仓合同明细</DialogTitle>
          <DialogDescription>共 {contracts.length} 条持仓合同记录</DialogDescription>
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
                <TableHead className="text-right">做交易收益</TableHead>
                <TableHead className="text-right">不做交易收益</TableHead>
                <TableHead className="text-right">收益差额</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => {
                const diff = (contract.revenueWithTrade || 0) - (contract.revenueWithoutTrade || 0);
                return (
                  <TableRow key={contract.id} className="hover:bg-[#F8FBFA]">
                    <TableCell className="font-mono text-xs">{contract.id.substring(0, 8)}</TableCell>
                    <TableCell>{contract.tradingUnit}</TableCell>
                    <TableCell><Badge variant="outline">{contract.contractType}</Badge></TableCell>
                    <TableCell className="font-mono">{contract.startDate}</TableCell>
                    <TableCell className="font-mono">{contract.endDate}</TableCell>
                    <TableCell className="text-right font-mono">{contract.contractVolume.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{contract.contractPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{contract.totalValue.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-[#00B04D]">{(contract.revenueWithTrade || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{(contract.revenueWithoutTrade || 0).toFixed(2)}</TableCell>
                    <TableCell className={cn("text-right font-mono font-semibold", diff > 0 ? "text-[#00B04D]" : "text-red-500")}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// ============= 中长期策略复盘组件 =============

const MediumLongTermReview = () => {
  const { 
    tradingUnitTree, 
    isLoading, 
    fetchTradingUnitTree, 
    generateTimeSeriesFromContracts 
  } = useReviewData();

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [contractType, setContractType] = useState<string>('all');
  const [granularity, setGranularity] = useState<string>('24point');
  const [mergeDisplay, setMergeDisplay] = useState(true);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date('2025-01-01'),
    to: new Date('2025-01-31'),
  });

  // 初始加载
  useEffect(() => {
    fetchTradingUnitTree();
  }, [fetchTradingUnitTree]);

  // 设置默认选中
  useEffect(() => {
    if (tradingUnitTree.length > 0 && selectedUnitIds.length === 0) {
      const allIds: string[] = [];
      tradingUnitTree.forEach(node => {
        allIds.push(node.id);
        node.children?.forEach(child => allIds.push(child.id));
      });
      setSelectedUnitIds(allIds);
    }
  }, [tradingUnitTree, selectedUnitIds.length]);

  const handleRefresh = () => {
    fetchTradingUnitTree();
    toast.success("数据已刷新");
  };

  // 获取选中的合同
  const selectedContracts = useMemo(() => {
    const contracts: ReviewContract[] = [];
    const traverse = (node: TradingUnitNode) => {
      if (selectedUnitIds.includes(node.id)) {
        const filtered = contractType === 'all' 
          ? node.contracts 
          : node.contracts.filter(c => c.contractType === contractType);
        contracts.push(...filtered);
      }
      node.children?.forEach(traverse);
    };
    tradingUnitTree.forEach(traverse);
    return contracts;
  }, [tradingUnitTree, selectedUnitIds, contractType]);

  // 时间序列数据
  const timeSeriesData = useMemo(() => {
    return generateTimeSeriesFromContracts(selectedContracts, granularity as any);
  }, [selectedContracts, granularity, generateTimeSeriesFromContracts]);

  // 统计数据
  const stats = useMemo(() => {
    const totalValue = selectedContracts.reduce((sum, c) => sum + c.totalValue, 0);
    const totalVolume = selectedContracts.reduce((sum, c) => sum + c.contractVolume, 0);
    const avgPrice = totalVolume > 0 ? totalValue / totalVolume : 0;
    const totalRevenueWithTrade = selectedContracts.reduce((sum, c) => sum + (c.revenueWithTrade || 0), 0);
    const totalRevenueWithoutTrade = selectedContracts.reduce((sum, c) => sum + (c.revenueWithoutTrade || 0), 0);
    const revenueDiff = totalRevenueWithTrade - totalRevenueWithoutTrade;
    return { totalValue, totalVolume, avgPrice, totalRevenueWithTrade, totalRevenueWithoutTrade, revenueDiff };
  }, [selectedContracts]);

  return (
    <div className="flex gap-6">
      {/* 左侧持仓总览 */}
      <div className="w-[280px] flex-shrink-0">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">客户/合同总览</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
            <CardDescription className="text-xs">选择客户或合同查看策略分析</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-280px)]">
              {tradingUnitTree.length > 0 ? (
                <TradingUnitTree nodes={tradingUnitTree} selectedIds={selectedUnitIds} onSelectionChange={setSelectedUnitIds} />
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  {isLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : "暂无数据"}
                </div>
              )}
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
                        <>{format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })} - {format(dateRange.to, "yyyy-MM-dd", { locale: zhCN })}</>
                      ) : <span>选择日期范围</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={{ from: dateRange.from, to: dateRange.to }} onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })} locale={zhCN} numberOfMonths={2} className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-[180px]">
                <Label className="text-xs mb-2 block">合同类型</Label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="月度交易">月度交易</SelectItem>
                    <SelectItem value="旬交易">旬交易</SelectItem>
                    <SelectItem value="日滚动交易">日滚动交易</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button><Filter className="w-4 h-4 mr-2" />查询</Button>
              <PositionDetailDialog contracts={selectedContracts} />
              <Button variant="outline"><Download className="w-4 h-4 mr-2" />导出</Button>
            </div>
          </CardContent>
        </Card>

        {/* 统计指标卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#00B04D]" />持仓总电费
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">¥{(stats.totalValue / 10000).toFixed(2)}万</div>
              <p className="text-xs text-muted-foreground mt-1">已选中 {selectedContracts.length} 个合同</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00B04D]" />持仓总电量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{(stats.totalVolume / 1000).toFixed(2)}GWh</div>
              <p className="text-xs text-muted-foreground mt-1">合计 {stats.totalVolume.toFixed(2)} MWh</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-[#00B04D]" />持仓均价
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{stats.avgPrice.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">元/MWh</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#00B04D]/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-[#00B04D]" />策略收益差额
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold font-mono", stats.revenueDiff > 0 ? "text-[#00B04D]" : "text-red-500")}>
                {stats.revenueDiff > 0 ? '+' : ''}¥{(stats.revenueDiff / 10000).toFixed(2)}万
              </div>
              <p className="text-xs text-muted-foreground mt-1">做交易 vs 不做交易</p>
            </CardContent>
          </Card>
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
                    <Button key={option.value} variant={granularity === option.value ? 'default' : 'outline'} size="sm" onClick={() => setGranularity(option.value)}
                      className={cn(granularity === option.value && "bg-[#00B04D] hover:bg-[#00A86B]")}>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">合并展示</Label>
                <Switch checked={mergeDisplay} onCheckedChange={setMergeDisplay} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 策略收益对比图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">策略收益对比分析</CardTitle>
            <CardDescription className="text-xs">对比做该笔交易与不做交易对收入的影响（含电能量电费及回收费用）</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#888" />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#888" label={{ value: '收益 (元)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#3b82f6" label={{ value: '电价 (元/MWh)', angle: 90, position: 'insideRight', style: { fontSize: 12 } }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E8F0EC', borderRadius: '6px' }} formatter={(value: number) => [`¥${value.toFixed(2)}`, '']} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenueWithTrade" fill="#00B04D" name="做交易收益" opacity={0.8} yAxisId="left" />
                <Bar dataKey="revenueWithoutTrade" fill="#9CA3AF" name="不做交易收益" opacity={0.6} yAxisId="left" />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="电价趋势" dot={false} yAxisId="right" />
              </ComposedChart>
            </ResponsiveContainer>
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
                <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#888" />
                <YAxis tick={{ fontSize: 12 }} stroke="#888" label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E8F0EC', borderRadius: '6px' }} formatter={(value: number) => [`${value.toFixed(2)} 元/MWh`, '电价']} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="line" />
                <Line type="monotone" dataKey="price" stroke="#00B04D" strokeWidth={2} dot={{ r: 3, fill: '#00B04D' }} activeDot={{ r: 5 }} name="持仓电价" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ============= 省内现货复盘组件 =============

const IntraProvincialReview = () => {
  const { 
    intraProvincialData, 
    isLoading, 
    fetchIntraProvincialReviewData, 
    calculateIntraSummary 
  } = useReviewData();

  const [tradingCenter, setTradingCenter] = useState('all');
  const [dataType, setDataType] = useState('all');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [dimension, setDimension] = useState<'tradingUnit' | 'date'>('tradingUnit');
  const [dateRange, setDateRange] = useState({
    from: '2024-05-01',
    to: '2024-05-20',
  });

  // 初始加载
  useEffect(() => {
    fetchIntraProvincialReviewData(dateRange.from, dateRange.to);
  }, [fetchIntraProvincialReviewData, dateRange]);

  // 设置默认选中的单元
  useEffect(() => {
    if (intraProvincialData.length > 0 && selectedUnits.length === 0) {
      const units = [...new Set(intraProvincialData.map(d => d.tradingUnit))];
      setSelectedUnits(units);
    }
  }, [intraProvincialData, selectedUnits.length]);

  const handleRefresh = () => {
    fetchIntraProvincialReviewData(dateRange.from, dateRange.to);
    toast.success("数据已刷新");
  };

  const filteredData = useMemo(() => 
    intraProvincialData.filter(item => selectedUnits.includes(item.tradingUnit)), 
    [intraProvincialData, selectedUnits]
  );

  const stats = useMemo(() => calculateIntraSummary(filteredData), [filteredData, calculateIntraSummary]);

  // 聚合数据
  const aggregatedData = useMemo(() => {
    if (dimension === 'tradingUnit') {
      const grouped = filteredData.reduce((acc, item) => {
        if (!acc[item.tradingUnit]) {
          acc[item.tradingUnit] = { tradingUnit: item.tradingUnit, comprehensiveVolume: 0, comprehensivePrice: 0, comprehensiveRevenue: 0, count: 0 };
        }
        acc[item.tradingUnit].comprehensiveVolume += item.comprehensiveVolume;
        acc[item.tradingUnit].comprehensiveRevenue += item.comprehensiveRevenue;
        acc[item.tradingUnit].count += 1;
        return acc;
      }, {} as Record<string, any>);
      return Object.values(grouped).map((item: any) => ({
        ...item,
        comprehensivePrice: item.comprehensiveVolume > 0 ? item.comprehensiveRevenue / item.comprehensiveVolume : 0,
      }));
    } else {
      const grouped = filteredData.reduce((acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = { date: item.date, comprehensiveVolume: 0, comprehensivePrice: 0, comprehensiveRevenue: 0 };
        }
        acc[item.date].comprehensiveVolume += item.comprehensiveVolume;
        acc[item.date].comprehensiveRevenue += item.comprehensiveRevenue;
        return acc;
      }, {} as Record<string, any>);
      return Object.values(grouped).map((item: any) => ({
        ...item,
        comprehensivePrice: item.comprehensiveVolume > 0 ? item.comprehensiveRevenue / item.comprehensiveVolume : 0,
      }));
    }
  }, [filteredData, dimension]);

  const stationOverviewData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = { date: item.date, comprehensiveVolume: 0, comprehensivePrice: 0, revenue: 0, priceSum: 0, count: 0 };
      acc[item.date].comprehensiveVolume += item.comprehensiveVolume;
      acc[item.date].revenue += item.comprehensiveRevenue;
      acc[item.date].priceSum += item.comprehensivePrice;
      acc[item.date].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      comprehensivePrice: item.comprehensiveVolume > 0 ? item.revenue / item.comprehensiveVolume : 0,
      arithmeticAvgPrice: item.count > 0 ? item.priceSum / item.count : 0,
    }));
  }, [filteredData]);

  const volumeAnalysisData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = { date: item.date, mediumLongTermVolume: 0, dayAheadClearingVolume: 0, realTimeMeasuredVolume: 0 };
      acc[item.date].mediumLongTermVolume += item.mediumLongTermVolume;
      acc[item.date].dayAheadClearingVolume += item.dayAheadClearingVolume;
      acc[item.date].realTimeMeasuredVolume += item.realTimeMeasuredVolume;
      return acc;
    }, {} as Record<string, any>);
    return Object.values(grouped);
  }, [filteredData]);

  const priceAnalysisData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = { date: item.date, comprehensivePrice: 0, mediumLongTermPrice: 0, realTimeBuyPrice: 0, realTimeSellPrice: 0, dayAheadBuyPrice: 0, dayAheadSellPrice: 0, count: 0 };
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
      ...item,
      comprehensivePrice: item.count > 0 ? item.comprehensivePrice / item.count : 0,
      mediumLongTermPrice: item.count > 0 ? item.mediumLongTermPrice / item.count : 0,
      realTimeBuyPrice: item.count > 0 ? item.realTimeBuyPrice / item.count : 0,
      realTimeSellPrice: item.count > 0 ? item.realTimeSellPrice / item.count : 0,
      dayAheadBuyPrice: item.count > 0 ? item.dayAheadBuyPrice / item.count : 0,
      dayAheadSellPrice: item.count > 0 ? item.dayAheadSellPrice / item.count : 0,
    }));
  }, [filteredData]);

  const availableUnits = useMemo(() => 
    [...new Set(intraProvincialData.map(d => d.tradingUnit))],
    [intraProvincialData]
  );

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-[140px]">
              <Label className="text-xs mb-2 block">交易中心</Label>
              <Select value={tradingCenter} onValueChange={setTradingCenter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="山东">山东</SelectItem>
                  <SelectItem value="山西">山西</SelectItem>
                  <SelectItem value="浙江">浙江</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <Label className="text-xs mb-2 block">数据类型</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="dayAhead">日前</SelectItem>
                  <SelectItem value="realtime">实时</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs mb-2 block">选择客户</Label>
              <div className="flex flex-wrap gap-2">
                {availableUnits.map(unit => (
                  <Badge key={unit} variant={selectedUnits.includes(unit) ? "default" : "outline"} 
                    className={cn("cursor-pointer", selectedUnits.includes(unit) && "bg-[#00B04D]")}
                    onClick={() => setSelectedUnits(prev => prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit])}>
                    {unit}
                  </Badge>
                ))}
              </div>
            </div>
            <Button className="bg-[#00B04D] hover:bg-[#009644]" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              查询
            </Button>
            <Button variant="outline"><Download className="w-4 h-4 mr-2" />导出</Button>
          </div>
        </CardContent>
      </Card>

      {/* 汇总统计卡片 */}
      <div className="grid grid-cols-6 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">综合</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">总收入</span>
                <span className="text-lg font-bold font-mono text-right text-[#00B04D]">{(stats.totalRevenue / 10000).toFixed(2)}万元</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">总电量</span>
                <span className="text-sm font-mono text-right">{(stats.totalVolume / 1000).toFixed(2)} GWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">均价</span>
                <span className="text-sm font-mono text-right">{stats.avgPrice.toFixed(2)} 元/MWh</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">中长期</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">收入</span>
                <span className="text-lg font-bold font-mono text-right">{(stats.mediumLongTermRevenue / 10000).toFixed(2)}万元</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电量</span>
                <span className="text-sm font-mono text-right">{(stats.mediumLongTermVolume / 1000).toFixed(2)} GWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">均价</span>
                <span className="text-sm font-mono text-right">{stats.mediumLongTermAvgPrice.toFixed(2)} 元/MWh</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">现货</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">收入</span>
                <span className="text-lg font-bold font-mono text-right">{(stats.spotRevenue / 10000).toFixed(2)}万元</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">电量</span>
                <span className="text-sm font-mono text-right">{(stats.spotVolume / 1000).toFixed(2)} GWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">均价</span>
                <span className="text-sm font-mono text-right">{stats.spotAvgPrice.toFixed(2)} 元/MWh</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">考核费用</CardTitle></CardHeader>
          <CardContent>
            <div className="text-lg font-bold font-mono text-orange-500">{(stats.assessmentFee / 10000).toFixed(2)}万元</div>
            <p className="text-xs text-muted-foreground">单位电价: {stats.assessmentPrice.toFixed(2)} 元/MWh</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">偏差回收</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">回收费用</span>
                <span className="text-lg font-bold font-mono text-right text-orange-500">{(stats.assessmentFee / 10000).toFixed(2)}万元</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">单位电价</span>
                <span className="text-sm font-mono text-right">{stats.assessmentPrice.toFixed(2)} 元/MWh</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">市场表现</CardTitle></CardHeader>
          <CardContent>
            <div className="text-lg font-bold font-mono text-[#00B04D]">
              {stats.totalRevenue > 0 ? '+' : ''}{((stats.totalRevenue - stats.assessmentFee) / 10000).toFixed(2)}万元
            </div>
            <p className="text-xs text-muted-foreground">净收益</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">客户列表</CardTitle>
            <CardDescription className="text-xs">选择客户查看详情</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex gap-2">
              <Button size="sm" variant={dimension === 'tradingUnit' ? 'default' : 'outline'} 
                onClick={() => setDimension('tradingUnit')}
                className={cn(dimension === 'tradingUnit' && "bg-[#00B04D] hover:bg-[#00A86B]")}>
                按客户
              </Button>
              <Button size="sm" variant={dimension === 'date' ? 'default' : 'outline'} 
                onClick={() => setDimension('date')}
                className={cn(dimension === 'date' && "bg-[#00B04D] hover:bg-[#00A86B]")}>
                按日期
              </Button>
            </div>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
                  <TableRow>
                    <TableHead className="text-xs">{dimension === 'tradingUnit' ? '客户' : '日期'}</TableHead>
                    <TableHead className="text-xs text-right">电量</TableHead>
                    <TableHead className="text-xs text-right">电价</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregatedData.length > 0 ? (
                    aggregatedData.map((item: any, index) => (
                      <TableRow key={index} className="hover:bg-[#F8FBFA] cursor-pointer">
                        <TableCell className="text-xs font-medium">{dimension === 'tradingUnit' ? item.tradingUnit : item.date}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{item.comprehensiveVolume.toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{item.comprehensivePrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        {isLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : "暂无数据"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="col-span-9 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">客户总览</CardTitle>
              <CardDescription className="text-xs">综合电量与电价趋势（用于优化报价策略）</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ comprehensiveVolume: { label: "综合电量", color: "hsl(var(--chart-1))" }, comprehensivePrice: { label: "综合电价", color: "hsl(var(--chart-2))" }, arithmeticAvgPrice: { label: "算术均价", color: "hsl(var(--chart-3))" } }} className="h-[250px]">
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
              <CardDescription className="text-xs">各类电量构成（中长期、现货市场量价费及偏差回收）</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ mediumLongTermVolume: { label: "中长期电量", color: "#00D65C" }, dayAheadClearingVolume: { label: "日前出清电量", color: "#00B04D" }, realTimeMeasuredVolume: { label: "实时计量电量", color: "#008F3D" } }} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="mediumLongTermVolume" stackId="a" fill="#00D65C" name="中长期电量" />
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
              <CardDescription className="text-xs">各类电价变化趋势（从收益、电量、电价三个维度分析）</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ comprehensivePrice: { label: "综合电价", color: "#00B04D" }, mediumLongTermPrice: { label: "中长期电价", color: "#FFA500" }, realTimeBuyPrice: { label: "实时买入电价", color: "#1E90FF" }, realTimeSellPrice: { label: "实时卖出电价", color: "#20B2AA" }, dayAheadBuyPrice: { label: "日前买入电价", color: "#FF4500" }, dayAheadSellPrice: { label: "日前卖出电价", color: "#9370DB" } }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="comprehensivePrice" stroke="#00B04D" strokeWidth={2} name="综合电价" />
                    <Line type="monotone" dataKey="mediumLongTermPrice" stroke="#FFA500" strokeWidth={2} name="中长期电价" />
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

// ============= 主页面组件 =============

const Review = () => {
  const [activeTab, setActiveTab] = useState("medium-long-term");

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">复盘分析</h1>
        <p className="text-muted-foreground mt-2">售电业务交易策略复盘与收益优化分析</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="medium-long-term" className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white">中长期策略复盘</TabsTrigger>
          <TabsTrigger value="intra-provincial" className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white">省内现货复盘</TabsTrigger>
          <TabsTrigger value="settlement-revenue" className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white">结算收益复盘</TabsTrigger>
          <TabsTrigger value="report-management" className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white">报告管理</TabsTrigger>
        </TabsList>

        <TabsContent value="medium-long-term" className="mt-6"><MediumLongTermReview /></TabsContent>
        <TabsContent value="intra-provincial" className="mt-6"><IntraProvincialReview /></TabsContent>
        <TabsContent value="settlement-revenue" className="mt-6"><SettlementRevenueReview /></TabsContent>
        <TabsContent value="report-management" className="mt-6"><ReportManagementTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Review;

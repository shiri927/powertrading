import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarIcon, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

// 用户分月明细数据
const userMonthlyData: Record<string, { month: string; 用电量: number; 收入: number }[]> = {
  "用户A": [
    { month: "1月", 用电量: 205, 收入: 82 },
    { month: "2月", 用电量: 198, 收入: 78 },
    { month: "3月", 用电量: 218, 收入: 87 },
    { month: "4月", 用电量: 210, 收入: 84 },
    { month: "5月", 用电量: 225, 收入: 90 },
    { month: "6月", 用电量: 194, 收入: 64 },
  ],
  "用户B": [
    { month: "1月", 用电量: 158, 收入: 62 },
    { month: "2月", 用电量: 162, 收入: 64 },
    { month: "3月", 用电量: 172, 收入: 68 },
    { month: "4月", 用电量: 165, 收入: 65 },
    { month: "5月", 用电量: 178, 收入: 70 },
    { month: "6月", 用电量: 145, 收入: 49 },
  ],
  "用户C": [
    { month: "1月", 用电量: 268, 收入: 105 },
    { month: "2月", 用电量: 255, 收入: 100 },
    { month: "3月", 用电量: 275, 收入: 108 },
    { month: "4月", 用电量: 262, 收入: 103 },
    { month: "5月", 用电量: 285, 收入: 112 },
    { month: "6月", 用电量: 235, 收入: 84 },
  ],
  "用户D": [
    { month: "1月", 用电量: 118, 收入: 46 },
    { month: "2月", 用电量: 122, 收入: 48 },
    { month: "3月", 用电量: 128, 收入: 50 },
    { month: "4月", 用电量: 120, 收入: 47 },
    { month: "5月", 用电量: 132, 收入: 52 },
    { month: "6月", 用电量: 100, 收入: 39 },
  ],
  "用户E": [
    { month: "1月", 用电量: 185, 收入: 72 },
    { month: "2月", 用电量: 178, 收入: 70 },
    { month: "3月", 用电量: 192, 收入: 75 },
    { month: "4月", 用电量: 188, 收入: 74 },
    { month: "5月", 用电量: 198, 收入: 78 },
    { month: "6月", 用电量: 179, 收入: 66 },
  ],
};

// 用户收益数据
const userRevenue = [
  { name: "用户A", 用电量: 1250, 收入: 485, 套餐: "套餐1" },
  { name: "用户B", 用电量: 980, 收入: 378, 套餐: "套餐2" },
  { name: "用户C", 用电量: 1580, 收入: 612, 套餐: "套餐1" },
  { name: "用户D", 用电量: 720, 收入: 282, 套餐: "套餐3" },
  { name: "用户E", 用电量: 1120, 收入: 435, 套餐: "套餐2" },
];

// 套餐收益分布
const packageRevenue = [
  { name: "套餐1", value: 1097, users: 5, color: "hsl(var(--chart-1))" },
  { name: "套餐2", value: 813, users: 3, color: "hsl(var(--chart-2))" },
  { name: "套餐3", value: 282, users: 2, color: "hsl(var(--chart-3))" },
];

// 月度收益趋势
const monthlyRevenue = [
  { month: "1月", 收入: 1850, 用电量: 4820 },
  { month: "2月", 收入: 1720, 用电量: 4580 },
  { month: "3月", 收入: 1920, 用电量: 5120 },
  { month: "4月", 收入: 1880, 用电量: 4950 },
  { month: "5月", 收入: 2050, 用电量: 5380 },
  { month: "6月", 收入: 2192, 用电量: 5650 },
];

const allMonths = ["1月", "2月", "3月", "4月", "5月", "6月"];

const Retail = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 5, 30),
  });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalRevenue = packageRevenue.reduce((sum, item) => sum + item.value, 0);

  // 计算选中月份范围
  const selectedMonths = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return allMonths;
    const months: string[] = [];
    const interval = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    interval.forEach((date) => {
      const monthIndex = date.getMonth();
      if (monthIndex < 6) {
        months.push(`${monthIndex + 1}月`);
      }
    });
    return months.length > 0 ? months : allMonths;
  }, [dateRange]);

  const isMultiMonth = selectedMonths.length > 1;

  // 过滤用户数据
  const filteredUserData = useMemo(() => {
    return userRevenue.map(user => {
      const monthlyData = userMonthlyData[user.name] || [];
      const filteredMonths = monthlyData.filter(m => selectedMonths.includes(m.month));
      const total用电量 = filteredMonths.reduce((sum, m) => sum + m.用电量, 0);
      const total收入 = filteredMonths.reduce((sum, m) => sum + m.收入, 0);
      return {
        ...user,
        用电量: total用电量,
        收入: total收入,
      };
    });
  }, [selectedMonths]);

  // 用户分月明细弹窗数据
  const userDetailData = useMemo(() => {
    if (!selectedUser) return [];
    const data = userMonthlyData[selectedUser] || [];
    return data.filter(m => selectedMonths.includes(m.month));
  }, [selectedUser, selectedMonths]);

  // 计算饼图数据
  const pieChartData = useMemo(() => {
    return filteredUserData.map((user, idx) => ({
      name: user.name,
      value: user.收入,
      color: `hsl(var(--chart-${(idx % 5) + 1}))`,
    }));
  }, [filteredUserData]);

  const totalFilteredRevenue = pieChartData.reduce((sum, item) => sum + item.value, 0);

  const handleUserClick = (userName: string) => {
    setSelectedUser(userName);
    setDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">售电侧收益分析</h1>
          <p className="text-muted-foreground mt-2">
            按用户和套餐维度的收益分析，支持分月明细查看
          </p>
        </div>

        {/* 日期范围选择器 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "yyyy/MM/dd", { locale: zhCN })} -{" "}
                    {format(dateRange.to, "yyyy/MM/dd", { locale: zhCN })}
                  </>
                ) : (
                  format(dateRange.from, "yyyy/MM/dd", { locale: zhCN })
                )
              ) : (
                <span>选择日期范围</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* 收益概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总收入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">
              ¥{(totalFilteredRevenue / 100).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isMultiMonth ? `${selectedMonths[0]} - ${selectedMonths[selectedMonths.length - 1]}` : selectedMonths[0] || "年累计"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">服务用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{userRevenue.length}</div>
            <p className="text-xs text-muted-foreground mt-1">活跃用户</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">平均收入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              ¥{(totalFilteredRevenue / userRevenue.length).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">每户均值</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">套餐类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{packageRevenue.length}</div>
            <p className="text-xs text-muted-foreground mt-1">在售套餐</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">按用户分析</TabsTrigger>
          <TabsTrigger value="package">按套餐分析</TabsTrigger>
          <TabsTrigger value="monthly">月度趋势</TabsTrigger>
        </TabsList>

        {/* 按用户分析 */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>用户收益分析</CardTitle>
              <CardDescription>
                {isMultiMonth 
                  ? `饼图显示${selectedMonths[0]}至${selectedMonths[selectedMonths.length - 1]}合计数据，点击用户查看分月明细`
                  : `显示${selectedMonths[0] || "全部月份"}数据，点击用户查看分月明细`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* 饼图 */}
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${((entry.value / totalFilteredRevenue) * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `¥${value}K`} />
                  </PieChart>
                </ResponsiveContainer>

                {/* 用户列表 - 可点击 */}
                <div className="space-y-3">
                  {filteredUserData.map((user, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleUserClick(user.name)}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-[#F8FBFA] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {user.name}
                            <Eye className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-sm text-muted-foreground">{user.套餐}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success font-mono">¥{user.收入}K</div>
                        <div className="text-sm text-muted-foreground font-mono">{user.用电量} MWh</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 按套餐分析 */}
        <TabsContent value="package">
          <Card>
            <CardHeader>
              <CardTitle>套餐收益分布</CardTitle>
              <CardDescription>
                不同套餐类型的收益贡献
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={packageRevenue}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${((entry.value / totalRevenue) * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {packageRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {packageRevenue.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.users} 户
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success font-mono">
                          ¥{item.value}K
                        </div>
                        <Badge variant="outline">
                          {((item.value / totalRevenue) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 月度趋势 */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>月度收益趋势</CardTitle>
              <CardDescription>
                月度收入与用电量变化趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: '收入 (万元)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    label={{ value: '用电量 (MWh)', angle: 90, position: 'insideRight' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="收入" fill="hsl(var(--chart-1))" name="收入" />
                  <Bar yAxisId="right" dataKey="用电量" fill="hsl(var(--chart-2))" name="用电量" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 用户分月明细弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedUser} - 分月收益明细</DialogTitle>
            <DialogDescription>
              {isMultiMonth 
                ? `${selectedMonths[0]} 至 ${selectedMonths[selectedMonths.length - 1]} 收入详情`
                : `${selectedMonths[0] || "全部月份"} 收入详情`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F1F8F4]">
                  <TableHead className="font-semibold">字段</TableHead>
                  {selectedMonths.map((month) => (
                    <TableHead key={month} className="text-center font-mono">{month}</TableHead>
                  ))}
                  {isMultiMonth && <TableHead className="text-center font-semibold">合计</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-[#F8FBFA]">
                  <TableCell className="font-medium">用户名称</TableCell>
                  {selectedMonths.map((month) => (
                    <TableCell key={month} className="text-center">{selectedUser}</TableCell>
                  ))}
                  {isMultiMonth && <TableCell className="text-center">-</TableCell>}
                </TableRow>
                <TableRow className="hover:bg-[#F8FBFA]">
                  <TableCell className="font-medium">用电量 (MWh)</TableCell>
                  {selectedMonths.map((month) => {
                    const data = userDetailData.find(d => d.month === month);
                    return (
                      <TableCell key={month} className="text-center font-mono">
                        {data?.用电量 || 0}
                      </TableCell>
                    );
                  })}
                  {isMultiMonth && (
                    <TableCell className="text-center font-mono font-semibold">
                      {userDetailData.reduce((sum, d) => sum + d.用电量, 0)}
                    </TableCell>
                  )}
                </TableRow>
                <TableRow className="hover:bg-[#F8FBFA]">
                  <TableCell className="font-medium">收入 (万元)</TableCell>
                  {selectedMonths.map((month) => {
                    const data = userDetailData.find(d => d.month === month);
                    return (
                      <TableCell key={month} className="text-center font-mono text-success">
                        {data?.收入 || 0}
                      </TableCell>
                    );
                  })}
                  {isMultiMonth && (
                    <TableCell className="text-center font-mono font-semibold text-success">
                      {userDetailData.reduce((sum, d) => sum + d.收入, 0)}
                    </TableCell>
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Retail;

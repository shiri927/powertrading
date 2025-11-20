import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, AlertCircle, Download, RefreshCw, Search } from "lucide-react";
import { Customer, ExecutionRecord, CustomerSummary, generateCustomers, generateExecutionRecords, generateCustomerSummary } from "@/lib/retail-data";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ExecutionTracking = () => {
  const [customers] = useState<Customer[]>(() => generateCustomers(50));
  const [executionRecords] = useState<ExecutionRecord[]>(() => generateExecutionRecords(customers, 30));
  const [customerSummary] = useState<CustomerSummary[]>(() => generateCustomerSummary(customers, executionRecords));
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 统计数据
  const stats = useMemo(() => {
    const totalVolume = executionRecords.reduce((sum, r) => sum + r.executedVolume, 0);
    const totalRevenue = executionRecords.reduce((sum, r) => sum + r.executedRevenue, 0);
    const avgDeviation = executionRecords.length > 0 
      ? Math.abs(executionRecords.reduce((sum, r) => sum + r.volumeDeviationRate, 0) / executionRecords.length)
      : 0;
    const completedRecords = executionRecords.filter(r => r.status === 'completed').length;
    const executionRate = executionRecords.length > 0 ? (completedRecords / executionRecords.length * 100) : 0;
    const anomalyCount = executionRecords.filter(r => r.status === 'anomaly').length;

    return {
      totalVolume: Math.round(totalVolume * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgDeviation: Math.round(avgDeviation * 100) / 100,
      executionRate: Math.round(executionRate * 100) / 100,
      anomalyCount
    };
  }, [executionRecords]);

  const filteredRecords = useMemo(() => {
    return executionRecords.filter(record => {
      const matchesSearch = record.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [executionRecords, searchTerm, statusFilter]);

  const getStatusBadge = (status: ExecutionRecord['status']) => {
    const configs = {
      executing: { label: "执行中", className: "bg-blue-500 hover:bg-blue-600 text-white" },
      completed: { label: "已完成", className: "bg-[#00B04D] hover:bg-[#009644] text-white" },
      anomaly: { label: "异常", className: "bg-red-500 hover:bg-red-600 text-white" }
    };
    const config = configs[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // 执行趋势数据
  const trendData = useMemo(() => {
    const dataByDate = new Map<string, { volume: number, revenue: number }>();
    
    executionRecords.forEach(r => {
      const existing = dataByDate.get(r.executionDate) || { volume: 0, revenue: 0 };
      dataByDate.set(r.executionDate, {
        volume: existing.volume + r.executedVolume,
        revenue: existing.revenue + r.executedRevenue
      });
    });

    return Array.from(dataByDate.entries())
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        执行电量: Math.round(values.volume),
        执行收益: Math.round(values.revenue / 1000)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10);
  }, [executionRecords]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">零售执行情况追踪</h1>
        <p className="text-muted-foreground mt-2">零售业务执行过程监控与追踪</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">累计执行电量</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(stats.totalVolume / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground mt-1">MWh</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">累计执行收益</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#00B04D]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#00B04D]">¥{(stats.totalRevenue / 10000).toFixed(2)}万</div>
            <p className="text-xs text-muted-foreground mt-1">本月累计</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均偏差率</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${stats.avgDeviation < 10 ? 'text-[#00B04D]' : 'text-red-500'}`}>
              {stats.avgDeviation.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">电量偏差</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">执行完成率</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.executionRate.toFixed(1)}%</div>
            <Progress value={stats.executionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">异常记录数</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-red-500">{stats.anomalyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">需处理</p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选控制 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索客户..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="执行状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="executing">执行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="anomaly">异常</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-[#00B04D] hover:bg-[#009644]">查询</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                同步数据
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出报告
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab 切换区 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">执行概览</TabsTrigger>
          <TabsTrigger value="summary">客户汇总</TabsTrigger>
          <TabsTrigger value="anomaly">异常监控</TabsTrigger>
        </TabsList>

        {/* Tab 1: 执行概览 */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>执行记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b-2 border-[#00B04D]">
                      <th className="text-left p-3 text-sm font-semibold">执行日期</th>
                      <th className="text-left p-3 text-sm font-semibold">客户名称</th>
                      <th className="text-left p-3 text-sm font-semibold">执行时段</th>
                      <th className="text-right p-3 text-sm font-semibold">已执行电量</th>
                      <th className="text-right p-3 text-sm font-semibold">预测电量</th>
                      <th className="text-right p-3 text-sm font-semibold">偏差率</th>
                      <th className="text-right p-3 text-sm font-semibold">实际收益</th>
                      <th className="text-left p-3 text-sm font-semibold">执行状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.slice(0, 50).map((record) => (
                      <tr key={record.id} className={`border-b hover:bg-[#F8FBFA] ${record.status === 'anomaly' ? 'border-l-4 border-l-red-500' : ''}`}>
                        <td className="p-3 text-sm">{record.executionDate}</td>
                        <td className="p-3">{record.customerName}</td>
                        <td className="p-3 text-sm">{record.executionPeriod}</td>
                        <td className="p-3 text-right font-mono">{record.executedVolume.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono">{record.predictedVolume.toFixed(2)}</td>
                        <td className={`p-3 text-right font-mono font-bold ${Math.abs(record.volumeDeviationRate) < 5 ? 'text-[#00B04D]' : Math.abs(record.volumeDeviationRate) < 10 ? 'text-orange-500' : 'text-red-500'}`}>
                          {record.volumeDeviationRate.toFixed(2)}%
                        </td>
                        <td className="p-3 text-right font-mono text-[#00B04D]">¥{record.actualRevenue.toFixed(2)}</td>
                        <td className="p-3">{getStatusBadge(record.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>执行电量趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="执行电量" stroke="#00B04D" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>执行收益趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: '千元', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="执行收益" stroke="#4ECDC4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: 客户汇总 */}
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>客户执行汇总</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b-2 border-[#00B04D]">
                      <th className="text-left p-3 text-sm font-semibold">客户名称</th>
                      <th className="text-left p-3 text-sm font-semibold">套餐类型</th>
                      <th className="text-right p-3 text-sm font-semibold">累计执行电量</th>
                      <th className="text-right p-3 text-sm font-semibold">累计执行收益</th>
                      <th className="text-right p-3 text-sm font-semibold">平均偏差率</th>
                      <th className="text-right p-3 text-sm font-semibold">异常次数</th>
                      <th className="text-right p-3 text-sm font-semibold">执行完成率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerSummary.map((summary) => (
                      <tr key={summary.customerId} className="border-b hover:bg-[#F8FBFA]">
                        <td className="p-3">{summary.customerName}</td>
                        <td className="p-3">
                          <Badge variant="outline">{summary.packageType}</Badge>
                        </td>
                        <td className="p-3 text-right font-mono">{summary.totalExecutedVolume.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-[#00B04D]">¥{(summary.totalExecutedRevenue / 10000).toFixed(2)}万</td>
                        <td className={`p-3 text-right font-mono ${summary.averageDeviationRate < 5 ? 'text-[#00B04D]' : summary.averageDeviationRate < 10 ? 'text-orange-500' : 'text-red-500'}`}>
                          {summary.averageDeviationRate.toFixed(2)}%
                        </td>
                        <td className="p-3 text-right font-mono">{summary.anomalyCount}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center gap-2">
                            <Progress value={summary.executionRate} className="flex-1" />
                            <span className="font-mono text-sm">{summary.executionRate.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: 异常监控 */}
        <TabsContent value="anomaly" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">异常总数</p>
                  <p className="text-3xl font-bold font-mono mt-2 text-red-500">{stats.anomalyCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">待处理异常</p>
                  <p className="text-3xl font-bold font-mono mt-2 text-orange-500">{stats.anomalyCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">已处理异常</p>
                  <p className="text-3xl font-bold font-mono mt-2 text-[#00B04D]">0</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">处理中异常</p>
                  <p className="text-3xl font-bold font-mono mt-2">0</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>异常记录列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b-2 border-[#00B04D]">
                      <th className="text-left p-3 text-sm font-semibold">异常时间</th>
                      <th className="text-left p-3 text-sm font-semibold">客户名称</th>
                      <th className="text-left p-3 text-sm font-semibold">异常类型</th>
                      <th className="text-right p-3 text-sm font-semibold">偏差率</th>
                      <th className="text-left p-3 text-sm font-semibold">影响程度</th>
                      <th className="text-right p-3 text-sm font-semibold">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionRecords.filter(r => r.status === 'anomaly').slice(0, 20).map((record) => (
                      <tr key={record.id} className="border-b hover:bg-[#F8FBFA] bg-red-50">
                        <td className="p-3 text-sm">{record.executionDate} {record.executionPeriod}</td>
                        <td className="p-3">{record.customerName}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="border-red-500 text-red-500">电量偏差大</Badge>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-red-500">
                          {record.volumeDeviationRate.toFixed(2)}%
                        </td>
                        <td className="p-3">
                          <Badge className="bg-red-500 hover:bg-red-600 text-white">高</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost">处理</Button>
                            <Button size="sm" variant="ghost">备注</Button>
                          </div>
                        </td>
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

export default ExecutionTracking;

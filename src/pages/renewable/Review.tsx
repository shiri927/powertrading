import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrendingUp, TrendingDown, Calendar as CalendarIcon, Download, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart } from "recharts";

// 中长期策略复盘数据
const generateMediumLongTermData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}月`,
    plannedVolume: 800 + Math.random() * 200,
    actualVolume: 750 + Math.random() * 250,
    plannedRevenue: 400 + Math.random() * 100,
    actualRevenue: 380 + Math.random() * 120,
    deviationRate: (Math.random() * 20 - 10).toFixed(2),
  }));
};

// 省内现货复盘数据
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

// 省间现货复盘数据
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

const Review = () => {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [activeTab, setActiveTab] = useState("medium-long-term");

  const mediumLongTermData = generateMediumLongTermData();
  const intraProvincialData = generateIntraProvincialData();
  const interProvincialData = generateInterProvincialData();

  // 计算统计指标
  const calculateStats = (data: any[], type: string) => {
    if (type === "medium-long-term") {
      const totalPlanned = data.reduce((sum, item) => sum + item.plannedVolume, 0);
      const totalActual = data.reduce((sum, item) => sum + item.actualVolume, 0);
      const avgDeviation = data.reduce((sum, item) => sum + parseFloat(item.deviationRate), 0) / data.length;
      const totalRevenue = data.reduce((sum, item) => sum + item.actualRevenue, 0);
      return { totalPlanned, totalActual, avgDeviation, totalRevenue };
    } else if (type === "intra-provincial") {
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

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">复盘分析</h1>
        <p className="text-muted-foreground mt-2">
          交易策略复盘与收益优化分析
        </p>
      </div>

      {/* 筛选控制区 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-2">
              <Label className="text-sm">交易中心</Label>
              <Select defaultValue="shanxi">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shanxi">山西电力交易中心</SelectItem>
                  <SelectItem value="shandong">山东电力交易中心</SelectItem>
                  <SelectItem value="zhejiang">浙江电力交易中心</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">交易单元</Label>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部单元</SelectItem>
                  <SelectItem value="unit1">交易单元1</SelectItem>
                  <SelectItem value="unit2">交易单元2</SelectItem>
                  <SelectItem value="unit3">交易单元3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">时间范围</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-64 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "PPP", { locale: zhCN })} -{" "}
                          {format(dateRange.to, "PPP", { locale: zhCN })}
                        </>
                      ) : (
                        format(dateRange.from, "PPP", { locale: zhCN })
                      )
                    ) : (
                      <span>选择日期范围</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range as any)}
                    numberOfMonths={2}
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button>
              <Filter className="h-4 w-4 mr-2" />
              查询
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab切换区 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medium-long-term">中长期策略复盘</TabsTrigger>
          <TabsTrigger value="intra-provincial">省内现货复盘</TabsTrigger>
          <TabsTrigger value="inter-provincial">省间现货复盘</TabsTrigger>
        </TabsList>

        {/* 中长期策略复盘 */}
        <TabsContent value="medium-long-term" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>计划电量(MWh)</CardDescription>
                <CardTitle className="text-2xl font-mono">
                  {calculateStats(mediumLongTermData, "medium-long-term").totalPlanned.toFixed(0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>实际电量(MWh)</CardDescription>
                <CardTitle className="text-2xl font-mono">
                  {calculateStats(mediumLongTermData, "medium-long-term").totalActual.toFixed(0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>平均偏差率</CardDescription>
                <CardTitle className="text-2xl font-mono flex items-center gap-2">
                  {calculateStats(mediumLongTermData, "medium-long-term").avgDeviation.toFixed(2)}%
                  {calculateStats(mediumLongTermData, "medium-long-term").avgDeviation > 0 ? (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>累计收益(万元)</CardDescription>
                <CardTitle className="text-2xl font-mono text-[#00B04D]">
                  {calculateStats(mediumLongTermData, "medium-long-term").totalRevenue.toFixed(0)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>月度执行情况对比</CardTitle>
              <CardDescription>计划电量与实际电量对比分析</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={mediumLongTermData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                  />
                  <Legend />
                  <Bar dataKey="plannedVolume" name="计划电量(MWh)" fill="#94A3B8" />
                  <Bar dataKey="actualVolume" name="实际电量(MWh)" fill="#00B04D" />
                  <Line type="monotone" dataKey="deviationRate" name="偏差率(%)" stroke="#EF4444" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>收益分析</CardTitle>
              <CardDescription>计划收益与实际收益对比</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mediumLongTermData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="plannedRevenue" name="计划收益(万元)" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="actualRevenue" name="实际收益(万元)" stroke="#00B04D" fill="#00B04D" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>详细数据表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b">
                      <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-sm">月份</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">计划电量(MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">实际电量(MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">偏差率(%)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">计划收益(万元)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">实际收益(万元)</th>
                      <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-sm">执行状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediumLongTermData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-[#F8FBFA] transition-colors">
                        <td className="p-4 text-sm">{row.month}</td>
                        <td className="p-4 text-sm font-mono text-right">{row.plannedVolume.toFixed(2)}</td>
                        <td className="p-4 text-sm font-mono text-right">{row.actualVolume.toFixed(2)}</td>
                        <td className="p-4 text-sm font-mono text-right">
                          <span className={parseFloat(row.deviationRate) > 0 ? 'text-red-600' : 'text-green-600'}>
                            {row.deviationRate}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-mono text-right">{row.plannedRevenue.toFixed(2)}</td>
                        <td className="p-4 text-sm font-mono text-right">{row.actualRevenue.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <Badge variant={Math.abs(parseFloat(row.deviationRate)) < 5 ? "default" : "secondary"}>
                            {Math.abs(parseFloat(row.deviationRate)) < 5 ? "正常" : "偏差较大"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 省内现货复盘 */}
        <TabsContent value="intra-provincial" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>累计收益(元)</CardDescription>
                <CardTitle className="text-2xl font-mono text-[#00B04D]">
                  {calculateStats(intraProvincialData, "intra-provincial").totalRevenue.toFixed(0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>平均价格偏差(元/MWh)</CardDescription>
                <CardTitle className="text-2xl font-mono">
                  {calculateStats(intraProvincialData, "intra-provincial").avgPriceDeviation.toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>出清电量(MWh)</CardDescription>
                <CardTitle className="text-2xl font-mono">
                  {calculateStats(intraProvincialData, "intra-provincial").totalClearingVolume.toFixed(0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>出清率</CardDescription>
                <CardTitle className="text-2xl font-mono">
                  {calculateStats(intraProvincialData, "intra-provincial").clearingRate.toFixed(2)}%
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>价格预测准确度分析</CardTitle>
              <CardDescription>预测电价与实际出清价对比</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={intraProvincialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="predictedPrice" name="预测电价(元/MWh)" stroke="#94A3B8" strokeWidth={2} />
                  <Line type="monotone" dataKey="actualPrice" name="实际电价(元/MWh)" stroke="#00B04D" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>申报与出清电量对比</CardTitle>
              <CardDescription>每日申报电量与实际出清电量</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={intraProvincialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <Legend />
                  <Bar dataKey="bidVolume" name="申报电量(MWh)" fill="#94A3B8" />
                  <Bar dataKey="clearingVolume" name="出清电量(MWh)" fill="#00B04D" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>收益趋势</CardTitle>
              <CardDescription>每日收益变化趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={intraProvincialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="收益(元)" stroke="#00B04D" fill="#00B04D" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>详细数据表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b">
                      <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-sm">日期</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">预测电价(元/MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">实际电价(元/MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">申报电量(MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">出清电量(MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">收益(元)</th>
                      <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-sm">出清率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intraProvincialData.map((row, index) => {
                      const clearingRate = (row.clearingVolume / row.bidVolume * 100);
                      return (
                        <tr key={index} className="border-b hover:bg-[#F8FBFA] transition-colors">
                          <td className="p-4 text-sm">{row.date}</td>
                          <td className="p-4 text-sm font-mono text-right">{row.predictedPrice.toFixed(2)}</td>
                          <td className="p-4 text-sm font-mono text-right">{row.actualPrice.toFixed(2)}</td>
                          <td className="p-4 text-sm font-mono text-right">{row.bidVolume.toFixed(2)}</td>
                          <td className="p-4 text-sm font-mono text-right">{row.clearingVolume.toFixed(2)}</td>
                          <td className="p-4 text-sm font-mono text-right text-[#00B04D]">{row.revenue.toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <Badge variant={clearingRate > 80 ? "default" : "secondary"}>
                              {clearingRate.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 省间现货复盘 */}
        <TabsContent value="inter-provincial" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>累计盈亏(元)</CardDescription>
                <CardTitle className="text-2xl font-mono">
                  <span className={calculateStats(interProvincialData, "inter-provincial").totalProfit > 0 ? 'text-[#00B04D]' : 'text-red-600'}>
                    {calculateStats(interProvincialData, "inter-provincial").totalProfit.toFixed(0)}
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>出清电量(MWh)</CardDescription>
                <CardTitle className="text-2xl font-mono">
                  {calculateStats(interProvincialData, "inter-provincial").totalClearingVolume.toFixed(0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>平均价格偏差(元/MWh)</CardDescription>
                <CardTitle className="text-2xl font-mono">
                  {calculateStats(interProvincialData, "inter-provincial").avgPriceDeviation.toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>出清率</CardDescription>
                <CardTitle className="text-2xl font-mono">
                  {calculateStats(interProvincialData, "inter-provincial").clearingRate.toFixed(2)}%
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>申报价格与出清价格对比</CardTitle>
              <CardDescription>每日申报价格与实际出清价格走势</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={interProvincialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="bidPrice" name="申报价格(元/MWh)" stroke="#94A3B8" strokeWidth={2} />
                  <Line type="monotone" dataKey="clearingPrice" name="出清价格(元/MWh)" stroke="#00B04D" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>申报与出清电量对比</CardTitle>
              <CardDescription>每日申报电量与实际出清电量</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={interProvincialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <Legend />
                  <Bar dataKey="bidVolume" name="申报电量(MWh)" fill="#94A3B8" />
                  <Bar dataKey="clearingVolume" name="出清电量(MWh)" fill="#00B04D" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>盈亏分析</CardTitle>
              <CardDescription>每日盈亏情况</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={interProvincialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <Legend />
                  <Bar dataKey="profit" name="盈亏(元)" fill="#00B04D" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>详细数据表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b">
                      <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-sm">日期</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">申报价格(元/MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">出清价格(元/MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">申报电量(MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">出清电量(MWh)</th>
                      <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-sm">盈亏(元)</th>
                      <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-sm">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interProvincialData.map((row, index) => {
                      const profit = parseFloat(row.profit);
                      return (
                        <tr key={index} className="border-b hover:bg-[#F8FBFA] transition-colors">
                          <td className="p-4 text-sm">{row.date}</td>
                          <td className="p-4 text-sm font-mono text-right">{row.bidPrice.toFixed(2)}</td>
                          <td className="p-4 text-sm font-mono text-right">{row.clearingPrice.toFixed(2)}</td>
                          <td className="p-4 text-sm font-mono text-right">{row.bidVolume.toFixed(2)}</td>
                          <td className="p-4 text-sm font-mono text-right">{row.clearingVolume.toFixed(2)}</td>
                          <td className="p-4 text-sm font-mono text-right">
                            <span className={profit > 0 ? 'text-[#00B04D]' : 'text-red-600'}>
                              {profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant={profit > 0 ? "default" : "destructive"}>
                              {profit > 0 ? "盈利" : "亏损"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
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

export default Review;

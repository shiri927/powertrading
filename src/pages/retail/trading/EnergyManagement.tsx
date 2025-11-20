import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, TrendingDown, AlertCircle, Download, Users, Activity } from "lucide-react";
import { Customer, EnergyUsage, CustomerQuality, generateCustomers, generateEnergyUsage, generateCustomerQuality } from "@/lib/retail-data";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";

const EnergyManagement = () => {
  const [customers] = useState<Customer[]>(() => generateCustomers(50));
  const [energyData] = useState<EnergyUsage[]>(() => generateEnergyUsage(customers, 30));
  const [qualityData] = useState<CustomerQuality[]>(() => generateCustomerQuality(customers, energyData));
  
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 统计数据
  const stats = useMemo(() => {
    const totalEnergy = energyData.reduce((sum, d) => sum + d.totalEnergy, 0);
    const avgDeviation = energyData.length > 0 
      ? Math.abs(energyData.reduce((sum, d) => sum + d.deviationRate, 0) / energyData.length)
      : 0;
    
    const totalPeak = energyData.reduce((sum, d) => sum + d.peakEnergy, 0);
    const totalFlat = energyData.reduce((sum, d) => sum + d.flatEnergy, 0);
    const totalValley = energyData.reduce((sum, d) => sum + d.valleyEnergy, 0);
    const total = totalPeak + totalFlat + totalValley;
    
    const peakRatio = total > 0 ? (totalPeak / total) * 100 : 0;
    const flatRatio = total > 0 ? (totalFlat / total) * 100 : 0;
    const valleyRatio = total > 0 ? (totalValley / total) * 100 : 0;
    
    const totalProfit = energyData.reduce((sum, d) => sum + d.profitLoss, 0);
    const excellentCustomers = qualityData.filter(q => q.category === 'excellent').length;

    return {
      totalEnergy: Math.round(totalEnergy * 100) / 100,
      avgDeviation: Math.round(avgDeviation * 100) / 100,
      peakRatio: Math.round(peakRatio * 100) / 100,
      flatRatio: Math.round(flatRatio * 100) / 100,
      valleyRatio: Math.round(valleyRatio * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      excellentCustomers
    };
  }, [energyData, qualityData]);

  // 用电趋势数据 (按天聚合)
  const trendData = useMemo(() => {
    const dataByDate = new Map<string, { total: number, peak: number, flat: number, valley: number }>();
    
    energyData.forEach(d => {
      const existing = dataByDate.get(d.date) || { total: 0, peak: 0, flat: 0, valley: 0 };
      dataByDate.set(d.date, {
        total: existing.total + d.totalEnergy,
        peak: existing.peak + d.peakEnergy,
        flat: existing.flat + d.flatEnergy,
        valley: existing.valley + d.valleyEnergy
      });
    });

    return Array.from(dataByDate.entries())
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        总用电: Math.round(values.total),
        峰时: Math.round(values.peak),
        平时: Math.round(values.flat),
        谷时: Math.round(values.valley)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10);
  }, [energyData]);

  // 峰平谷占比数据
  const peakValleyData = [
    { name: '峰时', value: stats.peakRatio, color: '#FF6B6B' },
    { name: '平时', value: stats.flatRatio, color: '#4ECDC4' },
    { name: '谷时', value: stats.valleyRatio, color: '#95E1D3' }
  ];

  // 客户偏差率排名 (Top 20)
  const deviationRanking = useMemo(() => {
    const customerDeviations = new Map<string, { name: string, totalDeviation: number, count: number }>();
    
    energyData.forEach(d => {
      const existing = customerDeviations.get(d.customerId) || { name: d.customerName, totalDeviation: 0, count: 0 };
      customerDeviations.set(d.customerId, {
        name: d.customerName,
        totalDeviation: existing.totalDeviation + Math.abs(d.deviationRate),
        count: existing.count + 1
      });
    });

    return Array.from(customerDeviations.values())
      .map(c => ({
        name: c.name,
        avgDeviation: Math.round((c.totalDeviation / c.count) * 100) / 100
      }))
      .sort((a, b) => b.avgDeviation - a.avgDeviation)
      .slice(0, 20);
  }, [energyData]);

  // 电量排名 (Top 20)
  const volumeRanking = useMemo(() => {
    const customerVolumes = new Map<string, { name: string, total: number, profit: number }>();
    
    energyData.forEach(d => {
      const existing = customerVolumes.get(d.customerId) || { name: d.customerName, total: 0, profit: 0 };
      customerVolumes.set(d.customerId, {
        name: d.customerName,
        total: existing.total + d.totalEnergy,
        profit: existing.profit + d.profitLoss
      });
    });

    return Array.from(customerVolumes.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 20)
      .map((c, idx) => ({
        ranking: idx + 1,
        name: c.name,
        volume: Math.round(c.total * 100) / 100,
        profit: Math.round(c.profit * 100) / 100
      }));
  }, [energyData]);

  // 客户质量矩阵数据
  const qualityMatrixData = useMemo(() => {
    return qualityData.slice(0, 50).map(q => ({
      name: q.customerName,
      x: q.totalEnergy / 1000,
      y: q.averageDeviation,
      z: Math.abs(q.profitability) / 100,
      category: q.category
    }));
  }, [qualityData]);

  const getCategoryColor = (category: CustomerQuality['category']) => {
    const colors = {
      excellent: '#00B04D',
      good: '#4ECDC4',
      normal: '#95E1D3',
      poor: '#FF6B6B'
    };
    return colors[category];
  };

  const getCategoryBadge = (category: CustomerQuality['category']) => {
    const configs = {
      excellent: { label: '优质', className: 'bg-[#00B04D] hover:bg-[#009644] text-white' },
      good: { label: '良好', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
      normal: { label: '一般', className: 'bg-gray-500 hover:bg-gray-600 text-white' },
      poor: { label: '较差', className: 'bg-red-500 hover:bg-red-600 text-white' }
    };
    const config = configs[category];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const customerDetail = useMemo(() => {
    if (!selectedCustomer) return null;
    const customer = customers.find(c => c.id === selectedCustomer);
    const usage = energyData.filter(d => d.customerId === selectedCustomer);
    const quality = qualityData.find(q => q.customerId === selectedCustomer);
    return { customer, usage, quality };
  }, [selectedCustomer, customers, energyData, qualityData]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">用能管理</h1>
        <p className="text-muted-foreground mt-2">
          客户用电数据监测与分析
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用电量</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(stats.totalEnergy / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground mt-1">
              本月累计 MWh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均偏差率</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${stats.avgDeviation < 5 ? 'text-[#00B04D]' : stats.avgDeviation < 10 ? 'text-orange-500' : 'text-red-500'}`}>
              {stats.avgDeviation.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              预测偏差率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">峰平谷占比</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-mono text-red-500">{stats.peakRatio.toFixed(0)}%</span>
              <span className="text-sm font-mono text-blue-500">{stats.flatRatio.toFixed(0)}%</span>
              <span className="text-sm font-mono text-green-500">{stats.valleyRatio.toFixed(0)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              峰/平/谷分布
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">盈亏情况</CardTitle>
            {stats.totalProfit >= 0 ? <TrendingUp className="h-4 w-4 text-[#00B04D]" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${stats.totalProfit >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
              ¥{(stats.totalProfit / 10000).toFixed(2)}万
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              本月累计
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">优质客户数</CardTitle>
            <Users className="h-4 w-4 text-[#00B04D]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.excellentCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              优质客户占比 {((stats.excellentCustomers / qualityData.length) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选控制 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">本日</SelectItem>
                  <SelectItem value="week">本周</SelectItem>
                  <SelectItem value="month">本月</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-[#00B04D] hover:bg-[#009644]">查询</Button>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tab 切换区 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">用电概览</TabsTrigger>
          <TabsTrigger value="deviation">预测偏差分析</TabsTrigger>
          <TabsTrigger value="ranking">盈亏与排名</TabsTrigger>
          <TabsTrigger value="quality">优质客户聚焦</TabsTrigger>
        </TabsList>

        {/* Tab 1: 用电概览 */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>用电趋势分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'MWh', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="总用电" stroke="#00B04D" strokeWidth={2} />
                    <Line type="monotone" dataKey="峰时" stroke="#FF6B6B" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="平时" stroke="#4ECDC4" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="谷时" stroke="#95E1D3" strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>峰平谷占比分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={peakValleyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name} ${entry.value.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {peakValleyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>按电压等级分类</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { level: '10kV', value: energyData.filter(d => d.voltageLevel === '10kV').reduce((s, d) => s + d.totalEnergy, 0) / 1000 },
                      { level: '35kV', value: energyData.filter(d => d.voltageLevel === '35kV').reduce((s, d) => s + d.totalEnergy, 0) / 1000 },
                      { level: '110kV', value: energyData.filter(d => d.voltageLevel === '110kV').reduce((s, d) => s + d.totalEnergy, 0) / 1000 },
                      { level: '220kV', value: energyData.filter(d => d.voltageLevel === '220kV').reduce((s, d) => s + d.totalEnergy, 0) / 1000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                      <XAxis dataKey="level" />
                      <YAxis label={{ value: 'MWh (千)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#00B04D" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: 预测偏差分析 */}
        <TabsContent value="deviation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">平均偏差率</p>
                  <p className="text-3xl font-bold font-mono mt-2">{stats.avgDeviation.toFixed(2)}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">最大偏差率</p>
                  <p className="text-3xl font-bold font-mono mt-2 text-red-500">
                    {Math.max(...energyData.map(d => Math.abs(d.deviationRate))).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">最小偏差率</p>
                  <p className="text-3xl font-bold font-mono mt-2 text-[#00B04D]">
                    {Math.min(...energyData.map(d => Math.abs(d.deviationRate))).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>客户预测偏差率排名 (Top 20)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviationRanking} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis type="number" label={{ value: '偏差率 (%)', position: 'insideBottom', offset: -5 }} />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="avgDeviation" fill="#FF6B6B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>偏差详细列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b-2 border-[#00B04D]">
                      <th className="text-left p-3 text-sm font-semibold">客户名称</th>
                      <th className="text-right p-3 text-sm font-semibold">预测电量</th>
                      <th className="text-right p-3 text-sm font-semibold">实际电量</th>
                      <th className="text-right p-3 text-sm font-semibold">偏差量</th>
                      <th className="text-right p-3 text-sm font-semibold">偏差率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviationRanking.slice(0, 10).map((item, idx) => {
                      const customerUsage = energyData.filter(d => d.customerName === item.name)[0];
                      return (
                        <tr key={idx} className={`border-b hover:bg-[#F8FBFA] ${item.avgDeviation > 10 ? 'bg-red-50' : ''}`}>
                          <td className="p-3">
                            <button
                              className="text-[#00B04D] hover:underline"
                              onClick={() => {
                                const customer = customers.find(c => c.name === item.name);
                                if (customer) {
                                  setSelectedCustomer(customer.id);
                                  setIsDetailOpen(true);
                                }
                              }}
                            >
                              {item.name}
                            </button>
                          </td>
                          <td className="p-3 text-right font-mono">{customerUsage?.predictedEnergy.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono">{customerUsage?.actualEnergy.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono">{(customerUsage?.actualEnergy - customerUsage?.predictedEnergy).toFixed(2)}</td>
                          <td className={`p-3 text-right font-mono font-bold ${item.avgDeviation < 5 ? 'text-[#00B04D]' : item.avgDeviation < 10 ? 'text-orange-500' : 'text-red-500'}`}>
                            {item.avgDeviation.toFixed(2)}%
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

        {/* Tab 3: 盈亏与排名 */}
        <TabsContent value="ranking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 20 电量排名</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b-2 border-[#00B04D]">
                      <th className="text-left p-3 text-sm font-semibold">排名</th>
                      <th className="text-left p-3 text-sm font-semibold">客户名称</th>
                      <th className="text-right p-3 text-sm font-semibold">用电量 (MWh)</th>
                      <th className="text-right p-3 text-sm font-semibold">盈亏金额 (元)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volumeRanking.map((item) => (
                      <tr key={item.ranking} className="border-b hover:bg-[#F8FBFA]">
                        <td className="p-3 font-bold">{item.ranking}</td>
                        <td className="p-3">
                          <button
                            className="text-[#00B04D] hover:underline"
                            onClick={() => {
                              const customer = customers.find(c => c.name === item.name);
                              if (customer) {
                                setSelectedCustomer(customer.id);
                                setIsDetailOpen(true);
                              }
                            }}
                          >
                            {item.name}
                          </button>
                        </td>
                        <td className="p-3 text-right font-mono">{item.volume.toFixed(2)}</td>
                        <td className={`p-3 text-right font-mono font-bold ${item.profit >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                          ¥{item.profit.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: 优质客户聚焦 */}
        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>优质客户评分标准</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-[#F1F8F4] rounded-md">
                  <p className="font-semibold mb-2">用电量权重</p>
                  <p className="text-2xl font-bold text-[#00B04D]">40%</p>
                </div>
                <div className="p-4 bg-[#F1F8F4] rounded-md">
                  <p className="font-semibold mb-2">偏差率权重</p>
                  <p className="text-2xl font-bold text-[#00B04D]">30%</p>
                </div>
                <div className="p-4 bg-[#F1F8F4] rounded-md">
                  <p className="font-semibold mb-2">盈利能力权重</p>
                  <p className="text-2xl font-bold text-[#00B04D]">30%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>优质客户列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b-2 border-[#00B04D]">
                      <th className="text-left p-3 text-sm font-semibold">排名</th>
                      <th className="text-left p-3 text-sm font-semibold">客户名称</th>
                      <th className="text-right p-3 text-sm font-semibold">优质评分</th>
                      <th className="text-right p-3 text-sm font-semibold">用电量 (MWh)</th>
                      <th className="text-right p-3 text-sm font-semibold">平均偏差率</th>
                      <th className="text-right p-3 text-sm font-semibold">盈利金额 (元)</th>
                      <th className="text-left p-3 text-sm font-semibold">质量等级</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualityData.slice(0, 20).map((item, idx) => (
                      <tr key={item.customerId} className="border-b hover:bg-[#F8FBFA]">
                        <td className="p-3 font-bold">{idx + 1}</td>
                        <td className="p-3">
                          <button
                            className="text-[#00B04D] hover:underline"
                            onClick={() => {
                              setSelectedCustomer(item.customerId);
                              setIsDetailOpen(true);
                            }}
                          >
                            {item.customerName}
                          </button>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#00B04D]">{item.qualityScore.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono">{item.totalEnergy.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono">{item.averageDeviation.toFixed(2)}%</td>
                        <td className={`p-3 text-right font-mono ${item.profitability >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                          ¥{item.profitability.toFixed(2)}
                        </td>
                        <td className="p-3">{getCategoryBadge(item.category)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>客户质量矩阵</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                    <XAxis type="number" dataKey="x" name="用电量" label={{ value: '用电量 (千MWh)', position: 'insideBottom', offset: -5 }} />
                    <YAxis type="number" dataKey="y" name="偏差率" label={{ value: '偏差率 (%)', angle: -90, position: 'insideLeft' }} />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="优质客户" data={qualityMatrixData.filter(d => d.category === 'excellent')} fill={getCategoryColor('excellent')} />
                    <Scatter name="良好客户" data={qualityMatrixData.filter(d => d.category === 'good')} fill={getCategoryColor('good')} />
                    <Scatter name="一般客户" data={qualityMatrixData.filter(d => d.category === 'normal')} fill={getCategoryColor('normal')} />
                    <Scatter name="风险客户" data={qualityMatrixData.filter(d => d.category === 'poor')} fill={getCategoryColor('poor')} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 客户详情侧边栏 */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>客户详情</SheetTitle>
          </SheetHeader>
          {customerDetail && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">基本信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">客户名称</span>
                    <span className="font-medium">{customerDetail.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">套餐类型</span>
                    <span className="font-medium">{customerDetail.customer?.packageType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">电压等级</span>
                    <span className="font-medium">{customerDetail.customer?.voltageLevel}</span>
                  </div>
                </div>
              </div>

              {customerDetail.quality && (
                <div>
                  <h3 className="font-semibold mb-4">质量评分</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">优质评分</span>
                      <span className="font-mono font-bold text-[#00B04D]">{customerDetail.quality.qualityScore.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">平均偏差率</span>
                      <span className="font-mono">{customerDetail.quality.averageDeviation.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">总用电量</span>
                      <span className="font-mono">{customerDetail.quality.totalEnergy.toFixed(2)} MWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">盈利能力</span>
                      <span className={`font-mono ${customerDetail.quality.profitability >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                        ¥{customerDetail.quality.profitability.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">质量等级</span>
                      {getCategoryBadge(customerDetail.quality.category)}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-4">最近用电记录</h3>
                <div className="space-y-2">
                  {customerDetail.usage.slice(0, 10).map((usage, idx) => (
                    <div key={idx} className="p-3 bg-[#F8FBFA] rounded-md text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">{usage.date}</span>
                        <span className="font-mono font-bold">{usage.totalEnergy.toFixed(2)} MWh</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>偏差率: <span className={`font-mono ${Math.abs(usage.deviationRate) < 5 ? 'text-[#00B04D]' : 'text-orange-500'}`}>{usage.deviationRate.toFixed(2)}%</span></span>
                        <span>盈亏: <span className={`font-mono ${usage.profitLoss >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>¥{usage.profitLoss.toFixed(2)}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EnergyManagement;

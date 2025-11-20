import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calculator, Save, GitCompare, Download, RotateCcw, TrendingUp, DollarSign, Percent, AlertTriangle } from "lucide-react";
import { PackageSimulation as PackageSimulationType } from "@/lib/retail-data";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PackageSimulation = () => {
  const { toast } = useToast();
  const [calculationType, setCalculationType] = useState<'fixed' | 'floating'>('fixed');
  const [savedSchemes, setSavedSchemes] = useState<PackageSimulationType[]>([]);
  
  // 输入参数
  const [customerName, setCustomerName] = useState('');
  const [schemeName, setSchemeName] = useState('');
  const [estimatedUsage, setEstimatedUsage] = useState(10000);
  const [peakRatio, setPeakRatio] = useState(30);
  const [flatRatio, setFlatRatio] = useState(50);
  const [valleyRatio, setValleyRatio] = useState(20);
  
  // 固定价格参数
  const [fixedPrice, setFixedPrice] = useState(400);
  
  // 浮动价格参数
  const [floatingPriceType, setFloatingPriceType] = useState('年度双边交易平段价格');
  const [floatingBasePrice, setFloatingBasePrice] = useState(380);
  const [floatingAdjustment, setFloatingAdjustment] = useState(5);
  
  // 成本参数
  const [purchaseCost, setPurchaseCost] = useState(320);
  const [intermediaryCost, setIntermediaryCost] = useState(15);
  const [transmissionCost, setTransmissionCost] = useState(80);
  const [otherCosts, setOtherCosts] = useState(10);
  
  // 计算结果
  const [calculationResult, setCalculationResult] = useState<PackageSimulationType | null>(null);

  // 自动调整占比确保总和为100
  useEffect(() => {
    const total = peakRatio + flatRatio + valleyRatio;
    if (total !== 100) {
      const diff = 100 - total;
      setFlatRatio(prev => Math.max(0, Math.min(100, prev + diff)));
    }
  }, [peakRatio, valleyRatio]);

  const handleCalculate = () => {
    if (!customerName) {
      toast({
        title: "错误",
        description: "请输入客户名称",
        variant: "destructive"
      });
      return;
    }

    const total = peakRatio + flatRatio + valleyRatio;
    if (Math.abs(total - 100) > 0.1) {
      toast({
        title: "错误",
        description: "峰平谷占比总和必须为100%",
        variant: "destructive"
      });
      return;
    }

    let sellPrice = 0;
    if (calculationType === 'fixed') {
      sellPrice = fixedPrice;
    } else {
      sellPrice = floatingBasePrice * (1 + floatingAdjustment / 100);
    }

    const peakEnergy = estimatedUsage * (peakRatio / 100);
    const flatEnergy = estimatedUsage * (flatRatio / 100);
    const valleyEnergy = estimatedUsage * (valleyRatio / 100);

    // 简化计算：假设峰平谷电价分别为平均价的1.2倍、1倍、0.6倍
    const peakRevenue = peakEnergy * sellPrice * 1.2;
    const flatRevenue = flatEnergy * sellPrice;
    const valleyRevenue = valleyEnergy * sellPrice * 0.6;
    const totalRevenue = peakRevenue + flatRevenue + valleyRevenue;

    const totalCostValue = purchaseCost + intermediaryCost + transmissionCost + otherCosts;
    const totalCost = estimatedUsage * totalCostValue;

    const grossProfit = totalRevenue - totalCost;
    const profitMargin = (grossProfit / totalRevenue) * 100;
    const breakEvenPrice = totalCostValue;

    const result: PackageSimulationType = {
      id: `SCHEME-${Date.now()}`,
      customerName,
      schemeName: schemeName || `${calculationType === 'fixed' ? '固定' : '浮动'}价格方案-${new Date().toLocaleDateString()}`,
      packageType: calculationType,
      estimatedMonthlyUsage: estimatedUsage,
      peakRatio,
      flatRatio,
      valleyRatio,
      fixedPrice: calculationType === 'fixed' ? fixedPrice : undefined,
      floatingBasePrice: calculationType === 'floating' ? floatingBasePrice : undefined,
      floatingPriceType: calculationType === 'floating' ? floatingPriceType : undefined,
      floatingAdjustment: calculationType === 'floating' ? floatingAdjustment : undefined,
      purchaseCost,
      intermediaryCost,
      transmissionCost,
      otherCosts,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      breakEvenPrice: Math.round(breakEvenPrice * 100) / 100,
      createdAt: new Date().toISOString()
    };

    setCalculationResult(result);
    toast({
      title: "计算完成",
      description: "套餐收益已计算完成"
    });
  };

  const handleSaveScheme = () => {
    if (!calculationResult) {
      toast({
        title: "错误",
        description: "请先进行计算",
        variant: "destructive"
      });
      return;
    }

    setSavedSchemes(prev => [calculationResult, ...prev]);
    toast({
      title: "保存成功",
      description: "方案已保存到历史记录"
    });
  };

  const handleReset = () => {
    setCustomerName('');
    setSchemeName('');
    setEstimatedUsage(10000);
    setPeakRatio(30);
    setFlatRatio(50);
    setValleyRatio(20);
    setFixedPrice(400);
    setFloatingBasePrice(380);
    setFloatingAdjustment(5);
    setPurchaseCost(320);
    setIntermediaryCost(15);
    setTransmissionCost(80);
    setOtherCosts(10);
    setCalculationResult(null);
  };

  const loadScheme = (scheme: PackageSimulationType) => {
    setCalculationType(scheme.packageType);
    setCustomerName(scheme.customerName);
    setSchemeName(scheme.schemeName);
    setEstimatedUsage(scheme.estimatedMonthlyUsage);
    setPeakRatio(scheme.peakRatio);
    setFlatRatio(scheme.flatRatio);
    setValleyRatio(scheme.valleyRatio);
    if (scheme.fixedPrice) setFixedPrice(scheme.fixedPrice);
    if (scheme.floatingBasePrice) setFloatingBasePrice(scheme.floatingBasePrice);
    if (scheme.floatingPriceType) setFloatingPriceType(scheme.floatingPriceType);
    if (scheme.floatingAdjustment !== undefined) setFloatingAdjustment(scheme.floatingAdjustment);
    setPurchaseCost(scheme.purchaseCost);
    setIntermediaryCost(scheme.intermediaryCost);
    setTransmissionCost(scheme.transmissionCost);
    setOtherCosts(scheme.otherCosts);
    setCalculationResult(scheme);
  };

  const pieChartData = useMemo(() => [
    { name: '峰时', value: peakRatio, color: '#FF6B6B' },
    { name: '平时', value: flatRatio, color: '#4ECDC4' },
    { name: '谷时', value: valleyRatio, color: '#95E1D3' }
  ], [peakRatio, flatRatio, valleyRatio]);

  const costBreakdownData = useMemo(() => {
    if (!calculationResult) return [];
    return [
      { name: '购电成本', value: purchaseCost },
      { name: '居间成本', value: intermediaryCost },
      { name: '输配电成本', value: transmissionCost },
      { name: '其他成本', value: otherCosts }
    ];
  }, [calculationResult, purchaseCost, intermediaryCost, transmissionCost, otherCosts]);

  const revenueVsCostData = useMemo(() => {
    if (!calculationResult) return [];
    return [
      {
        name: '收益分析',
        收入: calculationResult.totalRevenue / 10000,
        成本: calculationResult.totalCost / 10000,
        利润: calculationResult.grossProfit / 10000
      }
    ];
  }, [calculationResult]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">套餐模拟计算</h1>
        <p className="text-muted-foreground mt-2">
          零售套餐方案测算与优化
        </p>
      </div>

      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Label className="mb-2 block">计算器模式</Label>
          <ToggleGroup type="single" value={calculationType} onValueChange={(v) => v && setCalculationType(v as 'fixed' | 'floating')}>
            <ToggleGroupItem value="fixed" className="px-6">
              <Calculator className="h-4 w-4 mr-2" />
              固定价格
            </ToggleGroupItem>
            <ToggleGroupItem value="floating" className="px-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              浮动价格
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveScheme}>
            <Save className="h-4 w-4 mr-2" />
            保存方案
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            清空重置
          </Button>
        </div>
      </div>

      {/* 主计算区 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 左栏：输入参数 */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>客户名称 *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="请输入客户名称"
                  />
                </div>
                <div>
                  <Label>方案名称</Label>
                  <Input
                    value={schemeName}
                    onChange={(e) => setSchemeName(e.target.value)}
                    placeholder="自动生成"
                  />
                </div>
              </div>
              <div>
                <Label>预估月用电量 (MWh)</Label>
                <Input
                  type="number"
                  value={estimatedUsage}
                  onChange={(e) => setEstimatedUsage(parseFloat(e.target.value) || 0)}
                  className="font-mono text-right"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">用电结构</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>峰时占比</Label>
                  <span className="font-mono text-sm">{peakRatio}%</span>
                </div>
                <div className="flex gap-4 items-center">
                  <Slider
                    value={[peakRatio]}
                    onValueChange={(v) => setPeakRatio(v[0])}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={peakRatio}
                    onChange={(e) => setPeakRatio(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-20 font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>平时占比</Label>
                  <span className="font-mono text-sm">{flatRatio}%</span>
                </div>
                <div className="flex gap-4 items-center">
                  <Slider
                    value={[flatRatio]}
                    onValueChange={(v) => setFlatRatio(v[0])}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={flatRatio}
                    onChange={(e) => setFlatRatio(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-20 font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>谷时占比</Label>
                  <span className="font-mono text-sm">{valleyRatio}%</span>
                </div>
                <div className="flex gap-4 items-center">
                  <Slider
                    value={[valleyRatio]}
                    onValueChange={(v) => setValleyRatio(v[0])}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={valleyRatio}
                    onChange={(e) => setValleyRatio(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-20 font-mono text-right"
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">总占比</span>
                  <span className={`font-mono font-bold ${Math.abs(peakRatio + flatRatio + valleyRatio - 100) < 0.1 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                    {(peakRatio + flatRatio + valleyRatio).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} ${entry.value}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
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
              <CardTitle className="text-lg">价格参数</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {calculationType === 'fixed' ? (
                <div>
                  <Label>固定销售电价 (元/MWh)</Label>
                  <Input
                    type="number"
                    value={fixedPrice}
                    onChange={(e) => setFixedPrice(parseFloat(e.target.value) || 0)}
                    className="font-mono text-right"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    适用于价格稳定期，客户承受固定电价
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>基准价类型</Label>
                    <Select value={floatingPriceType} onValueChange={setFloatingPriceType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="年度双边交易平段价格">年度双边交易平段价格</SelectItem>
                        <SelectItem value="月度双边交易平段价格">月度双边交易平段价格</SelectItem>
                        <SelectItem value="日前市场平均价格">日前市场平均价格</SelectItem>
                        <SelectItem value="自定义基准价">自定义基准价</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>参考基准价 (元/MWh)</Label>
                    <Input
                      type="number"
                      value={floatingBasePrice}
                      onChange={(e) => setFloatingBasePrice(parseFloat(e.target.value) || 0)}
                      className="font-mono text-right"
                    />
                  </div>
                  <div>
                    <Label>浮动调整系数 (%)</Label>
                    <Input
                      type="number"
                      value={floatingAdjustment}
                      onChange={(e) => setFloatingAdjustment(parseFloat(e.target.value) || 0)}
                      className="font-mono text-right"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      正数表示上浮，负数表示下浮
                    </p>
                  </div>
                  <div className="p-3 bg-[#F1F8F4] rounded-md">
                    <p className="text-sm font-medium">
                      最终销售电价 = {floatingBasePrice.toFixed(2)} × (1 + {floatingAdjustment}%) = {(floatingBasePrice * (1 + floatingAdjustment / 100)).toFixed(2)} 元/MWh
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    适用于价格波动期，跟随市场价格调整
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">成本参数</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>购电成本 (元/MWh)</Label>
                  <Input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(parseFloat(e.target.value) || 0)}
                    className="font-mono text-right"
                  />
                </div>
                <div>
                  <Label>居间成本 (元/MWh)</Label>
                  <Input
                    type="number"
                    value={intermediaryCost}
                    onChange={(e) => setIntermediaryCost(parseFloat(e.target.value) || 0)}
                    className="font-mono text-right"
                  />
                </div>
                <div>
                  <Label>输配电成本 (元/MWh)</Label>
                  <Input
                    type="number"
                    value={transmissionCost}
                    onChange={(e) => setTransmissionCost(parseFloat(e.target.value) || 0)}
                    className="font-mono text-right"
                  />
                </div>
                <div>
                  <Label>其他成本 (元/MWh)</Label>
                  <Input
                    type="number"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(parseFloat(e.target.value) || 0)}
                    className="font-mono text-right"
                  />
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">总成本</span>
                  <span className="font-mono font-bold text-lg">
                    {(purchaseCost + intermediaryCost + transmissionCost + otherCosts).toFixed(2)} 元/MWh
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleCalculate} className="flex-1 bg-[#00B04D] hover:bg-[#009644] h-12 text-lg">
              <Calculator className="h-5 w-5 mr-2" />
              开始计算
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-12">
              重置参数
            </Button>
          </div>
        </div>

        {/* 右栏：计算结果 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">计算结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {calculationResult ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-[#F1F8F4]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs">预估总收入</span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-[#00B04D]">
                          ¥{(calculationResult.totalRevenue / 10000).toFixed(2)}万
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#F1F8F4]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs">预估总成本</span>
                        </div>
                        <div className="text-2xl font-bold font-mono">
                          ¥{(calculationResult.totalCost / 10000).toFixed(2)}万
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#F1F8F4]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs">预估毛利润</span>
                        </div>
                        <div className={`text-2xl font-bold font-mono ${calculationResult.grossProfit >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                          ¥{(calculationResult.grossProfit / 10000).toFixed(2)}万
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#F1F8F4]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Percent className="h-4 w-4" />
                          <span className="text-xs">利润率</span>
                        </div>
                        <div className={`text-2xl font-bold font-mono ${calculationResult.profitMargin >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                          {calculationResult.profitMargin.toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">详细分析</h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">峰时收入</span>
                        <span className="font-mono">¥{((estimatedUsage * peakRatio / 100) * (calculationType === 'fixed' ? fixedPrice : floatingBasePrice * (1 + floatingAdjustment / 100)) * 1.2).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">平时收入</span>
                        <span className="font-mono">¥{((estimatedUsage * flatRatio / 100) * (calculationType === 'fixed' ? fixedPrice : floatingBasePrice * (1 + floatingAdjustment / 100))).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">谷时收入</span>
                        <span className="font-mono">¥{((estimatedUsage * valleyRatio / 100) * (calculationType === 'fixed' ? fixedPrice : floatingBasePrice * (1 + floatingAdjustment / 100)) * 0.6).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-semibold">盈亏平衡分析</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">保本电价</span>
                          <span className="font-mono font-medium">{calculationResult.breakEvenPrice.toFixed(2)} 元/MWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">安全边际</span>
                          <span className="font-mono font-medium">
                            {((((calculationType === 'fixed' ? fixedPrice : floatingBasePrice * (1 + floatingAdjustment / 100)) - calculationResult.breakEvenPrice) / (calculationType === 'fixed' ? fixedPrice : floatingBasePrice * (1 + floatingAdjustment / 100))) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueVsCostData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8F0EC" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: '万元', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="收入" fill="#00B04D" />
                        <Bar dataKey="成本" fill="#9CA3AF" />
                        <Bar dataKey="利润" fill="#4ECDC4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {costBreakdownData.length > 0 && (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={costBreakdownData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name} ${entry.value}`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {costBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#FF6B6B', '#4ECDC4', '#95E1D3', '#F9CA24'][index % 4]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>请输入参数并点击"开始计算"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 历史计算记录 */}
      {savedSchemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>历史计算记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F1F8F4]">
                  <tr className="border-b-2 border-[#00B04D]">
                    <th className="text-left p-3 text-sm font-semibold">时间</th>
                    <th className="text-left p-3 text-sm font-semibold">客户名称</th>
                    <th className="text-left p-3 text-sm font-semibold">方案名称</th>
                    <th className="text-left p-3 text-sm font-semibold">套餐类型</th>
                    <th className="text-right p-3 text-sm font-semibold">预估电量</th>
                    <th className="text-right p-3 text-sm font-semibold">利润</th>
                    <th className="text-right p-3 text-sm font-semibold">利润率</th>
                    <th className="text-right p-3 text-sm font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {savedSchemes.slice(0, 10).map((scheme) => (
                    <tr key={scheme.id} className="border-b hover:bg-[#F8FBFA]">
                      <td className="p-3 text-sm">{new Date(scheme.createdAt).toLocaleString()}</td>
                      <td className="p-3">{scheme.customerName}</td>
                      <td className="p-3 text-sm">{scheme.schemeName}</td>
                      <td className="p-3">
                        <Badge variant="outline">{scheme.packageType === 'fixed' ? '固定价格' : '浮动价格'}</Badge>
                      </td>
                      <td className="p-3 text-right font-mono">{scheme.estimatedMonthlyUsage}</td>
                      <td className={`p-3 text-right font-mono ${scheme.grossProfit >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                        ¥{(scheme.grossProfit / 10000).toFixed(2)}万
                      </td>
                      <td className={`p-3 text-right font-mono ${scheme.profitMargin >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                        {scheme.profitMargin.toFixed(2)}%
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => loadScheme(scheme)}>
                            复用
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => setSavedSchemes(prev => prev.filter(s => s.id !== scheme.id))}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PackageSimulation;

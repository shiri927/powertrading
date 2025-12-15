import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Calculator, Save, Download, RotateCcw, TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle, CheckCircle, XCircle, Users, Loader2 } from "lucide-react";
import { usePackageSimulations, CreateSimulationInput } from "@/hooks/usePackageSimulations";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 本地计算结果类型
interface LocalCalculationResult {
  id: string;
  customerName: string;
  schemeName: string;
  packageType: 'fixed' | 'floating';
  estimatedMonthlyUsage: number;
  peakRatio: number;
  flatRatio: number;
  valleyRatio: number;
  fixedPrice?: number;
  floatingBasePrice?: number;
  floatingPriceType?: string;
  floatingAdjustment?: number;
  purchaseCost: number;
  intermediaryCost: number;
  transmissionCost: number;
  otherCosts: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  breakEvenPrice: number;
  createdAt: string;
}

const PackageSimulation = () => {
  const { toast } = useToast();
  const { data: savedSchemes = [], loading: schemesLoading, createSimulation, deleteSimulation } = usePackageSimulations();
  const { data: allCustomers = [], isLoading: customersLoading } = useCustomers();
  
  const [calculationType, setCalculationType] = useState<'fixed' | 'floating'>('fixed');
  
  // 待签约用户列表 - 从数据库获取
  const pendingCustomers = useMemo(() => 
    allCustomers.filter(c => c.contract_status === 'pending'),
    [allCustomers]
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('manual');
  
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
  const [calculationResult, setCalculationResult] = useState<LocalCalculationResult | null>(null);

  // 当选择待签约用户时，自动填充数据
  useEffect(() => {
    if (selectedCustomerId !== 'manual') {
      const customer = pendingCustomers.find(c => c.id === selectedCustomerId);
      if (customer) {
        setCustomerName(customer.name);
        setEstimatedUsage(customer.total_capacity || 10000);
        setIntermediaryCost(customer.intermediary_cost || 15);
        // 模拟历史用电结构
        setPeakRatio(25 + Math.floor(Math.random() * 15));
        setFlatRatio(45 + Math.floor(Math.random() * 15));
      }
    }
  }, [selectedCustomerId, pendingCustomers]);

  // 自动调整占比确保总和为100
  useEffect(() => {
    const total = peakRatio + flatRatio + valleyRatio;
    if (total !== 100) {
      const diff = 100 - total;
      setValleyRatio(prev => Math.max(0, Math.min(100, prev + diff)));
    }
  }, [peakRatio, flatRatio]);

  const handleCalculate = () => {
    if (!customerName) {
      toast({
        title: "错误",
        description: "请输入用户名称",
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

    const result: LocalCalculationResult = {
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

  const handleSaveScheme = async () => {
    if (!calculationResult) {
      toast({
        title: "错误",
        description: "请先进行计算",
        variant: "destructive"
      });
      return;
    }

    // 保存到数据库
    const input: CreateSimulationInput = {
      scheme_name: calculationResult.schemeName,
      package_type: calculationResult.packageType,
      estimated_monthly_usage: calculationResult.estimatedMonthlyUsage,
      peak_ratio: calculationResult.peakRatio,
      flat_ratio: calculationResult.flatRatio,
      valley_ratio: calculationResult.valleyRatio,
      fixed_price: calculationResult.fixedPrice,
      floating_base_price: calculationResult.floatingBasePrice,
      floating_price_type: calculationResult.floatingPriceType,
      floating_adjustment: calculationResult.floatingAdjustment,
      purchase_cost: calculationResult.purchaseCost,
      intermediary_cost: calculationResult.intermediaryCost,
      transmission_cost: calculationResult.transmissionCost,
      other_costs: calculationResult.otherCosts,
      total_revenue: calculationResult.totalRevenue,
      total_cost: calculationResult.totalCost,
      gross_profit: calculationResult.grossProfit,
      profit_margin: calculationResult.profitMargin,
      break_even_price: calculationResult.breakEvenPrice
    };
    
    await createSimulation(input);
  };

  const handleReset = () => {
    setSelectedCustomerId('manual');
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

  const loadScheme = (scheme: { 
    package_type: string; 
    scheme_name: string;
    estimated_monthly_usage: number | null;
    peak_ratio: number | null;
    flat_ratio: number | null;
    valley_ratio: number | null;
    fixed_price: number | null;
    floating_base_price: number | null;
    floating_price_type: string | null;
    floating_adjustment: number | null;
    purchase_cost: number | null;
    intermediary_cost: number | null;
    transmission_cost: number | null;
    other_costs: number | null;
    customer?: { name: string } | null;
  }) => {
    setCalculationType(scheme.package_type as 'fixed' | 'floating');
    setCustomerName(scheme.customer?.name || '');
    setSchemeName(scheme.scheme_name);
    setEstimatedUsage(scheme.estimated_monthly_usage || 10000);
    setPeakRatio(scheme.peak_ratio || 30);
    setFlatRatio(scheme.flat_ratio || 50);
    setValleyRatio(scheme.valley_ratio || 20);
    if (scheme.fixed_price) setFixedPrice(scheme.fixed_price);
    if (scheme.floating_base_price) setFloatingBasePrice(scheme.floating_base_price);
    if (scheme.floating_price_type) setFloatingPriceType(scheme.floating_price_type);
    if (scheme.floating_adjustment !== undefined && scheme.floating_adjustment !== null) setFloatingAdjustment(scheme.floating_adjustment);
    setPurchaseCost(scheme.purchase_cost || 320);
    setIntermediaryCost(scheme.intermediary_cost || 15);
    setTransmissionCost(scheme.transmission_cost || 80);
    setOtherCosts(scheme.other_costs || 10);
    // 不自动设置计算结果，需要用户点击计算按钮
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

  // 敏感性分析数据
  const sensitivityData = useMemo(() => {
    if (!calculationResult) return [];
    const basePrice = calculationType === 'fixed' ? fixedPrice : floatingBasePrice * (1 + floatingAdjustment / 100);
    const totalCostValue = purchaseCost + intermediaryCost + transmissionCost + otherCosts;
    
    return [-10, -5, 5, 10].map(pct => {
      const adjustedPrice = basePrice * (1 + pct / 100);
      const peakEnergy = estimatedUsage * (peakRatio / 100);
      const flatEnergy = estimatedUsage * (flatRatio / 100);
      const valleyEnergy = estimatedUsage * (valleyRatio / 100);
      const revenue = peakEnergy * adjustedPrice * 1.2 + flatEnergy * adjustedPrice + valleyEnergy * adjustedPrice * 0.6;
      const cost = estimatedUsage * totalCostValue;
      const profit = revenue - cost;
      const margin = (profit / revenue) * 100;
      
      return {
        label: `${pct > 0 ? '+' : ''}${pct}%`,
        profit: profit / 10000,
        margin: margin
      };
    });
  }, [calculationResult, calculationType, fixedPrice, floatingBasePrice, floatingAdjustment, purchaseCost, intermediaryCost, transmissionCost, otherCosts, estimatedUsage, peakRatio, flatRatio, valleyRatio]);

  // 签约建议
  const signingRecommendation = useMemo(() => {
    if (!calculationResult) return null;
    const margin = calculationResult.profitMargin;
    if (margin >= 15) {
      return { level: 'recommend', text: '推荐签约', reason: '利润率 ≥ 15%，安全边际充足', color: 'text-[#00B04D]', bgColor: 'bg-[#00B04D]/10', icon: CheckCircle };
    } else if (margin >= 8) {
      return { level: 'caution', text: '谨慎签约', reason: '利润率 8% ~ 15%，需关注成本控制', color: 'text-orange-500', bgColor: 'bg-orange-500/10', icon: AlertTriangle };
    } else {
      return { level: 'not-recommend', text: '不建议签约', reason: '利润率 < 8%，风险较高', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: XCircle };
    }
  }, [calculationResult]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">套餐模拟计算</h1>
        <p className="text-muted-foreground mt-2">
          标前计算器 - 帮助测算待签约用户的购电成本和利润空间，为零售交易签约提供参考依据
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
              {/* 待签约用户选择 */}
              <div>
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  选择待签约用户
                </Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择用户或手动输入" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">手动输入</SelectItem>
                    {pendingCustomers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.package_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  选择待签约用户后将自动填充预估用电量和峰平谷比例
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>用户名称 *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="请输入用户名称"
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
                    适用于价格稳定期，用户承受固定电价
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

                  {/* 签约建议 */}
                  {signingRecommendation && (
                    <div className={`p-4 rounded-lg border ${signingRecommendation.bgColor}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <signingRecommendation.icon className={`h-5 w-5 ${signingRecommendation.color}`} />
                        <span className={`font-bold ${signingRecommendation.color}`}>
                          {signingRecommendation.text}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{signingRecommendation.reason}</p>
                    </div>
                  )}

                  {/* 敏感性分析 */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">敏感性分析</span>
                    </div>
                    <div className="space-y-2">
                      {sensitivityData.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                          <span className="text-muted-foreground">电价波动 {item.label}</span>
                          <div className="flex gap-4">
                            <span className={`font-mono ${item.profit >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                              ¥{item.profit.toFixed(2)}万
                            </span>
                            <span className={`font-mono ${item.margin >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                              ({item.margin.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <th className="text-left p-3 text-sm font-semibold">用户名称</th>
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
                      <td className="p-3 text-sm">{new Date(scheme.created_at).toLocaleString()}</td>
                      <td className="p-3">{scheme.customer?.name || '-'}</td>
                      <td className="p-3 text-sm">{scheme.scheme_name}</td>
                      <td className="p-3">
                        <Badge variant="outline">{scheme.package_type === 'fixed' ? '固定价格' : '浮动价格'}</Badge>
                      </td>
                      <td className="p-3 text-right font-mono">{scheme.estimated_monthly_usage || 0}</td>
                      <td className={`p-3 text-right font-mono ${(scheme.gross_profit || 0) >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                        ¥{((scheme.gross_profit || 0) / 10000).toFixed(2)}万
                      </td>
                      <td className={`p-3 text-right font-mono ${(scheme.profit_margin || 0) >= 0 ? 'text-[#00B04D]' : 'text-red-500'}`}>
                        {(scheme.profit_margin || 0).toFixed(2)}%
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
                            onClick={() => deleteSimulation(scheme.id)}
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

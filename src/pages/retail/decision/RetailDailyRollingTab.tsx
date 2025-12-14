import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, AlertTriangle, Info, TrendingUp, TrendingDown, Zap, Users, Package, ArrowUpDown, ShoppingCart, Wallet } from "lucide-react";

// 省份配置（售电侧视角）
const PROVINCES = [
  { id: "shandong", name: "山东省", units: ["山东售电公司A", "山东售电公司B"] },
  { id: "shanxi", name: "山西省", units: ["山西售电公司A", "山西售电公司B"] },
  { id: "zhejiang", name: "浙江省", units: ["浙江售电公司A", "浙江售电公司B"] },
];

// 生成策略数据（售电侧：基于负荷预测）
const generateStrategyData = (province: string) => {
  const baseMultiplier = province === "shandong" ? 1.2 : province === "shanxi" ? 1.0 : 0.9;
  return Array.from({ length: 8 }, (_, i) => {
    const hour = i * 3;
    const load = (120 + Math.random() * 60) * baseMultiplier; // 负荷预测（MW）
    const volume = load * 3 * 0.9; // 建议购电量（MWh）
    const spotPrice = 320 + Math.random() * 80; // 现货价格预测
    const retailPrice = spotPrice + 15 + Math.random() * 20; // 售电价格
    const spreadRevenue = (retailPrice - spotPrice) * volume; // 价差收益
    const strategies = ["增加购入", "维持购入", "减少购入", "观望"];
    const risks: Array<"低" | "中" | "高"> = ["低", "中", "高"];
    return {
      timeSlot: `${hour.toString().padStart(2, '0')}:00-${(hour + 3).toString().padStart(2, '0')}:00`,
      load: load.toFixed(1),
      volume: volume.toFixed(1),
      spotPrice: spotPrice.toFixed(2),
      retailPrice: retailPrice.toFixed(2),
      spreadRevenue: spreadRevenue.toFixed(0),
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      risk: risks[i % 3],
    };
  });
};

const RetailDailyRollingTab = () => {
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [tradingPeriod, setTradingPeriod] = useState("today");
  const [showStrategyBasis, setShowStrategyBasis] = useState(false);

  // 计算聚合指标（售电侧视角）
  const metrics = useMemo(() => {
    const multiplier = selectedProvince === "shandong" ? 1.2 : selectedProvince === "shanxi" ? 1.0 : 0.9;
    return {
      predictedLoad: Math.floor(1850 * multiplier), // 预测负荷量
      suggestedPurchase: Math.floor(1620 * multiplier), // 建议购电量
      expectedRevenue: (45.8 * multiplier).toFixed(1), // 预期收益
      confidence: (88.5 - Math.random() * 5).toFixed(1), // 策略置信度
      customerUsage: Math.floor(1780 * multiplier), // 客户用电总量
      currentPosition: Math.floor(680 * multiplier), // 已持仓电量
      buyLimit: Math.floor(450 * multiplier), // 买入限额
      sellLimit: Math.floor(320 * multiplier), // 卖出限额
    };
  }, [selectedProvince]);

  // 获取可用交易单元列表
  const availableUnits = useMemo(() => {
    if (selectedProvince === "all") {
      return PROVINCES.flatMap(p => p.units);
    }
    const province = PROVINCES.find(p => p.id === selectedProvince);
    return province ? province.units : [];
  }, [selectedProvince]);

  // 生成策略数据
  const strategyData = useMemo(() => {
    return generateStrategyData(selectedProvince);
  }, [selectedProvince]);

  return (
    <div className="space-y-6">
      {/* 筛选栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedProvince} onValueChange={(val) => {
            setSelectedProvince(val);
            setSelectedUnit("all");
          }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="选择省份" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部省份</SelectItem>
              {PROVINCES.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择交易单元" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部交易单元</SelectItem>
              {availableUnits.map(u => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tradingPeriod} onValueChange={setTradingPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="交易周期" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="tomorrow">明日</SelectItem>
              <SelectItem value="week">本周</SelectItem>
            </SelectContent>
          </Select>
          <Button>查询</Button>
          <Button variant="outline">重置</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">导出策略</Button>
          <Button className="bg-[#00B04D] hover:bg-[#009040]">生成申报方案</Button>
        </div>
      </div>

      {/* 交易限制提示栏 */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <span className="font-medium">交易限制提醒：</span>
          单笔买入限额 <span className="font-mono font-semibold">{metrics.buyLimit} MWh</span> | 
          单笔卖出限额 <span className="font-mono font-semibold">{metrics.sellLimit} MWh</span> | 
          偏差考核阈值 <span className="font-mono font-semibold">±5%</span> | 
          当日累计限额 <span className="font-mono font-semibold">{(metrics.buyLimit * 3)} MWh</span>
        </AlertDescription>
      </Alert>

      {/* 8个指标卡（售电侧视角） */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">预测负荷量</p>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">{metrics.predictedLoad.toLocaleString()} MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">建议购电量</p>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">{metrics.suggestedPurchase.toLocaleString()} MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">预期价差收益</p>
            </div>
            <p className="text-2xl font-bold text-green-600 font-mono">¥ {metrics.expectedRevenue}万</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">策略置信度</p>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">{metrics.confidence}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">客户用电总量</p>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">{metrics.customerUsage.toLocaleString()} MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">已持仓电量</p>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">{metrics.currentPosition.toLocaleString()} MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs text-muted-foreground">买入限额</p>
            </div>
            <p className="text-2xl font-bold text-green-600 font-mono">{metrics.buyLimit} MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-xs text-muted-foreground">卖出限额</p>
            </div>
            <p className="text-2xl font-bold text-red-600 font-mono">{metrics.sellLimit} MWh</p>
          </CardContent>
        </Card>
      </div>

      {/* 策略依据折叠面板 */}
      <Collapsible open={showStrategyBasis} onOpenChange={setShowStrategyBasis}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  策略生成依据
                </CardTitle>
                {showStrategyBasis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">现货价格预测</h4>
                  <p className="text-xs text-muted-foreground">
                    数据来源：市场数据中心<br />
                    更新时间：2025-12-14 08:30<br />
                    预测周期：未来24小时<br />
                    预测准确率：89.2%
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">负荷预测分析</h4>
                  <p className="text-xs text-muted-foreground">
                    数据来源：客户用电数据<br />
                    模型类型：LSTM负荷预测<br />
                    更新时间：2025-12-14 06:00<br />
                    预测准确率：92.3%
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">持仓分析结论</h4>
                  <p className="text-xs text-muted-foreground">
                    当前持仓：{metrics.currentPosition} MWh<br />
                    持仓成本：¥348.2/MWh<br />
                    建议操作：{metrics.currentPosition > 500 ? "适度减仓" : "可增仓"}<br />
                    风险评估：中低
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">市场供需分析</h4>
                  <p className="text-xs text-muted-foreground">
                    供需比例：1.05（供略大于需）<br />
                    预测趋势：供需平衡偏紧<br />
                    价格趋势：预计小幅上涨<br />
                    交易建议：低价时段适量购入
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 策略表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            日滚交易策略建议
            {selectedProvince !== "all" && (
              <Badge variant="outline" className="ml-2 border-[#00B04D] text-[#00B04D]">
                {PROVINCES.find(p => p.id === selectedProvince)?.name} 一省一策
              </Badge>
            )}
          </CardTitle>
          <CardDescription>基于负荷预测和现货价格分析的购电策略推荐</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-[#F1F8F4]">
                <TableRow>
                  <TableHead>时段</TableHead>
                  <TableHead className="text-right">预测负荷 (MW)</TableHead>
                  <TableHead className="text-right">建议购电量 (MWh)</TableHead>
                  <TableHead className="text-right">预测现货价 (¥/MWh)</TableHead>
                  <TableHead className="text-right">售电价格 (¥/MWh)</TableHead>
                  <TableHead className="text-right">预期价差收益 (¥)</TableHead>
                  <TableHead>策略建议</TableHead>
                  <TableHead>风险等级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strategyData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-[#F8FBFA]">
                    <TableCell className="font-mono">{row.timeSlot}</TableCell>
                    <TableCell className="text-right font-mono">{row.load}</TableCell>
                    <TableCell className="text-right font-mono">{row.volume}</TableCell>
                    <TableCell className="text-right font-mono">{row.spotPrice}</TableCell>
                    <TableCell className="text-right font-mono">{row.retailPrice}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">{row.spreadRevenue}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.strategy}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.risk === "高" ? "destructive" : row.risk === "中" ? "secondary" : "default"}>
                        {row.risk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetailDailyRollingTab;

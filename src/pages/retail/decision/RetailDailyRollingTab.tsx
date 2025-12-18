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
            <SelectTrigger className="w-[150px] bg-[#1a3a5c]/80 border-[#2a4a6c] text-white">
              <SelectValue placeholder="选择省份" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a3a5c] border-[#2a4a6c]">
              <SelectItem value="all" className="text-white hover:bg-[#2a4a6c]">全部省份</SelectItem>
              {PROVINCES.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-white hover:bg-[#2a4a6c]">{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-[180px] bg-[#1a3a5c]/80 border-[#2a4a6c] text-white">
              <SelectValue placeholder="选择交易单元" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a3a5c] border-[#2a4a6c]">
              <SelectItem value="all" className="text-white hover:bg-[#2a4a6c]">全部交易单元</SelectItem>
              {availableUnits.map(u => (
                <SelectItem key={u} value={u} className="text-white hover:bg-[#2a4a6c]">{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tradingPeriod} onValueChange={setTradingPeriod}>
            <SelectTrigger className="w-[120px] bg-[#1a3a5c]/80 border-[#2a4a6c] text-white">
              <SelectValue placeholder="交易周期" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a3a5c] border-[#2a4a6c]">
              <SelectItem value="today" className="text-white hover:bg-[#2a4a6c]">今日</SelectItem>
              <SelectItem value="tomorrow" className="text-white hover:bg-[#2a4a6c]">明日</SelectItem>
              <SelectItem value="week" className="text-white hover:bg-[#2a4a6c]">本周</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#00B04D] hover:bg-[#009040] text-white">查询</Button>
          <Button variant="outline" className="border-[#2a4a6c] text-slate-300 hover:bg-[#2a4a6c]">重置</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#2a4a6c] text-slate-300 hover:bg-[#2a4a6c]">导出策略</Button>
          <Button className="bg-[#00B04D] hover:bg-[#009040] text-white">生成申报方案</Button>
        </div>
      </div>

      {/* 交易限制提示栏 */}
      <Alert className="border-amber-500/50 bg-amber-900/30">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-amber-200">
          <span className="font-medium">交易限制提醒：</span>
          单笔买入限额 <span className="font-mono font-semibold text-amber-100">{metrics.buyLimit} MWh</span> | 
          单笔卖出限额 <span className="font-mono font-semibold text-amber-100">{metrics.sellLimit} MWh</span> | 
          偏差考核阈值 <span className="font-mono font-semibold text-amber-100">±5%</span> | 
          当日累计限额 <span className="font-mono font-semibold text-amber-100">{(metrics.buyLimit * 3)} MWh</span>
        </AlertDescription>
      </Alert>

      {/* 8个指标卡（售电侧视角） */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <p className="text-xs text-slate-400">预测负荷量</p>
            </div>
            <p className="text-2xl font-bold text-[#00B04D] font-mono">{metrics.predictedLoad.toLocaleString()} MWh</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-slate-400" />
              <p className="text-xs text-slate-400">建议购电量</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400 font-mono">{metrics.suggestedPurchase.toLocaleString()} MWh</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-slate-400" />
              <p className="text-xs text-slate-400">预期价差收益</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-mono">¥ {metrics.expectedRevenue}万</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-slate-400" />
              <p className="text-xs text-slate-400">策略置信度</p>
            </div>
            <p className="text-2xl font-bold text-amber-400 font-mono">{metrics.confidence}%</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-slate-400" />
              <p className="text-xs text-slate-400">客户用电总量</p>
            </div>
            <p className="text-2xl font-bold text-blue-400 font-mono">{metrics.customerUsage.toLocaleString()} MWh</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-slate-400" />
              <p className="text-xs text-slate-400">已持仓电量</p>
            </div>
            <p className="text-2xl font-bold text-purple-400 font-mono">{metrics.currentPosition.toLocaleString()} MWh</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-slate-400">买入限额</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{metrics.buyLimit} MWh</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-rose-400" />
              <p className="text-xs text-slate-400">卖出限额</p>
            </div>
            <p className="text-2xl font-bold text-rose-400 font-mono">{metrics.sellLimit} MWh</p>
          </CardContent>
        </Card>
      </div>

      {/* 策略依据折叠面板 */}
      <Collapsible open={showStrategyBasis} onOpenChange={setShowStrategyBasis}>
        <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-[#2a4a6c]/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <Info className="h-4 w-4" />
                  策略生成依据
                </CardTitle>
                {showStrategyBasis ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0d2137]/80 rounded-lg border border-[#2a4a6c]">
                  <h4 className="font-medium mb-2 text-sm text-cyan-400">现货价格预测</h4>
                  <p className="text-xs text-slate-400">
                    数据来源：市场数据中心<br />
                    更新时间：2025-12-14 08:30<br />
                    预测周期：未来24小时<br />
                    预测准确率：<span className="text-emerald-400">89.2%</span>
                  </p>
                </div>
                <div className="p-4 bg-[#0d2137]/80 rounded-lg border border-[#2a4a6c]">
                  <h4 className="font-medium mb-2 text-sm text-cyan-400">负荷预测分析</h4>
                  <p className="text-xs text-slate-400">
                    数据来源：客户用电数据<br />
                    模型类型：LSTM负荷预测<br />
                    更新时间：2025-12-14 06:00<br />
                    预测准确率：<span className="text-emerald-400">92.3%</span>
                  </p>
                </div>
                <div className="p-4 bg-[#0d2137]/80 rounded-lg border border-[#2a4a6c]">
                  <h4 className="font-medium mb-2 text-sm text-cyan-400">持仓分析结论</h4>
                  <p className="text-xs text-slate-400">
                    当前持仓：<span className="text-white">{metrics.currentPosition} MWh</span><br />
                    持仓成本：<span className="text-white">¥348.2/MWh</span><br />
                    建议操作：<span className="text-amber-400">{metrics.currentPosition > 500 ? "适度减仓" : "可增仓"}</span><br />
                    风险评估：<span className="text-emerald-400">中低</span>
                  </p>
                </div>
                <div className="p-4 bg-[#0d2137]/80 rounded-lg border border-[#2a4a6c]">
                  <h4 className="font-medium mb-2 text-sm text-cyan-400">市场供需分析</h4>
                  <p className="text-xs text-slate-400">
                    供需比例：<span className="text-white">1.05</span>（供略大于需）<br />
                    预测趋势：供需平衡偏紧<br />
                    价格趋势：<span className="text-amber-400">预计小幅上涨</span><br />
                    交易建议：<span className="text-emerald-400">低价时段适量购入</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 策略表格 */}
      <Card className="bg-[#1a3a5c]/60 border-[#2a4a6c] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base text-white">
            日滚交易策略建议
            {selectedProvince !== "all" && (
              <Badge variant="outline" className="ml-2 border-[#00B04D] text-[#00B04D]">
                {PROVINCES.find(p => p.id === selectedProvince)?.name} 一省一策
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-slate-400">基于负荷预测和现货价格分析的购电策略推荐</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[#2a4a6c] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#0d2137]">
                <TableRow className="border-[#2a4a6c] hover:bg-[#0d2137]">
                  <TableHead className="text-slate-300">时段</TableHead>
                  <TableHead className="text-right text-slate-300">预测负荷 (MW)</TableHead>
                  <TableHead className="text-right text-slate-300">建议购电量 (MWh)</TableHead>
                  <TableHead className="text-right text-slate-300">预测现货价 (¥/MWh)</TableHead>
                  <TableHead className="text-right text-slate-300">售电价格 (¥/MWh)</TableHead>
                  <TableHead className="text-right text-slate-300">预期价差收益 (¥)</TableHead>
                  <TableHead className="text-slate-300">策略建议</TableHead>
                  <TableHead className="text-slate-300">风险等级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strategyData.map((row, i) => (
                  <TableRow key={i} className="border-[#2a4a6c] hover:bg-[#2a4a6c]/30">
                    <TableCell className="font-mono text-white">{row.timeSlot}</TableCell>
                    <TableCell className="text-right font-mono text-cyan-300">{row.load}</TableCell>
                    <TableCell className="text-right font-mono text-blue-300">{row.volume}</TableCell>
                    <TableCell className="text-right font-mono text-amber-300">{row.spotPrice}</TableCell>
                    <TableCell className="text-right font-mono text-purple-300">{row.retailPrice}</TableCell>
                    <TableCell className="text-right font-mono text-emerald-400">{row.spreadRevenue}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#2a4a6c] text-slate-200">{row.strategy}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={row.risk === "高" ? "destructive" : "default"}
                        className={
                          row.risk === "高" ? "bg-rose-500/80" : 
                          row.risk === "中" ? "bg-amber-500/80 text-white" : 
                          "bg-emerald-500/80 text-white"
                        }
                      >
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

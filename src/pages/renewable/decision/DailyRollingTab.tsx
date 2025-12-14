import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, AlertTriangle, Info, TrendingUp, Zap, Battery, ArrowUpDown } from "lucide-react";

// 省份配置
const PROVINCES = [
  { id: "shandong", name: "山东省", stations: ["山东省场站A", "山东省场站B", "山东省场站C"] },
  { id: "shanxi", name: "山西省", stations: ["山西省场站A", "山西省场站B", "山西省场站C"] },
  { id: "zhejiang", name: "浙江省", stations: ["浙江省场站A", "浙江省场站B", "浙江省场站C"] },
];

// 生成策略数据
const generateStrategyData = (province: string) => {
  const baseMultiplier = province === "shandong" ? 1.2 : province === "shanxi" ? 1.0 : 0.9;
  return Array.from({ length: 8 }, (_, i) => {
    const hour = i * 3;
    const power = (80 + Math.random() * 40) * baseMultiplier;
    const volume = power * 3 * 0.85;
    const price = 350 + Math.random() * 100;
    const revenue = volume * price;
    const strategies = ["增加交易量", "维持现状", "减少交易量", "观望"];
    const risks: Array<"低" | "中" | "高"> = ["低", "中", "高"];
    return {
      timeSlot: `${hour.toString().padStart(2, '0')}:00-${(hour + 3).toString().padStart(2, '0')}:00`,
      power: power.toFixed(1),
      volume: volume.toFixed(1),
      price: price.toFixed(2),
      revenue: revenue.toFixed(0),
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      risk: risks[i % 3],
    };
  });
};

const DailyRollingTab = () => {
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedStation, setSelectedStation] = useState("all");
  const [tradingPeriod, setTradingPeriod] = useState("today");
  const [showStrategyBasis, setShowStrategyBasis] = useState(false);

  // 计算聚合指标
  const metrics = useMemo(() => {
    const multiplier = selectedProvince === "shandong" ? 1.2 : selectedProvince === "shanxi" ? 1.0 : 0.9;
    return {
      predictedGeneration: Math.floor(1250 * multiplier),
      suggestedVolume: Math.floor(980 * multiplier),
      expectedRevenue: (38.5 * multiplier).toFixed(1),
      confidence: (87.3 - Math.random() * 5).toFixed(1),
      installedCapacity: Math.floor(150 * multiplier),
      currentPosition: Math.floor(520 * multiplier),
      buyLimit: Math.floor(300 * multiplier),
      sellLimit: Math.floor(250 * multiplier),
    };
  }, [selectedProvince]);

  // 获取可用场站列表
  const availableStations = useMemo(() => {
    if (selectedProvince === "all") {
      return PROVINCES.flatMap(p => p.stations);
    }
    const province = PROVINCES.find(p => p.id === selectedProvince);
    return province ? province.stations : [];
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
            setSelectedStation("all");
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
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择交易单元" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部交易单元</SelectItem>
              {availableStations.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
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
          <Button>生成申报方案</Button>
        </div>
      </div>

      {/* 交易限制提示栏 */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <span className="font-medium">交易限制提醒：</span>
          单笔交易限额 <span className="font-mono font-semibold">{metrics.buyLimit} MWh</span> | 
          当日累计限额 <span className="font-mono font-semibold">{(metrics.buyLimit * 3)} MWh</span> | 
          偏差考核阈值 <span className="font-mono font-semibold">±5%</span>
        </AlertDescription>
      </Alert>

      {/* 8个指标卡 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">预测发电量</p>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">{metrics.predictedGeneration.toLocaleString()} MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">建议交易量</p>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">{metrics.suggestedVolume.toLocaleString()} MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">预期收益</p>
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
              <Battery className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">场站装机容量</p>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">{metrics.installedCapacity} MW</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">已持仓电量</p>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">{metrics.currentPosition} MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpDown className="h-4 w-4 text-green-600" />
              <p className="text-xs text-muted-foreground">买入限额</p>
            </div>
            <p className="text-2xl font-bold text-green-600 font-mono">{metrics.buyLimit} MWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpDown className="h-4 w-4 text-red-600" />
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
                  <h4 className="font-medium mb-2 text-sm">新能源出力预测</h4>
                  <p className="text-xs text-muted-foreground">
                    数据来源：功率预测系统<br />
                    厂家：金风科技、明阳智能<br />
                    更新时间：2025-12-14 06:00<br />
                    预测准确率：91.5%
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">装机量信息</h4>
                  <p className="text-xs text-muted-foreground">
                    总装机容量：{metrics.installedCapacity} MW<br />
                    风电占比：65%<br />
                    光伏占比：35%<br />
                    平均利用小时：2,100h
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">持仓分析结论</h4>
                  <p className="text-xs text-muted-foreground">
                    当前持仓：{metrics.currentPosition} MWh<br />
                    持仓成本：¥358.5/MWh<br />
                    建议操作：{metrics.currentPosition > 400 ? "适度减仓" : "可增仓"}<br />
                    风险评估：中低
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
              <Badge variant="outline" className="ml-2">
                {PROVINCES.find(p => p.id === selectedProvince)?.name} 一省一策
              </Badge>
            )}
          </CardTitle>
          <CardDescription>基于功率预测和市场分析的交易策略推荐</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-[#F1F8F4]">
                <TableRow>
                  <TableHead>时段</TableHead>
                  <TableHead className="text-right">预测功率 (MW)</TableHead>
                  <TableHead className="text-right">建议交易量 (MWh)</TableHead>
                  <TableHead className="text-right">预测价格 (¥/MWh)</TableHead>
                  <TableHead className="text-right">预期收益 (¥)</TableHead>
                  <TableHead>策略建议</TableHead>
                  <TableHead>风险等级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strategyData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-[#F8FBFA]">
                    <TableCell className="font-mono">{row.timeSlot}</TableCell>
                    <TableCell className="text-right font-mono">{row.power}</TableCell>
                    <TableCell className="text-right font-mono">{row.volume}</TableCell>
                    <TableCell className="text-right font-mono">{row.price}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">{row.revenue}</TableCell>
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

export default DailyRollingTab;

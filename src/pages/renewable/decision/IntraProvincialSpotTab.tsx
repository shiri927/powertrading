import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, Upload, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Cpu, LineChart, Edit3, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 功率预测厂家
const POWER_VENDORS = [
  { id: "jinfeng", name: "金风科技", color: "#00B04D" },
  { id: "mingyang", name: "明阳智能", color: "#2196F3" },
  { id: "xiehe", name: "协合新能源", color: "#FF9800" },
];

// 生成多厂家预测数据
const generateVendorPredictionData = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const basePower = 30 + Math.sin(i / 4) * 15 + Math.random() * 5;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      jinfeng: parseFloat((basePower + Math.random() * 3).toFixed(2)),
      mingyang: parseFloat((basePower + Math.random() * 3 - 1).toFixed(2)),
      xiehe: parseFloat((basePower + Math.random() * 3 - 2).toFixed(2)),
      aiOptimized: parseFloat((basePower * 1.05 + Math.random() * 2).toFixed(2)),
      original: parseFloat(basePower.toFixed(2)),
    };
  });
};

// 生成96点数据
const generate96PointData = () => {
  return Array.from({ length: 96 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const basePower = 30 + Math.sin(i / 16) * 15 + Math.random() * 3;
    const aiPower = basePower * (1 + (Math.random() - 0.3) * 0.1);
    return {
      id: i + 1,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      originalPower: parseFloat(basePower.toFixed(3)),
      aiOptimizedPower: parseFloat(aiPower.toFixed(3)),
      manualPower: null as number | null,
      finalPower: parseFloat(aiPower.toFixed(3)),
      expectedRevenue: parseFloat((aiPower * (350 + Math.random() * 50)).toFixed(2)),
    };
  });
};

// 数据下发状态
interface DispatchStatus {
  station: string;
  status: "success" | "failed" | "pending";
  time: string;
  message: string;
}

const IntraProvincialSpotTab = () => {
  const [selectedStation, setSelectedStation] = useState("shanxi-a");
  const [executionDate, setExecutionDate] = useState<Date>(new Date());
  const [adjustmentMode, setAdjustmentMode] = useState<"semi-auto" | "manual">("semi-auto");
  const [showManualAdjust, setShowManualAdjust] = useState(false);
  const [showVendorComparison, setShowVendorComparison] = useState(true);
  const [powerData, setPowerData] = useState(generate96PointData);
  const [dispatchRecords, setDispatchRecords] = useState<DispatchStatus[]>([
    { station: "山西省场站A", status: "success", time: "2025-12-14 08:30", message: "下发成功" },
    { station: "山西省场站B", status: "success", time: "2025-12-14 08:28", message: "下发成功" },
  ]);
  
  // 人工调整参数
  const [adjustStartTime, setAdjustStartTime] = useState("08:00");
  const [adjustEndTime, setAdjustEndTime] = useState("12:00");
  const [adjustMethod, setAdjustMethod] = useState<"percent" | "absolute">("percent");
  const [adjustValue, setAdjustValue] = useState([5]);

  const vendorData = useMemo(() => generateVendorPredictionData(), []);

  // AI策略指标
  const aiMetrics = useMemo(() => ({
    pricePrediction: (385.6 + Math.random() * 20).toFixed(2),
    priceConfidence: (87 + Math.random() * 8).toFixed(1),
    optimizationGain: (2.3 + Math.random() * 1.5).toFixed(1),
    marketSentiment: Math.random() > 0.5 ? "偏多" : "中性",
  }), []);

  // 应用人工调整
  const applyManualAdjustment = () => {
    const startHour = parseInt(adjustStartTime.split(':')[0]);
    const endHour = parseInt(adjustEndTime.split(':')[0]);
    
    const newData = powerData.map((item, index) => {
      const hour = Math.floor(index / 4);
      if (hour >= startHour && hour < endHour) {
        let adjusted: number;
        if (adjustMethod === "percent") {
          adjusted = item.aiOptimizedPower * (1 + adjustValue[0] / 100);
        } else {
          adjusted = item.aiOptimizedPower + adjustValue[0];
        }
        return {
          ...item,
          manualPower: parseFloat(adjusted.toFixed(3)),
          finalPower: parseFloat(adjusted.toFixed(3)),
        };
      }
      return item;
    });
    
    setPowerData(newData);
    toast.success("调整已应用", { description: `${adjustStartTime}-${adjustEndTime}时段功率已调整` });
  };

  // 下发数据
  const handleDispatch = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "正在下发策略曲线...",
        success: () => {
          setDispatchRecords(prev => [{
            station: selectedStation === "shanxi-a" ? "山西省场站A" : "山东省场站A",
            status: "success",
            time: format(new Date(), "yyyy-MM-dd HH:mm"),
            message: "下发成功"
          }, ...prev]);
          return "策略曲线下发成功！";
        },
        error: "下发失败，请重试",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* 顶部筛选栏 */}
      <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
        <div className="flex items-center gap-4">
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shanxi-a">山西省场站A</SelectItem>
              <SelectItem value="shanxi-b">山西省场站B</SelectItem>
              <SelectItem value="shandong-a">山东省场站A</SelectItem>
              <SelectItem value="zhejiang-a">浙江省场站A</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(executionDate, "yyyy-MM-dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={executionDate} onSelect={d => d && setExecutionDate(d)} />
            </PopoverContent>
          </Popover>
          <Button>查询</Button>
        </div>
        <div className="flex items-center gap-4">
          {/* 调整模式切换 */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
            <Label className="text-sm">调整模式:</Label>
            <Tabs value={adjustmentMode} onValueChange={(v) => setAdjustmentMode(v as "semi-auto" | "manual")}>
              <TabsList className="h-8">
                <TabsTrigger value="semi-auto" className="text-xs px-3 h-6">半人工</TabsTrigger>
                <TabsTrigger value="manual" className="text-xs px-3 h-6">纯人工</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Button variant="outline" onClick={handleDispatch}>
            <Send className="h-4 w-4 mr-1" />
            一键下发
          </Button>
        </div>
      </div>

      {/* 数据下发状态卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {dispatchRecords.slice(0, 4).map((record, i) => (
          <Card key={i} className={cn(
            "border-l-4",
            record.status === "success" ? "border-l-green-500" : 
            record.status === "failed" ? "border-l-red-500" : "border-l-amber-500"
          )}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{record.station}</span>
                {record.status === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : record.status === "failed" ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{record.time}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 功率预测厂家数据对比 */}
      <Collapsible open={showVendorComparison} onOpenChange={setShowVendorComparison}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  多厂家功率预测对比
                </CardTitle>
                {showVendorComparison ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={vendorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    {POWER_VENDORS.map(v => (
                      <Line key={v.id} type="monotone" dataKey={v.id} name={v.name} stroke={v.color} strokeWidth={2} dot={false} />
                    ))}
                    <Line type="monotone" dataKey="aiOptimized" name="AI优化" stroke="#E91E63" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* AI智能策略优化区 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            AI虚拟交易员策略优化
          </CardTitle>
          <CardDescription>基于AI量化模型的电价预测与策略调整建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">AI电价预测</p>
              <p className="text-xl font-bold font-mono text-primary">¥{aiMetrics.pricePrediction}/MWh</p>
              <p className="text-xs text-muted-foreground mt-1">置信度: {aiMetrics.priceConfidence}%</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1">策略优化增益</p>
              <p className="text-xl font-bold font-mono text-green-600">+{aiMetrics.optimizationGain}%</p>
              <p className="text-xs text-muted-foreground mt-1">预期收益提升</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">市场情绪</p>
              <p className="text-xl font-bold font-mono">{aiMetrics.marketSentiment}</p>
              <p className="text-xs text-muted-foreground mt-1">综合研判</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">推荐操作</p>
              <Badge className="mt-1">{parseFloat(aiMetrics.optimizationGain) > 2 ? "增加申报" : "维持现状"}</Badge>
              <p className="text-xs text-muted-foreground mt-2">基于当前市场状态</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 人工调整功能区 */}
      <Collapsible open={showManualAdjust} onOpenChange={setShowManualAdjust}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  {adjustmentMode === "semi-auto" ? "半人工调整" : "纯人工调整"}
                  <Badge variant="outline" className="ml-2">{adjustmentMode === "semi-auto" ? "基于AI策略微调" : "完全自定义"}</Badge>
                </CardTitle>
                {showManualAdjust ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-sm">起始时间</Label>
                  <Select value={adjustStartTime} onValueChange={setAdjustStartTime}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">结束时间</Label>
                  <Select value={adjustEndTime} onValueChange={setAdjustEndTime}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">调整方式</Label>
                  <Select value={adjustMethod} onValueChange={(v) => setAdjustMethod(v as "percent" | "absolute")}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">百分比调整</SelectItem>
                      <SelectItem value="absolute">绝对值调整</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">调整幅度 ({adjustMethod === "percent" ? "%" : "MW"})</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider 
                      value={adjustValue} 
                      onValueChange={setAdjustValue}
                      min={-20}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="font-mono w-12 text-right">{adjustValue[0]}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPowerData(generate96PointData())}>重置</Button>
                <Button variant="outline">预览</Button>
                <Button onClick={applyManualAdjustment}>应用调整</Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 96点功率策略表格 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">日前功率策略曲线</CardTitle>
            <CardDescription>96点功率预测与优化数据</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  历史下发记录
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>历史下发记录</DialogTitle>
                  <DialogDescription>查看近期策略曲线下发记录</DialogDescription>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>场站</TableHead>
                      <TableHead>下发时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dispatchRecords.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.station}</TableCell>
                        <TableCell className="font-mono">{r.time}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "success" ? "default" : "destructive"}>
                            {r.status === "success" ? "成功" : "失败"}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              导入
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              导出
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#E8F0EC]">
                <TableRow className="border-b-2 border-primary">
                  <TableHead className="text-center w-16">序号</TableHead>
                  <TableHead className="text-center">时间</TableHead>
                  <TableHead className="text-center">原始预测 (MW)</TableHead>
                  <TableHead className="text-center">AI优化 (MW)</TableHead>
                  <TableHead className="text-center">人工调整 (MW)</TableHead>
                  <TableHead className="text-center">最终申报 (MW)</TableHead>
                  <TableHead className="text-center">预期收益 (¥)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {powerData.map(row => (
                  <TableRow key={row.id} className="hover:bg-[#F8FBFA]">
                    <TableCell className="text-center font-mono">{row.id}</TableCell>
                    <TableCell className="text-center font-mono">{row.time}</TableCell>
                    <TableCell className="text-center font-mono">{row.originalPower.toFixed(3)}</TableCell>
                    <TableCell className="text-center font-mono text-primary">{row.aiOptimizedPower.toFixed(3)}</TableCell>
                    <TableCell className="text-center font-mono">
                      {row.manualPower !== null ? (
                        <span className="text-amber-600">{row.manualPower.toFixed(3)}</span>
                      ) : '--'}
                    </TableCell>
                    <TableCell className="text-center font-mono font-medium">{row.finalPower.toFixed(3)}</TableCell>
                    <TableCell className="text-center font-mono text-green-600">{row.expectedRevenue.toFixed(2)}</TableCell>
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

export default IntraProvincialSpotTab;

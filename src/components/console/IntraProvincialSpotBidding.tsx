import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarIcon, Search, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// 生成96点功率预测数据
const generatePowerPredictionData = () => {
  return Array.from({ length: 96 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const basePower = 20 + Math.sin(i / 10) * 8 + Math.random() * 5;
    return {
      id: i + 1,
      time: timeStr,
      originalPower: parseFloat(basePower.toFixed(3)),
      pendingPower: parseFloat(basePower.toFixed(3)),
      expectedRevenue: null as number | null,
    };
  });
};

interface IntraProvincialSpotBiddingProps {
  showRecommendationAlert?: boolean;
}

const IntraProvincialSpotBidding = ({ showRecommendationAlert }: IntraProvincialSpotBiddingProps) => {
  const [tradingUnit, setTradingUnit] = useState("shanxi-demo");
  const [executionDate, setExecutionDate] = useState<Date>(new Date(2025, 10, 7));
  const [timeStart, setTimeStart] = useState("00:15");
  const [timeEnd, setTimeEnd] = useState("24:00");
  const [correctionMethod, setCorrectionMethod] = useState("ratio");
  const [adjustmentRatio, setAdjustmentRatio] = useState("1.00");
  const [powerData, setPowerData] = useState(generatePowerPredictionData);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // 策略收入预测
  const strategyPredictions = useMemo(() => ({
    pending: null as number | null,
    recommended: null as number | null,
    default: null as number | null,
  }), []);

  const handleAdjust = () => {
    const ratio = parseFloat(adjustmentRatio);
    if (isNaN(ratio)) return;
    
    setPowerData(prev => prev.map(item => ({
      ...item,
      pendingPower: parseFloat((item.originalPower * ratio).toFixed(3))
    })));
  };

  const handleSave = () => {
    // 保存逻辑
    console.log("Saving power data...");
  };

  const handlePublish = () => {
    // 下发逻辑
    console.log("Publishing power data...");
  };

  return (
    <div className="space-y-4">
      {/* 顶部筛选栏 */}
      <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">交易单元</span>
          <Select value={tradingUnit} onValueChange={setTradingUnit}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shanxi-demo">山西演示交易单元</SelectItem>
              <SelectItem value="shandong-a">山东省场站A</SelectItem>
              <SelectItem value="shandong-b">山东省场站B</SelectItem>
              <SelectItem value="zhejiang-a">浙江省场站A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">交易执行日</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40 justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(executionDate, "yyyy-MM-dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={executionDate}
                onSelect={(date) => date && setExecutionDate(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button className="bg-primary hover:bg-primary/90">
          <Search className="h-4 w-4 mr-1" />
          查询
        </Button>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <Settings className="h-4 w-4 mr-1" />
          配置
        </Button>
      </div>

      {/* 日前交易策略下发区域 */}
      <Card className="border">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">日前交易策略下发</h3>
          
          {/* 三个策略收入预测卡片 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-[#F8FBFA]">
              <div className="text-sm text-muted-foreground mb-1">待下发策略-结算收入预测(元)</div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {strategyPredictions.pending !== null ? strategyPredictions.pending.toLocaleString() : '--'}
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-[#F8FBFA]">
              <div className="text-sm text-muted-foreground mb-1">推荐策略-结算收入预测(元)</div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {strategyPredictions.recommended !== null ? strategyPredictions.recommended.toLocaleString() : '--'}
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-[#F8FBFA]">
              <div className="text-sm text-muted-foreground mb-1">默认策略-结算收入预测(元)</div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {strategyPredictions.default !== null ? strategyPredictions.default.toLocaleString() : '--'}
              </div>
            </div>
          </div>

          {/* 时间和调整控制栏 */}
          <div className="flex items-center justify-between gap-4 flex-wrap p-3 bg-[#F1F8F4] rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">时间</span>
                <Input 
                  value={timeStart} 
                  onChange={(e) => setTimeStart(e.target.value)}
                  className="w-20 h-8 text-sm font-mono text-center"
                />
                <span className="text-muted-foreground">~</span>
                <Input 
                  value={timeEnd} 
                  onChange={(e) => setTimeEnd(e.target.value)}
                  className="w-20 h-8 text-sm font-mono text-center"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">功率预测修正方式</span>
                <Select value={correctionMethod} onValueChange={setCorrectionMethod}>
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ratio">调整比例</SelectItem>
                    <SelectItem value="fixed">固定值</SelectItem>
                    <SelectItem value="offset">偏移量</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input 
                value={adjustmentRatio}
                onChange={(e) => setAdjustmentRatio(e.target.value)}
                className="w-20 h-8 text-sm font-mono text-right"
              />

              <Button variant="outline" size="sm" onClick={handleAdjust}>调整</Button>
              <Button variant="outline" size="sm" className="border-primary text-primary" onClick={handleSave}>保存</Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handlePublish}>下发</Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">自动申报</Button>
              <Button variant="outline" size="sm">原始策略</Button>
              <Button variant="outline" size="sm">推荐策略</Button>
              <Button variant="outline" size="sm">操作记录</Button>
            </div>
          </div>

          {/* 功率预测数据表格 */}
          <div className="rounded-lg border overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="bg-[#E8F0EC] border-b-2 border-primary">
                    <TableHead className="w-16 text-center font-semibold text-foreground">序号</TableHead>
                    <TableHead className="w-24 text-center font-semibold text-foreground">时间</TableHead>
                    <TableHead className="text-center font-semibold text-foreground">原始短期功率预测(MW)</TableHead>
                    <TableHead className="text-center font-semibold text-foreground">待下发短期功率预测(MW)</TableHead>
                    <TableHead className="text-center font-semibold text-foreground">预期机会收益(元)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {powerData.map((row, index) => (
                    <TableRow 
                      key={row.id}
                      className={cn(
                        "transition-colors cursor-pointer",
                        selectedRow === row.id ? "bg-primary/10" : "hover:bg-[#F8FBFA]"
                      )}
                      onClick={() => setSelectedRow(row.id)}
                    >
                      <TableCell className="text-center font-mono text-sm">{row.id}</TableCell>
                      <TableCell className="text-center font-mono text-sm">{row.time}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-sm">{row.originalPower.toFixed(3)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={row.pendingPower}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value);
                            if (!isNaN(newValue)) {
                              setPowerData(prev => prev.map(item => 
                                item.id === row.id ? { ...item, pendingPower: newValue } : item
                              ));
                            }
                          }}
                          className="w-28 h-8 text-center font-mono text-sm mx-auto"
                          step="0.001"
                        />
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm text-muted-foreground">
                        {row.expectedRevenue !== null ? row.expectedRevenue.toFixed(2) : '--'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntraProvincialSpotBidding;

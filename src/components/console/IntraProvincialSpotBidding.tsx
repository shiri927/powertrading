import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmbeddedRecommendation } from "./EmbeddedRecommendation";
import { StrategyRecommendation } from "@/lib/trading/recommendation-engine";

// 生成96点功率预测数据
const generatePowerPredictionData = () => {
  return Array.from({
    length: 96
  }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = i % 4 * 15;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const basePower = 20 + Math.sin(i / 10) * 8 + Math.random() * 5;
    return {
      id: i + 1,
      time: timeStr,
      originalPower: parseFloat(basePower.toFixed(3)),
      pendingPower: parseFloat(basePower.toFixed(3)),
      expectedRevenue: null as number | null
    };
  });
};
interface IntraProvincialSpotBiddingProps {
  showRecommendationAlert?: boolean;
}
const IntraProvincialSpotBidding = ({
  showRecommendationAlert
}: IntraProvincialSpotBiddingProps) => {
  const [activeTab, setActiveTab] = useState("bidding");
  const [tradingUnit, setTradingUnit] = useState("shanxi-demo");
  const [executionDate, setExecutionDate] = useState<Date>(new Date(2025, 10, 7));
  const [powerData, setPowerData] = useState(generatePowerPredictionData);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // 策略收入预测
  const strategyPredictions = useMemo(() => ({
    pending: null as number | null,
    recommended: null as number | null,
    default: null as number | null
  }), []);

  // 应用推荐策略到申报
  const handleApplyRecommendation = (recommendation: StrategyRecommendation) => {
    // 根据推荐的操作调整功率数据
    const actions = recommendation.suggestedActions;

    // 简化处理：根据推荐策略调整功率预测
    const adjustedData = powerData.map((item, index) => {
      // 根据时间段应用不同的调整
      const hour = Math.floor(index / 4);
      let adjustmentFactor = 1.0;

      // 根据推荐操作类型调整
      actions.forEach(action => {
        const actionHour = parseInt(action.time.split(':')[0]);
        if (Math.abs(hour - actionHour) <= 2) {
          if (action.action === 'buy') {
            adjustmentFactor *= 0.95; // 买入时降低申报功率
          } else if (action.action === 'sell') {
            adjustmentFactor *= 1.05; // 卖出时提高申报功率
          }
        }
      });
      return {
        ...item,
        pendingPower: parseFloat((item.originalPower * adjustmentFactor).toFixed(3)),
        expectedRevenue: parseFloat((item.originalPower * adjustmentFactor * (300 + Math.random() * 100)).toFixed(2))
      };
    });
    setPowerData(adjustedData);
    setActiveTab("bidding");
    toast.success("策略已应用", {
      description: "推荐策略已预填到申报数据中，请检查并提交"
    });
  };
  return <div className="space-y-4">
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
              <Calendar mode="single" selected={executionDate} onSelect={date => date && setExecutionDate(date)} initialFocus className="pointer-events-auto" />
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

      {/* 主要内容区域 - 带标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#F1F8F4] border">
          <TabsTrigger value="bidding" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            策略申报
          </TabsTrigger>
          <TabsTrigger value="recommendation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            推荐策略
          </TabsTrigger>
        </TabsList>

        {/* 策略申报 Tab */}
        <TabsContent value="bidding" className="mt-4">
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

              {/* 操作按钮栏 */}
              <div className="flex items-center justify-end gap-2 p-3 bg-[#F1F8F4] rounded-lg">
                <Button variant="outline" size="sm">自动申报</Button>
                <Button variant="outline" size="sm">原始策略</Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("recommendation")}>
                  推荐策略
                </Button>
                <Button variant="outline" size="sm">操作记录</Button>
              </div>

              {/* 功率预测数据表格 */}
              <div className="rounded-lg border overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-[#E8F0EC] border-b-2 border-primary">
                        <TableHead className="w-16 text-center font-semibold text-foreground">序号</TableHead>
                        <TableHead className="w-24 text-center font-semibold text-foreground">时间</TableHead>
                        <TableHead className="text-center font-semibold text-foreground">预计用电量(MW)</TableHead>
                        <TableHead className="text-center font-semibold text-foreground">预期机会收益(元)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {powerData.map(row => <TableRow key={row.id} className={cn("transition-colors cursor-pointer", selectedRow === row.id ? "bg-primary/10" : "hover:bg-[#F8FBFA]")} onClick={() => setSelectedRow(row.id)}>
                          <TableCell className="text-center font-mono text-sm">{row.id}</TableCell>
                          <TableCell className="text-center font-mono text-sm">{row.time}</TableCell>
                          <TableCell className="text-center">
                            <span className="font-mono text-sm">{row.originalPower.toFixed(3)}</span>
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm text-muted-foreground">
                            {row.expectedRevenue !== null ? row.expectedRevenue.toFixed(2) : '--'}
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 推荐策略 Tab */}
        <TabsContent value="recommendation" className="mt-4">
          <EmbeddedRecommendation onApplyRecommendation={handleApplyRecommendation} />
        </TabsContent>
      </Tabs>
    </div>;
};
export default IntraProvincialSpotBidding;
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Settings, Calendar, Zap } from "lucide-react";
import { StrategyConfigTab } from "./decision/StrategyConfigTab";
import { BacktestTab } from "./decision/BacktestTab";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Decision = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">智能决策中心</h1>
        <p className="text-muted-foreground mt-2">
          AI驱动的新能源交易策略生成与决策支持系统
        </p>
      </div>

      <Tabs defaultValue="strategy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#F1F8F4]">
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            策略配置中心
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            回测与模拟
          </TabsTrigger>
          <TabsTrigger value="daily-rolling" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            日滚交易策略
          </TabsTrigger>
          <TabsTrigger value="intra-provincial" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            省内现货交易
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy">
          <StrategyConfigTab />
        </TabsContent>

        <TabsContent value="backtest">
          <BacktestTab />
        </TabsContent>

        <TabsContent value="daily-rolling" className="space-y-6">
          {/* 日滚交易策略 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择交易单元" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部交易单元</SelectItem>
                  <SelectItem value="sd-a">山东省场站A</SelectItem>
                  <SelectItem value="sd-b">山东省场站B</SelectItem>
                  <SelectItem value="sx-a">山西省场站A</SelectItem>
                  <SelectItem value="zj-a">浙江省场站A</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="today">
                <SelectTrigger className="w-[150px]">
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

          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">预测发电量</p>
                <p className="text-2xl font-bold text-primary font-mono">1,250 MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">建议交易量</p>
                <p className="text-2xl font-bold text-primary font-mono">980 MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">预期收益</p>
                <p className="text-2xl font-bold text-green-600 font-mono">¥ 38.5万</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">策略置信度</p>
                <p className="text-2xl font-bold text-primary font-mono">87.3%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">日滚交易策略建议</CardTitle>
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
                    {Array.from({ length: 8 }, (_, i) => {
                      const hour = i * 3;
                      const power = 80 + Math.random() * 40;
                      const volume = power * 3 * 0.85;
                      const price = 350 + Math.random() * 100;
                      const revenue = volume * price;
                      const strategies = ["增加交易量", "维持现状", "减少交易量", "观望"];
                      const risks = ["低", "中", "高"];
                      return (
                        <TableRow key={i} className="hover:bg-[#F8FBFA]">
                          <TableCell className="font-mono">{`${hour.toString().padStart(2, '0')}:00-${(hour + 3).toString().padStart(2, '0')}:00`}</TableCell>
                          <TableCell className="text-right font-mono">{power.toFixed(1)}</TableCell>
                          <TableCell className="text-right font-mono">{volume.toFixed(1)}</TableCell>
                          <TableCell className="text-right font-mono">{price.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-green-600">{revenue.toFixed(0)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{strategies[Math.floor(Math.random() * strategies.length)]}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={i % 3 === 2 ? "destructive" : i % 3 === 1 ? "secondary" : "default"}>
                              {risks[i % 3]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intra-provincial" className="space-y-6">
          {/* 省内现货交易 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择交易单元" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部交易单元</SelectItem>
                  <SelectItem value="sd-a">山东省场站A</SelectItem>
                  <SelectItem value="sd-b">山东省场站B</SelectItem>
                  <SelectItem value="sx-a">山西省场站A</SelectItem>
                  <SelectItem value="zj-a">浙江省场站A</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="day-ahead">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="市场类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day-ahead">日前市场</SelectItem>
                  <SelectItem value="intraday">日内市场</SelectItem>
                  <SelectItem value="realtime">实时市场</SelectItem>
                </SelectContent>
              </Select>
              <Button>查询</Button>
              <Button variant="outline">重置</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">查看历史</Button>
              <Button>一键申报</Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">日前预测价格</p>
                <p className="text-2xl font-bold text-primary font-mono">¥ 385.6/MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">实时市场价格</p>
                <p className="text-2xl font-bold text-primary font-mono">¥ 392.3/MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">价差机会</p>
                <p className="text-2xl font-bold text-green-600 font-mono">+6.7 ¥/MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">市场波动率</p>
                <p className="text-2xl font-bold text-warning font-mono">12.5%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">省内现货交易策略</CardTitle>
              <CardDescription>基于市场价格预测的现货交易建议</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-[#F1F8F4]">
                    <TableRow>
                      <TableHead>时段</TableHead>
                      <TableHead className="text-right">日前价格预测</TableHead>
                      <TableHead className="text-right">实时价格预测</TableHead>
                      <TableHead className="text-right">价差</TableHead>
                      <TableHead className="text-right">建议交易量</TableHead>
                      <TableHead>交易方向</TableHead>
                      <TableHead>置信度</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }, (_, i) => {
                      const dayAhead = 350 + Math.random() * 80;
                      const realtime = dayAhead + (Math.random() - 0.5) * 30;
                      const spread = realtime - dayAhead;
                      const volume = 20 + Math.random() * 30;
                      const confidence = 70 + Math.random() * 25;
                      return (
                        <TableRow key={i} className="hover:bg-[#F8FBFA]">
                          <TableCell className="font-mono">{`${i.toString().padStart(2, '0')}:00`}</TableCell>
                          <TableCell className="text-right font-mono">{dayAhead.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono">{realtime.toFixed(2)}</TableCell>
                          <TableCell className={`text-right font-mono ${spread > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {spread > 0 ? '+' : ''}{spread.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">{volume.toFixed(1)} MWh</TableCell>
                          <TableCell>
                            <Badge variant={spread > 0 ? "default" : "secondary"}>
                              {spread > 0 ? "买入" : "卖出"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-mono ${confidence > 85 ? 'text-green-600' : confidence > 75 ? 'text-primary' : 'text-muted-foreground'}`}>
                              {confidence.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Decision;

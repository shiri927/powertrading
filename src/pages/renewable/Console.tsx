import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Terminal, Plus, Upload, Download, Copy, Clock, Send } from "lucide-react";
import { useState } from "react";

// 模拟24小时申报数据
const generateBidData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i + 1,
    buyDirection: i >= 6 && i <= 22,
    priceUp: (300 + Math.random() * 500).toFixed(2),
    priceDown: (200 + Math.random() * 300).toFixed(2),
    buyEnergy: (95 + Math.random() * 10).toFixed(3),
    sellEnergy: (850 + Math.random() * 100).toFixed(3),
    participation: i % 3 === 0 ? "撤单后盖" : i % 5 === 0 ? "交易撤盖" : "撤单后盖",
    limit1Energy: [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 20, 21, 22].includes(i) ? (10 + Math.random() * 50).toFixed(0) : "0",
    limit1Price: [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 20, 21, 22].includes(i) ? (250 + Math.random() * 350).toFixed(2) : "0.00",
    bidStatus: i % 4 === 0 ? "success" : i % 3 === 0 ? "pending" : "none",
    winRate: [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 20, 21, 22].includes(i) ? `${(30 + Math.random() * 70).toFixed(0)}%` : `${(0).toFixed(0)}%`,
  }));
};

const Console = () => {
  const [bidData, setBidData] = useState(generateBidData());
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentScheme, setCurrentScheme] = useState("scheme1");
  const [tradeDirections, setTradeDirections] = useState<Record<number, number>>({});

  const toggleRowSelection = (hour: number) => {
    setSelectedRows(prev => 
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const setTradeDirection = (hour: number, direction: number) => {
    setTradeDirections(prev => ({
      ...prev,
      [hour]: direction
    }));
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">交易操作台</h1>
        <p className="text-muted-foreground mt-2">
          中长期、日前、实时交易申报与执行
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            交易执行中心
          </CardTitle>
          <CardDescription>
            统一的交易申报与监控平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="centralized" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="centralized">集中竞价申报</TabsTrigger>
              <TabsTrigger value="rolling">日滚动交易申报</TabsTrigger>
              <TabsTrigger value="inter-provincial">省间现货申报</TabsTrigger>
              <TabsTrigger value="intra-provincial">省内现货申报</TabsTrigger>
            </TabsList>
            
            <TabsContent value="centralized" className="space-y-4">
              {/* 筛选条件区 */}
              <div className="flex items-center gap-4 flex-wrap">
                <Select defaultValue="shanxi">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shanxi">山西省交易中心</SelectItem>
                    <SelectItem value="shandong">山东省交易中心</SelectItem>
                    <SelectItem value="zhejiang">浙江省交易中心</SelectItem>
                  </SelectContent>
                </Select>

                <Input type="date" defaultValue="2024-04-15" className="w-48" />

                <Select defaultValue="next-month">
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next-month">2024年4月21-30日下午2时段电能采购交易</SelectItem>
                    <SelectItem value="current-month">2024年4月1-20日交易</SelectItem>
                  </SelectContent>
                </Select>

                <Button>查询</Button>
              </div>

              {/* 方案标签页 */}
              <div className="flex items-center gap-2 border-b border-border">
                <Button 
                  variant={currentScheme === "scheme1" ? "default" : "ghost"}
                  onClick={() => setCurrentScheme("scheme1")}
                  size="sm"
                >
                  交易员1
                </Button>
                <Button 
                  variant={currentScheme === "scheme2" ? "default" : "ghost"}
                  onClick={() => setCurrentScheme("scheme2")}
                  size="sm"
                >
                  交易员2
                </Button>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  新增
                </Button>
              </div>

              {/* 操作按钮区 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select defaultValue="unit1">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="交易单元" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit1">大任一期</SelectItem>
                      <SelectItem value="unit2">大任二期</SelectItem>
                    </SelectContent>
                  </Select>

                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    挂单预期时间
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    一次报价
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    一次中标
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    二次中标
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                    二次结选
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    保护机报价：出清 0
                  </span>
                  <Badge variant="secondary">固定金额</Badge>
                  <Input type="number" defaultValue="0" className="w-24" />
                </div>
              </div>

              {/* 申报表格 */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="w-16">时点</TableHead>
                      <TableHead>
                        交易方向
                        <div className="text-xs text-muted-foreground font-normal mt-1">
                          (卖出、不交易、买入、无策略)
                        </div>
                      </TableHead>
                      <TableHead>价格上限<br />(元/MWh)</TableHead>
                      <TableHead>价格下限<br />(元/MWh)</TableHead>
                      <TableHead>买入期能<br />(%)</TableHead>
                      <TableHead>卖出期能<br />(%)</TableHead>
                      <TableHead>参与度</TableHead>
                      <TableHead>限一中能等价<br />(MWh)</TableHead>
                      <TableHead>限一中能报价<br />(元/MWh)</TableHead>
                      <TableHead>参全能</TableHead>
                      <TableHead>限二中能等价<br />(MWh)</TableHead>
                      <TableHead>限二中能报价<br />(元/MWh)</TableHead>
                      <TableHead>中标价格比<br />(%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bidData.map((row) => (
                      <TableRow key={row.hour} className="hover:bg-muted/30">
                        <TableCell>
                          <Checkbox 
                            checked={selectedRows.includes(row.hour)}
                            onCheckedChange={() => toggleRowSelection(row.hour)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{row.hour}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant={tradeDirections[row.hour] === 0 ? "destructive" : "outline"}
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => setTradeDirection(row.hour, 0)}
                              title="卖出"
                            >
                              卖
                            </Button>
                            <Button 
                              size="sm" 
                              variant={tradeDirections[row.hour] === 1 ? "secondary" : "outline"}
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => setTradeDirection(row.hour, 1)}
                              title="不交易"
                            >
                              无
                            </Button>
                            <Button 
                              size="sm" 
                              variant={tradeDirections[row.hour] === 2 ? "default" : "outline"}
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => setTradeDirection(row.hour, 2)}
                              title="买入"
                            >
                              买
                            </Button>
                            <Button 
                              size="sm" 
                              variant={tradeDirections[row.hour] === 3 ? "ghost" : "outline"}
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => setTradeDirection(row.hour, 3)}
                              title="无策略"
                            >
                              -
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{row.priceUp}</TableCell>
                        <TableCell>{row.priceDown}</TableCell>
                        <TableCell>{row.buyEnergy}</TableCell>
                        <TableCell>{row.sellEnergy}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {row.participation}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.limit1Energy}</TableCell>
                        <TableCell>{row.limit1Price}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {row.participation}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.limit1Energy}</TableCell>
                        <TableCell>{row.limit1Price}</TableCell>
                        <TableCell>{row.winRate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 底部操作按钮 */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    连续扭选
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    导入
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    导出
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-1" />
                    定时申报
                  </Button>
                  <Button>
                    <Send className="h-4 w-4 mr-1" />
                    立即申报
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rolling" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                日滚动交易申报功能开发中...
              </div>
            </TabsContent>
            
            <TabsContent value="inter-provincial" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                省间现货申报功能开发中...
              </div>
            </TabsContent>
            
            <TabsContent value="intra-provincial" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                省内现货申报功能开发中...
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Console;

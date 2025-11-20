import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const tradingData = [
  {
    date: "20240416",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "2024年04月16日曲线交易(2024-4-18)",
    time: "1000-1600",
    period: "20240418-20240418"
  },
  {
    date: "20240416",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "2024年04月16日曲线交易(2024-4-19)",
    time: "1000-1600",
    period: "20240419-20240419"
  },
  {
    date: "20240416",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "2024年04月16日曲线交易(2024-4-20)",
    time: "1000-1600",
    period: "20240420-20240420"
  },
  {
    date: "20240416",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "发电商2024年4月21-30日『午后高峰调整交易』(现...",
    time: "1300-1500",
    period: "20240421-20240430"
  },
  {
    date: "20240416",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "发电商2024年4月21-30日『晚间高峰调整交易』(现...",
    time: "1000-1100",
    period: "20240421-20240430"
  },
  {
    date: "20240418",
    center: "山东电力交易中心",
    type: "交易序列",
    content: "2024年5月挂牌1号曲线交易",
    time: "0900-1100",
    period: "20240501-20240531"
  },
  {
    date: "20240418",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "2024年5月挂牌1号1天临时组合交易补偿措施(组...",
    time: "0900-1200",
    period: "20240501-20240531"
  },
  {
    date: "20240424",
    center: "浙江电力交易中心",
    type: "交易序列",
    content: "发电商2024年5月5日晚间高峰组合交易(曲线交易)",
    time: "1300-1500",
    period: "20240501-20240531"
  },
  {
    date: "20240424",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "发电商2024年5月交易组合高峰时段交易",
    time: "0900-1100",
    period: "20240501-20240531"
  },
  {
    date: "20240425",
    center: "山东电力交易中心",
    type: "交易序列",
    content: "2024年5月1-10日上午时段组合交易(曲线交易)",
    time: "1000-1600",
    period: "20240501-20240510"
  },
  {
    date: "20240425",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "2024年5月1-10日上午对外报量上交易(曲线交易)",
    time: "0915-0925",
    period: "20240501-20240531"
  },
  {
    date: "20240401",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "2024年04月01日曲线交易(2024-4-3)",
    time: "1000-1600",
    period: "20240403-20240403"
  },
  {
    date: "20240401",
    center: "浙江电力交易中心",
    type: "交易序列",
    content: "2024年04月01日曲线交易(2024-4-4)",
    time: "1000-1600",
    period: "20240404-20240404"
  },
  {
    date: "20240401",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "2024年04月01日曲线交易(2024-4-5)",
    time: "1000-1600",
    period: "20240405-20240405"
  },
  {
    date: "20240402",
    center: "山东电力交易中心",
    type: "交易序列",
    content: "发电商2024年4月6-15日『午后高峰调整交易』(现...",
    time: "1300-1500",
    period: "20240406-20240415"
  },
  {
    date: "20240402",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "发电商2024年4月6-15日『晚间高峰调整交易』(现...",
    time: "1000-1100",
    period: "20240406-20240415"
  }
];

const TradingLedger = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tradingCenter, setTradingCenter] = useState("全部");
  const [tradingUnit, setTradingUnit] = useState("全部");
  const [keyword, setKeyword] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [showOngoing, setShowOngoing] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [activeView, setActiveView] = useState("list");

  const filteredData = useMemo(() => {
    return tradingData.filter(item => {
      if (tradingCenter !== "全部" && item.center !== tradingCenter) return false;
      if (keyword && !item.content.toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [tradingCenter, keyword]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">交易台账</h1>
        <p className="text-muted-foreground mt-2">
          查看和管理新能源发电侧的所有交易记录
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧日历 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>选择日期</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* 筛选选项 */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>筛选条件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">交易中心</label>
                <Select value={tradingCenter} onValueChange={setTradingCenter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="山西电力交易中心">山西电力交易中心</SelectItem>
                    <SelectItem value="山东电力交易中心">山东电力交易中心</SelectItem>
                    <SelectItem value="浙江电力交易中心">浙江电力交易中心</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">交易单元</label>
                <Select value={tradingUnit} onValueChange={setTradingUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="单元1">单元1</SelectItem>
                    <SelectItem value="单元2">单元2</SelectItem>
                    <SelectItem value="单元3">单元3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">关键字</label>
                <Input
                  placeholder="输入关键字搜索"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium block">状态筛选</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={showCompleted}
                    onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
                  />
                  <label htmlFor="completed" className="text-sm cursor-pointer">
                    已完成
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ongoing"
                    checked={showOngoing}
                    onCheckedChange={(checked) => setShowOngoing(checked as boolean)}
                  />
                  <label htmlFor="ongoing" className="text-sm cursor-pointer">
                    进行中
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="upcoming"
                    checked={showUpcoming}
                    onCheckedChange={(checked) => setShowUpcoming(checked as boolean)}
                  />
                  <label htmlFor="upcoming" className="text-sm cursor-pointer">
                    未开始
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧交易记录 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>交易记录</CardTitle>
                <Tabs value={activeView} onValueChange={setActiveView}>
                  <TabsList>
                    <TabsTrigger value="list">列表视图</TabsTrigger>
                    <TabsTrigger value="timeline">时间轴视图</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeView}>
                <TabsContent value="list" className="mt-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日期</TableHead>
                          <TableHead>交易中心</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>内容</TableHead>
                          <TableHead>交易时间</TableHead>
                          <TableHead>执行起止时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.length > 0 ? (
                          filteredData.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(item.date)}</TableCell>
                              <TableCell>{item.center}</TableCell>
                              <TableCell>{item.type}</TableCell>
                              <TableCell className="max-w-md">{item.content}</TableCell>
                              <TableCell>{item.time}</TableCell>
                              <TableCell>{item.period}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              暂无交易记录
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0">
                  <div className="space-y-4">
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                                {formatDate(item.date)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium mb-1">{item.content}</div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div>交易中心: {item.center}</div>
                                  <div>类型: {item.type}</div>
                                  <div>交易时间: {item.time}</div>
                                  <div>执行期间: {item.period}</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        暂无交易记录
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TradingLedger;

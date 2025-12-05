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

const tradingData = [{
  date: "20240416",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年04月16日曲线交易(2024-4-18)",
  time: "1000-1600",
  period: "20240418-20240418"
}, {
  date: "20240416",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年04月16日曲线交易(2024-4-19)",
  time: "1000-1600",
  period: "20240419-20240419"
}, {
  date: "20240416",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年04月16日曲线交易(2024-4-20)",
  time: "1000-1600",
  period: "20240420-20240420"
}, {
  date: "20240416",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "发电商2024年4月21-30日『午后高峰调整交易』(现...",
  time: "1300-1500",
  period: "20240421-20240430"
}, {
  date: "20240416",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "发电商2024年4月21-30日『晚间高峰调整交易』(现...",
  time: "1000-1100",
  period: "20240421-20240430"
}, {
  date: "20240418",
  center: "山东电力交易中心",
  type: "交易序列",
  content: "2024年5月挂牌1号曲线交易",
  time: "0900-1100",
  period: "20240501-20240531"
}, {
  date: "20240418",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年5月挂牌1号1天临时组合交易补偿措施(组...",
  time: "0900-1200",
  period: "20240501-20240531"
}, {
  date: "20240424",
  center: "浙江电力交易中心",
  type: "交易序列",
  content: "发电商2024年5月5日晚间高峰组合交易(曲线交易)",
  time: "1300-1500",
  period: "20240501-20240531"
}, {
  date: "20240424",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "发电商2024年5月交易组合高峰时段交易",
  time: "0900-1100",
  period: "20240501-20240531"
}, {
  date: "20240425",
  center: "山东电力交易中心",
  type: "交易序列",
  content: "2024年5月1-10日上午时段组合交易(曲线交易)",
  time: "1000-1600",
  period: "20240501-20240510"
}, {
  date: "20240425",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年5月1-10日上午对外报量上交易(曲线交易)",
  time: "0915-0925",
  period: "20240501-20240531"
}, {
  date: "20240401",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年04月01日曲线交易(2024-4-3)",
  time: "1000-1600",
  period: "20240403-20240403"
}, {
  date: "20240401",
  center: "浙江电力交易中心",
  type: "交易序列",
  content: "2024年04月01日曲线交易(2024-4-4)",
  time: "1000-1600",
  period: "20240404-20240404"
}, {
  date: "20240401",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年04月01日曲线交易(2024-4-5)",
  time: "1000-1600",
  period: "20240405-20240405"
}, {
  date: "20240401",
  center: "山东电力交易中心",
  type: "交易序列",
  content: "2024年04月01日曲线交易(2024-4-6)",
  time: "1000-1600",
  period: "20240406-20240406"
}, {
  date: "20240401",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年04月01日曲线交易(2024-4-7)",
  time: "1000-1600",
  period: "20240407-20240407"
}, {
  date: "20240401",
  center: "山西电力交易中心",
  type: "交易序列",
  content: "2024年04月01日曲线交易(2024-4-8)",
  time: "1000-1600",
  period: "20240408-20240408"
}];

export default function TradingLedger() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2024, 3, 1));
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState("sequence");

  const filteredData = useMemo(() => {
    return tradingData.filter(row => {
      if (selectedCenter !== "all") {
        const centerMap: Record<string, string> = {
          shanxi: "山西电力交易中心",
          shandong: "山东电力交易中心",
          zhejiang: "浙江电力交易中心"
        };
        if (row.center !== centerMap[selectedCenter]) return false;
      }
      if (keyword && !row.content.toLowerCase().includes(keyword.toLowerCase())) {
        return false;
      }
      if (filterDate) {
        const filterDateStr = format(filterDate, "yyyyMMdd");
        if (row.date !== filterDateStr) return false;
      }
      return true;
    });
  }, [selectedCenter, keyword, filterDate]);

  const handleReset = () => {
    setSelectedCenter("all");
    setSelectedUnit("all");
    setKeyword("");
    setFilterDate(undefined);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">交易日历</h1>
      </div>

      {/* 第一排：日期选择和筛选条件并列 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 日历选择 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">选择日期</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar 
              mode="single" 
              selected={selectedDate} 
              onSelect={setSelectedDate} 
              className="rounded-md border w-full" 
            />
          </CardContent>
        </Card>

        {/* 筛选条件 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">筛选条件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  交易中心
                </label>
                <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="shanxi">山西电力交易中心</SelectItem>
                    <SelectItem value="shandong">山东电力交易中心</SelectItem>
                    <SelectItem value="zhejiang">浙江电力交易中心</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  交易单元
                </label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="unit1">山东省场站A</SelectItem>
                    <SelectItem value="unit2">山东省场站B</SelectItem>
                    <SelectItem value="unit3">山西省场站A</SelectItem>
                    <SelectItem value="unit4">浙江省场站A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  关键字
                </label>
                <Input 
                  placeholder="请输入关键字" 
                  value={keyword} 
                  onChange={e => setKeyword(e.target.value)} 
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  日期
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn("w-full justify-start text-left font-normal", !filterDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDate ? format(filterDate, "yyyy-MM-dd") : <span>选择日期</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={filterDate} 
                      onSelect={setFilterDate} 
                      initialFocus 
                      className="pointer-events-auto" 
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="col-span-2 flex gap-2 justify-end mt-2">
                <Button variant="outline" onClick={handleReset}>重置</Button>
                <Button>查询</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 第二排：交易记录 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="todo">待办</TabsTrigger>
                  <TabsTrigger value="notice">公告</TabsTrigger>
                  <TabsTrigger value="sequence">序列</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">批量操作</Button>
                  <Button size="sm">+ 新建</Button>
                </div>
              </div>
              
              <TabsContent value="sequence" className="mt-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>日期</TableHead>
                        <TableHead>交易中心</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead className="min-w-[300px]">内容</TableHead>
                        <TableHead>交易时间</TableHead>
                        <TableHead>执行起止时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? filteredData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="font-medium">{row.date}</TableCell>
                          <TableCell>{row.center}</TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell className="text-primary hover:underline cursor-pointer">
                            {row.content}
                          </TableCell>
                          <TableCell>{row.time}</TableCell>
                          <TableCell>{row.period}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            暂无符合条件的交易记录
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="todo">
                <div className="text-center py-8 text-muted-foreground">
                  暂无待办事项
                </div>
              </TabsContent>

              <TabsContent value="notice">
                <div className="text-center py-8 text-muted-foreground">
                  暂无公告信息
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

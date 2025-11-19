import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    center: "山西电力交易中心",
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
    center: "山西电力交易中心",
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
    center: "山西电力交易中心",
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
    center: "山西电力交易中心",
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
    date: "20240401",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "2024年04月01日曲线交易(2024-4-6)",
    time: "1000-1600",
    period: "20240406-20240406"
  },
  {
    date: "20240401",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "2024年04月01日曲线交易(2024-4-7)",
    time: "1000-1600",
    period: "20240407-20240407"
  },
  {
    date: "20240401",
    center: "山西电力交易中心",
    type: "交易序列",
    content: "2024年04月01日曲线交易(2024-4-8)",
    time: "1000-1600",
    period: "20240408-20240408"
  },
];

export default function TradingLedger() {
  const [date, setDate] = useState<Date | undefined>(new Date(2024, 3, 1));
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("all");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">交易台账</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters and Calendar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">筛选条件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <SelectItem value="unit1">交易单元1</SelectItem>
                    <SelectItem value="unit2">交易单元2</SelectItem>
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
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  创建人
                </label>
                <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="user1">用户1</SelectItem>
                    <SelectItem value="user2">用户2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">重 置</Button>
                <Button className="flex-1">查 询</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Trading Details Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Tabs defaultValue="sequence" className="w-full">
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
                          {tradingData.map((row, index) => (
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
                          ))}
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
      </div>
    </div>
  );
}

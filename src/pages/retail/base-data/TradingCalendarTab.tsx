import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CalendarIcon, RefreshCw, Clock, AlertTriangle, CheckCircle2, Circle, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradingCalendar } from "@/hooks/useTradingCalendar";

const TradingCalendarTab = () => {
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [calendarCenter, setCalendarCenter] = useState("all");
  const [calendarKeyword, setCalendarKeyword] = useState("");
  const [calendarFilterDate, setCalendarFilterDate] = useState<Date | undefined>();
  const [calendarTab, setCalendarTab] = useState("todo");

  // 使用数据库数据
  const { 
    sequences, 
    announcements, 
    todos, 
    importantWindows, 
    loading, 
    lastSyncTime, 
    refresh 
  } = useTradingCalendar({ autoRefresh: true, refreshInterval: 5 * 60 * 1000 });

  const filteredSequenceData = useMemo(() => {
    return sequences.filter(row => {
      if (calendarCenter !== "all") {
        const centerMap: Record<string, string> = {
          shanxi: "山西电力交易中心",
          shandong: "山东电力交易中心",
          zhejiang: "浙江电力交易中心"
        };
        if (row.center !== centerMap[calendarCenter]) return false;
      }
      if (calendarKeyword && !row.content.toLowerCase().includes(calendarKeyword.toLowerCase())) {
        return false;
      }
      if (calendarFilterDate) {
        const filterDateStr = format(calendarFilterDate, "yyyyMMdd");
        if (row.date !== filterDateStr) return false;
      }
      return true;
    });
  }, [sequences, calendarCenter, calendarKeyword, calendarFilterDate]);

  const handleCalendarReset = () => {
    setCalendarCenter("all");
    setCalendarKeyword("");
    setCalendarFilterDate(undefined);
  };

  const handleSyncData = () => {
    refresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-xs"><Circle className="h-3 w-3 mr-1" />待处理</Badge>;
      case "in-progress": return <Badge className="bg-amber-500 text-xs"><Clock className="h-3 w-3 mr-1" />进行中</Badge>;
      case "completed": return <Badge className="bg-[#00B04D] text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />已完成</Badge>;
      case "overdue": return <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />已逾期</Badge>;
      default: return null;
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "紧急": return <Badge variant="destructive" className="text-xs">紧急</Badge>;
      case "重要": return <Badge className="bg-amber-500 text-xs">重要</Badge>;
      default: return <Badge variant="outline" className="text-xs">一般</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* 今日重要交易窗口提醒 */}
      {importantWindows.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                今日重要交易窗口
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleSyncData} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                {loading ? '同步中...' : '同步数据'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">最后同步: {format(lastSyncTime, "yyyy-MM-dd HH:mm:ss")}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {importantWindows.map((window, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "p-3 rounded-lg border",
                    window.hoursRemaining < 2 ? "border-red-300 bg-red-50" : "border-amber-200 bg-white"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{window.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{window.center}</p>
                    </div>
                    <div className={cn(
                      "text-right font-mono text-sm",
                      window.hoursRemaining < 2 ? "text-red-600 font-bold" : "text-amber-600"
                    )}>
                      {window.hoursRemaining}h {window.minutesRemaining}m
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    截止时间: {window.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 日历选择 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">选择日期</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar 
              mode="single" 
              selected={calendarDate} 
              onSelect={setCalendarDate} 
              className="rounded-md border w-full pointer-events-auto" 
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
                <label className="text-sm font-medium mb-2 block text-muted-foreground">交易中心</label>
                <Select value={calendarCenter} onValueChange={setCalendarCenter}>
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
                <label className="text-sm font-medium mb-2 block text-muted-foreground">关键字</label>
                <Input 
                  placeholder="请输入关键字" 
                  value={calendarKeyword} 
                  onChange={e => setCalendarKeyword(e.target.value)} 
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">日期</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn("w-full justify-start text-left font-normal", !calendarFilterDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {calendarFilterDate ? format(calendarFilterDate, "yyyy-MM-dd") : <span>选择日期</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={calendarFilterDate} 
                      onSelect={setCalendarFilterDate} 
                      initialFocus 
                      className="pointer-events-auto" 
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={handleCalendarReset}>重置</Button>
                <Button>查询</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 交易记录 */}
      <Card>
        <CardHeader>
          <Tabs value={calendarTab} onValueChange={setCalendarTab} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="todo">待办 ({todos.filter(t => t.status === "pending" || t.status === "in-progress").length})</TabsTrigger>
                <TabsTrigger value="notice">公告 ({announcements.length})</TabsTrigger>
                <TabsTrigger value="sequence">序列 ({filteredSequenceData.length})</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">批量操作</Button>
                <Button size="sm">+ 新建</Button>
              </div>
            </div>
            
            {/* 待办Tab */}
            <TabsContent value="todo" className="mt-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F1F8F4]">
                      <TableHead className="w-12"><Checkbox /></TableHead>
                      <TableHead>待办标题</TableHead>
                      <TableHead>关联序列</TableHead>
                      <TableHead>截止时间</TableHead>
                      <TableHead>剩余时间</TableHead>
                      <TableHead>负责场站</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todos.map((todo) => (
                      <TableRow key={todo.id} className="hover:bg-[#F8FBFA]">
                        <TableCell><Checkbox /></TableCell>
                        <TableCell className="font-medium text-sm">{todo.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{todo.sequence}</TableCell>
                        <TableCell className="font-mono text-xs">{format(new Date(todo.deadline), "MM-dd HH:mm")}</TableCell>
                        <TableCell className={cn(
                          "font-mono text-xs",
                          todo.hoursRemaining < 2 ? "text-red-600 font-bold" : todo.hoursRemaining < 6 ? "text-amber-600" : ""
                        )}>
                          {todo.hoursRemaining < 0 ? "已逾期" : `${todo.hoursRemaining}h ${todo.minutesRemaining % 60}m`}
                        </TableCell>
                        <TableCell className="text-xs">{todo.tradingUnit}</TableCell>
                        <TableCell>{getStatusBadge(todo.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="sm" className="text-xs h-7">完成</Button>
                            <Button variant="ghost" size="sm" className="text-xs h-7">转办</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* 公告Tab */}
            <TabsContent value="notice" className="mt-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F1F8F4]">
                      <TableHead className="w-12"><Checkbox /></TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>交易中心</TableHead>
                      <TableHead className="min-w-[300px]">公告标题</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>重要程度</TableHead>
                      <TableHead className="text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((notice) => (
                      <TableRow key={notice.id} className="hover:bg-[#F8FBFA]">
                        <TableCell><Checkbox /></TableCell>
                        <TableCell className="font-mono text-xs">{notice.date}</TableCell>
                        <TableCell className="text-xs">{notice.center}</TableCell>
                        <TableCell className="text-primary hover:underline cursor-pointer text-sm">{notice.title}</TableCell>
                        <TableCell className="text-xs">{notice.type}</TableCell>
                        <TableCell>{getImportanceBadge(notice.importance)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{notice.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div><span className="text-muted-foreground">发布日期：</span>{notice.date}</div>
                                  <div><span className="text-muted-foreground">交易中心：</span>{notice.center}</div>
                                  <div><span className="text-muted-foreground">公告类型：</span>{notice.type}</div>
                                  <div><span className="text-muted-foreground">重要程度：</span>{notice.importance}</div>
                                </div>
                                <div className="border-t pt-4">
                                  <p className="text-sm text-muted-foreground">公告详情内容将在此处展示...</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* 序列Tab */}
            <TabsContent value="sequence" className="mt-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F1F8F4]">
                      <TableHead className="w-12"><Checkbox /></TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>交易中心</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead className="min-w-[300px]">内容</TableHead>
                      <TableHead>交易时间</TableHead>
                      <TableHead>执行期间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSequenceData.length > 0 ? filteredSequenceData.map((row, index) => (
                      <TableRow key={index} className="hover:bg-[#F8FBFA]">
                        <TableCell><Checkbox /></TableCell>
                        <TableCell className="font-mono text-xs">{row.date}</TableCell>
                        <TableCell className="text-xs">{row.center}</TableCell>
                        <TableCell className="text-xs">{row.type}</TableCell>
                        <TableCell className="text-primary hover:underline cursor-pointer text-sm">{row.content}</TableCell>
                        <TableCell className="font-mono text-xs">{row.time}</TableCell>
                        <TableCell className="font-mono text-xs">{row.period}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">暂无符合条件的交易记录</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
};

export default TradingCalendarTab;

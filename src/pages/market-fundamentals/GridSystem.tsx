import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowUpDown, Play, Pause } from "lucide-react";
import gridStructureMap from "@/assets/grid-structure-map.png";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

// 模拟数据：输变电设备检修
const maintenanceData = [
  {
    id: 1,
    collectDate: "2024-01-15",
    attribute: "计划",
    equipmentName: "500kV临汾变电站1号主变",
    applicationNo: "2024001",
    equipmentType: "主变压器",
    equipmentStatus: "开关",
    statusDescription: "年度预防性检修，需要进行油化分析、绝缘测试及本体检查",
    scheduledPeriod: "2024-01-20 08:00 至 2024-01-25 18:00",
    startTime: "2024-01-20 08:00:00",
    endTime: "2024-01-25 18:00:00",
  },
  {
    id: 2,
    collectDate: "2024-01-16",
    attribute: "临时",
    equipmentName: "220kV太原北变110kV I母",
    applicationNo: "2024002",
    equipmentType: "母线",
    equipmentStatus: "母线",
    statusDescription: "发现母线接头温度异常，需紧急停电处理更换接头连接件",
    scheduledPeriod: "2024-01-18 00:00 至 2024-01-18 06:00",
    startTime: "2024-01-18 00:00:00",
    endTime: "2024-01-18 06:00:00",
  },
  {
    id: 3,
    collectDate: "2024-01-17",
    attribute: "计划",
    equipmentName: "220kV大同东变2号断路器",
    applicationNo: "2024003",
    equipmentType: "断路器",
    equipmentStatus: "开关",
    statusDescription: "定期维护，检查操作机构、更换SF6气体、进行特性测试",
    scheduledPeriod: "2024-01-22 09:00 至 2024-01-23 17:00",
    startTime: "2024-01-22 09:00:00",
    endTime: "2024-01-23 17:00:00",
  },
  {
    id: 4,
    collectDate: "2024-01-18",
    attribute: "计划",
    equipmentName: "110kV晋城变35kV出线间隔",
    applicationNo: "2024004",
    equipmentType: "线路间隔",
    equipmentStatus: "开关",
    statusDescription: "季度性维护，清扫绝缘子、检查刀闸接触情况、测量接地电阻",
    scheduledPeriod: "2024-01-25 08:00 至 2024-01-26 18:00",
    startTime: "2024-01-25 08:00:00",
    endTime: "2024-01-26 18:00:00",
  },
  {
    id: 5,
    collectDate: "2024-01-19",
    attribute: "临时",
    equipmentName: "500kV长治变电站保护装置",
    applicationNo: "2024005",
    equipmentType: "保护装置",
    equipmentStatus: "开关",
    statusDescription: "保护装置出现异常告警，需要进行软件升级和硬件检查",
    scheduledPeriod: "2024-01-21 10:00 至 2024-01-21 16:00",
    startTime: "2024-01-21 10:00:00",
    endTime: "2024-01-21 16:00:00",
  },
  {
    id: 6,
    collectDate: "2024-01-20",
    attribute: "计划",
    equipmentName: "220kV运城南变1号主变冷却系统",
    applicationNo: "2024006",
    equipmentType: "冷却系统",
    equipmentStatus: "开关",
    statusDescription: "主变冷却风扇定期维护，检查电机运行状态、更换润滑油",
    scheduledPeriod: "2024-01-28 09:00 至 2024-01-29 17:00",
    startTime: "2024-01-28 09:00:00",
    endTime: "2024-01-29 17:00:00",
  },
  {
    id: 7,
    collectDate: "2024-01-21",
    attribute: "计划",
    equipmentName: "110kV朔州变GIS设备",
    applicationNo: "2024007",
    equipmentType: "GIS设备",
    equipmentStatus: "开关",
    statusDescription: "GIS设备年度检修，进行局部放电测试、密封性检查",
    scheduledPeriod: "2024-02-01 08:00 至 2024-02-03 18:00",
    startTime: "2024-02-01 08:00:00",
    endTime: "2024-02-03 18:00:00",
  },
  {
    id: 8,
    collectDate: "2024-01-22",
    attribute: "临时",
    equipmentName: "220kV忻州变35kV电容器组",
    applicationNo: "2024008",
    equipmentType: "电容器",
    equipmentStatus: "母线",
    statusDescription: "电容器组出现渗漏油现象，需要紧急更换故障电容器单元",
    scheduledPeriod: "2024-01-24 08:00 至 2024-01-24 18:00",
    startTime: "2024-01-24 08:00:00",
    endTime: "2024-01-24 18:00:00",
  },
];

// 模拟数据：断面约束
const sectionConstraintData = [
  {
    id: 1,
    collectDate: "2024-01-15",
    sectionName: "晋北-晋中断面",
    constraintType: "热稳定约束",
    limitValue: "3200MW",
    currentValue: "2850MW",
    utilizationRate: "89.1%",
    constraintReason: "冬季供暖负荷高峰期，线路传输容量受限",
    effectivePeriod: "2024-01-15 至 2024-03-15",
  },
  {
    id: 2,
    collectDate: "2024-01-15",
    sectionName: "晋中-晋南断面",
    constraintType: "稳定约束",
    limitValue: "2800MW",
    currentValue: "2450MW",
    utilizationRate: "87.5%",
    constraintReason: "区域电网N-1稳定校核，受单一线路故障影响",
    effectivePeriod: "2024-01-15 至 2024-02-28",
  },
  {
    id: 3,
    collectDate: "2024-01-16",
    sectionName: "晋南-豫北断面",
    constraintType: "协议约束",
    limitValue: "1500MW",
    currentValue: "1320MW",
    utilizationRate: "88.0%",
    constraintReason: "省间送电协议约定的最大传输功率限制",
    effectivePeriod: "2024-01-01 至 2024-12-31",
  },
  {
    id: 4,
    collectDate: "2024-01-17",
    sectionName: "晋东-冀西断面",
    constraintType: "热稳定约束",
    limitValue: "2200MW",
    currentValue: "1980MW",
    utilizationRate: "90.0%",
    constraintReason: "500kV线路走廊受地理环境限制，传输能力受约束",
    effectivePeriod: "2024-01-10 至 2024-03-31",
  },
  {
    id: 5,
    collectDate: "2024-01-18",
    sectionName: "临汾-运城断面",
    constraintType: "电压约束",
    limitValue: "1800MW",
    currentValue: "1620MW",
    utilizationRate: "90.0%",
    constraintReason: "受端电网电压支撑能力不足，需控制潮流",
    effectivePeriod: "2024-01-15 至 2024-02-15",
  },
];

// 模拟数据：省内电力平衡裕度
const powerBalanceData = [
  {
    id: 1,
    date: "2024-01-15",
    timeSegment: "08:00-12:00",
    totalLoad: "28500MW",
    availableCapacity: "32000MW",
    margin: "3500MW",
    marginRate: "12.3%",
    riskLevel: "正常",
    remarks: "早高峰时段，裕度充足",
  },
  {
    id: 2,
    date: "2024-01-15",
    timeSegment: "18:00-22:00",
    totalLoad: "31200MW",
    availableCapacity: "33500MW",
    margin: "2300MW",
    marginRate: "7.4%",
    riskLevel: "关注",
    remarks: "晚高峰时段，裕度偏紧",
  },
  {
    id: 3,
    date: "2024-01-16",
    timeSegment: "00:00-06:00",
    totalLoad: "22000MW",
    availableCapacity: "30000MW",
    margin: "8000MW",
    marginRate: "36.4%",
    riskLevel: "正常",
    remarks: "夜间低谷时段，裕度充裕",
  },
  {
    id: 4,
    date: "2024-01-16",
    timeSegment: "12:00-16:00",
    totalLoad: "29800MW",
    availableCapacity: "32500MW",
    margin: "2700MW",
    marginRate: "9.1%",
    riskLevel: "正常",
    remarks: "午间时段，裕度正常",
  },
  {
    id: 5,
    date: "2024-01-17",
    timeSegment: "18:00-22:00",
    totalLoad: "32500MW",
    availableCapacity: "34000MW",
    margin: "1500MW",
    marginRate: "4.6%",
    riskLevel: "预警",
    remarks: "晚高峰时段，多台机组检修，裕度紧张",
  },
  {
    id: 6,
    date: "2024-01-18",
    timeSegment: "08:00-12:00",
    totalLoad: "27500MW",
    availableCapacity: "31500MW",
    margin: "4000MW",
    marginRate: "14.5%",
    riskLevel: "正常",
    remarks: "早高峰时段，裕度充足",
  },
];

// 模拟数据：通道容量
const channelCapacityData = [
  {
    id: 1,
    collectDate: "2024-01-15",
    channelName: "晋电外送-河北南网通道",
    voltage: "500kV",
    designCapacity: "4000MW",
    actualCapacity: "3600MW",
    utilizationRate: "90.0%",
    capacityType: "外送",
    remarks: "主要送电通道，接近满载运行",
  },
  {
    id: 2,
    collectDate: "2024-01-15",
    channelName: "晋电外送-河南电网通道",
    voltage: "500kV",
    designCapacity: "3500MW",
    actualCapacity: "2800MW",
    utilizationRate: "80.0%",
    capacityType: "外送",
    remarks: "稳定运行，有一定裕度",
  },
  {
    id: 3,
    collectDate: "2024-01-16",
    channelName: "蒙西-晋北受电通道",
    voltage: "500kV",
    designCapacity: "2000MW",
    actualCapacity: "1500MW",
    utilizationRate: "75.0%",
    capacityType: "受电",
    remarks: "受端电网需求正常",
  },
  {
    id: 4,
    collectDate: "2024-01-17",
    channelName: "晋电外送-京津唐通道",
    voltage: "1000kV",
    designCapacity: "8000MW",
    actualCapacity: "7200MW",
    utilizationRate: "90.0%",
    capacityType: "外送",
    remarks: "特高压通道，高负荷运行",
  },
  {
    id: 5,
    collectDate: "2024-01-18",
    channelName: "陕西-晋南联络通道",
    voltage: "220kV",
    designCapacity: "800MW",
    actualCapacity: "450MW",
    utilizationRate: "56.3%",
    capacityType: "互济",
    remarks: "省间互济通道，运行平稳",
  },
  {
    id: 6,
    collectDate: "2024-01-19",
    channelName: "晋北-冀北联络通道",
    voltage: "500kV",
    designCapacity: "3000MW",
    actualCapacity: "2550MW",
    utilizationRate: "85.0%",
    capacityType: "外送",
    remarks: "主要外送通道之一，负荷较高",
  },
];

const GridSystem = () => {
  const [activeTab, setActiveTab] = useState("maintenance");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [timeGranularity, setTimeGranularity] = useState("96点/15分钟");
  const [dataDisplay, setDataDisplay] = useState("日前");
  const [channelLocation, setChannelLocation] = useState("全部");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  // 获取当前标签页的数据
  const getCurrentData = (): any[] => {
    switch (activeTab) {
      case "maintenance":
        return maintenanceData;
      case "constraint":
        return sectionConstraintData;
      case "balance":
        return powerBalanceData;
      case "capacity":
        return channelCapacityData;
      default:
        return [];
    }
  };

  // 过滤数据
  const getFilteredData = () => {
    let data = getCurrentData();

    // 关键字搜索
    if (searchKeyword) {
      data = data.filter((item: any) => {
        const searchFields = activeTab === "maintenance" 
          ? [item.equipmentName, item.statusDescription]
          : activeTab === "constraint"
          ? [item.sectionName, item.constraintReason]
          : activeTab === "balance"
          ? [item.remarks]
          : [item.channelName, item.remarks];
        
        return searchFields.some(field => 
          field?.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      });
    }

    // 日期范围过滤
    if (dateRange.from && dateRange.to) {
      data = data.filter((item: any) => {
        const itemDate = new Date(item.collectDate || item.date);
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
      });
    }

    // 通道/属地过滤
    if (channelLocation !== "全部") {
      data = data.filter((item: any) => {
        if (activeTab === "maintenance") {
          return item.equipmentName.includes(channelLocation);
        }
        return true;
      });
    }

    // 排序
    if (sortField) {
      data = [...data].sort((a: any, b: any) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return data;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 排序处理
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 重置页码（当筛选条件变化时）
  const resetPage = () => {
    setCurrentPage(1);
  };

  // 获取标签页描述
  const getTabDescription = () => {
    switch (activeTab) {
      case "maintenance":
        return "查看输变电设备检修计划和临时检修信息";
      case "structure":
        return "展示全省网架图信息，包括潮流、热力、断面等多种模式";
      case "constraint":
        return "监测电网断面约束和传输容量限制";
      case "balance":
        return "分析省内电力平衡裕度和风险预警";
      case "capacity":
        return "追踪通道容量利用和外送受电情况";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">电网系统</h1>
        <p className="text-muted-foreground mt-2">
          查看长时间维度的输变电设备检修、断面约束、省内电力平衡裕度、通道容量需求
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>电网运行分析</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            resetPage();
          }}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="maintenance">输变电设备检修</TabsTrigger>
              <TabsTrigger value="structure">网架结构</TabsTrigger>
              <TabsTrigger value="constraint">断面约束</TabsTrigger>
              <TabsTrigger value="balance">省内电力平衡裕度</TabsTrigger>
              <TabsTrigger value="capacity">通道容量</TabsTrigger>
            </TabsList>

            {/* 标签页说明 */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{getTabDescription()}</p>
            </div>

            {/* 查询筛选区域 */}
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* 关键字搜索 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="输入关键字"
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      resetPage();
                    }}
                    className="pl-9"
                  />
                </div>

                {/* 截止日期 */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to ? (
                        <>
                          {format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })} 至{" "}
                          {format(dateRange.to, "yyyy-MM-dd", { locale: zhCN })}
                        </>
                      ) : (
                        <span>选择日期范围</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range: any) => {
                        setDateRange(range || { from: undefined, to: undefined });
                        resetPage();
                      }}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* 时间颗粒度 */}
                <Select value={timeGranularity} onValueChange={setTimeGranularity}>
                  <SelectTrigger>
                    <SelectValue placeholder="时间颗粒度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="96点/15分钟">96点/15分钟</SelectItem>
                    <SelectItem value="24点/1小时">24点/1小时</SelectItem>
                    <SelectItem value="日">日</SelectItem>
                    <SelectItem value="月">月</SelectItem>
                  </SelectContent>
                </Select>

                {/* 数据展示 */}
                <Select value={dataDisplay} onValueChange={setDataDisplay}>
                  <SelectTrigger>
                    <SelectValue placeholder="数据展示" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="日前">日前</SelectItem>
                    <SelectItem value="日内">日内</SelectItem>
                  </SelectContent>
                </Select>

                {/* 通道/属地 */}
                <Select value={channelLocation} onValueChange={(value) => {
                  setChannelLocation(value);
                  resetPage();
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="通道/属地" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="临汾">临汾</SelectItem>
                    <SelectItem value="太原">太原</SelectItem>
                    <SelectItem value="大同">大同</SelectItem>
                    <SelectItem value="晋城">晋城</SelectItem>
                    <SelectItem value="长治">长治</SelectItem>
                    <SelectItem value="运城">运城</SelectItem>
                    <SelectItem value="朔州">朔州</SelectItem>
                    <SelectItem value="忻州">忻州</SelectItem>
                  </SelectContent>
                </Select>

                {/* 清空筛选 */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchKeyword("");
                    setDateRange({ from: undefined, to: undefined });
                    setChannelLocation("全部");
                    resetPage();
                  }}
                >
                  清空筛选
                </Button>
              </div>
            </div>

            {/* 输变电设备检修 */}
            <TabsContent value="maintenance" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">序号</TableHead>
                      <TableHead className="w-[120px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("collectDate")}
                          className="h-8 px-2"
                        >
                          采集日期
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[80px]">属性</TableHead>
                      <TableHead className="w-[180px]">设备名称</TableHead>
                      <TableHead className="w-[100px]">申请单号</TableHead>
                      <TableHead className="w-[100px]">设备类型</TableHead>
                      <TableHead className="w-[100px]">设备状态</TableHead>
                      <TableHead className="min-w-[250px]">联态说明</TableHead>
                      <TableHead className="w-[200px]">联态及双定期间</TableHead>
                      <TableHead className="w-[160px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("startTime")}
                          className="h-8 px-2"
                        >
                          检测采集时间期间
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[160px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("endTime")}
                          className="h-8 px-2"
                        >
                          检测采集结束时间
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item: any, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>{item.collectDate}</TableCell>
                          <TableCell>
                            <Badge variant={item.attribute === "计划" ? "default" : "secondary"}>
                              {item.attribute}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-normal break-words">{item.equipmentName}</TableCell>
                          <TableCell>{item.applicationNo}</TableCell>
                          <TableCell>{item.equipmentType}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.equipmentStatus}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-normal break-words">{item.statusDescription}</TableCell>
                          <TableCell>{item.scheduledPeriod}</TableCell>
                          <TableCell>{item.startTime}</TableCell>
                          <TableCell>{item.endTime}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-muted-foreground">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* 网架结构 */}
            <TabsContent value="structure" className="mt-6">
              {/* 查询筛选区域 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* 日期选择 */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })
                      ) : (
                        <span>选择日期</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => {
                        if (date) {
                          setDateRange({ from: date, to: date });
                          resetPage();
                        }
                      }}
                      locale={zhCN}
                    />
                  </PopoverContent>
                </Popover>

                {/* 节点/线路/断面搜索 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索节点、线路、断面"
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      resetPage();
                    }}
                    className="pl-9"
                  />
                </div>

                {/* 通道/属地选择 */}
                <Select value={channelLocation} onValueChange={(value) => {
                  setChannelLocation(value);
                  resetPage();
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择通道/属地" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="临汾">临汾</SelectItem>
                    <SelectItem value="太原">太原</SelectItem>
                    <SelectItem value="大同">大同</SelectItem>
                    <SelectItem value="晋城">晋城</SelectItem>
                    <SelectItem value="长治">长治</SelectItem>
                    <SelectItem value="运城">运城</SelectItem>
                    <SelectItem value="朔州">朔州</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 地图展示区域 */}
              <div className="relative rounded-lg border bg-background overflow-hidden">
                <div className="relative h-[600px]">
                  {/* 地图图片 */}
                  <img 
                    src={gridStructureMap} 
                    alt="电网网架结构图" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* 右侧控制面板 */}
                  <div className="absolute right-4 top-4 space-y-2 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                    <div className="text-sm font-medium mb-2">展示模式</div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        潮流
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        热力
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        断面
                      </Button>
                    </div>
                  </div>

                  {/* 底部播放控制 */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="text-sm text-muted-foreground px-2">
                      2025-01-20 00:00
                    </div>
                  </div>
                </div>

                {/* 图例说明 */}
                <div className="border-t p-4 bg-muted/30">
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>检修中</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>断面越限预警</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-green-500"></div>
                      <span>正常潮流</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-orange-500"></div>
                      <span>高负荷潮流</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500 border-2 border-pink-300"></div>
                      <span>关键节点</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 节点信息表格 */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">节点详细信息</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">序号</TableHead>
                        <TableHead className="w-[150px]">节点名称</TableHead>
                        <TableHead className="w-[100px]">电压等级</TableHead>
                        <TableHead className="w-[120px]">节点价格(元/MWh)</TableHead>
                        <TableHead className="w-[120px]">潮流(MW)</TableHead>
                        <TableHead className="w-[100px]">状态</TableHead>
                        <TableHead className="min-w-[200px]">备注</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>临汾变电站</TableCell>
                        <TableCell>500kV</TableCell>
                        <TableCell>285.6</TableCell>
                        <TableCell>1250</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                            正常
                          </Badge>
                        </TableCell>
                        <TableCell>主网枢纽节点</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2</TableCell>
                        <TableCell>太原北变</TableCell>
                        <TableCell>220kV</TableCell>
                        <TableCell>292.3</TableCell>
                        <TableCell>890</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-300">
                            高负荷
                          </Badge>
                        </TableCell>
                        <TableCell>负荷较高，需关注</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>3</TableCell>
                        <TableCell>大同东变</TableCell>
                        <TableCell>220kV</TableCell>
                        <TableCell>278.9</TableCell>
                        <TableCell>760</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                            正常
                          </Badge>
                        </TableCell>
                        <TableCell>运行平稳</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>4</TableCell>
                        <TableCell>晋城变</TableCell>
                        <TableCell>110kV</TableCell>
                        <TableCell>295.7</TableCell>
                        <TableCell>420</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-300">
                            检修中
                          </Badge>
                        </TableCell>
                        <TableCell>计划检修，预计1月25日恢复</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>5</TableCell>
                        <TableCell>长治变</TableCell>
                        <TableCell>500kV</TableCell>
                        <TableCell>283.4</TableCell>
                        <TableCell>1100</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                            正常
                          </Badge>
                        </TableCell>
                        <TableCell>重要枢纽站点</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* 断面约束 */}
            <TabsContent value="constraint" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">序号</TableHead>
                      <TableHead className="w-[120px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("collectDate")}
                          className="h-8 px-2"
                        >
                          采集日期
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[200px]">断面名称</TableHead>
                      <TableHead className="w-[120px]">约束类型</TableHead>
                      <TableHead className="w-[120px]">限额值</TableHead>
                      <TableHead className="w-[120px]">当前值</TableHead>
                      <TableHead className="w-[100px]">利用率</TableHead>
                      <TableHead className="min-w-[300px]">约束原因</TableHead>
                      <TableHead className="w-[200px]">有效期间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item: any, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>{item.collectDate}</TableCell>
                          <TableCell>{item.sectionName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.constraintType}</Badge>
                          </TableCell>
                          <TableCell>{item.limitValue}</TableCell>
                          <TableCell>{item.currentValue}</TableCell>
                          <TableCell>
                            <Badge variant={parseFloat(item.utilizationRate) > 85 ? "destructive" : "default"}>
                              {item.utilizationRate}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-normal break-words">{item.constraintReason}</TableCell>
                          <TableCell>{item.effectivePeriod}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* 省内电力平衡裕度 */}
            <TabsContent value="balance" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">序号</TableHead>
                      <TableHead className="w-[120px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("date")}
                          className="h-8 px-2"
                        >
                          日期
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[150px]">时段</TableHead>
                      <TableHead className="w-[120px]">统调负荷</TableHead>
                      <TableHead className="w-[120px]">可用容量</TableHead>
                      <TableHead className="w-[120px]">平衡裕度</TableHead>
                      <TableHead className="w-[100px]">裕度率</TableHead>
                      <TableHead className="w-[100px]">风险等级</TableHead>
                      <TableHead className="min-w-[200px]">备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item: any, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.timeSegment}</TableCell>
                          <TableCell>{item.totalLoad}</TableCell>
                          <TableCell>{item.availableCapacity}</TableCell>
                          <TableCell>{item.margin}</TableCell>
                          <TableCell>{item.marginRate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.riskLevel === "预警"
                                  ? "destructive"
                                  : item.riskLevel === "关注"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {item.riskLevel}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-normal break-words">{item.remarks}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* 通道容量 */}
            <TabsContent value="capacity" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">序号</TableHead>
                      <TableHead className="w-[120px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("collectDate")}
                          className="h-8 px-2"
                        >
                          采集日期
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[250px]">通道名称</TableHead>
                      <TableHead className="w-[100px]">电压等级</TableHead>
                      <TableHead className="w-[120px]">设计容量</TableHead>
                      <TableHead className="w-[120px]">实际容量</TableHead>
                      <TableHead className="w-[100px]">利用率</TableHead>
                      <TableHead className="w-[100px]">容量类型</TableHead>
                      <TableHead className="min-w-[200px]">备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item: any, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>{item.collectDate}</TableCell>
                          <TableCell>{item.channelName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.voltage}</Badge>
                          </TableCell>
                          <TableCell>{item.designCapacity}</TableCell>
                          <TableCell>{item.actualCapacity}</TableCell>
                          <TableCell>
                            <Badge variant={parseFloat(item.utilizationRate) > 85 ? "destructive" : "default"}>
                              {item.utilizationRate}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.capacityType}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-normal break-words">{item.remarks}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* 分页控件 */}
            {filteredData.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  共 {filteredData.length} 条数据，第 {currentPage} / {totalPages} 页
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={i}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GridSystem;

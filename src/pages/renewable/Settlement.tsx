import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Receipt, ChevronRight, ChevronDown, Download, Upload, FileSpreadsheet, Calendar as CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SettlementRecord {
  id: string;
  tradingUnit: string;
  settlementNo: string;
  settlementYear: string;
  settlementPrice: number;
  compensationPrice: number;
  settlementVolume: number;
  settlementFee: number;
  contractPosition: string;
  compensationIncome: number;
  otherFees: number;
  totalIncomeNoSubsidy: number;
  totalIncomeWithSubsidy: number;
  status: string;
  vatRate: number;
  remark: string;
  month?: string;
  children?: SettlementRecord[];
  isGroup?: boolean;
  isSummary?: boolean;
}

// 生成模拟数据
const generateMockData = (): SettlementRecord[] => {
  const months = ["202410", "202411"];
  const tradingUnits = ["交易单元001", "交易单元002", "交易单元003"];
  const statuses = ["已结算", "待结算", "结算中"];
  
  const monthlyData = months.map((month, monthIndex) => {
    const records: SettlementRecord[] = [];
    const recordCount = 6 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < recordCount; i++) {
      const settlementVolume = 1000 + Math.random() * 9000;
      const settlementPrice = 300 + Math.random() * 200;
      const compensationPrice = 50 + Math.random() * 100;
      const settlementFee = settlementVolume * settlementPrice;
      const compensationIncome = settlementVolume * compensationPrice;
      const otherFees = Math.random() * 10000;
      const totalIncomeNoSubsidy = settlementFee + otherFees;
      const totalIncomeWithSubsidy = totalIncomeNoSubsidy + compensationIncome;
      
      records.push({
        id: `${month}-${i + 1}`,
        tradingUnit: tradingUnits[Math.floor(Math.random() * tradingUnits.length)],
        settlementNo: `JS${month}${String(i + 1).padStart(4, '0')}`,
        settlementYear: month.substring(0, 4),
        settlementPrice,
        compensationPrice,
        settlementVolume,
        settlementFee,
        contractPosition: `合同${i + 1}`,
        compensationIncome,
        otherFees,
        totalIncomeNoSubsidy,
        totalIncomeWithSubsidy,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        vatRate: 13,
        remark: i % 3 === 0 ? "正常结算" : "",
        month,
      });
    }
    
    // 计算月度汇总
    const monthSummary: SettlementRecord = {
      id: `month-${month}`,
      tradingUnit: `结算月份 ${month}`,
      settlementNo: "-",
      settlementYear: month.substring(0, 4),
      settlementPrice: records.reduce((sum, r) => sum + r.settlementPrice, 0) / records.length,
      compensationPrice: records.reduce((sum, r) => sum + r.compensationPrice, 0) / records.length,
      settlementVolume: records.reduce((sum, r) => sum + r.settlementVolume, 0),
      settlementFee: records.reduce((sum, r) => sum + r.settlementFee, 0),
      contractPosition: "-",
      compensationIncome: records.reduce((sum, r) => sum + r.compensationIncome, 0),
      otherFees: records.reduce((sum, r) => sum + r.otherFees, 0),
      totalIncomeNoSubsidy: records.reduce((sum, r) => sum + r.totalIncomeNoSubsidy, 0),
      totalIncomeWithSubsidy: records.reduce((sum, r) => sum + r.totalIncomeWithSubsidy, 0),
      status: "-",
      vatRate: 13,
      remark: `${records.length}条记录`,
      month,
      isGroup: true,
      children: records,
    };
    
    return monthSummary;
  });
  
  // 计算总计
  const totalSummary: SettlementRecord = {
    id: "total-summary",
    tradingUnit: "结算月份 合计",
    settlementNo: "-",
    settlementYear: "2024",
    settlementPrice: monthlyData.reduce((sum, m) => sum + m.settlementPrice, 0) / monthlyData.length,
    compensationPrice: monthlyData.reduce((sum, m) => sum + m.compensationPrice, 0) / monthlyData.length,
    settlementVolume: monthlyData.reduce((sum, m) => sum + m.settlementVolume, 0),
    settlementFee: monthlyData.reduce((sum, m) => sum + m.settlementFee, 0),
    contractPosition: "-",
    compensationIncome: monthlyData.reduce((sum, m) => sum + m.compensationIncome, 0),
    otherFees: monthlyData.reduce((sum, m) => sum + m.otherFees, 0),
    totalIncomeNoSubsidy: monthlyData.reduce((sum, m) => sum + m.totalIncomeNoSubsidy, 0),
    totalIncomeWithSubsidy: monthlyData.reduce((sum, m) => sum + m.totalIncomeWithSubsidy, 0),
    status: "-",
    vatRate: 13,
    remark: `${monthlyData.length}个月`,
    isSummary: true,
    children: monthlyData,
  };
  
  return [totalSummary];
};

const Settlement = () => {
  const [data] = useState<SettlementRecord[]>(generateMockData());
  const [tradingCenter, setTradingCenter] = useState("山西电力交易中心");
  const [tradingUnit, setTradingUnit] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2024, 9, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(2024, 10, 30));
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(["total-summary"]));

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredData = useMemo(() => {
    // 筛选逻辑可在此实现
    return data;
  }, [data, tradingCenter, tradingUnit, startDate, endDate]);

  const handleReset = () => {
    setTradingCenter("山西电力交易中心");
    setTradingUnit("all");
    setStartDate(new Date(2024, 9, 1));
    setEndDate(new Date(2024, 10, 30));
  };

  const renderRow = (record: SettlementRecord, level: number = 0): JSX.Element[] => {
    const isExpanded = expandedRows.has(record.id);
    const hasChildren = record.children && record.children.length > 0;
    const bgColor = record.isSummary ? "bg-[#E8F0EC]" : record.isGroup ? "bg-[#F1F8F4]" : "";
    const fontWeight = record.isSummary || record.isGroup ? "font-semibold" : "";
    
    const rows: JSX.Element[] = [
      <tr key={record.id} className={cn("border-b transition-colors hover:bg-[#F8FBFA]", bgColor)}>
        <td className={cn("p-3 align-middle", fontWeight)} style={{ paddingLeft: `${12 + level * 24}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button onClick={() => toggleRow(record.id)} className="hover:text-[#00B04D]">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}
            {!hasChildren && <span className="w-4" />}
            <span>{record.tradingUnit}</span>
          </div>
        </td>
        <td className={cn("p-3 align-middle text-center", fontWeight)}>{record.settlementNo}</td>
        <td className={cn("p-3 align-middle text-center", fontWeight)}>{record.settlementYear}</td>
        <td className={cn("p-3 align-middle text-right font-mono", fontWeight)}>{record.settlementPrice.toFixed(2)}</td>
        <td className={cn("p-3 align-middle text-right font-mono", fontWeight)}>{record.compensationPrice.toFixed(2)}</td>
        <td className={cn("p-3 align-middle text-right font-mono", fontWeight)}>{record.settlementVolume.toFixed(3)}</td>
        <td className={cn("p-3 align-middle text-right font-mono", fontWeight)}>{record.settlementFee.toFixed(2)}</td>
        <td className={cn("p-3 align-middle text-center", fontWeight)}>{record.contractPosition}</td>
        <td className={cn("p-3 align-middle text-right font-mono", fontWeight)}>{record.compensationIncome.toFixed(2)}</td>
        <td className={cn("p-3 align-middle text-right font-mono", fontWeight)}>{record.otherFees.toFixed(2)}</td>
        <td className={cn("p-3 align-middle text-right font-mono", fontWeight)}>{record.totalIncomeNoSubsidy.toFixed(2)}</td>
        <td className={cn("p-3 align-middle text-right font-mono", fontWeight)}>{record.totalIncomeWithSubsidy.toFixed(2)}</td>
        <td className={cn("p-3 align-middle text-center", fontWeight)}>{record.status}</td>
        <td className={cn("p-3 align-middle text-right font-mono", fontWeight)}>{record.vatRate}</td>
        <td className={cn("p-3 align-middle text-center text-xs text-muted-foreground", fontWeight)}>{record.remark}</td>
        <td className="p-3 align-middle text-center">
          {!record.isSummary && !record.isGroup && (
            <div className="flex items-center justify-center gap-3">
              <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Pencil className="h-3.5 w-3.5" />
                <span className="text-xs">编辑</span>
              </button>
              <button className="text-red-600 hover:text-red-800 flex items-center gap-1">
                <Trash2 className="h-3.5 w-3.5" />
                <span className="text-xs">删除</span>
              </button>
            </div>
          )}
        </td>
      </tr>
    ];

    if (isExpanded && hasChildren) {
      record.children!.forEach(child => {
        rows.push(...renderRow(child, level + 1));
      });
    }

    return rows;
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">结算管理</h1>
        <p className="text-muted-foreground mt-2">
          电费结算明细查询与管理
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            电费结算明细
          </CardTitle>
          <CardDescription>
            结算数据查询、导入导出及明细管理
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 筛选器栏 */}
          <div className="flex items-end justify-between gap-4 pb-4 border-b">
            <div className="flex items-end gap-4 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">交易中心</label>
                <Select value={tradingCenter} onValueChange={setTradingCenter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="山西电力交易中心">山西电力交易中心</SelectItem>
                    <SelectItem value="山东电力交易中心">山东电力交易中心</SelectItem>
                    <SelectItem value="浙江电力交易中心">浙江电力交易中心</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">交易单元</label>
                <Select value={tradingUnit} onValueChange={setTradingUnit}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部交易单元</SelectItem>
                    <SelectItem value="unit001">交易单元001</SelectItem>
                    <SelectItem value="unit002">交易单元002</SelectItem>
                    <SelectItem value="unit003">交易单元003</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">起始月份</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "yyyy-MM", { locale: zhCN }) : "选择月份"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">结束月份</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "yyyy-MM", { locale: zhCN }) : "选择月份"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <Button className="bg-[#00B04D] hover:bg-[#009644]">查询</Button>
              <Button variant="outline" onClick={handleReset}>重置</Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                导出任务
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                导入
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="rounded-md border max-h-[600px] overflow-y-auto relative">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                <tr className="border-b-2 border-[#00B04D]">
                  <th className="h-11 px-3 text-left align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">交易单元</th>
                  <th className="h-11 px-3 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">结算单号</th>
                  <th className="h-11 px-3 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">结算年号</th>
                  <th className="h-11 px-3 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">结算单价<br/>(元/MWh)</th>
                  <th className="h-11 px-3 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">补偿单价<br/>(元/MWh)</th>
                  <th className="h-11 px-3 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">结算电量<br/>(MWh)</th>
                  <th className="h-11 px-3 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">结算电费<br/>(元)</th>
                  <th className="h-11 px-3 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">合同序位</th>
                  <th className="h-11 px-3 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">补偿结算收入<br/>(元)</th>
                  <th className="h-11 px-3 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">其他结算费用<br/>(元)</th>
                  <th className="h-11 px-3 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">总结算收入<br/>不含补贴(元)</th>
                  <th className="h-11 px-3 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">总结算收入<br/>含补贴(元)</th>
                  <th className="h-11 px-3 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">结算状态</th>
                  <th className="h-11 px-3 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">增值税率<br/>(%)</th>
                  <th className="h-11 px-3 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">备注</th>
                  <th className="h-11 px-3 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(record => renderRow(record))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settlement;
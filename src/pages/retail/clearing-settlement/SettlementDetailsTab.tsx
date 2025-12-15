import { useState, useMemo } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, Upload, Download, History, ChevronRight, ChevronDown, 
  Calendar as CalendarIcon, Pencil, Trash2, CheckCircle, Clock, AlertCircle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSettlementRecordsByMonth, SettlementRecord } from "@/hooks/useSettlementRecords";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DisplayRecord {
  id: string;
  category: string;
  subCategory: string;
  tradingUnit: string;
  settlementNo: string;
  settlementMonth: string;
  volume: number;
  price: number;
  amount: number;
  status: "settled" | "pending" | "processing";
  side: "purchase" | "sale";
  remark: string;
  children?: DisplayRecord[];
  isGroup?: boolean;
}

interface OperationLog {
  id: string;
  time: string;
  operator: string;
  action: string;
  detail: string;
}

const generateOperationLogs = (): OperationLog[] => {
  return [
    { id: "1", time: "2024-11-15 14:32:00", operator: "张三", action: "导入", detail: "导入202411月结算数据" },
    { id: "2", time: "2024-11-15 10:15:00", operator: "李四", action: "编辑", detail: "修改交易单元001结算金额" },
    { id: "3", time: "2024-11-14 16:45:00", operator: "王五", action: "删除", detail: "删除无效结算记录" },
    { id: "4", time: "2024-11-14 09:20:00", operator: "张三", action: "新增", detail: "新增辅助服务费结算" },
  ];
};

// 获取交易单元列表
const useTradingUnits = () => {
  return useQuery({
    queryKey: ['trading_units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trading_units')
        .select('id, unit_name, unit_code')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });
};

// 将数据库记录转换为树形结构
const transformToTreeData = (records: SettlementRecord[]): DisplayRecord[] => {
  const groupedByCategory: Record<string, Record<string, SettlementRecord[]>> = {};

  records.forEach(record => {
    const side = record.side as 'purchase' | 'sale';
    const key = `${side}-${record.category}`;
    if (!groupedByCategory[key]) {
      groupedByCategory[key] = {};
    }
    const subKey = record.sub_category || '其他';
    if (!groupedByCategory[key][subKey]) {
      groupedByCategory[key][subKey] = [];
    }
    groupedByCategory[key][subKey].push(record);
  });

  const result: DisplayRecord[] = [];

  Object.entries(groupedByCategory).forEach(([key, subCategories]) => {
    const [side, category] = key.split('-');
    const subCategoryRecords: DisplayRecord[] = [];
    
    Object.entries(subCategories).forEach(([subCategory, items]) => {
      const totalVolume = items.reduce((sum, r) => sum + r.volume, 0);
      const totalAmount = items.reduce((sum, r) => sum + r.amount, 0);
      const avgPrice = totalVolume > 0 ? totalAmount / totalVolume : 0;
      
      const children: DisplayRecord[] = items.map(item => ({
        id: item.id,
        category: item.category,
        subCategory: item.sub_category || '',
        tradingUnit: item.trading_unit_id || '-',
        settlementNo: item.settlement_no,
        settlementMonth: item.settlement_month,
        volume: item.volume,
        price: item.price || 0,
        amount: item.amount,
        status: (item.status === 'confirmed' ? 'settled' : item.status) as 'settled' | 'pending' | 'processing',
        side: item.side as 'purchase' | 'sale',
        remark: item.remark || '',
        isGroup: false,
      }));

      subCategoryRecords.push({
        id: `sub-${key}-${subCategory}`,
        category: category,
        subCategory: subCategory,
        tradingUnit: '-',
        settlementNo: '-',
        settlementMonth: items[0]?.settlement_month || '',
        volume: totalVolume,
        price: avgPrice,
        amount: totalAmount,
        status: 'settled',
        side: side as 'purchase' | 'sale',
        remark: `${items.length}条记录`,
        isGroup: true,
        children,
      });
    });

    const categoryTotalVolume = subCategoryRecords.reduce((sum, r) => sum + r.volume, 0);
    const categoryTotalAmount = subCategoryRecords.reduce((sum, r) => sum + r.amount, 0);
    
    result.push({
      id: `cat-${key}`,
      category: category,
      subCategory: '-',
      tradingUnit: '-',
      settlementNo: '-',
      settlementMonth: subCategoryRecords[0]?.settlementMonth || '',
      volume: categoryTotalVolume,
      price: categoryTotalVolume > 0 ? categoryTotalAmount / categoryTotalVolume : 0,
      amount: categoryTotalAmount,
      status: 'settled',
      side: side as 'purchase' | 'sale',
      remark: `${subCategoryRecords.length}个子类`,
      isGroup: true,
      children: subCategoryRecords,
    });
  });

  return result;
};

const SettlementDetailsTab = () => {
  const [settlementType, setSettlementType] = useState<"all" | "purchase" | "sale">("all");
  const [tradingUnit, setTradingUnit] = useState<string>("all");
  const [settlementMonth, setSettlementMonth] = useState<Date | undefined>(new Date(2025, 10, 1));
  const [settlementCategory, setSettlementCategory] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [fileCaptureStatus] = useState<"success" | "pending" | "error">("success");

  // 获取交易单元列表
  const { data: tradingUnits } = useTradingUnits();

  // 获取数据库结算数据
  const monthString = settlementMonth ? format(settlementMonth, 'yyyy-MM') : '2025-11';
  const { data: settlementRecords, isLoading } = useSettlementRecordsByMonth(monthString);

  // 转换数据为树形结构
  const treeData = useMemo(() => {
    if (!settlementRecords) return [];
    return transformToTreeData(settlementRecords);
  }, [settlementRecords]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const filteredData = useMemo(() => {
    let result = treeData;
    if (settlementType !== "all") {
      result = result.filter(r => r.side === settlementType);
    }
    return result;
  }, [treeData, settlementType]);

  const handleReset = () => {
    setSettlementType("all");
    setTradingUnit("all");
    setSettlementMonth(new Date(2025, 10, 1));
    setSettlementCategory("all");
    setKeyword("");
  };

  const getStatusBadge = (status: "settled" | "pending" | "processing") => {
    const config = {
      settled: { icon: CheckCircle, text: "已结算", color: "text-green-600 bg-green-50" },
      pending: { icon: Clock, text: "待结算", color: "text-yellow-600 bg-yellow-50" },
      processing: { icon: AlertCircle, text: "结算中", color: "text-blue-600 bg-blue-50" },
    };
    const { icon: Icon, text, color } = config[status];
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit", color)}>
        <Icon className="h-3 w-3" />
        {text}
      </span>
    );
  };

  const renderRow = (record: DisplayRecord, level: number = 0): JSX.Element[] => {
    const isExpanded = expandedRows.has(record.id);
    const hasChildren = record.children && record.children.length > 0;
    const bgColor = level === 0 ? "bg-[#E8F0EC]" : level === 1 ? "bg-[#F1F8F4]" : "";
    const fontWeight = record.isGroup ? "font-semibold" : "";
    
    const rows: JSX.Element[] = [
      <tr key={record.id} className={cn("border-b transition-colors hover:bg-[#F8FBFA]", bgColor)}>
        <td className={cn("p-3 align-middle", fontWeight)} style={{ paddingLeft: `${12 + level * 20}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button onClick={() => toggleRow(record.id)} className="hover:text-[#00B04D]">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : <span className="w-4" />}
            <span>{level === 0 ? record.category : level === 1 ? record.subCategory : record.tradingUnit}</span>
          </div>
        </td>
        <td className={cn("p-3 align-middle text-center text-xs", fontWeight)}>{record.settlementNo}</td>
        <td className={cn("p-3 align-middle text-center text-xs", fontWeight)}>{record.settlementMonth}</td>
        <td className={cn("p-3 align-middle text-right font-mono text-xs", fontWeight)}>{record.volume.toFixed(2)}</td>
        <td className={cn("p-3 align-middle text-right font-mono text-xs", fontWeight)}>{record.price.toFixed(2)}</td>
        <td className={cn("p-3 align-middle text-right font-mono text-xs", fontWeight)}>{record.amount.toFixed(2)}</td>
        <td className="p-3 align-middle text-center">{!record.isGroup && getStatusBadge(record.status)}</td>
        <td className={cn("p-3 align-middle text-center text-xs text-muted-foreground", fontWeight)}>{record.remark}</td>
        <td className="p-3 align-middle text-center">
          {!record.isGroup && (
            <div className="flex items-center justify-center gap-2">
              <button className="text-blue-600 hover:text-blue-800"><Pencil className="h-3.5 w-3.5" /></button>
              <button className="text-red-600 hover:text-red-800"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        </td>
      </tr>
    ];

    if (isExpanded && hasChildren) {
      record.children!.forEach(child => rows.push(...renderRow(child, level + 1)));
    }
    return rows;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B04D]" />
        <span className="ml-2 text-muted-foreground">加载结算明细...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 文件抓取状态 */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">结算文件自动抓取状态:</span>
              <span className={cn("px-3 py-1 rounded-full text-xs flex items-center gap-1",
                fileCaptureStatus === "success" ? "bg-green-100 text-green-700" : 
                fileCaptureStatus === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
              )}>
                {fileCaptureStatus === "success" ? <CheckCircle className="h-3 w-3" /> : 
                 fileCaptureStatus === "pending" ? <Clock className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {fileCaptureStatus === "success" ? "同步成功" : fileCaptureStatus === "pending" ? "同步中" : "同步失败"}
              </span>
              <span className="text-xs text-muted-foreground">最后更新: 2025-11-15 14:30</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.success("开始同步结算文件...")}>
              刷新同步
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 结算类型切换 */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">结算类型：</span>
        <ToggleGroup type="single" value={settlementType} onValueChange={(v) => v && setSettlementType(v as "all" | "purchase" | "sale")}>
          <ToggleGroupItem value="all" className="data-[state=on]:bg-[#00B04D] data-[state=on]:text-white">全部</ToggleGroupItem>
          <ToggleGroupItem value="purchase" className="data-[state=on]:bg-[#00B04D] data-[state=on]:text-white">购电侧明细</ToggleGroupItem>
          <ToggleGroupItem value="sale" className="data-[state=on]:bg-[#00B04D] data-[state=on]:text-white">售电侧明细</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* 筛选器栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">交易单元</label>
              <Select value={tradingUnit} onValueChange={setTradingUnit}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部交易单元</SelectItem>
                  {tradingUnits?.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>{unit.unit_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">结算月份</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {settlementMonth ? format(settlementMonth, "yyyy-MM", { locale: zhCN }) : "选择月份"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={settlementMonth} onSelect={setSettlementMonth} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">结算类别</label>
              <Select value={settlementCategory} onValueChange={setSettlementCategory}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="mediumLong">中长期交易</SelectItem>
                  <SelectItem value="intraSpot">省内现货</SelectItem>
                  <SelectItem value="interSpot">省间现货</SelectItem>
                  <SelectItem value="deviation">偏差考核</SelectItem>
                  <SelectItem value="other">其他费用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">关键字</label>
              <Input placeholder="搜索..." value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-[140px]" />
            </div>

            <Button className="bg-[#00B04D] hover:bg-[#009644]">查询</Button>
            <Button variant="outline" onClick={handleReset}>重置</Button>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => toast.success("新增结算记录")}>
                <Plus className="mr-1 h-4 w-4" />新增
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("导入结算文件")}>
                <Upload className="mr-1 h-4 w-4" />导入
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("导出结算数据")}>
                <Download className="mr-1 h-4 w-4" />导出
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><History className="mr-1 h-4 w-4" />操作日志</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>操作日志</DialogTitle></DialogHeader>
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F1F8F4] sticky top-0">
                        <tr>
                          <th className="p-3 text-left">时间</th>
                          <th className="p-3 text-left">操作人</th>
                          <th className="p-3 text-left">操作类型</th>
                          <th className="p-3 text-left">详情</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateOperationLogs().map(log => (
                          <tr key={log.id} className="border-b hover:bg-[#F8FBFA]">
                            <td className="p-3 font-mono text-xs">{log.time}</td>
                            <td className="p-3">{log.operator}</td>
                            <td className="p-3"><span className="px-2 py-1 bg-[#F1F8F4] text-[#00B04D] rounded text-xs">{log.action}</span></td>
                            <td className="p-3 text-muted-foreground">{log.detail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 二级分类表格 */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                <tr className="border-b border-[#00B04D]/30">
                  <th className="h-10 px-3 text-left font-semibold text-gray-700 text-xs bg-[#F1F8F4]">结算分类</th>
                  <th className="h-10 px-3 text-center font-semibold text-gray-700 text-xs bg-[#F1F8F4]">结算单号</th>
                  <th className="h-10 px-3 text-center font-semibold text-gray-700 text-xs bg-[#F1F8F4]">结算月份</th>
                  <th className="h-10 px-3 text-right font-semibold text-gray-700 text-xs bg-[#F1F8F4]">电量(MWh)</th>
                  <th className="h-10 px-3 text-right font-semibold text-gray-700 text-xs bg-[#F1F8F4]">单价(元/MWh)</th>
                  <th className="h-10 px-3 text-right font-semibold text-gray-700 text-xs bg-[#F1F8F4]">金额(元)</th>
                  <th className="h-10 px-3 text-center font-semibold text-gray-700 text-xs bg-[#F1F8F4]">状态</th>
                  <th className="h-10 px-3 text-center font-semibold text-gray-700 text-xs bg-[#F1F8F4]">备注</th>
                  <th className="h-10 px-3 text-center font-semibold text-gray-700 text-xs bg-[#F1F8F4]">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(record => renderRow(record))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      暂无结算数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettlementDetailsTab;

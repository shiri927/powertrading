import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, ChevronRight, ChevronDown, Download, Upload, FileSpreadsheet, Calendar as CalendarIcon, Eye, FileText, TrendingUp, PieChart, BarChart3, Table, Search, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { useSettlementRecordsByMonth, useSettlementStats, useSettlementStatements, SettlementRecord } from "@/hooks/useSettlementRecords";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// ============= 现货结算汇总 Tab =============
interface SpotSettlementItem {
  id: string;
  category: string;
  subCategory: string;
  amount: number;
  percentage: number;
  unitCost: number;
}

// 将数据库记录转换为UI数据格式
const transformSettlementRecords = (records: SettlementRecord[]): SpotSettlementItem[] => {
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  
  return records.map((record, i) => ({
    id: record.id,
    category: record.category,
    subCategory: record.sub_category || record.category,
    amount: record.amount,
    percentage: total > 0 ? (record.amount / total) * 100 : 0,
    unitCost: record.volume > 0 ? record.amount / record.volume : 0,
  }));
};

// Mock数据生成（作为fallback）
const generateSpotSettlementData = (): SpotSettlementItem[] => {
  const categories = [
    { category: "电能量费用", subCategory: "日前电能量费用", base: 5000000 },
    { category: "电能量费用", subCategory: "实时电能量费用", base: 1200000 },
    { category: "偏差考核费用", subCategory: "正偏差考核", base: 150000 },
    { category: "偏差考核费用", subCategory: "负偏差考核", base: 85000 },
    { category: "辅助服务费用", subCategory: "调频服务费用", base: 320000 },
    { category: "辅助服务费用", subCategory: "备用服务费用", base: 180000 },
    { category: "辅助服务费用", subCategory: "调峰服务费用", base: 250000 },
    { category: "容量补偿费用", subCategory: "容量补偿收入", base: 420000 },
    { category: "其他费用", subCategory: "输配电费用", base: 680000 },
    { category: "其他费用", subCategory: "系统运行费用", base: 95000 },
  ];
  
  const total = categories.reduce((sum, c) => sum + c.base + Math.random() * c.base * 0.2, 0);
  
  return categories.map((c, i) => {
    const amount = c.base + Math.random() * c.base * 0.2;
    return {
      id: `spot-${i}`,
      category: c.category,
      subCategory: c.subCategory,
      amount,
      percentage: (amount / total) * 100,
      unitCost: amount / (10000 + Math.random() * 5000),
    };
  });
};

const SpotSettlementSummaryTab = () => {
  const [region, setRegion] = useState("all");
  const [month, setMonth] = useState<Date | undefined>(new Date(2025, 10, 1)); // 2025-11
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  
  // 使用数据库数据
  const monthStr = month ? format(month, "yyyy-MM") : "2024-11";
  const { data: dbRecords = [], isLoading } = useSettlementRecordsByMonth(monthStr);
  const { data: stats } = useSettlementStats(monthStr);
  
  // 优先使用数据库数据，无数据时使用Mock
  const data = useMemo(() => {
    if (dbRecords.length > 0) {
      return transformSettlementRecords(dbRecords);
    }
    return generateSpotSettlementData();
  }, [dbRecords]);
  
  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    data.forEach(item => {
      grouped[item.category] = (grouped[item.category] || 0) + item.amount;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [data]);
  
  const totalAmount = stats?.totalAmount || data.reduce((sum, item) => sum + item.amount, 0);
  const avgUnitCost = stats?.totalVolume && stats.totalVolume > 0 
    ? stats.totalAmount / stats.totalVolume 
    : data.reduce((sum, item) => sum + item.unitCost, 0) / data.length;
  
  const COLORS = ["#00B04D", "#0088FE", "#FFBB28", "#FF8042", "#8884d8"];
  
  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <div className="flex items-end gap-4 pb-4 border-b">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">区域</label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部区域</SelectItem>
              <SelectItem value="shandong">山东省</SelectItem>
              <SelectItem value="shanxi">山西省</SelectItem>
              <SelectItem value="zhejiang">浙江省</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">结算月份</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {month ? format(month, "yyyy-MM", { locale: zhCN }) : "选择月份"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={month} onSelect={setMonth} className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <Button className="bg-[#00B04D] hover:bg-[#009644]">查询</Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant={viewMode === "chart" ? "default" : "outline"} size="sm" onClick={() => setViewMode("chart")}>
            <PieChart className="mr-2 h-4 w-4" />图表
          </Button>
          <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>
            <Table className="mr-2 h-4 w-4" />表格
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />导出
          </Button>
        </div>
      </div>
      
      {/* 汇总指标 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">费用总计</div>
            <div className="text-2xl font-bold font-mono text-[#00B04D]">¥{(totalAmount / 10000).toFixed(2)}万</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">电能量费用占比</div>
            <div className="text-2xl font-bold font-mono">{((categoryData.find(c => c.name === "电能量费用")?.value || 0) / totalAmount * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">平均度电成本</div>
            <div className="text-2xl font-bold font-mono">¥{avgUnitCost.toFixed(2)}/kWh</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">场站数量</div>
            <div className="text-2xl font-bold font-mono">9个</div>
          </CardContent>
        </Card>
      </div>
      
      {viewMode === "chart" ? (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">费用分类占比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `¥${(value / 10000).toFixed(2)}万`} />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">各场站费用对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: "山东A", amount: 850000 },
                  { name: "山东B", amount: 720000 },
                  { name: "山东C", amount: 680000 },
                  { name: "山西A", amount: 920000 },
                  { name: "山西B", amount: 580000 },
                  { name: "山西C", amount: 450000 },
                  { name: "浙江A", amount: 1100000 },
                  { name: "浙江B", amount: 890000 },
                  { name: "浙江C", amount: 760000 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                  <Tooltip formatter={(value: number) => `¥${(value / 10000).toFixed(2)}万`} />
                  <Bar dataKey="amount" fill="#00B04D" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-[#F1F8F4]">
              <tr className="border-b">
                <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-xs">费用类别</th>
                <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-xs">费用子项</th>
                <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs">金额(元)</th>
                <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs">占比(%)</th>
                <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs">度电成本(元/kWh)</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-b hover:bg-[#F8FBFA]">
                  <td className="p-4">{item.category}</td>
                  <td className="p-4">{item.subCategory}</td>
                  <td className="p-4 text-right font-mono text-xs">{item.amount.toFixed(2)}</td>
                  <td className="p-4 text-right font-mono text-xs">{item.percentage.toFixed(2)}%</td>
                  <td className="p-4 text-right font-mono text-xs">{item.unitCost.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============= 中长期结算汇总 Tab =============
interface MediumLongTermItem {
  id: string;
  tradingUnit: string;
  contractName: string;
  period: string;
  settlementVolume: number;
  settlementPrice: number;
  settlementFee: number;
  deviationVolume: number;
  deviationFee: number;
}

// 使用数据库数据的中长期结算Hook
const useMediumLongTermData = () => {
  return useQuery({
    queryKey: ['medium_long_term_settlement'],
    queryFn: async () => {
      // 从settlement_records获取数据，按category和trading_unit聚合
      const { data: records, error } = await supabase
        .from('settlement_records')
        .select(`
          *,
          trading_unit:trading_units(id, unit_name, unit_code)
        `)
        .order('settlement_month', { ascending: false });
      
      if (error) throw error;
      
      // 转换为UI格式
      const contractMap: Record<string, string> = {
        '电能量结算': '月度集中竞价',
        '偏差考核': '日滚动合同',
        '辅助服务': '月内挂牌交易',
        '容量补偿': '年度双边合同',
      };
      
      return (records || []).map((r: any) => ({
        id: r.id,
        tradingUnit: r.trading_unit?.unit_name?.replace('-发电单元', '') || '未知',
        contractName: contractMap[r.category] || r.category,
        period: r.settlement_month,
        settlementVolume: r.volume,
        settlementPrice: r.price || (r.amount / r.volume),
        settlementFee: r.amount,
        deviationVolume: (Math.random() - 0.5) * 100,
        deviationFee: (Math.random() - 0.5) * r.amount * 0.1,
      })) as MediumLongTermItem[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

const MediumLongTermSettlementTab = () => {
  const [tradingUnit, setTradingUnit] = useState("all");
  const [contract, setContract] = useState("all");
  const [viewMode, setViewMode] = useState<"chart" | "table">("table");
  
  const { data: dbData = [], isLoading } = useMediumLongTermData();
  
  const filteredData = useMemo(() => {
    return dbData.filter(item => {
      if (tradingUnit !== "all" && item.tradingUnit !== tradingUnit) return false;
      if (contract !== "all" && item.contractName !== contract) return false;
      return true;
    });
  }, [dbData, tradingUnit, contract]);
  
  // 获取交易单元列表
  const tradingUnits = useMemo(() => {
    const units = [...new Set(dbData.map(d => d.tradingUnit))];
    return units.sort();
  }, [dbData]);
  
  const chartData = useMemo(() => {
    const grouped: Record<string, { period: string; volume: number; fee: number }> = {};
    filteredData.forEach(item => {
      if (!grouped[item.period]) {
        grouped[item.period] = { period: item.period, volume: 0, fee: 0 };
      }
      grouped[item.period].volume += item.settlementVolume;
      grouped[item.period].fee += item.settlementFee;
    });
    return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
  }, [filteredData]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4 pb-4 border-b">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">交易单元</label>
          <Select value={tradingUnit} onValueChange={setTradingUnit}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部交易单元</SelectItem>
              {tradingUnits.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">合同类型</label>
          <Select value={contract} onValueChange={setContract}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部合同</SelectItem>
              <SelectItem value="年度双边合同">年度双边合同</SelectItem>
              <SelectItem value="月度集中竞价">月度集中竞价</SelectItem>
              <SelectItem value="月内挂牌交易">月内挂牌交易</SelectItem>
              <SelectItem value="日滚动合同">日滚动合同</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-[#00B04D] hover:bg-[#009644]">查询</Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant={viewMode === "chart" ? "default" : "outline"} size="sm" onClick={() => setViewMode("chart")}>
            <BarChart3 className="mr-2 h-4 w-4" />图表
          </Button>
          <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>
            <Table className="mr-2 h-4 w-4" />表格
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />导出
          </Button>
        </div>
      </div>
      
      {viewMode === "chart" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">结算电量与电费趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(0)}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#00B04D" name="结算电量(MWh)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="fee" stroke="#0088FE" name="结算电费(元)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border max-h-[500px] overflow-y-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
              <tr className="border-b">
                <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">交易单元</th>
                <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">合同名称</th>
                <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">结算周期</th>
                <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">结算电量(MWh)</th>
                <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">结算单价(元/MWh)</th>
                <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">结算电费(元)</th>
                <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">偏差电量(MWh)</th>
                <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">偏差费用(元)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 50).map(item => (
                <tr key={item.id} className="border-b hover:bg-[#F8FBFA]">
                  <td className="p-4">{item.tradingUnit}</td>
                  <td className="p-4">{item.contractName}</td>
                  <td className="p-4 text-center">{item.period}</td>
                  <td className="p-4 text-right font-mono text-xs">{item.settlementVolume.toFixed(3)}</td>
                  <td className="p-4 text-right font-mono text-xs">{item.settlementPrice.toFixed(2)}</td>
                  <td className="p-4 text-right font-mono text-xs">{item.settlementFee.toFixed(2)}</td>
                  <td className={cn("p-4 text-right font-mono text-xs", item.deviationVolume >= 0 ? "text-green-600" : "text-red-600")}>
                    {item.deviationVolume >= 0 ? "+" : ""}{item.deviationVolume.toFixed(3)}
                  </td>
                  <td className={cn("p-4 text-right font-mono text-xs", item.deviationFee >= 0 ? "text-green-600" : "text-red-600")}>
                    {item.deviationFee >= 0 ? "+" : ""}{item.deviationFee.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============= 结算单管理 Tab =============
interface SettlementDocument {
  id: string;
  tradingUnit: string;
  documentType: "日清分" | "日结算单" | "月结算单";
  documentNo: string;
  period: string;
  createTime: string;
  status: "已确认" | "待确认" | "已驳回";
  amount: number;
}

// 将数据库结算单类型转换为UI显示类型
const mapStatementType = (type: string): "日清分" | "日结算单" | "月结算单" => {
  switch (type) {
    case 'daily_clearing': return '日清分';
    case 'daily_statement': return '日结算单';
    case 'monthly_statement': return '月结算单';
    default: return '月结算单';
  }
};

const mapStatus = (status: string): "已确认" | "待确认" | "已驳回" => {
  switch (status) {
    case 'audited': return '已确认';
    case 'pending': return '待确认';
    case 'archived': 
    case 'rejected': return '已驳回';
    default: return '待确认';
  }
};

const SettlementDocumentTab = () => {
  const [tradingUnit, setTradingUnit] = useState("all");
  const [docType, setDocType] = useState("all");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  
  // 使用数据库数据
  const { data: statements = [], isLoading } = useSettlementStatements();
  
  // 转换为UI格式
  const data = useMemo((): SettlementDocument[] => {
    return statements.map(s => ({
      id: s.id,
      tradingUnit: s.trading_unit?.unit_name?.replace('-发电单元', '') || '未知',
      documentType: mapStatementType(s.statement_type),
      documentNo: s.statement_no,
      period: format(new Date(s.period_start), 'yyyy-MM'),
      createTime: format(new Date(s.generated_at), 'yyyy-MM-dd HH:mm'),
      status: mapStatus(s.status),
      amount: s.total_amount,
    }));
  }, [statements]);
  
  // 获取交易单元列表
  const tradingUnits = useMemo(() => {
    const units = [...new Set(data.map(d => d.tradingUnit))];
    return units.sort();
  }, [data]);
  
  const filteredData = useMemo(() => {
    return data.filter(doc => {
      if (tradingUnit !== "all" && doc.tradingUnit !== tradingUnit) return false;
      if (docType !== "all" && doc.documentType !== docType) return false;
      return true;
    });
  }, [data, tradingUnit, docType]);
  
  const toggleSelect = (id: string) => {
    setSelectedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const toggleSelectAll = () => {
    if (selectedDocs.size === filteredData.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredData.map(d => d.id)));
    }
  };
  
  return (
    <div className="space-y-6">
      {isLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />加载中...</div>}
      <div className="flex items-end gap-4 pb-4 border-b">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">交易单元</label>
          <Select value={tradingUnit} onValueChange={setTradingUnit}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部交易单元</SelectItem>
              {tradingUnits.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">单据类型</label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="日清分">日清分</SelectItem>
              <SelectItem value="日结算单">日结算单</SelectItem>
              <SelectItem value="月结算单">月结算单</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-[#00B04D] hover:bg-[#009644]">
          <Search className="mr-2 h-4 w-4" />查询
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={selectedDocs.size === 0}>
            <Download className="mr-2 h-4 w-4" />批量下载 ({selectedDocs.size})
          </Button>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />批量导出
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border max-h-[500px] overflow-y-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
            <tr className="border-b">
              <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] w-12">
                <input type="checkbox" checked={selectedDocs.size === filteredData.length && filteredData.length > 0} onChange={toggleSelectAll} className="h-4 w-4" />
              </th>
              <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">交易单元</th>
              <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">单据类型</th>
              <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">单据编号</th>
              <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">结算周期</th>
              <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">生成时间</th>
              <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">状态</th>
              <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">金额(元)</th>
              <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4]">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(doc => (
              <tr key={doc.id} className="border-b hover:bg-[#F8FBFA]">
                <td className="p-4 text-center">
                  <input type="checkbox" checked={selectedDocs.has(doc.id)} onChange={() => toggleSelect(doc.id)} className="h-4 w-4" />
                </td>
                <td className="p-4">{doc.tradingUnit}</td>
                <td className="p-4 text-center">
                  <span className={cn("px-2 py-1 rounded text-xs", 
                    doc.documentType === "月结算单" ? "bg-blue-100 text-blue-700" :
                    doc.documentType === "日结算单" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-700"
                  )}>{doc.documentType}</span>
                </td>
                <td className="p-4 font-mono text-xs">{doc.documentNo}</td>
                <td className="p-4 text-center">{doc.period}</td>
                <td className="p-4 text-center font-mono text-xs">{doc.createTime}</td>
                <td className="p-4 text-center">
                  <span className={cn("px-2 py-1 rounded text-xs",
                    doc.status === "已确认" ? "bg-green-100 text-green-700" :
                    doc.status === "待确认" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  )}>{doc.status}</span>
                </td>
                <td className="p-4 text-right font-mono text-xs">{doc.amount.toFixed(2)}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span className="text-xs">预览</span>
                    </button>
                    <button className="text-green-600 hover:text-green-800 flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" />
                      <span className="text-xs">下载</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============= 电费结算明细 Tab =============
interface ElectricityBillDetail {
  id: string;
  tradingUnit: string;
  month: string;
  dayAheadVolume: number;
  dayAheadFee: number;
  realtimeVolume: number;
  realtimeFee: number;
  deviationFee: number;
  ancillaryFee: number;
  capacityFee: number;
  otherFee: number;
  totalFee: number;
  fetchTime: string;
  status: "已解析" | "解析中" | "待解析";
}

// 使用数据库数据生成电费明细
const useElectricityBillData = () => {
  return useQuery({
    queryKey: ['electricity_bill_details'],
    queryFn: async () => {
      // 获取各月份的结算记录汇总
      const { data: records, error } = await supabase
        .from('settlement_records')
        .select(`
          *,
          trading_unit:trading_units(id, unit_name)
        `)
        .order('settlement_month', { ascending: false });
      
      if (error) throw error;
      
      // 按交易单元和月份聚合
      const aggregated: Record<string, ElectricityBillDetail> = {};
      
      (records || []).forEach((r: any) => {
        const unitName = r.trading_unit?.unit_name?.replace('-发电单元', '') || '未知';
        const key = `${unitName}-${r.settlement_month}`;
        
        if (!aggregated[key]) {
          aggregated[key] = {
            id: key,
            tradingUnit: unitName,
            month: r.settlement_month,
            dayAheadVolume: 0,
            dayAheadFee: 0,
            realtimeVolume: 0,
            realtimeFee: 0,
            deviationFee: 0,
            ancillaryFee: 0,
            capacityFee: 0,
            otherFee: 0,
            totalFee: 0,
            fetchTime: format(new Date(r.updated_at), 'yyyy-MM-dd HH:mm'),
            status: '已解析',
          };
        }
        
        // 按category分配费用
        switch (r.category) {
          case '电能量结算':
            aggregated[key].dayAheadVolume += r.volume * 0.8;
            aggregated[key].dayAheadFee += r.amount * 0.8;
            aggregated[key].realtimeVolume += r.volume * 0.2;
            aggregated[key].realtimeFee += r.amount * 0.2;
            break;
          case '偏差考核':
            aggregated[key].deviationFee += r.amount;
            break;
          case '辅助服务':
            aggregated[key].ancillaryFee += r.amount;
            break;
          case '容量补偿':
            aggregated[key].capacityFee += r.amount;
            break;
          default:
            aggregated[key].otherFee += r.amount;
        }
        
        aggregated[key].totalFee = 
          aggregated[key].dayAheadFee + 
          aggregated[key].realtimeFee + 
          aggregated[key].deviationFee + 
          aggregated[key].ancillaryFee + 
          aggregated[key].capacityFee + 
          aggregated[key].otherFee;
      });
      
      return Object.values(aggregated);
    },
    staleTime: 1000 * 60 * 5,
  });
};

const ElectricityBillDetailTab = () => {
  const [tradingUnit, setTradingUnit] = useState("all");
  const [month, setMonth] = useState<Date | undefined>(new Date(2025, 10, 1));
  
  const { data: dbData = [], isLoading } = useElectricityBillData();
  
  // 获取交易单元列表
  const tradingUnits = useMemo(() => {
    const units = [...new Set(dbData.map(d => d.tradingUnit))];
    return units.sort();
  }, [dbData]);
  
  const filteredData = useMemo(() => {
    return dbData.filter(item => {
      if (tradingUnit !== "all" && item.tradingUnit !== tradingUnit) return false;
      if (month) {
        const selectedMonth = format(month, "yyyy-MM");
        if (item.month !== selectedMonth) return false;
      }
      return true;
    });
  }, [dbData, tradingUnit, month]);
  
  return (
    <div className="space-y-6">
      {isLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />加载中...</div>}
      <div className="flex items-end gap-4 pb-4 border-b">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">交易单元</label>
          <Select value={tradingUnit} onValueChange={setTradingUnit}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部交易单元</SelectItem>
              {tradingUnits.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">结算月份</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {month ? format(month, "yyyy-MM", { locale: zhCN }) : "选择月份"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={month} onSelect={setMonth} className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <Button className="bg-[#00B04D] hover:bg-[#009644]">
          <Search className="mr-2 h-4 w-4" />查询
        </Button>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />同步数据
        </Button>
        <div className="ml-auto">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />导出明细
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
            <tr className="border-b">
              <th className="h-10 px-4 text-left align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">交易单元</th>
              <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">结算月份</th>
              <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">日前电量<br/>(MWh)</th>
              <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">日前电费<br/>(元)</th>
              <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">实时电量<br/>(MWh)</th>
              <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">实时电费<br/>(元)</th>
              <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">偏差费用<br/>(元)</th>
              <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">辅助服务费<br/>(元)</th>
              <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">容量费用<br/>(元)</th>
              <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">其他费用<br/>(元)</th>
              <th className="h-10 px-4 text-right align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">合计费用<br/>(元)</th>
              <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">抓取时间</th>
              <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">状态</th>
              <th className="h-10 px-4 text-center align-middle font-semibold text-gray-700 text-xs bg-[#F1F8F4] whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id} className="border-b hover:bg-[#F8FBFA]">
                <td className="p-4">{item.tradingUnit}</td>
                <td className="p-4 text-center">{item.month}</td>
                <td className="p-4 text-right font-mono text-xs">{item.dayAheadVolume.toFixed(3)}</td>
                <td className="p-4 text-right font-mono text-xs">{item.dayAheadFee.toFixed(2)}</td>
                <td className="p-4 text-right font-mono text-xs">{item.realtimeVolume.toFixed(3)}</td>
                <td className="p-4 text-right font-mono text-xs">{item.realtimeFee.toFixed(2)}</td>
                <td className={cn("p-4 text-right font-mono text-xs", item.deviationFee >= 0 ? "text-green-600" : "text-red-600")}>
                  {item.deviationFee >= 0 ? "+" : ""}{item.deviationFee.toFixed(2)}
                </td>
                <td className="p-4 text-right font-mono text-xs">{item.ancillaryFee.toFixed(2)}</td>
                <td className="p-4 text-right font-mono text-xs">{item.capacityFee.toFixed(2)}</td>
                <td className="p-4 text-right font-mono text-xs">{item.otherFee.toFixed(2)}</td>
                <td className="p-4 text-right font-mono text-xs font-semibold">{item.totalFee.toFixed(2)}</td>
                <td className="p-4 text-center font-mono text-xs">{item.fetchTime}</td>
                <td className="p-4 text-center">
                  <span className={cn("px-2 py-1 rounded text-xs",
                    item.status === "已解析" ? "bg-green-100 text-green-700" :
                    item.status === "解析中" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  )}>{item.status}</span>
                </td>
                <td className="p-4 text-center">
                  <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-xs">查看明细</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============= 主组件 =============
const Settlement = () => {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">结算管理</h1>
        <p className="text-muted-foreground mt-2">
          电费结算汇总分析与明细查询
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            结算数据管理
          </CardTitle>
          <CardDescription>
            现货与中长期结算汇总、结算单管理及电费明细查询
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="spot-summary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="spot-summary">现货结算汇总</TabsTrigger>
              <TabsTrigger value="medium-long-term">中长期结算汇总</TabsTrigger>
              <TabsTrigger value="settlement-docs">结算单管理</TabsTrigger>
              <TabsTrigger value="bill-details">电费结算明细</TabsTrigger>
            </TabsList>
            
            <TabsContent value="spot-summary">
              <SpotSettlementSummaryTab />
            </TabsContent>
            
            <TabsContent value="medium-long-term">
              <MediumLongTermSettlementTab />
            </TabsContent>
            
            <TabsContent value="settlement-docs">
              <SettlementDocumentTab />
            </TabsContent>
            
            <TabsContent value="bill-details">
              <ElectricityBillDetailTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settlement;

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, RefreshCw, Eye, FileText, Calendar, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSettlementStatements, SettlementStatement } from "@/hooks/useSettlementRecords";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const SettlementStatementTab = () => {
  const [tradingUnit, setTradingUnit] = useState<string>("all");
  const [statementType, setStatementType] = useState<string>("all");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  
  // 获取数据库数据
  const { data: statements, isLoading, refetch } = useSettlementStatements(
    tradingUnit !== 'all' ? tradingUnit : undefined
  );
  const { data: tradingUnits } = useTradingUnits();

  const filteredData = useMemo(() => {
    if (!statements) return [];
    return statements.filter(item => {
      if (statementType !== "all" && item.statement_type !== statementType) return false;
      return true;
    });
  }, [statements, statementType]);

  const groupedData = useMemo(() => {
    const groups: Record<string, SettlementStatement[]> = {
      daily_clearing: [],
      daily_settlement: [],
      monthly_settlement: [],
    };
    filteredData.forEach(item => {
      if (groups[item.statement_type]) {
        groups[item.statement_type].push(item);
      }
    });
    return groups;
  }, [filteredData]);

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { icon: typeof BarChart3, text: string, color: string }> = {
      daily_clearing: { icon: BarChart3, text: "日清分", color: "bg-blue-100 text-blue-700" },
      daily_settlement: { icon: FileText, text: "日结算单", color: "bg-green-100 text-green-700" },
      monthly_settlement: { icon: Calendar, text: "月结算单", color: "bg-purple-100 text-purple-700" },
    };
    const { icon: Icon, text, color } = config[type] || { icon: FileText, text: type, color: "bg-gray-100 text-gray-700" };
    return (
      <span className={cn("px-2 py-1 rounded text-xs flex items-center gap-1 w-fit", color)}>
        <Icon className="h-3 w-3" />
        {text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { text: string, color: string }> = {
      audited: { text: "已审核", color: "bg-green-100 text-green-700" },
      pending: { text: "待审核", color: "bg-yellow-100 text-yellow-700" },
      archived: { text: "已归档", color: "bg-gray-100 text-gray-600" },
    };
    const { text, color } = config[status] || { text: status, color: "bg-gray-100 text-gray-600" };
    return <span className={cn("px-2 py-1 rounded-full text-xs", color)}>{text}</span>;
  };

  const handleDownloadSelected = () => {
    if (selectedRows.size === 0) {
      toast.error("请先选择要下载的结算单");
      return;
    }
    toast.success(`开始下载 ${selectedRows.size} 个结算单...`);
  };

  const handleBatchExport = () => {
    toast.success("开始批量导出结算单...");
  };

  const renderStatementTable = (stmts: SettlementStatement[], title: string) => {
    if (stmts.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {title === "日清分数据" && <BarChart3 className="h-5 w-5 text-blue-600" />}
            {title === "日结算单" && <FileText className="h-5 w-5 text-green-600" />}
            {title === "月结算单" && <Calendar className="h-5 w-5 text-purple-600" />}
            {title}
            <span className="text-sm font-normal text-muted-foreground">({stmts.length}条)</span>
          </h3>
          <div className="rounded-md border max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                <tr className="border-b border-[#00B04D]/30">
                  <th className="h-10 px-3 text-center w-12 bg-[#F1F8F4]">
                    <Checkbox 
                      checked={stmts.every(s => selectedRows.has(s.id))}
                      onCheckedChange={() => {
                        const allSelected = stmts.every(s => selectedRows.has(s.id));
                        setSelectedRows(prev => {
                          const newSet = new Set(prev);
                          stmts.forEach(s => allSelected ? newSet.delete(s.id) : newSet.add(s.id));
                          return newSet;
                        });
                      }}
                    />
                  </th>
                  <th className="h-10 px-3 text-left font-semibold text-gray-700 text-xs bg-[#F1F8F4]">结算单号</th>
                  <th className="h-10 px-3 text-center font-semibold text-gray-700 text-xs bg-[#F1F8F4]">类型</th>
                  <th className="h-10 px-3 text-left font-semibold text-gray-700 text-xs bg-[#F1F8F4]">交易单元</th>
                  <th className="h-10 px-3 text-center font-semibold text-gray-700 text-xs bg-[#F1F8F4]">周期</th>
                  <th className="h-10 px-3 text-right font-semibold text-gray-700 text-xs bg-[#F1F8F4]">电量(MWh)</th>
                  <th className="h-10 px-3 text-right font-semibold text-gray-700 text-xs bg-[#F1F8F4]">金额(元)</th>
                  <th className="h-10 px-3 text-center font-semibold text-gray-700 text-xs bg-[#F1F8F4]">状态</th>
                  <th className="h-10 px-3 text-center font-semibold text-gray-700 text-xs bg-[#F1F8F4]">操作</th>
                </tr>
              </thead>
              <tbody>
                {stmts.map(statement => (
                  <tr key={statement.id} className="border-b transition-colors hover:bg-[#F8FBFA]">
                    <td className="p-3 text-center">
                      <Checkbox 
                        checked={selectedRows.has(statement.id)} 
                        onCheckedChange={() => toggleRowSelection(statement.id)} 
                      />
                    </td>
                    <td className="p-3 font-mono text-xs">{statement.statement_no}</td>
                    <td className="p-3 text-center">{getTypeBadge(statement.statement_type)}</td>
                    <td className="p-3">{statement.trading_unit?.unit_name || '-'}</td>
                    <td className="p-3 text-center">{statement.period_start} ~ {statement.period_end}</td>
                    <td className="p-3 text-right font-mono text-xs">{statement.total_volume.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-xs">{statement.total_amount.toFixed(2)}</td>
                    <td className="p-3 text-center">{getStatusBadge(statement.status)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader><DialogTitle>结算单预览 - {statement.statement_no}</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 p-4 bg-[#F1F8F4] rounded-lg">
                                <div><span className="text-muted-foreground">结算单号:</span> <span className="font-mono">{statement.statement_no}</span></div>
                                <div><span className="text-muted-foreground">类型:</span> {getTypeBadge(statement.statement_type)}</div>
                                <div><span className="text-muted-foreground">交易单元:</span> {statement.trading_unit?.unit_name || '-'}</div>
                                <div><span className="text-muted-foreground">周期:</span> {statement.period_start} ~ {statement.period_end}</div>
                                <div><span className="text-muted-foreground">总电量:</span> <span className="font-mono">{statement.total_volume.toFixed(2)} MWh</span></div>
                                <div><span className="text-muted-foreground">总金额:</span> <span className="font-mono text-[#00B04D] font-semibold">{statement.total_amount.toFixed(2)} 元</span></div>
                                <div><span className="text-muted-foreground">生成时间:</span> <span className="font-mono text-xs">{statement.generated_at}</span></div>
                                <div><span className="text-muted-foreground">状态:</span> {getStatusBadge(statement.status)}</div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => toast.success("开始下载...")}>
                                  <Download className="mr-1 h-4 w-4" />下载
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <button 
                          className="text-green-600 hover:text-green-800"
                          onClick={() => toast.success(`下载 ${statement.statement_no}`)}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B04D]" />
        <span className="ml-2 text-muted-foreground">加载结算单数据...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">交易单元</label>
              <Select value={tradingUnit} onValueChange={setTradingUnit}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部交易单元</SelectItem>
                  {tradingUnits?.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>{unit.unit_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">结算类型</label>
              <Select value={statementType} onValueChange={setStatementType}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="daily_clearing">日清分</SelectItem>
                  <SelectItem value="daily_settlement">日结算单</SelectItem>
                  <SelectItem value="monthly_settlement">月结算单</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-1 h-4 w-4" />刷新
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={handleDownloadSelected} disabled={selectedRows.size === 0}>
                <Download className="mr-1 h-4 w-4" />
                下载选中 {selectedRows.size > 0 && `(${selectedRows.size})`}
              </Button>
              <Button className="bg-[#00B04D] hover:bg-[#009644]" size="sm" onClick={handleBatchExport}>
                <Download className="mr-1 h-4 w-4" />批量导出
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 汇总统计 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg"><BarChart3 className="h-6 w-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">日清分数据</p>
                <p className="text-2xl font-bold font-mono">{groupedData.daily_clearing.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg"><FileText className="h-6 w-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">日结算单</p>
                <p className="text-2xl font-bold font-mono">{groupedData.daily_settlement.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg"><Calendar className="h-6 w-6 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">月结算单</p>
                <p className="text-2xl font-bold font-mono">{groupedData.monthly_settlement.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分组表格 */}
      {renderStatementTable(groupedData.daily_clearing, "日清分数据")}
      {renderStatementTable(groupedData.daily_settlement, "日结算单")}
      {renderStatementTable(groupedData.monthly_settlement, "月结算单")}

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无结算单数据
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettlementStatementTab;

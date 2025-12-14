import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, RefreshCw, Eye, FileText, Calendar, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SettlementStatement {
  id: string;
  statementNo: string;
  type: "daily_clearing" | "daily_statement" | "monthly_statement";
  tradingUnit: string;
  period: string;
  status: "audited" | "pending" | "archived";
  generatedTime: string;
  totalVolume: number;
  totalAmount: number;
  fileSize: string;
}

// 生成模拟数据
const generateMockData = (): SettlementStatement[] => {
  const tradingUnits = ["交易单元001", "交易单元002", "交易单元003"];
  const statements: SettlementStatement[] = [];

  tradingUnits.forEach((unit, unitIndex) => {
    // 日清分数据
    for (let day = 1; day <= 15; day++) {
      statements.push({
        id: `daily-clearing-${unitIndex}-${day}`,
        statementNo: `QF202411${String(day).padStart(2, '0')}${String(unitIndex + 1).padStart(3, '0')}`,
        type: "daily_clearing",
        tradingUnit: unit,
        period: `2024-11-${String(day).padStart(2, '0')}`,
        status: day < 10 ? "audited" : day < 14 ? "pending" : "archived",
        generatedTime: `2024-11-${String(day + 1).padStart(2, '0')} 08:30`,
        totalVolume: 500 + Math.random() * 1000,
        totalAmount: 150000 + Math.random() * 300000,
        fileSize: `${(50 + Math.random() * 100).toFixed(0)}KB`,
      });
    }

    // 日结算单
    for (let day = 1; day <= 10; day++) {
      statements.push({
        id: `daily-statement-${unitIndex}-${day}`,
        statementNo: `RJ202411${String(day).padStart(2, '0')}${String(unitIndex + 1).padStart(3, '0')}`,
        type: "daily_statement",
        tradingUnit: unit,
        period: `2024-11-${String(day).padStart(2, '0')}`,
        status: day < 8 ? "audited" : "pending",
        generatedTime: `2024-11-${String(day + 1).padStart(2, '0')} 10:00`,
        totalVolume: 800 + Math.random() * 1500,
        totalAmount: 250000 + Math.random() * 500000,
        fileSize: `${(100 + Math.random() * 200).toFixed(0)}KB`,
      });
    }

    // 月结算单
    for (let month = 9; month <= 11; month++) {
      statements.push({
        id: `monthly-statement-${unitIndex}-${month}`,
        statementNo: `YJ2024${String(month).padStart(2, '0')}${String(unitIndex + 1).padStart(3, '0')}`,
        type: "monthly_statement",
        tradingUnit: unit,
        period: `2024年${month}月`,
        status: month < 11 ? "audited" : "pending",
        generatedTime: `2024-${String(month + 1).padStart(2, '0')}-05 14:00`,
        totalVolume: 15000 + Math.random() * 30000,
        totalAmount: 5000000 + Math.random() * 10000000,
        fileSize: `${(500 + Math.random() * 500).toFixed(0)}KB`,
      });
    }
  });

  return statements;
};

const SettlementStatementTab = () => {
  const [data] = useState<SettlementStatement[]>(generateMockData());
  const [tradingUnit, setTradingUnit] = useState<string>("all");
  const [statementType, setStatementType] = useState<string>("all");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [previewStatement, setPreviewStatement] = useState<SettlementStatement | null>(null);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (tradingUnit !== "all" && item.tradingUnit !== tradingUnit) return false;
      if (statementType !== "all" && item.type !== statementType) return false;
      return true;
    });
  }, [data, tradingUnit, statementType]);

  const groupedData = useMemo(() => {
    const groups: Record<string, SettlementStatement[]> = {
      daily_clearing: [],
      daily_statement: [],
      monthly_statement: [],
    };
    filteredData.forEach(item => groups[item.type].push(item));
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

  const toggleAllSelection = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map(item => item.id)));
    }
  };

  const getTypeBadge = (type: SettlementStatement["type"]) => {
    const config = {
      daily_clearing: { icon: BarChart3, text: "日清分", color: "bg-blue-100 text-blue-700" },
      daily_statement: { icon: FileText, text: "日结算单", color: "bg-green-100 text-green-700" },
      monthly_statement: { icon: Calendar, text: "月结算单", color: "bg-purple-100 text-purple-700" },
    };
    const { icon: Icon, text, color } = config[type];
    return (
      <span className={cn("px-2 py-1 rounded text-xs flex items-center gap-1 w-fit", color)}>
        <Icon className="h-3 w-3" />
        {text}
      </span>
    );
  };

  const getStatusBadge = (status: SettlementStatement["status"]) => {
    const config = {
      audited: { text: "已审核", color: "bg-green-100 text-green-700" },
      pending: { text: "待审核", color: "bg-yellow-100 text-yellow-700" },
      archived: { text: "已归档", color: "bg-gray-100 text-gray-600" },
    };
    const { text, color } = config[status];
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

  const renderStatementTable = (statements: SettlementStatement[], title: string) => {
    if (statements.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {title === "日清分数据" && <BarChart3 className="h-5 w-5 text-blue-600" />}
            {title === "日结算单" && <FileText className="h-5 w-5 text-green-600" />}
            {title === "月结算单" && <Calendar className="h-5 w-5 text-purple-600" />}
            {title}
            <span className="text-sm font-normal text-muted-foreground">({statements.length}条)</span>
          </h3>
          <div className="rounded-md border max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                <tr className="border-b border-[#00B04D]/30">
                  <th className="h-10 px-3 text-center w-12 bg-[#F1F8F4]">
                    <Checkbox 
                      checked={statements.every(s => selectedRows.has(s.id))}
                      onCheckedChange={() => {
                        const allSelected = statements.every(s => selectedRows.has(s.id));
                        setSelectedRows(prev => {
                          const newSet = new Set(prev);
                          statements.forEach(s => allSelected ? newSet.delete(s.id) : newSet.add(s.id));
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
                {statements.map(statement => (
                  <tr key={statement.id} className="border-b transition-colors hover:bg-[#F8FBFA]">
                    <td className="p-3 text-center">
                      <Checkbox 
                        checked={selectedRows.has(statement.id)} 
                        onCheckedChange={() => toggleRowSelection(statement.id)} 
                      />
                    </td>
                    <td className="p-3 font-mono text-xs">{statement.statementNo}</td>
                    <td className="p-3 text-center">{getTypeBadge(statement.type)}</td>
                    <td className="p-3">{statement.tradingUnit}</td>
                    <td className="p-3 text-center">{statement.period}</td>
                    <td className="p-3 text-right font-mono text-xs">{statement.totalVolume.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-xs">{statement.totalAmount.toFixed(2)}</td>
                    <td className="p-3 text-center">{getStatusBadge(statement.status)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => setPreviewStatement(statement)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader><DialogTitle>结算单预览 - {statement.statementNo}</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 p-4 bg-[#F1F8F4] rounded-lg">
                                <div><span className="text-muted-foreground">结算单号:</span> <span className="font-mono">{statement.statementNo}</span></div>
                                <div><span className="text-muted-foreground">类型:</span> {getTypeBadge(statement.type)}</div>
                                <div><span className="text-muted-foreground">交易单元:</span> {statement.tradingUnit}</div>
                                <div><span className="text-muted-foreground">周期:</span> {statement.period}</div>
                                <div><span className="text-muted-foreground">总电量:</span> <span className="font-mono">{statement.totalVolume.toFixed(2)} MWh</span></div>
                                <div><span className="text-muted-foreground">总金额:</span> <span className="font-mono text-[#00B04D] font-semibold">{statement.totalAmount.toFixed(2)} 元</span></div>
                                <div><span className="text-muted-foreground">生成时间:</span> <span className="font-mono text-xs">{statement.generatedTime}</span></div>
                                <div><span className="text-muted-foreground">文件大小:</span> {statement.fileSize}</div>
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
                          onClick={() => toast.success(`下载 ${statement.statementNo}`)}
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
                  <SelectItem value="交易单元001">交易单元001</SelectItem>
                  <SelectItem value="交易单元002">交易单元002</SelectItem>
                  <SelectItem value="交易单元003">交易单元003</SelectItem>
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
                  <SelectItem value="daily_statement">日结算单</SelectItem>
                  <SelectItem value="monthly_statement">月结算单</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={() => toast.success("刷新数据...")}>
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
                <p className="text-2xl font-bold font-mono">{groupedData.daily_statement.length}</p>
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
                <p className="text-2xl font-bold font-mono">{groupedData.monthly_statement.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分组表格 */}
      {renderStatementTable(groupedData.daily_clearing, "日清分数据")}
      {renderStatementTable(groupedData.daily_statement, "日结算单")}
      {renderStatementTable(groupedData.monthly_statement, "月结算单")}
    </div>
  );
};

export default SettlementStatementTab;

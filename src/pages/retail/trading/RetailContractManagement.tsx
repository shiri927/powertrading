import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Search, RotateCcw, CalendarIcon, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useFilteredRetailContracts, useRetailContractStats, RetailContract } from "@/hooks/useRetailContracts";

const CONTRACT_TYPES = [
  { value: "all", label: "全部类型" },
  { value: "yearly", label: "年度合同" },
  { value: "quarterly", label: "季度合同" },
  { value: "monthly", label: "月度合同" },
];

const CONTRACT_STATUS = [
  { value: "all", label: "全部状态" },
  { value: "pending", label: "待执行" },
  { value: "active", label: "执行中" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "待执行", variant: "outline" },
    active: { label: "执行中", variant: "default" },
    completed: { label: "已完成", variant: "secondary" },
    cancelled: { label: "已取消", variant: "destructive" },
  };
  const { label, variant } = config[status] || { label: status, variant: "outline" };
  return <Badge variant={variant}>{label}</Badge>;
};

const getContractTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    yearly: "年度合同",
    quarterly: "季度合同",
    monthly: "月度合同",
  };
  return labels[type] || type;
};

export default function RetailContractManagement() {
  const [filters, setFilters] = useState({
    customerName: "",
    executionMonth: "",
    contractType: "all",
    status: "all",
  });
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>();
  const [selectedContract, setSelectedContract] = useState<RetailContract | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useRetailContractStats();
  const { data: contracts, isLoading: contractsLoading } = useFilteredRetailContracts(filters);

  const handleQuery = () => {
    // Filters are already applied reactively
  };

  const handleReset = () => {
    setFilters({
      customerName: "",
      executionMonth: "",
      contractType: "all",
      status: "all",
    });
    setSelectedMonth(undefined);
  };

  const handleMonthSelect = (date: Date | undefined) => {
    setSelectedMonth(date);
    if (date) {
      const monthStr = format(date, "yyyy-MM");
      setFilters((prev) => ({ ...prev, executionMonth: monthStr }));
    } else {
      setFilters((prev) => ({ ...prev, executionMonth: "" }));
    }
  };

  const handleViewDetail = (contract: RetailContract) => {
    setSelectedContract(contract);
    setDetailOpen(true);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num == null) return "-";
    return num.toLocaleString("zh-CN");
  };

  const formatCurrency = (num: number | null | undefined) => {
    if (num == null) return "-";
    return `¥${num.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          零售合同管理
        </h1>
        <p className="text-muted-foreground mt-1">
          查看和管理售电公司与代理零售用户签订的购售电合同
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">合同总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {statsLoading ? "-" : stats?.totalContracts || 0}
            </div>
            <p className="text-xs text-muted-foreground">份</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">执行中合同</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {statsLoading ? "-" : stats?.activeContracts || 0}
            </div>
            <p className="text-xs text-muted-foreground">份</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月新签</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600">
              {statsLoading ? "-" : stats?.newThisMonth || 0}
            </div>
            <p className="text-xs text-muted-foreground">份</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">结算金额合计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {statsLoading ? "-" : formatNumber(Math.round((stats?.totalSettlementAmount || 0) / 10000))}
            </div>
            <p className="text-xs text-muted-foreground">万元</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                用户名称/合同编号
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="输入用户名称或合同编号搜索"
                  value={filters.customerName}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, customerName: e.target.value }))
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-[180px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                执行月份
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedMonth ? format(selectedMonth, "yyyy-MM") : "选择月份"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedMonth}
                    onSelect={handleMonthSelect}
                    locale={zhCN}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-[150px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                合同类型
              </label>
              <Select
                value={filters.contractType}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, contractType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[150px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                合同状态
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleQuery} className="bg-primary hover:bg-primary/90">
                <Search className="h-4 w-4 mr-1" />
                查询
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              合同列表 ({contracts?.length || 0})
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              导出
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F1F8F4]">
                <TableRow>
                  <TableHead className="font-semibold border-b-2 border-primary">合同编号</TableHead>
                  <TableHead className="font-semibold border-b-2 border-primary">用户名称</TableHead>
                  <TableHead className="font-semibold border-b-2 border-primary">执行月份</TableHead>
                  <TableHead className="font-semibold border-b-2 border-primary">合同类型</TableHead>
                  <TableHead className="font-semibold border-b-2 border-primary text-right">合同电量</TableHead>
                  <TableHead className="font-semibold border-b-2 border-primary text-right">合同价格</TableHead>
                  <TableHead className="font-semibold border-b-2 border-primary text-right">结算电量</TableHead>
                  <TableHead className="font-semibold border-b-2 border-primary text-right">结算金额</TableHead>
                  <TableHead className="font-semibold border-b-2 border-primary text-center">状态</TableHead>
                  <TableHead className="font-semibold border-b-2 border-primary text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractsLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : contracts && contracts.length > 0 ? (
                  contracts.map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-[#F8FBFA]">
                      <TableCell className="font-mono text-sm">{contract.contract_no}</TableCell>
                      <TableCell className="font-medium">{contract.customer?.name || "-"}</TableCell>
                      <TableCell className="font-mono">{contract.execution_month}</TableCell>
                      <TableCell>{getContractTypeLabel(contract.contract_type)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(contract.contract_volume)} MWh
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(contract.contract_price)} ¥/MWh
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(contract.settlement_volume)} MWh
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(contract.settlement_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(contract.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(contract)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Contract Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              合同详情
            </DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">基本信息</h4>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <span className="text-sm text-muted-foreground">合同编号</span>
                    <p className="font-mono font-medium">{selectedContract.contract_no}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">合同名称</span>
                    <p className="font-medium">{selectedContract.contract_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">合同类型</span>
                    <p className="font-medium">{getContractTypeLabel(selectedContract.contract_type)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">合同状态</span>
                    <p>{getStatusBadge(selectedContract.status)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">用户信息</h4>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <span className="text-sm text-muted-foreground">用户名称</span>
                    <p className="font-medium">{selectedContract.customer?.name || "-"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">用户编码</span>
                    <p className="font-mono">{selectedContract.customer?.customer_code || "-"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">代理商</span>
                    <p className="font-medium">{selectedContract.customer?.agent_name || "-"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">联系人</span>
                    <p className="font-medium">
                      {selectedContract.customer?.contact_person || "-"}
                      {selectedContract.customer?.contact_phone && (
                        <span className="text-muted-foreground ml-2">
                          ({selectedContract.customer.contact_phone})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contract Terms */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">合同条款</h4>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <span className="text-sm text-muted-foreground">签订日期</span>
                    <p className="font-mono">{selectedContract.signing_date}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">执行月份</span>
                    <p className="font-mono">{selectedContract.execution_month}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">执行期间</span>
                    <p className="font-mono">
                      {selectedContract.start_date} ~ {selectedContract.end_date}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">合同电量</span>
                    <p className="font-mono font-medium">
                      {formatNumber(selectedContract.contract_volume)} MWh
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">合同价格</span>
                    <p className="font-mono font-medium">
                      {formatNumber(selectedContract.contract_price)} ¥/MWh
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">合同金额</span>
                    <p className="font-mono font-medium">
                      {formatCurrency(
                        selectedContract.contract_volume * selectedContract.contract_price
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Settlement Info */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">结算信息</h4>
                <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <span className="text-sm text-muted-foreground">结算电量</span>
                    <p className="font-mono font-medium text-lg">
                      {formatNumber(selectedContract.settlement_volume)} MWh
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">结算金额</span>
                    <p className="font-mono font-medium text-lg text-primary">
                      {formatCurrency(selectedContract.settlement_amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">执行进度</span>
                    <p className="font-mono font-medium text-lg">
                      {selectedContract.contract_volume
                        ? `${(
                            ((selectedContract.settlement_volume || 0) /
                              selectedContract.contract_volume) *
                            100
                          ).toFixed(1)}%`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {selectedContract.remarks && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3">备注</h4>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm">{selectedContract.remarks}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Plus, Search, Eye, RefreshCw, Calendar, List, Loader2 } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";

const ContractManagementTab = () => {
  const [contractFilter, setContractFilter] = useState({ tradingCenter: "all", tradingUnit: "all", keyword: "" });
  const [contractTypeTab, setContractTypeTab] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // 使用数据库hook获取合同数据
  const { data: contractData, isLoading, refetch } = useContracts({
    searchTerm: contractFilter.keyword
  });

  // 将数据库合同数据转换为显示格式
  const transformedContracts = useMemo(() => {
    return (contractData || []).map(c => ({
      id: c.contract_no,
      name: c.contract_name,
      tradingCenter: c.trading_center || "-",
      tradingUnit: c.unit_name || "-",
      type: c.contract_type === "annual_bilateral" ? "年度合同" : 
            c.contract_type === "monthly_bilateral" ? "月度合同" : 
            c.contract_type === "daily_rolling" ? "日滚动" : c.contract_type,
      startDate: c.start_date,
      endDate: c.end_date,
      volume: c.total_volume || 0,
      avgPrice: c.unit_price || 0,
      status: c.status === "active" ? "执行中" : c.status === "completed" ? "已完成" : "待执行",
      syncStatus: "synced" as const,
      direction: c.direction,
      counterparty: c.counterparty,
      totalAmount: c.total_amount
    }));
  }, [contractData]);

  // 筛选合同数据
  const filteredContracts = useMemo(() => {
    return transformedContracts.filter(contract => {
      const matchCenter = contractFilter.tradingCenter === "all" || contract.tradingCenter === contractFilter.tradingCenter;
      const matchUnit = contractFilter.tradingUnit === "all" || contract.tradingUnit === contractFilter.tradingUnit;
      
      // 按合同类型筛选
      let matchType = true;
      if (contractTypeTab === "annual") matchType = contract.type === "年度合同" || contract.type === "季度合同";
      else if (contractTypeTab === "monthly") matchType = contract.type === "月度合同";
      else if (contractTypeTab === "daily") matchType = contract.type === "日滚动";
      else if (contractTypeTab === "expiring") {
        const endDate = new Date(contract.endDate);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        matchType = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }
      
      return matchCenter && matchUnit && matchType;
    });
  }, [transformedContracts, contractFilter, contractTypeTab]);

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case "synced": return <Badge className="bg-[#00B04D] text-xs">已同步</Badge>;
      case "pending": return <Badge variant="secondary" className="text-xs">待同步</Badge>;
      case "failed": return <Badge variant="destructive" className="text-xs">同步失败</Badge>;
      default: return null;
    }
  };

  const handleSyncContracts = () => {
    setLastSyncTime(new Date());
    refetch();
  };

  // 计算即将到期合同数量
  const expiringCount = transformedContracts.filter(c => {
    const endDate = new Date(c.endDate);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  return (
    <div className="space-y-4">
      {/* 合同类型快捷筛选 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Tabs value={contractTypeTab} onValueChange={setContractTypeTab}>
              <TabsList>
                <TabsTrigger value="all">全部合同 ({transformedContracts.length})</TabsTrigger>
                <TabsTrigger value="annual">年度/季度 ({transformedContracts.filter(c => c.type === "年度合同" || c.type === "季度合同").length})</TabsTrigger>
                <TabsTrigger value="monthly">月度合同 ({transformedContracts.filter(c => c.type === "月度合同").length})</TabsTrigger>
                <TabsTrigger value="daily">日滚合同 ({transformedContracts.filter(c => c.type === "日滚动").length})</TabsTrigger>
                <TabsTrigger value="expiring" className="text-amber-600">即将到期 ({expiringCount})</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === "list" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "timeline" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setViewMode("timeline")}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 筛选条件 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">合同检索</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">最后同步: {format(lastSyncTime, "yyyy-MM-dd HH:mm")}</span>
              <Button variant="outline" size="sm" onClick={handleSyncContracts}>
                <RefreshCw className="h-4 w-4 mr-1" />
                同步合同
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>交易中心</Label>
              <Select value={contractFilter.tradingCenter} onValueChange={(value) => setContractFilter({ ...contractFilter, tradingCenter: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="山西交易中心">山西交易中心</SelectItem>
                  <SelectItem value="山东交易中心">山东交易中心</SelectItem>
                  <SelectItem value="国家交易中心">国家交易中心</SelectItem>
                  <SelectItem value="浙江交易中心">浙江交易中心</SelectItem>
                  <SelectItem value="绿证交易平台">绿证交易平台</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>交易单元</Label>
              <Select value={contractFilter.tradingUnit} onValueChange={(value) => setContractFilter({ ...contractFilter, tradingUnit: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="山东省场站A">山东省场站A</SelectItem>
                  <SelectItem value="山东省场站B">山东省场站B</SelectItem>
                  <SelectItem value="山西省场站A">山西省场站A</SelectItem>
                  <SelectItem value="山西省场站B">山西省场站B</SelectItem>
                  <SelectItem value="浙江省场站A">浙江省场站A</SelectItem>
                  <SelectItem value="浙江省场站B">浙江省场站B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>关键字</Label>
              <Input 
                placeholder="合同名称或编号" 
                value={contractFilter.keyword}
                onChange={(e) => setContractFilter({ ...contractFilter, keyword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button className="w-full"><Search className="h-4 w-4 mr-2" />查询</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 合同列表/时间线视图 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>合同列表</span>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />导入合同</Button>
          </CardTitle>
          <CardDescription>共 {filteredContracts.length} 条合同</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-md border max-h-[500px] overflow-y-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                  <tr className="border-b">
                    <th className="h-10 px-4 text-left align-middle font-semibold text-xs">合同编号</th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-xs">合同名称</th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-xs">交易中心</th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-xs">交易单元</th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-xs">合同类型</th>
                    <th className="h-10 px-4 text-left align-middle font-semibold text-xs">执行期间</th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-xs">合同电量</th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-xs">平均电价</th>
                    <th className="h-10 px-4 text-center align-middle font-semibold text-xs">状态</th>
                    <th className="h-10 px-4 text-center align-middle font-semibold text-xs">入库状态</th>
                    <th className="h-10 px-4 text-center align-middle font-semibold text-xs">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="border-b transition-colors hover:bg-[#F8FBFA]">
                      <td className="p-4 align-middle font-mono text-xs">{contract.id}</td>
                      <td className="p-4 align-middle text-xs">{contract.name}</td>
                      <td className="p-4 align-middle text-xs">{contract.tradingCenter}</td>
                      <td className="p-4 align-middle text-xs">{contract.tradingUnit}</td>
                      <td className="p-4 align-middle text-xs">{contract.type}</td>
                      <td className="p-4 align-middle text-xs font-mono">{contract.startDate} ~ {contract.endDate}</td>
                      <td className="p-4 align-middle text-right font-mono text-xs">{contract.volume.toLocaleString()}</td>
                      <td className="p-4 align-middle text-right font-mono text-xs">{contract.avgPrice.toFixed(2)}</td>
                      <td className="p-4 align-middle text-center">
                        <Badge variant={contract.status === "执行中" ? "default" : contract.status === "待执行" ? "secondary" : "outline"} className="text-xs">
                          {contract.status}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-center">{getSyncStatusBadge(contract.syncStatus)}</td>
                      <td className="p-4 align-middle text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>合同详情</DialogTitle>
                              <DialogDescription>{contract.name}</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-6 py-4">
                              <div className="space-y-4">
                                <h4 className="font-semibold text-sm border-b pb-2">基础信息</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div><span className="text-muted-foreground">合同编号：</span><span className="font-mono">{contract.id}</span></div>
                                  <div><span className="text-muted-foreground">交易中心：</span><span>{contract.tradingCenter}</span></div>
                                  <div><span className="text-muted-foreground">交易单元：</span><span>{contract.tradingUnit}</span></div>
                                  <div><span className="text-muted-foreground">合同类型：</span><span>{contract.type}</span></div>
                                  <div className="col-span-2"><span className="text-muted-foreground">执行期间：</span><span className="font-mono">{contract.startDate} 至 {contract.endDate}</span></div>
                                  <div><span className="text-muted-foreground">合同电量：</span><span className="font-mono">{contract.volume.toLocaleString()} MWh</span></div>
                                  <div><span className="text-muted-foreground">平均电价：</span><span className="font-mono">{contract.avgPrice.toFixed(2)} 元/MWh</span></div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="font-semibold text-sm border-b pb-2">分时量价数据</h4>
                                <ScrollArea className="h-[250px]">
                                  <table className="w-full text-xs">
                                    <thead className="bg-[#F1F8F4]">
                                      <tr>
                                        <th className="p-2 text-left">时段</th>
                                        <th className="p-2 text-right">电量(MWh)</th>
                                        <th className="p-2 text-right">电价(元/MWh)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Array.from({ length: 24 }, (_, i) => (
                                        <tr key={i} className="border-b hover:bg-[#F8FBFA]">
                                          <td className="p-2 font-mono">{i.toString().padStart(2, '0')}:00</td>
                                          <td className="p-2 text-right font-mono">{(contract.volume / 24).toFixed(0)}</td>
                                          <td className="p-2 text-right font-mono">{(contract.avgPrice + (Math.random() - 0.5) * 50).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </ScrollArea>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // 时间线视图
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-4">合同执行期间甘特图</div>
              <div className="relative">
                {/* 时间轴头部 */}
                <div className="flex items-center border-b pb-2 mb-2">
                  <div className="w-48 text-xs font-medium text-muted-foreground">合同名称</div>
                  <div className="flex-1 flex">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="flex-1 text-center text-xs text-muted-foreground">{i + 1}月</div>
                    ))}
                  </div>
                </div>
                {/* 合同条目 */}
                {filteredContracts.map((contract) => {
                  const startMonth = new Date(contract.startDate).getMonth();
                  const endMonth = new Date(contract.endDate).getMonth();
                  const startPercent = (startMonth / 12) * 100;
                  const widthPercent = ((endMonth - startMonth + 1) / 12) * 100;
                  
                  return (
                    <div key={contract.id} className="flex items-center py-2 border-b hover:bg-[#F8FBFA]">
                      <div className="w-48 text-xs truncate pr-2" title={contract.name}>{contract.name}</div>
                      <div className="flex-1 relative h-6">
                        <div 
                          className="absolute h-5 rounded bg-[#00B04D]/80 flex items-center justify-center text-xs text-white"
                          style={{ left: `${startPercent}%`, width: `${widthPercent}%`, minWidth: '40px' }}
                        >
                          {contract.volume.toLocaleString()} MWh
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractManagementTab;

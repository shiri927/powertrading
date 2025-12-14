import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, Plus, Download, Upload, Search, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { Customer, generateCustomers } from "@/lib/retail-data";
import { useToast } from "@/hooks/use-toast";

const CustomerManagement = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(() => generateCustomers(50));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  const [voltageFilter, setVoltageFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 筛选和搜索
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.agentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || customer.contractStatus === statusFilter;
      const matchesPackage = packageFilter === "all" || customer.packageType === packageFilter;
      const matchesVoltage = voltageFilter === "all" || customer.voltageLevel === voltageFilter;
      
      return matchesSearch && matchesStatus && matchesPackage && matchesVoltage;
    });
  }, [customers, searchTerm, statusFilter, packageFilter, voltageFilter]);

  // 分页
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  // 统计数据
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.contractStatus === 'active').length;
    const thisMonth = customers.filter(c => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    const expiringSoon = customers.filter(c => {
      const endDate = new Date(c.contractEndDate);
      const now = new Date();
      const daysUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length;

    return { total, active, thisMonth, expiringSoon };
  }, [customers]);

  const handleAddCustomer = () => {
    setEditingCustomer({
      name: '',
      packageType: '固定价格',
      agentName: '',
      contractStartDate: new Date().toISOString().split('T')[0],
      contractEndDate: '',
      priceMode: '月度结算',
      intermediaryCost: 0,
      contractStatus: 'pending',
      voltageLevel: '10kV',
      totalCapacity: 0,
      contactPerson: '',
      contactPhone: '',
      industryType: '制造业'
    });
    setIsEditOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditOpen(true);
  };

  const handleSaveCustomer = () => {
    if (!editingCustomer.name || !editingCustomer.agentName) {
      toast({
        title: "错误",
        description: "请填写必填项",
        variant: "destructive"
      });
      return;
    }

    if (editingCustomer.id) {
      // 编辑
      setCustomers(prev => prev.map(c => 
        c.id === editingCustomer.id ? { ...c, ...editingCustomer, updatedAt: new Date().toISOString() } as Customer : c
      ));
      toast({
        title: "成功",
        description: "客户信息已更新"
      });
    } else {
      // 新增
      const newCustomer: Customer = {
        ...editingCustomer,
        id: `CUST-${String(customers.length + 1).padStart(4, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Customer;
      setCustomers(prev => [newCustomer, ...prev]);
      toast({
        title: "成功",
        description: "客户已添加"
      });
    }
    setIsEditOpen(false);
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
      toast({
        title: "成功",
        description: "客户已删除"
      });
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
    }
  };

  const getStatusBadge = (status: Customer['contractStatus']) => {
    const variants = {
      active: { variant: "default" as const, label: "已签约", className: "bg-[#00B04D] hover:bg-[#009644]" },
      expired: { variant: "secondary" as const, label: "已到期", className: "" },
      pending: { variant: "outline" as const, label: "待签约", className: "border-orange-500 text-orange-500" }
    };
    const config = variants[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">客户管理</h1>
        <p className="text-muted-foreground mt-2">
          零售客户信息管理与分析
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总客户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              客户总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已签约客户</CardTitle>
            <CheckCircle className="h-4 w-4 text-[#00B04D]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              占比 {((stats.active / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月新增</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#00B04D]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              本月新签客户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-orange-500">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">
              30天内到期
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和操作区 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索客户名称或代理名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="签约状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">已签约</SelectItem>
                  <SelectItem value="expired">已到期</SelectItem>
                  <SelectItem value="pending">待签约</SelectItem>
                </SelectContent>
              </Select>

              <Select value={packageFilter} onValueChange={setPackageFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="套餐类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="固定价格">固定价格</SelectItem>
                  <SelectItem value="浮动价格">浮动价格</SelectItem>
                  <SelectItem value="分时段价格">分时段价格</SelectItem>
                </SelectContent>
              </Select>

              <Select value={voltageFilter} onValueChange={setVoltageFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="电压等级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部等级</SelectItem>
                  <SelectItem value="10kV">10kV</SelectItem>
                  <SelectItem value="35kV">35kV</SelectItem>
                  <SelectItem value="110kV">110kV</SelectItem>
                  <SelectItem value="220kV">220kV</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleAddCustomer} className="bg-[#00B04D] hover:bg-[#009644]">
                <Plus className="h-4 w-4 mr-2" />
                新增客户
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                批量导入
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出数据
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                <tr className="border-b-2 border-[#00B04D]">
                  <th className="text-left p-3 text-sm font-semibold">客户名称</th>
                  <th className="text-left p-3 text-sm font-semibold">套餐类型</th>
                  <th className="text-left p-3 text-sm font-semibold">代理名称</th>
                  <th className="text-left p-3 text-sm font-semibold">签约起止时间</th>
                  <th className="text-left p-3 text-sm font-semibold">价格模式</th>
                  <th className="text-right p-3 text-sm font-semibold">居间成本</th>
                  <th className="text-left p-3 text-sm font-semibold">签约状态</th>
                  <th className="text-left p-3 text-sm font-semibold">电压等级</th>
                  <th className="text-right p-3 text-sm font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-[#F8FBFA] transition-colors">
                    <td className="p-3">
                      <button
                        className="text-[#00B04D] hover:underline font-medium"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsDetailOpen(true);
                        }}
                      >
                        {customer.name}
                      </button>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{customer.packageType}</Badge>
                    </td>
                    <td className="p-3">{customer.agentName}</td>
                    <td className="p-3 text-sm">{customer.contractStartDate} ~ {customer.contractEndDate}</td>
                    <td className="p-3">{customer.priceMode}</td>
                    <td className="p-3 text-right font-mono">{customer.intermediaryCost.toFixed(2)}</td>
                    <td className="p-3">{getStatusBadge(customer.contractStatus)}</td>
                    <td className="p-3">{customer.voltageLevel}</td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsDeleteOpen(true);
                          }}
                        >
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              共 {filteredCustomers.length} 条记录，第 {currentPage} / {totalPages} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 客户详情对话框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>客户详情</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList>
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="contract">合同信息</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">客户名称</Label>
                    <p className="font-medium mt-1">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">客户ID</Label>
                    <p className="font-medium font-mono mt-1">{selectedCustomer.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">联系人</Label>
                    <p className="font-medium mt-1">{selectedCustomer.contactPerson}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">联系电话</Label>
                    <p className="font-medium font-mono mt-1">{selectedCustomer.contactPhone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">行业类型</Label>
                    <p className="font-medium mt-1">{selectedCustomer.industryType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">电压等级</Label>
                    <p className="font-medium mt-1">{selectedCustomer.voltageLevel}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">总用电容量</Label>
                    <p className="font-medium font-mono mt-1">{selectedCustomer.totalCapacity.toFixed(2)} MWh</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="contract" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">套餐类型</Label>
                    <p className="font-medium mt-1">{selectedCustomer.packageType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">价格模式</Label>
                    <p className="font-medium mt-1">{selectedCustomer.priceMode}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">居间成本</Label>
                    <p className="font-medium font-mono mt-1">{selectedCustomer.intermediaryCost.toFixed(2)} 元/MWh</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">代理名称</Label>
                    <p className="font-medium mt-1">{selectedCustomer.agentName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">签约起始时间</Label>
                    <p className="font-medium mt-1">{selectedCustomer.contractStartDate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">签约终止时间</Label>
                    <p className="font-medium mt-1">{selectedCustomer.contractEndDate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">合同状态</Label>
                    <div className="mt-1">{getStatusBadge(selectedCustomer.contractStatus)}</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* 新增/编辑客户对话框 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCustomer.id ? '编辑客户' : '新增客户'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>客户名称 *</Label>
                <Input
                  value={editingCustomer.name || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                />
              </div>
              <div>
                <Label>代理名称 *</Label>
                <Input
                  value={editingCustomer.agentName || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, agentName: e.target.value })}
                />
              </div>
              <div>
                <Label>套餐类型</Label>
                <Select
                  value={editingCustomer.packageType}
                  onValueChange={(value) => setEditingCustomer({ ...editingCustomer, packageType: value as Customer['packageType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="固定价格">固定价格</SelectItem>
                    <SelectItem value="浮动价格">浮动价格</SelectItem>
                    <SelectItem value="分时段价格">分时段价格</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>价格模式</Label>
                <Select
                  value={editingCustomer.priceMode}
                  onValueChange={(value) => setEditingCustomer({ ...editingCustomer, priceMode: value as Customer['priceMode'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="月度结算">月度结算</SelectItem>
                    <SelectItem value="年度结算">年度结算</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>签约起始时间</Label>
                <Input
                  type="date"
                  value={editingCustomer.contractStartDate || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, contractStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label>签约终止时间</Label>
                <Input
                  type="date"
                  value={editingCustomer.contractEndDate || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, contractEndDate: e.target.value })}
                />
              </div>
              <div>
                <Label>居间成本 (元/MWh)</Label>
                <Input
                  type="number"
                  value={editingCustomer.intermediaryCost || 0}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, intermediaryCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>电压等级</Label>
                <Select
                  value={editingCustomer.voltageLevel}
                  onValueChange={(value) => setEditingCustomer({ ...editingCustomer, voltageLevel: value as Customer['voltageLevel'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10kV">10kV</SelectItem>
                    <SelectItem value="35kV">35kV</SelectItem>
                    <SelectItem value="110kV">110kV</SelectItem>
                    <SelectItem value="220kV">220kV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>总用电容量 (MWh)</Label>
                <Input
                  type="number"
                  value={editingCustomer.totalCapacity || 0}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, totalCapacity: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>行业类型</Label>
                <Input
                  value={editingCustomer.industryType || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, industryType: e.target.value })}
                />
              </div>
              <div>
                <Label>联系人</Label>
                <Input
                  value={editingCustomer.contactPerson || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, contactPerson: e.target.value })}
                />
              </div>
              <div>
                <Label>联系电话</Label>
                <Input
                  value={editingCustomer.contactPhone || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, contactPhone: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>取消</Button>
            <Button onClick={handleSaveCustomer} className="bg-[#00B04D] hover:bg-[#009644]">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除客户 "{selectedCustomer?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerManagement;

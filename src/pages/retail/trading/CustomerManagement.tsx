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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Users, Plus, Download, Upload, Search, TrendingUp, AlertCircle, CheckCircle, History, Loader2 } from "lucide-react";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, Customer, CustomerInsert, CustomerUpdate } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";

const CustomerManagement = () => {
  const { toast } = useToast();
  const { data: customers = [], isLoading, error } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<string>("all");
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
                          (customer.agent_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || customer.contract_status === statusFilter;
      const matchesPackage = packageFilter === "all" || customer.package_type === packageFilter;
      
      let matchesView = true;
      if (viewMode === "signed") {
        matchesView = customer.contract_status === "active";
      } else if (viewMode === "history") {
        matchesView = customer.contract_status === "expired";
      }
      
      return matchesSearch && matchesStatus && matchesPackage && matchesView;
    });
  }, [customers, searchTerm, statusFilter, packageFilter, viewMode]);

  // 分页
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  // 统计数据
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.contract_status === 'active').length;
    const thisMonth = customers.filter(c => {
      const created = new Date(c.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    const expiringSoon = customers.filter(c => {
      if (!c.contract_end_date) return false;
      const endDate = new Date(c.contract_end_date);
      const now = new Date();
      const daysUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length;

    return { total, active, thisMonth, expiringSoon };
  }, [customers]);

  const handleAddCustomer = () => {
    setEditingCustomer({
      name: '',
      customer_code: `USER-${String(customers.length + 1).padStart(4, '0')}`,
      package_type: '固定价格',
      agent_name: '',
      contract_start_date: new Date().toISOString().split('T')[0],
      contract_end_date: '',
      price_mode: '月度结算',
      intermediary_cost: 0,
      contract_status: 'pending',
      voltage_level: '10kV',
      total_capacity: 0,
      contact_person: '',
      contact_phone: '',
      industry_type: '制造业',
      is_active: true,
    });
    setIsEditOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditOpen(true);
  };

  const handleSaveCustomer = async () => {
    if (!editingCustomer.name || !editingCustomer.agent_name) {
      toast({
        title: "错误",
        description: "请填写必填项",
        variant: "destructive"
      });
      return;
    }

    if (editingCustomer.id) {
      // 编辑
      const updates: CustomerUpdate = {
        name: editingCustomer.name,
        package_type: editingCustomer.package_type,
        agent_name: editingCustomer.agent_name,
        contract_start_date: editingCustomer.contract_start_date,
        contract_end_date: editingCustomer.contract_end_date,
        price_mode: editingCustomer.price_mode,
        intermediary_cost: editingCustomer.intermediary_cost,
        contract_status: editingCustomer.contract_status,
        voltage_level: editingCustomer.voltage_level,
        total_capacity: editingCustomer.total_capacity,
        contact_person: editingCustomer.contact_person,
        contact_phone: editingCustomer.contact_phone,
        industry_type: editingCustomer.industry_type,
      };
      updateCustomer.mutate({ id: editingCustomer.id, updates });
    } else {
      // 新增
      const newCustomer: CustomerInsert = {
        name: editingCustomer.name!,
        customer_code: editingCustomer.customer_code!,
        package_type: editingCustomer.package_type || '固定价格',
        voltage_level: editingCustomer.voltage_level || '10kV',
        agent_name: editingCustomer.agent_name,
        contract_start_date: editingCustomer.contract_start_date,
        contract_end_date: editingCustomer.contract_end_date,
        price_mode: editingCustomer.price_mode,
        intermediary_cost: editingCustomer.intermediary_cost,
        contract_status: editingCustomer.contract_status || 'pending',
        total_capacity: editingCustomer.total_capacity,
        contact_person: editingCustomer.contact_person,
        contact_phone: editingCustomer.contact_phone,
        industry_type: editingCustomer.industry_type,
        is_active: true,
        contact_email: null,
        address: null,
      };
      createCustomer.mutate(newCustomer);
    }
    setIsEditOpen(false);
  };

  const handleDeleteCustomer = async () => {
    if (selectedCustomer) {
      deleteCustomer.mutate(selectedCustomer.id);
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string; className: string }> = {
      active: { variant: "default", label: "已签约", className: "bg-[#00B04D] hover:bg-[#009644]" },
      expired: { variant: "secondary", label: "已到期", className: "" },
      pending: { variant: "outline", label: "待签约", className: "border-orange-500 text-orange-500" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">加载数据失败: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">用户管理</h1>
        <p className="text-muted-foreground mt-2">
          集中存储与更新零售用户信息，支持已签约及历史签约用户信息的查看、维护与检索
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">用户总数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已签约用户</CardTitle>
            <CheckCircle className="h-4 w-4 text-[#00B04D]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              占比 {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}%
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
            <p className="text-xs text-muted-foreground mt-1">本月新签用户</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-orange-500">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">30天内到期</p>
          </CardContent>
        </Card>
      </div>

      {/* 视图切换 */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">视图模式：</span>
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v)}>
          <ToggleGroupItem value="all" className="px-4">
            <Users className="h-4 w-4 mr-2" />
            全部用户
          </ToggleGroupItem>
          <ToggleGroupItem value="signed" className="px-4">
            <CheckCircle className="h-4 w-4 mr-2" />
            已签约用户
          </ToggleGroupItem>
          <ToggleGroupItem value="history" className="px-4">
            <History className="h-4 w-4 mr-2" />
            历史用户
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* 筛选和操作区 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名称或代理名称..."
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

              <Button onClick={handleAddCustomer} className="bg-[#00B04D] hover:bg-[#009644]">
                <Plus className="h-4 w-4 mr-2" />
                新增用户
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#00B04D]" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#F1F8F4]">
                    <tr className="border-b-2 border-[#00B04D]">
                      <th className="text-left p-3 text-sm font-semibold">用户名称</th>
                      <th className="text-left p-3 text-sm font-semibold">套餐类型</th>
                      <th className="text-left p-3 text-sm font-semibold">代理名称</th>
                      <th className="text-left p-3 text-sm font-semibold">签订起止时间</th>
                      <th className="text-left p-3 text-sm font-semibold">价格模式</th>
                      <th className="text-left p-3 text-sm font-semibold">签约状态</th>
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
                          <Badge variant="outline">{customer.package_type}</Badge>
                        </td>
                        <td className="p-3">{customer.agent_name || '-'}</td>
                        <td className="p-3 text-sm font-mono">
                          {customer.contract_start_date || '-'} ~ {customer.contract_end_date || '-'}
                        </td>
                        <td className="p-3">{customer.price_mode || '-'}</td>
                        <td className="p-3">{getStatusBadge(customer.contract_status)}</td>
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
                    {paginatedCustomers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          暂无数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  共 {filteredCustomers.length} 条记录，第 {currentPage} / {Math.max(totalPages, 1)} 页
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
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 用户详情对话框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
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
                    <Label className="text-muted-foreground">用户名称</Label>
                    <p className="font-medium mt-1">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">用户编号</Label>
                    <p className="font-medium font-mono mt-1">{selectedCustomer.customer_code}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">联系人</Label>
                    <p className="font-medium mt-1">{selectedCustomer.contact_person || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">联系电话</Label>
                    <p className="font-medium font-mono mt-1">{selectedCustomer.contact_phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">行业类型</Label>
                    <p className="font-medium mt-1">{selectedCustomer.industry_type || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">电压等级</Label>
                    <p className="font-medium mt-1">{selectedCustomer.voltage_level}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">装机容量</Label>
                    <p className="font-medium font-mono mt-1">{selectedCustomer.total_capacity || 0} kW</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">代理商</Label>
                    <p className="font-medium mt-1">{selectedCustomer.agent_name || '-'}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="contract" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">套餐类型</Label>
                    <p className="font-medium mt-1">{selectedCustomer.package_type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">价格模式</Label>
                    <p className="font-medium mt-1">{selectedCustomer.price_mode || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">合同起始日期</Label>
                    <p className="font-medium font-mono mt-1">{selectedCustomer.contract_start_date || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">合同结束日期</Label>
                    <p className="font-medium font-mono mt-1">{selectedCustomer.contract_end_date || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">签约状态</Label>
                    <div className="mt-1">{getStatusBadge(selectedCustomer.contract_status)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">中介费用</Label>
                    <p className="font-medium font-mono mt-1">¥ {selectedCustomer.intermediary_cost?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑/新增对话框 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCustomer.id ? '编辑用户' : '新增用户'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>用户名称 *</Label>
              <Input
                value={editingCustomer.name || ''}
                onChange={(e) => setEditingCustomer(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入用户名称"
              />
            </div>
            <div className="space-y-2">
              <Label>代理名称 *</Label>
              <Input
                value={editingCustomer.agent_name || ''}
                onChange={(e) => setEditingCustomer(prev => ({ ...prev, agent_name: e.target.value }))}
                placeholder="请输入代理名称"
              />
            </div>
            <div className="space-y-2">
              <Label>套餐类型</Label>
              <Select 
                value={editingCustomer.package_type || '固定价格'} 
                onValueChange={(v) => setEditingCustomer(prev => ({ ...prev, package_type: v }))}
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
            <div className="space-y-2">
              <Label>电压等级</Label>
              <Select 
                value={editingCustomer.voltage_level || '10kV'} 
                onValueChange={(v) => setEditingCustomer(prev => ({ ...prev, voltage_level: v }))}
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
            <div className="space-y-2">
              <Label>合同开始日期</Label>
              <Input
                type="date"
                value={editingCustomer.contract_start_date || ''}
                onChange={(e) => setEditingCustomer(prev => ({ ...prev, contract_start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>合同结束日期</Label>
              <Input
                type="date"
                value={editingCustomer.contract_end_date || ''}
                onChange={(e) => setEditingCustomer(prev => ({ ...prev, contract_end_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>价格模式</Label>
              <Select 
                value={editingCustomer.price_mode || '月度结算'} 
                onValueChange={(v) => setEditingCustomer(prev => ({ ...prev, price_mode: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="月度结算">月度结算</SelectItem>
                  <SelectItem value="日结算">日结算</SelectItem>
                  <SelectItem value="年度结算">年度结算</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>签约状态</Label>
              <Select 
                value={editingCustomer.contract_status || 'pending'} 
                onValueChange={(v) => setEditingCustomer(prev => ({ ...prev, contract_status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待签约</SelectItem>
                  <SelectItem value="active">已签约</SelectItem>
                  <SelectItem value="expired">已到期</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>联系人</Label>
              <Input
                value={editingCustomer.contact_person || ''}
                onChange={(e) => setEditingCustomer(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="请输入联系人"
              />
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input
                value={editingCustomer.contact_phone || ''}
                onChange={(e) => setEditingCustomer(prev => ({ ...prev, contact_phone: e.target.value }))}
                placeholder="请输入联系电话"
              />
            </div>
            <div className="space-y-2">
              <Label>行业类型</Label>
              <Select 
                value={editingCustomer.industry_type || '制造业'} 
                onValueChange={(v) => setEditingCustomer(prev => ({ ...prev, industry_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="制造业">制造业</SelectItem>
                  <SelectItem value="服务业">服务业</SelectItem>
                  <SelectItem value="商业">商业</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>装机容量 (kW)</Label>
              <Input
                type="number"
                value={editingCustomer.total_capacity || 0}
                onChange={(e) => setEditingCustomer(prev => ({ ...prev, total_capacity: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>取消</Button>
            <Button 
              onClick={handleSaveCustomer} 
              className="bg-[#00B04D] hover:bg-[#009644]"
              disabled={createCustomer.isPending || updateCustomer.isPending}
            >
              {(createCustomer.isPending || updateCustomer.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户 "{selectedCustomer?.name}" 吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCustomer}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCustomer.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerManagement;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Shield, 
  Building2, 
  Plus,
  Search,
  Settings,
  FileText,
  Edit,
  Trash2,
  Upload,
  Download,
  Eye,
  Lock,
  UserCog,
  BookOpen,
  Zap,
  Sun,
  Wind,
  MapPin,
  Calendar,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ============= 账户数据 =============
const accountsData = [
  { id: "1", name: "张伟", email: "zhang.wei@hengyuan.com", phone: "138****1234", department: "交易部", position: "交易员", role: "admin", status: "active", lastLogin: "2024-11-28 14:32", createdAt: "2023-06-15" },
  { id: "2", name: "李明", email: "li.ming@hengyuan.com", phone: "139****5678", department: "交易部", position: "高级交易员", role: "renewable_generation", status: "active", lastLogin: "2024-11-28 10:15", createdAt: "2023-08-20" },
  { id: "3", name: "王芳", email: "wang.fang@hengyuan.com", phone: "136****9012", department: "分析部", position: "数据分析师", role: "retail_business", status: "active", lastLogin: "2024-11-27 16:45", createdAt: "2023-09-10" },
  { id: "4", name: "陈晓", email: "chen.xiao@hengyuan.com", phone: "137****3456", department: "运营部", position: "运营专员", role: "renewable_generation", status: "inactive", lastLogin: "2024-10-15 09:20", createdAt: "2023-07-05" },
  { id: "5", name: "刘洋", email: "liu.yang@hengyuan.com", phone: "135****7890", department: "交易部", position: "交易主管", role: "admin", status: "active", lastLogin: "2024-11-28 09:00", createdAt: "2022-03-18" },
];

const rolesData = [
  { 
    id: "admin", 
    name: "系统管理员", 
    description: "拥有系统全部管理权限",
    userCount: 2,
    permissions: ["账户管理", "角色管理", "场站管理", "数据查看", "数据编辑", "数据删除", "审批权限"]
  },
  { 
    id: "renewable_generation", 
    name: "新能源发电侧", 
    description: "新能源发电业务相关权限",
    userCount: 5,
    permissions: ["发电侧基础数据", "交易决策", "交易操作台", "出清管理", "结算管理", "复盘分析"]
  },
  { 
    id: "retail_business", 
    name: "售电业务侧", 
    description: "售电业务相关权限",
    userCount: 8,
    permissions: ["售电侧基础数据", "交易决策", "交易操作台", "客户管理", "用能管理", "结算管理", "复盘分析"]
  },
];

const getRoleName = (roleId: string) => {
  const role = rolesData.find(r => r.id === roleId);
  return role ? role.name : roleId;
};

const getRoleBadgeVariant = (roleId: string) => {
  switch (roleId) {
    case 'admin': return 'default';
    case 'renewable_generation': return 'secondary';
    case 'retail_business': return 'outline';
    default: return 'secondary';
  }
};

// ============= 操作手册数据 =============
const modulesData = [
  { id: "1", name: "数据概览", icon: "BarChart" },
  { id: "2", name: "市场与基本面数据", icon: "TrendingUp" },
  { id: "3", name: "新能源发电侧", icon: "Zap" },
  { id: "4", name: "售电业务侧", icon: "Users" },
  { id: "5", name: "收益分析", icon: "DollarSign" },
  { id: "6", name: "报表与报告", icon: "FileText" },
  { id: "7", name: "系统管理", icon: "Settings" },
];

const documentsData = [
  { id: "1", moduleId: "1", name: "数据概览使用指南", version: "2.1", updatedAt: "2024-11-15", fileType: "PDF", fileSize: "2.3MB", downloads: 156 },
  { id: "2", moduleId: "2", name: "市场数据查询手册", version: "1.8", updatedAt: "2024-11-10", fileType: "PDF", fileSize: "1.8MB", downloads: 98 },
  { id: "3", moduleId: "3", name: "新能源交易操作指南", version: "3.0", updatedAt: "2024-11-20", fileType: "PDF", fileSize: "4.5MB", downloads: 234 },
  { id: "4", moduleId: "3", name: "智能决策系统说明", version: "1.2", updatedAt: "2024-11-18", fileType: "PDF", fileSize: "3.1MB", downloads: 87 },
  { id: "5", moduleId: "4", name: "售电业务操作手册", version: "2.5", updatedAt: "2024-11-12", fileType: "PDF", fileSize: "2.9MB", downloads: 145 },
  { id: "6", moduleId: "4", name: "客户管理指南", version: "1.5", updatedAt: "2024-10-28", fileType: "PDF", fileSize: "1.2MB", downloads: 67 },
  { id: "7", moduleId: "5", name: "收益分析报告生成", version: "1.0", updatedAt: "2024-11-05", fileType: "DOCX", fileSize: "890KB", downloads: 45 },
  { id: "8", moduleId: "7", name: "系统管理员手册", version: "1.5", updatedAt: "2024-10-20", fileType: "PDF", fileSize: "2.0MB", downloads: 23 },
];

// ============= 场站数据 =============
const stationsData = [
  { 
    id: "1",
    name: "山东省场站A", 
    type: "风电", 
    capacity: 150,
    province: "山东",
    city: "济南",
    address: "济南市历城区某路123号",
    gridNode: "山东电网-济南节点A",
    commissionDate: "2020-06-15",
    status: "operational",
    tradingUnit: "山东交易单元001",
    contactPerson: "张经理",
    contactPhone: "138****1234"
  },
  { 
    id: "2",
    name: "山东省场站B", 
    type: "光伏", 
    capacity: 100,
    province: "山东",
    city: "青岛",
    address: "青岛市黄岛区某路456号",
    gridNode: "山东电网-青岛节点B",
    commissionDate: "2021-03-20",
    status: "operational",
    tradingUnit: "山东交易单元002",
    contactPerson: "李经理",
    contactPhone: "139****5678"
  },
  { 
    id: "3",
    name: "山西省场站A", 
    type: "风电", 
    capacity: 200,
    province: "山西",
    city: "太原",
    address: "太原市小店区某路789号",
    gridNode: "山西电网-太原节点A",
    commissionDate: "2019-09-10",
    status: "operational",
    tradingUnit: "山西交易单元001",
    contactPerson: "王经理",
    contactPhone: "136****9012"
  },
  { 
    id: "4",
    name: "山西省场站B", 
    type: "光伏", 
    capacity: 80,
    province: "山西",
    city: "大同",
    address: "大同市云冈区某路012号",
    gridNode: "山西电网-大同节点B",
    commissionDate: "2022-01-15",
    status: "maintenance",
    tradingUnit: "山西交易单元002",
    contactPerson: "赵经理",
    contactPhone: "137****3456"
  },
  { 
    id: "5",
    name: "浙江省场站A", 
    type: "光伏", 
    capacity: 120,
    province: "浙江",
    city: "杭州",
    address: "杭州市余杭区某路345号",
    gridNode: "浙江电网-杭州节点A",
    commissionDate: "2021-08-25",
    status: "operational",
    tradingUnit: "浙江交易单元001",
    contactPerson: "钱经理",
    contactPhone: "135****7890"
  },
];

const getStationTypeIcon = (type: string) => {
  switch (type) {
    case '风电': return <Wind className="h-4 w-4" />;
    case '光伏': return <Sun className="h-4 w-4" />;
    default: return <Zap className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational': 
      return <Badge className="bg-[#00B04D]/10 text-[#00B04D] border-[#00B04D]/30"><CheckCircle className="h-3 w-3 mr-1" />运行中</Badge>;
    case 'maintenance':
      return <Badge variant="outline" className="text-orange-500 border-orange-500/30"><AlertTriangle className="h-3 w-3 mr-1" />维护中</Badge>;
    case 'offline':
      return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />离线</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// ============= 账户管理Tab =============
const AccountManagementTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeSubTab, setActiveSubTab] = useState<"accounts" | "roles">("accounts");

  const filteredAccounts = accountsData.filter(account => {
    const matchesSearch = account.name.includes(searchTerm) || account.email.includes(searchTerm);
    const matchesRole = roleFilter === "all" || account.role === roleFilter;
    const matchesStatus = statusFilter === "all" || account.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 管理员提示 */}
      <div className="flex items-center gap-2 p-3 bg-[#00B04D]/10 border border-[#00B04D]/30 rounded-lg">
        <Lock className="h-4 w-4 text-[#00B04D]" />
        <span className="text-sm text-[#00B04D]">该界面仅支持管理员账户访问</span>
      </div>

      {/* 子标签切换 */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveSubTab("accounts")}
          className={cn(
            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeSubTab === "accounts" 
              ? "border-[#00B04D] text-[#00B04D]" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4 inline mr-2" />
          账户信息管理
        </button>
        <button
          onClick={() => setActiveSubTab("roles")}
          className={cn(
            "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
            activeSubTab === "roles" 
              ? "border-[#00B04D] text-[#00B04D]" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Shield className="h-4 w-4 inline mr-2" />
          角色管理
        </button>
      </div>

      {activeSubTab === "accounts" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">账户列表</CardTitle>
                <CardDescription>查看和管理本企业下的所有账户数据</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#00B04D] hover:bg-[#00A86B]">
                    <Plus className="h-4 w-4 mr-2" />新增账户
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>新增账户</DialogTitle>
                    <DialogDescription>填写账户基本信息</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>姓名</Label>
                        <Input placeholder="请输入姓名" />
                      </div>
                      <div className="space-y-2">
                        <Label>邮箱</Label>
                        <Input type="email" placeholder="请输入邮箱" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>手机号</Label>
                        <Input placeholder="请输入手机号" />
                      </div>
                      <div className="space-y-2">
                        <Label>部门</Label>
                        <Input placeholder="请输入部门" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>职位</Label>
                        <Input placeholder="请输入职位" />
                      </div>
                      <div className="space-y-2">
                        <Label>角色</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="选择角色" /></SelectTrigger>
                          <SelectContent>
                            {rolesData.map(role => (
                              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">取消</Button>
                    <Button className="bg-[#00B04D] hover:bg-[#00A86B]" onClick={() => toast.success("账户创建成功")}>创建</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* 筛选栏 */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="搜索账户名称或邮箱..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="角色筛选" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  {rolesData.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="状态筛选" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 账户表格 */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#F1F8F4]">
                  <TableRow>
                    <TableHead>账户信息</TableHead>
                    <TableHead>部门/职位</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后登录</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-[#F8FBFA]">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#00B04D]/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-[#00B04D]">
                              {account.name.slice(0, 1)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{account.name}</div>
                            <div className="text-xs text-muted-foreground">{account.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{account.department}</div>
                        <div className="text-xs text-muted-foreground">{account.position}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(account.role) as any}>
                          {getRoleName(account.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.status === "active" ? "default" : "secondary"} className={account.status === "active" ? "bg-[#00B04D]" : ""}>
                          {account.status === "active" ? "启用" : "停用"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{account.lastLogin}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{account.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><UserCog className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSubTab === "roles" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">角色列表</CardTitle>
                <CardDescription>查看和管理本企业下的所有角色数据</CardDescription>
              </div>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />新建角色
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {rolesData.map((role) => (
                <Card key={role.id} className="border-2 hover:border-[#00B04D]/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="h-4 w-4 text-[#00B04D]" />
                          {role.name}
                        </CardTitle>
                        <CardDescription className="mt-1">{role.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{role.userCount} 用户</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground font-medium">权限范围：</div>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((perm, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{perm}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />编辑
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <UserCog className="h-3 w-3 mr-1" />配置权限
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ============= 操作手册配置Tab =============
const ManualConfigurationTab = () => {
  const [selectedModule, setSelectedModule] = useState("all");

  const filteredDocs = selectedModule === "all" 
    ? documentsData 
    : documentsData.filter(doc => doc.moduleId === selectedModule);

  const getModuleName = (moduleId: string) => {
    const module = modulesData.find(m => m.id === moduleId);
    return module ? module.name : "未知模块";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#00B04D]" />
                操作手册资料配置
              </CardTitle>
              <CardDescription>按功能模块录入对应的操作手册及相关文档</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#00B04D] hover:bg-[#00A86B]">
                  <Upload className="h-4 w-4 mr-2" />上传文档
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>上传操作手册</DialogTitle>
                  <DialogDescription>选择功能模块并上传对应文档</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>所属模块</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="选择功能模块" /></SelectTrigger>
                      <SelectContent>
                        {modulesData.map(module => (
                          <SelectItem key={module.id} value={module.id}>{module.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>文档名称</Label>
                    <Input placeholder="请输入文档名称" />
                  </div>
                  <div className="space-y-2">
                    <Label>版本号</Label>
                    <Input placeholder="例如：1.0" />
                  </div>
                  <div className="space-y-2">
                    <Label>文档简介</Label>
                    <Textarea placeholder="请输入文档简介" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>上传文件</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#00B04D]/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">点击或拖拽文件到此处上传</p>
                      <p className="text-xs text-muted-foreground mt-1">支持 PDF、DOCX、XLSX 格式</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">取消</Button>
                  <Button className="bg-[#00B04D] hover:bg-[#00A86B]" onClick={() => toast.success("文档上传成功")}>上传</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* 模块筛选 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={selectedModule === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedModule("all")}
              className={cn(selectedModule === "all" && "bg-[#00B04D] hover:bg-[#00A86B]")}
            >
              全部模块
            </Button>
            {modulesData.map(module => (
              <Button 
                key={module.id}
                variant={selectedModule === module.id ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedModule(module.id)}
                className={cn(selectedModule === module.id && "bg-[#00B04D] hover:bg-[#00A86B]")}
              >
                {module.name}
              </Button>
            ))}
          </div>

          {/* 文档列表 */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F1F8F4]">
                <TableRow>
                  <TableHead>文档名称</TableHead>
                  <TableHead>所属模块</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>文件类型</TableHead>
                  <TableHead>文件大小</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">下载次数</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-[#F8FBFA]">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#00B04D]" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{getModuleName(doc.moduleId)}</Badge></TableCell>
                    <TableCell className="font-mono">v{doc.version}</TableCell>
                    <TableCell><Badge variant="secondary">{doc.fileType}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{doc.fileSize}</TableCell>
                    <TableCell className="text-muted-foreground font-mono">{doc.updatedAt}</TableCell>
                    <TableCell className="text-right font-mono">{doc.downloads}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============= 场站信息管理Tab =============
const StationManagementTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredStations = stationsData.filter(station => {
    const matchesSearch = station.name.includes(searchTerm) || station.tradingUnit.includes(searchTerm);
    const matchesProvince = provinceFilter === "all" || station.province === provinceFilter;
    const matchesType = typeFilter === "all" || station.type === typeFilter;
    return matchesSearch && matchesProvince && matchesType;
  });

  const provinces = [...new Set(stationsData.map(s => s.province))];
  const types = [...new Set(stationsData.map(s => s.type))];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00B04D]/10">
                <Building2 className="h-5 w-5 text-[#00B04D]" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stationsData.length}</div>
                <div className="text-xs text-muted-foreground">场站总数</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{stationsData.reduce((sum, s) => sum + s.capacity, 0)}</div>
                <div className="text-xs text-muted-foreground">总装机容量(MW)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Wind className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stationsData.filter(s => s.type === '风电').length}</div>
                <div className="text-xs text-muted-foreground">风电场站</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Sun className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stationsData.filter(s => s.type === '光伏').length}</div>
                <div className="text-xs text-muted-foreground">光伏场站</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#00B04D]" />
                场站基础信息管理
              </CardTitle>
              <CardDescription>录入和管理场站基础信息，支撑其他功能模块数据应用</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />导出
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#00B04D] hover:bg-[#00A86B]">
                    <Plus className="h-4 w-4 mr-2" />新增场站
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>新增场站</DialogTitle>
                    <DialogDescription>填写场站基础信息</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh]">
                    <div className="grid gap-4 py-4 pr-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>场站名称 *</Label>
                          <Input placeholder="请输入场站名称" />
                        </div>
                        <div className="space-y-2">
                          <Label>场站类型 *</Label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wind">风电</SelectItem>
                              <SelectItem value="solar">光伏</SelectItem>
                              <SelectItem value="hydro">水电</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>装机容量 (MW) *</Label>
                          <Input type="number" placeholder="请输入装机容量" />
                        </div>
                        <div className="space-y-2">
                          <Label>投运日期</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>所属省份 *</Label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="选择省份" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="shandong">山东</SelectItem>
                              <SelectItem value="shanxi">山西</SelectItem>
                              <SelectItem value="zhejiang">浙江</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>所属城市</Label>
                          <Input placeholder="请输入城市" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>详细地址</Label>
                        <Input placeholder="请输入详细地址" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>电网节点</Label>
                          <Input placeholder="请输入电网节点" />
                        </div>
                        <div className="space-y-2">
                          <Label>交易单元</Label>
                          <Input placeholder="请输入交易单元编号" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>联系人</Label>
                          <Input placeholder="请输入联系人" />
                        </div>
                        <div className="space-y-2">
                          <Label>联系电话</Label>
                          <Input placeholder="请输入联系电话" />
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <DialogFooter>
                    <Button variant="outline">取消</Button>
                    <Button className="bg-[#00B04D] hover:bg-[#00A86B]" onClick={() => toast.success("场站创建成功")}>创建</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 筛选栏 */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="搜索场站名称或交易单元..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="省份筛选" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部省份</SelectItem>
                {provinces.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="类型筛选" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {types.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 场站表格 */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F1F8F4]">
                <TableRow>
                  <TableHead>场站名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead className="text-right">装机容量</TableHead>
                  <TableHead>省份/城市</TableHead>
                  <TableHead>电网节点</TableHead>
                  <TableHead>交易单元</TableHead>
                  <TableHead>投运日期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStations.map((station) => (
                  <TableRow key={station.id} className="hover:bg-[#F8FBFA]">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStationTypeIcon(station.type)}
                        <span className="font-medium">{station.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{station.type}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{station.capacity} MW</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {station.province} · {station.city}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{station.gridNode}</TableCell>
                    <TableCell className="font-mono text-sm">{station.tradingUnit}</TableCell>
                    <TableCell className="text-muted-foreground font-mono">{station.commissionDate}</TableCell>
                    <TableCell>{getStatusBadge(station.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============= 主组件 =============
const SystemManagement = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">系统管理</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          用户账户、角色权限、操作手册及场站配置管理
        </p>
      </div>

      {/* 主标签页 */}
      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-white">
            <Users className="h-4 w-4 mr-2" />
            账户管理
          </TabsTrigger>
          <TabsTrigger value="manuals" className="data-[state=active]:bg-white">
            <BookOpen className="h-4 w-4 mr-2" />
            操作手册配置
          </TabsTrigger>
          <TabsTrigger value="stations" className="data-[state=active]:bg-white">
            <Building2 className="h-4 w-4 mr-2" />
            场站信息管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <AccountManagementTab />
        </TabsContent>

        <TabsContent value="manuals">
          <ManualConfigurationTab />
        </TabsContent>

        <TabsContent value="stations">
          <StationManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemManagement;

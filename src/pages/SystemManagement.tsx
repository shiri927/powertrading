import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Shield, 
  Building2, 
  Plus,
  Search,
  Settings,
  FileText
} from "lucide-react";

const accounts = [
  { id: 1, name: "Zhang Wei", email: "zhang.wei@company.com", role: "Admin", status: "Active" },
  { id: 2, name: "Li Ming", email: "li.ming@company.com", role: "Trader", status: "Active" },
  { id: 3, name: "Wang Fang", email: "wang.fang@company.com", role: "Analyst", status: "Active" },
  { id: 4, name: "Chen Xiao", email: "chen.xiao@company.com", role: "Viewer", status: "Inactive" },
];

const roles = [
  { name: "Admin", users: 2, permissions: "Full system access" },
  { name: "Trader", users: 5, permissions: "Trading & execution" },
  { name: "Analyst", users: 8, permissions: "Data analysis & reports" },
  { name: "Viewer", users: 12, permissions: "Read-only access" },
];

const stations = [
  { 
    name: "Ningxia Wind Farm A", 
    type: "Wind", 
    capacity: "150 MW", 
    location: "Ningxia Region",
    status: "Operational"
  },
  { 
    name: "Ningxia Solar Park B", 
    type: "Solar", 
    capacity: "100 MW", 
    location: "Ningxia Region",
    status: "Operational"
  },
  { 
    name: "Ningxia Hydro Station", 
    type: "Hydro", 
    capacity: "50 MW", 
    location: "Ningxia Region",
    status: "Operational"
  },
];

const SystemManagement = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">系统管理</h1>
        <p className="text-muted-foreground mt-2">
          用户账户、角色及场站配置管理
        </p>
      </div>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                账户管理
              </CardTitle>
              <CardDescription className="mt-2">
                管理用户账户和访问权限
              </CardDescription>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              添加账户
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="搜索账户..." 
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            {accounts.map((account) => (
              <div 
                key={account.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {account.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground">{account.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{account.role}</Badge>
                  <Badge variant={account.status === "Active" ? "default" : "secondary"}>
                    {account.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                角色管理
              </CardTitle>
              <CardDescription className="mt-2">
                配置角色和权限
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              新建角色
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{role.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {role.permissions}
                      </p>
                    </div>
                    <Badge variant="secondary">{role.users} 用户</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    管理权限
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Station Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                场站基础信息
              </CardTitle>
              <CardDescription className="mt-2">
                管理发电场站配置信息
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              添加场站
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stations.map((station, index) => (
              <div 
                key={index}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{station.name}</h3>
                      <Badge>{station.type}</Badge>
                      <Badge variant="outline" className="text-success border-success">
                        {station.status}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">装机容量:</span>
                        <span className="font-medium">{station.capacity}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">位置:</span>
                        <span className="font-medium">{station.location}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    编辑详情
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            操作手册与文档
          </CardTitle>
          <CardDescription>
            按功能模块分类的系统文档和用户指南
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-1">数据概览使用指南</h4>
              <p className="text-sm text-muted-foreground">版本 2.1 - 更新于 2024年3月</p>
            </div>
            <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-1">交易模块手册</h4>
              <p className="text-sm text-muted-foreground">版本 1.8 - 更新于 2024年2月</p>
            </div>
            <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-1">预测工具指南</h4>
              <p className="text-sm text-muted-foreground">版本 3.0 - 更新于 2024年3月</p>
            </div>
            <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-1">系统管理手册</h4>
              <p className="text-sm text-muted-foreground">版本 1.5 - 更新于 2024年1月</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemManagement;

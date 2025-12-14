import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Bell, Megaphone, AlertTriangle, Search, ExternalLink, 
  Calendar, Clock, ChevronRight, Filter, RefreshCw 
} from "lucide-react";
import { format } from "date-fns";

// 山东电力交易中心公告数据
const announcements = [
  {
    id: 1,
    title: "关于开展2024年12月山东电力中长期交易的公告",
    date: "2024-12-13",
    time: "16:30",
    category: "交易公告",
    priority: "high",
    source: "山东电力交易中心",
    url: "#",
    summary: "根据《山东电力中长期交易规则》，现组织开展2024年12月电力中长期交易..."
  },
  {
    id: 2,
    title: "关于发布山东电力现货市场2024年12月运行方案的通知",
    date: "2024-12-12",
    time: "14:20",
    category: "运行通知",
    priority: "high",
    source: "山东电力交易中心",
    url: "#",
    summary: "为保障山东电力现货市场平稳运行，现发布12月市场运行方案..."
  },
  {
    id: 3,
    title: "关于2024年12月月度集中竞价交易结果的公告",
    date: "2024-12-11",
    time: "10:00",
    category: "交易结果",
    priority: "medium",
    source: "山东电力交易中心",
    url: "#",
    summary: "2024年12月月度集中竞价交易已完成，现公布交易结果..."
  },
  {
    id: 4,
    title: "山东电力交易平台系统升级维护公告",
    date: "2024-12-10",
    time: "09:30",
    category: "系统公告",
    priority: "medium",
    source: "山东电力交易中心",
    url: "#",
    summary: "为提升系统服务能力，交易平台将于12月15日进行系统升级维护..."
  },
  {
    id: 5,
    title: "关于调整新能源场站入市交易流程的通知",
    date: "2024-12-09",
    time: "15:45",
    category: "政策通知",
    priority: "high",
    source: "山东电力交易中心",
    url: "#",
    summary: "根据国家能源局相关文件精神，现对新能源场站入市交易流程进行调整..."
  },
  {
    id: 6,
    title: "2024年11月山东电力市场运行情况通报",
    date: "2024-12-08",
    time: "11:00",
    category: "市场通报",
    priority: "low",
    source: "山东电力交易中心",
    url: "#",
    summary: "11月份山东电力市场总体运行平稳，交易电量同比增长8.5%..."
  },
  {
    id: 7,
    title: "关于组织开展绿电绿证交易的通知",
    date: "2024-12-06",
    time: "14:00",
    category: "交易公告",
    priority: "medium",
    source: "山东电力交易中心",
    url: "#",
    summary: "为落实可再生能源消纳责任权重要求，现组织开展绿电绿证交易..."
  },
  {
    id: 8,
    title: "山东省电力市场注册指南（2024年修订版）",
    date: "2024-12-05",
    time: "10:30",
    category: "政策通知",
    priority: "low",
    source: "山东电力交易中心",
    url: "#",
    summary: "为规范市场主体注册流程，现发布修订后的市场注册指南..."
  }
];

// 政策法规数据
const policies = [
  {
    id: 1,
    title: "山东省电力中长期交易规则（2024年修订版）",
    date: "2024-11-20",
    category: "交易规则",
    issuer: "山东省能源局",
    status: "现行有效"
  },
  {
    id: 2,
    title: "山东省电力现货市场运行基本规则",
    date: "2024-10-15",
    category: "交易规则",
    issuer: "山东省能源局",
    status: "现行有效"
  },
  {
    id: 3,
    title: "关于进一步完善电力市场化改革的实施意见",
    date: "2024-09-01",
    category: "政策文件",
    issuer: "山东省发改委",
    status: "现行有效"
  },
  {
    id: 4,
    title: "新能源参与市场交易实施细则",
    date: "2024-08-10",
    category: "交易规则",
    issuer: "山东省能源局",
    status: "现行有效"
  },
  {
    id: 5,
    title: "售电公司市场准入与退出管理办法",
    date: "2024-07-20",
    category: "管理办法",
    issuer: "山东省能源局",
    status: "现行有效"
  }
];

const categoryColors: Record<string, string> = {
  "交易公告": "bg-blue-100 text-blue-700 border-blue-200",
  "运行通知": "bg-purple-100 text-purple-700 border-purple-200",
  "交易结果": "bg-green-100 text-green-700 border-green-200",
  "系统公告": "bg-orange-100 text-orange-700 border-orange-200",
  "政策通知": "bg-red-100 text-red-700 border-red-200",
  "市场通报": "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const categoryIcons: Record<string, React.ReactNode> = {
  "交易公告": <Megaphone className="h-4 w-4" />,
  "运行通知": <Bell className="h-4 w-4" />,
  "交易结果": <FileText className="h-4 w-4" />,
  "系统公告": <AlertTriangle className="h-4 w-4" />,
  "政策通知": <FileText className="h-4 w-4" />,
  "市场通报": <FileText className="h-4 w-4" />,
};

const NewsPolicy = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const lastUpdate = format(new Date(), "yyyy-MM-dd HH:mm");

  const filteredAnnouncements = announcements.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(announcements.map(a => a.category))];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">新闻与政策</h1>
          <p className="text-muted-foreground">山东电力交易中心公告、通知及政策法规信息</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>最后更新: {lastUpdate}</span>
          <Button variant="outline" size="sm" className="ml-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Megaphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">本月公告</p>
                <p className="text-xl font-bold font-mono">{announcements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">重要通知</p>
                <p className="text-xl font-bold font-mono text-red-600">
                  {announcements.filter(a => a.priority === "high").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <FileText className="h-5 w-5 text-[#00B04D]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">政策法规</p>
                <p className="text-xl font-bold font-mono">{policies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">今日更新</p>
                <p className="text-xl font-bold font-mono">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="announcements">公告通知</TabsTrigger>
          <TabsTrigger value="policies">政策法规</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-4">
          {/* 筛选条件 */}
          <Card className="bg-white">
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">筛选:</span>
                </div>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索公告标题或内容..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="公告类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="bg-[#F1F8F4] text-[#00B04D]">
                  共 {filteredAnnouncements.length} 条
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 公告列表 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-[#00B04D]" />
                山东电力交易中心公告
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className="group p-4 border border-border rounded-lg hover:bg-[#F8FBFA] hover:border-[#00B04D]/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {item.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">重要</Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${categoryColors[item.category] || ''}`}
                          >
                            {categoryIcons[item.category]}
                            <span className="ml-1">{item.category}</span>
                          </Badge>
                          <h3 className="font-medium text-foreground group-hover:text-[#00B04D] transition-colors">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {item.summary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.time}
                          </span>
                          <span>{item.source}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        查看详情
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#00B04D]" />
                政策法规文件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F1F8F4] border-b-2 border-[#00B04D]">
                      <th className="text-left p-3 text-sm font-medium">文件名称</th>
                      <th className="text-left p-3 text-sm font-medium w-28">发布日期</th>
                      <th className="text-left p-3 text-sm font-medium w-24">类型</th>
                      <th className="text-left p-3 text-sm font-medium w-32">发布机构</th>
                      <th className="text-left p-3 text-sm font-medium w-24">状态</th>
                      <th className="text-center p-3 text-sm font-medium w-20">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((policy) => (
                      <tr key={policy.id} className="border-b hover:bg-[#F8FBFA] transition-colors">
                        <td className="p-3">
                          <span className="font-medium text-foreground hover:text-[#00B04D] cursor-pointer">
                            {policy.title}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-sm">{policy.date}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-[#F1F8F4]">
                            {policy.category}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{policy.issuer}</td>
                        <td className="p-3">
                          <Badge className="bg-[#00B04D] hover:bg-[#00B04D]/90">
                            {policy.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsPolicy;

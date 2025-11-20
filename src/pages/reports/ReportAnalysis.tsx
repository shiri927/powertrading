import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar } from "lucide-react";

const analysisReportData = [
  {
    id: 1,
    name: "2024年第一季度市场分析报告",
    category: "市场分析",
    period: "Q1 2024",
    author: "分析团队",
    status: "已发布",
    publishDate: "2024-03-28",
    views: 156
  },
  {
    id: 2,
    name: "新能源发电效益分析报告",
    category: "效益分析",
    period: "2024年3月",
    author: "技术部",
    status: "已发布",
    publishDate: "2024-03-25",
    views: 98
  },
  {
    id: 3,
    name: "现货市场价格趋势分析",
    category: "价格分析",
    period: "2024年3月",
    author: "市场部",
    status: "已发布",
    publishDate: "2024-03-20",
    views: 203
  },
  {
    id: 4,
    name: "售电业务年度总结报告",
    category: "业务总结",
    period: "2023年度",
    author: "业务部",
    status: "审核中",
    publishDate: "-",
    views: 0
  },
  {
    id: 5,
    name: "电网系统运行分析报告",
    category: "运行分析",
    period: "2024年2月",
    author: "运维团队",
    status: "已发布",
    publishDate: "2024-03-01",
    views: 142
  }
];

const ReportAnalysis = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">报告管理</h1>
          <p className="text-muted-foreground mt-2">
            管理和查看各类分析报告
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            选择时间
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            新建报告
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>总报告数</CardTitle>
            <CardDescription>所有报告</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">86</div>
            <p className="text-sm text-muted-foreground mt-1">份报告</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>已发布</CardTitle>
            <CardDescription>已对外发布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">72</div>
            <p className="text-sm text-muted-foreground mt-1">份报告</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>审核中</CardTitle>
            <CardDescription>等待审核</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">8</div>
            <p className="text-sm text-muted-foreground mt-1">份报告</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>总浏览量</CardTitle>
            <CardDescription>累计浏览</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4">12.5K</div>
            <p className="text-sm text-muted-foreground mt-1">次</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>报告列表</CardTitle>
          <CardDescription>查看和管理分析报告</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>报告名称</TableHead>
                <TableHead>类别</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>发布日期</TableHead>
                <TableHead>浏览量</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysisReportData.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {report.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.category}</Badge>
                  </TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell className="text-muted-foreground">{report.author}</TableCell>
                  <TableCell>
                    <Badge variant={report.status === "已发布" ? "default" : "secondary"}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{report.publishDate}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {report.views}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {report.status === "已发布" && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            下载
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportAnalysis;

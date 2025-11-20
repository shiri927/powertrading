import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Filter } from "lucide-react";

const reportData = [
  {
    id: 1,
    name: "月度交易报表",
    type: "交易报表",
    period: "2024年3月",
    status: "已生成",
    generatedDate: "2024-03-31",
    size: "2.5 MB"
  },
  {
    id: 2,
    name: "现货市场结算报表",
    type: "结算报表",
    period: "2024年3月",
    status: "已生成",
    generatedDate: "2024-03-30",
    size: "1.8 MB"
  },
  {
    id: 3,
    name: "新能源发电量报表",
    type: "发电报表",
    period: "2024年3月",
    status: "已生成",
    generatedDate: "2024-03-29",
    size: "3.2 MB"
  },
  {
    id: 4,
    name: "售电业务收益报表",
    type: "收益报表",
    period: "2024年3月",
    status: "生成中",
    generatedDate: "-",
    size: "-"
  },
  {
    id: 5,
    name: "年度综合分析报表",
    type: "综合报表",
    period: "2023年度",
    status: "已生成",
    generatedDate: "2024-01-15",
    size: "8.5 MB"
  }
];

const ReportManagement = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">报表管理</h1>
          <p className="text-muted-foreground mt-2">
            管理和生成各类业务报表
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            选择日期
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            生成报表
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>总报表数</CardTitle>
            <CardDescription>所有报表</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">128</div>
            <p className="text-sm text-muted-foreground mt-1">份报表</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>本月生成</CardTitle>
            <CardDescription>3月份</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">15</div>
            <p className="text-sm text-muted-foreground mt-1">份报表</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>待生成</CardTitle>
            <CardDescription>等待处理</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">3</div>
            <p className="text-sm text-muted-foreground mt-1">份报表</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>总存储</CardTitle>
            <CardDescription>占用空间</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4">2.8</div>
            <p className="text-sm text-muted-foreground mt-1">GB</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>报表列表</CardTitle>
          <CardDescription>查看和下载已生成的报表</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>报表名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>生成日期</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {report.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.type}</Badge>
                  </TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>
                    <Badge variant={report.status === "已生成" ? "default" : "secondary"}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{report.generatedDate}</TableCell>
                  <TableCell className="text-muted-foreground">{report.size}</TableCell>
                  <TableCell>
                    {report.status === "已生成" && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </Button>
                    )}
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

export default ReportManagement;

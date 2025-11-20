import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle } from "lucide-react";

const policyNews = [
  {
    id: 1,
    title: "关于新能源并网政策更新的通知",
    date: "2024-03-15",
    type: "政策",
    priority: "high",
    content: "国家能源局发布最新新能源并网政策，优化并网流程，提高并网效率..."
  },
  {
    id: 2,
    title: "2024年第一季度现货市场结算指南",
    date: "2024-03-10",
    type: "指南",
    priority: "medium",
    content: "详细说明第一季度现货市场结算规则与时间安排..."
  },
  {
    id: 3,
    title: "中长期交易平台维护公告",
    date: "2024-03-08",
    type: "公告",
    priority: "low",
    content: "平台将于3月20日进行系统维护，预计维护时间4小时..."
  },
  {
    id: 4,
    title: "电力市场化改革深化实施方案",
    date: "2024-03-05",
    type: "政策",
    priority: "high",
    content: "发改委发布电力市场化改革实施方案，推进市场化交易..."
  },
  {
    id: 5,
    title: "新能源消纳保障机制实施细则",
    date: "2024-03-01",
    type: "政策",
    priority: "high",
    content: "明确新能源消纳责任权重和保障机制具体实施办法..."
  }
];

const marketNews = [
  {
    id: 1,
    title: "3月份电力现货市场运行分析",
    date: "2024-03-16",
    type: "分析",
    source: "电力交易中心"
  },
  {
    id: 2,
    title: "新能源发电量创历史新高",
    date: "2024-03-14",
    type: "新闻",
    source: "能源日报"
  },
  {
    id: 3,
    title: "煤电容量电价机制正式实施",
    date: "2024-03-12",
    type: "新闻",
    source: "电力周刊"
  }
];

const NewsPolicy = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">新闻与政策</h1>
        <p className="text-muted-foreground mt-2">
          全面的市场资讯与政策信息
        </p>
      </div>

      <Tabs defaultValue="policy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="policy">政策公告</TabsTrigger>
          <TabsTrigger value="news">市场资讯</TabsTrigger>
        </TabsList>

        <TabsContent value="policy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                政策文章与市场公告
              </CardTitle>
              <CardDescription>
                宁夏交易中心最新公告通知
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policyNews.map((news) => (
                  <div 
                    key={news.id} 
                    className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground">{news.title}</h3>
                        <Badge variant={
                          news.priority === "high" ? "destructive" : 
                          news.priority === "medium" ? "default" : "secondary"
                        }>
                          {news.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{news.content}</p>
                      <p className="text-xs text-muted-foreground">{news.date}</p>
                    </div>
                    {news.priority === "high" && (
                      <AlertCircle className="h-5 w-5 text-destructive ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                市场动态
              </CardTitle>
              <CardDescription>
                电力市场最新资讯与行业动态
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketNews.map((news) => (
                  <div 
                    key={news.id} 
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground">{news.title}</h3>
                      <Badge variant="outline">{news.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{news.date}</span>
                      <span>来源: {news.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsPolicy;

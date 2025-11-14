import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const Review = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">复盘分析</h1>
        <p className="text-muted-foreground mt-2">
          售电交易策略复盘与收益优化
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            复盘分析中心
          </CardTitle>
          <CardDescription>
            售电交易效果评估与优化建议
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            复盘分析功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Review;

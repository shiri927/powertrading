import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const MediumLongTerm = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">中长期交易策略</h1>
        <p className="text-muted-foreground mt-2">
          年度、月度中长期合约交易策略分析与决策支持
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            中长期策略引擎
          </CardTitle>
          <CardDescription>
            基于负荷预测的中长期合约优化
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            中长期交易策略功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediumLongTerm;

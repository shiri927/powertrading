import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

const Decision = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">售电交易决策</h1>
        <p className="text-muted-foreground mt-2">
          基于用户负荷预测的智能交易决策支持系统
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              省内现货策略
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              省内现货市场交易策略分析与负荷匹配优化
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              中长期交易策略
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              年度、月度中长期合约交易策略分析与决策
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              省间现货策略
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              跨省现货交易策略分析与价差套利优化
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              绿证交易策略
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              绿色电力证书交易策略与配额管理优化
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            智能决策功能
          </CardTitle>
          <CardDescription>
            基于AI的售电交易策略生成与优化
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border border-border rounded-lg bg-muted/20">
              <h4 className="font-medium text-foreground mb-2">负荷预测分析</h4>
              <p className="text-sm text-muted-foreground">
                基于历史数据和机器学习算法的用户负荷预测，为交易决策提供数据基础
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg bg-muted/20">
              <h4 className="font-medium text-foreground mb-2">价格趋势预判</h4>
              <p className="text-sm text-muted-foreground">
                实时监控市场价格动态，结合供需关系分析市场趋势
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg bg-muted/20">
              <h4 className="font-medium text-foreground mb-2">策略推荐引擎</h4>
              <p className="text-sm text-muted-foreground">
                根据负荷预测和市场价格，智能推荐最优交易策略和申报方案
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg bg-muted/20">
              <h4 className="font-medium text-foreground mb-2">风险控制</h4>
              <p className="text-sm text-muted-foreground">
                实时监控偏差风险，提供预警和应对策略建议
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Decision;

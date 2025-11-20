import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight } from "lucide-react";

const InterProvincial = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">省间现货策略</h1>
        <p className="text-muted-foreground mt-2">
          跨省现货交易策略分析与外送价格优化
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            省间策略引擎
          </CardTitle>
          <CardDescription>
            基于省间价差的套利策略优化
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            省间现货策略功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterProvincial;

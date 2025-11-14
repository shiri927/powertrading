import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

const Decision = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">交易决策</h1>
        <p className="text-muted-foreground mt-2">
          售电交易策略生成与决策支持
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            智能决策引擎
          </CardTitle>
          <CardDescription>
            基于用户负荷的交易策略优化
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            交易决策功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Decision;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";

const Console = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">交易操作台</h1>
        <p className="text-muted-foreground mt-2">
          售电交易申报与执行管理
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            交易执行中心
          </CardTitle>
          <CardDescription>
            售电侧交易申报与监控平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            交易操作台功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Console;

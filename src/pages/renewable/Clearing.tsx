import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const Clearing = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">出清管理</h1>
        <p className="text-muted-foreground mt-2">
          分时段交易、省内外现货出清结果管理
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            出清结果查询
          </CardTitle>
          <CardDescription>
            多维度出清数据展示与分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            出清管理功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clearing;

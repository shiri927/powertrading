import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

const Settlement = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">结算管理</h1>
        <p className="text-muted-foreground mt-2">
          结算单管理、电费明细及费用汇总分析
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            结算数据中心
          </CardTitle>
          <CardDescription>
            自动化结算数据处理与分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            结算管理功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settlement;

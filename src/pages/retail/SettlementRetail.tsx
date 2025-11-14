import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

const SettlementRetail = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">出清与结算</h1>
        <p className="text-muted-foreground mt-2">
          售电侧出清结果与结算数据管理
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            出清结算中心
          </CardTitle>
          <CardDescription>
            出清数据查询与结算明细分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            出清结算功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettlementRetail;

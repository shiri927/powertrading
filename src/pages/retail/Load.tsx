import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

const Load = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">用电负荷管理</h1>
        <p className="text-muted-foreground mt-2">
          用户用电负荷监测与预测分析
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            负荷管理中心
          </CardTitle>
          <CardDescription>
            实时负荷监测、预测及优化建议
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            负荷管理功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Load;

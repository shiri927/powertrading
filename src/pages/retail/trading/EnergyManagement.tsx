import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

const EnergyManagement = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">用能管理</h1>
        <p className="text-muted-foreground mt-2">
          客户用电数据监测与分析
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            用能数据管理中心
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            用能管理功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyManagement;

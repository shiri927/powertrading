import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

const BaseData = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">基础数据管理</h1>
        <p className="text-muted-foreground mt-2">
          售电用户、套餐及合同基础数据
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            基础数据概览
          </CardTitle>
          <CardDescription>
            用户信息、套餐配置、合同管理
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            基础数据管理功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BaseData;

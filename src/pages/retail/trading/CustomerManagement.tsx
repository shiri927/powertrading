import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const CustomerManagement = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">客户管理</h1>
        <p className="text-muted-foreground mt-2">
          零售客户信息管理与分析
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            客户信息管理中心
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            客户管理功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;

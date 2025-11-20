import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";

const GreenCertificate = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">绿证交易策略</h1>
        <p className="text-muted-foreground mt-2">
          绿色电力证书交易策略与配额管理
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            绿证策略引擎
          </CardTitle>
          <CardDescription>
            基于配额要求的绿证交易优化
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            绿证交易策略功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GreenCertificate;

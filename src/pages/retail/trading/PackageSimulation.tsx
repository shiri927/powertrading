import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

const PackageSimulation = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">套餐模拟计算</h1>
        <p className="text-muted-foreground mt-2">
          零售套餐方案测算与优化
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            套餐模拟计算中心
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            套餐模拟计算功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageSimulation;

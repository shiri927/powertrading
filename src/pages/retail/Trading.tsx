import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const Trading = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">零售交易</h1>
        <p className="text-muted-foreground mt-2">
          用户套餐管理与零售交易执行
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            零售交易中心
          </CardTitle>
          <CardDescription>
            用户签约、套餐销售、交易执行
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            零售交易功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Trading;

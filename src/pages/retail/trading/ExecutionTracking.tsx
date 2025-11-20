import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

const ExecutionTracking = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">零售执行情况追踪</h1>
        <p className="text-muted-foreground mt-2">
          零售业务执行过程监控与追踪
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            执行追踪中心
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            零售执行情况追踪功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutionTracking;

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Settings } from "lucide-react";
import { StrategyConfigTab } from "./decision/StrategyConfigTab";
import { BacktestTab } from "./decision/BacktestTab";

const Decision = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">智能决策中心</h1>
        <p className="text-muted-foreground mt-2">
          AI驱动的新能源交易策略生成与决策支持系统
        </p>
      </div>

      <Tabs defaultValue="strategy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-[#F1F8F4]">
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            策略配置中心
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            回测与模拟
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy">
          <StrategyConfigTab />
        </TabsContent>

        <TabsContent value="backtest">
          <BacktestTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Decision;

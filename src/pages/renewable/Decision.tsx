import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Settings, Calendar, Zap } from "lucide-react";
import { StrategyConfigTab } from "./decision/StrategyConfigTab";
import { BacktestTab } from "./decision/BacktestTab";
import DailyRollingTab from "./decision/DailyRollingTab";
import IntraProvincialSpotTab from "./decision/IntraProvincialSpotTab";

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
        <TabsList className="grid w-full grid-cols-4 bg-[#F1F8F4]">
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            策略配置中心
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            回测与模拟
          </TabsTrigger>
          <TabsTrigger value="daily-rolling" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            日滚交易策略
          </TabsTrigger>
          <TabsTrigger value="intra-provincial" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            省内现货交易
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy">
          <StrategyConfigTab />
        </TabsContent>

        <TabsContent value="backtest">
          <BacktestTab />
        </TabsContent>

        <TabsContent value="daily-rolling">
          <DailyRollingTab />
        </TabsContent>

        <TabsContent value="intra-provincial">
          <IntraProvincialSpotTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Decision;

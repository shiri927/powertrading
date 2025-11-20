import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Settings, Lightbulb } from "lucide-react";
import { AIForecastTab } from "./decision/AIForecastTab";

const Decision = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">智能决策中心</h1>
        <p className="text-muted-foreground mt-2">
          AI驱动的新能源交易策略生成与决策支持系统
        </p>
      </div>

      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#F1F8F4]">
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            AI功率预测
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            策略配置中心
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            回测与模拟
          </TabsTrigger>
          <TabsTrigger value="recommendation" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            智能推荐
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast">
          <AIForecastTab />
        </TabsContent>

        <TabsContent value="strategy">
          <div className="text-center py-20 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">策略配置中心</p>
            <p className="text-sm mt-2">Phase 2 开发中...</p>
          </div>
        </TabsContent>

        <TabsContent value="backtest">
          <div className="text-center py-20 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">回测与模拟</p>
            <p className="text-sm mt-2">Phase 3 开发中...</p>
          </div>
        </TabsContent>

        <TabsContent value="recommendation">
          <div className="text-center py-20 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">智能推荐</p>
            <p className="text-sm mt-2">Phase 4 开发中...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Decision;

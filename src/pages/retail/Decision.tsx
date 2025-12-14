import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Zap } from "lucide-react";
import RetailDailyRollingTab from "./decision/RetailDailyRollingTab";
import RetailIntraProvincialSpotTab from "./decision/RetailIntraProvincialSpotTab";

const Decision = () => {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">售电交易决策</h1>
        <p className="text-muted-foreground mt-2">
          基于负荷预测的智能交易决策支持系统，运用运筹优化算法生成最优购电策略
        </p>
      </div>

      <Tabs defaultValue="daily-rolling" className="space-y-6">
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="daily-rolling" className="data-[state=active]:bg-white data-[state=active]:text-[#00B04D]">
            <TrendingUp className="h-4 w-4 mr-2" />
            日滚交易策略
          </TabsTrigger>
          <TabsTrigger value="intra-provincial" className="data-[state=active]:bg-white data-[state=active]:text-[#00B04D]">
            <Zap className="h-4 w-4 mr-2" />
            省内现货申报
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-rolling">
          <RetailDailyRollingTab />
        </TabsContent>

        <TabsContent value="intra-provincial">
          <RetailIntraProvincialSpotTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Decision;

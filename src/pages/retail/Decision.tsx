import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Zap } from "lucide-react";
import RetailDailyRollingTab from "./decision/RetailDailyRollingTab";
import RetailIntraProvincialSpotTab from "./decision/RetailIntraProvincialSpotTab";

const Decision = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d2137] to-[#071422] p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">售电交易决策</h1>
        <p className="text-slate-400 mt-2">
          基于负荷预测的智能交易决策支持系统，运用运筹优化算法生成最优购电策略
        </p>
      </div>

      <Tabs defaultValue="daily-rolling" className="space-y-6">
        <TabsList className="bg-[#1a3a5c]/80 border border-[#2a4a6c]">
          <TabsTrigger 
            value="daily-rolling" 
            className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white text-slate-300"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            日滚交易策略
          </TabsTrigger>
          <TabsTrigger 
            value="intra-provincial" 
            className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white text-slate-300"
          >
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

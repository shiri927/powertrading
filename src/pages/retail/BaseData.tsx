import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TradingCalendarTab from "./base-data/TradingCalendarTab";
import PowerPlanTab from "./base-data/PowerPlanTab";
import ContractManagementTab from "./base-data/ContractManagementTab";
import ContractAnalysisTab from "./base-data/ContractAnalysisTab";

const BaseData = () => {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">基础数据管理</h1>
        <p className="text-muted-foreground mt-2">
          交易日历、电量计划、合同管理及仓位分析
        </p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">交易日历</TabsTrigger>
          <TabsTrigger value="power-plan">电量计划</TabsTrigger>
          <TabsTrigger value="contract">合同管理</TabsTrigger>
          <TabsTrigger value="analysis">合同分析</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <TradingCalendarTab />
        </TabsContent>

        <TabsContent value="power-plan">
          <PowerPlanTab />
        </TabsContent>

        <TabsContent value="contract">
          <ContractManagementTab />
        </TabsContent>

        <TabsContent value="analysis">
          <ContractAnalysisTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BaseData;

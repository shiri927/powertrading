import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TradingClearingTab from "./clearing-settlement/TradingClearingTab";
import SettlementDetailsTab from "./clearing-settlement/SettlementDetailsTab";
import SettlementStatementTab from "./clearing-settlement/SettlementStatementTab";

const ClearingSettlement = () => {
  const [activeTab, setActiveTab] = useState("trading-clearing");

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">出清与结算</h1>
        <p className="text-muted-foreground mt-2">
          分时段交易出清结果查询、电费结算明细管理及结算单汇总
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3 bg-[#F1F8F4]">
          <TabsTrigger 
            value="trading-clearing"
            className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white"
          >
            分时段交易出清
          </TabsTrigger>
          <TabsTrigger 
            value="settlement-details"
            className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white"
          >
            电费结算明细
          </TabsTrigger>
          <TabsTrigger 
            value="settlement-statement"
            className="data-[state=active]:bg-[#00B04D] data-[state=active]:text-white"
          >
            结算单管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trading-clearing" className="mt-6">
          <TradingClearingTab />
        </TabsContent>

        <TabsContent value="settlement-details" className="mt-6">
          <SettlementDetailsTab />
        </TabsContent>

        <TabsContent value="settlement-statement" className="mt-6">
          <SettlementStatementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClearingSettlement;

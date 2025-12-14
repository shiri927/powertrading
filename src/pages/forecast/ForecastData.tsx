import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupplyDemandForecast from "./SupplyDemandForecast";
import SpotPriceForecast from "./SpotPriceForecast";
import PriceDifferenceForecast from "./PriceDifferenceForecast";

const ForecastData = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">预测数据</h1>
        <p className="text-muted-foreground">市场供需、电价及价差预测分析</p>
      </div>

      <Tabs defaultValue="supply-demand" className="space-y-4">
        <TabsList className="bg-[#F1F8F4]">
          <TabsTrigger value="supply-demand">市场供需预测</TabsTrigger>
          <TabsTrigger value="spot-price">现货电价预测</TabsTrigger>
          <TabsTrigger value="price-difference">现货价差预测</TabsTrigger>
        </TabsList>

        <TabsContent value="supply-demand">
          <SupplyDemandForecast />
        </TabsContent>

        <TabsContent value="spot-price">
          <SpotPriceForecast />
        </TabsContent>

        <TabsContent value="price-difference">
          <PriceDifferenceForecast />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForecastData;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MarketIntelligence from "./pages/MarketIntelligence";
import SystemManagement from "./pages/SystemManagement";
import NotFound from "./pages/NotFound";

// Forecast pages
import SupplyDemand from "./pages/forecast/SupplyDemand";
import SpotPrice from "./pages/PricePrediction";
import PriceDifference from "./pages/forecast/PriceDifference";
import Weather from "./pages/WeatherIntelligence";
import TransmissionPrice from "./pages/forecast/TransmissionPrice";

// Revenue pages
import GenerationRevenue from "./pages/revenue/Generation";
import RetailRevenue from "./pages/revenue/Retail";

// Renewable pages
import RenewableBaseData from "./pages/renewable/BaseData";
import RenewableDecision from "./pages/renewable/Decision";
import RenewableConsole from "./pages/renewable/Console";
import RenewableClearing from "./pages/renewable/Clearing";
import RenewableSettlement from "./pages/renewable/Settlement";
import RenewableReview from "./pages/renewable/Review";

// Retail pages
import RetailBaseData from "./pages/retail/BaseData";
import RetailDecision from "./pages/retail/Decision";
import RetailConsole from "./pages/retail/Console";
import RetailTrading from "./pages/retail/Trading";
import RetailLoad from "./pages/retail/Load";
import RetailSettlement from "./pages/retail/SettlementRetail";
import RetailReview from "./pages/retail/Review";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            
            {/* Forecast Routes */}
            <Route path="/forecast/supply-demand" element={<SupplyDemand />} />
            <Route path="/forecast/spot-price" element={<SpotPrice />} />
            <Route path="/forecast/price-difference" element={<PriceDifference />} />
            <Route path="/forecast/weather" element={<Weather />} />
            <Route path="/forecast/transmission-price" element={<TransmissionPrice />} />
            
            {/* Market Intelligence */}
            <Route path="/market" element={<MarketIntelligence />} />
            
            {/* Renewable Energy Routes */}
            <Route path="/renewable/base-data" element={<RenewableBaseData />} />
            <Route path="/renewable/decision" element={<RenewableDecision />} />
            <Route path="/renewable/console" element={<RenewableConsole />} />
            <Route path="/renewable/clearing" element={<RenewableClearing />} />
            <Route path="/renewable/settlement" element={<RenewableSettlement />} />
            <Route path="/renewable/review" element={<RenewableReview />} />
            
            {/* Retail Business Routes */}
            <Route path="/retail/base-data" element={<RetailBaseData />} />
            <Route path="/retail/decision" element={<RetailDecision />} />
            <Route path="/retail/console" element={<RetailConsole />} />
            <Route path="/retail/trading" element={<RetailTrading />} />
            <Route path="/retail/load" element={<RetailLoad />} />
            <Route path="/retail/settlement" element={<RetailSettlement />} />
            <Route path="/retail/review" element={<RetailReview />} />
            
            {/* Revenue Analysis Routes */}
            <Route path="/revenue/generation" element={<GenerationRevenue />} />
            <Route path="/revenue/retail" element={<RetailRevenue />} />
            
            {/* System Management */}
            <Route path="/settings" element={<SystemManagement />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

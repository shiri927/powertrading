import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SystemManagement from "./pages/SystemManagement";
import NotFound from "./pages/NotFound";


// Market Fundamentals pages
import UnitSettlement from "./pages/market-fundamentals/UnitSettlement";
import SpotDisclosure from "./pages/market-fundamentals/SpotDisclosure";
import MediumLongTermMarket from "./pages/market-fundamentals/MediumLongTerm";
import WeatherData from "./pages/market-fundamentals/WeatherData";
import GridSystem from "./pages/market-fundamentals/GridSystem";
import EnergyQuotes from "./pages/market-fundamentals/EnergyQuotes";
import NewsPolicy from "./pages/market-fundamentals/NewsPolicy";

// Forecast pages
import ForecastData from "./pages/forecast/ForecastData";

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
import RetailConsole from "./pages/retail/Console";
import RetailTrading from "./pages/retail/Trading";
import RetailClearingSettlement from "./pages/retail/ClearingSettlement";
import RetailReview from "./pages/retail/Review";

// Retail Trading pages
import CustomerManagement from "./pages/retail/trading/CustomerManagement";
import LoadManagement from "./pages/retail/trading/LoadManagement";
import PackageSimulation from "./pages/retail/trading/PackageSimulation";
import ExecutionTracking from "./pages/retail/trading/ExecutionTracking";
import RetailContractManagement from "./pages/retail/trading/RetailContractManagement";

// Retail Decision pages
import RetailDecision from "./pages/retail/Decision";
import MediumLongTerm from "./pages/retail/decision/MediumLongTerm";
import InterProvincial from "./pages/retail/decision/InterProvincial";
import IntraProvincial from "./pages/retail/decision/IntraProvincial";


// Reports pages
import ReportManagement from "./pages/reports/ReportManagement";

const queryClient = new QueryClient();

// Force rebuild to fix React dispatcher issue
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            
            
            {/* Market Fundamentals Routes */}
            <Route path="/market-fundamentals/unit-settlement" element={<UnitSettlement />} />
            <Route path="/market-fundamentals/spot-disclosure" element={<SpotDisclosure />} />
            <Route path="/market-fundamentals/medium-long-term" element={<MediumLongTermMarket />} />
            <Route path="/market-fundamentals/weather" element={<WeatherData />} />
            <Route path="/market-fundamentals/grid" element={<GridSystem />} />
            <Route path="/market-fundamentals/energy" element={<EnergyQuotes />} />
            <Route path="/market-fundamentals/news-policy" element={<NewsPolicy />} />
            
            {/* Forecast Routes */}
            <Route path="/forecast" element={<ForecastData />} />
            
            {/* Renewable Energy Routes */}
            <Route path="/renewable/base-data" element={<RenewableBaseData />} />
            <Route path="/renewable/decision" element={<RenewableDecision />} />
            <Route path="/renewable/console" element={<RenewableConsole />} />
            <Route path="/renewable/clearing" element={<RenewableClearing />} />
            <Route path="/renewable/settlement" element={<RenewableSettlement />} />
            <Route path="/renewable/review" element={<RenewableReview />} />
            
            
            {/* Retail Routes */}
            <Route path="/retail/base-data" element={<RetailBaseData />} />
            <Route path="/retail/decision" element={<RetailDecision />} />
            <Route path="/retail/decision/medium-long-term" element={<MediumLongTerm />} />
            <Route path="/retail/decision/inter-provincial" element={<InterProvincial />} />
            <Route path="/retail/decision/intra-provincial" element={<IntraProvincial />} />
            
            <Route path="/retail/console" element={<RetailConsole />} />
            <Route path="/retail/load-management" element={<LoadManagement />} />
            <Route path="/retail/trading" element={<RetailTrading />} />
            <Route path="/retail/trading/customer-management" element={<CustomerManagement />} />
            <Route path="/retail/trading/contract-management" element={<RetailContractManagement />} />
            <Route path="/retail/trading/package-simulation" element={<PackageSimulation />} />
            <Route path="/retail/trading/execution-tracking" element={<ExecutionTracking />} />
            <Route path="/retail/clearing-settlement" element={<RetailClearingSettlement />} />
            <Route path="/retail/review" element={<RetailReview />} />
            
            {/* Revenue Analysis Routes */}
            <Route path="/revenue/generation" element={<GenerationRevenue />} />
            <Route path="/revenue/retail" element={<RetailRevenue />} />
            
            {/* Reports Routes */}
            <Route path="/reports/management" element={<ReportManagement />} />
            
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

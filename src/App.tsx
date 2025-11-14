import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MarketIntelligence from "./pages/MarketIntelligence";
import PricePrediction from "./pages/PricePrediction";
import WeatherIntelligence from "./pages/WeatherIntelligence";
import GenerationPlanning from "./pages/GenerationPlanning";
import SystemManagement from "./pages/SystemManagement";
import NotFound from "./pages/NotFound";

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
            <Route path="/market" element={<MarketIntelligence />} />
            <Route path="/prediction" element={<PricePrediction />} />
            <Route path="/weather" element={<WeatherIntelligence />} />
            <Route path="/generation" element={<GenerationPlanning />} />
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

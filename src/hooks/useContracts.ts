import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ContractWithUnit {
  id: string;
  contract_no: string;
  contract_name: string;
  contract_type: string;
  direction: string;
  counterparty: string | null;
  start_date: string;
  end_date: string;
  total_volume: number | null;
  unit_price: number | null;
  total_amount: number | null;
  status: string;
  trading_unit_id: string | null;
  unit_name?: string;
  trading_center?: string;
}

export interface ContractAnalysisData {
  hour: string;
  volume: number;
  avgPrice: number;
  marketPrice: number;
  contracts: number;
  productionForecast: number;
  settlementVolume: number;
}

export interface YearlyPositionData {
  month: string;
  volume: number;
  avgPrice: number;
  marketPrice: number;
  settled: number;
  remaining: number;
}

export interface MultiDayPositionData {
  date: string;
  volume: number;
  avgPrice: number;
  marketPrice: number;
  settled: number;
}

export const useContracts = (filters?: {
  tradingUnitId?: string;
  direction?: string;
  status?: string;
  searchTerm?: string;
}) => {
  return useQuery({
    queryKey: ["contracts", filters],
    queryFn: async () => {
      let query = supabase
        .from("contracts")
        .select(`
          *,
          trading_units!contracts_trading_unit_id_fkey (
            unit_name,
            trading_center
          )
        `)
        .order("created_at", { ascending: false });

      if (filters?.tradingUnitId && filters.tradingUnitId !== "all") {
        query = query.eq("trading_unit_id", filters.tradingUnitId);
      }

      if (filters?.direction && filters.direction !== "all") {
        query = query.eq("direction", filters.direction);
      }

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.searchTerm) {
        query = query.or(`contract_name.ilike.%${filters.searchTerm}%,counterparty.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to flatten the trading_units join
      return (data || []).map((contract: any) => ({
        ...contract,
        unit_name: contract.trading_units?.unit_name || "-",
        trading_center: contract.trading_units?.trading_center || "-",
      })) as ContractWithUnit[];
    },
  });
};

// Hook for contract analysis statistics
export const useContractAnalysis = () => {
  const { data: contracts, isLoading, error } = useContracts();

  // Calculate analysis metrics
  const analysisData = contracts || [];
  
  const totalContracts = analysisData.length;
  const totalVolume = analysisData.reduce((sum, c) => sum + (c.total_volume || 0), 0);
  const weightedPriceSum = analysisData.reduce((sum, c) => sum + (c.unit_price || 0) * (c.total_volume || 0), 0);
  const weightedAvgPrice = totalVolume > 0 ? weightedPriceSum / totalVolume : 0;
  const uniqueUnits = new Set(analysisData.map(c => c.trading_unit_id).filter(Boolean)).size;
  const settlementVolume = Math.round(totalVolume * 0.72);
  const remainingPosition = totalVolume - settlementVolume;

  // Generate 24-hour position data for analysis charts
  const positionData: ContractAnalysisData[] = Array.from({ length: 24 }, (_, i) => {
    const hourVolume = totalVolume / 24;
    const settlementRatio = 0.7 + Math.random() * 0.2;
    const marketPriceBase = weightedAvgPrice * (0.95 + Math.random() * 0.1);
    return {
      hour: `${i.toString().padStart(2, '0')}:00`,
      volume: hourVolume * (0.8 + Math.random() * 0.4),
      avgPrice: weightedAvgPrice * (0.9 + Math.random() * 0.2),
      marketPrice: marketPriceBase,
      contracts: Math.ceil(totalContracts / 24 * (0.5 + Math.random())),
      productionForecast: hourVolume * (0.85 + Math.random() * 0.3),
      settlementVolume: hourVolume * settlementRatio,
    };
  });

  // Generate yearly position data (12 months)
  const yearlyData: YearlyPositionData[] = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}月`,
    volume: (totalVolume / 12) * (0.8 + Math.random() * 0.4),
    avgPrice: weightedAvgPrice * (0.9 + Math.random() * 0.2),
    marketPrice: weightedAvgPrice * (0.95 + Math.random() * 0.1),
    settled: (totalVolume / 12) * (0.6 + Math.random() * 0.3),
    remaining: (totalVolume / 12) * (0.1 + Math.random() * 0.2),
  }));

  // Generate multi-day position data (14 days)
  const multiDayData: MultiDayPositionData[] = Array.from({ length: 14 }, (_, i) => ({
    date: `12/${(i + 1).toString().padStart(2, '0')}`,
    volume: (totalVolume / 30) * (0.8 + Math.random() * 0.4),
    avgPrice: weightedAvgPrice * (0.9 + Math.random() * 0.2),
    marketPrice: weightedAvgPrice * (0.95 + Math.random() * 0.1),
    settled: (totalVolume / 30) * (0.7 + Math.random() * 0.2),
  }));

  return {
    contracts: analysisData,
    positionData,
    yearlyData,
    multiDayData,
    metrics: {
      totalContracts,
      totalVolume,
      weightedAvgPrice,
      uniqueUnits,
      settlementVolume,
      remainingPosition,
    },
    isLoading,
    error,
  };
};

// Hook for contract time series data
export const useContractTimeSeries = (contractId?: string) => {
  return useQuery({
    queryKey: ["contract_time_series", contractId],
    queryFn: async () => {
      if (!contractId) return [];

      const { data, error } = await supabase
        .from("contract_time_series")
        .select("*")
        .eq("contract_id", contractId)
        .order("effective_date", { ascending: true })
        .order("time_point", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!contractId,
  });
};

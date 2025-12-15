import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

// 获取电站统计数据
export const usePowerStationStats = () => {
  return useQuery({
    queryKey: ["dashboard-station-stats"],
    queryFn: async () => {
      const { data: stations, error } = await supabase
        .from("power_stations")
        .select("id, name, province, installed_capacity, station_type, is_active")
        .eq("is_active", true);

      if (error) throw error;

      // 计算总装机容量
      const totalCapacity = stations?.reduce((sum, s) => sum + (s.installed_capacity || 0), 0) || 0;
      const stationCount = stations?.length || 0;

      // 按省份分组
      const byProvince = stations?.reduce((acc, s) => {
        const province = s.province || "未知";
        if (!acc[province]) {
          acc[province] = { capacity: 0, count: 0, stations: [] };
        }
        acc[province].capacity += s.installed_capacity || 0;
        acc[province].count += 1;
        acc[province].stations.push(s);
        return acc;
      }, {} as Record<string, { capacity: number; count: number; stations: any[] }>);

      return {
        totalCapacity,
        stationCount,
        byProvince,
        stations: stations || [],
      };
    },
  });
};

// 获取结算统计数据
export const useSettlementStats = () => {
  const currentMonth = format(new Date(), "yyyy-MM");
  
  return useQuery({
    queryKey: ["dashboard-settlement-stats", currentMonth],
    queryFn: async () => {
      const { data: records, error } = await supabase
        .from("settlement_records")
        .select("*")
        .eq("settlement_month", currentMonth);

      if (error) throw error;

      // 按类别分组计算
      const byCategory = records?.reduce((acc, r) => {
        const category = r.category || "其他";
        if (!acc[category]) {
          acc[category] = { volume: 0, amount: 0, count: 0 };
        }
        acc[category].volume += r.volume || 0;
        acc[category].amount += r.amount || 0;
        acc[category].count += 1;
        return acc;
      }, {} as Record<string, { volume: number; amount: number; count: number }>);

      // 计算总量
      const totalVolume = records?.reduce((sum, r) => sum + (r.volume || 0), 0) || 0;
      const totalAmount = records?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      // 转换为分项量价费数据格式
      const settlementData = Object.entries(byCategory || {}).map(([type, data]) => ({
        type,
        volume: Number((data.volume / 10000).toFixed(2)), // 转换为万kWh
        avgPrice: data.volume > 0 ? Number((data.amount / data.volume * 1000).toFixed(1)) : 0,
        cost: Number((data.amount / 10000).toFixed(2)), // 转换为万元
        ratio: totalVolume > 0 ? Number((data.volume / totalVolume * 100).toFixed(1)) : 0,
      }));

      return {
        totalVolume: Number((totalVolume / 10000).toFixed(2)), // 万kWh
        totalAmount: Number((totalAmount / 10000).toFixed(2)), // 万元
        unitRevenue: totalVolume > 0 ? Number((totalAmount / totalVolume).toFixed(2)) : 0, // 元/kWh
        settlementData,
        records: records || [],
      };
    },
  });
};

// 获取出清数据（用于现货交易图表）
export const useClearingStats = () => {
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["dashboard-clearing-stats", startDate, endDate],
    queryFn: async () => {
      const { data: records, error } = await supabase
        .from("clearing_records")
        .select("*")
        .gte("clearing_date", startDate)
        .lte("clearing_date", endDate)
        .order("clearing_date", { ascending: true });

      if (error) throw error;

      // 按日期分组聚合
      const byDate = records?.reduce((acc, r) => {
        const date = format(new Date(r.clearing_date), "MM-dd");
        if (!acc[date]) {
          acc[date] = {
            dayAheadVolume: 0,
            realTimeVolume: 0,
            dayAheadPrice: [],
            realTimePrice: [],
          };
        }
        if (r.day_ahead_clear_volume) acc[date].dayAheadVolume += r.day_ahead_clear_volume;
        if (r.realtime_clear_volume) acc[date].realTimeVolume += r.realtime_clear_volume;
        if (r.day_ahead_clear_price) acc[date].dayAheadPrice.push(r.day_ahead_clear_price);
        if (r.realtime_clear_price) acc[date].realTimePrice.push(r.realtime_clear_price);
        return acc;
      }, {} as Record<string, { dayAheadVolume: number; realTimeVolume: number; dayAheadPrice: number[]; realTimePrice: number[] }>);

      // 转换为图表数据格式（取最近5个日期）
      const spotTradingData = Object.entries(byDate || {})
        .slice(-5)
        .map(([date, data]) => ({
          date,
          dayAheadVolume: Number((data.dayAheadVolume / 1000).toFixed(1)), // MWh
          realTimeVolume: Number((data.realTimeVolume / 1000).toFixed(1)),
          dayAheadPrice: data.dayAheadPrice.length > 0 
            ? Math.round(data.dayAheadPrice.reduce((a, b) => a + b, 0) / data.dayAheadPrice.length)
            : 0,
          realTimePrice: data.realTimePrice.length > 0
            ? Math.round(data.realTimePrice.reduce((a, b) => a + b, 0) / data.realTimePrice.length)
            : 0,
        }));

      return {
        spotTradingData,
        records: records || [],
      };
    },
  });
};

// 获取市场价格数据（用于供需预测图表）
export const useMarketPriceStats = () => {
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["dashboard-market-price-stats", startDate, endDate],
    queryFn: async () => {
      const { data: prices, error } = await supabase
        .from("market_clearing_prices")
        .select("*")
        .gte("price_date", startDate)
        .lte("price_date", endDate)
        .order("price_date", { ascending: true });

      if (error) throw error;

      // 按日期分组计算平均价格
      const byDate = prices?.reduce((acc, p) => {
        const date = format(new Date(p.price_date), "MM-dd");
        if (!acc[date]) {
          acc[date] = { dayAhead: [], realtime: [] };
        }
        if (p.day_ahead_price) acc[date].dayAhead.push(p.day_ahead_price);
        if (p.realtime_price) acc[date].realtime.push(p.realtime_price);
        return acc;
      }, {} as Record<string, { dayAhead: number[]; realtime: number[] }>);

      // 转换为供需预测数据格式（取最近7个日期）
      const supplyDemandData = Object.entries(byDate || {})
        .slice(-7)
        .map(([date, data]) => {
          const avgDayAhead = data.dayAhead.length > 0
            ? data.dayAhead.reduce((a, b) => a + b, 0) / data.dayAhead.length
            : 0;
          // 使用价格估算负荷和出力（简化模型）
          const baseLoad = 200000;
          const renewableOutput = Math.round(baseLoad * (1 - avgDayAhead / 1000));
          const userLoad = Math.round(baseLoad + avgDayAhead * 50);
          return {
            date,
            renewableOutput: Math.max(150000, renewableOutput),
            userLoad: Math.max(180000, userLoad),
          };
        });

      return {
        supplyDemandData,
        prices: prices || [],
      };
    },
  });
};

// 获取交易单元数据（用于省份汇总）
export const useTradingUnitStats = () => {
  return useQuery({
    queryKey: ["dashboard-trading-unit-stats"],
    queryFn: async () => {
      const { data: units, error: unitsError } = await supabase
        .from("trading_units")
        .select(`
          id, 
          unit_name, 
          unit_code, 
          trading_center, 
          registered_capacity,
          is_active,
          station_id,
          power_stations!trading_units_station_id_fkey (
            id,
            name,
            province,
            installed_capacity
          )
        `)
        .eq("is_active", true);

      if (unitsError) throw unitsError;

      // 按省份分组
      const byProvince = units?.reduce((acc, u) => {
        const station = u.power_stations as any;
        const province = station?.province || "未知";
        if (!acc[province]) {
          acc[province] = {
            name: province,
            capacity: 0,
            generation: 0,
            revenue: 0,
            units: [],
          };
        }
        acc[province].capacity += station?.installed_capacity || u.registered_capacity || 0;
        // 模拟发电量和收入（实际应从结算数据获取）
        acc[province].generation += (station?.installed_capacity || 0) * 8.5;
        acc[province].revenue += (station?.installed_capacity || 0) * 1.1;
        acc[province].units.push(u);
        return acc;
      }, {} as Record<string, { name: string; capacity: number; generation: number; revenue: number; units: any[] }>);

      const provinceSummaryData = Object.values(byProvince || {}).map((p, i) => ({
        ...p,
        color: ["hsl(200, 80%, 50%)", "hsl(149, 80%, 45%)", "hsl(45, 100%, 50%)"][i % 3],
      }));

      return {
        provinceSummaryData,
        units: units || [],
      };
    },
  });
};

// 组合 hook - 获取所有 Dashboard 数据
export const useDashboardData = () => {
  const stationStats = usePowerStationStats();
  const settlementStats = useSettlementStats();
  const clearingStats = useClearingStats();
  const marketPriceStats = useMarketPriceStats();
  const tradingUnitStats = useTradingUnitStats();

  const isLoading = 
    stationStats.isLoading || 
    settlementStats.isLoading || 
    clearingStats.isLoading ||
    marketPriceStats.isLoading ||
    tradingUnitStats.isLoading;

  const isError = 
    stationStats.isError || 
    settlementStats.isError || 
    clearingStats.isError ||
    marketPriceStats.isError ||
    tradingUnitStats.isError;

  return {
    isLoading,
    isError,
    stationStats: stationStats.data,
    settlementStats: settlementStats.data,
    clearingStats: clearingStats.data,
    marketPriceStats: marketPriceStats.data,
    tradingUnitStats: tradingUnitStats.data,
  };
};

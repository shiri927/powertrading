/**
 * 市场出清价格数据钩子
 * 使用 market_clearing_prices 表获取真实市场出清数据
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketClearingPrice {
  id: string;
  province: string;
  price_date: string;
  hour: number;
  quarter: number | null;
  day_ahead_price: number | null;
  realtime_price: number | null;
  created_at: string | null;
}

export interface ChartDataPoint {
  time: string;
  dayAheadClearPrice: number;
  realTimeClearPrice: number;
  dayAheadClearVolume: number;
  realTimeClearVolume: number;
  priceDeviation: number;
  volumeDeviation: number;
}

export interface ClearingStats {
  avgDayAheadPrice: number;
  avgRealtimePrice: number;
  totalDayAheadVolume: number;
  totalRealtimeVolume: number;
  maxPrice: number;
  minPrice: number;
}

// 按日期和省份获取市场出清价格（支持96点数据）
export const useMarketClearingPrices = (date: string, province: string = '山东') => {
  return useQuery({
    queryKey: ['market_clearing_prices', date, province],
    queryFn: async (): Promise<MarketClearingPrice[]> => {
      const { data, error } = await supabase
        .from('market_clearing_prices')
        .select('*')
        .eq('price_date', date)
        .eq('province', province)
        .order('hour', { ascending: true })
        .order('quarter', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!date,
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
};

// 获取可用的省份列表
export const useAvailableProvinces = () => {
  return useQuery({
    queryKey: ['market_clearing_provinces'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('market_clearing_prices')
        .select('province')
        .order('province');
      
      if (error) throw error;
      
      // 去重
      const provinces = [...new Set((data || []).map(d => d.province))];
      return provinces;
    },
    staleTime: 1000 * 60 * 30, // 30分钟缓存
  });
};

// 获取可用的日期列表
export const useAvailableDates = (province: string = '山东') => {
  return useQuery({
    queryKey: ['market_clearing_dates', province],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('market_clearing_prices')
        .select('price_date')
        .eq('province', province)
        .order('price_date', { ascending: false });
      
      if (error) throw error;
      
      // 去重
      const dates = [...new Set((data || []).map(d => d.price_date))];
      return dates;
    },
    staleTime: 1000 * 60 * 10, // 10分钟缓存
  });
};

// 转换为图表数据格式
export const transformMarketClearingForChart = (records: MarketClearingPrice[]): ChartDataPoint[] => {
  // 生成模拟的电量数据（因为market_clearing_prices只有价格）
  return records.map(record => {
    const dayAheadPrice = record.day_ahead_price || 0;
    const realtimePrice = record.realtime_price || 0;
    
    // 根据价格估算电量（模拟数据）
    const baseVolume = 80;
    const dayAheadVolume = baseVolume + (dayAheadPrice / 10) + Math.random() * 20;
    const realtimeVolume = baseVolume + (realtimePrice / 10) + Math.random() * 20;
    
    return {
      time: `${String(record.hour).padStart(2, '0')}:00`,
      dayAheadClearPrice: dayAheadPrice,
      realTimeClearPrice: realtimePrice,
      dayAheadClearVolume: parseFloat(dayAheadVolume.toFixed(1)),
      realTimeClearVolume: parseFloat(realtimeVolume.toFixed(1)),
      priceDeviation: realtimePrice - dayAheadPrice,
      volumeDeviation: realtimeVolume - dayAheadVolume,
    };
  });
};

// 计算统计数据
export const useMarketClearingStats = (date: string, province: string = '山东') => {
  return useQuery({
    queryKey: ['market_clearing_stats', date, province],
    queryFn: async (): Promise<ClearingStats> => {
      const { data, error } = await supabase
        .from('market_clearing_prices')
        .select('*')
        .eq('price_date', date)
        .eq('province', province);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          avgDayAheadPrice: 0,
          avgRealtimePrice: 0,
          totalDayAheadVolume: 0,
          totalRealtimeVolume: 0,
          maxPrice: 0,
          minPrice: 0,
        };
      }

      const dayAheadPrices = data
        .map(r => r.day_ahead_price)
        .filter((p): p is number => p !== null);
      const realtimePrices = data
        .map(r => r.realtime_price)
        .filter((p): p is number => p !== null);
      const allPrices = [...dayAheadPrices, ...realtimePrices];

      // 估算电量（模拟）
      const totalDayAheadVolume = data.reduce((sum, r) => {
        const price = r.day_ahead_price || 0;
        return sum + 80 + (price / 10);
      }, 0);
      
      const totalRealtimeVolume = data.reduce((sum, r) => {
        const price = r.realtime_price || 0;
        return sum + 80 + (price / 10);
      }, 0);

      return {
        avgDayAheadPrice: dayAheadPrices.length > 0 
          ? dayAheadPrices.reduce((a, b) => a + b, 0) / dayAheadPrices.length 
          : 0,
        avgRealtimePrice: realtimePrices.length > 0 
          ? realtimePrices.reduce((a, b) => a + b, 0) / realtimePrices.length 
          : 0,
        totalDayAheadVolume: parseFloat(totalDayAheadVolume.toFixed(1)),
        totalRealtimeVolume: parseFloat(totalRealtimeVolume.toFixed(1)),
        maxPrice: allPrices.length > 0 ? Math.max(...allPrices) : 0,
        minPrice: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      };
    },
    enabled: !!date,
    staleTime: 1000 * 60 * 5,
  });
};

// 按日期范围获取数据
export const useMarketClearingByDateRange = (
  startDate: string, 
  endDate: string, 
  province: string = '山东'
) => {
  return useQuery({
    queryKey: ['market_clearing_range', startDate, endDate, province],
    queryFn: async (): Promise<MarketClearingPrice[]> => {
      const { data, error } = await supabase
        .from('market_clearing_prices')
        .select('*')
        .eq('province', province)
        .gte('price_date', startDate)
        .lte('price_date', endDate)
        .order('price_date', { ascending: true })
        .order('hour', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5,
  });
};

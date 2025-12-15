/**
 * 中长期行情数据钩子
 * 从medium_long_term_prices和price_distribution表获取市场交易数据
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths } from 'date-fns';

export interface MediumLongTermPrice {
  id: string;
  province: string;
  trade_date: string;
  trade_month: string;
  transaction_type: 'centralized' | 'rolling' | 'bilateral' | 'listing';
  avg_price: number | null;
  thermal_price: number | null;
  renewable_price: number | null;
  max_price: number | null;
  min_price: number | null;
  volume: number | null;
  buy_volume: number | null;
  sell_volume: number | null;
  matched_volume: number | null;
  success_rate: number | null;
  participants: number | null;
  created_at: string;
}

export interface PriceDistribution {
  id: string;
  province: string;
  trade_month: string;
  transaction_type: string;
  price_range_start: number;
  price_range_end: number;
  count: number;
}

// 历史序列价格数据 - 按月聚合各交易类型价格
export const useHistoricalPriceData = (months: number = 12, province: string = '山东') => {
  return useQuery({
    queryKey: ['medium_long_term', 'historical', months, province],
    queryFn: async () => {
      const startDate = format(subMonths(new Date(), months), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('medium_long_term_prices')
        .select('*')
        .eq('province', province)
        .gte('trade_date', startDate)
        .order('trade_date', { ascending: true });

      if (error) throw error;

      // 按月份聚合数据
      const monthlyData: Record<string, {
        month: string;
        centralized: number;
        rolling: number;
        bilateral: number;
        listing: number;
        volume: number;
      }> = {};

      (data || []).forEach((item) => {
        const month = item.trade_month;
        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            centralized: 0,
            rolling: 0,
            bilateral: 0,
            listing: 0,
            volume: 0,
          };
        }
        
        const price = Number(item.avg_price) || 0;
        const volume = Number(item.volume) || 0;
        
        switch (item.transaction_type) {
          case 'centralized':
            monthlyData[month].centralized = price;
            break;
          case 'rolling':
            monthlyData[month].rolling = price;
            break;
          case 'bilateral':
            monthlyData[month].bilateral = price;
            break;
          case 'listing':
            monthlyData[month].listing = price;
            break;
        }
        monthlyData[month].volume += volume;
      });

      return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    },
  });
};

// 集中竞价分析数据
export const useCentralizedBiddingData = (months: number = 12, province: string = '山东') => {
  return useQuery({
    queryKey: ['medium_long_term', 'centralized', months, province],
    queryFn: async () => {
      const startDate = format(subMonths(new Date(), months), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('medium_long_term_prices')
        .select('*')
        .eq('province', province)
        .eq('transaction_type', 'centralized')
        .gte('trade_date', startDate)
        .order('trade_date', { ascending: true });

      if (error) throw error;

      // 按月份聚合
      const monthlyData: Record<string, {
        month: string;
        thermalPrice: number;
        renewablePrice: number;
        avgPrice: number;
        volume: number;
        participants: number;
      }> = {};

      (data || []).forEach((item) => {
        const month = item.trade_month;
        monthlyData[month] = {
          month,
          thermalPrice: Number(item.thermal_price) || 0,
          renewablePrice: Number(item.renewable_price) || 0,
          avgPrice: Number(item.avg_price) || 0,
          volume: Number(item.volume) || 0,
          participants: Number(item.participants) || 0,
        };
      });

      return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    },
  });
};

// 滚动撮合分析数据
export const useRollingMatchData = (days: number = 30, province: string = '山东') => {
  return useQuery({
    queryKey: ['medium_long_term', 'rolling', days, province],
    queryFn: async () => {
      const startDate = format(new Date(Date.now() - days * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('medium_long_term_prices')
        .select('*')
        .eq('province', province)
        .eq('transaction_type', 'rolling')
        .gte('trade_date', startDate)
        .order('trade_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((item) => ({
        date: format(new Date(item.trade_date), 'MM-dd'),
        successRate: Number(item.success_rate) || 0,
        avgPrice: Number(item.avg_price) || 0,
        buyVolume: Number(item.buy_volume) || 0,
        sellVolume: Number(item.sell_volume) || 0,
        matchedVolume: Number(item.matched_volume) || 0,
      }));
    },
  });
};

// 市场成交汇总数据
export const useMarketSummaryData = (months: number = 12, province: string = '山东') => {
  return useQuery({
    queryKey: ['medium_long_term', 'summary', months, province],
    queryFn: async () => {
      const startDate = format(subMonths(new Date(), months), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('medium_long_term_prices')
        .select('*')
        .eq('province', province)
        .gte('trade_date', startDate)
        .order('trade_date', { ascending: true });

      if (error) throw error;

      // 按月份聚合所有交易类型
      const monthlyData: Record<string, {
        month: string;
        centralized: number;
        rolling: number;
        bilateral: number;
        listing: number;
        total: number;
        avgPrice: number;
      }> = {};

      (data || []).forEach((item) => {
        const month = item.trade_month;
        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            centralized: 0,
            rolling: 0,
            bilateral: 0,
            listing: 0,
            total: 0,
            avgPrice: 0,
          };
        }
        
        const volume = Number(item.volume) || 0;
        const price = Number(item.avg_price) || 0;
        
        switch (item.transaction_type) {
          case 'centralized':
            monthlyData[month].centralized = volume;
            break;
          case 'rolling':
            monthlyData[month].rolling = volume;
            break;
          case 'bilateral':
            monthlyData[month].bilateral = volume;
            break;
          case 'listing':
            monthlyData[month].listing = volume;
            break;
        }
        monthlyData[month].total += volume;
        // 简化处理：使用最后一个价格作为月度均价
        if (price > 0) {
          monthlyData[month].avgPrice = price;
        }
      });

      return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    },
  });
};

// 价格分布数据
export const usePriceDistributionData = (month?: string, province: string = '山东') => {
  return useQuery({
    queryKey: ['price_distribution', month, province],
    queryFn: async () => {
      const targetMonth = month || format(new Date(), 'yyyy-MM');
      
      const { data, error } = await supabase
        .from('price_distribution')
        .select('*')
        .eq('province', province)
        .eq('trade_month', targetMonth)
        .order('price_range_start', { ascending: true });

      if (error) throw error;

      // 按价格区间聚合
      const distributionMap: Record<string, {
        priceRange: string;
        centralized: number;
        rolling: number;
      }> = {};

      (data || []).forEach((item) => {
        const rangeKey = `${item.price_range_start}-${item.price_range_end}`;
        if (!distributionMap[rangeKey]) {
          distributionMap[rangeKey] = {
            priceRange: rangeKey,
            centralized: 0,
            rolling: 0,
          };
        }
        
        if (item.transaction_type === 'centralized') {
          distributionMap[rangeKey].centralized = Number(item.count) || 0;
        } else if (item.transaction_type === 'rolling') {
          distributionMap[rangeKey].rolling = Number(item.count) || 0;
        }
      });

      return Object.values(distributionMap);
    },
  });
};

// 计算汇总指标
export const useSummaryMetrics = (province: string = '山东') => {
  const { data: summaryData } = useMarketSummaryData(12, province);
  
  if (!summaryData || summaryData.length === 0) {
    return {
      monthlyVolume: '0',
      yearlyVolume: '0',
      avgPrice: '0.00',
      centralizedRatio: '0.0',
    };
  }

  const lastMonth = summaryData[summaryData.length - 1];
  const totalVolume = summaryData.reduce((sum, d) => sum + d.total, 0);
  const avgPrice = summaryData.reduce((sum, d) => sum + d.avgPrice, 0) / summaryData.length;

  return {
    monthlyVolume: lastMonth.total.toFixed(0),
    yearlyVolume: totalVolume.toFixed(0),
    avgPrice: avgPrice.toFixed(2),
    centralizedRatio: lastMonth.total > 0 
      ? ((lastMonth.centralized / lastMonth.total) * 100).toFixed(1)
      : '0.0',
  };
};

/**
 * 出清记录数据钩子
 * 实现出清数据与数据库联动
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClearingRecord {
  id: string;
  bid_id: string | null;
  trading_unit_id: string | null;
  clearing_date: string;
  hour: number;
  day_ahead_clear_price: number | null;
  realtime_clear_price: number | null;
  day_ahead_clear_volume: number | null;
  realtime_clear_volume: number | null;
  status: string;
  trading_type: string;
  created_at: string;
  trading_unit?: {
    id: string;
    unit_name: string;
    unit_code: string;
    trading_center: string;
  };
}

// 按日期获取出清记录
export const useClearingRecordsByDate = (date: string) => {
  return useQuery({
    queryKey: ['clearing_records', 'date', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clearing_records')
        .select(`
          *,
          trading_unit:trading_units(id, unit_name, unit_code, trading_center)
        `)
        .eq('clearing_date', date)
        .order('hour', { ascending: true });
      
      if (error) throw error;
      return data as ClearingRecord[];
    },
    enabled: !!date,
  });
};

// 按交易单元和日期范围获取出清记录
export const useClearingRecordsByUnit = (
  tradingUnitId: string | null, 
  startDate: string, 
  endDate: string
) => {
  return useQuery({
    queryKey: ['clearing_records', 'unit', tradingUnitId, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('clearing_records')
        .select(`
          *,
          trading_unit:trading_units(id, unit_name, unit_code, trading_center)
        `)
        .gte('clearing_date', startDate)
        .lte('clearing_date', endDate)
        .order('clearing_date', { ascending: true })
        .order('hour', { ascending: true });
      
      if (tradingUnitId) {
        query = query.eq('trading_unit_id', tradingUnitId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ClearingRecord[];
    },
    enabled: !!startDate && !!endDate,
  });
};

// 获取出清统计数据
export const useClearingStats = (date: string) => {
  return useQuery({
    queryKey: ['clearing_stats', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clearing_records')
        .select('*')
        .eq('clearing_date', date);
      
      if (error) throw error;
      
      const records = data || [];
      
      // 计算统计指标
      const dayAheadPrices = records.map(r => r.day_ahead_clear_price).filter(Boolean) as number[];
      const realtimePrices = records.map(r => r.realtime_clear_price).filter(Boolean) as number[];
      const dayAheadVolumes = records.map(r => r.day_ahead_clear_volume).filter(Boolean) as number[];
      const realtimeVolumes = records.map(r => r.realtime_clear_volume).filter(Boolean) as number[];
      
      return {
        avgDayAheadPrice: dayAheadPrices.length ? dayAheadPrices.reduce((a, b) => a + b, 0) / dayAheadPrices.length : 0,
        avgRealtimePrice: realtimePrices.length ? realtimePrices.reduce((a, b) => a + b, 0) / realtimePrices.length : 0,
        totalDayAheadVolume: dayAheadVolumes.reduce((a, b) => a + b, 0),
        totalRealtimeVolume: realtimeVolumes.reduce((a, b) => a + b, 0),
        recordCount: records.length,
      };
    },
    enabled: !!date,
  });
};

// 将数据库记录转换为图表数据格式
export const transformClearingDataForChart = (records: ClearingRecord[]) => {
  return records.map(record => ({
    time: `${String(record.hour).padStart(2, '0')}:00`,
    dayAheadClearPrice: record.day_ahead_clear_price || 0,
    realTimeClearPrice: record.realtime_clear_price || 0,
    dayAheadClearVolume: record.day_ahead_clear_volume || 0,
    realTimeClearVolume: record.realtime_clear_volume || 0,
    priceDeviation: (record.realtime_clear_price || 0) - (record.day_ahead_clear_price || 0),
    volumeDeviation: (record.realtime_clear_volume || 0) - (record.day_ahead_clear_volume || 0),
  }));
};

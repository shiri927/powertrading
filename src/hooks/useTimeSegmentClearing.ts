import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TimeSegmentClearingRecord {
  id: string;
  trading_unit_id: string | null;
  clearing_date: string;
  trading_type: string;
  trading_sequence: string;
  period_start: number;
  period_end: number;
  bid_price: number | null;
  clear_price: number | null;
  clear_volume: number | null;
  status: string;
  clear_time: string | null;
  province: string;
  created_at: string;
  // Joined fields
  trading_unit_name?: string;
}

export interface TimeSegmentClearingFilters {
  date?: string;
  tradingType?: string;
  tradingUnit?: string;
  tradingSequence?: string;
  province?: string;
}

// 获取分时段交易出清数据
export function useTimeSegmentClearing(filters: TimeSegmentClearingFilters = {}) {
  return useQuery({
    queryKey: ['time-segment-clearing', filters],
    queryFn: async () => {
      let query = supabase
        .from('time_segment_clearing')
        .select(`
          *,
          trading_units:trading_unit_id (unit_name)
        `)
        .order('clearing_date', { ascending: false })
        .order('period_start', { ascending: true });

      if (filters.date) {
        query = query.eq('clearing_date', filters.date);
      }

      if (filters.tradingType && filters.tradingType !== 'all') {
        query = query.eq('trading_type', filters.tradingType);
      }

      if (filters.tradingUnit && filters.tradingUnit !== 'all') {
        query = query.eq('trading_unit_id', filters.tradingUnit);
      }

      if (filters.tradingSequence && filters.tradingSequence !== 'all') {
        query = query.eq('trading_sequence', filters.tradingSequence);
      }

      if (filters.province && filters.province !== 'all') {
        query = query.eq('province', filters.province);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include trading unit name
      return (data || []).map((record: any) => ({
        ...record,
        trading_unit_name: record.trading_units?.unit_name || '未知单元',
      })) as TimeSegmentClearingRecord[];
    },
  });
}

// 获取日期范围内的数据
export function useTimeSegmentClearingByDateRange(startDate: string, endDate: string, province?: string) {
  return useQuery({
    queryKey: ['time-segment-clearing-range', startDate, endDate, province],
    queryFn: async () => {
      let query = supabase
        .from('time_segment_clearing')
        .select(`
          *,
          trading_units:trading_unit_id (unit_name)
        `)
        .gte('clearing_date', startDate)
        .lte('clearing_date', endDate)
        .order('clearing_date', { ascending: true })
        .order('period_start', { ascending: true });

      if (province && province !== 'all') {
        query = query.eq('province', province);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((record: any) => ({
        ...record,
        trading_unit_name: record.trading_units?.unit_name || '未知单元',
      })) as TimeSegmentClearingRecord[];
    },
  });
}

// 获取统计数据
export function useTimeSegmentClearingStats(date: string, province?: string) {
  return useQuery({
    queryKey: ['time-segment-clearing-stats', date, province],
    queryFn: async () => {
      let query = supabase
        .from('time_segment_clearing')
        .select('*')
        .eq('clearing_date', date);

      if (province && province !== 'all') {
        query = query.eq('province', province);
      }

      const { data, error } = await query;

      if (error) throw error;

      const records = data || [];
      const clearedRecords = records.filter(r => r.status === 'cleared');
      const clearPrices = clearedRecords.map(r => r.clear_price).filter((p): p is number => p !== null);
      const clearVolumes = clearedRecords.map(r => r.clear_volume).filter((v): v is number => v !== null);

      return {
        totalVolume: clearVolumes.reduce((sum, v) => sum + v, 0),
        avgPrice: clearPrices.length > 0 ? clearPrices.reduce((sum, p) => sum + p, 0) / clearPrices.length : 0,
        successRate: records.length > 0 ? (clearedRecords.length / records.length) * 100 : 0,
        totalTransactions: records.length,
        clearedCount: clearedRecords.length,
        pendingCount: records.filter(r => r.status === 'pending').length,
      };
    },
  });
}

// 获取可用的交易序列
export function useAvailableTradingSequences() {
  return useQuery({
    queryKey: ['time-segment-trading-sequences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_segment_clearing')
        .select('trading_sequence')
        .order('trading_sequence');

      if (error) throw error;

      // Get unique sequences
      const sequences = [...new Set((data || []).map(d => d.trading_sequence))];
      return sequences.sort();
    },
  });
}

// 转换为表格显示格式
export function transformTimeSegmentForTable(records: TimeSegmentClearingRecord[]) {
  return records.map((record, index) => ({
    id: `T${(index + 1).toString().padStart(3, '0')}`,
    tradingType: record.trading_type,
    tradingUnit: record.trading_unit_name || '未知单元',
    tradingSequence: record.trading_sequence,
    period: `${record.period_start.toString().padStart(2, '0')}:00-${record.period_end.toString().padStart(2, '0')}:00`,
    clearPrice: record.clear_price || 0,
    clearVolume: record.clear_volume || 0,
    bidPrice: record.bid_price || 0,
    status: record.status === 'cleared' ? '已出清' : record.status === 'pending' ? '未出清' : '失败',
    clearTime: record.clear_time 
      ? new Date(record.clear_time).toLocaleString('zh-CN', { 
          year: 'numeric', month: '2-digit', day: '2-digit', 
          hour: '2-digit', minute: '2-digit' 
        }).replace(/\//g, '-')
      : '-',
  }));
}

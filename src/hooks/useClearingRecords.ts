/**
 * 出清记录数据钩子
 * 使用服务层实现出清数据与数据库联动，支持缓存和实时订阅
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { clearingService, ClearingRecord } from '@/lib/services/clearing-service';

export type { ClearingRecord } from '@/lib/services/clearing-service';

// 按日期获取出清记录
export const useClearingRecordsByDate = (date: string) => {
  const queryClient = useQueryClient();

  // 实时订阅
  useEffect(() => {
    if (!date) return;
    
    const unsubscribe = clearingService.subscribe(({ eventType }) => {
      if (eventType) {
        queryClient.invalidateQueries({ queryKey: ['clearing_records'] });
      }
    });

    return unsubscribe;
  }, [date, queryClient]);

  return useQuery({
    queryKey: ['clearing_records', 'date', date],
    queryFn: () => clearingService.getByDate(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 5, // 5分钟缓存
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
      const records = await clearingService.getByDateRange(startDate, endDate);
      // 按交易单元过滤
      if (tradingUnitId) {
        return records.filter(r => r.trading_unit_id === tradingUnitId);
      }
      return records;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5,
  });
};

// 获取出清统计数据
export const useClearingStats = (date: string) => {
  return useQuery({
    queryKey: ['clearing_stats', date],
    queryFn: () => clearingService.getDailyStatistics(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 5,
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

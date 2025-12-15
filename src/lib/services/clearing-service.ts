import { z } from 'zod';
import { ServiceError, cacheManager, createRealtimeSubscription } from './base-service';
import { supabase } from '@/integrations/supabase/client';

// 出清记录验证Schema
export const clearingCreateSchema = z.object({
  trading_unit_id: z.string().uuid().optional().nullable(),
  bid_id: z.string().uuid().optional().nullable(),
  clearing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式无效'),
  hour: z.number().min(1).max(24),
  trading_type: z.string().min(1),
  day_ahead_clear_price: z.number().optional().nullable(),
  realtime_clear_price: z.number().optional().nullable(),
  day_ahead_clear_volume: z.number().min(0).optional().nullable(),
  realtime_clear_volume: z.number().min(0).optional().nullable(),
  status: z.string().optional(),
});

export const clearingUpdateSchema = clearingCreateSchema.partial();

export interface ClearingRecord {
  id: string;
  trading_unit_id: string | null;
  bid_id: string | null;
  clearing_date: string;
  hour: number;
  trading_type: string;
  day_ahead_clear_price: number | null;
  realtime_clear_price: number | null;
  day_ahead_clear_volume: number | null;
  realtime_clear_volume: number | null;
  status: string;
  created_at: string;
}

type ClearingCreateDTO = z.infer<typeof clearingCreateSchema>;
type ClearingUpdateDTO = z.infer<typeof clearingUpdateSchema>;

export const clearingService = {
  // 按日期获取出清记录
  async getByDate(date: string): Promise<ClearingRecord[]> {
    const cacheKey = `clearing_records:date:${date}`;
    const cached = cacheManager.get<ClearingRecord[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('clearing_records')
      .select('*')
      .eq('clearing_date', date)
      .order('hour');

    if (error) throw new ServiceError('获取出清记录失败', 'FETCH_ERROR', error);
    cacheManager.set(cacheKey, data, 2 * 60 * 1000);
    return data;
  },

  // 按日期范围获取
  async getByDateRange(startDate: string, endDate: string): Promise<ClearingRecord[]> {
    const { data, error } = await supabase
      .from('clearing_records')
      .select('*')
      .gte('clearing_date', startDate)
      .lte('clearing_date', endDate)
      .order('clearing_date')
      .order('hour');

    if (error) throw new ServiceError('获取出清记录失败', 'FETCH_ERROR', error);
    return data;
  },

  // 创建记录
  async create(dto: ClearingCreateDTO): Promise<ClearingRecord> {
    const result = clearingCreateSchema.safeParse(dto);
    if (!result.success) {
      throw new ServiceError('数据验证失败', 'VALIDATION_ERROR', result.error.errors);
    }

    const { data, error } = await supabase
      .from('clearing_records')
      .insert([result.data] as any)
      .select()
      .single();

    if (error) throw new ServiceError('创建出清记录失败', 'CREATE_ERROR', error);
    cacheManager.invalidate('clearing_records:');
    return data;
  },

  // 获取日期统计
  async getDailyStatistics(date: string): Promise<{
    avgDayAheadPrice: number;
    avgRealtimePrice: number;
    totalDayAheadVolume: number;
    totalRealtimeVolume: number;
    maxPrice: number;
    minPrice: number;
  }> {
    const records = await this.getByDate(date);
    
    if (records.length === 0) {
      return {
        avgDayAheadPrice: 0,
        avgRealtimePrice: 0,
        totalDayAheadVolume: 0,
        totalRealtimeVolume: 0,
        maxPrice: 0,
        minPrice: 0,
      };
    }

    const dayAheadPrices = records
      .map(r => r.day_ahead_clear_price)
      .filter((p): p is number => p !== null);
    const realtimePrices = records
      .map(r => r.realtime_clear_price)
      .filter((p): p is number => p !== null);
    const allPrices = [...dayAheadPrices, ...realtimePrices];

    return {
      avgDayAheadPrice: dayAheadPrices.length > 0 
        ? dayAheadPrices.reduce((a, b) => a + b, 0) / dayAheadPrices.length 
        : 0,
      avgRealtimePrice: realtimePrices.length > 0 
        ? realtimePrices.reduce((a, b) => a + b, 0) / realtimePrices.length 
        : 0,
      totalDayAheadVolume: records.reduce((sum, r) => sum + (r.day_ahead_clear_volume || 0), 0),
      totalRealtimeVolume: records.reduce((sum, r) => sum + (r.realtime_clear_volume || 0), 0),
      maxPrice: allPrices.length > 0 ? Math.max(...allPrices) : 0,
      minPrice: allPrices.length > 0 ? Math.min(...allPrices) : 0,
    };
  },

  // 实时订阅
  subscribe(callback: (payload: { eventType: string; new: ClearingRecord | null; old: ClearingRecord | null }) => void) {
    return createRealtimeSubscription('clearing_records', callback);
  },
};

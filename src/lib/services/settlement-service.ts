import { z } from 'zod';
import { ServiceError, cacheManager, createRealtimeSubscription } from './base-service';
import { supabase } from '@/integrations/supabase/client';

// 结算记录验证Schema
export const settlementCreateSchema = z.object({
  trading_unit_id: z.string().uuid().optional().nullable(),
  settlement_no: z.string().min(1, '结算单号不能为空').max(50),
  settlement_month: z.string().regex(/^\d{4}-\d{2}$/, '结算月份格式无效'),
  category: z.string().min(1),
  sub_category: z.string().optional().nullable(),
  side: z.string().min(1),
  volume: z.number().min(0, '电量不能为负'),
  price: z.number().optional().nullable(),
  amount: z.number(),
  status: z.string().optional(),
  remark: z.string().max(500).optional().nullable(),
});

export const settlementUpdateSchema = settlementCreateSchema.partial();

export interface SettlementRecord {
  id: string;
  trading_unit_id: string | null;
  settlement_no: string;
  settlement_month: string;
  category: string;
  sub_category: string | null;
  side: string;
  volume: number;
  price: number | null;
  amount: number;
  status: string;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

type SettlementCreateDTO = z.infer<typeof settlementCreateSchema>;
type SettlementUpdateDTO = z.infer<typeof settlementUpdateSchema>;

export const settlementService = {
  // 按月份获取结算记录
  async getByMonth(month: string): Promise<SettlementRecord[]> {
    const cacheKey = `settlement_records:month:${month}`;
    const cached = cacheManager.get<SettlementRecord[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('settlement_records')
      .select('*')
      .eq('settlement_month', month)
      .order('category')
      .order('created_at');

    if (error) throw new ServiceError('获取结算记录失败', 'FETCH_ERROR', error);
    cacheManager.set(cacheKey, data);
    return data;
  },

  // 按交易单元获取
  async getByTradingUnit(tradingUnitId: string, startMonth?: string, endMonth?: string): Promise<SettlementRecord[]> {
    let query = supabase
      .from('settlement_records')
      .select('*')
      .eq('trading_unit_id', tradingUnitId);

    if (startMonth) query = query.gte('settlement_month', startMonth);
    if (endMonth) query = query.lte('settlement_month', endMonth);

    const { data, error } = await query.order('settlement_month', { ascending: false });

    if (error) throw new ServiceError('获取结算记录失败', 'FETCH_ERROR', error);
    return data;
  },

  // 创建结算记录
  async create(dto: SettlementCreateDTO): Promise<SettlementRecord> {
    const result = settlementCreateSchema.safeParse(dto);
    if (!result.success) {
      throw new ServiceError('数据验证失败', 'VALIDATION_ERROR', result.error.errors);
    }

    const { data, error } = await supabase
      .from('settlement_records')
      .insert(result.data)
      .select()
      .single();

    if (error) throw new ServiceError('创建结算记录失败', 'CREATE_ERROR', error);
    cacheManager.invalidate('settlement_records:');
    return data;
  },

  // 更新结算记录
  async update(id: string, dto: SettlementUpdateDTO): Promise<SettlementRecord> {
    const result = settlementUpdateSchema.safeParse(dto);
    if (!result.success) {
      throw new ServiceError('数据验证失败', 'VALIDATION_ERROR', result.error.errors);
    }

    const { data, error } = await supabase
      .from('settlement_records')
      .update(result.data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ServiceError('更新结算记录失败', 'UPDATE_ERROR', error);
    cacheManager.invalidate('settlement_records:');
    return data;
  },

  // 获取月度汇总统计
  async getMonthlyStatistics(month: string): Promise<{
    totalVolume: number;
    totalAmount: number;
    wholesaleAmount: number;
    retailAmount: number;
    categories: { category: string; volume: number; amount: number }[];
  }> {
    const records = await this.getByMonth(month);

    const categoryMap = new Map<string, { volume: number; amount: number }>();
    let wholesaleAmount = 0;
    let retailAmount = 0;

    records.forEach(record => {
      const existing = categoryMap.get(record.category) || { volume: 0, amount: 0 };
      categoryMap.set(record.category, {
        volume: existing.volume + record.volume,
        amount: existing.amount + record.amount,
      });

      if (record.side === 'wholesale') {
        wholesaleAmount += record.amount;
      } else {
        retailAmount += record.amount;
      }
    });

    return {
      totalVolume: records.reduce((sum, r) => sum + r.volume, 0),
      totalAmount: records.reduce((sum, r) => sum + r.amount, 0),
      wholesaleAmount,
      retailAmount,
      categories: Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        ...data,
      })),
    };
  },

  // 确认结算
  async confirmSettlement(id: string): Promise<SettlementRecord> {
    return this.update(id, { status: 'confirmed' });
  },

  // 批量确认
  async confirmMany(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('settlement_records')
      .update({ status: 'confirmed' })
      .in('id', ids);

    if (error) throw new ServiceError('批量确认失败', 'UPDATE_ERROR', error);
    cacheManager.invalidate('settlement_records:');
  },

  // 实时订阅
  subscribe(callback: (payload: { eventType: string; new: SettlementRecord | null; old: SettlementRecord | null }) => void) {
    return createRealtimeSubscription('settlement_records', callback);
  },
};

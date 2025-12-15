import { z } from 'zod';
import { ServiceError, cacheManager, createRealtimeSubscription } from './base-service';
import { supabase } from '@/integrations/supabase/client';

// 策略验证Schema
export const strategyCreateSchema = z.object({
  name: z.string().min(1, '策略名称不能为空').max(50),
  strategy_type: z.string().min(1),
  description: z.string().max(200).optional().nullable(),
  risk_level: z.string().min(1),
  expected_return: z.number().min(0).max(100).optional().nullable(),
  trigger_conditions: z.record(z.unknown()).optional().nullable(),
  trading_params: z.record(z.unknown()).optional().nullable(),
  risk_control: z.record(z.unknown()).optional().nullable(),
  is_active: z.boolean().optional(),
});

export const strategyUpdateSchema = strategyCreateSchema.partial();

export interface TradingStrategy {
  id: string;
  user_id: string | null;
  name: string;
  strategy_type: string;
  description: string | null;
  risk_level: string;
  expected_return: number | null;
  trigger_conditions: Record<string, unknown> | null;
  trading_params: Record<string, unknown> | null;
  risk_control: Record<string, unknown> | null;
  is_preset: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type StrategyCreateDTO = z.infer<typeof strategyCreateSchema>;
type StrategyUpdateDTO = z.infer<typeof strategyUpdateSchema>;

export const tradingStrategyService = {
  async getAll(): Promise<TradingStrategy[]> {
    const cacheKey = 'trading_strategies:all';
    const cached = cacheManager.get<TradingStrategy[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('trading_strategies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new ServiceError('获取策略列表失败', 'FETCH_ERROR', error);
    cacheManager.set(cacheKey, data);
    return data as TradingStrategy[];
  },

  async getById(id: string): Promise<TradingStrategy | null> {
    const { data, error } = await supabase
      .from('trading_strategies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new ServiceError('获取策略失败', 'FETCH_ERROR', error);
    return data as TradingStrategy | null;
  },

  async create(dto: StrategyCreateDTO): Promise<TradingStrategy> {
    const result = strategyCreateSchema.safeParse(dto);
    if (!result.success) {
      throw new ServiceError('数据验证失败', 'VALIDATION_ERROR', result.error.errors);
    }

    const { data: userData } = await supabase.auth.getUser();
    const insertData = { ...result.data, user_id: userData.user?.id || null, is_preset: false };

    const { data, error } = await supabase
      .from('trading_strategies')
      .insert([insertData] as any)
      .select()
      .single();

    if (error) throw new ServiceError('创建策略失败', 'CREATE_ERROR', error);
    cacheManager.invalidate('trading_strategies:');
    return data as TradingStrategy;
  },

  async update(id: string, dto: StrategyUpdateDTO): Promise<TradingStrategy> {
    const result = strategyUpdateSchema.safeParse(dto);
    if (!result.success) {
      throw new ServiceError('数据验证失败', 'VALIDATION_ERROR', result.error.errors);
    }

    const { data, error } = await supabase
      .from('trading_strategies')
      .update(result.data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ServiceError('更新策略失败', 'UPDATE_ERROR', error);
    cacheManager.invalidate('trading_strategies:');
    return data as TradingStrategy;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('trading_strategies').delete().eq('id', id);
    if (error) throw new ServiceError('删除策略失败', 'DELETE_ERROR', error);
    cacheManager.invalidate('trading_strategies:');
  },

  async toggleActive(id: string): Promise<TradingStrategy> {
    const strategy = await this.getById(id);
    if (!strategy) throw new ServiceError('策略不存在', 'NOT_FOUND');
    return this.update(id, { is_active: !strategy.is_active });
  },

  subscribe(callback: (payload: { eventType: string; new: TradingStrategy | null; old: TradingStrategy | null }) => void) {
    return createRealtimeSubscription('trading_strategies', callback);
  },
};

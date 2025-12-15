import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TradingStrategy, TriggerConditions, TradingParams, RiskControl } from '@/lib/trading/strategy-types';
import { toast } from 'sonner';

interface DbTradingStrategy {
  id: string;
  user_id: string | null;
  name: string;
  strategy_type: string;
  description: string | null;
  risk_level: string;
  expected_return: number | null;
  trigger_conditions: TriggerConditions | null;
  trading_params: TradingParams | null;
  risk_control: RiskControl | null;
  is_preset: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 数据库记录转换为前端策略对象
const mapDbToStrategy = (record: DbTradingStrategy): TradingStrategy => ({
  id: record.id,
  name: record.name,
  type: record.strategy_type as TradingStrategy['type'],
  description: record.description || '',
  riskLevel: record.risk_level as TradingStrategy['riskLevel'],
  expectedReturn: record.expected_return || 0,
  triggerConditions: record.trigger_conditions || {
    minP50Forecast: 0,
    minSpotPrice: 0,
    minConfidence: 0,
  },
  tradingParams: record.trading_params || {
    maxPosition: 100,
    singleTradeLimit: 50,
    dailyTradeLimit: 10,
  },
  riskControl: record.risk_control || {
    stopLoss: 5,
    takeProfit: 10,
    maxDrawdown: 10,
  },
  isActive: record.is_active,
});

// 前端策略对象转换为数据库记录
const mapStrategyToDb = (strategy: Omit<TradingStrategy, 'id'>) => ({
  name: strategy.name,
  strategy_type: strategy.type,
  description: strategy.description,
  risk_level: strategy.riskLevel,
  expected_return: strategy.expectedReturn,
  trigger_conditions: strategy.triggerConditions,
  trading_params: strategy.tradingParams,
  risk_control: strategy.riskControl,
  is_active: strategy.isActive,
  is_preset: false,
});

export function useTradingStrategies() {
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('trading_strategies')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedStrategies = (data || []).map((record) => 
        mapDbToStrategy(record as unknown as DbTradingStrategy)
      );
      setStrategies(mappedStrategies);
      setError(null);
    } catch (err) {
      console.error('获取策略失败:', err);
      setError('获取策略列表失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const createStrategy = async (strategy: Omit<TradingStrategy, 'id'>): Promise<TradingStrategy | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const insertData = {
        ...mapStrategyToDb(strategy),
        user_id: userData.user?.id || null,
      };

      const { data, error: insertError } = await supabase
        .from('trading_strategies')
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;

      const newStrategy = mapDbToStrategy(data as unknown as DbTradingStrategy);
      setStrategies(prev => [newStrategy, ...prev]);
      toast.success('策略创建成功');
      return newStrategy;
    } catch (err) {
      console.error('创建策略失败:', err);
      toast.error('创建策略失败');
      return null;
    }
  };

  const updateStrategy = async (id: string, updates: Partial<TradingStrategy>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.strategy_type = updates.type;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.riskLevel !== undefined) updateData.risk_level = updates.riskLevel;
      if (updates.expectedReturn !== undefined) updateData.expected_return = updates.expectedReturn;
      if (updates.triggerConditions !== undefined) updateData.trigger_conditions = updates.triggerConditions;
      if (updates.tradingParams !== undefined) updateData.trading_params = updates.tradingParams;
      if (updates.riskControl !== undefined) updateData.risk_control = updates.riskControl;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error: updateError } = await supabase
        .from('trading_strategies')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      setStrategies(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      toast.success('策略更新成功');
      return true;
    } catch (err) {
      console.error('更新策略失败:', err);
      toast.error('更新策略失败');
      return false;
    }
  };

  const deleteStrategy = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('trading_strategies')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setStrategies(prev => prev.filter(s => s.id !== id));
      toast.success('策略已删除');
      return true;
    } catch (err) {
      console.error('删除策略失败:', err);
      toast.error('删除策略失败');
      return false;
    }
  };

  const toggleActive = async (id: string): Promise<boolean> => {
    const strategy = strategies.find(s => s.id === id);
    if (!strategy) return false;
    return updateStrategy(id, { isActive: !strategy.isActive });
  };

  return {
    strategies,
    isLoading,
    error,
    fetchStrategies,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    toggleActive,
  };
}

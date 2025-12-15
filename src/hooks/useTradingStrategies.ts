/**
 * 交易策略数据钩子
 * 使用服务层实现策略CRUD操作，支持缓存和实时订阅
 */

import { useState, useEffect, useCallback } from 'react';
import { tradingStrategyService, TradingStrategy as DbTradingStrategy } from '@/lib/services/trading-strategy-service';
import { TradingStrategy, TriggerConditions, TradingParams, RiskControl } from '@/lib/trading/strategy-types';
import { toast } from 'sonner';

// 数据库记录转换为前端策略对象
const mapDbToStrategy = (record: DbTradingStrategy): TradingStrategy => ({
  id: record.id,
  name: record.name,
  type: record.strategy_type as TradingStrategy['type'],
  description: record.description || '',
  riskLevel: record.risk_level as TradingStrategy['riskLevel'],
  expectedReturn: record.expected_return || 0,
  triggerConditions: (record.trigger_conditions as TriggerConditions) || {
    minP50Forecast: 0,
    minSpotPrice: 0,
    minConfidence: 0,
  },
  tradingParams: (record.trading_params as TradingParams) || {
    maxPosition: 100,
    singleTradeLimit: 50,
    dailyTradeLimit: 10,
  },
  riskControl: (record.risk_control as RiskControl) || {
    stopLoss: 5,
    takeProfit: 10,
    maxDrawdown: 10,
  },
  isActive: record.is_active,
});

// 前端策略对象转换为数据库记录格式
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
});

export function useTradingStrategies() {
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await tradingStrategyService.getAll();
      const mappedStrategies = data.map(mapDbToStrategy);
      setStrategies(mappedStrategies);
      setError(null);
    } catch (err) {
      console.error('获取策略失败:', err);
      setError('获取策略列表失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 实时订阅
  useEffect(() => {
    fetchStrategies();
    
    const unsubscribe = tradingStrategyService.subscribe(({ eventType }) => {
      if (eventType) {
        fetchStrategies();
      }
    });

    return unsubscribe;
  }, [fetchStrategies]);

  const createStrategy = async (strategy: Omit<TradingStrategy, 'id'>): Promise<TradingStrategy | null> => {
    try {
      const data = await tradingStrategyService.create(mapStrategyToDb(strategy));
      const newStrategy = mapDbToStrategy(data);
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

      await tradingStrategyService.update(id, updateData);
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
      await tradingStrategyService.delete(id);
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

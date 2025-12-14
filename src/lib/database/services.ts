/**
 * 数据库服务层
 * 提供统一的数据访问接口，实现前后端联动
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  PowerStation,
  TradingUnit,
  Contract,
  TradingCalendar,
  TradingBid,
  ClearingRecord,
  SettlementRecord,
  SettlementStatement,
  Customer,
  EnergyUsage,
  PackageSimulation,
  ExecutionRecord,
  TradingStrategy,
  BacktestResult,
  StrategyRecommendation,
  LoadPrediction,
  PricePrediction,
} from './schema';

// =============================================
// 场站管理服务
// =============================================

export const stationService = {
  async getAll(): Promise<PowerStation[]> {
    const { data, error } = await supabase
      .from('power_stations')
      .select('*')
      .order('province', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as PowerStation[];
  },

  async getByProvince(province: string): Promise<PowerStation[]> {
    const { data, error } = await supabase
      .from('power_stations')
      .select('*')
      .eq('province', province)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as PowerStation[];
  },

  async getById(id: string): Promise<PowerStation | null> {
    const { data, error } = await supabase
      .from('power_stations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as PowerStation | null;
  },
};

export const tradingUnitService = {
  async getAll(): Promise<TradingUnit[]> {
    const { data, error } = await supabase
      .from('trading_units')
      .select(`
        *,
        station:power_stations(*)
      `)
      .order('trading_center', { ascending: true })
      .order('unit_name', { ascending: true });
    
    if (error) throw error;
    return data as TradingUnit[];
  },

  async getByCategory(category: 'renewable' | 'retail'): Promise<TradingUnit[]> {
    const { data, error } = await supabase
      .from('trading_units')
      .select(`
        *,
        station:power_stations(*)
      `)
      .eq('trading_category', category)
      .order('unit_name', { ascending: true });
    
    if (error) throw error;
    return data as TradingUnit[];
  },

  async getByTradingCenter(center: string): Promise<TradingUnit[]> {
    const { data, error } = await supabase
      .from('trading_units')
      .select(`
        *,
        station:power_stations(*)
      `)
      .eq('trading_center', center)
      .order('unit_name', { ascending: true });
    
    if (error) throw error;
    return data as TradingUnit[];
  },
};

// =============================================
// 合同管理服务
// =============================================

export const contractService = {
  async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        trading_unit:trading_units(*)
      `)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data as Contract[];
  },

  async getByTradingUnit(tradingUnitId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('trading_unit_id', tradingUnitId)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data as Contract[];
  },

  async getActive(): Promise<Contract[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        trading_unit:trading_units(*)
      `)
      .eq('status', 'active')
      .gte('end_date', today);
    
    if (error) throw error;
    return data as Contract[];
  },
};

// =============================================
// 交易管理服务
// =============================================

export const tradingCalendarService = {
  async getByDateRange(startDate: string, endDate: string): Promise<TradingCalendar[]> {
    const { data, error } = await supabase
      .from('trading_calendar')
      .select('*')
      .gte('trading_date', startDate)
      .lte('trading_date', endDate)
      .order('trading_date', { ascending: true })
      .order('sequence_no', { ascending: true });
    
    if (error) throw error;
    return data as TradingCalendar[];
  },

  async getByTradingCenter(center: string): Promise<TradingCalendar[]> {
    const { data, error } = await supabase
      .from('trading_calendar')
      .select('*')
      .eq('trading_center', center)
      .order('trading_date', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data as TradingCalendar[];
  },
};

export const tradingBidService = {
  async getByUser(userId: string): Promise<TradingBid[]> {
    const { data, error } = await supabase
      .from('trading_bids')
      .select(`
        *,
        trading_unit:trading_units(*),
        calendar:trading_calendar(*)
      `)
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as TradingBid[];
  },

  async create(bid: Omit<TradingBid, 'id' | 'created_at' | 'updated_at'>): Promise<TradingBid> {
    const { data, error } = await supabase
      .from('trading_bids')
      .insert(bid)
      .select()
      .single();
    
    if (error) throw error;
    return data as TradingBid;
  },

  async updateStatus(id: string, status: TradingBid['status']): Promise<void> {
    const { error } = await supabase
      .from('trading_bids')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const clearingService = {
  async getByDate(date: string): Promise<ClearingRecord[]> {
    const { data, error } = await supabase
      .from('clearing_records')
      .select(`
        *,
        trading_unit:trading_units(*)
      `)
      .eq('clearing_date', date)
      .order('hour', { ascending: true });
    
    if (error) throw error;
    return data as ClearingRecord[];
  },

  async getByTradingUnit(tradingUnitId: string, startDate: string, endDate: string): Promise<ClearingRecord[]> {
    const { data, error } = await supabase
      .from('clearing_records')
      .select('*')
      .eq('trading_unit_id', tradingUnitId)
      .gte('clearing_date', startDate)
      .lte('clearing_date', endDate)
      .order('clearing_date', { ascending: true })
      .order('hour', { ascending: true });
    
    if (error) throw error;
    return data as ClearingRecord[];
  },
};

// =============================================
// 结算管理服务
// =============================================

export const settlementService = {
  async getRecords(month: string): Promise<SettlementRecord[]> {
    const { data, error } = await supabase
      .from('settlement_records')
      .select(`
        *,
        trading_unit:trading_units(*)
      `)
      .eq('settlement_month', month)
      .order('category', { ascending: true })
      .order('sub_category', { ascending: true });
    
    if (error) throw error;
    return data as SettlementRecord[];
  },

  async getStatements(tradingUnitId?: string): Promise<SettlementStatement[]> {
    let query = supabase
      .from('settlement_statements')
      .select(`
        *,
        trading_unit:trading_units(*)
      `)
      .order('generated_at', { ascending: false });
    
    if (tradingUnitId) {
      query = query.eq('trading_unit_id', tradingUnitId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as SettlementStatement[];
  },
};

// =============================================
// 客户管理服务
// =============================================

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Customer[];
  },

  async getActive(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('contract_status', 'active')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Customer[];
  },

  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Customer | null;
  },

  async getEnergyUsage(customerId: string, startDate: string, endDate: string): Promise<EnergyUsage[]> {
    const { data, error } = await supabase
      .from('energy_usage')
      .select('*')
      .eq('customer_id', customerId)
      .gte('usage_date', startDate)
      .lte('usage_date', endDate)
      .order('usage_date', { ascending: true });
    
    if (error) throw error;
    return data as EnergyUsage[];
  },

  async getExecutionRecords(customerId: string): Promise<ExecutionRecord[]> {
    const { data, error } = await supabase
      .from('execution_records')
      .select('*')
      .eq('customer_id', customerId)
      .order('execution_date', { ascending: false });
    
    if (error) throw error;
    return data as ExecutionRecord[];
  },
};

export const packageSimulationService = {
  async getByUser(userId: string): Promise<PackageSimulation[]> {
    const { data, error } = await supabase
      .from('package_simulations')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as PackageSimulation[];
  },

  async create(simulation: Omit<PackageSimulation, 'id' | 'created_at'>): Promise<PackageSimulation> {
    const { data, error } = await supabase
      .from('package_simulations')
      .insert(simulation)
      .select()
      .single();
    
    if (error) throw error;
    return data as PackageSimulation;
  },
};

// =============================================
// 策略管理服务
// =============================================

export const strategyService = {
  async getAll(): Promise<TradingStrategy[]> {
    const { data, error } = await supabase
      .from('trading_strategies')
      .select('*')
      .order('is_preset', { ascending: false })
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as unknown as TradingStrategy[];
  },

  async getPresets(): Promise<TradingStrategy[]> {
    const { data, error } = await supabase
      .from('trading_strategies')
      .select('*')
      .eq('is_preset', true)
      .eq('is_active', true);
    
    if (error) throw error;
    return data as unknown as TradingStrategy[];
  },

  async getByUser(userId: string): Promise<TradingStrategy[]> {
    const { data, error } = await supabase
      .from('trading_strategies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as unknown as TradingStrategy[];
  },

  async create(strategy: Omit<TradingStrategy, 'id' | 'created_at' | 'updated_at'>): Promise<TradingStrategy> {
    const { data, error } = await supabase
      .from('trading_strategies')
      .insert(strategy as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as TradingStrategy;
  },

  async update(id: string, updates: Partial<TradingStrategy>): Promise<TradingStrategy> {
    const { data, error } = await supabase
      .from('trading_strategies')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as TradingStrategy;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('trading_strategies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const backtestService = {
  async getByStrategy(strategyId: string): Promise<BacktestResult[]> {
    const { data, error } = await supabase
      .from('backtest_results')
      .select(`
        *,
        strategy:trading_strategies(*)
      `)
      .eq('strategy_id', strategyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as unknown as BacktestResult[];
  },

  async create(result: Omit<BacktestResult, 'id' | 'created_at'>): Promise<BacktestResult> {
    const { data, error } = await supabase
      .from('backtest_results')
      .insert(result as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as BacktestResult;
  },
};

export const recommendationService = {
  async getRecent(limit: number = 10): Promise<StrategyRecommendation[]> {
    const { data, error } = await supabase
      .from('strategy_recommendations')
      .select(`
        *,
        strategy:trading_strategies(*),
        trading_unit:trading_units(*)
      `)
      .order('recommendation_time', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as unknown as StrategyRecommendation[];
  },

  async create(recommendation: Omit<StrategyRecommendation, 'id' | 'created_at'>): Promise<StrategyRecommendation> {
    const { data, error } = await supabase
      .from('strategy_recommendations')
      .insert(recommendation as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as StrategyRecommendation;
  },

  async markAsApplied(id: string): Promise<void> {
    const { error } = await supabase
      .from('strategy_recommendations')
      .update({ 
        is_applied: true, 
        applied_at: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) throw error;
  },
};

// =============================================
// 预测数据服务
// =============================================

export const predictionService = {
  async getLoadPredictions(tradingUnitId: string, date: string): Promise<LoadPrediction[]> {
    const { data, error } = await supabase
      .from('load_predictions')
      .select('*')
      .eq('trading_unit_id', tradingUnitId)
      .eq('prediction_date', date)
      .order('hour', { ascending: true });
    
    if (error) throw error;
    return data as LoadPrediction[];
  },

  async getPricePredictions(province: string, date: string): Promise<PricePrediction[]> {
    const { data, error } = await supabase
      .from('price_predictions')
      .select('*')
      .eq('province', province)
      .eq('prediction_date', date)
      .order('hour', { ascending: true });
    
    if (error) throw error;
    return data as PricePrediction[];
  },
};

// =============================================
// 市场数据服务
// =============================================

export const marketDataService = {
  async getClearingPrices(province: string, date: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('market_clearing_prices')
      .select('*')
      .eq('province', province)
      .eq('price_date', date)
      .order('hour', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getClearingPricesByDateRange(
    province: string, 
    startDate: string, 
    endDate: string
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('market_clearing_prices')
      .select('*')
      .eq('province', province)
      .gte('price_date', startDate)
      .lte('price_date', endDate)
      .order('price_date', { ascending: true })
      .order('hour', { ascending: true });
    
    if (error) throw error;
    return data;
  },
};

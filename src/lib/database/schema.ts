/**
 * 电力交易系统数据模型定义
 * 
 * 数据模型逻辑分类：
 * 1. 场站管理 (Station Management)
 * 2. 合同管理 (Contract Management)
 * 3. 交易管理 (Trading Management)
 * 4. 结算管理 (Settlement Management)
 * 5. 客户管理 (Customer Management)
 * 6. 策略管理 (Strategy Management)
 * 7. 预测数据 (Prediction Data)
 */

// =============================================
// 第一部分：场站管理
// =============================================

export interface PowerStation {
  id: string;
  name: string;
  province: string;
  region?: string;
  station_type: 'wind' | 'solar' | 'hydro' | 'thermal';
  installed_capacity: number;
  grid_connection_voltage?: string;
  commission_date?: string;
  location_lat?: number;
  location_lng?: number;
  contact_person?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradingUnit {
  id: string;
  station_id?: string;
  unit_code: string;
  unit_name: string;
  trading_center: string;
  trading_category: 'renewable' | 'retail';
  registered_capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // 关联数据
  station?: PowerStation;
}

// =============================================
// 第二部分：合同管理
// =============================================

export type ContractType = 'annual_bilateral' | 'monthly_bilateral' | 'monthly_auction' | 'daily_rolling' | 'spot';
export type ContractDirection = 'purchase' | 'sale';
export type ContractStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface Contract {
  id: string;
  trading_unit_id?: string;
  contract_no: string;
  contract_name: string;
  contract_type: ContractType;
  direction: ContractDirection;
  counterparty?: string;
  start_date: string;
  end_date: string;
  total_volume?: number;
  unit_price?: number;
  total_amount?: number;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
  // 关联数据
  trading_unit?: TradingUnit;
}

export interface ContractTimeSeries {
  id: string;
  contract_id: string;
  effective_date: string;
  time_point: number; // 1-96
  volume?: number;
  price?: number;
  created_at: string;
}

// =============================================
// 第三部分：交易管理
// =============================================

export type TradingType = 'centralized_auction' | 'rolling_match' | 'listing' | 'bilateral';
export type TradingCalendarStatus = 'pending' | 'open' | 'closed' | 'completed';
export type BidType = 'buy' | 'sell';
export type BidStatus = 'draft' | 'pending' | 'submitted' | 'cleared' | 'rejected' | 'cancelled';
export type ClearingStatus = 'pending' | 'cleared' | 'failed';

export interface TradingCalendar {
  id: string;
  trading_center: string;
  trading_date: string;
  sequence_no: string;
  trading_type: TradingType;
  announcement_time?: string;
  submission_deadline?: string;
  execution_start?: string;
  execution_end?: string;
  status: TradingCalendarStatus;
  created_at: string;
}

export interface TradingBid {
  id: string;
  trading_unit_id?: string;
  calendar_id?: string;
  bid_no: string;
  bid_type: BidType;
  time_period?: string;
  bid_volume: number;
  bid_price: number;
  status: BidStatus;
  submitted_at?: string;
  submitted_by?: string;
  created_at: string;
  updated_at: string;
  // 关联数据
  trading_unit?: TradingUnit;
  calendar?: TradingCalendar;
}

export interface ClearingRecord {
  id: string;
  bid_id?: string;
  trading_unit_id?: string;
  clearing_date: string;
  hour: number;
  trading_type: string;
  day_ahead_clear_price?: number;
  realtime_clear_price?: number;
  day_ahead_clear_volume?: number;
  realtime_clear_volume?: number;
  status: ClearingStatus;
  created_at: string;
}

// =============================================
// 第四部分：结算管理
// =============================================

export type SettlementSide = 'purchase' | 'sale';
export type SettlementStatus = 'pending' | 'processing' | 'settled' | 'disputed';
export type StatementType = 'daily_clearing' | 'daily_statement' | 'monthly_statement';
export type StatementStatus = 'pending' | 'audited' | 'archived';

export interface SettlementRecord {
  id: string;
  trading_unit_id?: string;
  settlement_no: string;
  settlement_month: string;
  category: string;
  sub_category?: string;
  side: SettlementSide;
  volume: number;
  price?: number;
  amount: number;
  status: SettlementStatus;
  remark?: string;
  created_at: string;
  updated_at: string;
  // 关联数据
  trading_unit?: TradingUnit;
}

export interface SettlementStatement {
  id: string;
  trading_unit_id?: string;
  statement_no: string;
  statement_type: StatementType;
  period_start: string;
  period_end: string;
  total_volume: number;
  total_amount: number;
  status: StatementStatus;
  generated_at: string;
  audited_at?: string;
  audited_by?: string;
  file_path?: string;
  created_at: string;
}

// =============================================
// 第五部分：客户管理 (售电侧)
// =============================================

export type PackageType = 'fixed_price' | 'floating_price' | 'time_segment_price';
export type VoltageLevel = '10kV' | '35kV' | '110kV' | '220kV';
export type CustomerContractStatus = 'pending' | 'active' | 'expired' | 'terminated';
export type ExecutionStatus = 'executing' | 'completed' | 'anomaly';

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  industry_type?: string;
  voltage_level: VoltageLevel;
  total_capacity?: number;
  package_type: PackageType;
  price_mode?: 'monthly' | 'yearly';
  contract_start_date?: string;
  contract_end_date?: string;
  contract_status: CustomerContractStatus;
  agent_name?: string;
  intermediary_cost?: number;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnergyUsage {
  id: string;
  customer_id: string;
  usage_date: string;
  peak_energy?: number;
  flat_energy?: number;
  valley_energy?: number;
  total_energy: number;
  predicted_energy?: number;
  actual_energy?: number;
  deviation_rate?: number;
  profit_loss?: number;
  created_at: string;
  // 关联数据
  customer?: Customer;
}

export interface PackageSimulation {
  id: string;
  customer_id?: string;
  scheme_name: string;
  package_type: 'fixed' | 'floating';
  estimated_monthly_usage?: number;
  peak_ratio?: number;
  flat_ratio?: number;
  valley_ratio?: number;
  fixed_price?: number;
  floating_base_price?: number;
  floating_price_type?: string;
  floating_adjustment?: number;
  purchase_cost?: number;
  intermediary_cost?: number;
  transmission_cost?: number;
  other_costs?: number;
  total_revenue?: number;
  total_cost?: number;
  gross_profit?: number;
  profit_margin?: number;
  break_even_price?: number;
  created_by?: string;
  created_at: string;
}

export interface ExecutionRecord {
  id: string;
  customer_id: string;
  execution_date: string;
  execution_period?: string;
  executed_volume: number;
  executed_price?: number;
  executed_revenue?: number;
  predicted_volume?: number;
  allocation_price?: number;
  volume_deviation?: number;
  volume_deviation_rate?: number;
  status: ExecutionStatus;
  execution_progress?: number;
  created_at: string;
}

// =============================================
// 第六部分：策略管理
// =============================================

export type StrategyType = 'intraday-arbitrage' | 'peak-valley' | 'dynamic-hedge' | 'custom';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface TriggerConditions {
  minP50Forecast?: number;
  minSpotPrice?: number;
  minConfidence?: number;
  timeWindow?: {
    start: string;
    end: string;
  };
}

export interface TradingParams {
  maxPosition: number;
  singleTradeLimit: number;
  dailyTradeLimit: number;
}

export interface RiskControl {
  stopLoss: number;
  takeProfit: number;
  maxDrawdown: number;
}

export interface TradingStrategy {
  id: string;
  user_id?: string;
  name: string;
  strategy_type: StrategyType;
  description?: string;
  risk_level: RiskLevel;
  expected_return?: number;
  trigger_conditions?: TriggerConditions;
  trading_params?: TradingParams;
  risk_control?: RiskControl;
  is_preset: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BacktestResult {
  id: string;
  strategy_id: string;
  user_id?: string;
  backtest_start: string;
  backtest_end: string;
  initial_capital?: number;
  final_capital?: number;
  cumulative_return?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  win_rate?: number;
  avg_holding_time?: number;
  total_trades?: number;
  trades_detail?: any;
  created_at: string;
  // 关联数据
  strategy?: TradingStrategy;
}

export interface StrategyRecommendation {
  id: string;
  strategy_id?: string;
  user_id?: string;
  trading_unit_id?: string;
  recommendation_time: string;
  market_status?: any;
  expected_return?: number;
  risk_score?: number;
  confidence_level?: number;
  reasoning?: string[];
  suggested_actions?: any;
  is_applied: boolean;
  applied_at?: string;
  result_profit?: number;
  created_at: string;
  // 关联数据
  strategy?: TradingStrategy;
  trading_unit?: TradingUnit;
}

// =============================================
// 第七部分：预测数据
// =============================================

export type PredictionType = 'ultra_short' | 'short' | 'medium';

export interface LoadPrediction {
  id: string;
  trading_unit_id?: string;
  prediction_date: string;
  hour: number;
  p10?: number;
  p50?: number;
  p90?: number;
  actual_load?: number;
  confidence?: number;
  prediction_type?: PredictionType;
  created_at: string;
}

export interface PricePrediction {
  id: string;
  province: string;
  prediction_date: string;
  hour: number;
  predicted_day_ahead?: number;
  predicted_realtime?: number;
  actual_day_ahead?: number;
  actual_realtime?: number;
  confidence?: number;
  created_at: string;
}

// =============================================
// 数据模型映射表 (用于报表系统)
// =============================================

export const DATA_MODEL_MAPPING = {
  // 场站管理
  power_stations: {
    name: '电站基础信息',
    category: 'station_management',
    description: '发电场站基本信息和装机容量',
  },
  trading_units: {
    name: '交易单元',
    category: 'station_management',
    description: '电力交易市场注册的交易单元',
  },
  
  // 合同管理
  contracts: {
    name: '合同主表',
    category: 'contract_management',
    description: '中长期交易合同信息',
  },
  contract_time_series: {
    name: '合同分时电量',
    category: 'contract_management',
    description: '合同的分时段电量和价格',
  },
  
  // 交易管理
  trading_calendar: {
    name: '交易日历',
    category: 'trading_management',
    description: '交易序列和时间安排',
  },
  trading_bids: {
    name: '交易申报',
    category: 'trading_management',
    description: '申报方案和状态',
  },
  clearing_records: {
    name: '出清记录',
    category: 'trading_management',
    description: '市场出清价格和电量',
  },
  
  // 结算管理
  settlement_records: {
    name: '结算记录',
    category: 'settlement_management',
    description: '电量和费用结算明细',
  },
  settlement_statements: {
    name: '结算单',
    category: 'settlement_management',
    description: '日/月结算单汇总',
  },
  
  // 客户管理
  customers: {
    name: '客户信息',
    category: 'customer_management',
    description: '售电侧客户基本信息',
  },
  energy_usage: {
    name: '用电记录',
    category: 'customer_management',
    description: '客户用电量和偏差分析',
  },
  package_simulations: {
    name: '套餐模拟',
    category: 'customer_management',
    description: '电价套餐模拟计算',
  },
  execution_records: {
    name: '执行追踪',
    category: 'customer_management',
    description: '零售执行情况追踪',
  },
  
  // 策略管理
  trading_strategies: {
    name: '交易策略',
    category: 'strategy_management',
    description: '策略配置和参数',
  },
  backtest_results: {
    name: '回测结果',
    category: 'strategy_management',
    description: '策略历史回测分析',
  },
  strategy_recommendations: {
    name: '策略推荐',
    category: 'strategy_management',
    description: 'AI策略推荐记录',
  },
  
  // 预测数据
  load_predictions: {
    name: '负荷预测',
    category: 'prediction_data',
    description: '发电负荷预测数据',
  },
  price_predictions: {
    name: '价格预测',
    category: 'prediction_data',
    description: '电价预测数据',
  },
  market_clearing_prices: {
    name: '市场出清价格',
    category: 'market_data',
    description: '省内现货市场出清价格',
  },
} as const;

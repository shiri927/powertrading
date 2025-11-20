import { z } from 'zod';

export type StrategyType = 'intraday-arbitrage' | 'peak-valley' | 'dynamic-hedge' | 'custom';
export type RiskLevel = 'low' | 'medium' | 'high';

// 策略触发条件 Schema
export const triggerConditionsSchema = z.object({
  minP50Forecast: z.number().min(0).optional(),
  minSpotPrice: z.number().min(0).optional(),
  minConfidence: z.number().min(0).max(100).optional(),
  timeWindow: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

// 交易参数 Schema
export const tradingParamsSchema = z.object({
  maxPosition: z.number().min(1).max(1000, { message: "最大仓位不能超过1000MW" }),
  singleTradeLimit: z.number().min(1).max(500, { message: "单笔限额不能超过500MW" }),
  dailyTradeLimit: z.number().min(1).max(50, { message: "日交易次数不能超过50次" }),
});

// 风险控制 Schema
export const riskControlSchema = z.object({
  stopLoss: z.number().min(0).max(50, { message: "止损点不能超过50%" }),
  takeProfit: z.number().min(0).max(100, { message: "止盈点不能超过100%" }),
  maxDrawdown: z.number().min(0).max(50, { message: "最大回撤不能超过50%" }),
});

// 完整策略 Schema
export const strategySchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "策略名称不能为空" }).max(50, { message: "策略名称不能超过50个字符" }),
  type: z.enum(['intraday-arbitrage', 'peak-valley', 'dynamic-hedge', 'custom']),
  description: z.string().max(200, { message: "描述不能超过200个字符" }),
  riskLevel: z.enum(['low', 'medium', 'high']),
  expectedReturn: z.number().min(0).max(100),
  triggerConditions: triggerConditionsSchema,
  tradingParams: tradingParamsSchema,
  riskControl: riskControlSchema,
  isActive: z.boolean(),
});

export type TriggerConditions = z.infer<typeof triggerConditionsSchema>;
export type TradingParams = z.infer<typeof tradingParamsSchema>;
export type RiskControl = z.infer<typeof riskControlSchema>;
export type TradingStrategy = z.infer<typeof strategySchema>;

// 预置策略模板
export const PRESET_STRATEGIES: Omit<TradingStrategy, 'id' | 'isActive'>[] = [
  {
    name: "日内套利策略",
    type: "intraday-arbitrage",
    riskLevel: "medium",
    expectedReturn: 12,
    description: "利用日内价格波动进行高频套利，适合价格波动较大的市场环境",
    triggerConditions: {
      minP50Forecast: 100,
      minSpotPrice: 300,
      minConfidence: 85,
      timeWindow: {
        start: "09:00",
        end: "21:00",
      },
    },
    tradingParams: {
      maxPosition: 200,
      singleTradeLimit: 50,
      dailyTradeLimit: 10,
    },
    riskControl: {
      stopLoss: 3,
      takeProfit: 8,
      maxDrawdown: 10,
    },
  },
  {
    name: "峰谷价差策略",
    type: "peak-valley",
    riskLevel: "low",
    expectedReturn: 8,
    description: "低谷买入，高峰卖出的经典策略，风险较低，收益稳定",
    triggerConditions: {
      minP50Forecast: 80,
      minSpotPrice: 250,
      minConfidence: 90,
    },
    tradingParams: {
      maxPosition: 300,
      singleTradeLimit: 100,
      dailyTradeLimit: 5,
    },
    riskControl: {
      stopLoss: 2,
      takeProfit: 6,
      maxDrawdown: 5,
    },
  },
  {
    name: "动态对冲策略",
    type: "dynamic-hedge",
    riskLevel: "high",
    expectedReturn: 18,
    description: "基于实时市场波动的动态仓位调整，高风险高收益",
    triggerConditions: {
      minP50Forecast: 120,
      minSpotPrice: 350,
      minConfidence: 80,
    },
    tradingParams: {
      maxPosition: 150,
      singleTradeLimit: 30,
      dailyTradeLimit: 20,
    },
    riskControl: {
      stopLoss: 5,
      takeProfit: 15,
      maxDrawdown: 15,
    },
  },
];

// 策略类型标签映射
export const STRATEGY_TYPE_LABELS: Record<StrategyType, string> = {
  'intraday-arbitrage': '日内套利',
  'peak-valley': '峰谷价差',
  'dynamic-hedge': '动态对冲',
  'custom': '自定义',
};

// 风险等级标签映射
export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中等风险',
  high: '高风险',
};

// 风险等级颜色映射
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'text-green-600 bg-green-50',
  medium: 'text-orange-600 bg-orange-50',
  high: 'text-red-600 bg-red-50',
};

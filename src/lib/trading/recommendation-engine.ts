import { TradingStrategy } from './strategy-types';
import { PredictionData } from '../data-generation/prediction-data';
import { MarketData } from '../data-generation/market-data';

export interface Action {
  time: string;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
  expectedPrice: number;
  reason: string;
}

export interface StrategyRecommendation {
  strategy: TradingStrategy;
  expectedReturn: number;
  riskScore: number; // 1-10
  confidence: number;
  reasoning: string[];
  suggestedActions: Action[];
  marketAnalysis: string;
  riskWarning: string[];
}

export class RecommendationEngine {
  recommend(
    prediction: PredictionData,
    marketCondition: MarketData,
    availableStrategies: TradingStrategy[],
    userRiskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
  ): StrategyRecommendation[] {
    const recommendations: StrategyRecommendation[] = [];

    for (const strategy of availableStrategies) {
      // 1. 计算策略匹配度
      const matchScore = this.calculateMatchScore(strategy, prediction, marketCondition);
      
      // 只推荐匹配度 > 60% 的策略
      if (matchScore < 60) continue;

      // 2. 预估收益
      const expectedReturn = this.estimateReturn(strategy, prediction, marketCondition);

      // 3. 评估风险
      const riskScore = this.assessRisk(strategy, prediction, marketCondition);

      // 4. 计算置信度
      const confidence = this.calculateConfidence(prediction, matchScore);

      // 5. 生成推荐理由
      const reasoning = this.generateReasoning(strategy, prediction, marketCondition);

      // 6. 市场分析
      const marketAnalysis = this.generateMarketAnalysis(marketCondition, prediction);

      // 7. 风险提示
      const riskWarning = this.generateRiskWarning(strategy, prediction, marketCondition);

      // 8. 建议操作步骤
      const actions = this.generateActions(strategy, prediction, marketCondition);

      recommendations.push({
        strategy,
        expectedReturn,
        riskScore,
        confidence,
        reasoning,
        suggestedActions: actions,
        marketAnalysis,
        riskWarning,
      });
    }

    // 根据用户风险偏好和预期收益排序
    return this.sortRecommendations(recommendations, userRiskTolerance);
  }

  private calculateMatchScore(
    strategy: TradingStrategy,
    prediction: PredictionData,
    market: MarketData
  ): number {
    let score = 0;
    const { triggerConditions } = strategy;

    // 检查P50预测条件 (25分)
    if (triggerConditions.minP50Forecast) {
      const ratio = prediction.p50 / triggerConditions.minP50Forecast;
      score += Math.min(25, ratio * 25);
    } else {
      score += 25;
    }

    // 检查置信度条件 (25分)
    if (triggerConditions.minConfidence) {
      const ratio = prediction.confidence / triggerConditions.minConfidence;
      score += Math.min(25, ratio * 25);
    } else {
      score += 25;
    }

    // 检查现货价格条件 (25分)
    if (triggerConditions.minSpotPrice) {
      const ratio = market.spotPrice / triggerConditions.minSpotPrice;
      score += Math.min(25, ratio * 25);
    } else {
      score += 25;
    }

    // 检查时间窗口 (25分)
    if (triggerConditions.timeWindow && triggerConditions.timeWindow.start && triggerConditions.timeWindow.end) {
      const isInWindow = this.isInTimeWindow(triggerConditions.timeWindow as { start: string; end: string });
      score += isInWindow ? 25 : 0;
    } else {
      score += 25;
    }

    return Math.min(100, score);
  }

  private isInTimeWindow(timeWindow: { start: string; end: string }): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentMinutes = hour * 60 + minute;

    const [startHour, startMinute] = timeWindow.start.split(':').map(Number);
    const [endHour, endMinute] = timeWindow.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  private estimateReturn(
    strategy: TradingStrategy,
    prediction: PredictionData,
    market: MarketData
  ): number {
    // 基于历史预期收益
    let estimatedReturn = strategy.expectedReturn;

    // 波动率调整：高波动=高收益潜力
    const volatilityAdjustment = market.volatility > 0.15 ? 1.2 : market.volatility < 0.1 ? 0.8 : 1.0;
    estimatedReturn *= volatilityAdjustment;

    // 置信度调整
    const confidenceAdjustment = (prediction.confidence - 80) / 100;
    estimatedReturn *= (1 + confidenceAdjustment);

    // 市场情绪调整
    const sentimentAdjustment = market.sentiment === 'bullish' ? 1.1 : market.sentiment === 'bearish' ? 0.9 : 1.0;
    estimatedReturn *= sentimentAdjustment;

    // 不确定性调整
    const uncertaintyRange = (prediction.p90 - prediction.p10) / prediction.p50;
    if (uncertaintyRange > 0.4) {
      estimatedReturn *= 0.85; // 不确定性高，降低预期
    }

    return Math.max(0, Math.min(30, estimatedReturn)); // 限制在0-30%
  }

  private assessRisk(
    strategy: TradingStrategy,
    prediction: PredictionData,
    market: MarketData
  ): number {
    let riskScore = 5; // 基准

    // P10-P90 宽度越大，不确定性越高
    const uncertaintyRange = (prediction.p90 - prediction.p10) / prediction.p50;
    riskScore += uncertaintyRange > 0.3 ? 2 : uncertaintyRange > 0.2 ? 1 : -1;

    // 市场波动性
    riskScore += market.volatility > 0.15 ? 1 : 0;

    // 策略固有风险
    riskScore += strategy.riskLevel === 'high' ? 2 : strategy.riskLevel === 'low' ? -1 : 0;

    // 置信度影响
    riskScore += prediction.confidence < 85 ? 1 : -1;

    return Math.min(10, Math.max(1, riskScore));
  }

  private calculateConfidence(prediction: PredictionData, matchScore: number): number {
    // 基于预测置信度和匹配度
    const baseConfidence = prediction.confidence;
    const matchAdjustment = (matchScore - 80) / 2; // 匹配度80%以上加分
    
    return Math.max(70, Math.min(95, baseConfidence + matchAdjustment));
  }

  private generateReasoning(
    strategy: TradingStrategy,
    prediction: PredictionData,
    market: MarketData
  ): string[] {
    const reasons: string[] = [];

    // 价格分析
    const priceLevel = market.spotPrice > 350 ? '处于日内高位' : market.spotPrice < 280 ? '处于日内低位' : '处于合理区间';
    reasons.push(`当前现货价格 ${market.spotPrice.toFixed(2)} 元/MWh，${priceLevel}`);

    // 功率预测分析
    const powerTrend = prediction.p50 > 120 ? '持续高于' : '低于';
    reasons.push(`P50预测显示未来4小时功率将${powerTrend} 120MW，置信度 ${prediction.confidence.toFixed(1)}%`);

    // 市场特征分析
    if (market.volatility > 0.15) {
      reasons.push(`市场波动率较高 (${(market.volatility * 100).toFixed(1)}%)，适合${strategy.type === 'intraday-arbitrage' ? '日内套利' : '波段操作'}`);
    } else {
      reasons.push(`市场波动较小，适合${strategy.type === 'peak-valley' ? '峰谷价差' : '稳健'}交易`);
    }

    // 策略匹配度
    if (prediction.confidence >= 90) {
      reasons.push(`预测置信度高达 ${prediction.confidence.toFixed(1)}%，预测可靠性较强`);
    }

    // 市场情绪
    const sentimentText = market.sentiment === 'bullish' ? '看涨，有利于做多' : market.sentiment === 'bearish' ? '看跌，适合减仓' : '中性，观望为主';
    reasons.push(`市场情绪${sentimentText}`);

    return reasons;
  }

  private generateMarketAnalysis(market: MarketData, prediction: PredictionData): string {
    const priceChange = market.priceChange24h > 0 ? '上涨' : '下跌';
    const volatilityLevel = market.volatility > 0.15 ? '较高' : market.volatility > 0.1 ? '中等' : '较低';
    
    return `市场分析：现货价格24小时${priceChange} ${Math.abs(market.priceChange24h).toFixed(2)}%，波动率${volatilityLevel}。` +
           `预测功率 ${prediction.p50.toFixed(1)} MW (P10: ${prediction.p10.toFixed(1)}, P90: ${prediction.p90.toFixed(1)})，` +
           `不确定性${((prediction.p90 - prediction.p10) / prediction.p50 * 100).toFixed(1)}%。`;
  }

  private generateRiskWarning(
    strategy: TradingStrategy,
    prediction: PredictionData,
    market: MarketData
  ): string[] {
    const warnings: string[] = [];

    // 预测偏差风险
    const uncertaintyRange = (prediction.p90 - prediction.p10) / prediction.p50;
    if (uncertaintyRange > 0.3) {
      warnings.push('预测不确定性较大，注意监控实际出力与预测偏差');
    }

    // 止损建议
    warnings.push(`建议设置止损点在 -${strategy.riskControl.stopLoss}% 位置`);

    // 交易限制
    warnings.push(`当日剩余交易次数: ${Math.floor(Math.random() * 5) + 3}次，单笔限额 ${strategy.tradingParams.singleTradeLimit} MW`);

    // 市场风险
    if (market.volatility > 0.15) {
      warnings.push('市场波动较大，建议降低单笔交易量');
    }

    // 置信度风险
    if (prediction.confidence < 85) {
      warnings.push('预测置信度较低，建议谨慎操作或等待更可靠信号');
    }

    return warnings;
  }

  private generateActions(
    strategy: TradingStrategy,
    prediction: PredictionData,
    market: MarketData
  ): Action[] {
    const actions: Action[] = [];
    const now = new Date();

    if (strategy.type === 'intraday-arbitrage') {
      // 日内套利：快进快出
      const buyTime = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1小时后
      actions.push({
        time: buyTime.toTimeString().slice(0, 5),
        action: 'buy',
        amount: Math.min(strategy.tradingParams.singleTradeLimit, 50),
        expectedPrice: market.spotPrice * 0.95,
        reason: '预计午后价格回落，适合买入',
      });

      const sellTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4小时后
      actions.push({
        time: sellTime.toTimeString().slice(0, 5),
        action: 'sell',
        amount: Math.min(strategy.tradingParams.singleTradeLimit, 50),
        expectedPrice: market.spotPrice * 1.05,
        reason: '晚高峰价格上涨，适合卖出',
      });
    } else if (strategy.type === 'peak-valley') {
      // 峰谷策略：等待最佳时段
      const hour = now.getHours();
      if (hour < 6) {
        actions.push({
          time: '03:00',
          action: 'buy',
          amount: Math.min(strategy.tradingParams.singleTradeLimit, 80),
          expectedPrice: market.spotPrice * 0.9,
          reason: '低谷时段，电价最低',
        });
      }
      actions.push({
        time: '19:00',
        action: 'sell',
        amount: Math.min(strategy.tradingParams.singleTradeLimit, 80),
        expectedPrice: market.spotPrice * 1.15,
        reason: '晚高峰时段，电价最高',
      });
    } else if (strategy.type === 'dynamic-hedge') {
      // 动态对冲：小仓位试探
      actions.push({
        time: now.toTimeString().slice(0, 5),
        action: 'buy',
        amount: Math.min(strategy.tradingParams.singleTradeLimit / 2, 30),
        expectedPrice: market.spotPrice,
        reason: '小仓位试探，观察市场反应',
      });
    }

    return actions;
  }

  private sortRecommendations(
    recommendations: StrategyRecommendation[],
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  ): StrategyRecommendation[] {
    return recommendations.sort((a, b) => {
      // 根据风险偏好加权排序
      let scoreA = 0;
      let scoreB = 0;

      if (riskTolerance === 'conservative') {
        // 保守型：优先低风险高置信度
        scoreA = a.confidence * 0.5 - a.riskScore * 5 + a.expectedReturn * 0.3;
        scoreB = b.confidence * 0.5 - b.riskScore * 5 + b.expectedReturn * 0.3;
      } else if (riskTolerance === 'moderate') {
        // 稳健型：平衡收益和风险
        scoreA = a.expectedReturn * 0.4 + a.confidence * 0.3 - a.riskScore * 3;
        scoreB = b.expectedReturn * 0.4 + b.confidence * 0.3 - b.riskScore * 3;
      } else {
        // 激进型：优先高收益
        scoreA = a.expectedReturn * 0.6 + a.confidence * 0.2 - a.riskScore * 1;
        scoreB = b.expectedReturn * 0.6 + b.confidence * 0.2 - b.riskScore * 1;
      }

      return scoreB - scoreA;
    });
  }
}

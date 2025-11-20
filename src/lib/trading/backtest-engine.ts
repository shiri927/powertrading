import { TradingStrategy } from './strategy-types';
import { PredictionData } from '../data-generation/prediction-data';

export interface Trade {
  timestamp: string;
  action: 'buy' | 'sell';
  price: number;
  amount: number;
  profit: number;
  profitRate: number;
  cumulativeCapital: number;
  reason: string;
}

export interface BacktestResult {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  avgHoldingTime: number;
  trades: Trade[];
  equityCurve: { timestamp: string; equity: number }[];
}

export class BacktestEngine {
  private strategy: TradingStrategy;
  private historicalData: PredictionData[];
  private initialCapital: number;
  private currentPosition: number = 0;
  private currentCapital: number;
  private trades: Trade[] = [];
  private dailyTradeCount: number = 0;
  private lastTradeDate: string = '';

  constructor(
    strategy: TradingStrategy,
    historicalData: PredictionData[],
    initialCapital: number
  ) {
    this.strategy = strategy;
    this.historicalData = historicalData;
    this.initialCapital = initialCapital;
    this.currentCapital = initialCapital;
  }

  run(): BacktestResult {
    console.log(`开始回测策略: ${this.strategy.name}`);
    
    for (let i = 0; i < this.historicalData.length; i++) {
      const dataPoint = this.historicalData[i];
      const nextDataPoint = this.historicalData[i + 1];
      
      // 重置每日交易计数
      const currentDate = new Date(dataPoint.timestamp).toDateString();
      if (currentDate !== this.lastTradeDate) {
        this.dailyTradeCount = 0;
        this.lastTradeDate = currentDate;
      }

      // 检查是否满足触发条件
      if (this.shouldTriggerTrade(dataPoint) && nextDataPoint) {
        // 生成交易信号
        const signal = this.generateSignal(dataPoint, nextDataPoint);
        
        // 检查日交易次数限制
        if (this.dailyTradeCount >= this.strategy.tradingParams.dailyTradeLimit) {
          continue;
        }

        // 执行交易
        if (signal !== 'hold') {
          const trade = this.executeTrade(signal, dataPoint, nextDataPoint);
          if (trade) {
            this.trades.push(trade);
            this.dailyTradeCount++;

            // 检查风控条件
            if (this.checkRiskControl()) {
              console.log('触发风控，停止回测');
              break;
            }
          }
        }
      }
    }

    return this.calculateResults();
  }

  private shouldTriggerTrade(data: PredictionData): boolean {
    const { triggerConditions } = this.strategy;
    
    // 检查P50预测条件
    if (triggerConditions.minP50Forecast && data.p50 < triggerConditions.minP50Forecast) {
      return false;
    }

    // 检查置信度条件
    if (triggerConditions.minConfidence && data.confidence < triggerConditions.minConfidence) {
      return false;
    }

    // 检查时间窗口
    if (triggerConditions.timeWindow) {
      const hour = new Date(data.timestamp).getHours();
      const startHour = parseInt(triggerConditions.timeWindow.start.split(':')[0]);
      const endHour = parseInt(triggerConditions.timeWindow.end.split(':')[0]);
      
      if (hour < startHour || hour > endHour) {
        return false;
      }
    }

    return true;
  }

  private generateSignal(current: PredictionData, next: PredictionData): 'buy' | 'sell' | 'hold' {
    // 基于策略类型生成信号
    switch (this.strategy.type) {
      case 'intraday-arbitrage':
        // 日内套利：预测功率上升且置信度高时买入，下降时卖出
        if (next.p50 > current.p50 * 1.05 && current.confidence > 85) {
          return this.currentPosition < this.strategy.tradingParams.maxPosition ? 'buy' : 'hold';
        } else if (next.p50 < current.p50 * 0.95 && this.currentPosition > 0) {
          return 'sell';
        }
        break;

      case 'peak-valley':
        // 峰谷策略：低谷买入，高峰卖出
        const hour = new Date(current.timestamp).getHours();
        if (hour >= 2 && hour <= 6 && this.currentPosition < this.strategy.tradingParams.maxPosition) {
          return 'buy'; // 低谷时段买入
        } else if (hour >= 18 && hour <= 22 && this.currentPosition > 0) {
          return 'sell'; // 高峰时段卖出
        }
        break;

      case 'dynamic-hedge':
        // 动态对冲：基于波动率调整
        const volatility = (current.p90 - current.p10) / current.p50;
        if (volatility > 0.3 && current.confidence > 80) {
          return this.currentPosition < this.strategy.tradingParams.maxPosition / 2 ? 'buy' : 'sell';
        }
        break;
    }

    return 'hold';
  }

  private executeTrade(
    signal: 'buy' | 'sell',
    current: PredictionData,
    next: PredictionData
  ): Trade | null {
    // 模拟价格（使用实际出力或P50预测）
    const currentPrice = (current.actual || current.p50) * 3; // 假设每MW价值3元
    const nextPrice = (next.actual || next.p50) * 3;

    // 计算交易数量
    let amount = Math.min(
      this.strategy.tradingParams.singleTradeLimit,
      signal === 'buy' 
        ? this.strategy.tradingParams.maxPosition - this.currentPosition
        : this.currentPosition
    );

    if (amount <= 0) return null;

    // 执行交易
    let profit = 0;
    if (signal === 'buy') {
      const cost = amount * currentPrice;
      if (cost > this.currentCapital * 0.9) return null; // 保留10%现金
      
      this.currentPosition += amount;
      this.currentCapital -= cost;
      profit = -cost;
    } else {
      const revenue = amount * nextPrice;
      this.currentPosition -= amount;
      this.currentCapital += revenue;
      profit = revenue - (amount * currentPrice);
    }

    const profitRate = (profit / this.initialCapital) * 100;
    const cumulativeCapital = this.currentCapital + this.currentPosition * nextPrice;

    return {
      timestamp: current.timestamp,
      action: signal,
      price: signal === 'buy' ? currentPrice : nextPrice,
      amount,
      profit,
      profitRate,
      cumulativeCapital,
      reason: this.getTradeReason(signal, current),
    };
  }

  private getTradeReason(signal: 'buy' | 'sell', data: PredictionData): string {
    if (signal === 'buy') {
      return `预测功率上升至${data.p50.toFixed(1)}MW，置信度${data.confidence.toFixed(1)}%`;
    } else {
      return `预测功率下降至${data.p50.toFixed(1)}MW，适合卖出`;
    }
  }

  private checkRiskControl(): boolean {
    const currentValue = this.currentCapital + this.currentPosition * 300; // 假设当前市价
    const returnRate = ((currentValue - this.initialCapital) / this.initialCapital) * 100;

    // 检查止损
    if (returnRate < -this.strategy.riskControl.stopLoss) {
      console.log(`触发止损: ${returnRate.toFixed(2)}%`);
      return true;
    }

    // 检查止盈
    if (returnRate > this.strategy.riskControl.takeProfit) {
      console.log(`触发止盈: ${returnRate.toFixed(2)}%`);
      return true;
    }

    return false;
  }

  private calculateResults(): BacktestResult {
    if (this.trades.length === 0) {
      return {
        totalReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        totalTrades: 0,
        avgHoldingTime: 0,
        trades: [],
        equityCurve: [],
      };
    }

    // 计算总收益
    const finalCapital = this.trades[this.trades.length - 1].cumulativeCapital;
    const totalReturn = ((finalCapital - this.initialCapital) / this.initialCapital) * 100;

    // 计算胜率
    const winningTrades = this.trades.filter(t => t.profit > 0).length;
    const winRate = (winningTrades / this.trades.length) * 100;

    // 计算夏普比率
    const returns = this.trades.map(t => t.profitRate);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    const sharpeRatio = stdDev > 0 ? ((avgReturn - 0.03) / stdDev) * Math.sqrt(252) : 0;

    // 计算最大回撤
    let maxDrawdown = 0;
    let peak = this.initialCapital;
    this.trades.forEach(trade => {
      if (trade.cumulativeCapital > peak) {
        peak = trade.cumulativeCapital;
      }
      const drawdown = ((peak - trade.cumulativeCapital) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // 计算平均持仓时间（小时）
    const avgHoldingTime = this.trades.length > 1 
      ? (new Date(this.trades[this.trades.length - 1].timestamp).getTime() - 
         new Date(this.trades[0].timestamp).getTime()) / (1000 * 60 * 60 * this.trades.length)
      : 0;

    // 生成权益曲线
    const equityCurve = this.trades.map(trade => ({
      timestamp: trade.timestamp,
      equity: trade.cumulativeCapital,
    }));

    return {
      totalReturn,
      sharpeRatio,
      maxDrawdown,
      winRate,
      totalTrades: this.trades.length,
      avgHoldingTime,
      trades: this.trades,
      equityCurve,
    };
  }
}

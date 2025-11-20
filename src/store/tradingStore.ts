import { create } from 'zustand';
import { TradingStrategy } from '@/lib/trading/strategy-types';
import { PredictionData } from '@/lib/data-generation/prediction-data';
import { BacktestResult } from '@/lib/trading/backtest-engine';
import { StrategyRecommendation } from '@/lib/trading/recommendation-engine';
import { MarketData } from '@/lib/data-generation/market-data';

interface BidData {
  tradingUnit: string;
  strategy?: string;
  actions?: any[];
  timeSlots?: any[];
  targetDate?: Date;
  fromRecommendation?: boolean;
}

interface WorkflowState {
  lastPredictionTime: Date | null;
  lastRecommendationTime: Date | null;
  lastExecutionTime: Date | null;
}

interface TradingStore {
  // AI预测数据
  currentPrediction: PredictionData | null;
  predictionHistory: PredictionData[];
  setPrediction: (data: PredictionData) => void;
  addPredictionToHistory: (data: PredictionData) => void;

  // 市场数据
  currentMarket: MarketData | null;
  setMarket: (data: MarketData) => void;

  // 策略管理
  strategies: TradingStrategy[];
  activeStrategies: TradingStrategy[];
  addStrategy: (strategy: TradingStrategy) => void;
  updateStrategy: (id: string, updates: Partial<TradingStrategy>) => void;
  deleteStrategy: (id: string) => void;
  toggleStrategyActive: (id: string) => void;
  setStrategies: (strategies: TradingStrategy[]) => void;

  // 回测结果
  backtestResults: Record<string, BacktestResult>;
  setBacktestResult: (strategyId: string, result: BacktestResult) => void;
  clearBacktestResults: () => void;

  // 推荐结果
  currentRecommendations: StrategyRecommendation[];
  setRecommendations: (recs: StrategyRecommendation[]) => void;
  selectedRecommendation: StrategyRecommendation | null;
  setSelectedRecommendation: (rec: StrategyRecommendation | null) => void;

  // 待执行申报
  pendingBid: BidData | null;
  setPendingBid: (bid: BidData | null) => void;

  // 数据流工作流
  workflow: WorkflowState;
  updateWorkflow: (updates: Partial<WorkflowState>) => void;

  // 实时数据推送
  isRealtimeEnabled: boolean;
  toggleRealtime: () => void;

  // 清除所有数据
  reset: () => void;
}

export const useTradingStore = create<TradingStore>((set, get) => ({
  // 初始状态
  currentPrediction: null,
  predictionHistory: [],
  currentMarket: null,
  strategies: [],
  activeStrategies: [],
  backtestResults: {},
  currentRecommendations: [],
  selectedRecommendation: null,
  pendingBid: null,
  workflow: {
    lastPredictionTime: null,
    lastRecommendationTime: null,
    lastExecutionTime: null,
  },
  isRealtimeEnabled: false,

  // 预测数据管理
  setPrediction: (data) => {
    set({ 
      currentPrediction: data,
      workflow: { ...get().workflow, lastPredictionTime: new Date() }
    });
  },

  addPredictionToHistory: (data) => {
    set((state) => ({
      predictionHistory: [...state.predictionHistory, data].slice(-100), // 保留最近100条
    }));
  },

  // 市场数据管理
  setMarket: (data) => {
    set({ currentMarket: data });
  },

  // 策略管理
  addStrategy: (strategy) => {
    set((state) => ({
      strategies: [...state.strategies, strategy],
    }));
  },

  updateStrategy: (id, updates) => {
    set((state) => ({
      strategies: state.strategies.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  },

  deleteStrategy: (id) => {
    set((state) => ({
      strategies: state.strategies.filter((s) => s.id !== id),
      activeStrategies: state.activeStrategies.filter((s) => s.id !== id),
    }));
  },

  toggleStrategyActive: (id) => {
    set((state) => {
      const strategies = state.strategies.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      );
      const activeStrategies = strategies.filter((s) => s.isActive);
      return { strategies, activeStrategies };
    });
  },

  setStrategies: (strategies) => {
    set({
      strategies,
      activeStrategies: strategies.filter((s) => s.isActive),
    });
  },

  // 回测结果管理
  setBacktestResult: (strategyId, result) => {
    set((state) => ({
      backtestResults: {
        ...state.backtestResults,
        [strategyId]: result,
      },
    }));
  },

  clearBacktestResults: () => {
    set({ backtestResults: {} });
  },

  // 推荐结果管理
  setRecommendations: (recs) => {
    set({ 
      currentRecommendations: recs,
      workflow: { ...get().workflow, lastRecommendationTime: new Date() }
    });
  },

  setSelectedRecommendation: (rec) => {
    set({ selectedRecommendation: rec });
  },

  // 待执行申报管理
  setPendingBid: (bid) => {
    set({ 
      pendingBid: bid,
      workflow: bid ? { ...get().workflow, lastExecutionTime: new Date() } : get().workflow
    });
  },

  // 工作流管理
  updateWorkflow: (updates) => {
    set((state) => ({
      workflow: { ...state.workflow, ...updates },
    }));
  },

  // 实时数据推送
  toggleRealtime: () => {
    set((state) => ({ isRealtimeEnabled: !state.isRealtimeEnabled }));
  },

  // 重置
  reset: () => {
    set({
      currentPrediction: null,
      predictionHistory: [],
      currentMarket: null,
      strategies: [],
      activeStrategies: [],
      backtestResults: {},
      currentRecommendations: [],
      selectedRecommendation: null,
      pendingBid: null,
      workflow: {
        lastPredictionTime: null,
        lastRecommendationTime: null,
        lastExecutionTime: null,
      },
      isRealtimeEnabled: false,
    });
  },
}));

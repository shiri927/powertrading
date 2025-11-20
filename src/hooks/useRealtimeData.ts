import { useEffect, useRef } from 'react';
import { useTradingStore } from '@/store/tradingStore';
import { generatePredictionData } from '@/lib/data-generation/prediction-data';
import { generateMarketData } from '@/lib/data-generation/market-data';

/**
 * 实时数据推送 Hook
 * 模拟 WebSocket 连接，定期更新预测和市场数据
 */
export const useRealtimeData = (enabled: boolean = false, intervalMs: number = 5000) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { setPrediction, setMarket, addPredictionToHistory } = useTradingStore();

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 立即执行一次
    updateData();

    // 定期更新
    intervalRef.current = setInterval(() => {
      updateData();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs]);

  const updateData = () => {
    // 生成最新预测数据
    const newPrediction = generatePredictionData(48, '1hour')[0];
    setPrediction(newPrediction);
    addPredictionToHistory(newPrediction);

    // 生成最新市场数据
    const newMarket = generateMarketData();
    setMarket(newMarket);
  };

  return null;
};

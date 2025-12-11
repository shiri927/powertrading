import { useCallback, useEffect, useRef } from 'react';
import { useTradingStore } from '@/store/tradingStore';
import { generatePredictionData } from '@/lib/data-generation/prediction-data';
import { generateMarketData } from '@/lib/data-generation/market-data';

/**
 * 实时数据推送 Hook
 * 模拟 WebSocket 连接，定期更新预测和市场数据
 */
export const useRealtimeData = (enabled: boolean = false, intervalMs: number = 5000) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { setPrediction, setMarket, addPredictionToHistory } = useTradingStore();

  const updateData = useCallback(() => {
    const newPrediction = generatePredictionData(48, '1hour')[0];
    setPrediction(newPrediction);
    addPredictionToHistory(newPrediction);

    const newMarket = generateMarketData();
    setMarket(newMarket);
  }, [addPredictionToHistory, setMarket, setPrediction]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    updateData();
    intervalRef.current = setInterval(updateData, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, updateData]);

  return null;
};

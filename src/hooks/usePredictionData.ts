import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoadPrediction {
  id: string;
  trading_unit_id: string | null;
  prediction_date: string;
  hour: number;
  p10: number | null;
  p50: number | null;
  p90: number | null;
  actual_load: number | null;
  confidence: number | null;
  prediction_type: string | null;
}

interface PricePrediction {
  id: string;
  province: string;
  prediction_date: string;
  hour: number;
  predicted_day_ahead: number | null;
  predicted_realtime: number | null;
  actual_day_ahead: number | null;
  actual_realtime: number | null;
  confidence: number | null;
}

export interface FormattedPredictionData {
  timestamp: string;
  hour: number;
  p10: number;
  p50: number;
  p90: number;
  actual: number | null;
  confidence: number;
}

export interface FormattedPricePrediction {
  timestamp: string;
  hour: number;
  predictedDayAhead: number | null;
  predictedRealtime: number | null;
  actualDayAhead: number | null;
  actualRealtime: number | null;
  confidence: number;
}

export function usePredictionData() {
  const [loadPredictions, setLoadPredictions] = useState<FormattedPredictionData[]>([]);
  const [pricePredictions, setPricePredictions] = useState<FormattedPricePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoadPredictions = useCallback(async (tradingUnitId: string, date: string) => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('load_predictions')
        .select('*')
        .eq('trading_unit_id', tradingUnitId)
        .eq('prediction_date', date)
        .order('hour', { ascending: true });

      if (fetchError) throw fetchError;

      const formatted: FormattedPredictionData[] = (data || []).map((record: LoadPrediction) => ({
        timestamp: `${record.prediction_date}T${String(record.hour).padStart(2, '0')}:00:00`,
        hour: record.hour,
        p10: record.p10 || 0,
        p50: record.p50 || 0,
        p90: record.p90 || 0,
        actual: record.actual_load,
        confidence: record.confidence || 85,
      }));

      setLoadPredictions(formatted);
      setError(null);
      return formatted;
    } catch (err) {
      console.error('获取负荷预测失败:', err);
      setError('获取负荷预测数据失败');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPricePredictions = useCallback(async (province: string, date: string) => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('price_predictions')
        .select('*')
        .eq('province', province)
        .eq('prediction_date', date)
        .order('hour', { ascending: true });

      if (fetchError) throw fetchError;

      const formatted: FormattedPricePrediction[] = (data || []).map((record: PricePrediction) => ({
        timestamp: `${record.prediction_date}T${String(record.hour).padStart(2, '0')}:00:00`,
        hour: record.hour,
        predictedDayAhead: record.predicted_day_ahead,
        predictedRealtime: record.predicted_realtime,
        actualDayAhead: record.actual_day_ahead,
        actualRealtime: record.actual_realtime,
        confidence: record.confidence || 85,
      }));

      setPricePredictions(formatted);
      setError(null);
      return formatted;
    } catch (err) {
      console.error('获取价格预测失败:', err);
      setError('获取价格预测数据失败');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMarketClearingPrices = useCallback(async (province: string, date: string) => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('market_clearing_prices')
        .select('*')
        .eq('province', province)
        .eq('price_date', date)
        .order('hour', { ascending: true });

      if (fetchError) throw fetchError;
      setError(null);
      return data || [];
    } catch (err) {
      console.error('获取市场出清价格失败:', err);
      setError('获取市场出清价格失败');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    loadPredictions,
    pricePredictions,
    isLoading,
    error,
    fetchLoadPredictions,
    fetchPricePredictions,
    fetchMarketClearingPrices,
  };
}

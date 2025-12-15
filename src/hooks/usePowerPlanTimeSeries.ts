import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PowerPlanTimeSeriesPoint {
  id: string;
  plan_id: string;
  effective_date: string;
  time_point: number;
  planned_power: number | null;
  predicted_power: number | null;
  actual_power: number | null;
  time_granularity: string;
}

export interface AggregatedTimeSeriesPoint {
  hour: string;
  time_point: number;
  planned: number;
  predicted: number;
  actual: number | null;
  deviation: number;
}

export interface TimeSeriesFilters {
  planId?: string;
  tradingUnitId?: string;
  year?: number;
  month?: number;
}

export function usePowerPlanTimeSeries() {
  const [timeSeriesData, setTimeSeriesData] = useState<AggregatedTimeSeriesPoint[]>([]);
  const [rawData, setRawData] = useState<PowerPlanTimeSeriesPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取指定计划的时序数据
  const fetchTimeSeriesByPlan = useCallback(async (planId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('power_plan_time_series')
        .select('*')
        .eq('plan_id', planId)
        .order('time_point', { ascending: true });

      if (fetchError) throw fetchError;

      setRawData(data as PowerPlanTimeSeriesPoint[] || []);
      
      // 转换为图表格式
      const chartData: AggregatedTimeSeriesPoint[] = (data || []).map(point => ({
        hour: `${String(point.time_point).padStart(2, '0')}:00`,
        time_point: point.time_point,
        planned: Number(point.planned_power) || 0,
        predicted: Number(point.predicted_power) || 0,
        actual: point.actual_power != null ? Number(point.actual_power) : null,
        deviation: point.actual_power != null && point.planned_power != null
          ? ((Number(point.actual_power) - Number(point.planned_power)) / Number(point.planned_power)) * 100
          : 0,
      }));

      setTimeSeriesData(chartData);
    } catch (err) {
      console.error('获取时序数据失败:', err);
      setError('获取时序数据失败');
      setTimeSeriesData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 获取按月份聚合的时序数据（所有交易单元汇总）
  const fetchAggregatedTimeSeries = useCallback(async (year: number, month: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('power_plan_time_series')
        .select(`
          time_point,
          planned_power,
          predicted_power,
          actual_power,
          power_plans!inner (
            plan_year,
            plan_month
          )
        `)
        .eq('power_plans.plan_year', year)
        .eq('power_plans.plan_month', month)
        .order('time_point', { ascending: true });

      if (fetchError) throw fetchError;

      // 按时间点聚合所有交易单元数据
      const aggregation: Record<number, { planned: number; predicted: number; actual: number; count: number }> = {};
      
      (data || []).forEach((point: any) => {
        const tp = point.time_point;
        if (!aggregation[tp]) {
          aggregation[tp] = { planned: 0, predicted: 0, actual: 0, count: 0 };
        }
        aggregation[tp].planned += Number(point.planned_power) || 0;
        aggregation[tp].predicted += Number(point.predicted_power) || 0;
        if (point.actual_power != null) {
          aggregation[tp].actual += Number(point.actual_power);
        }
        aggregation[tp].count += 1;
      });

      const chartData: AggregatedTimeSeriesPoint[] = Array.from({ length: 24 }, (_, i) => {
        const agg = aggregation[i];
        if (agg) {
          const deviation = agg.planned > 0 ? ((agg.actual - agg.planned) / agg.planned) * 100 : 0;
          return {
            hour: `${String(i).padStart(2, '0')}:00`,
            time_point: i,
            planned: parseFloat(agg.planned.toFixed(2)),
            predicted: parseFloat(agg.predicted.toFixed(2)),
            actual: parseFloat(agg.actual.toFixed(2)),
            deviation: parseFloat(deviation.toFixed(2)),
          };
        }
        return {
          hour: `${String(i).padStart(2, '0')}:00`,
          time_point: i,
          planned: 0,
          predicted: 0,
          actual: null,
          deviation: 0,
        };
      });

      setTimeSeriesData(chartData);
    } catch (err) {
      console.error('获取聚合时序数据失败:', err);
      setError('获取聚合时序数据失败');
      setTimeSeriesData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 获取指定交易单元的月度时序数据
  const fetchTimeSeriesByUnit = useCallback(async (tradingUnitId: string, year: number, month: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('power_plan_time_series')
        .select(`
          *,
          power_plans!inner (
            trading_unit_id,
            plan_year,
            plan_month
          )
        `)
        .eq('power_plans.trading_unit_id', tradingUnitId)
        .eq('power_plans.plan_year', year)
        .eq('power_plans.plan_month', month)
        .order('time_point', { ascending: true });

      if (fetchError) throw fetchError;

      const chartData: AggregatedTimeSeriesPoint[] = (data || []).map((point: any) => ({
        hour: `${String(point.time_point).padStart(2, '0')}:00`,
        time_point: point.time_point,
        planned: Number(point.planned_power) || 0,
        predicted: Number(point.predicted_power) || 0,
        actual: point.actual_power != null ? Number(point.actual_power) : null,
        deviation: point.actual_power != null && point.planned_power != null
          ? ((Number(point.actual_power) - Number(point.planned_power)) / Number(point.planned_power)) * 100
          : 0,
      }));

      setTimeSeriesData(chartData);
    } catch (err) {
      console.error('获取交易单元时序数据失败:', err);
      setError('获取交易单元时序数据失败');
      setTimeSeriesData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    timeSeriesData,
    rawData,
    isLoading,
    error,
    fetchTimeSeriesByPlan,
    fetchAggregatedTimeSeries,
    fetchTimeSeriesByUnit,
  };
}

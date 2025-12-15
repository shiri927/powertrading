import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BacktestResult } from '@/lib/trading/backtest-engine';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface DbBacktestResult {
  id: string;
  strategy_id: string | null;
  user_id: string | null;
  backtest_start: string;
  backtest_end: string;
  initial_capital: number | null;
  final_capital: number | null;
  cumulative_return: number | null;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  win_rate: number | null;
  avg_holding_time: number | null;
  total_trades: number | null;
  trades_detail: Json | null;
  created_at: string;
}

// 数据库记录转换为前端回测结果
const mapDbToResult = (record: DbBacktestResult): BacktestResult & { id: string; strategyId: string; createdAt: string } => ({
  id: record.id,
  strategyId: record.strategy_id || '',
  totalReturn: record.cumulative_return || 0,
  sharpeRatio: record.sharpe_ratio || 0,
  maxDrawdown: record.max_drawdown || 0,
  winRate: record.win_rate || 0,
  totalTrades: record.total_trades || 0,
  avgHoldingTime: record.avg_holding_time || 0,
  trades: Array.isArray(record.trades_detail) ? (record.trades_detail as unknown as BacktestResult['trades']) : [],
  equityCurve: [],
  createdAt: record.created_at,
});

export function useBacktestResults() {
  const [results, setResults] = useState<(BacktestResult & { id: string; strategyId: string; createdAt: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResultsByStrategy = useCallback(async (strategyId: string) => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('backtest_results')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedResults = (data || []).map((record) => 
        mapDbToResult(record as unknown as DbBacktestResult)
      );
      setResults(mappedResults);
      setError(null);
      return mappedResults;
    } catch (err) {
      console.error('获取回测结果失败:', err);
      setError('获取回测结果失败');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveResult = async (
    strategyId: string,
    result: BacktestResult,
    dateRange: { start: Date; end: Date },
    initialCapital: number
  ): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const insertData = {
        strategy_id: strategyId,
        user_id: userData.user?.id || null,
        backtest_start: dateRange.start.toISOString().split('T')[0],
        backtest_end: dateRange.end.toISOString().split('T')[0],
        initial_capital: initialCapital,
        final_capital: initialCapital * (1 + result.totalReturn / 100),
        cumulative_return: result.totalReturn,
        sharpe_ratio: result.sharpeRatio,
        max_drawdown: result.maxDrawdown,
        win_rate: result.winRate,
        avg_holding_time: result.avgHoldingTime,
        total_trades: result.totalTrades,
        trades_detail: result.trades as unknown as Json,
      };

      const { error: insertError } = await supabase
        .from('backtest_results')
        .insert(insertData);

      if (insertError) throw insertError;

      toast.success('回测结果已保存');
      return true;
    } catch (err) {
      console.error('保存回测结果失败:', err);
      toast.error('保存回测结果失败');
      return false;
    }
  };

  return {
    results,
    isLoading,
    error,
    fetchResultsByStrategy,
    saveResult,
  };
}

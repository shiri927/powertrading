/**
 * 结算记录数据钩子
 * 使用服务层实现结算数据与数据库联动，支持缓存和实时订阅
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { settlementService, SettlementRecord } from '@/lib/services/settlement-service';
import { supabase } from '@/integrations/supabase/client';

export type { SettlementRecord } from '@/lib/services/settlement-service';

export interface SettlementStatement {
  id: string;
  trading_unit_id: string | null;
  statement_no: string;
  statement_type: string;
  period_start: string;
  period_end: string;
  total_volume: number;
  total_amount: number;
  status: string;
  generated_at: string;
  audited_at: string | null;
  audited_by: string | null;
  file_path: string | null;
  created_at: string;
  trading_unit?: {
    id: string;
    unit_name: string;
    unit_code: string;
  };
}

// 按月份获取结算记录
export const useSettlementRecordsByMonth = (month: string) => {
  const queryClient = useQueryClient();

  // 实时订阅
  useEffect(() => {
    if (!month) return;
    
    const unsubscribe = settlementService.subscribe(({ eventType }) => {
      if (eventType) {
        queryClient.invalidateQueries({ queryKey: ['settlement_records'] });
      }
    });

    return unsubscribe;
  }, [month, queryClient]);

  return useQuery({
    queryKey: ['settlement_records', 'month', month],
    queryFn: () => settlementService.getByMonth(month),
    enabled: !!month,
    staleTime: 1000 * 60 * 5,
  });
};

// 按交易单元获取结算记录
export const useSettlementRecordsByUnit = (tradingUnitId: string | null, month?: string) => {
  return useQuery({
    queryKey: ['settlement_records', 'unit', tradingUnitId, month],
    queryFn: () => settlementService.getByTradingUnit(
      tradingUnitId || '', 
      month, 
      month
    ),
    enabled: !!tradingUnitId,
    staleTime: 1000 * 60 * 5,
  });
};

// 获取结算单列表
export const useSettlementStatements = (tradingUnitId?: string) => {
  return useQuery({
    queryKey: ['settlement_statements', tradingUnitId],
    queryFn: async () => {
      let query = supabase
        .from('settlement_statements')
        .select(`
          *,
          trading_unit:trading_units(id, unit_name, unit_code)
        `)
        .order('generated_at', { ascending: false });
      
      if (tradingUnitId) {
        query = query.eq('trading_unit_id', tradingUnitId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SettlementStatement[];
    },
  });
};

// 获取结算统计汇总
export const useSettlementStats = (month: string) => {
  return useQuery({
    queryKey: ['settlement_stats', month],
    queryFn: () => settlementService.getMonthlyStatistics(month),
    enabled: !!month,
    staleTime: 1000 * 60 * 5,
  });
};

// 将结算记录转换为树形结构数据
export const transformSettlementToTree = (records: SettlementRecord[]) => {
  const groupedByCategory: Record<string, SettlementRecord[]> = {};
  
  records.forEach(record => {
    if (!groupedByCategory[record.category]) {
      groupedByCategory[record.category] = [];
    }
    groupedByCategory[record.category].push(record);
  });
  
  return Object.entries(groupedByCategory).map(([category, items]) => ({
    id: `cat-${category}`,
    category,
    isGroup: true,
    volume: items.reduce((sum, r) => sum + r.volume, 0),
    amount: items.reduce((sum, r) => sum + r.amount, 0),
    children: items.map(item => ({
      ...item,
      isGroup: false,
    })),
  }));
};

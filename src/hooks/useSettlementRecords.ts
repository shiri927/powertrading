/**
 * 结算记录数据钩子
 * 实现结算数据与数据库联动
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SettlementRecord {
  id: string;
  trading_unit_id: string | null;
  settlement_no: string;
  settlement_month: string;
  category: string;
  sub_category: string | null;
  side: string;
  volume: number;
  price: number | null;
  amount: number;
  status: string;
  remark: string | null;
  created_at: string;
  updated_at: string;
  trading_unit?: {
    id: string;
    unit_name: string;
    unit_code: string;
    trading_center: string;
  };
}

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
  return useQuery({
    queryKey: ['settlement_records', 'month', month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settlement_records')
        .select(`
          *,
          trading_unit:trading_units(id, unit_name, unit_code, trading_center)
        `)
        .eq('settlement_month', month)
        .order('category', { ascending: true })
        .order('sub_category', { ascending: true });
      
      if (error) throw error;
      return data as SettlementRecord[];
    },
    enabled: !!month,
  });
};

// 按交易单元获取结算记录
export const useSettlementRecordsByUnit = (tradingUnitId: string | null, month?: string) => {
  return useQuery({
    queryKey: ['settlement_records', 'unit', tradingUnitId, month],
    queryFn: async () => {
      let query = supabase
        .from('settlement_records')
        .select(`
          *,
          trading_unit:trading_units(id, unit_name, unit_code, trading_center)
        `)
        .order('settlement_month', { ascending: false })
        .order('category', { ascending: true });
      
      if (tradingUnitId) {
        query = query.eq('trading_unit_id', tradingUnitId);
      }
      if (month) {
        query = query.eq('settlement_month', month);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SettlementRecord[];
    },
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settlement_records')
        .select('*')
        .eq('settlement_month', month);
      
      if (error) throw error;
      
      const records = data || [];
      
      // 按类别分组统计
      const categoryStats: Record<string, { volume: number; amount: number; count: number }> = {};
      const sideStats: Record<string, { volume: number; amount: number; count: number }> = {
        purchase: { volume: 0, amount: 0, count: 0 },
        sale: { volume: 0, amount: 0, count: 0 },
      };
      
      records.forEach(record => {
        // 类别统计
        if (!categoryStats[record.category]) {
          categoryStats[record.category] = { volume: 0, amount: 0, count: 0 };
        }
        categoryStats[record.category].volume += record.volume;
        categoryStats[record.category].amount += record.amount;
        categoryStats[record.category].count += 1;
        
        // 买卖方统计
        if (record.side === 'purchase' || record.side === 'sale') {
          sideStats[record.side].volume += record.volume;
          sideStats[record.side].amount += record.amount;
          sideStats[record.side].count += 1;
        }
      });
      
      return {
        totalVolume: records.reduce((sum, r) => sum + r.volume, 0),
        totalAmount: records.reduce((sum, r) => sum + r.amount, 0),
        recordCount: records.length,
        categoryStats,
        sideStats,
      };
    },
    enabled: !!month,
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

/**
 * 交易日历数据同步Hook
 * 从数据库获取交易序列和公告数据，支持实时刷新
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';

export interface TradingSequence {
  id: string;
  date: string;
  center: string;
  type: string;
  content: string;
  time: string;
  period: string;
  deadline: string;
  status: string;
}

export interface Announcement {
  id: string;
  date: string;
  center: string;
  title: string;
  type: string;
  importance: '紧急' | '重要' | '一般';
}

export interface Todo {
  id: string;
  title: string;
  sequence: string;
  deadline: string;
  hoursRemaining: number;
  minutesRemaining: number;
  tradingUnit: string;
  center: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

export interface ImportantWindow {
  content: string;
  center: string;
  time: string;
  hoursRemaining: number;
  minutesRemaining: number;
}

// 交易类型映射
const tradingTypeMap: Record<string, string> = {
  centralized_auction: '集中竞价',
  bilateral: '双边交易',
  rolling_match: '日滚动撮合',
  spot_day_ahead: '日前现货',
  spot_realtime: '实时现货',
  green_certificate: '绿证交易',
};

export function useTradingCalendar(options?: {
  autoRefresh?: boolean;
  refreshInterval?: number;
}) {
  const { autoRefresh = true, refreshInterval = 5 * 60 * 1000 } = options || {};
  
  const [sequences, setSequences] = useState<TradingSequence[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // 从数据库加载交易序列
  const loadSequences = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const futureDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data, error: fetchError } = await supabase
        .from('trading_calendar')
        .select('*')
        .gte('trading_date', today)
        .lte('trading_date', futureDate)
        .order('trading_date', { ascending: true })
        .order('sequence_no', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      const mappedSequences: TradingSequence[] = (data || []).map(item => ({
        id: item.id,
        date: format(new Date(item.trading_date), 'yyyyMMdd'),
        center: item.trading_center,
        type: '交易序列',
        content: `${format(new Date(item.trading_date), 'yyyy年MM月dd日')}${tradingTypeMap[item.trading_type] || item.trading_type}`,
        time: item.announcement_time && item.submission_deadline 
          ? `${format(new Date(item.announcement_time), 'HH:mm')}-${format(new Date(item.submission_deadline), 'HH:mm')}`
          : '待定',
        period: item.execution_start && item.execution_end
          ? `${format(new Date(item.execution_start), 'yyyy-MM-dd')}至${format(new Date(item.execution_end), 'yyyy-MM-dd')}`
          : '待定',
        deadline: item.submission_deadline || '',
        status: item.status,
      }));
      
      setSequences(mappedSequences);
    } catch (err) {
      console.error('加载交易序列失败:', err);
      setError('加载交易序列失败');
    }
  }, []);

  // 生成模拟公告数据（未来可从数据库获取）
  const loadAnnouncements = useCallback(() => {
    // 基于交易序列生成相关公告
    const mockAnnouncements: Announcement[] = [
      { id: 'A001', date: format(addDays(new Date(), -1), 'yyyy-MM-dd'), center: '山西电力交易中心', title: '关于开展2025年度中长期交易的通知', type: '交易通知', importance: '重要' },
      { id: 'A002', date: format(addDays(new Date(), -2), 'yyyy-MM-dd'), center: '山东电力交易中心', title: '2024年12月电力现货市场运行情况通报', type: '市场报告', importance: '一般' },
      { id: 'A003', date: format(addDays(new Date(), -3), 'yyyy-MM-dd'), center: '国家电网', title: '关于调整省间现货交易规则的公告', type: '规则调整', importance: '紧急' },
      { id: 'A004', date: format(addDays(new Date(), -4), 'yyyy-MM-dd'), center: '浙江电力交易中心', title: '绿证交易系统升级维护通知', type: '系统通知', importance: '一般' },
      { id: 'A005', date: format(addDays(new Date(), -5), 'yyyy-MM-dd'), center: '山西电力交易中心', title: '新能源场站准入资质审核结果公示', type: '资质公示', importance: '重要' },
    ];
    setAnnouncements(mockAnnouncements);
  }, []);

  // 综合加载
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadSequences();
      loadAnnouncements();
      setLastSyncTime(new Date());
    } catch (err) {
      setError('数据同步失败');
    } finally {
      setLoading(false);
    }
  }, [loadSequences, loadAnnouncements]);

  // 初始加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

  // 从序列生成待办
  const todos = useMemo((): Todo[] => {
    const now = new Date();
    return sequences
      .filter(seq => seq.deadline)
      .map((seq, index) => {
        const deadline = new Date(seq.deadline);
        const hoursRemaining = differenceInHours(deadline, now);
        const minutesRemaining = differenceInMinutes(deadline, now);
        
        let status: Todo['status'] = 'pending';
        if (hoursRemaining < 0) status = 'overdue';
        else if (hoursRemaining < 4) status = 'in-progress';
        
        const units = ['山东省场站A', '山西省场站A', '浙江省场站A', '山东省场站B', '山西省场站B'];
        
        return {
          id: `TODO-${seq.id}`,
          title: `完成${seq.content}申报`,
          sequence: seq.content,
          deadline: seq.deadline,
          hoursRemaining,
          minutesRemaining,
          tradingUnit: units[index % units.length],
          center: seq.center,
          status,
        };
      });
  }, [sequences]);

  // 今日重要交易窗口
  const importantWindows = useMemo((): ImportantWindow[] => {
    const now = new Date();
    return sequences
      .filter(seq => {
        if (!seq.deadline) return false;
        const deadline = new Date(seq.deadline);
        const hoursRemaining = differenceInHours(deadline, now);
        return hoursRemaining >= 0 && hoursRemaining <= 24;
      })
      .map(seq => {
        const deadline = new Date(seq.deadline);
        return {
          content: seq.content,
          center: seq.center,
          time: seq.time,
          hoursRemaining: differenceInHours(deadline, now),
          minutesRemaining: differenceInMinutes(deadline, now) % 60,
        };
      });
  }, [sequences]);

  return {
    sequences,
    announcements,
    todos,
    importantWindows,
    loading,
    error,
    lastSyncTime,
    refresh: loadData,
  };
}

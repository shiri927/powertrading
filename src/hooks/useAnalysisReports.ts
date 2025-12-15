import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalysisReport {
  id: string;
  name: string;
  category: string;
  period: string;
  author: string;
  status: string;
  publish_date: string | null;
  views: number;
  content: string | null;
  summary: string | null;
  file_path: string | null;
  trading_unit_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalysisReportInsert {
  name: string;
  category: string;
  period: string;
  author: string;
  status?: string;
  publish_date?: string | null;
  views?: number;
  content?: string | null;
  summary?: string | null;
  file_path?: string | null;
  trading_unit_id?: string | null;
  created_by?: string | null;
}

export const useAnalysisReports = () => {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (filters?: {
    category?: string;
    status?: string;
    period?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('analysis_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.period) {
        query = query.eq('period', filters.period);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setReports((data as AnalysisReport[]) || []);
      return data as AnalysisReport[];
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取报告列表失败';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (report: AnalysisReportInsert) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('analysis_reports')
        .insert(report)
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchReports();
      return data as AnalysisReport;
    } catch (err) {
      const message = err instanceof Error ? err.message : '创建报告失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReports]);

  const updateReport = useCallback(async (id: string, updates: Partial<AnalysisReportInsert>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('analysis_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchReports();
      return data as AnalysisReport;
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新报告失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReports]);

  const incrementViews = useCallback(async (id: string) => {
    try {
      const report = reports.find(r => r.id === id);
      if (!report) return;

      await supabase
        .from('analysis_reports')
        .update({ views: (report.views || 0) + 1 })
        .eq('id', id);

      setReports(prev => prev.map(r => 
        r.id === id ? { ...r, views: (r.views || 0) + 1 } : r
      ));
    } catch (err) {
      console.error('Failed to increment views:', err);
    }
  }, [reports]);

  const deleteReport = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('analysis_reports')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchReports();
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除报告失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReports]);

  // 获取统计数据
  const getStats = useCallback(() => {
    const total = reports.length;
    const published = reports.filter(r => r.status === '已发布').length;
    const pending = reports.filter(r => r.status === '审核中').length;
    const totalViews = reports.reduce((sum, r) => sum + (r.views || 0), 0);

    return { total, published, pending, totalViews };
  }, [reports]);

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    incrementViews,
    getStats,
  };
};

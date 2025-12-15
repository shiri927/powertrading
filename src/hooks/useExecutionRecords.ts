import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExecutionRecordData {
  id: string;
  customer_id: string | null;
  execution_date: string;
  execution_period: string | null;
  executed_volume: number;
  executed_price: number | null;
  executed_revenue: number | null;
  predicted_volume: number | null;
  allocation_price: number | null;
  volume_deviation: number | null;
  volume_deviation_rate: number | null;
  execution_progress: number | null;
  status: string;
  created_at: string;
  // 关联的客户信息
  customer?: {
    id: string;
    name: string;
    package_type: string;
  };
}

export interface CustomerExecutionSummary {
  customerId: string;
  customerName: string;
  packageType: string;
  totalExecutedVolume: number;
  totalExecutedRevenue: number;
  averageDeviationRate: number;
  anomalyCount: number;
  executionRate: number;
  lastExecutionTime: string;
}

export function useExecutionRecords(startDate?: string, endDate?: string) {
  const [data, setData] = useState<ExecutionRecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('execution_records')
        .select(`
          *,
          customer:customers(id, name, package_type)
        `)
        .order('execution_date', { ascending: false });

      if (startDate) {
        query = query.gte('execution_date', startDate);
      }
      if (endDate) {
        query = query.lte('execution_date', endDate);
      }

      const { data: recordsData, error: fetchError } = await query.limit(500);

      if (fetchError) throw fetchError;

      setData(recordsData || []);
    } catch (err: any) {
      console.error('Error fetching execution records:', err);
      setError(err.message);
      toast({
        title: "获取执行记录失败",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalVolume = data.reduce((sum, r) => sum + r.executed_volume, 0);
    const totalRevenue = data.reduce((sum, r) => sum + (r.executed_revenue || 0), 0);
    const avgDeviation = data.length > 0 
      ? Math.abs(data.reduce((sum, r) => sum + (r.volume_deviation_rate || 0), 0) / data.length)
      : 0;
    const completedRecords = data.filter(r => r.status === 'completed').length;
    const executionRate = data.length > 0 ? (completedRecords / data.length * 100) : 0;
    const anomalyCount = data.filter(r => r.status === 'anomaly').length;

    return {
      totalVolume: Math.round(totalVolume * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgDeviation: Math.round(avgDeviation * 100) / 100,
      executionRate: Math.round(executionRate * 100) / 100,
      anomalyCount
    };
  }, [data]);

  const getCustomerSummaries = useMemo((): CustomerExecutionSummary[] => {
    const customerMap = new Map<string, ExecutionRecordData[]>();
    
    data.forEach(record => {
      if (record.customer_id && record.customer) {
        const existing = customerMap.get(record.customer_id) || [];
        customerMap.set(record.customer_id, [...existing, record]);
      }
    });

    const summaries: CustomerExecutionSummary[] = [];
    
    customerMap.forEach((records, customerId) => {
      const customer = records[0]?.customer;
      if (!customer) return;

      const totalExecutedVolume = records.reduce((sum, r) => sum + r.executed_volume, 0);
      const totalExecutedRevenue = records.reduce((sum, r) => sum + (r.executed_revenue || 0), 0);
      const averageDeviationRate = records.length > 0
        ? Math.abs(records.reduce((sum, r) => sum + (r.volume_deviation_rate || 0), 0) / records.length)
        : 0;
      const anomalyCount = records.filter(r => r.status === 'anomaly').length;
      const completedCount = records.filter(r => r.status === 'completed').length;
      const executionRate = records.length > 0 ? (completedCount / records.length * 100) : 0;
      
      const sortedRecords = [...records].sort((a, b) => 
        new Date(b.execution_date).getTime() - new Date(a.execution_date).getTime()
      );

      summaries.push({
        customerId,
        customerName: customer.name,
        packageType: customer.package_type,
        totalExecutedVolume: Math.round(totalExecutedVolume * 100) / 100,
        totalExecutedRevenue: Math.round(totalExecutedRevenue * 100) / 100,
        averageDeviationRate: Math.round(averageDeviationRate * 100) / 100,
        anomalyCount,
        executionRate: Math.round(executionRate * 100) / 100,
        lastExecutionTime: sortedRecords[0]?.execution_date || ''
      });
    });

    return summaries;
  }, [data]);

  const trendData = useMemo(() => {
    const dataByDate = new Map<string, { volume: number; revenue: number }>();
    
    data.forEach(r => {
      const existing = dataByDate.get(r.execution_date) || { volume: 0, revenue: 0 };
      dataByDate.set(r.execution_date, {
        volume: existing.volume + r.executed_volume,
        revenue: existing.revenue + (r.executed_revenue || 0)
      });
    });

    return Array.from(dataByDate.entries())
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        执行电量: Math.round(values.volume),
        执行收益: Math.round(values.revenue / 1000)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10);
  }, [data]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  return {
    data,
    loading,
    error,
    stats,
    customerSummaries: getCustomerSummaries,
    trendData,
    refetch: fetchData
  };
}

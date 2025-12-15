import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnergyUsageRecord {
  id: string;
  customer_id: string | null;
  usage_date: string;
  peak_energy: number | null;
  flat_energy: number | null;
  valley_energy: number | null;
  total_energy: number;
  predicted_energy: number | null;
  actual_energy: number | null;
  deviation_rate: number | null;
  profit_loss: number | null;
  created_at: string;
  // 关联的客户信息
  customer?: {
    id: string;
    name: string;
    voltage_level: string;
    package_type: string;
  };
}

export interface CustomerQualityData {
  customerId: string;
  customerName: string;
  qualityScore: number;
  averageDeviation: number;
  totalEnergy: number;
  profitability: number;
  category: 'excellent' | 'good' | 'normal' | 'poor';
}

export function useEnergyUsage(startDate?: string, endDate?: string) {
  const [data, setData] = useState<EnergyUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('energy_usage')
        .select(`
          *,
          customer:customers(id, name, voltage_level, package_type)
        `)
        .order('usage_date', { ascending: false });

      if (startDate) {
        query = query.gte('usage_date', startDate);
      }
      if (endDate) {
        query = query.lte('usage_date', endDate);
      }

      const { data: usageData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(usageData || []);
    } catch (err: any) {
      console.error('Error fetching energy usage:', err);
      setError(err.message);
      toast({
        title: "获取用能数据失败",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCustomerUsage = async (customerId: string, start: string, end: string) => {
    try {
      const { data, error } = await supabase
        .from('energy_usage')
        .select('*')
        .eq('customer_id', customerId)
        .gte('usage_date', start)
        .lte('usage_date', end)
        .order('usage_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error fetching customer usage:', err);
      return [];
    }
  };

  const calculateQualityScores = (usageData: EnergyUsageRecord[]): CustomerQualityData[] => {
    const customerMap = new Map<string, EnergyUsageRecord[]>();
    
    usageData.forEach(record => {
      if (record.customer_id && record.customer) {
        const existing = customerMap.get(record.customer_id) || [];
        customerMap.set(record.customer_id, [...existing, record]);
      }
    });

    const qualityData: CustomerQualityData[] = [];
    
    customerMap.forEach((records, customerId) => {
      const customer = records[0]?.customer;
      if (!customer) return;

      const avgDeviation = records.length > 0
        ? Math.abs(records.reduce((sum, r) => sum + (r.deviation_rate || 0), 0) / records.length)
        : 0;
      const totalEnergy = records.reduce((sum, r) => sum + r.total_energy, 0);
      const profitability = records.reduce((sum, r) => sum + (r.profit_loss || 0), 0);
      
      const qualityScore = Math.round((
        (totalEnergy / 100000 * 40) +
        (Math.max(0, 100 - avgDeviation * 10) * 30 / 100) +
        (profitability / 10000 * 30)
      ) * 100) / 100;
      
      const category: CustomerQualityData['category'] = 
        qualityScore >= 80 ? 'excellent' :
        qualityScore >= 60 ? 'good' :
        qualityScore >= 40 ? 'normal' : 'poor';

      qualityData.push({
        customerId,
        customerName: customer.name,
        qualityScore,
        averageDeviation: Math.round(avgDeviation * 100) / 100,
        totalEnergy: Math.round(totalEnergy * 100) / 100,
        profitability: Math.round(profitability * 100) / 100,
        category
      });
    });

    return qualityData.sort((a, b) => b.qualityScore - a.qualityScore);
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    getCustomerUsage,
    calculateQualityScores
  };
}

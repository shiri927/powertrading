import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PackageSimulationData {
  id: string;
  customer_id: string | null;
  scheme_name: string;
  package_type: string;
  estimated_monthly_usage: number | null;
  peak_ratio: number | null;
  flat_ratio: number | null;
  valley_ratio: number | null;
  fixed_price: number | null;
  floating_base_price: number | null;
  floating_price_type: string | null;
  floating_adjustment: number | null;
  purchase_cost: number | null;
  intermediary_cost: number | null;
  transmission_cost: number | null;
  other_costs: number | null;
  total_revenue: number | null;
  total_cost: number | null;
  gross_profit: number | null;
  profit_margin: number | null;
  break_even_price: number | null;
  created_by: string | null;
  created_at: string;
  // 关联的客户信息
  customer?: {
    id: string;
    name: string;
  };
}

export interface CreateSimulationInput {
  customer_id?: string;
  scheme_name: string;
  package_type: 'fixed' | 'floating';
  estimated_monthly_usage: number;
  peak_ratio: number;
  flat_ratio: number;
  valley_ratio: number;
  fixed_price?: number;
  floating_base_price?: number;
  floating_price_type?: string;
  floating_adjustment?: number;
  purchase_cost: number;
  intermediary_cost: number;
  transmission_cost: number;
  other_costs: number;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  profit_margin: number;
  break_even_price: number;
}

export function usePackageSimulations() {
  const [data, setData] = useState<PackageSimulationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('package_simulations')
        .select(`
          *,
          customer:customers(id, name)
        `)
        .order('created_at', { ascending: false });

      // 如果用户已登录，只获取自己的模拟记录
      if (user) {
        query = query.eq('created_by', user.id);
      }

      const { data: simulations, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(simulations || []);
    } catch (err: any) {
      console.error('Error fetching package simulations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSimulation = async (input: CreateSimulationInput): Promise<PackageSimulationData | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: newSimulation, error } = await supabase
        .from('package_simulations')
        .insert({
          ...input,
          created_by: user?.id || null
        })
        .select(`
          *,
          customer:customers(id, name)
        `)
        .single();

      if (error) throw error;

      setData(prev => [newSimulation, ...prev]);
      
      toast({
        title: "保存成功",
        description: "方案已保存到历史记录"
      });

      return newSimulation;
    } catch (err: any) {
      console.error('Error creating simulation:', err);
      toast({
        title: "保存失败",
        description: err.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteSimulation = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('package_simulations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData(prev => prev.filter(s => s.id !== id));
      
      toast({
        title: "删除成功",
        description: "方案已从历史记录中删除"
      });

      return true;
    } catch (err: any) {
      console.error('Error deleting simulation:', err);
      toast({
        title: "删除失败",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    createSimulation,
    deleteSimulation
  };
}

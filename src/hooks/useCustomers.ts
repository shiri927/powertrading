/**
 * 客户管理数据钩子
 * 实现客户CRUD操作与数据库联动
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  package_type: string;
  voltage_level: string;
  industry_type: string | null;
  total_capacity: number | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  contract_status: string;
  price_mode: string | null;
  agent_name: string | null;
  intermediary_cost: number | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type CustomerUpdate = Partial<CustomerInsert>;

// 获取所有客户
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Customer[];
    },
  });
};

// 获取活跃客户
export const useActiveCustomers = () => {
  return useQuery({
    queryKey: ['customers', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('contract_status', 'active')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Customer[];
    },
  });
};

// 获取单个客户
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Customer | null;
    },
    enabled: !!id,
  });
};

// 创建客户
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customer: CustomerInsert) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      
      if (error) throw error;
      return data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: '成功', description: '客户已添加' });
    },
    onError: (error: Error) => {
      toast({ title: '错误', description: error.message, variant: 'destructive' });
    },
  });
};

// 更新客户
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CustomerUpdate }) => {
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: '成功', description: '客户信息已更新' });
    },
    onError: (error: Error) => {
      toast({ title: '错误', description: error.message, variant: 'destructive' });
    },
  });
};

// 删除客户
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: '成功', description: '客户已删除' });
    },
    onError: (error: Error) => {
      toast({ title: '错误', description: error.message, variant: 'destructive' });
    },
  });
};

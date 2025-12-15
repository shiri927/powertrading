import { z } from 'zod';
import { ServiceError, cacheManager, createRealtimeSubscription } from './base-service';
import { supabase } from '@/integrations/supabase/client';

// 客户数据验证Schema
export const customerCreateSchema = z.object({
  customer_code: z.string().min(1, '客户编码不能为空').max(50, '客户编码最多50个字符'),
  name: z.string().min(1, '客户名称不能为空').max(100, '客户名称最多100个字符'),
  voltage_level: z.string().min(1, '电压等级不能为空'),
  package_type: z.string().min(1, '套餐类型不能为空'),
  contract_status: z.string().optional(),
  industry_type: z.string().max(50).optional().nullable(),
  total_capacity: z.number().min(0).optional().nullable(),
  contract_start_date: z.string().optional().nullable(),
  contract_end_date: z.string().optional().nullable(),
  agent_name: z.string().max(50).optional().nullable(),
  contact_person: z.string().max(50).optional().nullable(),
  contact_phone: z.string().max(20).optional().nullable(),
  contact_email: z.string().email('邮箱格式无效').optional().or(z.literal('')).or(z.null()),
  address: z.string().max(200).optional().nullable(),
  price_mode: z.string().optional().nullable(),
  intermediary_cost: z.number().min(0).optional().nullable(),
  is_active: z.boolean().optional(),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  voltage_level: string;
  package_type: string;
  contract_status: string;
  industry_type: string | null;
  total_capacity: number | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  agent_name: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  price_mode: string | null;
  intermediary_cost: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type CustomerCreateDTO = z.infer<typeof customerCreateSchema>;
type CustomerUpdateDTO = z.infer<typeof customerUpdateSchema>;

export const customerService = {
  // 获取所有客户
  async getAll(): Promise<Customer[]> {
    const cacheKey = 'customers:all';
    const cached = cacheManager.get<Customer[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');

    if (error) throw new ServiceError('获取客户列表失败', 'FETCH_ERROR', error);
    cacheManager.set(cacheKey, data);
    return data;
  },

  // 根据ID获取
  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new ServiceError('获取客户失败', 'FETCH_ERROR', error);
    return data;
  },

  // 创建客户
  async create(dto: CustomerCreateDTO): Promise<Customer> {
    const result = customerCreateSchema.safeParse(dto);
    if (!result.success) {
      throw new ServiceError('数据验证失败', 'VALIDATION_ERROR', result.error.errors);
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(result.data as any)
      .select()
      .single();

    if (error) throw new ServiceError('创建客户失败', 'CREATE_ERROR', error);
    cacheManager.invalidate('customers:');
    return data;
  },

  // 更新客户
  async update(id: string, dto: CustomerUpdateDTO): Promise<Customer> {
    const result = customerUpdateSchema.safeParse(dto);
    if (!result.success) {
      throw new ServiceError('数据验证失败', 'VALIDATION_ERROR', result.error.errors);
    }

    const { data, error } = await supabase
      .from('customers')
      .update(result.data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ServiceError('更新客户失败', 'UPDATE_ERROR', error);
    cacheManager.invalidate('customers:');
    return data;
  },

  // 删除客户
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw new ServiceError('删除客户失败', 'DELETE_ERROR', error);
    cacheManager.invalidate('customers:');
  },

  // 获取活跃客户
  async getActive(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw new ServiceError('获取活跃客户失败', 'FETCH_ERROR', error);
    return data;
  },

  // 搜索客户
  async search(keyword: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${keyword}%,customer_code.ilike.%${keyword}%`)
      .order('name');

    if (error) throw new ServiceError('搜索客户失败', 'FETCH_ERROR', error);
    return data;
  },

  // 获取客户统计
  async getStatistics(): Promise<{
    total: number;
    active: number;
    pending: number;
    expiring: number;
  }> {
    const { data, error } = await supabase
      .from('customers')
      .select('contract_status, contract_end_date');

    if (error) throw new ServiceError('获取统计失败', 'FETCH_ERROR', error);

    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      total: data.length,
      active: data.filter(c => c.contract_status === 'active').length,
      pending: data.filter(c => c.contract_status === 'pending').length,
      expiring: data.filter(c => {
        if (!c.contract_end_date) return false;
        const endDate = new Date(c.contract_end_date);
        return endDate <= thirtyDaysLater && endDate >= now;
      }).length,
    };
  },

  // 实时订阅
  subscribe(callback: (payload: { eventType: string; new: Customer | null; old: Customer | null }) => void) {
    return createRealtimeSubscription('customers', callback);
  },
};

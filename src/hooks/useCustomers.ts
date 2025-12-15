/**
 * 客户管理数据钩子
 * 使用服务层实现客户CRUD操作与数据库联动，支持缓存和实时订阅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { customerService, Customer, customerCreateSchema, customerUpdateSchema } from '@/lib/services/customer-service';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

export type { Customer } from '@/lib/services/customer-service';
export type CustomerInsert = z.infer<typeof customerCreateSchema>;
export type CustomerUpdate = z.infer<typeof customerUpdateSchema>;

// 获取所有客户
export const useCustomers = () => {
  const queryClient = useQueryClient();

  // 实时订阅
  useEffect(() => {
    const unsubscribe = customerService.subscribe(({ eventType }) => {
      if (eventType) {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
};

// 获取活跃客户
export const useActiveCustomers = () => {
  return useQuery({
    queryKey: ['customers', 'active'],
    queryFn: () => customerService.getActive(),
    staleTime: 1000 * 60 * 5,
  });
};

// 获取单个客户
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// 获取客户统计
export const useCustomerStats = () => {
  return useQuery({
    queryKey: ['customers', 'statistics'],
    queryFn: () => customerService.getStatistics(),
    staleTime: 1000 * 60 * 2, // 2分钟缓存
  });
};

// 搜索客户
export const useSearchCustomers = (keyword: string) => {
  return useQuery({
    queryKey: ['customers', 'search', keyword],
    queryFn: () => customerService.search(keyword),
    enabled: keyword.length > 0,
    staleTime: 1000 * 30, // 30秒缓存
  });
};

// 创建客户
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (customer: CustomerInsert) => customerService.create(customer),
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
    mutationFn: ({ id, updates }: { id: string; updates: CustomerUpdate }) => 
      customerService.update(id, updates),
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
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: '成功', description: '客户已删除' });
    },
    onError: (error: Error) => {
      toast({ title: '错误', description: error.message, variant: 'destructive' });
    },
  });
};

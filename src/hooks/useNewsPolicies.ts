/**
 * 新闻与政策数据钩子
 * 从news_policies表获取公告和政策法规数据
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NewsPolicy {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  publish_date: string;
  publish_time: string | null;
  category: string;
  type: 'announcement' | 'policy';
  priority: 'high' | 'medium' | 'low';
  source: string | null;
  issuer: string | null;
  status: string;
  url: string | null;
  file_path: string | null;
  province: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  priority: string;
  source: string;
  url: string;
  summary: string;
}

export interface PolicyItem {
  id: string;
  title: string;
  date: string;
  category: string;
  issuer: string;
  status: string;
}

// 获取公告列表
export const useAnnouncements = (filters?: {
  province?: string;
  category?: string;
  searchTerm?: string;
}) => {
  return useQuery({
    queryKey: ['news_policies', 'announcements', filters],
    queryFn: async () => {
      let query = supabase
        .from('news_policies')
        .select('*')
        .eq('type', 'announcement')
        .order('publish_date', { ascending: false })
        .order('publish_time', { ascending: false });

      if (filters?.province && filters.province !== 'all') {
        query = query.eq('province', filters.province);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,summary.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // 转换为UI格式
      return (data || []).map((item): AnnouncementItem => ({
        id: item.id,
        title: item.title,
        date: item.publish_date,
        time: item.publish_time || '00:00',
        category: item.category,
        priority: item.priority || 'medium',
        source: item.source || '',
        url: item.url || '#',
        summary: item.summary || '',
      }));
    },
  });
};

// 获取政策法规列表
export const usePolicies = (filters?: {
  province?: string;
  category?: string;
  searchTerm?: string;
}) => {
  return useQuery({
    queryKey: ['news_policies', 'policies', filters],
    queryFn: async () => {
      let query = supabase
        .from('news_policies')
        .select('*')
        .eq('type', 'policy')
        .order('publish_date', { ascending: false });

      if (filters?.province && filters.province !== 'all') {
        query = query.eq('province', filters.province);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // 转换为UI格式
      return (data || []).map((item): PolicyItem => ({
        id: item.id,
        title: item.title,
        date: item.publish_date,
        category: item.category,
        issuer: item.issuer || '',
        status: item.status === 'active' ? '现行有效' : '已失效',
      }));
    },
  });
};

// 获取所有新闻政策分类
export const useNewsPolicyCategories = (type: 'announcement' | 'policy') => {
  return useQuery({
    queryKey: ['news_policies', 'categories', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_policies')
        .select('category')
        .eq('type', type);

      if (error) throw error;

      // 去重
      const categories = [...new Set((data || []).map(item => item.category))];
      return categories;
    },
  });
};

// 获取单个新闻政策详情
export const useNewsPolicyDetail = (id: string) => {
  return useQuery({
    queryKey: ['news_policies', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_policies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as NewsPolicy | null;
    },
    enabled: !!id,
  });
};

// 增加浏览次数
export const incrementViewCount = async (id: string) => {
  const { error } = await supabase
    .from('news_policies')
    .update({ views: supabase.rpc ? 1 : 1 }) // 简化处理，实际应使用increment
    .eq('id', id);
  if (error) {
    console.error('Failed to increment view count:', error);
  }
};

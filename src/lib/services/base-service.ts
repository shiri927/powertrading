import { supabase } from '@/integrations/supabase/client';

// 通用错误类型
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// 缓存管理器
class CacheManager {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5分钟默认过期

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.defaultTTL),
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }
    return cached.data as T;
  }

  invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheManager = new CacheManager();

// 创建实时订阅
export function createRealtimeSubscription<T>(
  tableName: string,
  callback: (payload: { eventType: string; new: T | null; old: T | null }) => void
) {
  const channel = supabase
    .channel(`${tableName}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
      },
      (payload) => {
        cacheManager.invalidate(`${tableName}:`);
        callback({
          eventType: payload.eventType,
          new: payload.new as T | null,
          old: payload.old as T | null,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// 错误处理工具
export const handleServiceError = (error: unknown, defaultMessage: string = '操作失败'): string => {
  if (error instanceof ServiceError) {
    console.error(`[${error.code}] ${error.message}`, error.details);
    return error.message;
  }
  console.error('Unexpected error:', error);
  return defaultMessage;
};

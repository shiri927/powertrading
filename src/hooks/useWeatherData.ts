/**
 * 气象数据钩子
 * 从weather_data和weather_alerts表获取气象数据
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export interface WeatherDataItem {
  id: string;
  province: string;
  region: string | null;
  station_name: string | null;
  data_source: string | null;
  record_date: string;
  record_hour: number | null;
  temperature: number | null;
  temperature_max: number | null;
  temperature_min: number | null;
  wind_speed: number | null;
  wind_direction: number | null;
  humidity: number | null;
  cloud_cover: number | null;
  pressure: number | null;
  rainfall: number | null;
  snowfall: number | null;
  snow_depth: number | null;
  radiation: number | null;
  forecast_temperature: number | null;
  forecast_wind_speed: number | null;
  forecast_radiation: number | null;
  data_type: 'actual' | 'forecast' | 'station';
}

export interface WeatherAlert {
  id: string;
  province: string;
  region: string | null;
  alert_type: string;
  alert_level: 'blue' | 'yellow' | 'orange' | 'red';
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  is_active: boolean;
}

// 获取小时气象数据
export const useHourlyWeatherData = (filters?: {
  province?: string;
  startDate?: string;
  endDate?: string;
  dataSource?: string;
}) => {
  return useQuery({
    queryKey: ['weather_data', 'hourly', filters],
    queryFn: async () => {
      let query = supabase
        .from('weather_data')
        .select('*')
        .not('record_hour', 'is', null)
        .order('record_date', { ascending: true })
        .order('record_hour', { ascending: true });

      if (filters?.province) {
        query = query.eq('province', filters.province);
      }

      if (filters?.startDate) {
        query = query.gte('record_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('record_date', filters.endDate);
      }

      if (filters?.dataSource) {
        query = query.eq('data_source', filters.dataSource);
      }

      const { data, error } = await query;

      if (error) throw error;

      // 转换为UI格式
      return (data || []).map((item) => ({
        hour: `${format(new Date(item.record_date), 'MM-dd')} ${String(item.record_hour).padStart(2, '0')}:00`,
        temp: Number(item.temperature) || 0,
        wind: Number(item.wind_speed) || 0,
        humidity: Number(item.humidity) || Number(item.cloud_cover) || 0,
        radiation: Number(item.radiation) || 0,
      }));
    },
  });
};

// 获取日均值气象数据
export const useDailyWeatherData = (filters?: {
  province?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['weather_data', 'daily', filters],
    queryFn: async () => {
      let query = supabase
        .from('weather_data')
        .select('*')
        .is('record_hour', null)
        .order('record_date', { ascending: true });

      if (filters?.province) {
        query = query.eq('province', filters.province);
      }

      if (filters?.startDate) {
        query = query.gte('record_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('record_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item) => ({
        date: format(new Date(item.record_date), 'MM-dd'),
        max: Number(item.temperature_max) || 0,
        min: Number(item.temperature_min) || 0,
        avg: Number(item.temperature) || 0,
        wind: Number(item.wind_speed) || 0,
      }));
    },
  });
};

// 获取图表统计数据
export const useChartWeatherData = (filters?: {
  province?: string;
  days?: number;
}) => {
  return useQuery({
    queryKey: ['weather_data', 'chart', filters],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), filters?.days || 7), 'yyyy-MM-dd');
      
      let query = supabase
        .from('weather_data')
        .select('*')
        .is('record_hour', null)
        .gte('record_date', startDate)
        .order('record_date', { ascending: true });

      if (filters?.province) {
        query = query.eq('province', filters.province);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item) => ({
        time: format(new Date(item.record_date), 'MM-dd'),
        temp: Number(item.temperature) || 0,
        wind: Number(item.wind_speed) || 0,
        humidity: Number(item.humidity) || Number(item.cloud_cover) || 0,
        radiation: Number(item.radiation) || 0,
      }));
    },
  });
};

// 获取气象预警
export const useWeatherAlerts = (filters?: {
  province?: string;
  activeOnly?: boolean;
}) => {
  return useQuery({
    queryKey: ['weather_alerts', filters],
    queryFn: async () => {
      let query = supabase
        .from('weather_alerts')
        .select('*')
        .order('start_time', { ascending: false });

      if (filters?.province) {
        query = query.eq('province', filters.province);
      }

      if (filters?.activeOnly !== false) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as WeatherAlert[];
    },
  });
};

// 获取可用省份列表
export const useWeatherProvinces = () => {
  return useQuery({
    queryKey: ['weather_data', 'provinces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weather_data')
        .select('province')
        .order('province');

      if (error) throw error;

      const provinces = [...new Set((data || []).map(item => item.province))];
      return provinces;
    },
  });
};

// 预警级别颜色映射
export const alertLevelColors: Record<string, string> = {
  blue: '#3b82f6',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
};

// 预警级别文本映射
export const alertLevelText: Record<string, string> = {
  blue: '蓝色预警',
  yellow: '黄色预警',
  orange: '橙色预警',
  red: '红色预警',
};

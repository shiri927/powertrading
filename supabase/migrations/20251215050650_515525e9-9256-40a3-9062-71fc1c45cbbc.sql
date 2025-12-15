-- 气象数据表
-- 存储新能源发电相关的气象预报和实测数据

CREATE TABLE public.weather_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL DEFAULT '山东',
  region TEXT, -- 地区
  station_name TEXT, -- 气象站名称
  data_source TEXT DEFAULT '数据版本1', -- 数据来源
  record_date DATE NOT NULL,
  record_hour INTEGER, -- 0-23小时，NULL表示日均值
  -- 气象指标
  temperature NUMERIC, -- 温度 (°C)
  temperature_max NUMERIC, -- 最高温度
  temperature_min NUMERIC, -- 最低温度
  wind_speed NUMERIC, -- 风速 (m/s)
  wind_direction NUMERIC, -- 风向 (度)
  humidity NUMERIC, -- 相对湿度 (%)
  cloud_cover NUMERIC, -- 总云量 (%)
  pressure NUMERIC, -- 气压 (hPa)
  rainfall NUMERIC, -- 降雨量 (mm)
  snowfall NUMERIC, -- 降雪量 (mm)
  snow_depth NUMERIC, -- 积雪厚度 (cm)
  radiation NUMERIC, -- 辐照度 (W/m²)
  -- 预测数据
  forecast_temperature NUMERIC, -- 预测温度
  forecast_wind_speed NUMERIC, -- 预测风速
  forecast_radiation NUMERIC, -- 预测辐照度
  -- 元数据
  data_type TEXT DEFAULT 'actual' CHECK (data_type IN ('actual', 'forecast', 'station')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 气象预警信息表
CREATE TABLE public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL DEFAULT '山东',
  region TEXT,
  alert_type TEXT NOT NULL, -- 预警类型：高温、寒潮、大风、暴雨等
  alert_level TEXT NOT NULL CHECK (alert_level IN ('blue', 'yellow', 'orange', 'red')),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "Allow public read access for weather_data"
ON public.weather_data FOR SELECT USING (true);

CREATE POLICY "Admins can manage weather_data"
ON public.weather_data FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Allow public read access for weather_alerts"
ON public.weather_alerts FOR SELECT USING (true);

CREATE POLICY "Admins can manage weather_alerts"
ON public.weather_alerts FOR ALL USING (is_admin(auth.uid()));

-- 创建索引
CREATE INDEX idx_weather_data_date ON public.weather_data(record_date);
CREATE INDEX idx_weather_data_province ON public.weather_data(province);
CREATE INDEX idx_weather_data_type ON public.weather_data(data_type);
CREATE INDEX idx_weather_alerts_province ON public.weather_alerts(province);
CREATE INDEX idx_weather_alerts_active ON public.weather_alerts(is_active);
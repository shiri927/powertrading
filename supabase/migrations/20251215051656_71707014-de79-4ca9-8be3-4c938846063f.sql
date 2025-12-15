-- 供需预测数据表

-- 1. 新能源出力预测表 (风电/光伏 P10/P50/P90)
CREATE TABLE public.renewable_output_forecast (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL DEFAULT '山东',
  forecast_date DATE NOT NULL,
  energy_type TEXT NOT NULL CHECK (energy_type IN ('wind', 'solar')),
  p10 NUMERIC,
  p50 NUMERIC,
  p90 NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. 负荷预测表
CREATE TABLE public.load_forecast (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL DEFAULT '山东',
  forecast_date DATE NOT NULL,
  predicted NUMERIC,
  historical NUMERIC,
  upper_bound NUMERIC,
  lower_bound NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. 联络线预测表
CREATE TABLE public.tie_line_forecast (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL DEFAULT '山东',
  forecast_date DATE NOT NULL,
  inflow NUMERIC,
  outflow NUMERIC,
  net_position NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. 火电竞价空间预测表
CREATE TABLE public.thermal_bidding_forecast (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL DEFAULT '山东',
  forecast_date DATE NOT NULL,
  bidding_space NUMERIC,
  historical_avg NUMERIC,
  predicted NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. 历史竞价行为分析表
CREATE TABLE public.bidding_behavior_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL DEFAULT '山东',
  price_range TEXT NOT NULL,
  bid_count INTEGER,
  win_rate NUMERIC,
  analysis_month TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.renewable_output_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tie_line_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thermal_bidding_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bidding_behavior_analysis ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略
CREATE POLICY "Allow public read access for renewable_output_forecast" 
ON public.renewable_output_forecast FOR SELECT USING (true);

CREATE POLICY "Allow public read access for load_forecast" 
ON public.load_forecast FOR SELECT USING (true);

CREATE POLICY "Allow public read access for tie_line_forecast" 
ON public.tie_line_forecast FOR SELECT USING (true);

CREATE POLICY "Allow public read access for thermal_bidding_forecast" 
ON public.thermal_bidding_forecast FOR SELECT USING (true);

CREATE POLICY "Allow public read access for bidding_behavior_analysis" 
ON public.bidding_behavior_analysis FOR SELECT USING (true);

-- 管理员策略
CREATE POLICY "Admins can manage renewable_output_forecast" 
ON public.renewable_output_forecast FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage load_forecast" 
ON public.load_forecast FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage tie_line_forecast" 
ON public.tie_line_forecast FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage thermal_bidding_forecast" 
ON public.thermal_bidding_forecast FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage bidding_behavior_analysis" 
ON public.bidding_behavior_analysis FOR ALL USING (is_admin(auth.uid()));

-- 创建索引
CREATE INDEX idx_renewable_output_province_date ON public.renewable_output_forecast(province, forecast_date);
CREATE INDEX idx_load_forecast_province_date ON public.load_forecast(province, forecast_date);
CREATE INDEX idx_tie_line_province_date ON public.tie_line_forecast(province, forecast_date);
CREATE INDEX idx_thermal_bidding_province_date ON public.thermal_bidding_forecast(province, forecast_date);
CREATE INDEX idx_bidding_behavior_province ON public.bidding_behavior_analysis(province);
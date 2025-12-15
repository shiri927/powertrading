-- 创建发电计划表
CREATE TABLE public.power_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trading_unit_id UUID REFERENCES public.trading_units(id),
  plan_year INTEGER NOT NULL,
  plan_month INTEGER, -- NULL表示年度计划，1-12表示月度计划
  plan_type TEXT NOT NULL CHECK (plan_type IN ('annual', 'monthly', 'daily')),
  planned_volume NUMERIC NOT NULL DEFAULT 0, -- 计划电量 MWh
  actual_volume NUMERIC, -- 实际发电量 MWh
  settled_volume NUMERIC, -- 结算电量 MWh
  completion_rate NUMERIC, -- 完成率 %
  deviation_rate NUMERIC, -- 偏差率 %
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'completed', 'cancelled')),
  reference_year INTEGER, -- 参考年份
  reference_volume NUMERIC, -- 参考年份电量
  remarks TEXT,
  created_by UUID,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建发电计划时序数据表（24点/96点数据）
CREATE TABLE public.power_plan_time_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.power_plans(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  time_point INTEGER NOT NULL CHECK (time_point >= 0 AND time_point < 96), -- 0-95 for 96-point, 0-23 for 24-point
  time_granularity TEXT NOT NULL DEFAULT '24' CHECK (time_granularity IN ('24', '96')),
  planned_power NUMERIC, -- 计划功率 MW
  predicted_power NUMERIC, -- 预测功率 MW
  actual_power NUMERIC, -- 实际功率 MW
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.power_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.power_plan_time_series ENABLE ROW LEVEL SECURITY;

-- RLS策略 - 公开读取用于演示
CREATE POLICY "Allow public read access for power_plans" 
ON public.power_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage power_plans" 
ON public.power_plans 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Allow public insert for demo" 
ON public.power_plans 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update for demo" 
ON public.power_plans 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public read access for power_plan_time_series" 
ON public.power_plan_time_series 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage power_plan_time_series" 
ON public.power_plan_time_series 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Allow public insert for time_series demo" 
ON public.power_plan_time_series 
FOR INSERT 
WITH CHECK (true);

-- 创建索引
CREATE INDEX idx_power_plans_trading_unit ON public.power_plans(trading_unit_id);
CREATE INDEX idx_power_plans_year_month ON public.power_plans(plan_year, plan_month);
CREATE INDEX idx_power_plans_status ON public.power_plans(status);
CREATE INDEX idx_power_plan_time_series_plan ON public.power_plan_time_series(plan_id);
CREATE INDEX idx_power_plan_time_series_date ON public.power_plan_time_series(effective_date);

-- 更新时间戳触发器
CREATE TRIGGER update_power_plans_updated_at
BEFORE UPDATE ON public.power_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
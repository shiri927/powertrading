-- 中长期行情数据表
-- 存储各类交易类型的历史价格和成交量数据

-- 1. 中长期市场交易数据（主表）
CREATE TABLE public.medium_long_term_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL DEFAULT '山东',
  trade_date DATE NOT NULL,
  trade_month TEXT NOT NULL, -- 格式: 2025-01
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('centralized', 'rolling', 'bilateral', 'listing')),
  -- 价格数据 (元/MWh)
  avg_price NUMERIC,
  thermal_price NUMERIC, -- 火电价格
  renewable_price NUMERIC, -- 新能源价格
  max_price NUMERIC,
  min_price NUMERIC,
  -- 成交量数据 (MWh)
  volume NUMERIC,
  buy_volume NUMERIC,
  sell_volume NUMERIC,
  matched_volume NUMERIC,
  -- 其他指标
  success_rate NUMERIC, -- 成交成功率
  participants INTEGER, -- 参与方数量
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 添加唯一约束
ALTER TABLE public.medium_long_term_prices 
ADD CONSTRAINT medium_long_term_prices_unique 
UNIQUE (province, trade_date, transaction_type);

-- 2. 价格分布数据表
CREATE TABLE public.price_distribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL DEFAULT '山东',
  trade_month TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('centralized', 'rolling', 'bilateral', 'listing')),
  price_range_start NUMERIC NOT NULL, -- 价格区间开始
  price_range_end NUMERIC NOT NULL, -- 价格区间结束
  count INTEGER NOT NULL DEFAULT 0, -- 该区间交易次数
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.medium_long_term_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_distribution ENABLE ROW LEVEL SECURITY;

-- RLS策略 - 公开读取
CREATE POLICY "Allow public read access for medium_long_term_prices"
ON public.medium_long_term_prices FOR SELECT USING (true);

CREATE POLICY "Admins can manage medium_long_term_prices"
ON public.medium_long_term_prices FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Allow public read access for price_distribution"
ON public.price_distribution FOR SELECT USING (true);

CREATE POLICY "Admins can manage price_distribution"
ON public.price_distribution FOR ALL USING (is_admin(auth.uid()));

-- 创建索引
CREATE INDEX idx_medium_long_term_prices_date ON public.medium_long_term_prices(trade_date);
CREATE INDEX idx_medium_long_term_prices_month ON public.medium_long_term_prices(trade_month);
CREATE INDEX idx_medium_long_term_prices_type ON public.medium_long_term_prices(transaction_type);
CREATE INDEX idx_price_distribution_month ON public.price_distribution(trade_month);
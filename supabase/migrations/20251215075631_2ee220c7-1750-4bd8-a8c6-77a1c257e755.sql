-- 创建分时段交易出清数据表
CREATE TABLE public.time_segment_clearing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trading_unit_id UUID REFERENCES public.trading_units(id),
    clearing_date DATE NOT NULL,
    trading_type TEXT NOT NULL CHECK (trading_type IN ('集中竞价', '滚动撮合', '挂牌交易', '双边协商')),
    trading_sequence TEXT NOT NULL, -- 交易序列，如 '第1序', '第2序'
    period_start INTEGER NOT NULL CHECK (period_start BETWEEN 0 AND 23), -- 时段开始小时
    period_end INTEGER NOT NULL CHECK (period_end BETWEEN 1 AND 24), -- 时段结束小时
    bid_price DECIMAL(10,2), -- 申报价格 ¥/MWh
    clear_price DECIMAL(10,2), -- 出清价格 ¥/MWh
    clear_volume DECIMAL(10,2), -- 出清电量 MWh
    status TEXT NOT NULL DEFAULT 'cleared' CHECK (status IN ('pending', 'cleared', 'failed')),
    clear_time TIMESTAMPTZ, -- 出清时间
    province TEXT NOT NULL DEFAULT '山东',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 创建索引
CREATE INDEX idx_time_segment_clearing_date ON public.time_segment_clearing(clearing_date);
CREATE INDEX idx_time_segment_clearing_unit ON public.time_segment_clearing(trading_unit_id);
CREATE INDEX idx_time_segment_clearing_province ON public.time_segment_clearing(province);

-- 启用RLS
ALTER TABLE public.time_segment_clearing ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Allow public read access for time_segment_clearing"
ON public.time_segment_clearing FOR SELECT USING (true);

CREATE POLICY "Admins can manage time_segment_clearing"
ON public.time_segment_clearing FOR ALL USING (is_admin(auth.uid()));
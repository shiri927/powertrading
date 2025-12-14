-- =============================================
-- 电力交易系统核心数据模型
-- 逻辑分类：场站管理、交易管理、结算管理、客户管理、策略管理
-- =============================================

-- =============================================
-- 第一部分：场站管理 (Station Management)
-- =============================================

-- 1.1 电站基础信息表
CREATE TABLE public.power_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    province TEXT NOT NULL DEFAULT '山东',
    region TEXT, -- 区域
    station_type TEXT NOT NULL CHECK (station_type IN ('wind', 'solar', 'hydro', 'thermal')),
    installed_capacity DECIMAL(10,2) NOT NULL, -- 装机容量 MW
    grid_connection_voltage TEXT, -- 并网电压等级
    commission_date DATE, -- 投产日期
    location_lat DECIMAL(10,6), -- 纬度
    location_lng DECIMAL(10,6), -- 经度
    contact_person TEXT,
    contact_phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 交易单元表
CREATE TABLE public.trading_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES public.power_stations(id) ON DELETE CASCADE,
    unit_code TEXT NOT NULL UNIQUE, -- 交易单元编码
    unit_name TEXT NOT NULL,
    trading_center TEXT NOT NULL, -- 交易中心
    trading_category TEXT NOT NULL CHECK (trading_category IN ('renewable', 'retail')), -- 新能源/售电
    registered_capacity DECIMAL(10,2), -- 注册容量
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 第二部分：合同管理 (Contract Management)
-- =============================================

-- 2.1 合同主表
CREATE TABLE public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trading_unit_id UUID REFERENCES public.trading_units(id) ON DELETE CASCADE,
    contract_no TEXT NOT NULL UNIQUE,
    contract_name TEXT NOT NULL,
    contract_type TEXT NOT NULL CHECK (contract_type IN ('annual_bilateral', 'monthly_bilateral', 'monthly_auction', 'daily_rolling', 'spot')),
    direction TEXT NOT NULL CHECK (direction IN ('purchase', 'sale')),
    counterparty TEXT, -- 交易对手方
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_volume DECIMAL(12,2), -- 合同总电量 MWh
    unit_price DECIMAL(8,2), -- 单价 元/MWh
    total_amount DECIMAL(14,2), -- 合同金额
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 合同分时电量表 (96点/24点)
CREATE TABLE public.contract_time_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    effective_date DATE NOT NULL,
    time_point INTEGER NOT NULL CHECK (time_point BETWEEN 1 AND 96), -- 1-96点 (15分钟粒度)
    volume DECIMAL(10,4), -- 电量 MWh
    price DECIMAL(8,4), -- 价格 元/MWh
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 第三部分：交易管理 (Trading Management)
-- =============================================

-- 3.1 交易日历表
CREATE TABLE public.trading_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trading_center TEXT NOT NULL,
    trading_date DATE NOT NULL,
    sequence_no TEXT NOT NULL, -- 交易序列号
    trading_type TEXT NOT NULL CHECK (trading_type IN ('centralized_auction', 'rolling_match', 'listing', 'bilateral')),
    announcement_time TIMESTAMPTZ,
    submission_deadline TIMESTAMPTZ,
    execution_start DATE,
    execution_end DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'closed', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(trading_center, trading_date, sequence_no)
);

-- 3.2 交易申报表
CREATE TABLE public.trading_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trading_unit_id UUID REFERENCES public.trading_units(id) ON DELETE CASCADE,
    calendar_id UUID REFERENCES public.trading_calendar(id),
    bid_no TEXT NOT NULL UNIQUE,
    bid_type TEXT NOT NULL CHECK (bid_type IN ('buy', 'sell')),
    time_period TEXT, -- 时段
    bid_volume DECIMAL(10,2) NOT NULL, -- 申报电量 MWh
    bid_price DECIMAL(8,2) NOT NULL, -- 申报价格 元/MWh
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'submitted', 'cleared', 'rejected', 'cancelled')),
    submitted_at TIMESTAMPTZ,
    submitted_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 出清记录表
CREATE TABLE public.clearing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID REFERENCES public.trading_bids(id),
    trading_unit_id UUID REFERENCES public.trading_units(id),
    clearing_date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
    trading_type TEXT NOT NULL,
    day_ahead_clear_price DECIMAL(8,2), -- 日前出清价格
    realtime_clear_price DECIMAL(8,2), -- 实时出清价格
    day_ahead_clear_volume DECIMAL(10,2), -- 日前出清电量
    realtime_clear_volume DECIMAL(10,2), -- 实时出清电量
    status TEXT NOT NULL DEFAULT 'cleared' CHECK (status IN ('pending', 'cleared', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 第四部分：结算管理 (Settlement Management)
-- =============================================

-- 4.1 结算记录表
CREATE TABLE public.settlement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trading_unit_id UUID REFERENCES public.trading_units(id),
    settlement_no TEXT NOT NULL UNIQUE,
    settlement_month TEXT NOT NULL, -- YYYYMM格式
    category TEXT NOT NULL, -- 结算大类
    sub_category TEXT, -- 结算子类
    side TEXT NOT NULL CHECK (side IN ('purchase', 'sale')),
    volume DECIMAL(12,4) NOT NULL, -- 电量 MWh
    price DECIMAL(8,4), -- 单价 元/MWh
    amount DECIMAL(14,2) NOT NULL, -- 金额 元
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'settled', 'disputed')),
    remark TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.2 结算单表
CREATE TABLE public.settlement_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trading_unit_id UUID REFERENCES public.trading_units(id),
    statement_no TEXT NOT NULL UNIQUE,
    statement_type TEXT NOT NULL CHECK (statement_type IN ('daily_clearing', 'daily_statement', 'monthly_statement')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_volume DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(14,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'audited', 'archived')),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    audited_at TIMESTAMPTZ,
    audited_by UUID,
    file_path TEXT, -- 文件存储路径
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 第五部分：客户管理 (Customer Management) - 售电侧
-- =============================================

-- 5.1 客户信息表
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    industry_type TEXT, -- 行业类型
    voltage_level TEXT NOT NULL CHECK (voltage_level IN ('10kV', '35kV', '110kV', '220kV')),
    total_capacity DECIMAL(10,2), -- 总装机容量
    package_type TEXT NOT NULL CHECK (package_type IN ('fixed_price', 'floating_price', 'time_segment_price')),
    price_mode TEXT CHECK (price_mode IN ('monthly', 'yearly')),
    contract_start_date DATE,
    contract_end_date DATE,
    contract_status TEXT NOT NULL DEFAULT 'pending' CHECK (contract_status IN ('pending', 'active', 'expired', 'terminated')),
    agent_name TEXT, -- 代理人
    intermediary_cost DECIMAL(8,4), -- 中间费用 元/MWh
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5.2 客户用电记录表
CREATE TABLE public.energy_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    peak_energy DECIMAL(10,4), -- 峰时段电量 MWh
    flat_energy DECIMAL(10,4), -- 平时段电量 MWh
    valley_energy DECIMAL(10,4), -- 谷时段电量 MWh
    total_energy DECIMAL(10,4) NOT NULL, -- 总电量 MWh
    predicted_energy DECIMAL(10,4), -- 预测电量
    actual_energy DECIMAL(10,4), -- 实际电量
    deviation_rate DECIMAL(6,4), -- 偏差率 %
    profit_loss DECIMAL(10,2), -- 盈亏金额
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, usage_date)
);

-- 5.3 套餐模拟表
CREATE TABLE public.package_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    scheme_name TEXT NOT NULL,
    package_type TEXT NOT NULL CHECK (package_type IN ('fixed', 'floating')),
    estimated_monthly_usage DECIMAL(10,2), -- 预估月用电量
    peak_ratio DECIMAL(5,4), -- 峰时占比
    flat_ratio DECIMAL(5,4), -- 平时占比
    valley_ratio DECIMAL(5,4), -- 谷时占比
    fixed_price DECIMAL(8,4), -- 固定电价
    floating_base_price DECIMAL(8,4), -- 浮动基准价
    floating_price_type TEXT, -- 浮动价格类型
    floating_adjustment DECIMAL(6,4), -- 浮动调整系数
    purchase_cost DECIMAL(10,2), -- 购电成本
    intermediary_cost DECIMAL(10,2), -- 中间费用
    transmission_cost DECIMAL(10,2), -- 输配电费
    other_costs DECIMAL(10,2), -- 其他费用
    total_revenue DECIMAL(12,2), -- 总收入
    total_cost DECIMAL(12,2), -- 总成本
    gross_profit DECIMAL(12,2), -- 毛利
    profit_margin DECIMAL(6,4), -- 利润率
    break_even_price DECIMAL(8,4), -- 盈亏平衡电价
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5.4 执行追踪记录表
CREATE TABLE public.execution_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    execution_date DATE NOT NULL,
    execution_period TEXT, -- 执行时段
    executed_volume DECIMAL(10,4) NOT NULL, -- 执行电量
    executed_price DECIMAL(8,4), -- 执行价格
    executed_revenue DECIMAL(10,2), -- 执行收入
    predicted_volume DECIMAL(10,4), -- 预测电量
    allocation_price DECIMAL(8,4), -- 分摊价格
    volume_deviation DECIMAL(10,4), -- 电量偏差
    volume_deviation_rate DECIMAL(6,4), -- 偏差率
    status TEXT NOT NULL DEFAULT 'executing' CHECK (status IN ('executing', 'completed', 'anomaly')),
    execution_progress DECIMAL(5,4), -- 执行进度
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 第六部分：策略管理 (Strategy Management)
-- =============================================

-- 6.1 交易策略表
CREATE TABLE public.trading_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    strategy_type TEXT NOT NULL CHECK (strategy_type IN ('intraday-arbitrage', 'peak-valley', 'dynamic-hedge', 'custom')),
    description TEXT,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    expected_return DECIMAL(6,2), -- 预期收益率
    trigger_conditions JSONB, -- 触发条件配置
    trading_params JSONB, -- 交易参数配置
    risk_control JSONB, -- 风险控制配置
    is_preset BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6.2 回测结果表
CREATE TABLE public.backtest_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.trading_strategies(id) ON DELETE CASCADE,
    user_id UUID,
    backtest_start DATE NOT NULL,
    backtest_end DATE NOT NULL,
    initial_capital DECIMAL(14,2),
    final_capital DECIMAL(14,2),
    cumulative_return DECIMAL(8,4), -- 累计收益率
    sharpe_ratio DECIMAL(6,4), -- 夏普比率
    max_drawdown DECIMAL(6,4), -- 最大回撤
    win_rate DECIMAL(6,4), -- 胜率
    avg_holding_time DECIMAL(8,2), -- 平均持仓时间(小时)
    total_trades INTEGER, -- 总交易次数
    trades_detail JSONB, -- 交易明细
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6.3 策略推荐记录表
CREATE TABLE public.strategy_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.trading_strategies(id),
    user_id UUID,
    trading_unit_id UUID REFERENCES public.trading_units(id),
    recommendation_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    market_status JSONB, -- 市场状态快照
    expected_return DECIMAL(8,4),
    risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10),
    confidence_level DECIMAL(5,4),
    reasoning TEXT[], -- 推荐理由
    suggested_actions JSONB, -- 建议操作
    is_applied BOOLEAN NOT NULL DEFAULT false,
    applied_at TIMESTAMPTZ,
    result_profit DECIMAL(10,2), -- 实际收益
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 第七部分：预测数据 (Prediction Data)
-- =============================================

-- 7.1 负荷预测表
CREATE TABLE public.load_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trading_unit_id UUID REFERENCES public.trading_units(id),
    prediction_date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
    p10 DECIMAL(10,4), -- 10%分位预测
    p50 DECIMAL(10,4), -- 50%分位预测(中值)
    p90 DECIMAL(10,4), -- 90%分位预测
    actual_load DECIMAL(10,4), -- 实际负荷
    confidence DECIMAL(5,4), -- 置信度
    prediction_type TEXT CHECK (prediction_type IN ('ultra_short', 'short', 'medium')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(trading_unit_id, prediction_date, hour)
);

-- 7.2 价格预测表
CREATE TABLE public.price_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province TEXT NOT NULL,
    prediction_date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
    predicted_day_ahead DECIMAL(8,4),
    predicted_realtime DECIMAL(8,4),
    actual_day_ahead DECIMAL(8,4),
    actual_realtime DECIMAL(8,4),
    confidence DECIMAL(5,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(province, prediction_date, hour)
);

-- =============================================
-- 创建索引以优化查询性能
-- =============================================

CREATE INDEX idx_power_stations_province ON public.power_stations(province);
CREATE INDEX idx_power_stations_type ON public.power_stations(station_type);
CREATE INDEX idx_trading_units_station ON public.trading_units(station_id);
CREATE INDEX idx_trading_units_category ON public.trading_units(trading_category);
CREATE INDEX idx_contracts_unit ON public.contracts(trading_unit_id);
CREATE INDEX idx_contracts_type ON public.contracts(contract_type);
CREATE INDEX idx_contracts_dates ON public.contracts(start_date, end_date);
CREATE INDEX idx_trading_calendar_center_date ON public.trading_calendar(trading_center, trading_date);
CREATE INDEX idx_trading_bids_unit ON public.trading_bids(trading_unit_id);
CREATE INDEX idx_trading_bids_status ON public.trading_bids(status);
CREATE INDEX idx_clearing_records_unit_date ON public.clearing_records(trading_unit_id, clearing_date);
CREATE INDEX idx_settlement_records_unit ON public.settlement_records(trading_unit_id);
CREATE INDEX idx_settlement_records_month ON public.settlement_records(settlement_month);
CREATE INDEX idx_customers_status ON public.customers(contract_status);
CREATE INDEX idx_energy_usage_customer_date ON public.energy_usage(customer_id, usage_date);
CREATE INDEX idx_execution_records_customer ON public.execution_records(customer_id);
CREATE INDEX idx_trading_strategies_user ON public.trading_strategies(user_id);
CREATE INDEX idx_backtest_results_strategy ON public.backtest_results(strategy_id);
CREATE INDEX idx_load_predictions_unit_date ON public.load_predictions(trading_unit_id, prediction_date);
CREATE INDEX idx_price_predictions_province_date ON public.price_predictions(province, prediction_date);

-- =============================================
-- 启用 RLS 并创建访问策略
-- =============================================

-- 场站管理相关表
ALTER TABLE public.power_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_units ENABLE ROW LEVEL SECURITY;

-- 合同管理相关表
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_time_series ENABLE ROW LEVEL SECURITY;

-- 交易管理相关表
ALTER TABLE public.trading_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clearing_records ENABLE ROW LEVEL SECURITY;

-- 结算管理相关表
ALTER TABLE public.settlement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_statements ENABLE ROW LEVEL SECURITY;

-- 客户管理相关表
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_records ENABLE ROW LEVEL SECURITY;

-- 策略管理相关表
ALTER TABLE public.trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_recommendations ENABLE ROW LEVEL SECURITY;

-- 预测数据相关表
ALTER TABLE public.load_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_predictions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS 策略：公开读取（登录用户）
-- =============================================

-- 场站和交易单元：所有认证用户可读
CREATE POLICY "Authenticated users can view power stations" ON public.power_stations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view trading units" ON public.trading_units FOR SELECT TO authenticated USING (true);

-- 合同：所有认证用户可读
CREATE POLICY "Authenticated users can view contracts" ON public.contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view contract time series" ON public.contract_time_series FOR SELECT TO authenticated USING (true);

-- 交易日历：所有认证用户可读
CREATE POLICY "Authenticated users can view trading calendar" ON public.trading_calendar FOR SELECT TO authenticated USING (true);

-- 交易申报：用户查看自己提交的
CREATE POLICY "Users can view their own bids" ON public.trading_bids FOR SELECT TO authenticated USING (submitted_by = auth.uid() OR public.is_admin(auth.uid()));

-- 出清记录：所有认证用户可读
CREATE POLICY "Authenticated users can view clearing records" ON public.clearing_records FOR SELECT TO authenticated USING (true);

-- 结算记录：所有认证用户可读
CREATE POLICY "Authenticated users can view settlement records" ON public.settlement_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view settlement statements" ON public.settlement_statements FOR SELECT TO authenticated USING (true);

-- 客户：所有认证用户可读
CREATE POLICY "Authenticated users can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view energy usage" ON public.energy_usage FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view their own package simulations" ON public.package_simulations FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view execution records" ON public.execution_records FOR SELECT TO authenticated USING (true);

-- 策略：用户查看自己的策略和预设策略
CREATE POLICY "Users can view own strategies and presets" ON public.trading_strategies FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_preset = true OR public.is_admin(auth.uid()));
CREATE POLICY "Users can view own backtest results" ON public.backtest_results FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Users can view own recommendations" ON public.strategy_recommendations FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 预测数据：所有认证用户可读
CREATE POLICY "Authenticated users can view load predictions" ON public.load_predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view price predictions" ON public.price_predictions FOR SELECT TO authenticated USING (true);

-- =============================================
-- RLS 策略：管理员完全控制
-- =============================================

CREATE POLICY "Admins can manage power stations" ON public.power_stations FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage trading units" ON public.trading_units FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage contracts" ON public.contracts FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage contract time series" ON public.contract_time_series FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage trading calendar" ON public.trading_calendar FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage trading bids" ON public.trading_bids FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage clearing records" ON public.clearing_records FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage settlement records" ON public.settlement_records FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage settlement statements" ON public.settlement_statements FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage energy usage" ON public.energy_usage FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage package simulations" ON public.package_simulations FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage execution records" ON public.execution_records FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage trading strategies" ON public.trading_strategies FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage backtest results" ON public.backtest_results FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage strategy recommendations" ON public.strategy_recommendations FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage load predictions" ON public.load_predictions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage price predictions" ON public.price_predictions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS 策略：用户写入自己的数据
-- =============================================

CREATE POLICY "Users can insert own trading bids" ON public.trading_bids FOR INSERT TO authenticated WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "Users can update own trading bids" ON public.trading_bids FOR UPDATE TO authenticated USING (submitted_by = auth.uid() AND status IN ('draft', 'pending'));

CREATE POLICY "Users can insert own strategies" ON public.trading_strategies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own strategies" ON public.trading_strategies FOR UPDATE TO authenticated USING (user_id = auth.uid() AND is_preset = false);
CREATE POLICY "Users can delete own strategies" ON public.trading_strategies FOR DELETE TO authenticated USING (user_id = auth.uid() AND is_preset = false);

CREATE POLICY "Users can insert own backtest" ON public.backtest_results FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own recommendations" ON public.strategy_recommendations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own recommendations" ON public.strategy_recommendations FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own package simulations" ON public.package_simulations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- =============================================
-- 创建更新时间触发器
-- =============================================

CREATE TRIGGER update_power_stations_updated_at BEFORE UPDATE ON public.power_stations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trading_units_updated_at BEFORE UPDATE ON public.trading_units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trading_bids_updated_at BEFORE UPDATE ON public.trading_bids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settlement_records_updated_at BEFORE UPDATE ON public.settlement_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trading_strategies_updated_at BEFORE UPDATE ON public.trading_strategies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
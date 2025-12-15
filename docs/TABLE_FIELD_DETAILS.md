# 数据表字段详细说明

> 本文档提供所有46个数据表的完整字段定义，包含数据类型、约束条件、默认值和业务说明。

## 目录

1. [场站管理模块](#1-场站管理模块)
2. [合同管理模块](#2-合同管理模块)
3. [交易管理模块](#3-交易管理模块)
4. [结算管理模块](#4-结算管理模块)
5. [客户管理模块](#5-客户管理模块)
6. [策略管理模块](#6-策略管理模块)
7. [预测数据模块](#7-预测数据模块)
8. [市场数据模块](#8-市场数据模块)
9. [系统管理模块](#9-系统管理模块)

---

## 1. 场站管理模块

### 1.1 power_stations (电站信息表)

存储新能源电站的基础信息，是交易单元的上级管理实体。

```sql
CREATE TABLE public.power_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,                              -- 电站名称，如"山东省场站A"
  province text NOT NULL DEFAULT '山东',            -- 所属省份
  region text,                                     -- 所属区域/地市
  station_type text NOT NULL,                      -- 类型: wind(风电)/solar(光伏)/hydro(水电)
  installed_capacity numeric NOT NULL,             -- 装机容量(MW)
  grid_connection_voltage text,                    -- 并网电压: 10kV/35kV/110kV/220kV
  commission_date date,                            -- 投产日期
  location_lat numeric,                            -- 纬度坐标
  location_lng numeric,                            -- 经度坐标
  contact_person text,                             -- 联系人姓名
  contact_phone text,                              -- 联系电话
  is_active boolean NOT NULL DEFAULT true,         -- 是否启用
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**业务规则**:
- 电站名称需唯一
- 装机容量 > 0
- 坐标范围: 纬度 [18, 54], 经度 [73, 135] (中国范围)

### 1.2 trading_units (交易单元表)

电站在交易市场注册的交易主体，一个电站可有多个交易单元。

```sql
CREATE TABLE public.trading_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid REFERENCES power_stations(id),   -- 关联电站
  unit_code text NOT NULL,                         -- 交易单元编码，唯一
  unit_name text NOT NULL,                         -- 交易单元名称
  trading_center text NOT NULL,                    -- 交易中心: 山东电力交易中心/山西电力交易中心
  trading_category text NOT NULL,                  -- 交易类别: renewable(新能源)/retail(售电)
  registered_capacity numeric,                     -- 注册交易容量(MW)
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**业务规则**:
- unit_code 全局唯一
- registered_capacity <= 关联电站的 installed_capacity

---

## 2. 合同管理模块

### 2.1 contracts (合同主表)

中长期交易合同的主表，记录合同基本信息。

```sql
CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_unit_id uuid REFERENCES trading_units(id),
  contract_no text NOT NULL,                       -- 合同编号，唯一
  contract_name text NOT NULL,                     -- 合同名称
  contract_type text NOT NULL,                     -- 类型: annual(年度)/monthly(月度)/spot(现货)
  direction text NOT NULL,                         -- 方向: buy(购入)/sell(售出)
  counterparty text,                               -- 交易对手方名称
  start_date date NOT NULL,                        -- 合同开始日期
  end_date date NOT NULL,                          -- 合同结束日期
  total_volume numeric,                            -- 合同总电量(MWh)
  unit_price numeric,                              -- 合同单价(元/MWh)
  total_amount numeric,                            -- 合同总金额(元)
  status text NOT NULL DEFAULT 'active',           -- 状态: active/expired/terminated
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**业务规则**:
- end_date >= start_date
- total_amount = total_volume * unit_price

### 2.2 contract_time_series (合同时序数据表)

合同的分时段电量和价格信息。

```sql
CREATE TABLE public.contract_time_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id),
  effective_date date NOT NULL,                    -- 生效日期
  time_point integer NOT NULL,                     -- 时间点(1-96为15分钟, 1-24为小时)
  volume numeric,                                  -- 该时段电量(MWh)
  price numeric,                                   -- 该时段价格(元/MWh)
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**业务规则**:
- time_point: 日内96点粒度 [1-96] 或 24点粒度 [1-24]

---

## 3. 交易管理模块

### 3.1 trading_calendar (交易日历表)

交易中心发布的交易时间安排。

```sql
CREATE TABLE public.trading_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_center text NOT NULL,                    -- 交易中心名称
  trading_date date NOT NULL,                      -- 交易日期
  sequence_no text NOT NULL,                       -- 交易序号，如"2025-001"
  trading_type text NOT NULL,                      -- 类型: monthly/rolling/day_ahead/realtime
  announcement_time timestamptz,                   -- 公告发布时间
  submission_deadline timestamptz,                 -- 申报截止时间
  execution_start date,                            -- 执行起始日期
  execution_end date,                              -- 执行截止日期
  status text NOT NULL DEFAULT 'pending',          -- 状态: pending/open/closed/cancelled
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 3.2 trading_bids (交易报价表)

用户提交的交易申报记录。

```sql
CREATE TABLE public.trading_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_unit_id uuid REFERENCES trading_units(id),
  calendar_id uuid REFERENCES trading_calendar(id),
  bid_no text NOT NULL,                            -- 报价编号
  bid_type text NOT NULL,                          -- 类型: buy/sell
  bid_volume numeric NOT NULL,                     -- 申报电量(MWh)
  bid_price numeric NOT NULL,                      -- 申报价格(元/MWh)
  time_period text,                                -- 时段描述，如"1-6"
  submitted_at timestamptz,                        -- 提交时间
  submitted_by uuid,                               -- 提交用户ID
  status text NOT NULL DEFAULT 'pending',          -- 状态: draft/pending/submitted/cleared/cancelled
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**业务规则**:
- bid_volume > 0
- bid_price 在市场允许范围内 (通常 0-2000 元/MWh)

### 3.3 clearing_records (出清记录表)

交易出清结果记录，按小时记录出清价格和电量。

```sql
CREATE TABLE public.clearing_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id uuid REFERENCES trading_bids(id),
  trading_unit_id uuid REFERENCES trading_units(id),
  clearing_date date NOT NULL,                     -- 出清日期
  hour integer NOT NULL,                           -- 小时 [1-24]
  trading_type text NOT NULL,                      -- 类型: day_ahead/realtime
  day_ahead_clear_price numeric,                   -- 日前出清价格
  realtime_clear_price numeric,                    -- 实时出清价格
  day_ahead_clear_volume numeric,                  -- 日前出清电量
  realtime_clear_volume numeric,                   -- 实时出清电量
  status text NOT NULL DEFAULT 'cleared',          -- 状态: cleared/settled
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 3.4 time_segment_clearing (分时段出清表)

按时段分组的出清记录，支持任意时段划分。

```sql
CREATE TABLE public.time_segment_clearing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_unit_id uuid REFERENCES trading_units(id),
  clearing_date date NOT NULL,
  trading_type text NOT NULL,                      -- day_ahead/realtime
  trading_sequence text NOT NULL,                  -- 交易序号
  period_start integer NOT NULL,                   -- 起始时段 [1-24]
  period_end integer NOT NULL,                     -- 结束时段 [1-24]
  bid_price numeric,                               -- 申报价格
  clear_price numeric,                             -- 出清价格
  clear_volume numeric,                            -- 出清电量
  clear_time timestamptz,                          -- 出清时间
  province text NOT NULL DEFAULT '山东',
  status text NOT NULL DEFAULT 'cleared',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 4. 结算管理模块

### 4.1 settlement_records (结算记录表)

月度结算明细记录。

```sql
CREATE TABLE public.settlement_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_unit_id uuid REFERENCES trading_units(id),
  settlement_no text NOT NULL,                     -- 结算编号
  settlement_month text NOT NULL,                  -- 结算月份 "YYYY-MM"
  category text NOT NULL,                          -- 类别: 电能量结算/权益凭证分配/偏差考核/结算调整/扣减收入
  sub_category text,                               -- 子类别
  side text NOT NULL,                              -- 批发侧/零售侧: wholesale/retail
  volume numeric NOT NULL,                         -- 结算电量(MWh)
  price numeric,                                   -- 结算价格(元/MWh)
  amount numeric NOT NULL,                         -- 结算金额(元)
  status text NOT NULL DEFAULT 'pending',          -- 状态: pending/confirmed/disputed
  remark text,                                     -- 备注
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**结算类别说明**:
| category | 说明 |
|----------|------|
| 电能量结算 | 日前/实时市场电能量费用 |
| 权益凭证分配 | 绿证、碳配额等权益分配 |
| 偏差考核 | 预测偏差的考核费用 |
| 结算调整 | 事后结算差额调整 |
| 扣减收入 | 各类扣款 |

### 4.2 settlement_statements (结算单据表)

结算单据汇总信息。

```sql
CREATE TABLE public.settlement_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_unit_id uuid REFERENCES trading_units(id),
  statement_no text NOT NULL,                      -- 单据编号
  statement_type text NOT NULL,                    -- 类型: monthly/quarterly/annual
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_volume numeric NOT NULL,                   -- 总电量
  total_amount numeric NOT NULL,                   -- 总金额
  status text NOT NULL DEFAULT 'pending',          -- 状态: pending/audited/finalized
  file_path text,                                  -- 附件路径
  generated_at timestamptz NOT NULL DEFAULT now(),
  audited_at timestamptz,
  audited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 5. 客户管理模块

### 5.1 customers (客户信息表)

售电公司的零售客户信息。

```sql
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code text NOT NULL,                     -- 客户编码，唯一
  name text NOT NULL,                              -- 客户名称
  voltage_level text NOT NULL,                     -- 电压等级: 10kV/35kV/110kV/220kV
  package_type text NOT NULL,                      -- 套餐类型: fixed/floating/hybrid
  industry_type text,                              -- 行业类型: 制造业/商业/服务业等
  total_capacity numeric,                          -- 总用电容量(kVA)
  agent_name text,                                 -- 代理商名称
  price_mode text,                                 -- 定价模式
  intermediary_cost numeric,                       -- 中介成本(元/MWh)
  contract_start_date date,
  contract_end_date date,
  contract_status text NOT NULL DEFAULT 'pending', -- active/expired/pending
  contact_person text,
  contact_phone text,
  contact_email text,
  address text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 5.2 energy_usage (用电数据表)

客户日用电量数据。

```sql
CREATE TABLE public.energy_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  usage_date date NOT NULL,
  peak_energy numeric,                             -- 峰时电量(kWh)
  flat_energy numeric,                             -- 平时电量(kWh)
  valley_energy numeric,                           -- 谷时电量(kWh)
  total_energy numeric NOT NULL,                   -- 总电量(kWh)
  predicted_energy numeric,                        -- 预测电量(kWh)
  actual_energy numeric,                           -- 实际电量(kWh)
  deviation_rate numeric,                          -- 偏差率(%) = (actual - predicted) / predicted * 100
  profit_loss numeric,                             -- 盈亏金额(元)
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**业务规则**:
- total_energy = peak_energy + flat_energy + valley_energy
- 偏差率 > 10% 需要重点关注

### 5.3 execution_records (执行记录表)

客户合同执行情况跟踪。

```sql
CREATE TABLE public.execution_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  execution_date date NOT NULL,
  execution_period text,                           -- 执行周期描述
  predicted_volume numeric,                        -- 预测电量
  executed_volume numeric NOT NULL,                -- 实际执行电量
  volume_deviation numeric,                        -- 电量偏差
  volume_deviation_rate numeric,                   -- 偏差率(%)
  executed_price numeric,                          -- 执行价格
  allocation_price numeric,                        -- 分配价格
  executed_revenue numeric,                        -- 执行收入
  execution_progress numeric,                      -- 执行进度(%)
  status text NOT NULL DEFAULT 'executing',        -- executing/completed/abnormal
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 5.4 package_simulations (套餐模拟表)

售电套餐模拟计算方案。

```sql
CREATE TABLE public.package_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  scheme_name text NOT NULL,                       -- 方案名称
  package_type text NOT NULL,                      -- 套餐类型: fixed/floating
  estimated_monthly_usage numeric,                 -- 预估月用电量(kWh)
  peak_ratio numeric,                              -- 峰时占比(%)
  flat_ratio numeric,                              -- 平时占比(%)
  valley_ratio numeric,                            -- 谷时占比(%)
  -- 固定电价参数
  fixed_price numeric,                             -- 固定电价(元/kWh)
  -- 浮动电价参数
  floating_price_type text,                        -- 浮动基准: 年度/月度/日均
  floating_base_price numeric,                     -- 基准价格
  floating_adjustment numeric,                     -- 浮动调整系数
  -- 成本项
  purchase_cost numeric,                           -- 购电成本(元)
  intermediary_cost numeric,                       -- 中介成本(元)
  transmission_cost numeric,                       -- 输配电成本(元)
  other_costs numeric,                             -- 其他成本(元)
  -- 收益计算
  total_revenue numeric,                           -- 总收入(元)
  total_cost numeric,                              -- 总成本(元)
  gross_profit numeric,                            -- 毛利润(元)
  profit_margin numeric,                           -- 利润率(%)
  break_even_price numeric,                        -- 保本电价(元/kWh)
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**业务规则**:
- peak_ratio + flat_ratio + valley_ratio = 100
- gross_profit = total_revenue - total_cost
- profit_margin = gross_profit / total_revenue * 100

---

## 6. 策略管理模块

### 6.1 trading_strategies (交易策略表)

交易策略配置，包含触发条件、交易参数和风控规则。

```sql
CREATE TABLE public.trading_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  description text,
  strategy_type text NOT NULL,                     -- 类型: intraday_arbitrage/peak_valley/dynamic_hedge
  risk_level text NOT NULL,                        -- 风险等级: low/medium/high
  trigger_conditions jsonb,                        -- 触发条件(JSONB)
  trading_params jsonb,                            -- 交易参数(JSONB)
  risk_control jsonb,                              -- 风控参数(JSONB)
  expected_return numeric,                         -- 预期年化收益率(%)
  is_preset boolean NOT NULL DEFAULT false,        -- 是否为系统预设
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**JSONB字段结构**:

```json
// trigger_conditions
{
  "p50_threshold": 100,        // P50预测值阈值(MW)
  "price_threshold": 300,      // 价格阈值(元/MWh)
  "confidence_min": 70         // 最小置信度(%)
}

// trading_params
{
  "max_position": 50,          // 最大持仓(MW)
  "single_trade_limit": 10,    // 单笔交易限额(MW)
  "daily_trade_limit": 5       // 日交易次数上限
}

// risk_control
{
  "stop_loss": 5,              // 止损比例(%)
  "take_profit": 15,           // 止盈比例(%)
  "max_drawdown": 10           // 最大回撤(%)
}
```

### 6.2 backtest_results (回测结果表)

策略历史回测的结果记录。

```sql
CREATE TABLE public.backtest_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid REFERENCES trading_strategies(id),
  user_id uuid,
  backtest_start date NOT NULL,
  backtest_end date NOT NULL,
  initial_capital numeric,                         -- 初始资金(元)
  final_capital numeric,                           -- 最终资金(元)
  cumulative_return numeric,                       -- 累计收益率(%)
  sharpe_ratio numeric,                            -- 夏普比率
  max_drawdown numeric,                            -- 最大回撤(%)
  win_rate numeric,                                -- 胜率(%)
  avg_holding_time numeric,                        -- 平均持仓时间(小时)
  total_trades integer,                            -- 总交易次数
  trades_detail jsonb,                             -- 交易明细(JSONB数组)
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**trades_detail结构**:
```json
[
  {
    "timestamp": "2025-11-01T10:00:00Z",
    "operation": "buy",
    "price": 320.5,
    "volume": 10,
    "profit": 1500,
    "cumulative_return": 1.5
  }
]
```

### 6.3 strategy_recommendations (策略推荐表)

AI生成的策略推荐记录。

```sql
CREATE TABLE public.strategy_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid REFERENCES trading_strategies(id),
  user_id uuid,
  trading_unit_id uuid REFERENCES trading_units(id),
  recommendation_time timestamptz NOT NULL DEFAULT now(),
  market_status jsonb,                             -- 当前市场状态
  expected_return numeric,                         -- 预期收益(%)
  risk_score integer,                              -- 风险评分(1-10)
  confidence_level numeric,                        -- 置信度(%)
  reasoning text[],                                -- 推荐理由(数组)
  suggested_actions jsonb,                         -- 建议操作
  is_applied boolean NOT NULL DEFAULT false,
  applied_at timestamptz,
  result_profit numeric,                           -- 实际收益(元)
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 7. 预测数据模块

### 7.1 load_predictions (负荷预测表)

交易单元的负荷/出力预测数据。

```sql
CREATE TABLE public.load_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_unit_id uuid REFERENCES trading_units(id),
  prediction_date date NOT NULL,
  hour integer NOT NULL,                           -- 小时 [1-24]
  prediction_type text,                            -- ultra_short/short/medium
  p10 numeric,                                     -- P10分位数预测
  p50 numeric,                                     -- P50分位数预测(中位数)
  p90 numeric,                                     -- P90分位数预测
  actual_load numeric,                             -- 实际值(回填)
  confidence numeric,                              -- 预测置信度(%)
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**预测类型说明**:
| prediction_type | 时间范围 | 用途 |
|-----------------|----------|------|
| ultra_short | 0-4小时 | 实时调度 |
| short | 1-3天 | 日前交易 |
| medium | 7-30天 | 中长期规划 |

### 7.2 price_predictions (价格预测表)

电力市场价格预测数据。

```sql
CREATE TABLE public.price_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province text NOT NULL,
  prediction_date date NOT NULL,
  hour integer NOT NULL,
  predicted_day_ahead numeric,                     -- 预测日前价格
  predicted_realtime numeric,                      -- 预测实时价格
  actual_day_ahead numeric,                        -- 实际日前价格(回填)
  actual_realtime numeric,                         -- 实际实时价格(回填)
  confidence numeric,                              -- 置信度(%)
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 7.3 market_clearing_prices (市场出清价格表)

市场发布的官方出清价格。

```sql
CREATE TABLE public.market_clearing_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province text NOT NULL DEFAULT '山东',
  price_date date NOT NULL,
  hour integer NOT NULL,                           -- 小时 [1-24]
  day_ahead_price numeric,                         -- 日前出清价格(元/MWh)
  realtime_price numeric,                          -- 实时出清价格(元/MWh)
  created_at timestamptz DEFAULT now(),
  UNIQUE (province, price_date, hour)
);
```

### 7.4 其他预测表

```sql
-- 负荷预报(省级)
CREATE TABLE public.load_forecast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province text NOT NULL DEFAULT '山东',
  forecast_date date NOT NULL,
  predicted numeric,                               -- 预测负荷(MW)
  historical numeric,                              -- 历史同期(MW)
  upper_bound numeric,                             -- 上界
  lower_bound numeric,                             -- 下界
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 新能源出力预测
CREATE TABLE public.renewable_output_forecast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province text NOT NULL DEFAULT '山东',
  energy_type text NOT NULL,                       -- wind/solar
  forecast_date date NOT NULL,
  p10 numeric,
  p50 numeric,
  p90 numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 联络线预测
CREATE TABLE public.tie_line_forecast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province text NOT NULL DEFAULT '山东',
  forecast_date date NOT NULL,
  inflow numeric,                                  -- 省外流入(MW)
  outflow numeric,                                 -- 省外流出(MW)
  net_position numeric,                            -- 净位置(MW)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 火电竞价预测
CREATE TABLE public.thermal_bidding_forecast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province text NOT NULL DEFAULT '山东',
  forecast_date date NOT NULL,
  bidding_space numeric,                           -- 竞价空间(MW)
  historical_avg numeric,
  predicted numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 8. 市场数据模块

### 8.1 medium_long_term_prices (中长期价格表)

中长期交易市场成交数据。

```sql
CREATE TABLE public.medium_long_term_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province text NOT NULL DEFAULT '山东',
  trade_date date NOT NULL,
  trade_month text NOT NULL,                       -- 交易月份 "YYYY-MM"
  transaction_type text NOT NULL,                  -- 交易类型
  avg_price numeric,                               -- 平均成交价格
  max_price numeric,
  min_price numeric,
  thermal_price numeric,                           -- 火电成交价
  renewable_price numeric,                         -- 新能源成交价
  volume numeric,                                  -- 成交电量
  buy_volume numeric,                              -- 买方申报量
  sell_volume numeric,                             -- 卖方申报量
  matched_volume numeric,                          -- 撮合成交量
  success_rate numeric,                            -- 成交率(%)
  participants integer,                            -- 参与主体数
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 8.2 weather_data (气象数据表)

气象观测和预报数据。

```sql
CREATE TABLE public.weather_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province text NOT NULL DEFAULT '山东',
  region text,
  station_name text,
  record_date date NOT NULL,
  record_hour integer,
  data_type text DEFAULT 'actual',                 -- actual/forecast
  data_source text DEFAULT '数据版本1',
  temperature numeric,                             -- 温度(℃)
  temperature_max numeric,
  temperature_min numeric,
  wind_speed numeric,                              -- 风速(m/s)
  wind_direction numeric,                          -- 风向(度)
  humidity numeric,                                -- 湿度(%)
  pressure numeric,                                -- 气压(hPa)
  cloud_cover numeric,                             -- 云量(%)
  radiation numeric,                               -- 辐射量(W/m²)
  rainfall numeric,                                -- 降雨量(mm)
  snowfall numeric,
  snow_depth numeric,
  forecast_temperature numeric,
  forecast_wind_speed numeric,
  forecast_radiation numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 8.3 news_policies (新闻政策表)

行业新闻和政策文件。

```sql
CREATE TABLE public.news_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  summary text,
  category text NOT NULL,                          -- 市场动态/政策法规/行业新闻/交易公告
  type text NOT NULL DEFAULT 'announcement',       -- announcement/policy/news/analysis
  priority text DEFAULT 'medium',                  -- high/medium/low
  publish_date date NOT NULL,
  publish_time time,
  source text,
  issuer text,
  province text DEFAULT '山东',
  status text DEFAULT 'active',
  url text,
  file_path text,
  views integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 8.4 能源行情系列表

```sql
-- 原油报价
CREATE TABLE public.energy_crude_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,                          -- 油种类别
  contract text,                                   -- 合约月份
  name text,
  quote_date date NOT NULL DEFAULT CURRENT_DATE,
  quote_time time,
  price numeric NOT NULL,                          -- 价格(美元/桶)
  change_value numeric DEFAULT 0,
  change_percent numeric DEFAULT 0,
  ytd numeric DEFAULT 0,                           -- 年初至今涨幅
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 成品油价格
CREATE TABLE public.energy_refined_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quote_date date NOT NULL DEFAULT CURRENT_DATE,
  price numeric NOT NULL,
  change_value numeric DEFAULT 0,
  change_percent numeric DEFAULT 0,
  ytd numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 裂解价差
CREATE TABLE public.energy_crack_spreads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quote_date date NOT NULL DEFAULT CURRENT_DATE,
  price numeric NOT NULL,
  change_value numeric DEFAULT 0,
  change_percent numeric DEFAULT 0,
  ytd numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 库存数据
CREATE TABLE public.energy_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quote_date date NOT NULL DEFAULT CURRENT_DATE,
  value text NOT NULL,
  change_text text,
  change_percent text,
  status text DEFAULT 'up',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 能源股票
CREATE TABLE public.energy_related_stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  quote_date date NOT NULL DEFAULT CURRENT_DATE,
  price numeric NOT NULL,
  change_value numeric DEFAULT 0,
  change_percent numeric DEFAULT 0,
  ytd numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 9. 系统管理模块

### 9.1 profiles (用户资料表)

用户基本信息，与 auth.users 关联。

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,                             -- 关联 auth.users(id)
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  department text,
  position text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**注意**: 通过 `handle_new_user()` 触发器自动创建。

### 9.2 user_roles (用户角色表)

用户角色分配，独立于 profiles 表以防止权限提升攻击。

```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,                          -- admin/renewable_generation/retail_business
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid,
  UNIQUE (user_id, role)
);
```

### 9.3 permissions (权限配置表)

模块级细粒度权限控制。

```sql
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module text NOT NULL,                            -- 模块名称
  can_view boolean NOT NULL DEFAULT true,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  can_approve boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 9.4 user_business_scope (业务范围表)

用户可访问的业务范围配置。

```sql
CREATE TABLE public.user_business_scope (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scope_type text NOT NULL,                        -- trading_unit/province/trading_center
  scope_id text NOT NULL,
  scope_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 9.5 report_templates (报表模板表)

自定义报表模板配置。

```sql
CREATE TABLE public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  description text,
  config jsonb NOT NULL,                           -- 报表配置(JSONB)
  is_preset boolean NOT NULL DEFAULT false,
  is_shared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**config结构**:
```json
{
  "dataSource": "settlement_records",
  "rows": ["settlement_month", "category"],
  "columns": ["side"],
  "values": [
    {"field": "volume", "aggregation": "sum"},
    {"field": "amount", "aggregation": "sum"}
  ],
  "filters": {
    "status": ["confirmed"]
  }
}
```

### 9.6 analysis_reports (分析报告表)

系统生成或用户上传的分析报告。

```sql
CREATE TABLE public.analysis_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_unit_id uuid REFERENCES trading_units(id),
  name text NOT NULL,
  category text NOT NULL,                          -- 月度报告/季度报告/专题分析
  period text NOT NULL,                            -- 报告周期 "2025-11" 或 "2025-Q4"
  author text NOT NULL,
  content text,
  summary text,
  status text NOT NULL DEFAULT 'draft',            -- draft/published/archived
  publish_date date,
  views integer DEFAULT 0,
  file_path text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 附录: 数据验证规则

### 通用验证

| 字段类型 | 验证规则 |
|----------|----------|
| 电量(MWh/kWh) | >= 0, 精度2位小数 |
| 价格(元/MWh) | 0 ~ 2000, 精度2位小数 |
| 百分比(%) | 0 ~ 100, 精度2位小数 |
| 小时 | 1 ~ 24 整数 |
| 时段(96点) | 1 ~ 96 整数 |
| 日期 | ISO 8601 格式 |
| UUID | RFC 4122 格式 |

### 业务关联验证

| 关联 | 验证规则 |
|------|----------|
| trading_unit → station | station.is_active = true |
| contract → trading_unit | trading_unit.is_active = true |
| 合同日期 | end_date >= start_date |
| 结算金额 | amount = volume * price |
| 峰平谷占比 | peak + flat + valley = 100% |

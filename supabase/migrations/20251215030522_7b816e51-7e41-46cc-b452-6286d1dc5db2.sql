-- 为演示目的添加公开读取策略
-- 注意：生产环境应该使用认证用户策略

-- energy_usage表
CREATE POLICY "Allow public read access for demo"
ON public.energy_usage
FOR SELECT
USING (true);

-- execution_records表
CREATE POLICY "Allow public read access for demo"
ON public.execution_records
FOR SELECT
USING (true);

-- trading_strategies表 (预设策略需要公开访问)
CREATE POLICY "Allow public read access for demo"
ON public.trading_strategies
FOR SELECT
USING (true);

-- package_simulations表
CREATE POLICY "Allow public read access for demo"
ON public.package_simulations
FOR SELECT
USING (true);

-- power_stations表
CREATE POLICY "Allow public read access for demo"
ON public.power_stations
FOR SELECT
USING (true);

-- contracts表
CREATE POLICY "Allow public read access for demo"
ON public.contracts
FOR SELECT
USING (true);

-- load_predictions表
CREATE POLICY "Allow public read access for demo"
ON public.load_predictions
FOR SELECT
USING (true);

-- price_predictions表
CREATE POLICY "Allow public read access for demo"
ON public.price_predictions
FOR SELECT
USING (true);
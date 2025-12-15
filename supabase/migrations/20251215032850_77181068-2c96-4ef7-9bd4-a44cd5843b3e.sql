-- 为 trading_units 表添加 public 读取策略
CREATE POLICY "Allow public read access for trading units" 
ON public.trading_units 
FOR SELECT 
TO public
USING (true);

-- 为 trading_calendar 表添加 public 读取策略
CREATE POLICY "Allow public read access for trading calendar" 
ON public.trading_calendar 
FOR SELECT 
TO public
USING (true);
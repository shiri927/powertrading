-- 添加允许匿名用户读取customers表的策略（仅用于演示目的）
-- 注意：生产环境应该使用认证用户策略

CREATE POLICY "Allow public read access for demo"
ON public.customers
FOR SELECT
USING (true);
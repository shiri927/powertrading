-- 为演示目的添加公开插入策略
-- 注意：生产环境应该使用认证用户策略

CREATE POLICY "Allow public insert for demo"
ON public.package_simulations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update for demo"
ON public.package_simulations
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete for demo"
ON public.package_simulations
FOR DELETE
USING (true);
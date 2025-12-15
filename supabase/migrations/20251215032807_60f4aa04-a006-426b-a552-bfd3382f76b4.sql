-- 删除现有的 RESTRICTIVE 策略并重新创建为 PERMISSIVE 策略

-- settlement_records 表
DROP POLICY IF EXISTS "Admins can manage settlement records" ON public.settlement_records;
DROP POLICY IF EXISTS "Authenticated users can view settlement records" ON public.settlement_records;

CREATE POLICY "settlement_records_public_read" 
ON public.settlement_records 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "settlement_records_admin_all" 
ON public.settlement_records 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));

-- settlement_statements 表
DROP POLICY IF EXISTS "Admins can manage settlement statements" ON public.settlement_statements;
DROP POLICY IF EXISTS "Authenticated users can view settlement statements" ON public.settlement_statements;

CREATE POLICY "settlement_statements_public_read" 
ON public.settlement_statements 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "settlement_statements_admin_all" 
ON public.settlement_statements 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));

-- clearing_records 表
DROP POLICY IF EXISTS "Admins can manage clearing records" ON public.clearing_records;
DROP POLICY IF EXISTS "Authenticated users can view clearing records" ON public.clearing_records;

CREATE POLICY "clearing_records_public_read" 
ON public.clearing_records 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "clearing_records_admin_all" 
ON public.clearing_records 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));
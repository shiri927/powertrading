-- 创建报表模板表
CREATE TABLE public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  is_preset BOOLEAN NOT NULL DEFAULT false,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的模板和共享模板
CREATE POLICY "用户可以查看自己的模板和共享模板"
ON public.report_templates
FOR SELECT
USING (
  user_id = auth.uid() 
  OR is_shared = true 
  OR is_preset = true
);

-- 用户可以创建自己的模板
CREATE POLICY "用户可以创建自己的模板"
ON public.report_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的非预设模板
CREATE POLICY "用户可以更新自己的模板"
ON public.report_templates
FOR UPDATE
USING (auth.uid() = user_id AND is_preset = false);

-- 用户可以删除自己的非预设模板
CREATE POLICY "用户可以删除自己的模板"
ON public.report_templates
FOR DELETE
USING (auth.uid() = user_id AND is_preset = false);

-- 管理员可以管理所有模板
CREATE POLICY "管理员可以管理所有模板"
ON public.report_templates
FOR ALL
USING (public.is_admin(auth.uid()));

-- 创建更新时间触发器
CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 插入预设模板
INSERT INTO public.report_templates (name, description, config, is_preset, is_shared) VALUES
(
  '结算分类明细报表',
  '按分类和交易类型汇总结算数据',
  '{"dataSourceId":"settlement_data","rowFields":["category","trade_type","item_name"],"columnFields":[],"valueFields":[{"field":"volume","aggregation":"sum"},{"field":"income_no_subsidy","aggregation":"sum"},{"field":"income_with_subsidy","aggregation":"sum"}],"filters":[],"showRowTotals":true,"showColumnTotals":true,"showGrandTotal":true}',
  true,
  true
),
(
  '日电价趋势分析',
  '按省份和日期分析电价趋势',
  '{"dataSourceId":"market_clearing_prices","rowFields":["province","price_date"],"columnFields":[],"valueFields":[{"field":"day_ahead_price","aggregation":"avg"},{"field":"realtime_price","aggregation":"avg"}],"filters":[],"showRowTotals":true,"showColumnTotals":true,"showGrandTotal":true}',
  true,
  true
),
(
  '交易数据汇总',
  '按交易中心和品种汇总交易量',
  '{"dataSourceId":"trading_data","rowFields":["trading_center","trade_type"],"columnFields":["direction"],"valueFields":[{"field":"contract_volume","aggregation":"sum"},{"field":"profit","aggregation":"sum"}],"filters":[],"showRowTotals":true,"showColumnTotals":true,"showGrandTotal":true}',
  true,
  true
);
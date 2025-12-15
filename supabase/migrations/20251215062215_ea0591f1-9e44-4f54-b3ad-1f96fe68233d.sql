-- 创建分析报告表
CREATE TABLE public.analysis_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  period text NOT NULL,
  author text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  publish_date date,
  views integer DEFAULT 0,
  content text,
  summary text,
  file_path text,
  trading_unit_id uuid REFERENCES public.trading_units(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Allow public read access for analysis_reports"
ON public.analysis_reports
FOR SELECT
USING (true);

-- 管理员可以管理所有报告
CREATE POLICY "Admins can manage analysis_reports"
ON public.analysis_reports
FOR ALL
USING (is_admin(auth.uid()));

-- 允许公开插入用于演示
CREATE POLICY "Allow public insert for demo"
ON public.analysis_reports
FOR INSERT
WITH CHECK (true);

-- 允许公开更新用于演示
CREATE POLICY "Allow public update for demo"
ON public.analysis_reports
FOR UPDATE
USING (true);

-- 创建更新时间触发器
CREATE TRIGGER update_analysis_reports_updated_at
BEFORE UPDATE ON public.analysis_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 插入初始示例数据
INSERT INTO public.analysis_reports (name, category, period, author, status, publish_date, views) VALUES
  ('2024年3月市场分析报告', '市场分析', '2024年3月', '分析团队', '已发布', '2024-03-28', 156),
  ('新能源发电效益分析报告', '效益分析', '2024年3月', '技术部', '已发布', '2024-03-25', 98),
  ('现货市场价格趋势分析', '价格分析', '2024年3月', '市场部', '已发布', '2024-03-20', 203),
  ('售电业务年度总结报告', '业务总结', '2023年度', '业务部', '审核中', NULL, 0),
  ('电网系统运行分析报告', '运行分析', '2024年2月', '运维团队', '已发布', '2024-03-01', 142),
  ('2024年Q1季度收益复盘报告', '收益分析', '2024年Q1', '财务部', '已发布', '2024-04-05', 89),
  ('光伏发电效率优化报告', '技术优化', '2024年3月', '技术部', '已发布', '2024-03-15', 76);
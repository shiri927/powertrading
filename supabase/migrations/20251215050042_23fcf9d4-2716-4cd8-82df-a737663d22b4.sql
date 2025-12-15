-- 创建新闻与政策表
CREATE TABLE public.news_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  publish_date DATE NOT NULL,
  publish_time TIME,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement', -- 'announcement' 公告 or 'policy' 政策
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  source TEXT, -- 来源/发布机构
  issuer TEXT, -- 发文单位
  status TEXT DEFAULT 'active', -- 'active' 现行有效, 'expired' 已失效
  url TEXT, -- 原文链接
  file_path TEXT, -- 附件路径
  province TEXT DEFAULT '山东',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.news_policies ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略
CREATE POLICY "Allow public read access for news_policies" 
ON public.news_policies 
FOR SELECT 
USING (true);

-- 管理员可以管理所有新闻政策
CREATE POLICY "Admins can manage news_policies" 
ON public.news_policies 
FOR ALL 
USING (is_admin(auth.uid()));

-- 创建更新时间触发器
CREATE TRIGGER update_news_policies_updated_at
BEFORE UPDATE ON public.news_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 创建索引
CREATE INDEX idx_news_policies_type ON public.news_policies(type);
CREATE INDEX idx_news_policies_category ON public.news_policies(category);
CREATE INDEX idx_news_policies_publish_date ON public.news_policies(publish_date DESC);
CREATE INDEX idx_news_policies_province ON public.news_policies(province);

-- 插入示例公告数据
INSERT INTO public.news_policies (title, summary, publish_date, publish_time, category, type, priority, source, province) VALUES
('关于开展2024年12月山东电力中长期交易的公告', '根据《山东电力中长期交易规则》，现组织开展2024年12月电力中长期交易...', '2024-12-13', '16:30', '交易公告', 'announcement', 'high', '山东电力交易中心', '山东'),
('关于发布山东电力现货市场2024年12月运行方案的通知', '为保障山东电力现货市场平稳运行，现发布12月市场运行方案...', '2024-12-12', '14:20', '运行通知', 'announcement', 'high', '山东电力交易中心', '山东'),
('关于2024年12月月度集中竞价交易结果的公告', '2024年12月月度集中竞价交易已完成，现公布交易结果...', '2024-12-11', '10:00', '交易结果', 'announcement', 'medium', '山东电力交易中心', '山东'),
('山东电力交易平台系统升级维护公告', '为提升系统服务能力，交易平台将于12月15日进行系统升级维护...', '2024-12-10', '09:30', '系统公告', 'announcement', 'medium', '山东电力交易中心', '山东'),
('关于调整新能源场站入市交易流程的通知', '根据国家能源局相关文件精神，现对新能源场站入市交易流程进行调整...', '2024-12-09', '15:45', '政策通知', 'announcement', 'high', '山东电力交易中心', '山东'),
('2024年11月山东电力市场运行情况通报', '11月份山东电力市场总体运行平稳，交易电量同比增长8.5%...', '2024-12-08', '11:00', '市场通报', 'announcement', 'low', '山东电力交易中心', '山东'),
('关于组织开展绿电绿证交易的通知', '为落实可再生能源消纳责任权重要求，现组织开展绿电绿证交易...', '2024-12-06', '14:00', '交易公告', 'announcement', 'medium', '山东电力交易中心', '山东'),
('山东省电力市场注册指南（2024年修订版）', '为规范市场主体注册流程，现发布修订后的市场注册指南...', '2024-12-05', '10:30', '政策通知', 'announcement', 'low', '山东电力交易中心', '山东');

-- 插入政策法规数据
INSERT INTO public.news_policies (title, publish_date, category, type, issuer, status, province) VALUES
('山东省电力中长期交易规则（2024年修订版）', '2024-11-20', '交易规则', 'policy', '山东省能源局', 'active', '山东'),
('山东省电力现货市场运行基本规则', '2024-10-15', '交易规则', 'policy', '山东省能源局', 'active', '山东'),
('关于进一步完善电力市场化改革的实施意见', '2024-09-01', '政策文件', 'policy', '山东省发改委', 'active', '山东'),
('新能源参与市场交易实施细则', '2024-08-10', '交易规则', 'policy', '山东省能源局', 'active', '山东'),
('售电公司市场准入与退出管理办法', '2024-07-20', '管理办法', 'policy', '山东省能源局', 'active', '山东');

-- 插入山西省数据
INSERT INTO public.news_policies (title, summary, publish_date, publish_time, category, type, priority, source, province) VALUES
('关于开展2024年12月山西电力中长期交易的公告', '根据《山西电力中长期交易规则》，现组织开展2024年12月电力中长期交易...', '2024-12-13', '15:00', '交易公告', 'announcement', 'high', '山西电力交易中心', '山西'),
('山西电力现货市场2024年12月运行方案', '现发布山西电力现货市场12月运行方案...', '2024-12-11', '14:00', '运行通知', 'announcement', 'high', '山西电力交易中心', '山西');

INSERT INTO public.news_policies (title, publish_date, category, type, issuer, status, province) VALUES
('山西省电力中长期交易规则', '2024-10-01', '交易规则', 'policy', '山西省能源局', 'active', '山西'),
('山西省电力现货市场运行规则', '2024-09-15', '交易规则', 'policy', '山西省能源局', 'active', '山西');
-- Create energy quotes tables for crude oil, refined oil, inventory, stocks, and news

-- Crude oil futures/spot quotes
CREATE TABLE public.energy_crude_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quote_time TIME,
  category TEXT NOT NULL, -- 'ice_brent', 'wti', 'spot_crude', 'ine_shanghai'
  contract TEXT, -- '2601', '2602', 'main', etc.
  name TEXT, -- for spot crude: 'FOB新加坡', '迪拜原油'
  price NUMERIC NOT NULL,
  change_value NUMERIC DEFAULT 0,
  change_percent NUMERIC DEFAULT 0,
  ytd NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Refined oil quotes
CREATE TABLE public.energy_refined_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  name TEXT NOT NULL, -- '汽油0#国VI', '柴油0#国VI'
  price NUMERIC NOT NULL,
  change_value NUMERIC DEFAULT 0,
  change_percent NUMERIC DEFAULT 0,
  ytd NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crack spreads data
CREATE TABLE public.energy_crack_spreads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  name TEXT NOT NULL, -- 'WTI裂解价差', 'ICE裂解价差'
  price NUMERIC NOT NULL,
  change_value NUMERIC DEFAULT 0,
  change_percent NUMERIC DEFAULT 0,
  ytd NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory and positions data
CREATE TABLE public.energy_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  name TEXT NOT NULL, -- 'API库存', 'EIA库存', '原油持仓'
  value TEXT NOT NULL, -- '432.5M桶'
  change_text TEXT, -- '+2.1M'
  change_percent TEXT, -- '+0.49%'
  status TEXT DEFAULT 'up', -- 'up', 'down'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Related stocks
CREATE TABLE public.energy_related_stocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  code TEXT NOT NULL, -- '中国石油', '中国石化'
  price NUMERIC NOT NULL,
  change_value NUMERIC DEFAULT 0,
  change_percent NUMERIC DEFAULT 0,
  ytd NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Energy news
CREATE TABLE public.energy_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  publish_time TIME,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT,
  is_scrolling BOOLEAN DEFAULT false, -- for scrolling news ticker
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Market indices
CREATE TABLE public.energy_market_indices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  name TEXT NOT NULL, -- '上证', '深证', '标普'
  value TEXT NOT NULL, -- '3245.68'
  change_value TEXT, -- '-15.32'
  change_percent TEXT, -- '-0.47%'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- INE intraday price trend
CREATE TABLE public.energy_ine_intraday (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_point TIME NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.energy_crude_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_refined_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_crack_spreads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_related_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_market_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_ine_intraday ENABLE ROW LEVEL SECURITY;

-- RLS policies for public read access
CREATE POLICY "Allow public read access for energy_crude_quotes" ON public.energy_crude_quotes FOR SELECT USING (true);
CREATE POLICY "Allow public read access for energy_refined_quotes" ON public.energy_refined_quotes FOR SELECT USING (true);
CREATE POLICY "Allow public read access for energy_crack_spreads" ON public.energy_crack_spreads FOR SELECT USING (true);
CREATE POLICY "Allow public read access for energy_inventory" ON public.energy_inventory FOR SELECT USING (true);
CREATE POLICY "Allow public read access for energy_related_stocks" ON public.energy_related_stocks FOR SELECT USING (true);
CREATE POLICY "Allow public read access for energy_news" ON public.energy_news FOR SELECT USING (true);
CREATE POLICY "Allow public read access for energy_market_indices" ON public.energy_market_indices FOR SELECT USING (true);
CREATE POLICY "Allow public read access for energy_ine_intraday" ON public.energy_ine_intraday FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "Admins can manage energy_crude_quotes" ON public.energy_crude_quotes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage energy_refined_quotes" ON public.energy_refined_quotes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage energy_crack_spreads" ON public.energy_crack_spreads FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage energy_inventory" ON public.energy_inventory FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage energy_related_stocks" ON public.energy_related_stocks FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage energy_news" ON public.energy_news FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage energy_market_indices" ON public.energy_market_indices FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage energy_ine_intraday" ON public.energy_ine_intraday FOR ALL USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_energy_crude_quotes_date_category ON public.energy_crude_quotes(quote_date, category);
CREATE INDEX idx_energy_refined_quotes_date ON public.energy_refined_quotes(quote_date);
CREATE INDEX idx_energy_news_date ON public.energy_news(publish_date);
CREATE INDEX idx_energy_ine_intraday_date ON public.energy_ine_intraday(quote_date);
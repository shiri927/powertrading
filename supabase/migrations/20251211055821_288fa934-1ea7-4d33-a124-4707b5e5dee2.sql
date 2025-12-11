-- Create market clearing prices table
CREATE TABLE public.market_clearing_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province TEXT NOT NULL DEFAULT '山东',
  price_date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 1 AND hour <= 24),
  day_ahead_price NUMERIC(10,4),
  realtime_price NUMERIC(10,4),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(province, price_date, hour)
);

-- Enable RLS
ALTER TABLE public.market_clearing_prices ENABLE ROW LEVEL SECURITY;

-- Allow public read access (market data is public)
CREATE POLICY "Allow public read access" ON public.market_clearing_prices
FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage market prices" ON public.market_clearing_prices
FOR ALL USING (public.is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_market_clearing_province_date ON public.market_clearing_prices(province, price_date);
CREATE INDEX idx_market_clearing_date ON public.market_clearing_prices(price_date);
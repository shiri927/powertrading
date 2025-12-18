-- Add quarter column to market_clearing_prices for 15-minute intervals
ALTER TABLE market_clearing_prices ADD COLUMN IF NOT EXISTS quarter INTEGER DEFAULT 1;

-- Drop existing unique constraint if exists
ALTER TABLE market_clearing_prices DROP CONSTRAINT IF EXISTS market_clearing_prices_province_price_date_hour_key;

-- Add new unique constraint including quarter
ALTER TABLE market_clearing_prices ADD CONSTRAINT market_clearing_prices_province_date_hour_quarter_key 
  UNIQUE (province, price_date, hour, quarter);
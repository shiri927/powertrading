export interface MarketData {
  spotPrice: number;
  volatility: number;
  tradingVolume: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  priceChange24h: number;
  timestamp: string;
}

export const generateMarketData = (): MarketData => {
  const hour = new Date().getHours();
  
  // 模拟现货价格的峰谷特征
  const basePrice = hour >= 9 && hour <= 22 ? 350 : 250; // 白天高，夜间低
  const spotPrice = basePrice + (Math.random() - 0.5) * 100;
  
  // 24小时价格变化
  const priceChange24h = (Math.random() - 0.5) * 20;
  
  // 市场情绪判断
  let sentiment: 'bullish' | 'bearish' | 'neutral';
  if (spotPrice > 320 && priceChange24h > 5) {
    sentiment = 'bullish';
  } else if (spotPrice < 280 && priceChange24h < -5) {
    sentiment = 'bearish';
  } else {
    sentiment = 'neutral';
  }
  
  return {
    spotPrice,
    volatility: 0.08 + Math.random() * 0.12, // 8%-20%
    tradingVolume: 5000 + Math.random() * 3000,
    sentiment,
    priceChange24h,
    timestamp: new Date().toISOString(),
  };
};

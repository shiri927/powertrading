import { addHours, addDays, format as formatDate } from 'date-fns';

export interface MarketDataPoint {
  timestamp: Date;
  gridLoad: number; // 统调负荷
  biddingSpace: number; // 竞价空间
  renewableLoad: number; // 新能源负荷
  externalTransmission: number; // 外送电计划
  nonMarketOutput: number; // 非市场化机组出力
  clearingPriceDayAhead: number; // 统一出清价格—日前
  clearingPriceRealtime: number; // 统一出清价格—实时
  clearingPriceRegulated?: number; // 调控后价格
}

export type TimeGranularity = '96' | '24' | 'day' | 'month';
export type AnalysisMethod = 'trend' | 'comparison';
export type DisplayFormat = 'flat' | 'grouped' | 'summary';

export const generateMarketQuotesData = (
  startDate: Date,
  endDate: Date,
  granularity: TimeGranularity
): MarketDataPoint[] => {
  const data: MarketDataPoint[] = [];
  const pointsPerDay = granularity === '96' ? 96 : granularity === '24' ? 24 : 1;
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (granularity === 'day' || granularity === 'month') {
      // Daily or monthly data - one point per day
      data.push(generateDataPoint(currentDate, 12)); // Use noon as representative time
      currentDate = addDays(currentDate, granularity === 'month' ? 30 : 1);
    } else {
      // Hourly or 15-minute data
      const interval = granularity === '96' ? 15 : 60;
      for (let i = 0; i < pointsPerDay; i++) {
        const pointTime = addHours(currentDate, (i * interval) / 60);
        data.push(generateDataPoint(pointTime, i * (24 / pointsPerDay)));
      }
      currentDate = addDays(currentDate, 1);
    }
  }
  
  return data;
};

const generateDataPoint = (timestamp: Date, hourOfDay: number): MarketDataPoint => {
  // Base load pattern - higher during day, lower at night
  const baseLoad = 40000 + Math.sin((hourOfDay / 24) * Math.PI * 2) * 10000;
  const gridLoad = baseLoad + (Math.random() - 0.5) * 3000;
  
  // Non-market output (relatively stable)
  const nonMarketOutput = 15000 + (Math.random() - 0.5) * 2000;
  
  // External transmission (stable with slight variation)
  const externalTransmission = 8000 + (Math.random() - 0.5) * 1000;
  
  // Renewable load (higher during day for solar, random for wind)
  const renewableLoad = 
    3000 + 
    Math.max(0, Math.sin((hourOfDay / 24) * Math.PI * 2) * 4000) + // Solar pattern
    (Math.random() - 0.5) * 1500; // Wind variation
  
  // Bidding space = Grid load - Non-market output - External transmission
  const biddingSpace = Math.max(0, gridLoad - nonMarketOutput - externalTransmission);
  
  // Day-ahead clearing price (influenced by demand)
  const basePrice = 300 + (gridLoad - 40000) / 100;
  const clearingPriceDayAhead = basePrice + (Math.random() - 0.5) * 80;
  
  // Real-time price has more volatility
  const clearingPriceRealtime = clearingPriceDayAhead * (0.9 + Math.random() * 0.3);
  
  // Regulated price is smoother
  const clearingPriceRegulated = clearingPriceDayAhead * 0.95 + 20;
  
  return {
    timestamp,
    gridLoad: Math.round(gridLoad),
    biddingSpace: Math.round(biddingSpace),
    renewableLoad: Math.round(renewableLoad),
    externalTransmission: Math.round(externalTransmission),
    nonMarketOutput: Math.round(nonMarketOutput),
    clearingPriceDayAhead: Math.round(clearingPriceDayAhead * 100) / 100,
    clearingPriceRealtime: Math.round(clearingPriceRealtime * 100) / 100,
    clearingPriceRegulated: Math.round(clearingPriceRegulated * 100) / 100,
  };
};

export const aggregateDataByDisplayFormat = (
  data: MarketDataPoint[],
  displayFormat: DisplayFormat,
  granularity: TimeGranularity
): MarketDataPoint[] => {
  if (displayFormat === 'flat') {
    return data;
  }
  
  if (displayFormat === 'grouped') {
    // Group by date, show each day as separate series
    const grouped = new Map<string, MarketDataPoint[]>();
    data.forEach(point => {
      const dateKey = formatDate(point.timestamp, 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(point);
    });
    return data; // Return original for now, grouping handled in chart
  }
  
  if (displayFormat === 'summary') {
    // Aggregate all dates to same time points
    const timePoints = new Map<string, MarketDataPoint[]>();
    
    data.forEach(point => {
      const timeKey = granularity === '96' 
        ? formatDate(point.timestamp, 'HH:mm')
        : granularity === '24'
        ? formatDate(point.timestamp, 'HH:00')
        : formatDate(point.timestamp, 'HH:00');
      
      if (!timePoints.has(timeKey)) {
        timePoints.set(timeKey, []);
      }
      timePoints.get(timeKey)!.push(point);
    });
    
    // Average all points at same time
    const aggregated: MarketDataPoint[] = [];
    timePoints.forEach((points, timeKey) => {
      aggregated.push({
        timestamp: points[0].timestamp,
        gridLoad: Math.round(points.reduce((sum, p) => sum + p.gridLoad, 0) / points.length),
        biddingSpace: Math.round(points.reduce((sum, p) => sum + p.biddingSpace, 0) / points.length),
        renewableLoad: Math.round(points.reduce((sum, p) => sum + p.renewableLoad, 0) / points.length),
        externalTransmission: Math.round(points.reduce((sum, p) => sum + p.externalTransmission, 0) / points.length),
        nonMarketOutput: Math.round(points.reduce((sum, p) => sum + p.nonMarketOutput, 0) / points.length),
        clearingPriceDayAhead: Math.round(points.reduce((sum, p) => sum + p.clearingPriceDayAhead, 0) / points.length * 100) / 100,
        clearingPriceRealtime: Math.round(points.reduce((sum, p) => sum + p.clearingPriceRealtime, 0) / points.length * 100) / 100,
        clearingPriceRegulated: Math.round(points.reduce((sum, p) => sum + (p.clearingPriceRegulated || 0), 0) / points.length * 100) / 100,
      });
    });
    
    return aggregated.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  return data;
};

export const calculateStatistics = (data: MarketDataPoint[]) => {
  if (data.length === 0) return null;
  
  const stats = {
    gridLoad: { max: 0, min: Infinity, avg: 0 },
    biddingSpace: { max: 0, min: Infinity, avg: 0 },
    renewableLoad: { max: 0, min: Infinity, avg: 0 },
    clearingPriceDayAhead: { max: 0, min: Infinity, avg: 0 },
    clearingPriceRealtime: { max: 0, min: Infinity, avg: 0 },
  };
  
  data.forEach(point => {
    Object.keys(stats).forEach(key => {
      const value = point[key as keyof typeof point] as number;
      stats[key as keyof typeof stats].max = Math.max(stats[key as keyof typeof stats].max, value);
      stats[key as keyof typeof stats].min = Math.min(stats[key as keyof typeof stats].min, value);
      stats[key as keyof typeof stats].avg += value / data.length;
    });
  });
  
  // Round averages
  Object.keys(stats).forEach(key => {
    stats[key as keyof typeof stats].avg = Math.round(stats[key as keyof typeof stats].avg * 100) / 100;
  });
  
  return stats;
};

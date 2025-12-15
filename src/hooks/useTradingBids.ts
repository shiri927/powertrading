import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";

// 类型定义
export interface TradingBid {
  id: string;
  trading_unit_id: string | null;
  calendar_id: string | null;
  bid_no: string;
  bid_type: string;
  bid_volume: number;
  bid_price: number;
  time_period: string | null;
  status: string;
  submitted_at: string | null;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BidDataRow {
  hour: number;
  buyDirection: boolean;
  priceUp: string;
  priceDown: string;
  buyEnergy: string;
  sellEnergy: string;
  participation: string;
  limit1Energy: string;
  limit1Price: string;
  bidStatus: string;
  winRate: string;
}

export interface RollingTimePoint {
  id: string;
  timePoint: number;
  checked: boolean;
  tradingDirection: 'sell' | 'no-trade' | 'buy' | 'unlimited';
  maxLimitPrice: number;
  minLimitPrice: number;
  buyLimitVolume: number;
  sellLimitVolume: number;
  referenceValue: string;
  ratio: number;
  fixedValue: number;
  declarationPrice: number;
}

export interface RollingScheme {
  id: string;
  schemeNumber: string;
  schemeName: string;
  tradingDate: string;
  tradingUnit: string;
  timePoints: RollingTimePoint[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  powerRatio: number | null;
  powerFixed: number | null;
  price: number | null;
}

export interface BidScheme {
  id: string;
  name: string;
  targetDate: Date | null;
  tradingUnits: string[];
  selectedUnitsCount: number;
  totalUnitsCount: number;
  limitCondition: string;
  powerStrategy: string;
  priceStrategy: string;
  timeSlots: TimeSlot[];
}

// 获取交易日历数据
export const useTradingCalendarData = (tradingCenter?: string) => {
  return useQuery({
    queryKey: ["trading-calendar-bids", tradingCenter],
    queryFn: async () => {
      let query = supabase
        .from("trading_calendar")
        .select("*")
        .order("trading_date", { ascending: false })
        .limit(30);

      if (tradingCenter) {
        query = query.eq("trading_center", tradingCenter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

// 获取交易单元数据
export const useTradingUnitsForBids = () => {
  return useQuery({
    queryKey: ["trading-units-for-bids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trading_units")
        .select(`
          id,
          unit_name,
          unit_code,
          trading_center,
          registered_capacity,
          power_stations!trading_units_station_id_fkey (
            id,
            name,
            province
          )
        `)
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    },
  });
};

// 获取市场价格数据用于生成申报参考
export const useMarketPricesForBids = (date: string, province?: string) => {
  return useQuery({
    queryKey: ["market-prices-for-bids", date, province],
    queryFn: async () => {
      let query = supabase
        .from("market_clearing_prices")
        .select("*")
        .eq("price_date", date)
        .order("hour", { ascending: true });

      if (province) {
        query = query.eq("province", province);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

// 生成24小时申报数据（基于市场价格）
export const generateBidDataFromPrices = (prices: any[]): BidDataRow[] => {
  return Array.from({ length: 24 }, (_, i) => {
    const hourPrice = prices.find(p => p.hour === i + 1);
    const dayAheadPrice = hourPrice?.day_ahead_price || 300 + Math.random() * 200;
    const realtimePrice = hourPrice?.realtime_price || 280 + Math.random() * 180;
    
    const isPeakHour = i >= 6 && i <= 22;
    const isHighPriceHour = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 20, 21, 22].includes(i);

    return {
      hour: i + 1,
      buyDirection: isPeakHour,
      priceUp: (dayAheadPrice * 1.2).toFixed(2),
      priceDown: (realtimePrice * 0.8).toFixed(2),
      buyEnergy: (95 + Math.random() * 10).toFixed(3),
      sellEnergy: (850 + Math.random() * 100).toFixed(3),
      participation: i % 3 === 0 ? "撤单后盖" : i % 5 === 0 ? "交易撤盖" : "撤单后盖",
      limit1Energy: isHighPriceHour ? (10 + Math.random() * 50).toFixed(0) : "0",
      limit1Price: isHighPriceHour ? dayAheadPrice.toFixed(2) : "0.00",
      bidStatus: i % 4 === 0 ? "success" : i % 3 === 0 ? "pending" : "none",
      winRate: isHighPriceHour ? `${(30 + Math.random() * 70).toFixed(0)}%` : "0%",
    };
  });
};

// 生成日滚动交易时点数据（基于市场价格）
export const generateRollingTimePointsFromPrices = (prices: any[]): RollingTimePoint[] => {
  return Array.from({ length: 24 }, (_, i) => {
    const hourPrice = prices.find(p => p.hour === i + 1);
    const price = hourPrice?.day_ahead_price || 350;
    
    return {
      id: `point-${i + 1}`,
      timePoint: i + 1,
      checked: false,
      tradingDirection: 'no-trade' as const,
      maxLimitPrice: Math.min(1500, price * 1.5),
      minLimitPrice: Math.max(0, price * 0.5),
      buyLimitVolume: 0.000,
      sellLimitVolume: 0.000,
      referenceValue: '策略首选',
      ratio: 0,
      fixedValue: 0.000,
      declarationPrice: price
    };
  });
};

// 生成日滚动交易方案（基于交易日历和市场价格）
export const generateRollingSchemesFromData = (
  calendar: any[], 
  units: any[], 
  prices: any[],
  category: 'renewable' | 'retail'
): RollingScheme[] => {
  const today = new Date();
  const futureDate = addDays(today, 2);
  const dateStr = format(today, "yyyyMMdd");
  const futureDateStr = format(futureDate, "yyyy-M-d");
  
  // 筛选匹配类别的交易单元
  const filteredUnits = units.filter(u => {
    if (category === 'renewable') {
      return u.trading_category === 'renewable' || u.power_stations;
    }
    return u.trading_category === 'retail' || !u.power_stations;
  });

  const unitName = filteredUnits[0]?.unit_name || '交易单元';
  const schemeName = category === 'renewable' ? '绿略应计1' : '零售策略1';

  return [
    {
      id: 'rolling-scheme-1',
      schemeNumber: dateStr,
      schemeName,
      tradingDate: `${format(today, "yyyy年MM月dd日")}滚动交易(${futureDateStr})`,
      tradingUnit: unitName,
      timePoints: generateRollingTimePointsFromPrices(prices)
    }
  ];
};

// 生成省间/省内现货申报方案（基于交易单元和市场价格）
export const generateBidSchemesFromData = (
  units: any[],
  prices: any[],
  category: 'renewable' | 'retail'
): BidScheme[] => {
  // 筛选匹配类别的交易单元
  const filteredUnits = units.filter(u => {
    if (category === 'renewable') {
      return u.trading_category === 'renewable' || u.power_stations;
    }
    return u.trading_category === 'retail' || !u.power_stations;
  });

  const unitNames = filteredUnits.slice(0, 2).map(u => u.unit_name);
  
  // 计算时段平均价格
  const morningPrices = prices.filter(p => p.hour >= 1 && p.hour <= 8);
  const peakPrices = prices.filter(p => p.hour >= 9 && p.hour <= 14);
  const eveningPrices = prices.filter(p => p.hour >= 15 && p.hour <= 24);

  const avgMorning = morningPrices.length > 0 
    ? morningPrices.reduce((s, p) => s + (p.day_ahead_price || 0), 0) / morningPrices.length 
    : 320.5;
  const avgPeak = peakPrices.length > 0 
    ? peakPrices.reduce((s, p) => s + (p.day_ahead_price || 0), 0) / peakPrices.length 
    : 450.0;
  const avgEvening = eveningPrices.length > 0 
    ? eveningPrices.reduce((s, p) => s + (p.day_ahead_price || 0), 0) / eveningPrices.length 
    : 380.75;

  return [
    {
      id: 'scheme-1',
      name: '单一价格，按时段申报电力方-1',
      targetDate: new Date(),
      tradingUnits: unitNames.length > 0 ? unitNames : ['单元1', '单元2'],
      selectedUnitsCount: unitNames.length || 2,
      totalUnitsCount: filteredUnits.length || 5,
      limitCondition: category === 'retail' ? '自动分配' : '日前限额 1000MWh',
      powerStrategy: '按照最大预测申报',
      priceStrategy: category === 'retail' ? '固定价格' : '按照最大预测申报',
      timeSlots: [
        {
          id: 'slot-1',
          startTime: '0015',
          endTime: '0800',
          powerRatio: 80,
          powerFixed: 50,
          price: Number(avgMorning.toFixed(2))
        },
        {
          id: 'slot-2',
          startTime: '0800',
          endTime: '1200',
          powerRatio: 100,
          powerFixed: 75,
          price: Number(avgPeak.toFixed(2))
        },
        {
          id: 'slot-3',
          startTime: '1200',
          endTime: '2400',
          powerRatio: 90,
          powerFixed: 60,
          price: Number(avgEvening.toFixed(2))
        }
      ]
    }
  ];
};

// 组合 hook - 获取交易操作台所需的所有数据
export const useConsoleBidData = (category: 'renewable' | 'retail', province?: string) => {
  const today = format(new Date(), "yyyy-MM-dd");
  
  const calendarQuery = useTradingCalendarData();
  const unitsQuery = useTradingUnitsForBids();
  const pricesQuery = useMarketPricesForBids(today, province);

  const isLoading = calendarQuery.isLoading || unitsQuery.isLoading || pricesQuery.isLoading;
  const isError = calendarQuery.isError || unitsQuery.isError || pricesQuery.isError;

  // 生成竞价申报数据
  const bidData = pricesQuery.data ? generateBidDataFromPrices(pricesQuery.data) : [];

  // 生成日滚动交易方案
  const rollingSchemes = generateRollingSchemesFromData(
    calendarQuery.data || [],
    unitsQuery.data || [],
    pricesQuery.data || [],
    category
  );

  // 生成省间/省内现货申报方案
  const bidSchemes = generateBidSchemesFromData(
    unitsQuery.data || [],
    pricesQuery.data || [],
    category
  );

  return {
    isLoading,
    isError,
    bidData,
    rollingSchemes,
    bidSchemes,
    tradingUnits: unitsQuery.data || [],
    calendar: calendarQuery.data || [],
    prices: pricesQuery.data || [],
  };
};

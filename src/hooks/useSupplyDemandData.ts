import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";

// Province mapping
const provinceMap: Record<string, string> = {
  shandong: "山东",
  shanxi: "山西",
  zhejiang: "浙江",
};

// 新能源出力预测数据
export const useRenewableOutputForecast = (province: string) => {
  const provinceName = provinceMap[province] || "山东";

  return useQuery({
    queryKey: ["renewable-output-forecast", provinceName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("renewable_output_forecast")
        .select("*")
        .eq("province", provinceName)
        .gte("forecast_date", format(new Date(), "yyyy-MM-dd"))
        .order("forecast_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

// 转换为图表格式
export const transformRenewableData = (data: any[] | undefined) => {
  if (!data || data.length === 0) {
    // 返回生成的mock数据
    return generateMockRenewableData();
  }

  // 按日期分组
  const groupedByDate = data.reduce((acc, item) => {
    const dateKey = format(new Date(item.forecast_date), "M/d");
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey };
    }
    if (item.energy_type === "wind") {
      acc[dateKey].windP10 = Number(item.p10);
      acc[dateKey].windP50 = Number(item.p50);
      acc[dateKey].windP90 = Number(item.p90);
    } else if (item.energy_type === "solar") {
      acc[dateKey].solarP10 = Number(item.p10);
      acc[dateKey].solarP50 = Number(item.p50);
      acc[dateKey].solarP90 = Number(item.p90);
    }
    return acc;
  }, {} as Record<string, any>);

  return Object.values(groupedByDate);
};

// 负荷预测数据
export const useLoadForecast = (province: string) => {
  const provinceName = provinceMap[province] || "山东";

  return useQuery({
    queryKey: ["load-forecast", provinceName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("load_forecast")
        .select("*")
        .eq("province", provinceName)
        .gte("forecast_date", format(new Date(), "yyyy-MM-dd"))
        .order("forecast_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const transformLoadData = (data: any[] | undefined) => {
  if (!data || data.length === 0) {
    return generateMockLoadData();
  }

  return data.map((item) => ({
    date: format(new Date(item.forecast_date), "M/d"),
    predicted: Number(item.predicted),
    historical: Number(item.historical),
    upperBound: Number(item.upper_bound),
    lowerBound: Number(item.lower_bound),
  }));
};

// 联络线预测数据
export const useTieLineForecast = (province: string) => {
  const provinceName = provinceMap[province] || "山东";

  return useQuery({
    queryKey: ["tie-line-forecast", provinceName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tie_line_forecast")
        .select("*")
        .eq("province", provinceName)
        .gte("forecast_date", format(new Date(), "yyyy-MM-dd"))
        .order("forecast_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const transformTieLineData = (data: any[] | undefined) => {
  if (!data || data.length === 0) {
    return generateMockTieLineData();
  }

  return data.map((item) => ({
    date: format(new Date(item.forecast_date), "M/d"),
    inflow: Number(item.inflow),
    outflow: Number(item.outflow),
    netPosition: Number(item.net_position),
  }));
};

// 火电竞价空间预测
export const useThermalBiddingForecast = (province: string) => {
  const provinceName = provinceMap[province] || "山东";

  return useQuery({
    queryKey: ["thermal-bidding-forecast", provinceName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("thermal_bidding_forecast")
        .select("*")
        .eq("province", provinceName)
        .gte("forecast_date", format(new Date(), "yyyy-MM-dd"))
        .order("forecast_date", { ascending: true })
        .limit(7);

      if (error) throw error;
      return data;
    },
  });
};

export const transformThermalData = (data: any[] | undefined) => {
  if (!data || data.length === 0) {
    return generateMockThermalData();
  }

  return data.map((item) => ({
    date: format(new Date(item.forecast_date), "M/d"),
    biddingSpace: Number(item.bidding_space),
    historicalAvg: Number(item.historical_avg),
    predicted: Number(item.predicted),
  }));
};

// 历史竞价行为分析
export const useBiddingBehaviorAnalysis = (province: string) => {
  const provinceName = provinceMap[province] || "山东";

  return useQuery({
    queryKey: ["bidding-behavior-analysis", provinceName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bidding_behavior_analysis")
        .select("*")
        .eq("province", provinceName)
        .order("price_range", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const transformBiddingBehaviorData = (data: any[] | undefined) => {
  if (!data || data.length === 0) {
    return [
      { range: "0-200", count: 45, rate: 78 },
      { range: "200-300", count: 120, rate: 85 },
      { range: "300-400", count: 280, rate: 92 },
      { range: "400-500", count: 180, rate: 88 },
      { range: "500-600", count: 95, rate: 72 },
      { range: "600+", count: 40, rate: 55 },
    ];
  }

  return data.map((item) => ({
    range: item.price_range,
    count: Number(item.bid_count),
    rate: Number(item.win_rate),
  }));
};

// 计算统计指标
export const useSupplyDemandStats = (province: string) => {
  const { data: renewableData } = useRenewableOutputForecast(province);
  const { data: loadData } = useLoadForecast(province);
  const { data: thermalData } = useThermalBiddingForecast(province);

  const windP50Avg =
    renewableData
      ?.filter((d) => d.energy_type === "wind")
      .reduce((sum, d) => sum + Number(d.p50), 0) /
      (renewableData?.filter((d) => d.energy_type === "wind").length || 1) || 3850;

  const solarP50Avg =
    renewableData
      ?.filter((d) => d.energy_type === "solar")
      .reduce((sum, d) => sum + Number(d.p50), 0) /
      (renewableData?.filter((d) => d.energy_type === "solar").length || 1) || 2680;

  const loadPeak = loadData?.reduce((max, d) => Math.max(max, Number(d.predicted)), 0) || 42500;

  const biddingSpaceAvg =
    thermalData?.reduce((sum, d) => sum + Number(d.bidding_space), 0) /
      (thermalData?.length || 1) || 10200;

  return {
    windP50Avg: Math.round(windP50Avg),
    solarP50Avg: Math.round(solarP50Avg),
    loadPeak: Math.round(loadPeak),
    biddingSpaceAvg: Math.round(biddingSpaceAvg),
  };
};

// Mock data generators for fallback
function generateMockRenewableData() {
  const data = [];
  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const date = addDays(baseDate, i);
    const windBase = 3000 + Math.random() * 2000;
    const solarBase = 2000 + Math.random() * 1500;
    data.push({
      date: format(date, "M/d"),
      windP10: Math.round(windBase * 0.7),
      windP50: Math.round(windBase),
      windP90: Math.round(windBase * 1.3),
      solarP10: Math.round(solarBase * 0.75),
      solarP50: Math.round(solarBase),
      solarP90: Math.round(solarBase * 1.25),
    });
  }
  return data;
}

function generateMockLoadData() {
  const data = [];
  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const date = addDays(baseDate, i);
    const loadBase = 35000 + Math.random() * 10000;
    data.push({
      date: format(date, "M/d"),
      predicted: Math.round(loadBase),
      historical: Math.round(loadBase * (0.95 + Math.random() * 0.1)),
      upperBound: Math.round(loadBase * 1.05),
      lowerBound: Math.round(loadBase * 0.95),
    });
  }
  return data;
}

function generateMockTieLineData() {
  const data = [];
  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const date = addDays(baseDate, i);
    const inflow = 2000 + Math.random() * 1500;
    const outflow = 1500 + Math.random() * 1000;
    data.push({
      date: format(date, "M/d"),
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      netPosition: Math.round(inflow - outflow),
    });
  }
  return data;
}

function generateMockThermalData() {
  const data = [];
  const baseDate = new Date();
  for (let i = 0; i < 7; i++) {
    const date = addDays(baseDate, i);
    const space = 8000 + Math.random() * 4000;
    data.push({
      date: format(date, "M/d"),
      biddingSpace: Math.round(space),
      historicalAvg: Math.round(space * (0.9 + Math.random() * 0.2)),
      predicted: Math.round(space),
    });
  }
  return data;
}

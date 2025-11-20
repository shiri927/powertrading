export interface PredictionData {
  timestamp: string;
  p10: number;  // 10%分位数（保守预测）
  p50: number;  // 50%分位数（中位预测）
  p90: number;  // 90%分位数（乐观预测）
  actual?: number;  // 实际出力（历史数据）
  confidence: number;  // 预测置信度
}

export interface PredictionMetrics {
  ultraShortTerm: { accuracy: number; mape: number };  // 0-4小时
  shortTerm: { accuracy: number; mape: number };       // 4-24小时
  mediumTerm: { accuracy: number; mape: number };      // 1-7天
  overallScore: number;  // 综合评分
}

export interface ErrorAnalysis {
  timeSlot: string;
  predicted: number;
  actual: number;
  deviation: number;
  deviationPercent: number;
}

export const generatePredictionData = (
  hours: number = 24,
  granularity: '15min' | '1hour' | 'day' = '1hour'
): PredictionData[] => {
  const data: PredictionData[] = [];
  const now = new Date();
  const pointsPerHour = granularity === '15min' ? 4 : granularity === '1hour' ? 1 : 1/24;
  const totalPoints = Math.floor(hours * pointsPerHour);
  
  for (let i = 0; i < totalPoints; i++) {
    const minutesIncrement = granularity === '15min' ? 15 : granularity === '1hour' ? 60 : 1440;
    const timestamp = new Date(now.getTime() + i * minutesIncrement * 60 * 1000);
    const hour = timestamp.getHours();
    
    // 模拟日内功率变化规律（白天高，夜间低）
    const baseP50 = 100 + Math.sin((hour / 24) * Math.PI * 2) * 30 + Math.cos((hour / 12) * Math.PI) * 15;
    const noise = (Math.random() - 0.5) * 8;
    
    const p50 = baseP50 + noise;
    const uncertaintyFactor = 1 + (i / totalPoints) * 0.3; // 预测越远期不确定性越大
    const p10 = p50 - (12 + Math.random() * 8) * uncertaintyFactor;
    const p90 = p50 + (12 + Math.random() * 8) * uncertaintyFactor;
    
    // 实际出力数据（仅历史时刻有）
    const actual = i < totalPoints / 3 ? p50 + (Math.random() - 0.5) * 15 : undefined;
    
    // 置信度（越远期越低）
    const confidence = 95 - (i / totalPoints) * 18;
    
    data.push({
      timestamp: timestamp.toISOString(),
      p10: Math.max(0, p10),
      p50: Math.max(0, p50),
      p90: Math.max(0, p90),
      actual: actual ? Math.max(0, actual) : undefined,
      confidence: Math.max(75, Math.min(95, confidence)),
    });
  }
  
  return data;
};

export const calculatePredictionMetrics = (data: PredictionData[]): PredictionMetrics => {
  // 计算不同时间段的预测准确度
  const historicalData = data.filter(d => d.actual !== undefined);
  
  const calculateMAPE = (predictions: PredictionData[]) => {
    if (predictions.length === 0) return 0;
    const mape = predictions.reduce((sum, d) => {
      if (!d.actual) return sum;
      return sum + Math.abs((d.p50 - d.actual) / d.actual);
    }, 0) / predictions.length * 100;
    return mape;
  };
  
  const calculateAccuracy = (predictions: PredictionData[]) => {
    if (predictions.length === 0) return 0;
    const mape = calculateMAPE(predictions);
    return Math.max(0, 100 - mape);
  };
  
  // 超短期（前4小时）
  const ultraShortTerm = historicalData.slice(0, Math.min(4, historicalData.length));
  // 短期（4-24小时）
  const shortTerm = historicalData.slice(4, Math.min(24, historicalData.length));
  // 中期（1-7天）
  const mediumTerm = historicalData.slice(24);
  
  const ultraShortTermAccuracy = calculateAccuracy(ultraShortTerm);
  const shortTermAccuracy = calculateAccuracy(shortTerm);
  const mediumTermAccuracy = calculateAccuracy(mediumTerm);
  
  return {
    ultraShortTerm: {
      accuracy: ultraShortTermAccuracy,
      mape: calculateMAPE(ultraShortTerm),
    },
    shortTerm: {
      accuracy: shortTermAccuracy,
      mape: calculateMAPE(shortTerm),
    },
    mediumTerm: {
      accuracy: mediumTermAccuracy,
      mape: calculateMAPE(mediumTerm),
    },
    overallScore: (ultraShortTermAccuracy * 0.5 + shortTermAccuracy * 0.3 + mediumTermAccuracy * 0.2),
  };
};

export const generateErrorAnalysis = (data: PredictionData[]): ErrorAnalysis[] => {
  return data
    .filter(d => d.actual !== undefined)
    .map(d => {
      const deviation = d.p50 - (d.actual || 0);
      const deviationPercent = ((d.actual || 0) !== 0) ? (deviation / (d.actual || 1)) * 100 : 0;
      
      return {
        timeSlot: new Date(d.timestamp).toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        predicted: d.p50,
        actual: d.actual || 0,
        deviation,
        deviationPercent,
      };
    });
};

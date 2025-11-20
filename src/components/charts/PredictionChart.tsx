import { Area, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PredictionData } from '@/lib/data-generation/prediction-data';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PredictionChartProps {
  data: PredictionData[];
  granularity: '15min' | '1hour' | 'day';
}

export const PredictionChart = ({ data, granularity }: PredictionChartProps) => {
  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    if (granularity === '15min' || granularity === '1hour') {
      return format(date, 'HH:mm', { locale: zhCN });
    }
    return format(date, 'MM-dd', { locale: zhCN });
  };

  const chartData = data.map(d => ({
    timestamp: d.timestamp,
    p10: d.p10,
    p50: d.p50,
    p90: d.p90,
    actual: d.actual,
    // 用于填充区域的辅助数据
    range: [d.p10, d.p90],
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={formatXAxis}
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px', fontFamily: 'Roboto Mono' }}
          label={{ 
            value: '功率 (MW)', 
            angle: -90, 
            position: 'insideLeft',
            style: { fontSize: '12px' }
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          labelFormatter={(value) => format(new Date(value), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
          formatter={(value: number, name: string) => {
            const labels: { [key: string]: string } = {
              p10: 'P10 保守预测',
              p50: 'P50 中位预测',
              p90: 'P90 乐观预测',
              actual: '实际出力',
            };
            return [
              `${value.toFixed(2)} MW`,
              labels[name] || name
            ];
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          formatter={(value) => {
            const labels: { [key: string]: string } = {
              p10: 'P10 保守预测',
              p50: 'P50 中位预测',
              p90: 'P90 乐观预测',
              actual: '实际出力',
            };
            return labels[value] || value;
          }}
        />
        
        {/* P10-P90 置信区间 - 使用浅绿色填充 */}
        <Area
          type="monotone"
          dataKey="p90"
          stroke="none"
          fill="#00B04D"
          fillOpacity={0.1}
        />
        <Area
          type="monotone"
          dataKey="p10"
          stroke="none"
          fill="#ffffff"
          fillOpacity={1}
        />
        
        {/* P10 下界线 */}
        <Line
          type="monotone"
          dataKey="p10"
          stroke="#00B04D"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
        />
        
        {/* P50 中位数 - 深绿色实线 */}
        <Line
          type="monotone"
          dataKey="p50"
          stroke="#00B04D"
          strokeWidth={2.5}
          dot={false}
        />
        
        {/* P90 上界线 */}
        <Line
          type="monotone"
          dataKey="p90"
          stroke="#00B04D"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
        />
        
        {/* 实际出力 - 橙色虚线 */}
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#FFA500"
          strokeWidth={2}
          strokeDasharray="8 4"
          dot={{ fill: '#FFA500', r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

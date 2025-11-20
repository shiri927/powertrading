import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface BacktestChartProps {
  data: { timestamp: string; equity: number }[];
  initialCapital: number;
}

export const BacktestChart = ({ data, initialCapital }: BacktestChartProps) => {
  const chartData = data.map(d => ({
    timestamp: d.timestamp,
    equity: d.equity,
    returnRate: ((d.equity - initialCapital) / initialCapital) * 100,
  }));

  const formatXAxis = (timestamp: string) => {
    return format(new Date(timestamp), 'MM-dd HH:mm', { locale: zhCN });
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={formatXAxis}
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '11px' }}
        />
        <YAxis 
          yAxisId="left"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '11px', fontFamily: 'Roboto Mono' }}
          label={{ 
            value: '总资产 (元)', 
            angle: -90, 
            position: 'insideLeft',
            style: { fontSize: '11px' }
          }}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '11px', fontFamily: 'Roboto Mono' }}
          label={{ 
            value: '收益率 (%)', 
            angle: 90, 
            position: 'insideRight',
            style: { fontSize: '11px' }
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          labelFormatter={(value) => format(new Date(value), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
          formatter={(value: number, name: string) => {
            if (name === 'equity') {
              return [`${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 元`, '总资产'];
            } else {
              return [`${value.toFixed(2)}%`, '收益率'];
            }
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          formatter={(value) => value === 'equity' ? '总资产' : '收益率'}
        />
        
        {/* 初始资金基准线 */}
        <ReferenceLine 
          yAxisId="left"
          y={initialCapital} 
          stroke="hsl(var(--muted-foreground))" 
          strokeDasharray="3 3"
          label={{ 
            value: '初始资金', 
            position: 'right',
            style: { fontSize: '11px', fill: 'hsl(var(--muted-foreground))' }
          }}
        />
        
        {/* 0收益基准线 */}
        <ReferenceLine 
          yAxisId="right"
          y={0} 
          stroke="hsl(var(--muted-foreground))" 
          strokeDasharray="3 3"
        />
        
        {/* 权益曲线 */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="equity"
          stroke="#00B04D"
          strokeWidth={2.5}
          dot={false}
        />
        
        {/* 收益率曲线 */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="returnRate"
          stroke="#FFA500"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

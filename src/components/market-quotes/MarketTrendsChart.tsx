import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { MarketDataPoint } from "@/lib/data-generation/market-quotes-data";
import type { DataItem } from "./DashboardConfigDialog";

interface MarketTrendsChartProps {
  data: MarketDataPoint[];
  enabledItems: DataItem[];
  showRegulatedPrice: boolean;
  chartDataType: 'dayAhead' | 'intraday';
  timeGranularity: '96' | '24' | 'day' | 'month';
}

export const MarketTrendsChart = ({
  data,
  enabledItems,
  showRegulatedPrice,
  chartDataType,
  timeGranularity,
}: MarketTrendsChartProps) => {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      time: format(
        point.timestamp,
        timeGranularity === '96' ? 'HH:mm' : 
        timeGranularity === '24' ? 'HH:00' : 
        timeGranularity === 'day' ? 'MM-dd' : 
        'yyyy-MM'
      ),
      timestamp: point.timestamp.getTime(),
      ...point,
    }));
  }, [data, timeGranularity]);

  const dataKeyMap: Record<string, keyof MarketDataPoint> = {
    gridLoad: 'gridLoad',
    biddingSpace: 'biddingSpace',
    renewableLoad: 'renewableLoad',
    externalTransmission: 'externalTransmission',
    nonMarketOutput: 'nonMarketOutput',
    clearingPriceDayAhead: 'clearingPriceDayAhead',
    clearingPriceRealtime: 'clearingPriceRealtime',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>市场趋势分析</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return value.toLocaleString();
                }
                return value;
              }}
            />
            <Legend />
            
            {enabledItems
              .filter((item) => item.enabled)
              .map((item) => {
                const dataKey = dataKeyMap[item.id];
                
                // For price items, check chartDataType
                if (item.id === 'clearingPriceDayAhead' && chartDataType === 'intraday') {
                  return null;
                }
                if (item.id === 'clearingPriceRealtime' && chartDataType === 'dayAhead') {
                  return null;
                }
                
                return (
                  <Line
                    key={item.id}
                    type="monotone"
                    dataKey={dataKey}
                    stroke={item.color}
                    name={item.name}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                );
              })}
            
            {showRegulatedPrice && (
              <Line
                type="monotone"
                dataKey="clearingPriceRegulated"
                stroke="#8B5CF6"
                strokeDasharray="5 5"
                name="调控后价格"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

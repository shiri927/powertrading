import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format } from "date-fns";
import type { MarketDataPoint } from "@/lib/data-generation/market-quotes-data";

interface StatisticsViewsProps {
  data: MarketDataPoint[];
  view: 'dayAhead' | 'intraday' | 'table' | 'extremes' | 'trend';
  timeGranularity: '96' | '24' | 'day' | 'month';
}

export const StatisticsViews = ({ data, view, timeGranularity }: StatisticsViewsProps) => {
  if (view === 'dayAhead') {
    return <DayAheadView data={data} timeGranularity={timeGranularity} />;
  }
  
  if (view === 'intraday') {
    return <IntradayView data={data} timeGranularity={timeGranularity} />;
  }
  
  if (view === 'table') {
    return <TableView data={data} timeGranularity={timeGranularity} />;
  }
  
  if (view === 'extremes') {
    return <ExtremesView data={data} timeGranularity={timeGranularity} />;
  }
  
  if (view === 'trend') {
    return <TrendView data={data} timeGranularity={timeGranularity} />;
  }
  
  return null;
};

const DayAheadView = ({ data, timeGranularity }: { data: MarketDataPoint[]; timeGranularity: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>日前数据统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
              <TableRow>
                <TableHead>时间点</TableHead>
                <TableHead className="text-right">统调负荷 (MW)</TableHead>
                <TableHead className="text-right">竞价空间 (MW)</TableHead>
                <TableHead className="text-right">新能源负荷 (MW)</TableHead>
                <TableHead className="text-right">日前价格 (元/MWh)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 50).map((point, idx) => (
                <TableRow key={idx} className="hover:bg-[#F8FBFA]">
                  <TableCell className="font-mono">
                    {format(point.timestamp, timeGranularity === '96' ? 'MM-dd HH:mm' : 'MM-dd HH:00')}
                  </TableCell>
                  <TableCell className="text-right font-mono">{point.gridLoad.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{point.biddingSpace.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{point.renewableLoad.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{point.clearingPriceDayAhead.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const IntradayView = ({ data, timeGranularity }: { data: MarketDataPoint[]; timeGranularity: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>日内数据统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
              <TableRow>
                <TableHead>时间点</TableHead>
                <TableHead className="text-right">统调负荷 (MW)</TableHead>
                <TableHead className="text-right">竞价空间 (MW)</TableHead>
                <TableHead className="text-right">新能源负荷 (MW)</TableHead>
                <TableHead className="text-right">实时价格 (元/MWh)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 50).map((point, idx) => (
                <TableRow key={idx} className="hover:bg-[#F8FBFA]">
                  <TableCell className="font-mono">
                    {format(point.timestamp, timeGranularity === '96' ? 'MM-dd HH:mm' : 'MM-dd HH:00')}
                  </TableCell>
                  <TableCell className="text-right font-mono">{point.gridLoad.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{point.biddingSpace.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{point.renewableLoad.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{point.clearingPriceRealtime.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const TableView = ({ data, timeGranularity }: { data: MarketDataPoint[]; timeGranularity: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>综合数据表 - 日前与日内对比</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-[#F1F8F4] z-10">
              <TableRow>
                <TableHead>时间点</TableHead>
                <TableHead className="text-right">日前价格</TableHead>
                <TableHead className="text-right">实时价格</TableHead>
                <TableHead className="text-right">价差</TableHead>
                <TableHead className="text-right">偏差率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 50).map((point, idx) => {
                const deviation = point.clearingPriceRealtime - point.clearingPriceDayAhead;
                const deviationRate = (deviation / point.clearingPriceDayAhead) * 100;
                const isHighDeviation = Math.abs(deviationRate) > 10;
                
                return (
                  <TableRow 
                    key={idx} 
                    className={`hover:bg-[#F8FBFA] ${isHighDeviation ? 'bg-red-50' : ''}`}
                  >
                    <TableCell className="font-mono">
                      {format(point.timestamp, timeGranularity === '96' ? 'MM-dd HH:mm' : 'MM-dd HH:00')}
                    </TableCell>
                    <TableCell className="text-right font-mono">{point.clearingPriceDayAhead.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{point.clearingPriceRealtime.toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-mono ${deviation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {deviation > 0 ? '+' : ''}{deviation.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${Math.abs(deviationRate) > 10 ? 'font-bold' : ''}`}>
                      {deviationRate > 0 ? '+' : ''}{deviationRate.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const ExtremesView = ({ data, timeGranularity }: { data: MarketDataPoint[]; timeGranularity: string }) => {
  const chartData = data.slice(0, 24).map((point) => ({
    time: format(point.timestamp, timeGranularity === '96' ? 'HH:mm' : 'HH:00'),
    最大值: point.clearingPriceDayAhead * 1.2,
    平均值: point.clearingPriceDayAhead,
    最小值: point.clearingPriceDayAhead * 0.8,
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>极值分布分析</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="最大值" fill="#EF4444" />
            <Bar dataKey="平均值" fill="#00B04D" />
            <Bar dataKey="最小值" fill="#0EA5E9" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const TrendView = ({ data, timeGranularity }: { data: MarketDataPoint[]; timeGranularity: string }) => {
  const chartData = data.map((point) => ({
    time: format(point.timestamp, timeGranularity === '96' ? 'HH:mm' : 'HH:00'),
    上限: point.clearingPriceDayAhead * 1.15,
    价格: point.clearingPriceDayAhead,
    下限: point.clearingPriceDayAhead * 0.85,
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>价格趋势与波动范围</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="上限" 
              stackId="1" 
              stroke="#F59E0B" 
              fill="#F59E0B" 
              fillOpacity={0.1} 
            />
            <Area 
              type="monotone" 
              dataKey="价格" 
              stackId="2" 
              stroke="#00B04D" 
              fill="#00B04D" 
              fillOpacity={0.3} 
            />
            <Area 
              type="monotone" 
              dataKey="下限" 
              stackId="3" 
              stroke="#0EA5E9" 
              fill="#0EA5E9" 
              fillOpacity={0.1} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

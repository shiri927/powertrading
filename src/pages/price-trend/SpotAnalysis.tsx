import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const hourlyData = [
  { hour: "00", price: 285, volume: 1200, avgPrice: 280 },
  { hour: "01", price: 275, volume: 1150, avgPrice: 270 },
  { hour: "02", price: 270, volume: 1100, avgPrice: 265 },
  { hour: "03", price: 265, volume: 1080, avgPrice: 262 },
  { hour: "04", price: 268, volume: 1120, avgPrice: 265 },
  { hour: "05", price: 280, volume: 1200, avgPrice: 275 },
  { hour: "06", price: 310, volume: 1350, avgPrice: 305 },
  { hour: "07", price: 340, volume: 1500, avgPrice: 335 },
  { hour: "08", price: 365, volume: 1650, avgPrice: 360 },
  { hour: "09", price: 380, volume: 1750, avgPrice: 375 },
  { hour: "10", price: 350, volume: 1600, avgPrice: 345 },
  { hour: "11", price: 320, volume: 1450, avgPrice: 315 },
  { hour: "12", price: 310, volume: 1400, avgPrice: 305 },
  { hour: "13", price: 305, volume: 1380, avgPrice: 300 },
  { hour: "14", price: 315, volume: 1420, avgPrice: 310 },
  { hour: "15", price: 330, volume: 1500, avgPrice: 325 },
  { hour: "16", price: 355, volume: 1620, avgPrice: 350 },
  { hour: "17", price: 385, volume: 1780, avgPrice: 380 },
  { hour: "18", price: 420, volume: 1950, avgPrice: 415 },
  { hour: "19", price: 450, volume: 2100, avgPrice: 445 },
  { hour: "20", price: 410, volume: 1850, avgPrice: 405 },
  { hour: "21", price: 370, volume: 1680, avgPrice: 365 },
  { hour: "22", price: 330, volume: 1500, avgPrice: 325 },
  { hour: "23", price: 300, volume: 1350, avgPrice: 295 },
];

const peakValleyData = [
  { period: "尖峰", hours: 4, avgPrice: 435, volume: 7800 },
  { period: "高峰", hours: 8, avgPrice: 355, volume: 12600 },
  { period: "平段", hours: 8, avgPrice: 305, volume: 11200 },
  { period: "低谷", hours: 4, avgPrice: 270, volume: 4500 },
];

const volatilityData = [
  { date: "11-13", volatility: 12.5, maxPrice: 450, minPrice: 265 },
  { date: "11-14", volatility: 15.2, maxPrice: 465, minPrice: 260 },
  { date: "11-15", volatility: 10.8, maxPrice: 440, minPrice: 275 },
  { date: "11-16", volatility: 13.6, maxPrice: 455, minPrice: 268 },
  { date: "11-17", volatility: 11.9, maxPrice: 448, minPrice: 272 },
  { date: "11-18", volatility: 14.3, maxPrice: 460, minPrice: 265 },
  { date: "11-19", volatility: 12.1, maxPrice: 450, minPrice: 270 },
];

export default function SpotAnalysis() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">现货电价分析</h1>
          <p className="text-muted-foreground mt-2">
            实时监控现货市场电价波动与趋势
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">省份：</span>
            <Select defaultValue="shanxi">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shanxi">山西省</SelectItem>
                <SelectItem value="shandong">山东省</SelectItem>
                <SelectItem value="zhejiang">浙江省</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">日期：</span>
            <Button variant="outline" size="sm">2025-11-19</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">当前电价</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-1">¥350</div>
            <p className="text-sm text-muted-foreground mt-2">元/MWh</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">日均价</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">¥328</div>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="text-green-500">↑ 5.2%</span> 较昨日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">最高价</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">¥450</div>
            <p className="text-sm text-muted-foreground mt-2">19:00 时段</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">最低价</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4">¥265</div>
            <p className="text-sm text-muted-foreground mt-2">03:00 时段</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hourly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hourly">分时电价</TabsTrigger>
          <TabsTrigger value="peak">峰谷分析</TabsTrigger>
          <TabsTrigger value="volatility">价格波动</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>24小时分时电价</CardTitle>
              <p className="text-sm text-muted-foreground">电价与成交量对比</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" label={{ value: '电价 (元/MWh)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" label={{ value: '成交量 (MWh)', angle: 90, position: 'insideRight' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Legend />
                  <Bar yAxisId="right" dataKey="volume" fill="hsl(var(--chart-4))" fillOpacity={0.3} name="成交量" />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="hsl(var(--chart-1))" strokeWidth={2} name="实际电价" />
                  <Line yAxisId="left" type="monotone" dataKey="avgPrice" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" name="平均电价" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>峰谷时段分析</CardTitle>
              <p className="text-sm text-muted-foreground">不同时段的电价与成交量统计</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={peakValleyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="avgPrice" fill="hsl(var(--chart-1))" name="平均电价 (元/MWh)" />
                  <Bar yAxisId="right" dataKey="volume" fill="hsl(var(--chart-2))" name="成交量 (MWh)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {peakValleyData.map((period) => (
              <Card key={period.period}>
                <CardHeader>
                  <CardTitle className="text-lg">{period.period}时段</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">时长</p>
                      <p className="text-xl font-bold">{period.hours}小时</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">平均电价</p>
                      <p className="text-xl font-bold text-chart-1">¥{period.avgPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">成交量</p>
                      <p className="text-xl font-bold text-chart-2">{period.volume}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="volatility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>价格波动分析</CardTitle>
              <p className="text-sm text-muted-foreground">近7日电价波动率统计</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={volatilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" label={{ value: '波动率 (%)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" label={{ value: '电价 (元/MWh)', angle: 90, position: 'insideRight' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="volatility" fill="hsl(var(--chart-3))" name="波动率" />
                  <Line yAxisId="right" type="monotone" dataKey="maxPrice" stroke="hsl(var(--chart-1))" strokeWidth={2} name="最高价" />
                  <Line yAxisId="right" type="monotone" dataKey="minPrice" stroke="hsl(var(--chart-2))" strokeWidth={2} name="最低价" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

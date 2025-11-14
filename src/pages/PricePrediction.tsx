import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, AlertTriangle, Target } from "lucide-react";

const priceForecast = [
  { time: "00:00", predicted: 285, actual: 280, confidence: 0.92 },
  { time: "04:00", predicted: 252, actual: 245, confidence: 0.89 },
  { time: "08:00", predicted: 385, actual: 380, confidence: 0.94 },
  { time: "12:00", predicted: 455, actual: 450, confidence: 0.91 },
  { time: "16:00", predicted: 518, actual: 520, confidence: 0.88 },
  { time: "20:00", predicted: 475, actual: 480, confidence: 0.90 },
  { time: "24:00", predicted: 315, actual: null, confidence: 0.87 },
];

const priceDiffData = [
  { time: "00:00", diff: 5, predicted: 4, upper: 8, lower: 1 },
  { time: "04:00", diff: -3, predicted: -2, upper: 2, lower: -6 },
  { time: "08:00", diff: 8, predicted: 7, upper: 12, lower: 3 },
  { time: "12:00", diff: -5, predicted: -6, upper: -2, lower: -10 },
  { time: "16:00", diff: 12, predicted: 10, upper: 15, lower: 5 },
  { time: "20:00", diff: -8, predicted: -7, upper: -3, lower: -12 },
];

const supplyDemandForecast = [
  { day: "Day 1", renewableOutput: 8500, load: 18200, thermal: 9800 },
  { day: "Day 3", renewableOutput: 9200, load: 17800, thermal: 8700 },
  { day: "Day 5", renewableOutput: 7800, load: 18600, thermal: 10900 },
  { day: "Day 7", renewableOutput: 8900, load: 18100, thermal: 9300 },
  { day: "Day 10", renewableOutput: 9500, load: 17500, thermal: 8100 },
  { day: "Day 15", renewableOutput: 8200, load: 18400, thermal: 10300 },
];

const PricePrediction = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Price Prediction & Forecasting</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered market analysis and price forecasting tools
        </p>
      </div>

      {/* Prediction Tabs */}
      <Tabs defaultValue="spot-price" className="w-full">
        <TabsList>
          <TabsTrigger value="spot-price">Spot Price (现货电价)</TabsTrigger>
          <TabsTrigger value="price-diff">Price Difference (价差)</TabsTrigger>
          <TabsTrigger value="supply-demand">Supply & Demand (供需)</TabsTrigger>
        </TabsList>

        {/* Spot Price Prediction */}
        <TabsContent value="spot-price" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Prediction Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">92.4%</div>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days average</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tomorrow Peak Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥518/MWh</div>
                <p className="text-xs text-warning mt-1">Expected at 16:00</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tomorrow Valley Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥252/MWh</div>
                <p className="text-xs text-muted-foreground mt-1">Expected at 04:00</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Day-ahead Price Prediction (日前电价预测)</CardTitle>
              <CardDescription>
                Predicted vs actual spot prices with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="outline">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  96-point forecast available
                </Badge>
                <Badge variant="secondary">
                  Confidence: 89.5%
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={priceForecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis 
                    label={{ value: 'Price (¥/MWh)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="Actual Price (实际电价)"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted Price (预测电价)"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Prediction Factors</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weather Conditions</span>
                    <span className="font-medium">Clear, Windy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Renewable Output Forecast</span>
                    <span className="font-medium">High (9,200 MW)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Load Forecast</span>
                    <span className="font-medium">Normal (18,100 MW)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coal Price Trend</span>
                    <span className="font-medium text-success">Stable</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Difference Prediction */}
        <TabsContent value="price-diff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Day-ahead vs Real-time Price Difference (价差预测)
              </CardTitle>
              <CardDescription>
                Spot market arbitrage opportunity analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={priceDiffData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis 
                    label={{ value: 'Price Diff (¥/MWh)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="upper" 
                    stroke="hsl(var(--chart-3))" 
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.2}
                    name="Upper Bound"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lower" 
                    stroke="hsl(var(--chart-3))" 
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.2}
                    name="Lower Bound"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Predicted Difference (预测价差)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diff" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Actual Difference (实际价差)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="p-3 border border-border rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Direction Accuracy</div>
                  <div className="text-lg font-bold text-success">87.3%</div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Value Prediction Error</div>
                  <div className="text-lg font-bold">±3.2 ¥/MWh</div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Arbitrage Opportunities</div>
                  <div className="text-lg font-bold text-warning">4 periods</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Difference Drivers Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bidding Space Difference</span>
                  <span className="text-sm font-medium text-primary">High Impact</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Renewable Forecast Error</span>
                  <span className="text-sm font-medium text-secondary">Medium Impact</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Load Forecast Accuracy</span>
                  <span className="text-sm font-medium text-muted-foreground">Low Impact</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supply & Demand Forecast */}
        <TabsContent value="supply-demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>15-Day Supply & Demand Forecast (市场供需预测)</CardTitle>
              <CardDescription>
                Renewable output, thermal generation, and load predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={supplyDemandForecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis 
                    label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft' }}
                    className="text-xs" 
                  />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="renewableOutput" 
                    stackId="1"
                    stroke="hsl(var(--chart-3))" 
                    fill="hsl(var(--chart-3))"
                    name="Renewable Output (新能源出力)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="thermal" 
                    stackId="1"
                    stroke="hsl(var(--chart-4))" 
                    fill="hsl(var(--chart-4))"
                    name="Thermal Generation (火电)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="load" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="System Load (负荷预测)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>7-Day Bidding Space Forecast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tomorrow</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">2,850 MW</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Day 3</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">3,420 MW</span>
                    <Badge variant="default">High</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Day 7</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">2,180 MW</span>
                    <Badge variant="secondary">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inter-regional Transmission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Import Forecast</span>
                  <span className="text-sm font-medium">1,250 MW</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Export Forecast</span>
                  <span className="text-sm font-medium">850 MW</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Net Position</span>
                  <span className="text-sm font-medium text-success">+400 MW</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricePrediction;

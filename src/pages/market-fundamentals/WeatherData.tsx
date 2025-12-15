import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { CloudRain, Wind, Sun, Thermometer, AlertTriangle, Settings, Download, Play, Pause, MapPin, Loader2 } from "lucide-react";
import { WeatherMapStatic } from "@/components/weather/WeatherMapStatic";
import { format, subDays } from "date-fns";
import {
  useHourlyWeatherData,
  useDailyWeatherData,
  useChartWeatherData,
  useWeatherAlerts,
  alertLevelColors,
  alertLevelText,
} from "@/hooks/useWeatherData";

const WeatherData = () => {
  const [selectedProvince, setSelectedProvince] = useState("山东省");
  const [selectedDataSource, setSelectedDataSource] = useState("数据版本1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStations, setShowStations] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [colorMode, setColorMode] = useState("gradient");
  const [expandedChart, setExpandedChart] = useState(false);

  // 使用数据库hooks
  const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: hourlyData = [], isLoading: loadingHourly } = useHourlyWeatherData({
    province: selectedProvince,
    startDate,
    endDate,
    dataSource: selectedDataSource,
  });

  const { data: dailyData = [], isLoading: loadingDaily } = useDailyWeatherData({
    province: selectedProvince,
    startDate,
    endDate,
  });

  const { data: chartData = [], isLoading: loadingChart } = useChartWeatherData({
    province: selectedProvince,
    days: 7,
  });

  const { data: weatherAlerts = [], isLoading: loadingAlerts } = useWeatherAlerts({
    province: selectedProvince,
    activeOnly: true,
  });

  const isLoading = loadingHourly || loadingDaily || loadingChart;

  // 限制显示的数据条数
  const displayHourlyData = useMemo(() => hourlyData.slice(-24), [hourlyData]);
  const displayDailyData = useMemo(() => dailyData.slice(-7), [dailyData]);
  const displayChartData = useMemo(() => chartData.slice(-7), [chartData]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">气象数据</h1>
        <p className="text-muted-foreground mt-2">
          新能源发电的气象预报与地图可视化
        </p>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList>
          <TabsTrigger value="map">气象地图</TabsTrigger>
          <TabsTrigger value="comparison">气象对比</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          {/* Query Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label>选择日期</Label>
                  <div className="flex gap-2 mt-2">
                    <Select defaultValue="2025-01-20">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025-01-20">2025-01-20</SelectItem>
                        <SelectItem value="2025-01-21">2025-01-21</SelectItem>
                        <SelectItem value="2025-01-22">2025-01-22</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="self-center">→</span>
                    <Select defaultValue="2025-01-26">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025-01-26">2025-01-26</SelectItem>
                        <SelectItem value="2025-01-27">2025-01-27</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label>省份及地区</Label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="新疆维吾尔自治区">新疆维吾尔自治区</SelectItem>
                      <SelectItem value="山西省">山西省</SelectItem>
                      <SelectItem value="山东省">山东省</SelectItem>
                      <SelectItem value="浙江省">浙江省</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label>数据源</Label>
                  <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="数据版本1">数据版本1</SelectItem>
                      <SelectItem value="数据版本2">数据版本2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      气象设置
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>气象设置</DialogTitle>
                      <DialogDescription>
                        配置地图展示选项
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="color-mode">颜色统计方式</Label>
                        <Select value={colorMode} onValueChange={setColorMode}>
                          <SelectTrigger id="color-mode" className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gradient">渐变色</SelectItem>
                            <SelectItem value="discrete">离散色</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-stations">展示场站</Label>
                        <Switch
                          id="show-stations"
                          checked={showStations}
                          onCheckedChange={setShowStations}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-warnings">展示预警信息</Label>
                        <Switch
                          id="show-warnings"
                          checked={showWarnings}
                          onCheckedChange={setShowWarnings}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">保存设置</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  下载数据
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map and Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Map Area */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>气象地图</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        暂停
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        播放
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription>2025-01-20 01:00</CardDescription>
              </CardHeader>
              <CardContent>
                <WeatherMapStatic 
                  showStations={showStations} 
                  showWarnings={showWarnings}
                  selectedProvince={selectedProvince}
                />
              </CardContent>
            </Card>

            {/* Statistics Charts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">气象数据统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">温度-地面-2m (°C)</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={displayChartData}>
                      <Line type="monotone" dataKey="temp" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">风速-地面-10m (m/s)</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={displayChartData}>
                      <Line type="monotone" dataKey="wind" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">总云量 (%)</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={displayChartData}>
                      <Line type="monotone" dataKey="humidity" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">辐照度 (W/m^2)</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={displayChartData}>
                      <Line type="monotone" dataKey="radiation" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setExpandedChart(!expandedChart)}
                >
                  {expandedChart ? "收起" : "展开"}统计图
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Data Lists */}
          <Card>
            <CardHeader>
              <CardTitle>数据列表</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="daily" className="w-full">
                <TabsList>
                  <TabsTrigger value="daily">日均值</TabsTrigger>
                  <TabsTrigger value="hourly">小时均值</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="mt-4">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日期</TableHead>
                          <TableHead>最大值</TableHead>
                          <TableHead>最小值</TableHead>
                          <TableHead>合计/平均</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayDailyData.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{row.date}</TableCell>
                            <TableCell>{row.max}</TableCell>
                            <TableCell>{row.min}</TableCell>
                            <TableCell>{row.avg}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="hourly" className="mt-4">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日期</TableHead>
                          <TableHead>温度-地面-2m (°C)</TableHead>
                          <TableHead>风速-地面-10m (m/s)</TableHead>
                          <TableHead>总云量 (%)</TableHead>
                          <TableHead>辐照度 (W/m^2)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayHourlyData.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{row.hour}</TableCell>
                            <TableCell>{row.temp}</TableCell>
                            <TableCell>{row.wind}</TableCell>
                            <TableCell>{row.humidity}</TableCell>
                            <TableCell>{row.radiation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {/* Weather Type Tabs */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="temperature" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="h-9">
                    <TabsTrigger value="temperature" className="text-xs">温度</TabsTrigger>
                    <TabsTrigger value="wind" className="text-xs">风速</TabsTrigger>
                    <TabsTrigger value="cloud" className="text-xs">总云量</TabsTrigger>
                    <TabsTrigger value="humidity" className="text-xs">相对湿度</TabsTrigger>
                    <TabsTrigger value="pressure" className="text-xs">压强</TabsTrigger>
                    <TabsTrigger value="rain" className="text-xs">降雨量</TabsTrigger>
                    <TabsTrigger value="snow" className="text-xs">降雪</TabsTrigger>
                    <TabsTrigger value="depth" className="text-xs">积雪厚度</TabsTrigger>
                    <TabsTrigger value="radiation" className="text-xs">辐照度</TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">展示序列:</span>
                    <Select defaultValue="interpolate">
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interpolate">中插展示</SelectItem>
                        <SelectItem value="original">原始展示</SelectItem>
                      </SelectContent>
                    </Select>

                    <span className="text-muted-foreground ml-2">分析方式:</span>
                    <Select defaultValue="trend">
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trend">趋势</SelectItem>
                        <SelectItem value="deviation">偏差</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" className="ml-2">
                      展示设置
                    </Button>
                  </div>
                </div>

                <TabsContent value="temperature" className="space-y-4 mt-0">
                  <Tabs defaultValue="forecast" className="w-full">
                    <div className="flex items-center justify-between">
                      <TabsList className="h-8">
                        <TabsTrigger value="forecast" className="text-xs">预测</TabsTrigger>
                        <TabsTrigger value="actual" className="text-xs">实况</TabsTrigger>
                        <TabsTrigger value="comparison" className="text-xs">天场站预测对比</TabsTrigger>
                      </TabsList>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          数据器设置
                        </Button>
                        <Button variant="outline" size="sm">
                          统计期数
                        </Button>
                        <Button variant="outline" size="sm">
                          栏间日志分析
                        </Button>
                      </div>
                    </div>

                    <TabsContent value="forecast" className="mt-4">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Charts Section */}
                        <div className="lg:col-span-3 space-y-4">
                          {/* Data Source Selection */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">数据版本选择:</span>
                            <Select defaultValue="version1">
                              <SelectTrigger className="w-[200px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="version1">数据版1-版测</SelectItem>
                                <SelectItem value="version2">数据版2-版测</SelectItem>
                                <SelectItem value="version3">数据版3-版测</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Main Comparison Chart */}
                          <Card>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-0.5 bg-blue-500"></div>
                                    <span>数据版1-地质-地下面-2m</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-0.5 bg-red-500"></div>
                                    <span>数据版2-版测</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-0.5 bg-green-500"></div>
                                    <span>数据版3-地质-地下面-2m</span>
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground">1/3 ▶</div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={[
                                  { time: '2025-01-17 01:00', v1: -3, v2: -4, v3: -2 },
                                  { time: '2025-01-17 07:00', v1: -6, v2: -8, v3: -5 },
                                  { time: '2025-01-17 13:00', v1: 0, v2: -2, v3: 1 },
                                  { time: '2025-01-17 19:00', v1: -4, v2: -6, v3: -3 },
                                  { time: '2025-01-18 01:00', v1: -7, v2: -9, v3: -6 },
                                  { time: '2025-01-18 07:00', v1: -10, v2: -12, v3: -9 },
                                  { time: '2025-01-18 13:00', v1: -2, v2: -4, v3: -1 },
                                  { time: '2025-01-18 19:00', v1: -6, v2: -8, v3: -5 },
                                  { time: '2025-01-19 01:00', v1: -9, v2: -11, v3: -8 },
                                  { time: '2025-01-19 07:00', v1: -13, v2: -15, v3: -12 },
                                  { time: '2025-01-19 13:00', v1: -3, v2: -5, v3: -2 },
                                  { time: '2025-01-19 19:00', v1: -7, v2: -9, v3: -6 },
                                  { time: '2025-01-20 01:00', v1: -10, v2: -12, v3: -9 },
                                  { time: '2025-01-20 07:00', v1: -14, v2: -16, v3: -13 },
                                  { time: '2025-01-20 13:00', v1: -4, v2: -6, v3: -3 },
                                  { time: '2025-01-20 19:00', v1: -8, v2: -10, v3: -7 },
                                  { time: '2025-01-21 01:00', v1: -11, v2: -13, v3: -10 },
                                  { time: '2025-01-21 07:00', v1: -15, v2: -17, v3: -14 },
                                  { time: '2025-01-21 13:00', v1: -5, v2: -7, v3: -4 },
                                  { time: '2025-01-21 19:00', v1: -9, v2: -11, v3: -8 },
                                  { time: '2025-01-22 01:00', v1: -12, v2: -14, v3: -11 },
                                  { time: '2025-01-22 07:00', v1: -4, v2: -6, v3: -3 },
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                  <XAxis 
                                    dataKey="time" 
                                    tick={{ fontSize: 10 }}
                                    interval="preserveStartEnd"
                                  />
                                  <YAxis tick={{ fontSize: 10 }} label={{ value: '℃', angle: 0, position: 'top' }} />
                                  <Tooltip />
                                  <Line type="monotone" dataKey="v1" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                  <Line type="monotone" dataKey="v2" stroke="#ef4444" strokeWidth={2} dot={false} />
                                  <Line type="monotone" dataKey="v3" stroke="#10b981" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          {/* Deviation Analysis Chart */}
                          <Card>
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">储差值:</span>
                                  <Select defaultValue="version1">
                                    <SelectTrigger className="w-[150px] h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="version1">数据版1-版测</SelectItem>
                                      <SelectItem value="version2">数据版2-版测</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Select defaultValue="version2">
                                    <SelectTrigger className="w-[150px] h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="version2">数据版2-版测</SelectItem>
                                      <SelectItem value="version3">数据版3-版测</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={[
                                  { time: '2025-01-17 01:00', positive: 2, negative: null },
                                  { time: '2025-01-17 07:00', positive: null, negative: -1 },
                                  { time: '2025-01-17 13:00', positive: 3, negative: null },
                                  { time: '2025-01-17 19:00', positive: null, negative: -2 },
                                  { time: '2025-01-18 01:00', positive: 2.5, negative: null },
                                  { time: '2025-01-18 07:00', positive: null, negative: -1.5 },
                                  { time: '2025-01-18 13:00', positive: 4, negative: null },
                                  { time: '2025-01-18 19:00', positive: null, negative: -2.5 },
                                  { time: '2025-01-19 01:00', positive: 3, negative: null },
                                  { time: '2025-01-19 07:00', positive: null, negative: -2 },
                                  { time: '2025-01-19 13:00', positive: 4.5, negative: null },
                                  { time: '2025-01-19 19:00', positive: null, negative: -3 },
                                  { time: '2025-01-20 01:00', positive: 3.5, negative: null },
                                  { time: '2025-01-20 07:00', positive: null, negative: -2.5 },
                                  { time: '2025-01-20 13:00', positive: 5, negative: null },
                                  { time: '2025-01-20 19:00', positive: null, negative: -3.5 },
                                  { time: '2025-01-21 01:00', positive: 4, negative: null },
                                  { time: '2025-01-21 07:00', positive: null, negative: -3 },
                                  { time: '2025-01-21 13:00', positive: 5.5, negative: null },
                                  { time: '2025-01-21 19:00', positive: null, negative: -4 },
                                  { time: '2025-01-22 01:00', positive: 4.5, negative: null },
                                  { time: '2025-01-22 07:00', positive: null, negative: -3.5 },
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                  <XAxis 
                                    dataKey="time" 
                                    tick={{ fontSize: 10 }}
                                    interval="preserveStartEnd"
                                  />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <Tooltip />
                                  <Line type="monotone" dataKey="positive" stroke="#10b981" fill="#10b981" strokeWidth={0} />
                                  <Line type="monotone" dataKey="negative" stroke="#ef4444" fill="#ef4444" strokeWidth={0} />
                                </LineChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Statistics Table */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">温度-数据统计</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs">日期</TableHead>
                                    <TableHead className="text-xs">最大值</TableHead>
                                    <TableHead className="text-xs">最小值</TableHead>
                                    <TableHead className="text-xs">平均值</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="text-xs font-medium">合计</TableCell>
                                    <TableCell className="text-xs">-3.2</TableCell>
                                    <TableCell className="text-xs">-10.8</TableCell>
                                    <TableCell className="text-xs">-7.4</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="text-xs">2025-01-17</TableCell>
                                    <TableCell className="text-xs">-4.7</TableCell>
                                    <TableCell className="text-xs">-10.8</TableCell>
                                    <TableCell className="text-xs">-8.6</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="text-xs">2025-01-18</TableCell>
                                    <TableCell className="text-xs">-4.0</TableCell>
                                    <TableCell className="text-xs">-9.8</TableCell>
                                    <TableCell className="text-xs">-7.8</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="text-xs">2025-01-19</TableCell>
                                    <TableCell className="text-xs">-3.5</TableCell>
                                    <TableCell className="text-xs">-9.5</TableCell>
                                    <TableCell className="text-xs">-7.2</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="text-xs">2025-01-20</TableCell>
                                    <TableCell className="text-xs">-3.2</TableCell>
                                    <TableCell className="text-xs">-9.3</TableCell>
                                    <TableCell className="text-xs">-7.0</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="text-xs">2025-01-21</TableCell>
                                    <TableCell className="text-xs">-3.2</TableCell>
                                    <TableCell className="text-xs">-9.2</TableCell>
                                    <TableCell className="text-xs">-7.0</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="text-xs">2025-01-22</TableCell>
                                    <TableCell className="text-xs">-3.4</TableCell>
                                    <TableCell className="text-xs">-8.9</TableCell>
                                    <TableCell className="text-xs">-6.8</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="text-xs">2025-01-23</TableCell>
                                    <TableCell className="text-xs">-4.6</TableCell>
                                    <TableCell className="text-xs">-9.0</TableCell>
                                    <TableCell className="text-xs">-7.1</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="actual">
                      <div className="text-center text-muted-foreground py-12">
                        <p>实况数据功能开发中</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="comparison">
                      <div className="text-center text-muted-foreground py-12">
                        <p>天场站预测对比功能开发中</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                {/* Other weather type tabs */}
                <TabsContent value="wind">
                  <div className="text-center text-muted-foreground py-12">
                    <p>风速对比功能开发中</p>
                  </div>
                </TabsContent>

                <TabsContent value="cloud">
                  <div className="text-center text-muted-foreground py-12">
                    <p>总云量对比功能开发中</p>
                  </div>
                </TabsContent>

                <TabsContent value="humidity">
                  <div className="text-center text-muted-foreground py-12">
                    <p>相对湿度对比功能开发中</p>
                  </div>
                </TabsContent>

                <TabsContent value="pressure">
                  <div className="text-center text-muted-foreground py-12">
                    <p>压强对比功能开发中</p>
                  </div>
                </TabsContent>

                <TabsContent value="rain">
                  <div className="text-center text-muted-foreground py-12">
                    <p>降雨量对比功能开发中</p>
                  </div>
                </TabsContent>

                <TabsContent value="snow">
                  <div className="text-center text-muted-foreground py-12">
                    <p>降雪对比功能开发中</p>
                  </div>
                </TabsContent>

                <TabsContent value="depth">
                  <div className="text-center text-muted-foreground py-12">
                    <p>积雪厚度对比功能开发中</p>
                  </div>
                </TabsContent>

                <TabsContent value="radiation">
                  <div className="text-center text-muted-foreground py-12">
                    <p>辐照度对比功能开发中</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherData;

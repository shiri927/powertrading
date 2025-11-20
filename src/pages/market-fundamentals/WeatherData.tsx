import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { CloudRain, Wind, Sun, Thermometer, AlertTriangle, Settings, Download, Play, Pause, MapPin } from "lucide-react";

// Sample data for hourly weather
const hourlyData = [
  { hour: "01-20", temp: -6.8, wind: 2.2, humidity: 68.5, radiation: 117.3 },
  { hour: "01-21", temp: -7.0, wind: 0.9, humidity: 57.4, radiation: 89.2 },
  { hour: "01-22", temp: -6.8, wind: 1.1, humidity: 60.5, radiation: 93.9 },
  { hour: "01-23", temp: -7.1, wind: 2.1, humidity: 62.4, radiation: 93.0 },
];

// Sample data for daily averages
const dailyData = [
  { date: "01-20", max: -6.8, min: -14.1, avg: -9.5, wind: 2.2 },
  { date: "01-21", max: -7.0, min: -14.1, avg: -9.5, wind: 0.9 },
  { date: "01-22", max: -6.8, min: -14.1, avg: -9.5, wind: 1.3 },
];

// Chart data for statistics
const chartData = [
  { time: "01-20", temp: -6.8, wind: 2.2, humidity: 68.5, radiation: 117.3 },
  { time: "01-22", temp: -7.0, wind: 1.0, humidity: 60.0, radiation: 89.2 },
  { time: "01-24", temp: -6.5, wind: 1.5, humidity: 55.0, radiation: 95.0 },
  { time: "01-26", temp: -7.1, wind: 2.1, humidity: 62.4, radiation: 93.0 },
];

const WeatherData = () => {
  const [selectedProvince, setSelectedProvince] = useState("新疆维吾尔自治区");
  const [selectedDataSource, setSelectedDataSource] = useState("数据版本1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStations, setShowStations] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [colorMode, setColorMode] = useState("gradient");
  const [expandedChart, setExpandedChart] = useState(false);

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
                <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-950 dark:to-orange-950 rounded-lg flex items-center justify-center border">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-20"></div>
                  
                  {/* Simulated map markers */}
                  <div className="absolute top-1/4 left-1/3">
                    <div className="relative">
                      <Badge className="bg-blue-500 hover:bg-blue-600">多个预警</Badge>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500"></div>
                    </div>
                  </div>
                  
                  <div className="absolute top-1/2 left-1/4">
                    <div className="relative">
                      <Badge className="bg-blue-500 hover:bg-blue-600">多个预警</Badge>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500"></div>
                    </div>
                  </div>

                  <div className="absolute bottom-1/4 left-1/2 bg-orange-400/80 text-white px-3 py-1 rounded text-sm">
                    -16.8°C
                  </div>

                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>中国气象地图热力图</p>
                    <p className="text-sm">（演示界面）</p>
                  </div>

                  {/* Legend on the right */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm border rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      <span>温度-地面-2m (°C)</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                        <span>0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                        <span>-10</span>
                      </div>
                    </div>
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4" />
                        <span>风速-地面-10m (m/s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <span>总云量 (%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CloudRain className="h-4 w-4" />
                        <span>辐照度 (W/m^2)</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="temp" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">风速-地面-10m (m/s)</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="wind" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">总云量 (%)</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="humidity" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">辐照度 (W/m^2)</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={chartData}>
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
                        {dailyData.map((row, idx) => (
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
                        {hourlyData.map((row, idx) => (
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
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>气象对比功能开发中</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherData;

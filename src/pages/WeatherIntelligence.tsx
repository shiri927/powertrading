import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Wind, Sun, Thermometer, AlertTriangle } from "lucide-react";

const weatherAlerts = [
  {
    id: 1,
    type: "Strong Wind",
    level: "Orange",
    region: "Northern Region",
    startTime: "2024-03-15 14:00",
    endTime: "2024-03-15 22:00",
    description: "Wind speeds up to 25 m/s expected, potential impact on wind generation",
    severity: "high"
  },
  {
    id: 2,
    type: "Heavy Rain",
    level: "Yellow",
    region: "Central Region",
    startTime: "2024-03-16 08:00",
    endTime: "2024-03-16 18:00",
    description: "Moderate rainfall expected, minor impact on solar generation",
    severity: "medium"
  }
];

const weatherForecast = [
  {
    day: "Today",
    temp: "18°C",
    windSpeed: "12 m/s",
    solar: "850 W/m²",
    humidity: "45%",
    icon: Sun
  },
  {
    day: "Tomorrow",
    temp: "15°C",
    windSpeed: "22 m/s",
    solar: "420 W/m²",
    humidity: "62%",
    icon: Wind
  },
  {
    day: "Day 3",
    temp: "14°C",
    windSpeed: "8 m/s",
    solar: "320 W/m²",
    humidity: "78%",
    icon: CloudRain
  },
  {
    day: "Day 7",
    temp: "19°C",
    windSpeed: "15 m/s",
    solar: "920 W/m²",
    humidity: "38%",
    icon: Sun
  },
  {
    day: "Day 15",
    temp: "21°C",
    windSpeed: "10 m/s",
    solar: "880 W/m²",
    humidity: "42%",
    icon: Sun
  }
];

const regionData = [
  {
    name: "Northern Region",
    windSpeed: "18 m/s",
    solar: "720 W/m²",
    temp: "16°C",
    forecast: "High wind generation expected"
  },
  {
    name: "Central Region",
    windSpeed: "8 m/s",
    solar: "850 W/m²",
    temp: "19°C",
    forecast: "Optimal solar conditions"
  },
  {
    name: "Southern Region",
    windSpeed: "12 m/s",
    solar: "780 W/m²",
    temp: "22°C",
    forecast: "Moderate generation conditions"
  }
];

const WeatherIntelligence = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">气象情报</h1>
        <p className="text-muted-foreground mt-2">
          新能源发电的气象预报与预警信息
        </p>
      </div>

      {/* Weather Alerts */}
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            气象预警
          </CardTitle>
          <CardDescription>
            来自国家气象局的活跃天气预警
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weatherAlerts.map((alert) => (
              <div 
                key={alert.id}
                className="p-4 border-l-4 bg-muted/50 rounded-r-lg"
                style={{
                  borderLeftColor: alert.severity === "high" 
                    ? "hsl(var(--warning))" 
                    : "hsl(var(--chart-4))"
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{alert.type}</h4>
                      <Badge variant={alert.severity === "high" ? "destructive" : "default"}>
                        {alert.level} Alert
                      </Badge>
                      <Badge variant="outline">{alert.region}</Badge>
                    </div>
                    <p className="text-sm text-foreground/80 mb-2">{alert.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Start: {alert.startTime}</span>
                      <span>End: {alert.endTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 15-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>15日气象预报</CardTitle>
          <CardDescription>
            新能源发电预测关键气象参数
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {weatherForecast.map((forecast, index) => {
              const Icon = forecast.icon;
              return (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6 text-center">
                    <div className="flex justify-center mb-3">
                      <Icon className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{forecast.day}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">温度</span>
                        <span className="font-medium">{forecast.temp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">风速</span>
                        <span className="font-medium">{forecast.windSpeed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">辐照度</span>
                        <span className="font-medium">{forecast.solar}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">湿度</span>
                        <span className="font-medium">{forecast.humidity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Regional Weather Map */}
      <Card>
        <CardHeader>
          <CardTitle>区域天气概况</CardTitle>
          <CardDescription>
            各发电区域当前天气状况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {regionData.map((region, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{region.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-secondary" />
                    <span className="text-sm text-muted-foreground">风速:</span>
                    <span className="text-sm font-medium">{region.windSpeed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-warning" />
                    <span className="text-sm text-muted-foreground">辐照度:</span>
                    <span className="text-sm font-medium">{region.solar}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">温度:</span>
                    <span className="text-sm font-medium">{region.temp}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">{region.forecast}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* External Transmission Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>外送价格计算器</CardTitle>
          <CardDescription>
            考虑输配电价和线损的输电成本计算
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">送端电价</label>
                <div className="mt-1 text-2xl font-bold text-primary">¥368/MWh</div>
              </div>
              <div>
                <label className="text-sm font-medium">输配电价</label>
                <div className="mt-1 text-lg font-semibold">¥42/MWh</div>
              </div>
              <div>
                <label className="text-sm font-medium">线损率</label>
                <div className="mt-1 text-lg font-semibold">3.2%</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
                <label className="text-sm font-medium text-primary">受端电价</label>
                <div className="mt-1 text-3xl font-bold text-primary">¥422/MWh</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">基础电价</span>
                  <span className="font-medium">¥368/MWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">+ 输配电价</span>
                  <span className="font-medium">¥42/MWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">+ 线损调整</span>
                  <span className="font-medium">¥12/MWh</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-semibold">总计</span>
                  <span className="font-bold text-primary">¥422/MWh</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherIntelligence;

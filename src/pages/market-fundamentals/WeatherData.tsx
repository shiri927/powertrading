import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Wind, Sun, Thermometer, AlertTriangle } from "lucide-react";

const weatherAlerts = [
  {
    id: 1,
    type: "大风",
    level: "橙色",
    region: "北部地区",
    startTime: "2024-03-15 14:00",
    endTime: "2024-03-15 22:00",
    description: "预计风速达25 m/s，可能影响风力发电",
    severity: "high"
  },
  {
    id: 2,
    type: "暴雨",
    level: "黄色",
    region: "中部地区",
    startTime: "2024-03-16 08:00",
    endTime: "2024-03-16 18:00",
    description: "预计有中度降雨，对光伏发电有轻微影响",
    severity: "medium"
  }
];

const weatherForecast = [
  {
    day: "今天",
    temp: "18°C",
    windSpeed: "12 m/s",
    solar: "850 W/m²",
    humidity: "45%",
    icon: Sun
  },
  {
    day: "明天",
    temp: "15°C",
    windSpeed: "22 m/s",
    solar: "420 W/m²",
    humidity: "62%",
    icon: Wind
  },
  {
    day: "第3天",
    temp: "14°C",
    windSpeed: "8 m/s",
    solar: "320 W/m²",
    humidity: "78%",
    icon: CloudRain
  },
  {
    day: "第7天",
    temp: "19°C",
    windSpeed: "15 m/s",
    solar: "920 W/m²",
    humidity: "38%",
    icon: Sun
  },
  {
    day: "第15天",
    temp: "21°C",
    windSpeed: "10 m/s",
    solar: "880 W/m²",
    humidity: "42%",
    icon: Sun
  }
];

const regionData = [
  {
    name: "北部地区",
    windSpeed: "18 m/s",
    solar: "720 W/m²",
    temp: "16°C",
    forecast: "预计高风力发电"
  },
  {
    name: "中部地区",
    windSpeed: "8 m/s",
    solar: "850 W/m²",
    temp: "19°C",
    forecast: "光伏条件最佳"
  },
  {
    name: "南部地区",
    windSpeed: "12 m/s",
    solar: "780 W/m²",
    temp: "22°C",
    forecast: "中等发电条件"
  }
];

const WeatherData = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">气象数据</h1>
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
                        {alert.level}预警
                      </Badge>
                      <Badge variant="outline">{alert.region}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {alert.startTime} - {alert.endTime}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 15-day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>15天气象预报</CardTitle>
          <CardDescription>
            温度、风速、太阳辐射强度预报
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {weatherForecast.map((forecast, index) => {
              const Icon = forecast.icon;
              return (
                <div 
                  key={index}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-center space-y-3">
                    <p className="font-semibold text-foreground">{forecast.day}</p>
                    <Icon className="h-8 w-8 mx-auto text-primary" />
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">温度:</span>
                        <span className="font-medium">{forecast.temp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">风速:</span>
                        <span className="font-medium">{forecast.windSpeed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">辐射:</span>
                        <span className="font-medium">{forecast.solar}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">湿度:</span>
                        <span className="font-medium">{forecast.humidity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Regional Weather Overview */}
      <Card>
        <CardHeader>
          <CardTitle>区域气象总览</CardTitle>
          <CardDescription>
            各发电区域当前气象条件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regionData.map((region, index) => (
              <div 
                key={index}
                className="p-4 border border-border rounded-lg"
              >
                <h4 className="font-semibold text-foreground mb-3">{region.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">风速:</span>
                    <span className="font-medium ml-auto">{region.windSpeed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">太阳辐射:</span>
                    <span className="font-medium ml-auto">{region.solar}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">温度:</span>
                    <span className="font-medium ml-auto">{region.temp}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">预报: </span>
                    {region.forecast}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherData;

import React, { useState, memo } from "react";
import { Thermometer, Wind, Sun, CloudRain } from "lucide-react";
import chinaMapBg from "@/assets/china-map-bg.png";

interface StationData {
  id: string;
  name: string;
  province: string;
  left: string;
  top: string;
  temp: number;
  wind: number;
}

// Weather stations with temperature data (percentage positions)
const weatherStations: StationData[] = [
  { id: "1", name: "乌鲁木齐", province: "新疆", left: "22%", top: "22%", temp: -12.5, wind: 3.2 },
  { id: "2", name: "哈密", province: "新疆", left: "30%", top: "28%", temp: -8.3, wind: 4.1 },
  { id: "3", name: "太原", province: "山西", left: "65%", top: "40%", temp: -6.8, wind: 2.2 },
  { id: "4", name: "济南", province: "山东", left: "78%", top: "42%", temp: -2.1, wind: 1.8 },
  { id: "5", name: "青岛", province: "山东", left: "82%", top: "46%", temp: 0.5, wind: 3.5 },
  { id: "6", name: "杭州", province: "浙江", left: "82%", top: "62%", temp: 8.2, wind: 1.2 },
  { id: "7", name: "哈尔滨", province: "黑龙江", left: "88%", top: "12%", temp: -22.5, wind: 2.8 },
  { id: "8", name: "长春", province: "吉林", left: "88%", top: "18%", temp: -18.2, wind: 2.1 },
  { id: "9", name: "成都", province: "四川", left: "48%", top: "55%", temp: 6.5, wind: 0.8 },
  { id: "10", name: "广州", province: "广东", left: "68%", top: "78%", temp: 18.5, wind: 1.5 },
];

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  content: string;
}

// Get temperature color
const getTempColor = (temp: number): string => {
  if (temp <= -20) return "#1e3a8a"; // deep blue
  if (temp <= -10) return "#3b82f6"; // blue
  if (temp <= 0) return "#06b6d4"; // cyan
  if (temp <= 10) return "#22c55e"; // green
  if (temp <= 20) return "#eab308"; // yellow
  return "#ef4444"; // red
};

interface WeatherMapStaticProps {
  showStations?: boolean;
  showWarnings?: boolean;
  selectedProvince?: string;
}

export const WeatherMapStatic = memo(({ 
  showStations = true, 
  showWarnings = true,
  selectedProvince 
}: WeatherMapStaticProps) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    content: "",
  });

  const handleStationMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    station: StationData
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${station.name} | ${station.temp}°C | 风速 ${station.wind}m/s`,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
      {/* Background Map Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={chinaMapBg}
          alt="中国地图"
          className="w-full h-full object-contain max-h-[400px]"
          style={{ 
            filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))"
          }}
        />
        
        {/* Weather station markers overlay */}
        {showStations && weatherStations.map((station) => (
          <div
            key={station.id}
            className="absolute cursor-pointer flex items-center gap-1"
            style={{
              left: station.left,
              top: station.top,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={(e) => handleStationMouseEnter(e, station)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Station dot */}
            <div
              className="w-3 h-3 rounded-full border-2 border-white shadow-md"
              style={{
                backgroundColor: getTempColor(station.temp),
              }}
            />
            {/* Temperature label */}
            <span
              className="text-xs font-bold text-foreground bg-background/90 px-1 rounded shadow-sm"
              style={{ fontSize: "10px" }}
            >
              {station.temp}°
            </span>
          </div>
        ))}

        {/* Warning markers */}
        {showWarnings && (
          <>
            <div
              className="absolute px-2 py-1 rounded text-white text-xs font-medium shadow-md"
              style={{
                left: "22%",
                top: "26%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#3b82f6",
              }}
            >
              多个预警
            </div>
            <div
              className="absolute px-2 py-1 rounded text-white text-xs font-medium shadow-md"
              style={{
                left: "88%",
                top: "15%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#ef4444",
              }}
            >
              寒潮预警
            </div>
          </>
        )}
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 px-2 py-1 text-xs rounded pointer-events-none whitespace-nowrap bg-background border shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y - 30,
            transform: "translateX(-50%)",
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Temperature Legend */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/95 backdrop-blur-sm border rounded-lg p-2 space-y-1 text-xs shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <Thermometer className="h-3.5 w-3.5" />
          <span className="font-medium">温度 (°C)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
          <span>&gt;20</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#eab308" }} />
          <span>10~20</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#22c55e" }} />
          <span>0~10</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#06b6d4" }} />
          <span>-10~0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#3b82f6" }} />
          <span>-20~-10</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#1e3a8a" }} />
          <span>&lt;-20</span>
        </div>
        
        <div className="border-t pt-1.5 mt-1.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <Wind className="h-3 w-3" />
            <span>风速 (m/s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sun className="h-3 w-3" />
            <span>总云量 (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CloudRain className="h-3 w-3" />
            <span>辐照度</span>
          </div>
        </div>
      </div>
    </div>
  );
});

WeatherMapStatic.displayName = "WeatherMapStatic";

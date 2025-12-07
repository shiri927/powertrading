import React, { useState, memo } from "react";
import { Thermometer, Wind, Sun, CloudRain } from "lucide-react";
import { provinces, type ProvinceData } from '@/components/dashboard/china-map-data';

interface StationData {
  id: string;
  name: string;
  province: string;
  x: number;
  y: number;
  temp: number;
  wind: number;
}

// Weather stations with temperature data (updated coordinates for 600x500 viewBox)
const weatherStations: StationData[] = [
  { id: "1", name: "乌鲁木齐", province: "新疆", x: 108, y: 100, temp: -12.5, wind: 3.2 },
  { id: "2", name: "哈密", province: "新疆", x: 140, y: 120, temp: -8.3, wind: 4.1 },
  { id: "3", name: "太原", province: "山西", x: 378, y: 178, temp: -6.8, wind: 2.2 },
  { id: "4", name: "济南", province: "山东", x: 448, y: 230, temp: -2.1, wind: 1.8 },
  { id: "5", name: "青岛", province: "山东", x: 475, y: 245, temp: 0.5, wind: 3.5 },
  { id: "6", name: "杭州", province: "浙江", x: 482, y: 348, temp: 8.2, wind: 1.2 },
  { id: "7", name: "哈尔滨", province: "黑龙江", x: 510, y: 70, temp: -22.5, wind: 2.8 },
  { id: "8", name: "长春", province: "吉林", x: 510, y: 155, temp: -18.2, wind: 2.1 },
  { id: "9", name: "成都", province: "四川", x: 278, y: 255, temp: 6.5, wind: 0.8 },
  { id: "10", name: "广州", province: "广东", x: 395, y: 432, temp: 18.5, wind: 1.5 },
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

// Get province temperature (average of stations or random)
const getProvinceTemp = (provinceName: string): number => {
  const stationsInProvince = weatherStations.filter(s => s.province === provinceName);
  if (stationsInProvince.length > 0) {
    return stationsInProvince.reduce((sum, s) => sum + s.temp, 0) / stationsInProvince.length;
  }
  // Generate random temp based on latitude approximation (for 600x500 viewBox)
  const province = provinces.find(p => p.name === provinceName);
  if (province) {
    const latFactor = (500 - province.center.y) / 500;
    return -20 + latFactor * 10 + Math.random() * 20;
  }
  return 0;
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
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const handleProvinceMouseEnter = (
    e: React.MouseEvent<SVGPathElement>,
    province: ProvinceData
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const temp = getProvinceTemp(province.name);
    setHoveredProvince(province.id);
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${province.name} | ${temp.toFixed(1)}°C`,
    });
  };

  const handleStationMouseEnter = (
    e: React.MouseEvent<SVGGElement>,
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
    setHoveredProvince(null);
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  const getProvinceFill = (province: ProvinceData) => {
    const isSelected = selectedProvince === province.name || selectedProvince?.includes(province.name);
    const isHovered = hoveredProvince === province.id;
    const temp = getProvinceTemp(province.name);
    
    if (isHovered || isSelected) {
      return getTempColor(temp);
    }
    // Lighter version for non-hovered
    const baseColor = getTempColor(temp);
    return baseColor + "99"; // Add transparency
  };

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
      {/* SVG Map */}
      <svg
        viewBox="0 0 600 500"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
      >
        {/* Gradient definitions for temperature scale */}
        <defs>
          <linearGradient id="tempGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="25%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="75%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Province paths with temperature colors */}
        <g>
          {provinces.map((province) => (
            <path
              key={province.id}
              d={province.path}
              fill={getProvinceFill(province)}
              stroke={hoveredProvince === province.id ? "#000" : "#fff"}
              strokeWidth={hoveredProvince === province.id ? "2" : "1"}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={(e) => handleProvinceMouseEnter(e, province)}
              onMouseLeave={handleMouseLeave}
            />
          ))}

          {/* Weather station markers */}
          {showStations && weatherStations.map((station) => (
            <g
              key={station.id}
              transform={`translate(${station.x}, ${station.y})`}
              onMouseEnter={(e) => handleStationMouseEnter(e, station)}
              onMouseLeave={handleMouseLeave}
              className="cursor-pointer"
            >
              {/* Station dot */}
              <circle r="6" fill="#fff" stroke="#333" strokeWidth="1.5" />
              {/* Temperature label */}
              <text
                x="10"
                y="3"
                fontSize="11"
                fill="#333"
                fontWeight="bold"
                className="select-none"
              >
                {station.temp}°
              </text>
            </g>
          ))}

          {/* Warning markers */}
          {showWarnings && (
            <>
              <g transform="translate(105, 115)">
                <rect x="-28" y="-12" width="56" height="24" rx="4" fill="#3b82f6" />
                <text x="0" y="5" fontSize="12" fill="#fff" textAnchor="middle" className="select-none">多个预警</text>
              </g>
              <g transform="translate(510, 78)">
                <rect x="-28" y="-12" width="56" height="24" rx="4" fill="#ef4444" />
                <text x="0" y="5" fontSize="12" fill="#fff" textAnchor="middle" className="select-none">寒潮预警</text>
              </g>
            </>
          )}
        </g>
      </svg>

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

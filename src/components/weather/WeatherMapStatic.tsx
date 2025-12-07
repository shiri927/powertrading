import React, { useState, memo } from "react";
import { Thermometer, Wind, Sun, CloudRain } from "lucide-react";

interface ProvinceData {
  id: string;
  name: string;
  path: string;
  center: { x: number; y: number };
}

interface StationData {
  id: string;
  name: string;
  province: string;
  x: number;
  y: number;
  temp: number;
  wind: number;
}

// Simplified province paths for China map
const provinces: ProvinceData[] = [
  { id: "xinjiang", name: "新疆", path: "M5,15 L25,12 L30,20 L28,35 L20,42 L8,38 L3,28 Z", center: { x: 16, y: 26 } },
  { id: "xizang", name: "西藏", path: "M8,40 L22,38 L28,42 L30,55 L22,62 L10,58 L5,48 Z", center: { x: 17, y: 50 } },
  { id: "qinghai", name: "青海", path: "M28,35 L38,32 L42,38 L40,48 L32,52 L26,45 Z", center: { x: 34, y: 42 } },
  { id: "gansu", name: "甘肃", path: "M30,20 L42,18 L50,25 L48,35 L42,38 L38,32 L28,35 Z", center: { x: 40, y: 28 } },
  { id: "neimenggu", name: "内蒙古", path: "M42,8 L75,5 L82,18 L78,28 L65,32 L55,28 L48,18 L42,12 Z", center: { x: 62, y: 18 } },
  { id: "heilongjiang", name: "黑龙江", path: "M78,5 L92,8 L95,18 L88,25 L80,22 L76,12 Z", center: { x: 85, y: 15 } },
  { id: "jilin", name: "吉林", path: "M80,22 L88,25 L92,32 L85,36 L78,32 L76,26 Z", center: { x: 84, y: 28 } },
  { id: "liaoning", name: "辽宁", path: "M76,32 L85,36 L88,42 L82,48 L74,45 L72,38 Z", center: { x: 80, y: 40 } },
  { id: "hebei", name: "河北", path: "M65,32 L74,34 L76,42 L72,48 L64,46 L62,38 Z", center: { x: 68, y: 40 } },
  { id: "beijing", name: "北京", path: "M68,36 L72,36 L72,40 L68,40 Z", center: { x: 70, y: 38 } },
  { id: "tianjin", name: "天津", path: "M72,40 L75,40 L75,44 L72,44 Z", center: { x: 73.5, y: 42 } },
  { id: "shanxi", name: "山西", path: "M58,35 L65,35 L66,45 L62,52 L56,48 L55,40 Z", center: { x: 60, y: 43 } },
  { id: "shandong", name: "山东", path: "M68,42 L80,40 L84,48 L78,54 L68,52 L66,46 Z", center: { x: 74, y: 47 } },
  { id: "henan", name: "河南", path: "M58,48 L68,46 L72,54 L66,60 L58,58 L56,52 Z", center: { x: 63, y: 53 } },
  { id: "jiangsu", name: "江苏", path: "M72,50 L82,48 L85,56 L78,62 L72,58 Z", center: { x: 77, y: 55 } },
  { id: "anhui", name: "安徽", path: "M68,54 L76,52 L78,62 L72,68 L66,64 L66,58 Z", center: { x: 72, y: 60 } },
  { id: "shanghai", name: "上海", path: "M82,56 L86,56 L86,60 L82,60 Z", center: { x: 84, y: 58 } },
  { id: "zhejiang", name: "浙江", path: "M76,60 L84,58 L86,66 L80,72 L74,68 Z", center: { x: 80, y: 65 } },
  { id: "fujian", name: "福建", path: "M76,68 L84,66 L88,75 L82,82 L75,78 Z", center: { x: 80, y: 74 } },
  { id: "taiwan", name: "台湾", path: "M88,72 L92,70 L94,78 L90,84 L86,80 Z", center: { x: 90, y: 76 } },
  { id: "jiangxi", name: "江西", path: "M68,62 L76,60 L78,72 L72,78 L66,74 L66,66 Z", center: { x: 72, y: 69 } },
  { id: "hubei", name: "湖北", path: "M54,52 L66,50 L70,58 L64,65 L54,62 L52,56 Z", center: { x: 60, y: 57 } },
  { id: "hunan", name: "湖南", path: "M56,62 L66,60 L70,70 L64,78 L56,75 L54,68 Z", center: { x: 62, y: 69 } },
  { id: "guangdong", name: "广东", path: "M58,76 L72,74 L78,82 L70,90 L58,88 L54,82 Z", center: { x: 66, y: 82 } },
  { id: "guangxi", name: "广西", path: "M44,75 L58,73 L62,82 L54,90 L44,88 L40,82 Z", center: { x: 52, y: 82 } },
  { id: "hainan", name: "海南", path: "M52,92 L60,92 L60,98 L52,98 Z", center: { x: 56, y: 95 } },
  { id: "sichuan", name: "四川", path: "M32,48 L48,45 L54,55 L50,65 L40,68 L32,62 L30,54 Z", center: { x: 42, y: 56 } },
  { id: "chongqing", name: "重庆", path: "M48,58 L56,56 L58,64 L52,68 L48,64 Z", center: { x: 52, y: 62 } },
  { id: "guizhou", name: "贵州", path: "M44,66 L54,64 L58,72 L52,78 L44,76 L42,70 Z", center: { x: 50, y: 71 } },
  { id: "yunnan", name: "云南", path: "M28,62 L42,58 L48,68 L44,82 L32,86 L24,78 L22,68 Z", center: { x: 36, y: 72 } },
  { id: "shaanxi", name: "陕西", path: "M48,35 L58,33 L62,45 L58,55 L50,58 L46,48 L46,40 Z", center: { x: 53, y: 45 } },
  { id: "ningxia", name: "宁夏", path: "M48,30 L54,28 L56,36 L52,40 L48,36 Z", center: { x: 52, y: 34 } },
  { id: "hongkong", name: "香港", path: "M70,86 L74,86 L74,89 L70,89 Z", center: { x: 72, y: 87.5 } },
  { id: "macau", name: "澳门", path: "M66,88 L69,88 L69,91 L66,91 Z", center: { x: 67.5, y: 89.5 } },
];

// Weather stations with temperature data
const weatherStations: StationData[] = [
  { id: "1", name: "乌鲁木齐", province: "新疆", x: 18, y: 22, temp: -12.5, wind: 3.2 },
  { id: "2", name: "哈密", province: "新疆", x: 28, y: 28, temp: -8.3, wind: 4.1 },
  { id: "3", name: "太原", province: "山西", x: 60, y: 43, temp: -6.8, wind: 2.2 },
  { id: "4", name: "济南", province: "山东", x: 74, y: 46, temp: -2.1, wind: 1.8 },
  { id: "5", name: "青岛", province: "山东", x: 80, y: 48, temp: 0.5, wind: 3.5 },
  { id: "6", name: "杭州", province: "浙江", x: 80, y: 65, temp: 8.2, wind: 1.2 },
  { id: "7", name: "哈尔滨", province: "黑龙江", x: 85, y: 14, temp: -22.5, wind: 2.8 },
  { id: "8", name: "长春", province: "吉林", x: 84, y: 28, temp: -18.2, wind: 2.1 },
  { id: "9", name: "成都", province: "四川", x: 42, y: 56, temp: 6.5, wind: 0.8 },
  { id: "10", name: "广州", province: "广东", x: 66, y: 82, temp: 18.5, wind: 1.5 },
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
  // Generate random temp based on latitude approximation
  const province = provinces.find(p => p.name === provinceName);
  if (province) {
    const latFactor = (100 - province.center.y) / 100;
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
        viewBox="0 0 100 100"
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
              strokeWidth={hoveredProvince === province.id ? "0.5" : "0.2"}
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
              <circle r="1.2" fill="#fff" stroke="#333" strokeWidth="0.3" />
              {/* Temperature label */}
              <text
                x="2"
                y="0.5"
                fontSize="2.5"
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
              <g transform="translate(16, 24)">
                <rect x="-4" y="-2" width="8" height="4" rx="1" fill="#3b82f6" />
                <text x="0" y="0.8" fontSize="2" fill="#fff" textAnchor="middle" className="select-none">多个预警</text>
              </g>
              <g transform="translate(85, 16)">
                <rect x="-4" y="-2" width="8" height="4" rx="1" fill="#ef4444" />
                <text x="0" y="0.8" fontSize="2" fill="#fff" textAnchor="middle" className="select-none">寒潮预警</text>
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

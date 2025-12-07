import React, { useState, memo } from "react";
import { provinces, stations, provincesWithStations, ProvinceData, StationData } from "./china-map-data";

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  content: string;
}

export const ChinaMapStatic = memo(() => {
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
    setHoveredProvince(province.id);
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: province.name,
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
      content: `${station.name} | ${station.capacity}`,
    });
  };

  const handleMouseLeave = () => {
    setHoveredProvince(null);
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  const getProvinceFill = (province: ProvinceData) => {
    const hasStation = provincesWithStations.includes(province.name);
    const isHovered = hoveredProvince === province.id;
    
    if (isHovered) {
      return "#1E5A8A";
    }
    if (hasStation) {
      return "#024B77";
    }
    return "#013C62";
  };

  const getProvinceStroke = (province: ProvinceData) => {
    const isHovered = hoveredProvince === province.id;
    return isHovered ? "#00D4FF" : "rgba(30, 144, 255, 0.6)";
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* SVG Map */}
      <svg
        viewBox="0 0 600 500"
        className="w-full h-full max-h-[400px]"
        style={{ filter: "drop-shadow(0 0 10px rgba(30, 144, 255, 0.3))" }}
      >
        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="stationGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Province paths */}
        <g>
          {provinces.map((province) => (
            <path
              key={province.id}
              d={province.path}
              fill={getProvinceFill(province)}
              stroke={getProvinceStroke(province)}
              strokeWidth={hoveredProvince === province.id ? "0.5" : "0.3"}
              filter={hoveredProvince === province.id ? "url(#glow)" : undefined}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={(e) => handleProvinceMouseEnter(e, province)}
              onMouseLeave={handleMouseLeave}
            />
          ))}

          {/* Station markers */}
          {stations.map((station) => (
            <g
              key={station.id}
              transform={`translate(${station.x}, ${station.y})`}
              onMouseEnter={(e) => handleStationMouseEnter(e, station)}
              onMouseLeave={handleMouseLeave}
              className="cursor-pointer"
              filter="url(#stationGlow)"
            >
              {/* Outer pulsating ring */}
              <circle
                r="2"
                fill="none"
                stroke="#00E676"
                strokeWidth="0.3"
                opacity="0.6"
                className="animate-ping"
                style={{ transformOrigin: "center", animationDuration: "2s" }}
              />
              {/* Inner dot */}
              <circle r="1" fill="#00E676" />
            </g>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 px-2 py-1 text-xs rounded pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y - 30,
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 20, 40, 0.9)",
            border: "1px solid rgba(30, 144, 255, 0.5)",
            color: "#00D4FF",
            boxShadow: "0 0 10px rgba(30, 144, 255, 0.3)",
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Legend */}
      <div
        className="absolute bottom-2 left-2 text-xs p-2 rounded"
        style={{
          backgroundColor: "rgba(0, 20, 40, 0.8)",
          border: "1px solid rgba(30, 144, 255, 0.3)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#00E676", boxShadow: "0 0 6px #00E676" }}
          />
          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>发电场站</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#024B77" }}
          />
          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>有场站省份</span>
        </div>
      </div>

      {/* CSS for pulsating animation */}
      <style>{`
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          75%, 100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
});

ChinaMapStatic.displayName = "ChinaMapStatic";

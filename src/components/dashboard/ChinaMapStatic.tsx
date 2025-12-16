import React, { useState, memo } from "react";
import { stations, StationData } from "./china-map-data";
import chinaMapBg from "@/assets/china-map-satellite.png";

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

  const handleStationMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
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
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  // 根据图片坐标系统重新映射场站位置 (百分比)
  const stationPositions: Record<string, { left: string; top: string }> = {
    "station-sd-1": { left: "78%", top: "42%" },  // 山东省场站A
    "station-sd-2": { left: "81%", top: "45%" },  // 山东省场站B
    "station-sd-3": { left: "75%", top: "48%" },  // 山东省场站C
    "station-sx-1": { left: "65%", top: "40%" },  // 山西省场站A
    "station-sx-2": { left: "62%", top: "43%" },  // 山西省场站B
    "station-sx-3": { left: "68%", top: "46%" },  // 山西省场站C
    "station-zj-1": { left: "82%", top: "62%" },  // 浙江省场站A
    "station-zj-2": { left: "85%", top: "65%" },  // 浙江省场站B
    "station-zj-3": { left: "79%", top: "68%" },  // 浙江省场站C
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, hsl(210, 50%, 8%) 0%, hsl(210, 45%, 12%) 100%)"
      }}
    >
      {/* Background Map Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={chinaMapBg}
          alt="中国地图"
          className="w-full h-full object-contain"
          style={{ 
            maxHeight: "100%",
            filter: "drop-shadow(0 0 15px rgba(30, 144, 255, 0.3))"
          }}
        />
        
        {/* Station markers overlay */}
        {stations.map((station) => {
          const position = stationPositions[station.id];
          if (!position) return null;
          
          return (
            <div
              key={station.id}
              className="absolute cursor-pointer"
              style={{
                left: position.left,
                top: position.top,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={(e) => handleStationMouseEnter(e, station)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Outer pulsating ring */}
              <div
                className="absolute w-6 h-6 rounded-full animate-ping"
                style={{
                  backgroundColor: "rgba(0, 230, 118, 0.3)",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  animationDuration: "2s",
                }}
              />
              {/* Inner dot */}
              <div
                className="w-3 h-3 rounded-full relative z-10"
                style={{
                  backgroundColor: "#00E676",
                  boxShadow: "0 0 10px #00E676, 0 0 20px rgba(0, 230, 118, 0.5)",
                }}
              />
            </div>
          );
        })}
      </div>

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
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#00E676", boxShadow: "0 0 6px #00E676" }}
          />
          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>发电场站</span>
        </div>
      </div>
    </div>
  );
});

ChinaMapStatic.displayName = "ChinaMapStatic";

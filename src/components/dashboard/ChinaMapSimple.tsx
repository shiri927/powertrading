import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

interface Station {
  id: string;
  name: string;
  province: string;
  lng: number;
  lat: number;
  capacity: string;
}

const stations: Station[] = [
  { id: "1", name: "新疆场站A", province: "新疆", lng: 87.62, lat: 43.79, capacity: "50MW" },
  { id: "2", name: "山东省场站A", province: "山东", lng: 117.12, lat: 36.65, capacity: "30MW" },
  { id: "3", name: "山东省场站B", province: "山东", lng: 118.02, lat: 37.45, capacity: "25MW" },
  { id: "4", name: "浙江省场站A", province: "浙江", lng: 120.15, lat: 30.28, capacity: "28MW" },
  { id: "5", name: "山西省场站A", province: "山西", lng: 112.55, lat: 37.87, capacity: "35MW" },
];

// 有场站的省份名称（用于高亮显示）
const provincesWithStations = ["新疆维吾尔自治区", "山东省", "浙江省", "山西省"];

// 阿里云 DataV 中国省级地图
const geoUrl = "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json";

export const ChinaMapSimple = memo(() => {
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (name: string, event: React.MouseEvent) => {
    setTooltipContent(name);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  return (
    <div className="relative w-full h-full" style={{ minHeight: "280px" }}>
      {/* 扫描线效果 */}
      <div className="scan-line" style={{ position: "absolute", zIndex: 10, pointerEvents: "none" }} />
      
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [104, 36],
          scale: 550,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <ZoomableGroup zoom={1} center={[104, 36]} minZoom={0.8} maxZoom={3}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const provinceName = geo.properties?.name || "";
                const hasStation = provincesWithStations.includes(provinceName);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e) => handleMouseEnter(provinceName, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: hasStation ? "#024B77" : "#013C62",
                        stroke: "rgba(30, 144, 255, 0.6)",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: "#1E5A8A",
                        stroke: "#00D4FF",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#1E5A8A",
                        stroke: "#00D4FF",
                        strokeWidth: 1,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* 场站标记 */}
          {stations.map((station) => (
            <Marker key={station.id} coordinates={[station.lng, station.lat]}>
              {/* 脉动效果圆圈 */}
              <circle
                r={12}
                fill="rgba(0, 230, 118, 0.3)"
                style={{
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              {/* 主标记点 */}
              <circle
                r={6}
                fill="#00E676"
                stroke="#00FF88"
                strokeWidth={2}
                style={{
                  filter: "drop-shadow(0 0 6px rgba(0, 230, 118, 0.8))",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  setTooltipContent(`${station.name}\n省份: ${station.province}\n装机容量: ${station.capacity}`);
                  setTooltipPosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={handleMouseLeave}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="fixed z-50 px-3 py-2 text-xs rounded pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
            backgroundColor: "rgba(10, 25, 41, 0.95)",
            border: "1px solid rgba(30, 144, 255, 0.6)",
            color: "#C8DCFF",
            whiteSpace: "pre-line",
            maxWidth: "200px",
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 text-xs space-y-1 z-20">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ 
              backgroundColor: "#00E676",
              boxShadow: "0 0 8px rgba(0, 230, 118, 0.8)"
            }} 
          />
          <span style={{ color: "hsl(200, 15%, 70%)" }}>场站位置</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded" 
            style={{ backgroundColor: "#024B77" }} 
          />
          <span style={{ color: "hsl(200, 15%, 70%)" }}>有场站省份</span>
        </div>
      </div>

      {/* 脉动动画样式 */}
      <style>{`
        @keyframes pulse {
          0% {
            r: 8;
            opacity: 0.6;
          }
          50% {
            r: 14;
            opacity: 0.2;
          }
          100% {
            r: 8;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
});

ChinaMapSimple.displayName = "ChinaMapSimple";

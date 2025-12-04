import { useState } from "react";

interface Station {
  id: string;
  name: string;
  province: string;
  x: number; // percentage position
  y: number; // percentage position
  capacity: string;
}

const stations: Station[] = [
  { id: "1", name: "新疆场站A", province: "新疆", x: 18, y: 32, capacity: "50MW" },
  { id: "2", name: "山东省场站A", province: "山东", x: 72, y: 42, capacity: "30MW" },
  { id: "3", name: "山东省场站B", province: "山东", x: 75, y: 45, capacity: "25MW" },
  { id: "4", name: "浙江省场站A", province: "浙江", x: 76, y: 58, capacity: "28MW" },
  { id: "5", name: "山西省场站A", province: "山西", x: 62, y: 40, capacity: "35MW" },
];

export const ChinaMapVisualization = () => {
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Circular map container */}
      <div className="map-container relative w-[320px] h-[320px] flex items-center justify-center">
        {/* Scan line effect */}
        <div className="scan-line" />
        
        {/* Map background - simplified China outline */}
        <svg
          viewBox="0 0 100 100"
          className="w-[280px] h-[280px] opacity-60"
        >
          {/* Simplified China shape */}
          <path
            d="M20,25 L35,20 L50,15 L65,18 L80,25 L85,35 L82,50 L78,60 L72,70 L60,75 L45,72 L35,68 L25,60 L18,45 L20,25 Z"
            fill="none"
            stroke="hsla(200, 80%, 40%, 0.4)"
            strokeWidth="0.5"
          />
          {/* Province divisions */}
          <path
            d="M35,20 L40,45 M50,15 L55,50 M65,18 L60,55 M25,60 L50,55 L78,60"
            fill="none"
            stroke="hsla(200, 80%, 40%, 0.2)"
            strokeWidth="0.3"
          />
        </svg>

        {/* Station markers */}
        {stations.map((station) => (
          <div
            key={station.id}
            className="station-marker cursor-pointer"
            style={{
              left: `${station.x}%`,
              top: `${station.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => setHoveredStation(station)}
            onMouseLeave={() => setHoveredStation(null)}
          />
        ))}

        {/* Tooltip */}
        {hoveredStation && (
          <div
            className="absolute z-10 px-3 py-2 rounded text-xs"
            style={{
              left: `${hoveredStation.x}%`,
              top: `${hoveredStation.y - 15}%`,
              transform: "translate(-50%, -100%)",
              background: "hsla(210, 50%, 12%, 0.95)",
              border: "1px solid hsla(200, 80%, 40%, 0.5)",
              color: "hsl(200, 20%, 90%)",
            }}
          >
            <div className="font-medium">{hoveredStation.name}</div>
            <div className="text-[10px] opacity-70">
              装机容量: {hoveredStation.capacity}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(149,100%,45%)]" />
          <span style={{ color: "hsl(200, 15%, 60%)" }}>场站位置</span>
        </div>
      </div>
    </div>
  );
};

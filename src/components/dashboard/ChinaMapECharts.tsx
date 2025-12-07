import { useEffect, useState, useRef } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

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

export const ChinaMapECharts = () => {
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<ReactECharts>(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        console.log("Loading China map GeoJSON...");
        // 从阿里云 DataV 加载中国省级 GeoJSON
        const response = await fetch(
          "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json"
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const geoJson = await response.json();
        console.log("GeoJSON loaded successfully, features:", geoJson.features?.length);
        
        // 注册地图
        echarts.registerMap("china", geoJson);
        console.log("Map registered successfully");
        setMapReady(true);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load China map:", error);
        setLoading(false);
      }
    };

    loadMap();
  }, []);

  // 将场站数据转换为 ECharts scatter series 数据
  const scatterData = stations.map((station) => ({
    name: station.name,
    value: [station.lng, station.lat, station.capacity],
    province: station.province,
    capacity: station.capacity,
  }));

  const getOption = () => ({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(10, 25, 41, 0.95)",
      borderColor: "rgba(30, 144, 255, 0.6)",
      borderWidth: 1,
      textStyle: {
        color: "#C8DCFF",
        fontSize: 12,
      },
      formatter: (params: any) => {
        if (params.seriesType === "scatter") {
          return `
            <div style="padding: 4px 8px;">
              <div style="font-weight: bold; color: #00E676;">${params.name}</div>
              <div style="font-size: 11px; color: #9DB8D4; margin-top: 4px;">
                省份: ${params.data.province}<br/>
                装机容量: ${params.data.capacity}
              </div>
            </div>
          `;
        }
        return params.name;
      },
    },
    geo: {
      map: "china",
      roam: false,
      zoom: 1.2,
      center: [104, 36],
      itemStyle: {
        areaColor: "#013C62",
        borderColor: "rgba(30, 144, 255, 0.6)",
        borderWidth: 1,
        shadowColor: "rgba(30, 144, 255, 0.4)",
        shadowBlur: 15,
        shadowOffsetX: 0,
        shadowOffsetY: 5,
      },
      emphasis: {
        itemStyle: {
          areaColor: "#1E5A8A",
          borderColor: "#00D4FF",
          borderWidth: 2,
          shadowColor: "rgba(0, 212, 255, 0.6)",
          shadowBlur: 20,
        },
        label: {
          show: true,
          color: "#FFFFFF",
          fontSize: 12,
        },
      },
      label: {
        show: true,
        color: "rgba(200, 220, 255, 0.5)",
        fontSize: 9,
      },
      regions: stations.map((station) => ({
        name: station.province,
        itemStyle: {
          areaColor: "#024B77",
        },
      })),
    },
    series: [
      {
        name: "场站",
        type: "scatter",
        coordinateSystem: "geo",
        symbol: "circle",
        symbolSize: 14,
        itemStyle: {
          color: "#00E676",
          shadowColor: "rgba(0, 230, 118, 0.8)",
          shadowBlur: 12,
        },
        emphasis: {
          scale: true,
          itemStyle: {
            color: "#00FF88",
            shadowColor: "rgba(0, 255, 136, 1)",
            shadowBlur: 20,
          },
        },
        data: scatterData,
        zlevel: 2,
      },
      // 脉动效果散点
      {
        name: "脉动",
        type: "effectScatter",
        coordinateSystem: "geo",
        showEffectOn: "render",
        rippleEffect: {
          brushType: "stroke",
          scale: 3,
          period: 3,
        },
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: "rgba(0, 230, 118, 0.6)",
          shadowColor: "rgba(0, 230, 118, 0.4)",
          shadowBlur: 10,
        },
        data: scatterData,
        zlevel: 1,
      },
    ],
  });

  if (loading) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="map-container relative w-full h-full flex items-center justify-center">
          <div className="scan-line" />
          <div className="text-sm" style={{ color: "hsl(200, 15%, 60%)" }}>
            加载地图中...
          </div>
        </div>
      </div>
    );
  }

  if (!mapReady) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-sm" style={{ color: "hsl(200, 15%, 60%)" }}>
          地图加载失败
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 扫描线效果 */}
      <div className="scan-line" style={{ position: "absolute", zIndex: 10, pointerEvents: "none" }} />
      
      <ReactECharts
        ref={chartRef}
        option={getOption()}
        style={{ width: "100%", height: "100%", minHeight: "280px" }}
        opts={{ renderer: "canvas" }}
      />

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
    </div>
  );
};

import React, { useEffect, useState, memo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { MapChart, ScatterChart, EffectScatterChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";

// Register ECharts components
echarts.use([
  MapChart,
  ScatterChart,
  EffectScatterChart,
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

// Station data with geo coordinates
const stationsGeoData = [
  { name: "山东省场站A", province: "山东", lng: 117.12, lat: 36.65, capacity: 30 },
  { name: "山东省场站B", province: "山东", lng: 118.35, lat: 35.45, capacity: 25 },
  { name: "山东省场站C", province: "山东", lng: 116.58, lat: 35.23, capacity: 28 },
  { name: "山西省场站A", province: "山西", lng: 112.55, lat: 37.87, capacity: 35 },
  { name: "山西省场站B", province: "山西", lng: 111.52, lat: 36.08, capacity: 32 },
  { name: "山西省场站C", province: "山西", lng: 113.12, lat: 35.49, capacity: 30 },
  { name: "浙江省场站A", province: "浙江", lng: 120.15, lat: 30.28, capacity: 28 },
  { name: "浙江省场站B", province: "浙江", lng: 121.55, lat: 29.87, capacity: 26 },
  { name: "浙江省场站C", province: "浙江", lng: 119.65, lat: 29.08, capacity: 24 },
];

// Provinces with stations for highlighting
const provincesWithStations = ["山东", "山西", "浙江"];

// China GeoJSON CDN URLs (jsDelivr - Aliyun blocked by Referer ACL)
const GEO_SOURCES = [
  "https://cdn.jsdelivr.net/gh/apache/echarts-website/examples/data/asset/geo/china.json",
  "https://fastly.jsdelivr.net/gh/apache/echarts-website/examples/data/asset/geo/china.json",
];

export const ChinaMapECharts = memo(() => {
  const [mapRegistered, setMapRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      // Check if already registered
      if (echarts.getMap("china")) {
        setMapRegistered(true);
        setLoading(false);
        return;
      }

      // Try each source until one works
      for (const url of GEO_SOURCES) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const geoJson = await response.json();
            echarts.registerMap("china", geoJson);
            setMapRegistered(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn(`Failed to load from ${url}`, err);
        }
      }
      
      setError("地图数据加载失败");
      setLoading(false);
    };

    loadMap();
  }, []);

  const getOption = (): EChartsOption => {
    // Prepare scatter data with ripple effect
    const scatterData = stationsGeoData.map((station) => ({
      name: station.name,
      value: [station.lng, station.lat, station.capacity],
      province: station.province,
      capacity: station.capacity,
    }));

    // Province data for coloring
    const provinceData = provincesWithStations.map((name) => ({
      name,
      value: 100,
    }));

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(0, 20, 40, 0.95)",
        borderColor: "rgba(30, 144, 255, 0.6)",
        borderWidth: 1,
        textStyle: {
          color: "#00D4FF",
          fontSize: 12,
        },
        formatter: (params: any) => {
          if (params.seriesType === "effectScatter") {
            return `
              <div style="padding: 4px 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
                <div>省份: ${params.data.province}</div>
                <div>装机容量: ${params.data.capacity}MW</div>
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
        aspectScale: 0.85,
        silent: false,
        itemStyle: {
          areaColor: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#1a3a5c" },
              { offset: 1, color: "#0d2137" },
            ],
          },
          borderColor: "rgba(30, 144, 255, 0.4)",
          borderWidth: 1,
          shadowColor: "rgba(30, 144, 255, 0.3)",
          shadowBlur: 10,
        },
        emphasis: {
          itemStyle: {
            areaColor: "rgba(0, 212, 255, 0.3)",
            borderColor: "#00D4FF",
            borderWidth: 2,
          },
          label: {
            show: true,
            color: "#00D4FF",
            fontSize: 12,
          },
        },
        select: {
          itemStyle: {
            areaColor: "rgba(0, 150, 136, 0.5)",
          },
        },
        regions: provincesWithStations.map((name) => ({
          name,
          itemStyle: {
            areaColor: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#00796b" },
                { offset: 1, color: "#004d40" },
              ],
            },
            borderColor: "rgba(0, 230, 118, 0.6)",
            borderWidth: 1.5,
          },
        })),
      },
      series: [
        // Station markers with ripple effect
        {
          name: "发电场站",
          type: "effectScatter",
          coordinateSystem: "geo",
          data: scatterData,
          symbolSize: (val: number[]) => Math.max(8, val[2] / 3),
          showEffectOn: "render",
          rippleEffect: {
            brushType: "stroke",
            scale: 4,
            period: 3,
          },
          itemStyle: {
            color: "#00E676",
            shadowBlur: 15,
            shadowColor: "rgba(0, 230, 118, 0.8)",
          },
          zlevel: 2,
        },
        // Static station markers
        {
          name: "场站位置",
          type: "scatter",
          coordinateSystem: "geo",
          data: scatterData,
          symbolSize: 6,
          itemStyle: {
            color: "#00E676",
            borderColor: "#fff",
            borderWidth: 1,
          },
          zlevel: 3,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-cyan-300 text-sm">加载地图...</span>
        </div>
      </div>
    );
  }

  if (error || !mapRegistered) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-red-400 text-sm">{error || "地图初始化失败"}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <ReactEChartsCore
        echarts={echarts}
        option={getOption()}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "canvas" }}
        notMerge={true}
      />
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
        <div className="flex items-center gap-2 mt-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#00796b" }}
          />
          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>有场站省份</span>
        </div>
      </div>
    </div>
  );
});

ChinaMapECharts.displayName = "ChinaMapECharts";

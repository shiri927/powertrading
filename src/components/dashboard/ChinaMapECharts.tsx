import { memo, useEffect, useState } from "react";
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
import { chinaGeoJson } from "./china-map-geo";

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

export const ChinaMapECharts = memo(() => {
  const [mapRegistered, setMapRegistered] = useState(false);

  useEffect(() => {
    // Register map with local GeoJSON data (synchronous, no network needed)
    if (!echarts.getMap("china")) {
      echarts.registerMap("china", chinaGeoJson as any);
    }
    setMapRegistered(true);
  }, []);

  const getOption = (): EChartsOption => {
    // Prepare scatter data with ripple effect
    const scatterData = stationsGeoData.map((station) => ({
      name: station.name,
      value: [station.lng, station.lat, station.capacity],
      province: station.province,
      capacity: station.capacity,
    }));

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(0, 20, 40, 0.95)",
        borderColor: "rgba(0, 176, 77, 0.6)",
        borderWidth: 1,
        textStyle: {
          color: "#00E676",
          fontSize: 12,
        },
        formatter: (params: any) => {
          if (params.seriesType === "effectScatter") {
            return `
              <div style="padding: 8px 12px;">
                <div style="font-weight: bold; margin-bottom: 6px; color: #00E676; font-size: 14px;">${params.name}</div>
                <div style="color: #a0aec0; margin-bottom: 4px;">省份: <span style="color: #fff;">${params.data.province}</span></div>
                <div style="color: #a0aec0;">装机容量: <span style="color: #00E676; font-weight: bold;">${params.data.capacity}MW</span></div>
              </div>
            `;
          }
          if (params.seriesType === "map") {
            return `<div style="padding: 4px 8px; color: #fff;">${params.name}</div>`;
          }
          return params.name;
        },
      },
      geo: {
        map: "china",
        roam: true,
        zoom: 1.15,
        center: [105, 36],
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
              { offset: 0, color: "#1e3a5f" },
              { offset: 0.5, color: "#152d4a" },
              { offset: 1, color: "#0d2137" },
            ],
          },
          borderColor: "rgba(100, 180, 255, 0.4)",
          borderWidth: 1,
          shadowColor: "rgba(0, 100, 200, 0.3)",
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowOffsetY: 5,
        },
        emphasis: {
          itemStyle: {
            areaColor: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#2d5a8a" },
                { offset: 1, color: "#1e4a6a" },
              ],
            },
            borderColor: "#00D4FF",
            borderWidth: 2,
            shadowColor: "rgba(0, 212, 255, 0.5)",
            shadowBlur: 20,
          },
          label: {
            show: true,
            color: "#fff",
            fontSize: 13,
            fontWeight: "bold",
            textShadowColor: "rgba(0, 0, 0, 0.8)",
            textShadowBlur: 4,
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
                { offset: 0, color: "#00805a" },
                { offset: 0.5, color: "#006548" },
                { offset: 1, color: "#004d38" },
              ],
            },
            borderColor: "rgba(0, 230, 118, 0.8)",
            borderWidth: 2,
            shadowColor: "rgba(0, 230, 118, 0.4)",
            shadowBlur: 15,
          },
          emphasis: {
            itemStyle: {
              areaColor: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#00a070" },
                  { offset: 1, color: "#007858" },
                ],
              },
            },
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
          symbolSize: (val: number[]) => Math.max(12, val[2] / 2.5),
          showEffectOn: "render",
          rippleEffect: {
            brushType: "stroke",
            scale: 5,
            period: 3,
          },
          itemStyle: {
            color: {
              type: "radial",
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: "#00FF88" },
                { offset: 0.7, color: "#00E676" },
                { offset: 1, color: "#00B04D" },
              ],
            },
            shadowBlur: 20,
            shadowColor: "rgba(0, 230, 118, 0.8)",
          },
          zlevel: 2,
        },
        // Static station markers (inner dot)
        {
          name: "场站位置",
          type: "scatter",
          coordinateSystem: "geo",
          data: scatterData,
          symbolSize: 8,
          itemStyle: {
            color: "#fff",
            borderColor: "#00E676",
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: "rgba(255, 255, 255, 0.5)",
          },
          zlevel: 3,
        },
      ],
    };
  };

  if (!mapRegistered) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-emerald-300 text-sm">加载地图...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Outer glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0, 176, 77, 0.08) 0%, transparent 70%)",
        }}
      />
      <ReactEChartsCore
        echarts={echarts}
        option={getOption()}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "canvas" }}
        notMerge={true}
      />
      {/* Legend */}
      <div
        className="absolute bottom-3 left-3 text-xs p-3 rounded-lg backdrop-blur-sm"
        style={{
          backgroundColor: "rgba(0, 20, 40, 0.85)",
          border: "1px solid rgba(0, 176, 77, 0.4)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3.5 h-3.5 rounded-full animate-pulse"
            style={{ 
              backgroundColor: "#00E676", 
              boxShadow: "0 0 10px #00E676, 0 0 20px rgba(0, 230, 118, 0.5)" 
            }}
          />
          <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>发电场站</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3.5 h-3.5 rounded"
            style={{ 
              background: "linear-gradient(135deg, #00805a, #004d38)",
              border: "1px solid rgba(0, 230, 118, 0.6)"
            }}
          />
          <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>有场站省份</span>
        </div>
      </div>
    </div>
  );
});

ChinaMapECharts.displayName = "ChinaMapECharts";

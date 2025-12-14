import { useState, useEffect } from "react";
import { format } from "date-fns";
import { TechBorderCard } from "@/components/dashboard/TechBorderCard";
import { ViewToggle } from "@/components/dashboard/ViewToggle";
import { ChinaMapStatic } from "@/components/dashboard/ChinaMapStatic";
import { MetricCardGlow } from "@/components/dashboard/MetricCardGlow";
import { ItemizedSettlementTable } from "@/components/dashboard/ItemizedSettlementTable";
import { RegionalProductionChart } from "@/components/dashboard/RegionalProductionChart";
import { ProvinceSummaryBar } from "@/components/dashboard/ProvinceSummaryBar";
import { FileX } from "lucide-react";
import "@/styles/dashboard-screen.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from "recharts";

// 分项量价费数据
const settlementData = [
  { type: "日前现货", volume: 596.18, avgPrice: 315.2, cost: 77.42, ratio: 72.5 },
  { type: "实时现货", volume: 138.85, avgPrice: 298.6, cost: 18.58, ratio: 16.9 },
  { type: "中长期合约", volume: 87.42, avgPrice: 342.5, cost: 10.77, ratio: 10.6 },
];

// 省份数据
const provinceData = [
  { name: "山东省", capacity: 35, generation: 285.42, color: "hsl(200, 80%, 50%)" },
  { name: "山西省", capacity: 32, generation: 262.18, color: "hsl(149, 80%, 45%)" },
  { name: "浙江省", capacity: 35, generation: 274.85, color: "hsl(45, 100%, 50%)" },
];

// 场站发电排名
const stationGenerationData = [
  { name: "山东场站A", generation: 102.5, province: "山东省" },
  { name: "山东场站B", generation: 98.2, province: "山东省" },
  { name: "浙江场站A", generation: 95.8, province: "浙江省" },
  { name: "山西场站A", generation: 92.4, province: "山西省" },
  { name: "浙江场站B", generation: 91.5, province: "浙江省" },
  { name: "山东场站C", generation: 84.7, province: "山东省" },
  { name: "山西场站B", generation: 88.3, province: "山西省" },
  { name: "浙江场站C", generation: 87.6, province: "浙江省" },
  { name: "山西场站C", generation: 81.5, province: "山西省" },
];

// 省份汇总数据
const provinceSummaryData = [
  { name: "山东省", capacity: 35, generation: 285.42, revenue: 36.85 },
  { name: "山西省", capacity: 32, generation: 262.18, revenue: 33.92 },
  { name: "浙江省", capacity: 35, generation: 274.85, revenue: 36.00 },
];

// 省内现货交易数据
const spotTradingData = [
  { date: "10-07", dayAheadVolume: 8.5, realTimeVolume: 7.2, dayAheadPrice: 320, realTimePrice: 315 },
  { date: "10-14", dayAheadVolume: 9.2, realTimeVolume: 8.8, dayAheadPrice: 335, realTimePrice: 342 },
  { date: "10-21", dayAheadVolume: 7.8, realTimeVolume: 6.5, dayAheadPrice: 298, realTimePrice: 285 },
  { date: "10-28", dayAheadVolume: 10.5, realTimeVolume: 9.8, dayAheadPrice: 365, realTimePrice: 358 },
  { date: "11-04", dayAheadVolume: 8.9, realTimeVolume: 8.2, dayAheadPrice: 342, realTimePrice: 338 },
];

// 供需预测数据
const supplyDemandData = [
  { date: "11-05", renewableOutput: 185000, userLoad: 210000 },
  { date: "11-12", renewableOutput: 192000, userLoad: 225000 },
  { date: "11-19", renewableOutput: 178000, userLoad: 218000 },
  { date: "11-26", renewableOutput: 205000, userLoad: 235000 },
  { date: "12-03", renewableOutput: 198000, userLoad: 242000 },
  { date: "12-10", renewableOutput: 188000, userLoad: 228000 },
  { date: "12-17", renewableOutput: 175000, userLoad: 215000 },
];

// 气象报警数据
const weatherAlertData = [
  { station: "山东场站A", type: "大风预警", level: "黄色", time: "12-14 08:00" },
  { station: "浙江场站B", type: "暴雨预警", level: "蓝色", time: "12-14 14:00" },
  { station: "山西场站C", type: "高温预警", level: "橙色", time: "12-15 10:00" },
];

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [spotView, setSpotView] = useState<"chart" | "table">("chart");
  const [supplyDemandView, setSupplyDemandView] = useState<"chart" | "table">("chart");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-screen p-4">
      {/* Header Title */}
      <div className="text-center py-3 mb-3">
        <h1 className="glow-title text-2xl font-bold tracking-widest">
          电力交易决策系统
        </h1>
      </div>

      {/* 8 Metric Cards - Two Rows */}
      <div className="grid grid-cols-8 gap-2 mb-4">
        <MetricCardGlow label="总装机容量" value="102" unit="MW" />
        <MetricCardGlow label="并网场站数" value="9" unit="个" />
        <MetricCardGlow label="本月上网电量" value="822.45" unit="万kWh" trend="up" trendValue="+5.2%" />
        <MetricCardGlow label="等效利用小时" value="185.6" unit="h" />
        <MetricCardGlow label="本月结算电费" value="106.77" unit="万元" trend="up" trendValue="+8.3%" />
        <MetricCardGlow label="度电收益" value="0.13" unit="元/kWh" />
        <MetricCardGlow label="日前结算占比" value="72.5" unit="%" />
        <MetricCardGlow label="同比增长率" value="+12.3" unit="%" trend="up" trendValue="较去年" />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-3" style={{ height: "calc(100vh - 280px)" }}>
        {/* Left Column */}
        <div className="col-span-3 flex flex-col gap-3">
          {/* 区域生产情况 */}
          <TechBorderCard title="区域生产情况" className="flex-1">
            <RegionalProductionChart provinceData={provinceData} stationData={stationGenerationData} />
          </TechBorderCard>

          {/* 省内现货交易 */}
          <TechBorderCard title="省内现货交易" className="flex-1" headerRight={<ViewToggle view={spotView} onViewChange={setSpotView} />}>
            {spotView === "chart" ? (
              <ResponsiveContainer width="100%" height={160}>
                <ComposedChart data={spotTradingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar yAxisId="left" dataKey="dayAheadVolume" fill="hsl(200, 80%, 50%)" name="日前(MWh)" />
                  <Bar yAxisId="left" dataKey="realTimeVolume" fill="hsl(149, 80%, 45%)" name="实时(MWh)" />
                  <Line yAxisId="right" type="monotone" dataKey="dayAheadPrice" stroke="hsl(45, 100%, 50%)" name="日前价格" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="overflow-auto max-h-[160px]">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th className="text-right">日前(MWh)</th>
                      <th className="text-right">实时(MWh)</th>
                      <th className="text-right">日前价格</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spotTradingData.map((row) => (
                      <tr key={row.date}>
                        <td>{row.date}</td>
                        <td className="text-right font-mono">{row.dayAheadVolume}</td>
                        <td className="text-right font-mono">{row.realTimeVolume}</td>
                        <td className="text-right font-mono">{row.dayAheadPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TechBorderCard>
        </div>

        {/* Center Column - Map */}
        <div className="col-span-6 flex flex-col gap-3">
          <TechBorderCard title="场站分布" className="flex-1">
            <ChinaMapStatic />
          </TechBorderCard>
        </div>

        {/* Right Column */}
        <div className="col-span-3 flex flex-col gap-3">
          {/* 分项量价费 */}
          <TechBorderCard title="分项量价费汇总" className="flex-1">
            <ItemizedSettlementTable data={settlementData} />
          </TechBorderCard>

          {/* 供需预测 */}
          <TechBorderCard title="供需预测" className="flex-[0.8]" headerRight={<ViewToggle view={supplyDemandView} onViewChange={setSupplyDemandView} />}>
            {supplyDemandView === "chart" ? (
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={supplyDemandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="renewableOutput" stroke="hsl(149, 80%, 45%)" name="新能源出力" strokeWidth={2} />
                  <Line type="monotone" dataKey="userLoad" stroke="hsl(45, 100%, 50%)" name="用户负荷" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="overflow-auto max-h-[130px]">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th className="text-right">新能源出力</th>
                      <th className="text-right">用户负荷</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplyDemandData.map((row) => (
                      <tr key={row.date}>
                        <td>{row.date}</td>
                        <td className="text-right font-mono">{row.renewableOutput.toLocaleString()}</td>
                        <td className="text-right font-mono">{row.userLoad.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TechBorderCard>

          {/* 气象报警 */}
          <TechBorderCard title="气象报警信息" className="flex-[0.6]">
            {weatherAlertData.length > 0 ? (
              <div className="overflow-auto max-h-[100px]">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>场站</th>
                      <th>类型</th>
                      <th>等级</th>
                      <th>时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weatherAlertData.map((alert, index) => (
                      <tr key={index}>
                        <td className="text-xs">{alert.station}</td>
                        <td className="text-xs">{alert.type}</td>
                        <td>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              alert.level === "橙色"
                                ? "bg-orange-500/30 text-orange-300"
                                : alert.level === "黄色"
                                ? "bg-yellow-500/30 text-yellow-300"
                                : "bg-blue-500/30 text-blue-300"
                            }`}
                          >
                            {alert.level}
                          </span>
                        </td>
                        <td className="text-xs font-mono">{alert.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state py-4">
                <FileX className="empty-state-icon w-8 h-8" />
                <span className="text-xs">暂无数据</span>
              </div>
            )}
          </TechBorderCard>
        </div>
      </div>

      {/* Province Summary Bar */}
      <ProvinceSummaryBar provinces={provinceSummaryData} />

      {/* Footer Timestamp */}
      <div className="timestamp-footer">
        {format(currentTime, "yyyy/MM/dd HH:mm:ss")}
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { TechBorderCard } from "@/components/dashboard/TechBorderCard";
import { ViewToggle } from "@/components/dashboard/ViewToggle";
import { ChinaMapSimple } from "@/components/dashboard/ChinaMapSimple";
import { MetricCardGlow } from "@/components/dashboard/MetricCardGlow";
import { FileX } from "lucide-react";
import "@/styles/dashboard-screen.css";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";

// 中长期交易数据
const midTermTradingData = [{
  month: "2024-12",
  electricity: 5468.0,
  price: 323.95
}, {
  month: "2025-01",
  electricity: 28939.898,
  price: 329.9
}, {
  month: "2025-02",
  electricity: 22465.52,
  price: 312.45
}, {
  month: "2025-03",
  electricity: 35782.15,
  price: 318.72
}, {
  month: "2025-04",
  electricity: 31254.68,
  price: 305.88
}, {
  month: "2025-05",
  electricity: 28976.42,
  price: 298.65
}, {
  month: "2025-06",
  electricity: 25483.91,
  price: 285.42
}, {
  month: "2025-07",
  electricity: 32156.78,
  price: 295.18
}];

// 省内现货交易数据
const spotTradingData = [{
  date: "10-07",
  dayAheadVolume: 8.5,
  realTimeVolume: 7.2,
  dayAheadPrice: 320,
  realTimePrice: 315
}, {
  date: "10-14",
  dayAheadVolume: 9.2,
  realTimeVolume: 8.8,
  dayAheadPrice: 335,
  realTimePrice: 342
}, {
  date: "10-21",
  dayAheadVolume: 7.8,
  realTimeVolume: 6.5,
  dayAheadPrice: 298,
  realTimePrice: 285
}, {
  date: "10-28",
  dayAheadVolume: 10.5,
  realTimeVolume: 9.8,
  dayAheadPrice: 365,
  realTimePrice: 358
}, {
  date: "11-04",
  dayAheadVolume: 8.9,
  realTimeVolume: 8.2,
  dayAheadPrice: 342,
  realTimePrice: 338
}];

// 供需预测数据
const supplyDemandData = [{
  date: "11-05",
  renewableOutput: 185000,
  userLoad: 210000
}, {
  date: "11-12",
  renewableOutput: 192000,
  userLoad: 225000
}, {
  date: "11-19",
  renewableOutput: 178000,
  userLoad: 218000
}, {
  date: "11-26",
  renewableOutput: 205000,
  userLoad: 235000
}, {
  date: "12-03",
  renewableOutput: 198000,
  userLoad: 242000
}, {
  date: "12-10",
  renewableOutput: 188000,
  userLoad: 228000
}, {
  date: "12-17",
  renewableOutput: 175000,
  userLoad: 215000
}];
const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [midTermView, setMidTermView] = useState<"chart" | "table">("table");
  const [spotView, setSpotView] = useState<"chart" | "table">("chart");
  const [supplyDemandView, setSupplyDemandView] = useState<"chart" | "table">("chart");
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <div className="dashboard-screen p-4">
      {/* Header Title */}
      <div className="text-center py-4 mb-4">
        <h1 className="glow-title text-2xl font-bold tracking-widest">
          电力交易决策系统
        </h1>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-4" style={{
      height: "calc(100vh - 160px)"
    }}>
        {/* Left Column */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* 中长期交易详情 */}
          <TechBorderCard title="中长期交易详情" className="flex-1" headerRight={<ViewToggle view={midTermView} onViewChange={setMidTermView} />}>
            {midTermView === "table" ? <div className="overflow-auto max-h-[200px]">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>月份</th>
                      <th className="text-right">电量(MWh)</th>
                      <th className="text-right">电价(元/MWh)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {midTermTradingData.map(row => <tr key={row.month}>
                        <td>{row.month}</td>
                        <td className="text-right font-mono">
                          {row.electricity.toLocaleString()}
                        </td>
                        <td className="text-right font-mono">
                          {row.price.toFixed(2)}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={midTermTradingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{
                fontSize: 10
              }} />
                  <YAxis tick={{
                fontSize: 10
              }} />
                  <Tooltip />
                  <Bar dataKey="electricity" fill="hsl(200, 80%, 50%)" name="电量(MWh)" />
                </BarChart>
              </ResponsiveContainer>}
          </TechBorderCard>

          {/* 省内现货交易详情 */}
          <TechBorderCard title="省内现货交易详情" className="flex-1" headerRight={<ViewToggle view={spotView} onViewChange={setSpotView} />}>
            {spotView === "chart" ? <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={spotTradingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{
                fontSize: 10
              }} />
                  <YAxis yAxisId="left" tick={{
                fontSize: 10
              }} />
                  <YAxis yAxisId="right" orientation="right" tick={{
                fontSize: 10
              }} />
                  <Tooltip />
                  <Legend wrapperStyle={{
                fontSize: 10
              }} />
                  <Bar yAxisId="left" dataKey="dayAheadVolume" fill="hsl(200, 80%, 50%)" name="日前结算(MWh)" />
                  <Bar yAxisId="left" dataKey="realTimeVolume" fill="hsl(149, 80%, 45%)" name="实时结算(MWh)" />
                  <Line yAxisId="right" type="monotone" dataKey="dayAheadPrice" stroke="hsl(45, 100%, 50%)" name="日前价格" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="realTimePrice" stroke="hsl(0, 80%, 55%)" name="实时价格" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer> : <div className="overflow-auto max-h-[200px]">
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
                    {spotTradingData.map(row => <tr key={row.date}>
                        <td>{row.date}</td>
                        <td className="text-right font-mono">{row.dayAheadVolume}</td>
                        <td className="text-right font-mono">{row.realTimeVolume}</td>
                        <td className="text-right font-mono">{row.dayAheadPrice}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
          </TechBorderCard>
        </div>

        {/* Center Column */}
        <div className="col-span-6 flex flex-col gap-4">
          {/* 交易总览 */}
          <div className="grid grid-cols-4 gap-3">
            <MetricCardGlow label="总装机" value="102.000" unit="MW" />
            <MetricCardGlow label="结算电量" value="822.453" unit="万kWh" />
            <MetricCardGlow label="结算电费" value="106.77" unit="万元" />
            <MetricCardGlow label="度电收益" value="0.13" unit="元/kWh" />
          </div>

          {/* 中国地图 */}
          <TechBorderCard title="场站分布" className="flex-1">
            <ChinaMapSimple />
          </TechBorderCard>
        </div>

        {/* Right Column */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* 供需预测 */}
          <TechBorderCard title="供需预测" className="flex-1" headerRight={<ViewToggle view={supplyDemandView} onViewChange={setSupplyDemandView} />}>
            {supplyDemandView === "chart" ? <ResponsiveContainer width="100%" height={200}>
                <LineChart data={supplyDemandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{
                fontSize: 10
              }} />
                  <YAxis tick={{
                fontSize: 10
              }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Legend wrapperStyle={{
                fontSize: 10
              }} />
                  <Line type="monotone" dataKey="renewableOutput" stroke="hsl(149, 80%, 45%)" name="新能源出力" strokeWidth={2} />
                  <Line type="monotone" dataKey="userLoad" stroke="hsl(45, 100%, 50%)" name="用户负荷" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer> : <div className="overflow-auto max-h-[200px]">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th className="text-right">新能源出力</th>
                      <th className="text-right">用户负荷</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplyDemandData.map(row => <tr key={row.date}>
                        <td>{row.date}</td>
                        <td className="text-right font-mono">{row.renewableOutput.toLocaleString()}</td>
                        <td className="text-right font-mono">{row.userLoad.toLocaleString()}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
          </TechBorderCard>

          {/* 气象报警信息 */}
          <TechBorderCard title="气象报警信息" className="flex-1">
            <div className="empty-state">
              <FileX className="empty-state-icon" />
              <span className="text-sm">暂无数据</span>
            </div>
          </TechBorderCard>
        </div>
      </div>

      {/* Footer Timestamp */}
      <div className="timestamp-footer">
        {format(currentTime, "yyyy/MM/dd HH:mm:ss")}
      </div>
    </div>;
};
export default Dashboard;
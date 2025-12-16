import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { TechBorderCard } from "@/components/dashboard/TechBorderCard";
import { ViewToggle } from "@/components/dashboard/ViewToggle";
import { ChinaMapStatic } from "@/components/dashboard/ChinaMapStatic";
import { MetricCardGlow } from "@/components/dashboard/MetricCardGlow";
import { ItemizedSettlementTable } from "@/components/dashboard/ItemizedSettlementTable";
import { RegionalProductionChart } from "@/components/dashboard/RegionalProductionChart";
import { ProvinceSummaryBar } from "@/components/dashboard/ProvinceSummaryBar";
import { FileX, Loader2 } from "lucide-react";
import "@/styles/dashboard-screen.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";

// 气象报警数据 (暂时保留mock - 需要后续创建weather_alerts表)
const weatherAlertData = [{
  station: "山东场站A",
  type: "大风预警",
  level: "黄色",
  time: "12-14 08:00"
}, {
  station: "浙江场站B",
  type: "暴雨预警",
  level: "蓝色",
  time: "12-14 14:00"
}, {
  station: "山西场站C",
  type: "高温预警",
  level: "橙色",
  time: "12-15 10:00"
}];
const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [spotView, setSpotView] = useState<"chart" | "table">("chart");
  const [supplyDemandView, setSupplyDemandView] = useState<"chart" | "table">("chart");

  // 从数据库获取数据
  const {
    isLoading,
    stationStats,
    settlementStats,
    clearingStats,
    marketPriceStats,
    tradingUnitStats
  } = useDashboardData();
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 计算指标卡数据
  const metrics = useMemo(() => {
    const totalCapacity = stationStats?.totalCapacity || 0;
    const stationCount = stationStats?.stationCount || 0;
    const totalVolume = settlementStats?.totalVolume || 0;
    const totalAmount = settlementStats?.totalAmount || 0;
    const unitRevenue = settlementStats?.unitRevenue || 0;

    // 计算日前结算占比
    const dayAheadRecord = settlementStats?.settlementData?.find(s => s.type.includes("日前") || s.type.includes("现货"));
    const dayAheadRatio = dayAheadRecord?.ratio || 0;

    // 计算等效利用小时
    const equivalentHours = totalCapacity > 0 ? Number((totalVolume * 10 / totalCapacity).toFixed(1)) : 0;
    return {
      totalCapacity,
      stationCount,
      totalVolume,
      equivalentHours,
      totalAmount,
      unitRevenue,
      dayAheadRatio
    };
  }, [stationStats, settlementStats]);

  // 省份数据
  const provinceData = useMemo(() => {
    const colors = ["hsl(200, 80%, 50%)", "hsl(149, 80%, 45%)", "hsl(45, 100%, 50%)"];
    return tradingUnitStats?.provinceSummaryData?.map((p, i) => ({
      name: p.name,
      capacity: p.capacity,
      generation: Number(p.generation.toFixed(2)),
      color: colors[i % 3]
    })) || [];
  }, [tradingUnitStats]);

  // 场站发电排名数据
  const stationGenerationData = useMemo(() => {
    return stationStats?.stations?.map(s => ({
      name: s.name,
      generation: Number(((s.installed_capacity || 0) * 8.5).toFixed(1)),
      province: s.province
    })).sort((a, b) => b.generation - a.generation).slice(0, 9) || [];
  }, [stationStats]);

  // 省份汇总数据
  const provinceSummaryData = useMemo(() => {
    return tradingUnitStats?.provinceSummaryData?.map(p => ({
      name: p.name,
      capacity: p.capacity,
      generation: Number(p.generation.toFixed(2)),
      revenue: Number(p.revenue.toFixed(2))
    })) || [];
  }, [tradingUnitStats]);

  // 现货交易数据
  const spotTradingData = useMemo(() => {
    return clearingStats?.spotTradingData || [];
  }, [clearingStats]);

  // 供需预测数据
  const supplyDemandData = useMemo(() => {
    return marketPriceStats?.supplyDemandData || [];
  }, [marketPriceStats]);

  // 结算分项数据
  const settlementData = useMemo(() => {
    return settlementStats?.settlementData || [];
  }, [settlementStats]);
  if (isLoading) {
    return <div className="dashboard-screen flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
          <span className="text-cyan-300 text-lg">加载数据中...</span>
        </div>
      </div>;
  }
  return <div className="dashboard-screen p-4">
      {/* Header Title */}
      <div className="text-center py-3 mb-3">
        <h1 className="glow-title text-2xl font-bold tracking-widest">电力交易决策平台</h1>
      </div>

      {/* 8 Metric Cards - Two Rows */}
      <div className="grid grid-cols-8 gap-2 mb-4">
        <MetricCardGlow label="总装机容量" value={metrics.totalCapacity.toFixed(0)} unit="MW" />
        <MetricCardGlow label="并网场站数" value={metrics.stationCount.toString()} unit="个" />
        <MetricCardGlow label="本月上网电量" value={metrics.totalVolume.toFixed(2)} unit="万kWh" trend="up" trendValue="+5.2%" />
        <MetricCardGlow label="等效利用小时" value={metrics.equivalentHours.toFixed(1)} unit="h" />
        <MetricCardGlow label="本月结算电费" value={metrics.totalAmount.toFixed(2)} unit="万元" trend="up" trendValue="+8.3%" />
        <MetricCardGlow label="度电收益" value={metrics.unitRevenue.toFixed(2)} unit="元/kWh" />
        <MetricCardGlow label="日前结算占比" value={metrics.dayAheadRatio.toFixed(1)} unit="%" />
        <MetricCardGlow label="同比增长率" value="+12.3" unit="%" trend="up" trendValue="较去年" />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-3" style={{
      height: "calc(100vh - 280px)"
    }}>
        {/* Left Column */}
        <div className="col-span-3 flex flex-col gap-3">
          {/* 区域生产情况 */}
          <TechBorderCard title="区域生产情况" className="flex-1">
            <RegionalProductionChart provinceData={provinceData} stationData={stationGenerationData} />
          </TechBorderCard>

          {/* 省内现货交易 */}
          <TechBorderCard title="省内现货交易" className="flex-1" headerRight={<ViewToggle view={spotView} onViewChange={setSpotView} />}>
            {spotTradingData.length === 0 ? <div className="empty-state py-8">
                <FileX className="empty-state-icon w-8 h-8" />
                <span className="text-xs text-cyan-300/70">暂无出清数据</span>
              </div> : spotView === "chart" ? <ResponsiveContainer width="100%" height={160}>
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
                  <Bar yAxisId="left" dataKey="dayAheadVolume" fill="hsl(200, 80%, 50%)" name="日前(MWh)" />
                  <Bar yAxisId="left" dataKey="realTimeVolume" fill="hsl(149, 80%, 45%)" name="实时(MWh)" />
                  <Line yAxisId="right" type="monotone" dataKey="dayAheadPrice" stroke="hsl(45, 100%, 50%)" name="日前价格" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer> : <div className="overflow-auto max-h-[160px]">
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
            {settlementData.length === 0 ? <div className="empty-state py-8">
                <FileX className="empty-state-icon w-8 h-8" />
                <span className="text-xs text-cyan-300/70">暂无结算数据</span>
              </div> : <ItemizedSettlementTable data={settlementData} />}
          </TechBorderCard>

          {/* 供需预测 */}
          <TechBorderCard title="供需预测" className="flex-[0.8]" headerRight={<ViewToggle view={supplyDemandView} onViewChange={setSupplyDemandView} />}>
            {supplyDemandData.length === 0 ? <div className="empty-state py-4">
                <FileX className="empty-state-icon w-8 h-8" />
                <span className="text-xs text-cyan-300/70">暂无市场价格数据</span>
              </div> : supplyDemandView === "chart" ? <ResponsiveContainer width="100%" height={130}>
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
              </ResponsiveContainer> : <div className="overflow-auto max-h-[130px]">
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

          {/* 气象报警 */}
          <TechBorderCard title="气象报警信息" className="flex-[0.6]">
            {weatherAlertData.length > 0 ? <div className="overflow-auto max-h-[100px]">
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
                    {weatherAlertData.map((alert, index) => <tr key={index}>
                        <td className="text-xs">{alert.station}</td>
                        <td className="text-xs">{alert.type}</td>
                        <td>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${alert.level === "橙色" ? "bg-orange-500/30 text-orange-300" : alert.level === "黄色" ? "bg-yellow-500/30 text-yellow-300" : "bg-blue-500/30 text-blue-300"}`}>
                            {alert.level}
                          </span>
                        </td>
                        <td className="text-xs font-mono">{alert.time}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <div className="empty-state py-4">
                <FileX className="empty-state-icon w-8 h-8" />
                <span className="text-xs">暂无数据</span>
              </div>}
          </TechBorderCard>
        </div>
      </div>

      {/* Province Summary Bar */}
      <ProvinceSummaryBar provinces={provinceSummaryData} />

      {/* Footer Timestamp */}
      <div className="timestamp-footer">
        {format(currentTime, "yyyy/MM/dd HH:mm:ss")}
      </div>
    </div>;
};
export default Dashboard;
import { useState, useMemo } from "react";
import { addDays } from "date-fns";
import { toast } from "sonner";
import { MarketQuotesFilterBar } from "@/components/market-quotes/MarketQuotesFilterBar";
import { DashboardConfigDialog, DataItem } from "@/components/market-quotes/DashboardConfigDialog";
import { MarketTrendsChart } from "@/components/market-quotes/MarketTrendsChart";
import { StatisticsViews } from "@/components/market-quotes/StatisticsViews";
import { DateRange } from "@/components/MultiDateRangePicker";
import { 
  generateMarketQuotesData, 
  aggregateDataByDisplayFormat,
  type TimeGranularity,
  type AnalysisMethod,
  type DisplayFormat 
} from "@/lib/data-generation/market-quotes-data";
import * as XLSX from 'xlsx';

const MarketQuotes = () => {
  // Filter states
  const [dateRanges, setDateRanges] = useState<DateRange[]>([
    { start: addDays(new Date(), -7), end: new Date() }
  ]);
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>('24');
  const [analysisMethod, setAnalysisMethod] = useState<AnalysisMethod>('trend');
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('flat');
  const [chartDataType, setChartDataType] = useState<'dayAhead' | 'intraday'>('dayAhead');
  const [statisticsView, setStatisticsView] = useState<'dayAhead' | 'intraday' | 'table' | 'extremes' | 'trend'>('dayAhead');
  const [showRegulatedPrice, setShowRegulatedPrice] = useState(false);

  // Dashboard configuration
  const [dashboardConfigOpen, setDashboardConfigOpen] = useState(false);
  const [dataContentOpen, setDataContentOpen] = useState(false);
  
  const [greenDataItems, setGreenDataItems] = useState<DataItem[]>([
    { id: 'gridLoad', name: '统调负荷', category: 'green', enabled: true, order: 1, color: '#0EA5E9' },
    { id: 'biddingSpace', name: '竞价空间', category: 'green', enabled: true, order: 2, color: '#00B04D' },
    { id: 'renewableLoad', name: '新能源负荷', category: 'green', enabled: false, order: 3, color: '#F59E0B' },
    { id: 'externalTransmission', name: '外送电计划', category: 'green', enabled: false, order: 4, color: '#EF4444' },
    { id: 'nonMarketOutput', name: '非市场化机组出力', category: 'green', enabled: false, order: 5, color: '#8B5CF6' },
  ]);

  const [steelDataItems, setSteelDataItems] = useState<DataItem[]>([
    { id: 'clearingPriceDayAhead', name: '统一出清价格—日前', category: 'steel', enabled: true, order: 1, color: '#06B6D4' },
    { id: 'clearingPriceRealtime', name: '统一出清价格—实时', category: 'steel', enabled: true, order: 2, color: '#EC4899' },
  ]);

  // Generate data
  const rawData = useMemo(() => {
    if (dateRanges.length === 0 || !dateRanges[0].start || !dateRanges[0].end) {
      return [];
    }
    
    // For simplicity, use first date range
    const range = dateRanges[0];
    return generateMarketQuotesData(range.start, range.end, timeGranularity);
  }, [dateRanges, timeGranularity]);

  // Process data based on display format
  const processedData = useMemo(() => {
    return aggregateDataByDisplayFormat(rawData, displayFormat, timeGranularity);
  }, [rawData, displayFormat, timeGranularity]);

  // Get all enabled items
  const enabledItems = useMemo(() => {
    return [...greenDataItems, ...steelDataItems]
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order);
  }, [greenDataItems, steelDataItems]);

  const handleDashboardItemsChange = (items: DataItem[]) => {
    const green = items.filter(i => i.category === 'green');
    const steel = items.filter(i => i.category === 'steel');
    setGreenDataItems(green);
    setSteelDataItems(steel);
    toast.success('看板配置已更新');
  };

  const handleExportData = () => {
    if (processedData.length === 0) {
      toast.error('没有可导出的数据');
      return;
    }

    const exportData = processedData.map(point => ({
      时间: point.timestamp.toLocaleString('zh-CN'),
      统调负荷: point.gridLoad,
      竞价空间: point.biddingSpace,
      新能源负荷: point.renewableLoad,
      外送电计划: point.externalTransmission,
      非市场化机组出力: point.nonMarketOutput,
      日前价格: point.clearingPriceDayAhead,
      实时价格: point.clearingPriceRealtime,
      ...(showRegulatedPrice && { 调控后价格: point.clearingPriceRegulated }),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '市场行情数据');
    XLSX.writeFile(wb, `市场行情_${new Date().toLocaleDateString()}.xlsx`);
    toast.success('数据已导出');
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">市场行情</h1>
        <p className="text-muted-foreground mt-2">
          市场供需情况与价格趋势多维度分析
        </p>
      </div>

      {/* Filter Bar */}
      <MarketQuotesFilterBar
        dateRanges={dateRanges}
        onDateRangesChange={setDateRanges}
        timeGranularity={timeGranularity}
        onTimeGranularityChange={setTimeGranularity}
        analysisMethod={analysisMethod}
        onAnalysisMethodChange={setAnalysisMethod}
        displayFormat={displayFormat}
        onDisplayFormatChange={setDisplayFormat}
        chartDataType={chartDataType}
        onChartDataTypeChange={setChartDataType}
        statisticsView={statisticsView}
        onStatisticsViewChange={setStatisticsView}
        showRegulatedPrice={showRegulatedPrice}
        onShowRegulatedPriceChange={setShowRegulatedPrice}
        onDashboardConfigOpen={() => setDashboardConfigOpen(true)}
        onDataContentOpen={() => setDataContentOpen(true)}
        onExportData={handleExportData}
      />

      {/* Main Chart */}
      <MarketTrendsChart
        data={processedData}
        enabledItems={enabledItems}
        showRegulatedPrice={showRegulatedPrice}
        chartDataType={chartDataType}
        timeGranularity={timeGranularity}
      />

      {/* Statistics Views */}
      <StatisticsViews
        data={processedData}
        view={statisticsView}
        timeGranularity={timeGranularity}
      />

      {/* Dashboard Config Dialog */}
      <DashboardConfigDialog
        open={dashboardConfigOpen}
        onOpenChange={setDashboardConfigOpen}
        items={[...greenDataItems, ...steelDataItems]}
        onItemsChange={handleDashboardItemsChange}
      />

      {/* Data Content Dialog - Reuse same component */}
      <DashboardConfigDialog
        open={dataContentOpen}
        onOpenChange={setDataContentOpen}
        items={steelDataItems}
        onItemsChange={(items) => {
          setSteelDataItems(items);
          toast.success('数据内容配置已更新');
        }}
      />
    </div>
  );
};

export default MarketQuotes;

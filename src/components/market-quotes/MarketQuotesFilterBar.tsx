import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Download, Database } from "lucide-react";
import { MultiDateRangePicker, DateRange } from "@/components/MultiDateRangePicker";
import type { TimeGranularity, AnalysisMethod, DisplayFormat } from "@/lib/data-generation/market-quotes-data";

interface MarketQuotesFilterBarProps {
  dateRanges: DateRange[];
  onDateRangesChange: (ranges: DateRange[]) => void;
  timeGranularity: TimeGranularity;
  onTimeGranularityChange: (value: TimeGranularity) => void;
  analysisMethod: AnalysisMethod;
  onAnalysisMethodChange: (value: AnalysisMethod) => void;
  displayFormat: DisplayFormat;
  onDisplayFormatChange: (value: DisplayFormat) => void;
  chartDataType: 'dayAhead' | 'intraday';
  onChartDataTypeChange: (value: 'dayAhead' | 'intraday') => void;
  statisticsView: 'dayAhead' | 'intraday' | 'table' | 'extremes' | 'trend';
  onStatisticsViewChange: (value: 'dayAhead' | 'intraday' | 'table' | 'extremes' | 'trend') => void;
  showRegulatedPrice: boolean;
  onShowRegulatedPriceChange: (value: boolean) => void;
  onDashboardConfigOpen: () => void;
  onDataContentOpen: () => void;
  onExportData: () => void;
}

export const MarketQuotesFilterBar = ({
  dateRanges,
  onDateRangesChange,
  timeGranularity,
  onTimeGranularityChange,
  analysisMethod,
  onAnalysisMethodChange,
  displayFormat,
  onDisplayFormatChange,
  chartDataType,
  onChartDataTypeChange,
  statisticsView,
  onStatisticsViewChange,
  showRegulatedPrice,
  onShowRegulatedPriceChange,
  onDashboardConfigOpen,
  onDataContentOpen,
  onExportData,
}: MarketQuotesFilterBarProps) => {
  return (
    <div className="space-y-4 p-4 bg-[#F8FBFA] border-b">
      {/* Row 1: Date and basic filters */}
      <div className="flex flex-wrap items-center gap-4">
        <MultiDateRangePicker
          value={dateRanges}
          onChange={onDateRangesChange}
        />
        
        <Select value={timeGranularity} onValueChange={(v) => onTimeGranularityChange(v as TimeGranularity)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="时间颗粒度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="96">96点 (15分钟)</SelectItem>
            <SelectItem value="24">24点 (1小时)</SelectItem>
            <SelectItem value="day">日</SelectItem>
            <SelectItem value="month">月</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Row 2: Analysis method and display format tabs */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">分析方式:</span>
          <Tabs value={analysisMethod} onValueChange={(v) => onAnalysisMethodChange(v as AnalysisMethod)}>
            <TabsList className="bg-background">
              <TabsTrigger value="trend">趋势</TabsTrigger>
              <TabsTrigger value="comparison">对比</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">展示形式:</span>
          <Tabs value={displayFormat} onValueChange={(v) => onDisplayFormatChange(v as DisplayFormat)}>
            <TabsList className="bg-background">
              <TabsTrigger value="flat">平铺展示</TabsTrigger>
              <TabsTrigger value="grouped">分组聚合</TabsTrigger>
              <TabsTrigger value="summary">汇总聚合</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Row 3: Chart data type and statistics view */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">曲线图:</span>
          <Tabs value={chartDataType} onValueChange={(v) => onChartDataTypeChange(v as 'dayAhead' | 'intraday')}>
            <TabsList className="bg-background">
              <TabsTrigger value="dayAhead">日前</TabsTrigger>
              <TabsTrigger value="intraday">日内</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">统计指标:</span>
          <Tabs value={statisticsView} onValueChange={(v) => onStatisticsViewChange(v as any)}>
            <TabsList className="bg-background">
              <TabsTrigger value="dayAhead">日前</TabsTrigger>
              <TabsTrigger value="intraday">日内</TabsTrigger>
              <TabsTrigger value="table">数据表</TabsTrigger>
              <TabsTrigger value="extremes">极值分布</TabsTrigger>
              <TabsTrigger value="trend">趋势图</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2">
          <Checkbox
            id="regulated-price"
            checked={showRegulatedPrice}
            onCheckedChange={onShowRegulatedPriceChange}
          />
          <label
            htmlFor="regulated-price"
            className="text-sm font-medium cursor-pointer"
          >
            查看调控后价格
          </label>
        </div>
      </div>
      
      {/* Row 4: Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={onDashboardConfigOpen} variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          看板调整
        </Button>
        <Button onClick={onDataContentOpen} variant="outline" size="sm">
          <Database className="h-4 w-4 mr-2" />
          数据内容
        </Button>
        <Button onClick={onExportData} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          下载数据
        </Button>
      </div>
    </div>
  );
};

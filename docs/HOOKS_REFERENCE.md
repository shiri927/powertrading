# 数据Hooks使用参考文档

> 本文档提供所有24个数据获取Hooks的API说明、使用示例和最佳实践。

## 目录

1. [概述](#1-概述)
2. [场站与交易单元](#2-场站与交易单元)
3. [合同管理](#3-合同管理)
4. [交易管理](#4-交易管理)
5. [结算管理](#5-结算管理)
6. [客户管理](#6-客户管理)
7. [策略管理](#7-策略管理)
8. [预测数据](#8-预测数据)
9. [市场数据](#9-市场数据)
10. [服务层](#10-服务层)

---

## 1. 概述

### 1.1 Hook设计原则

所有Hooks遵循以下设计原则：

- **React Query封装**: 使用 `@tanstack/react-query` 进行数据获取和缓存
- **类型安全**: 完整的TypeScript类型定义
- **错误处理**: 统一的错误处理机制
- **加载状态**: 提供 `isLoading`, `error`, `data` 状态
- **自动缓存**: 智能缓存和自动失效

### 1.2 通用返回结构

```typescript
interface UseQueryResult<T> {
  data: T | undefined;          // 数据
  isLoading: boolean;           // 加载中
  isError: boolean;             // 是否出错
  error: Error | null;          // 错误对象
  refetch: () => void;          // 重新获取
  isFetching: boolean;          // 后台刷新中
}
```

### 1.3 目录结构

```
src/hooks/
├── useDashboardData.ts         # 首页大屏数据
├── useTradingCalendar.ts       # 交易日历
├── useContracts.ts             # 合同管理
├── usePowerPlanData.ts         # 发电计划
├── usePowerPlanTimeSeries.ts   # 发电计划时序
├── useClearingRecords.ts       # 出清记录
├── useTimeSegmentClearing.ts   # 分时段出清
├── useSettlementRecords.ts     # 结算记录
├── useCustomers.ts             # 客户管理
├── useEnergyUsage.ts           # 用电数据
├── useExecutionRecords.ts      # 执行记录
├── usePackageSimulations.ts    # 套餐模拟
├── useTradingStrategies.ts     # 交易策略
├── useBacktestResults.ts       # 回测结果
├── usePredictionData.ts        # 预测数据
├── useMarketClearingPrices.ts  # 市场出清价格
├── useMediumLongTermData.ts    # 中长期数据
├── useSupplyDemandData.ts      # 供需数据
├── useWeatherData.ts           # 气象数据
├── useEnergyQuotesData.ts      # 能源行情
├── useNewsPolicies.ts          # 新闻政策
├── useReviewData.ts            # 复盘数据
├── useRealtimeData.ts          # 实时数据
├── useTradingBids.ts           # 交易报价
└── useAnalysisReports.ts       # 分析报告
```

---

## 2. 场站与交易单元

### useDashboardData

首页大屏综合数据Hook。

**文件路径**: `src/hooks/useDashboardData.ts`

**API**:
```typescript
function useDashboardData(): {
  // 场站数据
  stations: PowerStation[];
  tradingUnits: TradingUnit[];
  
  // 汇总指标
  totalCapacity: number;
  stationCount: number;
  settlementVolume: number;
  settlementAmount: number;
  
  // 图表数据
  regionData: { province: string; capacity: number }[];
  clearingTrend: { date: string; dayAhead: number; realtime: number }[];
  settlementBreakdown: { category: string; amount: number }[];
  
  // 状态
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**使用示例**:
```tsx
import { useDashboardData } from '@/hooks/useDashboardData';

function Dashboard() {
  const { 
    totalCapacity, 
    stationCount,
    regionData,
    isLoading 
  } = useDashboardData();
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      <MetricCard title="总装机容量" value={totalCapacity} unit="MW" />
      <MetricCard title="场站数量" value={stationCount} unit="个" />
      <RegionalChart data={regionData} />
    </div>
  );
}
```

---

## 3. 合同管理

### useContracts

合同数据管理Hook。

**文件路径**: `src/hooks/useContracts.ts`

**API**:
```typescript
interface UseContractsOptions {
  tradingUnitId?: string;
  status?: 'active' | 'expired' | 'pending';
  dateRange?: { start: string; end: string };
}

function useContracts(options?: UseContractsOptions): {
  contracts: Contract[];
  contractTimeSeries: ContractTimeSeries[];
  
  // CRUD操作
  getContractById: (id: string) => Contract | undefined;
  getTimeSeriesByContractId: (contractId: string) => ContractTimeSeries[];
  
  // 状态
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**使用示例**:
```tsx
import { useContracts } from '@/hooks/useContracts';

function ContractList() {
  const { contracts, isLoading } = useContracts({
    status: 'active',
    tradingUnitId: selectedUnit
  });
  
  return (
    <Table>
      {contracts.map(contract => (
        <TableRow key={contract.id}>
          <TableCell>{contract.contract_name}</TableCell>
          <TableCell>{contract.total_volume} MWh</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
```

---

## 4. 交易管理

### useTradingCalendar

交易日历数据Hook。

**文件路径**: `src/hooks/useTradingCalendar.ts`

**API**:
```typescript
interface UseTradingCalendarOptions {
  tradingCenter?: string;
  dateRange?: { start: string; end: string };
  tradingType?: string;
}

function useTradingCalendar(options?: UseTradingCalendarOptions): {
  calendarEvents: TradingCalendar[];
  tradingCenters: string[];  // 可用交易中心列表
  
  // 筛选方法
  getEventsByDate: (date: string) => TradingCalendar[];
  getUpcoming: (days: number) => TradingCalendar[];
  
  isLoading: boolean;
  error: Error | null;
}
```

### useClearingRecords

出清记录Hook。

**文件路径**: `src/hooks/useClearingRecords.ts`

**API**:
```typescript
interface UseClearingRecordsOptions {
  tradingUnitId?: string;
  date?: string;
  dateRange?: { start: string; end: string };
  tradingType?: 'day_ahead' | 'realtime' | 'all';
}

function useClearingRecords(options?: UseClearingRecordsOptions): {
  records: ClearingRecord[];
  
  // 聚合数据
  dailyStats: {
    avgDayAheadPrice: number;
    avgRealtimePrice: number;
    totalDayAheadVolume: number;
    totalRealtimeVolume: number;
    maxPrice: number;
    minPrice: number;
  };
  
  // 按小时分组
  hourlyData: { hour: number; dayAhead: number; realtime: number }[];
  
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**使用示例**:
```tsx
import { useClearingRecords } from '@/hooks/useClearingRecords';

function ClearingChart() {
  const { hourlyData, dailyStats, isLoading } = useClearingRecords({
    date: selectedDate,
    tradingType: 'all'
  });
  
  return (
    <>
      <MetricCard title="日前均价" value={dailyStats.avgDayAheadPrice} />
      <LineChart data={hourlyData} />
    </>
  );
}
```

### useTimeSegmentClearing

分时段出清数据Hook。

**文件路径**: `src/hooks/useTimeSegmentClearing.ts`

**API**:
```typescript
interface UseTimeSegmentClearingOptions {
  tradingUnitId?: string;
  date?: string;
  province?: string;
}

function useTimeSegmentClearing(options?: UseTimeSegmentClearingOptions): {
  segments: TimeSegmentClearing[];
  
  // 统计数据
  stats: {
    avgClearPrice: number;
    totalClearVolume: number;
    maxClearPrice: number;
    minClearPrice: number;
  };
  
  isLoading: boolean;
  error: Error | null;
}
```

### useTradingBids

交易报价Hook。

**文件路径**: `src/hooks/useTradingBids.ts`

**API**:
```typescript
function useTradingBids(options?: { userId?: string }): {
  bids: TradingBid[];
  
  // 操作方法
  createBid: (bid: Omit<TradingBid, 'id'>) => Promise<TradingBid>;
  updateBidStatus: (id: string, status: string) => Promise<void>;
  
  isLoading: boolean;
  isSubmitting: boolean;
}
```

---

## 5. 结算管理

### useSettlementRecords

结算记录Hook。

**文件路径**: `src/hooks/useSettlementRecords.ts`

**API**:
```typescript
interface UseSettlementRecordsOptions {
  tradingUnitId?: string;
  month?: string;         // YYYY-MM
  side?: 'wholesale' | 'retail';
  category?: string;
}

function useSettlementRecords(options?: UseSettlementRecordsOptions): {
  records: SettlementRecord[];
  
  // 树形结构(用于三级表格)
  treeData: SettlementTreeNode[];
  
  // 汇总统计
  summary: {
    totalVolume: number;
    totalAmount: number;
    wholesaleAmount: number;
    retailAmount: number;
    categoryBreakdown: { category: string; amount: number }[];
  };
  
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface SettlementTreeNode {
  key: string;
  title: string;
  type: 'summary' | 'month' | 'record';
  data: Partial<SettlementRecord>;
  children?: SettlementTreeNode[];
}
```

**使用示例**:
```tsx
import { useSettlementRecords } from '@/hooks/useSettlementRecords';

function SettlementTable() {
  const { treeData, summary, isLoading } = useSettlementRecords({
    month: '2025-11',
    side: 'wholesale'
  });
  
  return (
    <>
      <SummaryCards data={summary} />
      <TreeTable data={treeData} />
    </>
  );
}
```

---

## 6. 客户管理

### useCustomers

客户管理Hook。

**文件路径**: `src/hooks/useCustomers.ts`

**API**:
```typescript
interface UseCustomersOptions {
  contractStatus?: 'active' | 'expired' | 'pending';
  packageType?: string;
  voltageLevel?: string;
  isActive?: boolean;
}

function useCustomers(options?: UseCustomersOptions): {
  customers: Customer[];
  
  // 统计数据
  stats: {
    totalCount: number;
    activeCount: number;
    newThisMonth: number;
    expiringCount: number;
  };
  
  // CRUD操作
  getCustomerById: (id: string) => Customer | undefined;
  createCustomer: (data: Omit<Customer, 'id'>) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  
  isLoading: boolean;
  error: Error | null;
}
```

### useEnergyUsage

用电数据Hook。

**文件路径**: `src/hooks/useEnergyUsage.ts`

**API**:
```typescript
interface UseEnergyUsageOptions {
  customerId?: string;
  dateRange?: { start: string; end: string };
}

function useEnergyUsage(options?: UseEnergyUsageOptions): {
  usageData: EnergyUsage[];
  
  // 汇总统计
  summary: {
    totalEnergy: number;
    avgDailyEnergy: number;
    peakRatio: number;
    flatRatio: number;
    valleyRatio: number;
    avgDeviationRate: number;
  };
  
  // 偏差分析
  deviationAnalysis: {
    highDeviationCustomers: { customerId: string; deviationRate: number }[];
    deviationTrend: { date: string; avgDeviation: number }[];
  };
  
  isLoading: boolean;
  error: Error | null;
}
```

### useExecutionRecords

执行记录Hook。

**文件路径**: `src/hooks/useExecutionRecords.ts`

**API**:
```typescript
interface UseExecutionRecordsOptions {
  customerId?: string;
  dateRange?: { start: string; end: string };
  status?: 'executing' | 'completed' | 'abnormal';
}

function useExecutionRecords(options?: UseExecutionRecordsOptions): {
  records: ExecutionRecord[];
  
  // 汇总统计
  summary: {
    totalExecutedVolume: number;
    avgDeviationRate: number;
    totalRevenue: number;
    abnormalCount: number;
  };
  
  // 客户汇总
  customerSummary: {
    customerId: string;
    customerName: string;
    totalVolume: number;
    avgDeviation: number;
    revenue: number;
  }[];
  
  // 异常列表
  anomalies: ExecutionRecord[];
  
  isLoading: boolean;
}
```

### usePackageSimulations

套餐模拟Hook。

**文件路径**: `src/hooks/usePackageSimulations.ts`

**API**:
```typescript
function usePackageSimulations(options?: { customerId?: string }): {
  simulations: PackageSimulation[];
  
  // 操作方法
  createSimulation: (data: Omit<PackageSimulation, 'id'>) => Promise<PackageSimulation>;
  deleteSimulation: (id: string) => Promise<void>;
  
  isLoading: boolean;
  isSubmitting: boolean;
}
```

---

## 7. 策略管理

### useTradingStrategies

交易策略Hook。

**文件路径**: `src/hooks/useTradingStrategies.ts`

**API**:
```typescript
function useTradingStrategies(): {
  strategies: TradingStrategy[];
  presetStrategies: TradingStrategy[];
  userStrategies: TradingStrategy[];
  
  // CRUD操作
  createStrategy: (data: Omit<TradingStrategy, 'id'>) => Promise<TradingStrategy>;
  updateStrategy: (id: string, data: Partial<TradingStrategy>) => Promise<void>;
  deleteStrategy: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  
  // 导入导出
  exportStrategy: (id: string) => string;  // JSON字符串
  importStrategy: (json: string) => Promise<TradingStrategy>;
  
  isLoading: boolean;
  error: Error | null;
}
```

**使用示例**:
```tsx
import { useTradingStrategies } from '@/hooks/useTradingStrategies';

function StrategyConfig() {
  const { 
    presetStrategies, 
    userStrategies,
    createStrategy,
    isLoading 
  } = useTradingStrategies();
  
  const handleCreate = async (data) => {
    await createStrategy({
      name: data.name,
      strategy_type: 'intraday_arbitrage',
      risk_level: 'medium',
      trigger_conditions: data.triggers,
      trading_params: data.params,
      risk_control: data.riskControl
    });
  };
  
  return (
    <div>
      <h3>预设策略</h3>
      {presetStrategies.map(s => <StrategyCard key={s.id} strategy={s} />)}
      
      <h3>我的策略</h3>
      {userStrategies.map(s => <StrategyCard key={s.id} strategy={s} editable />)}
    </div>
  );
}
```

### useBacktestResults

回测结果Hook。

**文件路径**: `src/hooks/useBacktestResults.ts`

**API**:
```typescript
interface UseBacktestResultsOptions {
  strategyId?: string;
}

function useBacktestResults(options?: UseBacktestResultsOptions): {
  results: BacktestResult[];
  
  // 保存回测
  saveResult: (result: Omit<BacktestResult, 'id'>) => Promise<BacktestResult>;
  
  // 最近回测
  latestResult: BacktestResult | null;
  
  isLoading: boolean;
}
```

---

## 8. 预测数据

### usePredictionData

负荷和价格预测Hook。

**文件路径**: `src/hooks/usePredictionData.ts`

**API**:
```typescript
interface UsePredictionDataOptions {
  tradingUnitId?: string;
  province?: string;
  date?: string;
  dateRange?: { start: string; end: string };
}

function usePredictionData(options?: UsePredictionDataOptions): {
  // 负荷预测
  loadPredictions: LoadPrediction[];
  
  // 价格预测
  pricePredictions: PricePrediction[];
  
  // 预测指标
  metrics: {
    ultraShortAccuracy: number;  // 超短期准确率
    shortTermAccuracy: number;   // 短期准确率
    mediumTermAccuracy: number;  // 中期准确率
    overallScore: number;        // 综合评分
  };
  
  // 误差分析
  errorAnalysis: {
    hour: number;
    mape: number;       // 平均绝对百分比误差
    rmse: number;       // 均方根误差
    bias: number;       // 偏差
  }[];
  
  isLoading: boolean;
}
```

**使用示例**:
```tsx
import { usePredictionData } from '@/hooks/usePredictionData';

function AIForecastTab() {
  const { 
    loadPredictions, 
    metrics, 
    errorAnalysis,
    isLoading 
  } = usePredictionData({
    tradingUnitId: selectedUnit,
    dateRange: { start: startDate, end: endDate }
  });
  
  return (
    <>
      <MetricCards metrics={metrics} />
      <PredictionChart data={loadPredictions} />
      <ErrorTable data={errorAnalysis} />
    </>
  );
}
```

### useMarketClearingPrices

市场出清价格Hook。

**文件路径**: `src/hooks/useMarketClearingPrices.ts`

**API**:
```typescript
interface UseMarketClearingPricesOptions {
  province?: string;
  date?: string;
  dateRange?: { start: string; end: string };
}

function useMarketClearingPrices(options?: UseMarketClearingPricesOptions): {
  prices: MarketClearingPrice[];
  
  // 统计数据
  stats: {
    avgDayAhead: number;
    avgRealtime: number;
    maxPrice: number;
    minPrice: number;
    priceSpread: number;  // 日前-实时价差
  };
  
  // 按小时数据
  hourlyPrices: {
    hour: number;
    dayAheadPrice: number;
    realtimePrice: number;
  }[];
  
  isLoading: boolean;
}
```

---

## 9. 市场数据

### useMediumLongTermData

中长期市场数据Hook。

**文件路径**: `src/hooks/useMediumLongTermData.ts`

**API**:
```typescript
interface UseMediumLongTermDataOptions {
  province?: string;
  tradeMonth?: string;
  transactionType?: string;
  dateRange?: { start: string; end: string };
}

function useMediumLongTermData(options?: UseMediumLongTermDataOptions): {
  priceData: MediumLongTermPrice[];
  priceDistribution: PriceDistribution[];
  biddingBehavior: BiddingBehaviorAnalysis[];
  
  // 市场指标
  marketIndicators: {
    avgPrice: number;
    priceRange: { min: number; max: number };
    successRate: number;
    totalVolume: number;
  };
  
  isLoading: boolean;
}
```

### useSupplyDemandData

供需数据Hook。

**文件路径**: `src/hooks/useSupplyDemandData.ts`

**API**:
```typescript
interface UseSupplyDemandDataOptions {
  province?: string;
  dateRange?: { start: string; end: string };
  granularity?: '15min' | 'hourly' | 'daily' | 'monthly';
}

function useSupplyDemandData(options?: UseSupplyDemandDataOptions): {
  loadForecast: LoadForecast[];
  renewableOutput: RenewableOutputForecast[];
  thermalBidding: ThermalBiddingForecast[];
  tieLineFlow: TieLineForecast[];
  
  // 汇总数据
  summary: {
    totalLoad: number;
    renewableOutput: number;
    thermalBidSpace: number;
    netTieFlow: number;
  };
  
  isLoading: boolean;
}
```

### useWeatherData

气象数据Hook。

**文件路径**: `src/hooks/useWeatherData.ts`

**API**:
```typescript
interface UseWeatherDataOptions {
  province?: string;
  region?: string;
  date?: string;
  dataType?: 'actual' | 'forecast';
}

function useWeatherData(options?: UseWeatherDataOptions): {
  weatherData: WeatherData[];
  weatherAlerts: WeatherAlert[];
  
  // 地图数据
  mapData: {
    province: string;
    temperature: number;
    windSpeed: number;
    radiation: number;
  }[];
  
  // 活动预警
  activeAlerts: WeatherAlert[];
  
  isLoading: boolean;
}
```

### useEnergyQuotesData

能源行情数据Hook。

**文件路径**: `src/hooks/useEnergyQuotesData.ts`

**API**:
```typescript
function useEnergyQuotesData(): {
  crudeQuotes: EnergyCrudeQuote[];
  refinedQuotes: EnergyRefinedQuote[];
  crackSpreads: EnergyCrackSpread[];
  inventory: EnergyInventory[];
  stocks: EnergyRelatedStock[];
  news: EnergyNews[];
  marketIndices: EnergyMarketIndex[];
  ineIntraday: EnergyINEIntraday[];
  
  isLoading: boolean;
}
```

### useNewsPolicies

新闻政策Hook。

**文件路径**: `src/hooks/useNewsPolicies.ts`

**API**:
```typescript
interface UseNewsPoliciesOptions {
  category?: string;
  type?: string;
  province?: string;
  dateRange?: { start: string; end: string };
  limit?: number;
}

function useNewsPolicies(options?: UseNewsPoliciesOptions): {
  newsList: NewsPolicy[];
  categories: string[];  // 可用分类
  
  // 获取详情
  getNewsById: (id: string) => NewsPolicy | undefined;
  
  isLoading: boolean;
}
```

---

## 10. 服务层

除了Hooks外，项目还提供了服务层用于更复杂的数据操作。

### 服务层位置

```
src/lib/services/
├── index.ts                    # 统一导出
├── base-service.ts             # 基础服务(缓存、错误处理)
├── customer-service.ts         # 客户服务
├── trading-strategy-service.ts # 策略服务
├── clearing-service.ts         # 出清服务
└── settlement-service.ts       # 结算服务
```

### customerService

**API**:
```typescript
import { customerService } from '@/lib/services';

// 获取所有客户
const customers = await customerService.getAll();

// 按ID获取
const customer = await customerService.getById(id);

// 创建客户
const newCustomer = await customerService.create({
  customer_code: 'C001',
  name: '测试客户',
  voltage_level: '10kV',
  package_type: 'fixed'
});

// 更新客户
await customerService.update(id, { name: '新名称' });

// 删除客户
await customerService.delete(id);

// 实时订阅
customerService.subscribe((payload) => {
  console.log('客户数据变更:', payload);
});
```

### tradingStrategyService

**API**:
```typescript
import { tradingStrategyService } from '@/lib/services';

// 获取所有策略
const strategies = await tradingStrategyService.getAll();

// 获取预设策略
const presets = await tradingStrategyService.getPresets();

// 创建策略
const strategy = await tradingStrategyService.create({
  name: '日内套利策略',
  strategy_type: 'intraday_arbitrage',
  risk_level: 'medium',
  trigger_conditions: { p50_threshold: 100 },
  trading_params: { max_position: 50 },
  risk_control: { stop_loss: 5 }
});

// 切换激活状态
await tradingStrategyService.toggleActive(id);

// 实时订阅
tradingStrategyService.subscribe((payload) => {
  console.log('策略变更:', payload);
});
```

### clearingService

**API**:
```typescript
import { clearingService } from '@/lib/services';

// 按日期获取
const records = await clearingService.getByDate('2025-12-01');

// 按日期范围获取
const rangeRecords = await clearingService.getByDateRange('2025-11-01', '2025-11-30');

// 获取日统计
const stats = await clearingService.getDailyStatistics('2025-12-01');
// 返回: { avgDayAhead, avgRealtime, totalDayAheadVolume, ... }
```

### settlementService

**API**:
```typescript
import { settlementService } from '@/lib/services';

// 按月获取
const records = await settlementService.getByMonth('2025-11');

// 按交易单元获取
const unitRecords = await settlementService.getByTradingUnit(unitId, '2025-01', '2025-11');

// 获取月度统计
const stats = await settlementService.getMonthlyStatistics('2025-11');

// 确认结算
await settlementService.confirmSettlement(id);

// 批量确认
await settlementService.confirmMany([id1, id2, id3]);
```

---

## 附录: 最佳实践

### A. 数据加载优化

```tsx
// ✅ 好的做法: 条件加载
const { data } = useContracts({
  tradingUnitId: selectedUnit  // 仅在选择单元后加载
});

// ❌ 避免: 加载所有数据后过滤
const { contracts } = useContracts();
const filtered = contracts.filter(c => c.trading_unit_id === selectedUnit);
```

### B. 错误处理

```tsx
function MyComponent() {
  const { data, isLoading, error } = useCustomers();
  
  if (isLoading) return <Skeleton />;
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>加载失败</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
  
  return <CustomerList customers={data} />;
}
```

### C. 数据刷新

```tsx
function RefreshableTable() {
  const { data, refetch, isFetching } = useSettlementRecords();
  
  return (
    <>
      <Button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? '刷新中...' : '刷新数据'}
      </Button>
      <Table data={data} />
    </>
  );
}
```

### D. 组合多个Hooks

```tsx
function DashboardWidget() {
  const { customers, isLoading: loadingCustomers } = useCustomers();
  const { usageData, isLoading: loadingUsage } = useEnergyUsage();
  
  const isLoading = loadingCustomers || loadingUsage;
  
  if (isLoading) return <Skeleton />;
  
  // 组合数据
  const enrichedData = customers.map(c => ({
    ...c,
    usage: usageData.find(u => u.customer_id === c.id)
  }));
  
  return <CustomerUsageTable data={enrichedData} />;
}
```

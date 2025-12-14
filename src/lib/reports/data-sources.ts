// 数据源定义和字段元数据

export type FieldType = 'dimension' | 'measure';
export type DataType = 'string' | 'number' | 'date';
export type AggregationType = 'sum' | 'avg' | 'max' | 'min' | 'count';

export interface FieldMeta {
  id: string;
  name: string;
  fieldType: FieldType;
  dataType: DataType;
  format?: string;
  decimals?: number;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  fields: FieldMeta[];
}

// 可用数据源定义
export const DATA_SOURCES: DataSource[] = [
  {
    id: 'market_clearing_prices',
    name: '市场出清价格',
    description: '省内现货市场日前和实时出清价格数据',
    fields: [
      { id: 'province', name: '省份', fieldType: 'dimension', dataType: 'string' },
      { id: 'price_date', name: '日期', fieldType: 'dimension', dataType: 'date' },
      { id: 'hour', name: '小时', fieldType: 'dimension', dataType: 'number' },
      { id: 'day_ahead_price', name: '日前价格', fieldType: 'measure', dataType: 'number', decimals: 2 },
      { id: 'realtime_price', name: '实时价格', fieldType: 'measure', dataType: 'number', decimals: 2 },
    ]
  },
  {
    id: 'settlement_data',
    name: '结算数据',
    description: '电量结算明细数据',
    fields: [
      { id: 'category', name: '分类', fieldType: 'dimension', dataType: 'string' },
      { id: 'trade_type', name: '交易类型', fieldType: 'dimension', dataType: 'string' },
      { id: 'sub_type', name: '子类型', fieldType: 'dimension', dataType: 'string' },
      { id: 'item_name', name: '项目名称', fieldType: 'dimension', dataType: 'string' },
      { id: 'settlement_month', name: '结算月份', fieldType: 'dimension', dataType: 'date' },
      { id: 'volume', name: '电量(万kWh)', fieldType: 'measure', dataType: 'number', decimals: 4 },
      { id: 'price_no_subsidy', name: '不含补贴电价', fieldType: 'measure', dataType: 'number', decimals: 5 },
      { id: 'price_with_subsidy', name: '含补贴电价', fieldType: 'measure', dataType: 'number', decimals: 5 },
      { id: 'income_no_subsidy', name: '不含补贴收入(万元)', fieldType: 'measure', dataType: 'number', decimals: 6 },
      { id: 'income_with_subsidy', name: '含补贴收入(万元)', fieldType: 'measure', dataType: 'number', decimals: 6 },
    ]
  },
  {
    id: 'trading_data',
    name: '交易数据',
    description: '中长期和现货交易数据',
    fields: [
      { id: 'trading_center', name: '交易中心', fieldType: 'dimension', dataType: 'string' },
      { id: 'trading_unit', name: '交易单元', fieldType: 'dimension', dataType: 'string' },
      { id: 'trade_date', name: '交易日期', fieldType: 'dimension', dataType: 'date' },
      { id: 'trade_type', name: '交易品种', fieldType: 'dimension', dataType: 'string' },
      { id: 'direction', name: '交易方向', fieldType: 'dimension', dataType: 'string' },
      { id: 'contract_volume', name: '合同电量(MWh)', fieldType: 'measure', dataType: 'number', decimals: 2 },
      { id: 'contract_price', name: '合同价格(元/MWh)', fieldType: 'measure', dataType: 'number', decimals: 2 },
      { id: 'settlement_volume', name: '结算电量(MWh)', fieldType: 'measure', dataType: 'number', decimals: 2 },
      { id: 'settlement_price', name: '结算价格(元/MWh)', fieldType: 'measure', dataType: 'number', decimals: 2 },
      { id: 'profit', name: '收益(万元)', fieldType: 'measure', dataType: 'number', decimals: 4 },
    ]
  }
];

// 生成模拟结算数据
export const generateSettlementData = (): Record<string, any>[] => {
  const data: Record<string, any>[] = [
    { category: '电量清分', trade_type: '现货', sub_type: '', item_name: '省间现货', settlement_month: '2024-11', volume: 111.7097, price_no_subsidy: 0.33907, price_with_subsidy: 0.61707, income_no_subsidy: 37.877582, income_with_subsidy: 68.933047 },
    { category: '电量清分', trade_type: '现货', sub_type: '', item_name: '省内现货', settlement_month: '2024-11', volume: 1953.7994, price_no_subsidy: 0.61425, price_with_subsidy: 0.89225, income_no_subsidy: 1200.11606, income_with_subsidy: 1743.285709 },
    { category: '电量清分', trade_type: '中长期', sub_type: '交易', item_name: '直接交易', settlement_month: '2024-11', volume: 6494.7826, price_no_subsidy: 0.25883, price_with_subsidy: 0.53683, income_no_subsidy: 1681.046587, income_with_subsidy: 3486.610537 },
    { category: '电量清分', trade_type: '中长期', sub_type: '交易', item_name: '优先发电', settlement_month: '2024-11', volume: 93.4, price_no_subsidy: 0.33062, price_with_subsidy: 0.60862, income_no_subsidy: 30.879856, income_with_subsidy: 56.845056 },
    { category: '电量清分', trade_type: '中长期', sub_type: '非交易', item_name: '基数', settlement_month: '2024-11', volume: 4576.2863, price_no_subsidy: 0.332, price_with_subsidy: 0.61, income_no_subsidy: 1519.327051, income_with_subsidy: 2791.552444 },
    { category: '电量清分', trade_type: '中长期', sub_type: '交易', item_name: '外送', settlement_month: '2024-11', volume: 1380.1723, price_no_subsidy: 0.3687, price_with_subsidy: 0.6467, income_no_subsidy: 508.869518, income_with_subsidy: 892.562414 },
    { category: '权益凭证分摊补偿', trade_type: '费用', sub_type: '', item_name: '市场运营费用', settlement_month: '2024-11', volume: 0, price_no_subsidy: 0, price_with_subsidy: 0, income_no_subsidy: -676.491131, income_with_subsidy: -676.491131 },
    { category: '权益凭证分摊补偿', trade_type: '费用', sub_type: '', item_name: '辅助服务费用分摊', settlement_month: '2024-11', volume: 0, price_no_subsidy: 0, price_with_subsidy: 0, income_no_subsidy: 6.02612, income_with_subsidy: 6.02612 },
    { category: '权益凭证分摊补偿', trade_type: '费用', sub_type: '', item_name: '两个细则', settlement_month: '2024-11', volume: 0, price_no_subsidy: 0, price_with_subsidy: 0, income_no_subsidy: -72.969742, income_with_subsidy: -72.969742 },
    { category: '结算调整', trade_type: '调整', sub_type: '', item_name: '退补', settlement_month: '2024-11', volume: 0, price_no_subsidy: 0, price_with_subsidy: 0, income_no_subsidy: -35.497224, income_with_subsidy: -35.497224 },
  ];
  
  // 添加更多月份数据
  const months = ['2024-10', '2024-09', '2024-08'];
  months.forEach(month => {
    data.forEach(item => {
      data.push({
        ...item,
        settlement_month: month,
        volume: item.volume * (0.8 + Math.random() * 0.4),
        income_no_subsidy: item.income_no_subsidy * (0.8 + Math.random() * 0.4),
        income_with_subsidy: item.income_with_subsidy * (0.8 + Math.random() * 0.4),
      });
    });
  });
  
  return data;
};

// 生成模拟交易数据
export const generateTradingData = (): Record<string, any>[] => {
  const centers = ['山东电力交易中心', '山西电力交易中心', '浙江电力交易中心'];
  const units = ['山东省场站A', '山东省场站B', '山西省场站A', '浙江省场站A'];
  const types = ['年度双边', '月度竞价', '日滚动', '省内现货'];
  const directions = ['买入', '卖出'];
  
  const data: Record<string, any>[] = [];
  
  for (let i = 0; i < 100; i++) {
    const volume = 100 + Math.random() * 500;
    const price = 200 + Math.random() * 300;
    data.push({
      trading_center: centers[Math.floor(Math.random() * centers.length)],
      trading_unit: units[Math.floor(Math.random() * units.length)],
      trade_date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      trade_type: types[Math.floor(Math.random() * types.length)],
      direction: directions[Math.floor(Math.random() * directions.length)],
      contract_volume: volume,
      contract_price: price,
      settlement_volume: volume * (0.9 + Math.random() * 0.2),
      settlement_price: price * (0.95 + Math.random() * 0.1),
      profit: (Math.random() - 0.3) * 50,
    });
  }
  
  return data;
};

export const getDataSourceById = (id: string): DataSource | undefined => {
  return DATA_SOURCES.find(ds => ds.id === id);
};

export const getDimensionFields = (dataSource: DataSource): FieldMeta[] => {
  return dataSource.fields.filter(f => f.fieldType === 'dimension');
};

export const getMeasureFields = (dataSource: DataSource): FieldMeta[] => {
  return dataSource.fields.filter(f => f.fieldType === 'measure');
};

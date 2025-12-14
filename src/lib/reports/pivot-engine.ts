// 透视表计算引擎

import { AggregationType, FieldMeta } from './data-sources';

export interface ValueFieldConfig {
  field: string;
  aggregation: AggregationType;
  label?: string;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between' | 'contains';
  value: any;
}

export interface PivotConfig {
  dataSourceId: string;
  rowFields: string[];
  columnFields: string[];
  valueFields: ValueFieldConfig[];
  filters: FilterConfig[];
  showRowTotals: boolean;
  showColumnTotals: boolean;
  showGrandTotal: boolean;
}

export interface PivotCell {
  value: number | string;
  isTotal?: boolean;
  isGrandTotal?: boolean;
  rowSpan?: number;
  colSpan?: number;
}

export interface PivotResult {
  headers: string[][];
  rows: PivotCell[][];
  columnValues: string[][];
}

// 聚合函数
const aggregateFunctions: Record<AggregationType, (values: number[]) => number> = {
  sum: (values) => values.reduce((a, b) => a + b, 0),
  avg: (values) => values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
  max: (values) => values.length > 0 ? Math.max(...values) : 0,
  min: (values) => values.length > 0 ? Math.min(...values) : 0,
  count: (values) => values.length,
};

// 应用筛选条件
export const applyFilters = (data: Record<string, any>[], filters: FilterConfig[]): Record<string, any>[] => {
  return data.filter(row => {
    return filters.every(filter => {
      const value = row[filter.field];
      switch (filter.operator) {
        case 'eq':
          return value === filter.value;
        case 'neq':
          return value !== filter.value;
        case 'gt':
          return value > filter.value;
        case 'lt':
          return value < filter.value;
        case 'gte':
          return value >= filter.value;
        case 'lte':
          return value <= filter.value;
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value);
        case 'between':
          return Array.isArray(filter.value) && value >= filter.value[0] && value <= filter.value[1];
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        default:
          return true;
      }
    });
  });
};

// 获取唯一值
const getUniqueValues = (data: Record<string, any>[], field: string): string[] => {
  const values = new Set<string>();
  data.forEach(row => {
    if (row[field] !== undefined && row[field] !== null) {
      values.add(String(row[field]));
    }
  });
  return Array.from(values).sort();
};

// 生成分组键
const getGroupKey = (row: Record<string, any>, fields: string[]): string => {
  return fields.map(f => String(row[f] ?? '')).join('|||');
};

// 计算透视表
export const calculatePivot = (
  data: Record<string, any>[],
  config: PivotConfig,
  fieldMetas: FieldMeta[]
): PivotResult => {
  // 应用筛选
  const filteredData = applyFilters(data, config.filters);
  
  // 获取行和列的唯一值组合
  const rowGroups = new Map<string, Record<string, any>[]>();
  const columnValues: string[][] = config.columnFields.map(f => getUniqueValues(filteredData, f));
  
  // 分组数据
  filteredData.forEach(row => {
    const rowKey = getGroupKey(row, config.rowFields);
    if (!rowGroups.has(rowKey)) {
      rowGroups.set(rowKey, []);
    }
    rowGroups.get(rowKey)!.push(row);
  });
  
  // 生成列头
  const headers: string[][] = [];
  
  // 第一行：行维度标题 + 列维度值
  const headerRow: string[] = [...config.rowFields.map(f => {
    const meta = fieldMetas.find(m => m.id === f);
    return meta?.name || f;
  })];
  
  // 如果有列维度，展开列
  if (config.columnFields.length > 0 && columnValues[0]) {
    columnValues[0].forEach(colVal => {
      config.valueFields.forEach(vf => {
        const meta = fieldMetas.find(m => m.id === vf.field);
        const aggLabel = getAggregationLabel(vf.aggregation);
        headerRow.push(`${colVal} - ${meta?.name || vf.field}(${aggLabel})`);
      });
    });
  } else {
    // 没有列维度，直接显示数值字段
    config.valueFields.forEach(vf => {
      const meta = fieldMetas.find(m => m.id === vf.field);
      const aggLabel = getAggregationLabel(vf.aggregation);
      headerRow.push(`${meta?.name || vf.field}(${aggLabel})`);
    });
  }
  
  if (config.showRowTotals) {
    config.valueFields.forEach(vf => {
      const meta = fieldMetas.find(m => m.id === vf.field);
      headerRow.push(`合计 - ${meta?.name || vf.field}`);
    });
  }
  
  headers.push(headerRow);
  
  // 生成数据行
  const rows: PivotCell[][] = [];
  const sortedRowKeys = Array.from(rowGroups.keys()).sort();
  
  // 用于计算列合计
  const columnTotals: Map<string, number[]> = new Map();
  
  sortedRowKeys.forEach(rowKey => {
    const rowData = rowGroups.get(rowKey)!;
    const rowValues = rowKey.split('|||');
    const row: PivotCell[] = [];
    
    // 添加行维度值
    rowValues.forEach(val => {
      row.push({ value: val });
    });
    
    // 计算每个列+值组合的聚合值
    if (config.columnFields.length > 0 && columnValues[0]) {
      columnValues[0].forEach(colVal => {
        const colFilteredData = rowData.filter(r => String(r[config.columnFields[0]]) === colVal);
        
        config.valueFields.forEach(vf => {
          const values = colFilteredData.map(r => Number(r[vf.field]) || 0);
          const aggValue = aggregateFunctions[vf.aggregation](values);
          row.push({ value: aggValue });
          
          // 累加到列合计
          const colKey = `${colVal}-${vf.field}`;
          if (!columnTotals.has(colKey)) {
            columnTotals.set(colKey, []);
          }
          columnTotals.get(colKey)!.push(aggValue);
        });
      });
    } else {
      // 没有列维度
      config.valueFields.forEach(vf => {
        const values = rowData.map(r => Number(r[vf.field]) || 0);
        const aggValue = aggregateFunctions[vf.aggregation](values);
        row.push({ value: aggValue });
        
        // 累加到列合计
        const colKey = `total-${vf.field}`;
        if (!columnTotals.has(colKey)) {
          columnTotals.set(colKey, []);
        }
        columnTotals.get(colKey)!.push(aggValue);
      });
    }
    
    // 行合计
    if (config.showRowTotals) {
      config.valueFields.forEach(vf => {
        const values = rowData.map(r => Number(r[vf.field]) || 0);
        const aggValue = aggregateFunctions[vf.aggregation](values);
        row.push({ value: aggValue, isTotal: true });
      });
    }
    
    rows.push(row);
  });
  
  // 添加列合计行
  if (config.showColumnTotals && rows.length > 0) {
    const totalRow: PivotCell[] = [];
    
    // 行维度列显示"合计"
    config.rowFields.forEach((_, index) => {
      totalRow.push({ 
        value: index === 0 ? '合计' : '', 
        isTotal: true 
      });
    });
    
    // 计算每列的合计
    if (config.columnFields.length > 0 && columnValues[0]) {
      columnValues[0].forEach(colVal => {
        config.valueFields.forEach(vf => {
          const colKey = `${colVal}-${vf.field}`;
          const values = columnTotals.get(colKey) || [];
          const total = aggregateFunctions.sum(values);
          totalRow.push({ value: total, isTotal: true });
        });
      });
    } else {
      config.valueFields.forEach(vf => {
        const colKey = `total-${vf.field}`;
        const values = columnTotals.get(colKey) || [];
        const total = aggregateFunctions.sum(values);
        totalRow.push({ value: total, isTotal: true });
      });
    }
    
    // 行合计列的合计
    if (config.showRowTotals) {
      config.valueFields.forEach(vf => {
        const allValues = filteredData.map(r => Number(r[vf.field]) || 0);
        const total = aggregateFunctions.sum(allValues);
        totalRow.push({ value: total, isTotal: true, isGrandTotal: true });
      });
    }
    
    rows.push(totalRow);
  }
  
  return { headers, rows, columnValues };
};

// 获取聚合方式标签
export const getAggregationLabel = (agg: AggregationType): string => {
  const labels: Record<AggregationType, string> = {
    sum: '求和',
    avg: '平均值',
    max: '最大值',
    min: '最小值',
    count: '计数',
  };
  return labels[agg];
};

// 格式化数值
export const formatPivotValue = (value: number | string, decimals: number = 2): string => {
  if (typeof value === 'string') return value;
  if (value === 0) return '0';
  return value.toFixed(decimals);
};

// 导出到Excel格式的数据
export const exportToExcelData = (result: PivotResult): any[][] => {
  const excelData: any[][] = [];
  
  // 添加表头
  result.headers.forEach(headerRow => {
    excelData.push(headerRow);
  });
  
  // 添加数据行
  result.rows.forEach(row => {
    excelData.push(row.map(cell => cell.value));
  });
  
  return excelData;
};

// 默认配置
export const createDefaultPivotConfig = (dataSourceId: string): PivotConfig => ({
  dataSourceId,
  rowFields: [],
  columnFields: [],
  valueFields: [],
  filters: [],
  showRowTotals: true,
  showColumnTotals: true,
  showGrandTotal: true,
});

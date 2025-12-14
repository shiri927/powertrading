import { useState, useMemo, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Download, Save, RefreshCw, Settings2, FileText, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

import FieldPanel from '@/components/reports/FieldPanel';
import ConfigZone from '@/components/reports/ConfigZone';
import PivotTable from '@/components/reports/PivotTable';
import ReportTemplateList, { ReportTemplate } from '@/components/reports/ReportTemplateList';
import {
  DATA_SOURCES,
  DataSource,
  FieldMeta,
  getDataSourceById,
  generateSettlementData,
  generateTradingData,
  AggregationType,
} from '@/lib/reports/data-sources';
import {
  PivotConfig,
  PivotResult,
  ValueFieldConfig,
  FilterConfig,
  calculatePivot,
  createDefaultPivotConfig,
  exportToExcelData,
} from '@/lib/reports/pivot-engine';
import { supabase } from '@/integrations/supabase/client';

// 预设报表模板
const PRESET_TEMPLATES: ReportTemplate[] = [
  {
    id: 'settlement-detail',
    name: '结算分类明细报表',
    description: '按分类和交易类型汇总结算数据',
    isPreset: true,
    createdAt: new Date().toISOString(),
    config: {
      dataSourceId: 'settlement_data',
      rowFields: ['category', 'trade_type', 'item_name'],
      columnFields: [],
      valueFields: [
        { field: 'volume', aggregation: 'sum' },
        { field: 'income_no_subsidy', aggregation: 'sum' },
        { field: 'income_with_subsidy', aggregation: 'sum' },
      ],
      filters: [],
      showRowTotals: true,
      showColumnTotals: true,
      showGrandTotal: true,
    },
  },
  {
    id: 'price-trend',
    name: '日电价趋势分析',
    description: '按省份和日期分析电价趋势',
    isPreset: true,
    createdAt: new Date().toISOString(),
    config: {
      dataSourceId: 'market_clearing_prices',
      rowFields: ['province', 'price_date'],
      columnFields: [],
      valueFields: [
        { field: 'day_ahead_price', aggregation: 'avg' },
        { field: 'realtime_price', aggregation: 'avg' },
      ],
      filters: [],
      showRowTotals: true,
      showColumnTotals: true,
      showGrandTotal: true,
    },
  },
  {
    id: 'trading-summary',
    name: '交易数据汇总',
    description: '按交易中心和品种汇总交易量',
    isPreset: true,
    createdAt: new Date().toISOString(),
    config: {
      dataSourceId: 'trading_data',
      rowFields: ['trading_center', 'trade_type'],
      columnFields: ['direction'],
      valueFields: [
        { field: 'contract_volume', aggregation: 'sum' },
        { field: 'profit', aggregation: 'sum' },
      ],
      filters: [],
      showRowTotals: true,
      showColumnTotals: true,
      showGrandTotal: true,
    },
  },
];

const ReportManagement = () => {
  const { toast } = useToast();
  
  // 状态管理
  const [templates, setTemplates] = useState<ReportTemplate[]>(PRESET_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [config, setConfig] = useState<PivotConfig>(createDefaultPivotConfig('settlement_data'));
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showDesigner, setShowDesigner] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // 获取当前数据源
  const currentDataSource = useMemo(() => 
    getDataSourceById(config.dataSourceId) || null, 
    [config.dataSourceId]
  );
  
  // 获取已使用的字段
  const usedFields = useMemo(() => [
    ...config.rowFields,
    ...config.columnFields,
    ...config.valueFields.map(v => v.field),
    ...config.filters.map(f => f.field),
  ], [config]);
  
  // 获取字段元数据
  const getFieldMeta = useCallback((fieldId: string): FieldMeta | undefined => {
    return currentDataSource?.fields.find(f => f.id === fieldId);
  }, [currentDataSource]);
  
  // 获取数据
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (config.dataSourceId === 'market_clearing_prices') {
        const { data, error } = await supabase
          .from('market_clearing_prices')
          .select('*')
          .order('price_date', { ascending: false })
          .limit(1000);
        
        if (error) throw error;
        setRawData(data || []);
      } else if (config.dataSourceId === 'settlement_data') {
        setRawData(generateSettlementData());
      } else if (config.dataSourceId === 'trading_data') {
        setRawData(generateTradingData());
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: '数据加载失败',
        description: '请检查网络连接后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [config.dataSourceId, toast]);
  
  // 初始加载数据
  useState(() => {
    loadData();
  });
  
  // 计算透视表结果
  const pivotResult = useMemo<PivotResult | null>(() => {
    if (!currentDataSource || rawData.length === 0 || config.valueFields.length === 0) {
      return null;
    }
    return calculatePivot(rawData, config, currentDataSource.fields);
  }, [rawData, config, currentDataSource]);
  
  // 拖拽事件处理
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    
    if (!over) return;
    
    const fieldId = active.id as string;
    const dropZone = over.id as string;
    const fieldData = active.data.current?.field as FieldMeta;
    
    if (!fieldData) return;
    
    // 检查字段是否已在其他区域使用
    const isUsed = usedFields.includes(fieldId);
    if (isUsed) {
      toast({
        title: '字段已使用',
        description: '请先从其他区域移除该字段',
      });
      return;
    }
    
    switch (dropZone) {
      case 'row-zone':
        if (fieldData.fieldType === 'dimension') {
          setConfig(prev => ({
            ...prev,
            rowFields: [...prev.rowFields, fieldId],
          }));
        } else {
          toast({ title: '仅维度字段可添加到行维度' });
        }
        break;
      case 'column-zone':
        if (fieldData.fieldType === 'dimension') {
          setConfig(prev => ({
            ...prev,
            columnFields: [...prev.columnFields, fieldId],
          }));
        } else {
          toast({ title: '仅维度字段可添加到列维度' });
        }
        break;
      case 'value-zone':
        if (fieldData.fieldType === 'measure') {
          setConfig(prev => ({
            ...prev,
            valueFields: [...prev.valueFields, { field: fieldId, aggregation: 'sum' }],
          }));
        } else {
          toast({ title: '仅度量字段可添加到数值区域' });
        }
        break;
      case 'filter-zone':
        setConfig(prev => ({
          ...prev,
          filters: [...prev.filters, { field: fieldId, operator: 'eq', value: '' }],
        }));
        break;
    }
  };
  
  // 移除字段
  const handleRemoveRowField = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      rowFields: prev.rowFields.filter(f => f !== fieldId),
    }));
  };
  
  const handleRemoveColumnField = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      columnFields: prev.columnFields.filter(f => f !== fieldId),
    }));
  };
  
  const handleRemoveValueField = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      valueFields: prev.valueFields.filter(v => v.field !== fieldId),
    }));
  };
  
  const handleRemoveFilter = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.field !== fieldId),
    }));
  };
  
  const handleValueAggregationChange = (fieldId: string, aggregation: AggregationType) => {
    setConfig(prev => ({
      ...prev,
      valueFields: prev.valueFields.map(v =>
        v.field === fieldId ? { ...v, aggregation } : v
      ),
    }));
  };
  
  // 数据源切换
  const handleDataSourceChange = (dataSourceId: string) => {
    setConfig(createDefaultPivotConfig(dataSourceId));
    setActiveTemplateId(null);
    loadData();
  };
  
  // 模板操作
  const handleSelectTemplate = (template: ReportTemplate) => {
    setActiveTemplateId(template.id);
    setConfig(template.config);
    loadData();
  };
  
  const handleCreateNewTemplate = () => {
    const newTemplate: ReportTemplate = {
      id: `custom-${Date.now()}`,
      name: '新建报表',
      createdAt: new Date().toISOString(),
      config: createDefaultPivotConfig('settlement_data'),
    };
    setTemplates(prev => [...prev, newTemplate]);
    setActiveTemplateId(newTemplate.id);
    setConfig(newTemplate.config);
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    if (activeTemplateId === templateId) {
      setActiveTemplateId(null);
      setConfig(createDefaultPivotConfig('settlement_data'));
    }
  };
  
  const handleRenameTemplate = (templateId: string, newName: string) => {
    setTemplates(prev =>
      prev.map(t => t.id === templateId ? { ...t, name: newName } : t)
    );
  };
  
  const handleSaveTemplate = () => {
    if (activeTemplateId) {
      setTemplates(prev =>
        prev.map(t => t.id === activeTemplateId ? { ...t, config } : t)
      );
      toast({ title: '报表已保存' });
    } else {
      const newTemplate: ReportTemplate = {
        id: `custom-${Date.now()}`,
        name: '新建报表',
        createdAt: new Date().toISOString(),
        config,
      };
      setTemplates(prev => [...prev, newTemplate]);
      setActiveTemplateId(newTemplate.id);
      toast({ title: '报表已保存' });
    }
  };
  
  // 导出Excel
  const handleExport = () => {
    if (!pivotResult) {
      toast({ title: '暂无数据可导出' });
      return;
    }
    
    const excelData = exportToExcelData(pivotResult);
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '报表');
    XLSX.writeFile(wb, `报表_${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    toast({ title: '导出成功' });
  };
  
  // 获取拖拽中的字段
  const activeDragField = activeDragId
    ? currentDataSource?.fields.find(f => f.id === activeDragId)
    : null;
  
  return (
    <div className="h-full flex">
      {/* 左侧模板列表 */}
      <div className="w-64 border-r bg-gray-50/50 p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          报表模板
        </h2>
        <ReportTemplateList
          templates={templates}
          activeTemplateId={activeTemplateId}
          onSelect={handleSelectTemplate}
          onDelete={handleDeleteTemplate}
          onRename={handleRenameTemplate}
          onCreateNew={handleCreateNewTemplate}
        />
      </div>
      
      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 工具栏 */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
          <div className="flex items-center gap-4">
            <Select value={config.dataSourceId} onValueChange={handleDataSourceChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择数据源" />
              </SelectTrigger>
              <SelectContent>
                {DATA_SOURCES.map(ds => (
                  <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Switch
                id="show-designer"
                checked={showDesigner}
                onCheckedChange={setShowDesigner}
              />
              <Label htmlFor="show-designer" className="text-sm flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5" />
                设计器
              </Label>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-1.5" />
              保存
            </Button>
            <Button size="sm" onClick={handleExport} className="bg-[#00B04D] hover:bg-[#009040]">
              <Download className="h-4 w-4 mr-1.5" />
              导出Excel
            </Button>
          </div>
        </div>
        
        {/* 设计器和预览区 */}
        <div className="flex-1 overflow-hidden flex">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {/* 字段面板 */}
            {showDesigner && (
              <div className="w-56 border-r bg-white p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  可用字段
                </h3>
                <FieldPanel dataSource={currentDataSource} usedFields={usedFields} />
              </div>
            )}
            
            {/* 配置区和预览区 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 配置区域 */}
              {showDesigner && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">报表配置</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ConfigZone
                      rowFields={config.rowFields.map(id => getFieldMeta(id)!).filter(Boolean)}
                      columnFields={config.columnFields.map(id => getFieldMeta(id)!).filter(Boolean)}
                      valueFields={config.valueFields.map(v => ({
                        field: getFieldMeta(v.field)!,
                        config: v,
                      })).filter(v => v.field)}
                      filters={config.filters}
                      onRemoveRowField={handleRemoveRowField}
                      onRemoveColumnField={handleRemoveColumnField}
                      onRemoveValueField={handleRemoveValueField}
                      onRemoveFilter={handleRemoveFilter}
                      onValueAggregationChange={handleValueAggregationChange}
                    />
                    
                    {/* 显示选项 */}
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="show-row-totals"
                          checked={config.showRowTotals}
                          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showRowTotals: checked }))}
                        />
                        <Label htmlFor="show-row-totals" className="text-xs">行合计</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="show-column-totals"
                          checked={config.showColumnTotals}
                          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showColumnTotals: checked }))}
                        />
                        <Label htmlFor="show-column-totals" className="text-xs">列合计</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* 预览区域 */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">报表预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <PivotTable result={pivotResult} decimals={4} />
                </CardContent>
              </Card>
            </div>
            
            {/* 拖拽覆盖层 */}
            <DragOverlay>
              {activeDragField && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md shadow-lg border border-[#00B04D] text-sm">
                  {activeDragField.name}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;

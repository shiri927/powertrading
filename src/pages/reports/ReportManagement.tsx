import { useState, useMemo, useCallback, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Download, Save, RefreshCw, Settings2, FileText, LayoutGrid, Loader2 } from 'lucide-react';
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
  FieldMeta,
  getDataSourceById,
  generateSettlementData,
  generateTradingData,
  AggregationType,
} from '@/lib/reports/data-sources';
import {
  PivotConfig,
  PivotResult,
  calculatePivot,
  createDefaultPivotConfig,
  exportToExcelData,
} from '@/lib/reports/pivot-engine';
import { supabase } from '@/integrations/supabase/client';

const ReportManagement = () => {
  const { toast } = useToast();
  
  // 状态管理
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [config, setConfig] = useState<PivotConfig>(createDefaultPivotConfig('settlement_data'));
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showDesigner, setShowDesigner] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // 获取当前用户
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // 从数据库加载模板
  const loadTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('is_preset', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const loadedTemplates: ReportTemplate[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description || undefined,
        config: row.config as unknown as PivotConfig,
        isPreset: row.is_preset,
        createdAt: row.created_at,
        userId: row.user_id,
      }));
      
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: '加载模板失败',
        description: '请检查网络连接后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [toast]);
  
  // 初始加载模板
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);
  
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
  useEffect(() => {
    loadData();
  }, []);
  
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
  
  const handleCreateNewTemplate = async () => {
    if (!currentUserId) {
      toast({
        title: '请先登录',
        description: '登录后即可创建和保存报表模板',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const newConfig = createDefaultPivotConfig('settlement_data');
      const { data, error } = await supabase
        .from('report_templates')
        .insert([{
          user_id: currentUserId,
          name: '新建报表',
          config: JSON.parse(JSON.stringify(newConfig)),
          is_preset: false,
          is_shared: false,
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newTemplate: ReportTemplate = {
        id: data.id,
        name: data.name,
        config: data.config as unknown as PivotConfig,
        createdAt: data.created_at,
        isPreset: false,
        userId: data.user_id,
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      setActiveTemplateId(newTemplate.id);
      setConfig(newTemplate.config);
      
      toast({ title: '报表已创建' });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: '创建失败',
        description: '请检查网络连接后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isPreset) {
      toast({ title: '预设模板不可删除' });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
      
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      if (activeTemplateId === templateId) {
        setActiveTemplateId(null);
        setConfig(createDefaultPivotConfig('settlement_data'));
      }
      
      toast({ title: '模板已删除' });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: '删除失败',
        variant: 'destructive',
      });
    }
  };
  
  const handleRenameTemplate = async (templateId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('report_templates')
        .update({ name: newName })
        .eq('id', templateId);
      
      if (error) throw error;
      
      setTemplates(prev =>
        prev.map(t => t.id === templateId ? { ...t, name: newName } : t)
      );
    } catch (error) {
      console.error('Error renaming template:', error);
      toast({
        title: '重命名失败',
        variant: 'destructive',
      });
    }
  };
  
  const handleSaveTemplate = async () => {
    if (!currentUserId) {
      toast({
        title: '请先登录',
        description: '登录后即可保存报表模板',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      if (activeTemplateId) {
        // 更新现有模板
        const template = templates.find(t => t.id === activeTemplateId);
        if (template?.isPreset) {
          // 预设模板另存为新模板
          const { data, error } = await supabase
            .from('report_templates')
            .insert([{
              user_id: currentUserId,
              name: `${template.name} (副本)`,
              description: template.description,
              config: JSON.parse(JSON.stringify(config)),
              is_preset: false,
              is_shared: false,
            }])
            .select()
            .single();
          
          if (error) throw error;
          
          const newTemplate: ReportTemplate = {
            id: data.id,
            name: data.name,
            description: data.description || undefined,
            config: data.config as unknown as PivotConfig,
            createdAt: data.created_at,
            isPreset: false,
            userId: data.user_id,
          };
          
          setTemplates(prev => [...prev, newTemplate]);
          setActiveTemplateId(newTemplate.id);
          toast({ title: '已另存为新模板' });
        } else {
          // 更新自定义模板
          const { error } = await supabase
            .from('report_templates')
            .update({ config: JSON.parse(JSON.stringify(config)) })
            .eq('id', activeTemplateId);
          
          if (error) throw error;
          
          setTemplates(prev =>
            prev.map(t => t.id === activeTemplateId ? { ...t, config } : t)
          );
          toast({ title: '报表已保存' });
        }
      } else {
        // 创建新模板
        const { data, error } = await supabase
          .from('report_templates')
          .insert([{
            user_id: currentUserId,
            name: '新建报表',
            config: JSON.parse(JSON.stringify(config)),
            is_preset: false,
            is_shared: false,
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        const newTemplate: ReportTemplate = {
          id: data.id,
          name: data.name,
          config: data.config as unknown as PivotConfig,
          createdAt: data.created_at,
          isPreset: false,
          userId: data.user_id,
        };
        
        setTemplates(prev => [...prev, newTemplate]);
        setActiveTemplateId(newTemplate.id);
        toast({ title: '报表已保存' });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: '保存失败',
        description: '请检查网络连接后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
        {isLoadingTemplates ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ReportTemplateList
            templates={templates}
            activeTemplateId={activeTemplateId}
            onSelect={handleSelectTemplate}
            onDelete={handleDeleteTemplate}
            onRename={handleRenameTemplate}
            onCreateNew={handleCreateNewTemplate}
          />
        )}
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
            <Button variant="outline" size="sm" onClick={handleSaveTemplate} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
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

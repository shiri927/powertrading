import { useState, useEffect } from 'react';
import { TradingStrategy, PRESET_STRATEGIES } from '@/lib/trading/strategy-types';
import { StrategyCard } from '@/components/strategy/StrategyCard';
import { StrategyEditor } from '@/components/strategy/StrategyEditor';
import { StrategyFlowDiagram } from '@/components/strategy/StrategyFlowDiagram';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FileDown, FileUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTradingStrategies } from '@/hooks/useTradingStrategies';
import { useTradingStore } from '@/store/tradingStore';

export const StrategyConfigTab = () => {
  const { 
    strategies: dbStrategies, 
    isLoading, 
    createStrategy: dbCreateStrategy, 
    updateStrategy: dbUpdateStrategy, 
    deleteStrategy: dbDeleteStrategy,
    toggleActive: dbToggleActive,
  } = useTradingStrategies();
  
  // 同步到 Zustand store
  const { setStrategies } = useTradingStore();
  
  useEffect(() => {
    if (dbStrategies.length > 0) {
      setStrategies(dbStrategies);
    }
  }, [dbStrategies, setStrategies]);

  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(
    dbStrategies.length > 0 ? dbStrategies[0] : null
  );
  const [editMode, setEditMode] = useState<'view' | 'edit' | 'create'>('view');

  // 当策略列表变化时，更新选中策略
  useEffect(() => {
    if (selectedStrategy) {
      const updated = dbStrategies.find(s => s.id === selectedStrategy.id);
      if (updated) {
        setSelectedStrategy(updated);
      }
    } else if (dbStrategies.length > 0 && !selectedStrategy) {
      setSelectedStrategy(dbStrategies[0]);
    }
  }, [dbStrategies]);

  const handleSaveStrategy = async (strategy: TradingStrategy) => {
    if (editMode === 'create') {
      const newStrategy = await dbCreateStrategy(strategy);
      if (newStrategy) {
        setSelectedStrategy(newStrategy);
      }
    } else {
      const success = await dbUpdateStrategy(strategy.id, strategy);
      if (success) {
        setSelectedStrategy(strategy);
      }
    }
    setEditMode('view');
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    const success = await dbDeleteStrategy(strategyId);
    if (success) {
      setSelectedStrategy(null);
      setEditMode('view');
    }
  };

  const handleToggleActive = async (strategy: TradingStrategy) => {
    const success = await dbToggleActive(strategy.id);
    if (success) {
      const updatedStrategy = { ...strategy, isActive: !strategy.isActive };
      setSelectedStrategy(updatedStrategy);
    }
  };

  const handleCreateNew = () => {
    setSelectedStrategy(null);
    setEditMode('create');
  };

  const handleExportStrategies = () => {
    const dataStr = JSON.stringify(dbStrategies, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `strategies_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    toast.success('策略导出成功');
  };

  const handleImportStrategies = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string) as TradingStrategy[];
            let successCount = 0;
            for (const strategy of imported) {
              const result = await dbCreateStrategy(strategy);
              if (result) successCount++;
            }
            toast.success('策略导入成功', {
              description: `已导入 ${successCount} 个策略`,
            });
          } catch (error) {
            toast.error('导入失败', {
              description: '文件格式不正确',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">加载策略中...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 左侧策略库 (30%) */}
      <div className="lg:col-span-1 space-y-4">
        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button 
            onClick={handleCreateNew}
            className="flex-1"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            新建策略
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleExportStrategies}
            className="flex-1"
            size="sm"
          >
            <FileDown className="h-4 w-4 mr-1" />
            导出
          </Button>
          <Button 
            variant="outline"
            onClick={handleImportStrategies}
            className="flex-1"
            size="sm"
          >
            <FileUp className="h-4 w-4 mr-1" />
            导入
          </Button>
        </div>

        {/* 策略列表 */}
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3 pr-4">
            {dbStrategies.map(strategy => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                isActive={selectedStrategy?.id === strategy.id}
                onView={(s) => {
                  setSelectedStrategy(s);
                  setEditMode('view');
                }}
                onEdit={(s) => {
                  setSelectedStrategy(s);
                  setEditMode('edit');
                }}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧详情区 (70%) */}
      <div className="lg:col-span-3">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="pr-4 space-y-6">
            {editMode === 'view' && selectedStrategy ? (
              <>
                {/* 查看模式 - 显示策略详情和流程图 */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStrategy.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedStrategy.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => setEditMode('edit')}
                  >
                    编辑策略
                  </Button>
                </div>

                <StrategyFlowDiagram strategy={selectedStrategy} />
              </>
            ) : (
              <>
                {/* 编辑/创建模式 - 显示表单 */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    {editMode === 'create' ? '创建新策略' : '编辑策略'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editMode === 'create' 
                      ? '配置策略参数，创建自定义交易策略'
                      : '修改策略配置，优化交易表现'
                    }
                  </p>
                </div>

                <StrategyEditor
                  strategy={editMode === 'edit' ? selectedStrategy : undefined}
                  onSave={handleSaveStrategy}
                  onDelete={editMode === 'edit' ? handleDeleteStrategy : undefined}
                  onCancel={() => {
                    setEditMode('view');
                    if (dbStrategies.length > 0) {
                      setSelectedStrategy(dbStrategies[0]);
                    }
                  }}
                />
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

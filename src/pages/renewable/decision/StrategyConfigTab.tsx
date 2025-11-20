import { useState, useEffect } from 'react';
import { TradingStrategy, PRESET_STRATEGIES } from '@/lib/trading/strategy-types';
import { StrategyCard } from '@/components/strategy/StrategyCard';
import { StrategyEditor } from '@/components/strategy/StrategyEditor';
import { StrategyFlowDiagram } from '@/components/strategy/StrategyFlowDiagram';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FileDown, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { useTradingStore } from '@/store/tradingStore';

export const StrategyConfigTab = () => {
  const { strategies, setStrategies, addStrategy, updateStrategy, deleteStrategy, toggleStrategyActive } = useTradingStore();
  
  // 初始化策略（仅首次）
  useEffect(() => {
    if (strategies.length === 0) {
      const initialStrategies = PRESET_STRATEGIES.map((s, i) => ({
        ...s,
        id: `preset_${i}`,
        isActive: i === 0,
      }));
      setStrategies(initialStrategies);
    }
  }, []);

  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(
    strategies.length > 0 ? strategies[0] : null
  );
  const [editMode, setEditMode] = useState<'view' | 'edit' | 'create'>('view');

  // 当策略列表变化时，更新选中策略
  useEffect(() => {
    if (selectedStrategy) {
      const updated = strategies.find(s => s.id === selectedStrategy.id);
      if (updated) {
        setSelectedStrategy(updated);
      }
    } else if (strategies.length > 0 && !selectedStrategy) {
      setSelectedStrategy(strategies[0]);
    }
  }, [strategies]);

  const handleSaveStrategy = (strategy: TradingStrategy) => {
    if (editMode === 'create') {
      addStrategy(strategy);
      toast.success('策略创建成功', {
        description: `策略"${strategy.name}"已添加到策略库`,
      });
    } else {
      updateStrategy(strategy.id, strategy);
      toast.success('策略保存成功', {
        description: `策略"${strategy.name}"已更新`,
      });
    }
    setSelectedStrategy(strategy);
    setEditMode('view');
  };

  const handleDeleteStrategy = (strategyId: string) => {
    deleteStrategy(strategyId);
    setSelectedStrategy(null);
    setEditMode('view');
    toast.success('策略已删除');
  };

  const handleToggleActive = (strategy: TradingStrategy) => {
    toggleStrategyActive(strategy.id);
    
    const updatedStrategy = { ...strategy, isActive: !strategy.isActive };
    setSelectedStrategy(updatedStrategy);
    
    if (updatedStrategy.isActive) {
      toast.success('策略已启用', {
        description: `策略"${strategy.name}"开始运行`,
      });
    } else {
      toast.info('策略已暂停', {
        description: `策略"${strategy.name}"已停止运行`,
      });
    }
  };

  const handleCreateNew = () => {
    setSelectedStrategy(null);
    setEditMode('create');
  };

  const handleExportStrategies = () => {
    const dataStr = JSON.stringify(strategies, null, 2);
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
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string);
            setStrategies([...strategies, ...imported]);
            toast.success('策略导入成功', {
              description: `已导入 ${imported.length} 个策略`,
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
            {strategies.map(strategy => (
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
                    if (strategies.length > 0) {
                      setSelectedStrategy(strategies[0]);
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

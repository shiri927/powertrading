import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface DataItem {
  id: string;
  name: string;
  category: 'green' | 'steel';
  enabled: boolean;
  order: number;
  color: string;
}

interface DashboardConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DataItem[];
  onItemsChange: (items: DataItem[]) => void;
}

const SortableDataItem = ({
  item,
  onToggle,
}: {
  item: DataItem;
  onToggle: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div
        className="w-4 h-4 rounded"
        style={{ backgroundColor: item.color }}
      />
      <span className="flex-1 font-medium">{item.name}</span>
      <Switch
        checked={item.enabled}
        onCheckedChange={() => onToggle(item.id)}
      />
    </div>
  );
};

export const DashboardConfigDialog = ({
  open,
  onOpenChange,
  items,
  onItemsChange,
}: DashboardConfigDialogProps) => {
  const [localItems, setLocalItems] = useState(items);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setLocalItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
    }
  };

  const handleToggle = (id: string) => {
    setLocalItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleSave = () => {
    onItemsChange(localItems);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalItems(items);
    onOpenChange(false);
  };

  // Sync when dialog opens
  useState(() => {
    if (open) {
      setLocalItems(items);
    }
  });

  const greenItems = localItems.filter((item) => item.category === 'green');
  const steelItems = localItems.filter((item) => item.category === 'steel');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>看板调整</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Green data items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">彩绿数据版块</h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={greenItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {greenItems.map((item) => (
                    <SortableDataItem
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Steel data items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">影钢数据版块</h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steelItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {steelItems.map((item) => (
                    <SortableDataItem
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

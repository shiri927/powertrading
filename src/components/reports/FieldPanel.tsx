import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { BarChart3, Hash, Calendar, Type, GripVertical } from 'lucide-react';
import { FieldMeta, DataSource } from '@/lib/reports/data-sources';
import { cn } from '@/lib/utils';

interface DraggableFieldProps {
  field: FieldMeta;
  isUsed?: boolean;
}

const DraggableField = ({ field, isUsed }: DraggableFieldProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: field.id,
    data: { field },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const getFieldIcon = () => {
    if (field.fieldType === 'measure') {
      return <BarChart3 className="h-3.5 w-3.5 text-[#00B04D]" />;
    }
    switch (field.dataType) {
      case 'date':
        return <Calendar className="h-3.5 w-3.5 text-blue-500" />;
      case 'number':
        return <Hash className="h-3.5 w-3.5 text-orange-500" />;
      default:
        return <Type className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm cursor-grab",
        "border transition-all duration-200",
        isDragging && "opacity-50 shadow-lg z-50",
        isUsed 
          ? "bg-gray-100 border-gray-200 text-gray-400" 
          : "bg-white border-gray-200 hover:border-[#00B04D] hover:bg-[#F8FBFA]"
      )}
    >
      <GripVertical className="h-3 w-3 text-gray-400" />
      {getFieldIcon()}
      <span className={cn(isUsed && "line-through")}>{field.name}</span>
    </div>
  );
};

interface FieldPanelProps {
  dataSource: DataSource | null;
  usedFields: string[];
}

const FieldPanel = ({ dataSource, usedFields }: FieldPanelProps) => {
  if (!dataSource) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        请先选择数据源
      </div>
    );
  }

  const dimensionFields = dataSource.fields.filter(f => f.fieldType === 'dimension');
  const measureFields = dataSource.fields.filter(f => f.fieldType === 'measure');

  return (
    <div className="space-y-4">
      {/* 维度字段 */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5" />
          维度字段
        </h4>
        <div className="space-y-1.5">
          {dimensionFields.map(field => (
            <DraggableField 
              key={field.id} 
              field={field} 
              isUsed={usedFields.includes(field.id)}
            />
          ))}
        </div>
      </div>

      {/* 度量字段 */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" />
          度量字段
        </h4>
        <div className="space-y-1.5">
          {measureFields.map(field => (
            <DraggableField 
              key={field.id} 
              field={field}
              isUsed={usedFields.includes(field.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldPanel;

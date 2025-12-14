import { useDroppable } from '@dnd-kit/core';
import { X, Rows3, Columns3, Calculator, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldMeta, AggregationType } from '@/lib/reports/data-sources';
import { ValueFieldConfig, FilterConfig, getAggregationLabel } from '@/lib/reports/pivot-engine';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DroppableZoneProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isEmpty: boolean;
}

const DroppableZone = ({ id, title, icon, children, isEmpty }: DroppableZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border-2 border-dashed p-3 min-h-[80px] transition-all duration-200",
        isOver ? "border-[#00B04D] bg-[#F1F8F4]" : "border-gray-200 bg-gray-50/50",
        isEmpty && "flex items-center justify-center"
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
        {icon}
        {title}
      </div>
      {isEmpty ? (
        <p className="text-xs text-muted-foreground text-center">
          拖拽字段到此处
        </p>
      ) : (
        <div className="space-y-1.5">{children}</div>
      )}
    </div>
  );
};

interface FieldTagProps {
  field: FieldMeta;
  onRemove: () => void;
  aggregation?: AggregationType;
  onAggregationChange?: (agg: AggregationType) => void;
  showAggregation?: boolean;
}

const FieldTag = ({ field, onRemove, aggregation, onAggregationChange, showAggregation }: FieldTagProps) => {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-gray-200 text-sm">
      <span className="flex-1">{field.name}</span>
      {showAggregation && onAggregationChange && (
        <Select value={aggregation} onValueChange={(v) => onAggregationChange(v as AggregationType)}>
          <SelectTrigger className="h-5 w-16 text-xs border-0 bg-[#F1F8F4] px-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sum">求和</SelectItem>
            <SelectItem value="avg">平均值</SelectItem>
            <SelectItem value="max">最大值</SelectItem>
            <SelectItem value="min">最小值</SelectItem>
            <SelectItem value="count">计数</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 hover:bg-red-100 hover:text-red-500"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

interface ConfigZoneProps {
  rowFields: FieldMeta[];
  columnFields: FieldMeta[];
  valueFields: { field: FieldMeta; config: ValueFieldConfig }[];
  filters: FilterConfig[];
  onRemoveRowField: (fieldId: string) => void;
  onRemoveColumnField: (fieldId: string) => void;
  onRemoveValueField: (fieldId: string) => void;
  onRemoveFilter: (fieldId: string) => void;
  onValueAggregationChange: (fieldId: string, aggregation: AggregationType) => void;
}

const ConfigZone = ({
  rowFields,
  columnFields,
  valueFields,
  filters,
  onRemoveRowField,
  onRemoveColumnField,
  onRemoveValueField,
  onRemoveFilter,
  onValueAggregationChange,
}: ConfigZoneProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 行维度 */}
      <DroppableZone
        id="row-zone"
        title="行维度"
        icon={<Rows3 className="h-3.5 w-3.5" />}
        isEmpty={rowFields.length === 0}
      >
        {rowFields.map(field => (
          <FieldTag
            key={field.id}
            field={field}
            onRemove={() => onRemoveRowField(field.id)}
          />
        ))}
      </DroppableZone>

      {/* 列维度 */}
      <DroppableZone
        id="column-zone"
        title="列维度"
        icon={<Columns3 className="h-3.5 w-3.5" />}
        isEmpty={columnFields.length === 0}
      >
        {columnFields.map(field => (
          <FieldTag
            key={field.id}
            field={field}
            onRemove={() => onRemoveColumnField(field.id)}
          />
        ))}
      </DroppableZone>

      {/* 数值字段 */}
      <DroppableZone
        id="value-zone"
        title="数值字段"
        icon={<Calculator className="h-3.5 w-3.5" />}
        isEmpty={valueFields.length === 0}
      >
        {valueFields.map(({ field, config }) => (
          <FieldTag
            key={field.id}
            field={field}
            onRemove={() => onRemoveValueField(field.id)}
            aggregation={config.aggregation}
            onAggregationChange={(agg) => onValueAggregationChange(field.id, agg)}
            showAggregation
          />
        ))}
      </DroppableZone>

      {/* 筛选条件 */}
      <DroppableZone
        id="filter-zone"
        title="筛选条件"
        icon={<Filter className="h-3.5 w-3.5" />}
        isEmpty={filters.length === 0}
      >
        {filters.map(filter => (
          <div key={filter.field} className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-gray-200 text-sm">
            <span className="flex-1">{filter.field}</span>
            <span className="text-xs text-muted-foreground">
              {filter.operator === 'eq' ? '=' : filter.operator} {String(filter.value)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 hover:bg-red-100 hover:text-red-500"
              onClick={() => onRemoveFilter(filter.field)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </DroppableZone>
    </div>
  );
};

export default ConfigZone;

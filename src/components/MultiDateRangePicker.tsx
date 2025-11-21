import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface DateRange {
  start: Date;
  end: Date;
}

interface MultiDateRangePickerProps {
  value: DateRange[];
  onChange: (ranges: DateRange[]) => void;
}

export const MultiDateRangePicker = ({ value, onChange }: MultiDateRangePickerProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempRange, setTempRange] = useState<{ start?: Date; end?: Date }>({});

  const handleAddRange = () => {
    const newRange: DateRange = {
      start: new Date(),
      end: new Date(),
    };
    onChange([...value, newRange]);
  };

  const handleRemoveRange = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setTempRange({ start: value[index].start, end: value[index].end });
  };

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (!date || editingIndex === null) return;
    
    const newTempRange = { ...tempRange, [type]: date };
    setTempRange(newTempRange);

    if (newTempRange.start && newTempRange.end) {
      const newRanges = [...value];
      newRanges[editingIndex] = {
        start: newTempRange.start,
        end: newTempRange.end,
      };
      onChange(newRanges);
      setEditingIndex(null);
      setTempRange({});
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((range, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-[#F1F8F4] px-3 py-1.5 rounded-md text-sm"
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-mono text-xs hover:bg-transparent"
                  onClick={() => handleStartEdit(index)}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {format(range.start, "yyyy-MM-dd", { locale: zhCN })} 至{" "}
                  {format(range.end, "yyyy-MM-dd", { locale: zhCN })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">选择开始日期</p>
                    <Calendar
                      mode="single"
                      selected={tempRange.start}
                      onSelect={(date) => handleDateSelect(date, 'start')}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </div>
                  {tempRange.start && (
                    <div>
                      <p className="text-sm font-medium mb-2">选择结束日期</p>
                      <Calendar
                        mode="single"
                        selected={tempRange.end}
                        onSelect={(date) => handleDateSelect(date, 'end')}
                        disabled={(date) => date < tempRange.start!}
                        className="pointer-events-auto"
                      />
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => handleRemoveRange(index)}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRange}
          className="h-auto px-3 py-1.5 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          添加日期段
        </Button>
      </div>
    </div>
  );
};

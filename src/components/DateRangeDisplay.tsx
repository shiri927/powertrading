import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";

interface DateRangeDisplayProps {
  startDate: Date;
  endDate: Date;
  lastUpdated?: Date;
  label?: string;
  className?: string;
}

export const DateRangeDisplay = ({ 
  startDate, 
  endDate, 
  lastUpdated,
  label = "数据时间",
  className = ""
}: DateRangeDisplayProps) => {
  const formatDate = (date: Date) => format(date, "yyyy-MM-dd", { locale: zhCN });
  const formatDateTime = (date: Date) => format(date, "yyyy-MM-dd HH:mm", { locale: zhCN });

  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span className="font-medium">{label}:</span>
        <span className="font-mono text-foreground">
          {formatDate(startDate)} 至 {formatDate(endDate)}
        </span>
      </div>
      {lastUpdated && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="font-medium">最后更新:</span>
          <span className="font-mono text-foreground">
            {formatDateTime(lastUpdated)}
          </span>
        </div>
      )}
    </div>
  );
};

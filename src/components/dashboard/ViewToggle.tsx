import { BarChart3, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "chart" | "table";
  onViewChange: (view: "chart" | "table") => void;
}

export const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="view-toggle">
      <button
        className={cn("view-toggle-btn", view === "chart" && "active")}
        onClick={() => onViewChange("chart")}
        title="图表视图"
      >
        <BarChart3 className="h-4 w-4" />
      </button>
      <button
        className={cn("view-toggle-btn", view === "table" && "active")}
        onClick={() => onViewChange("table")}
        title="表格视图"
      >
        <Table2 className="h-4 w-4" />
      </button>
    </div>
  );
};

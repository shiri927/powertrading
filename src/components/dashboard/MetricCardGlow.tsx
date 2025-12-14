import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardGlowProps {
  label: string;
  value: string;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export const MetricCardGlow = ({ label, value, unit, trend, trendValue }: MetricCardGlowProps) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3" />;
      case "down":
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    switch (trend) {
      case "up":
        return "text-green-400";
      case "down":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="metric-glow p-3 text-center">
      <div className="text-xs mb-1" style={{ color: "hsl(200, 15%, 60%)" }}>
        {label}
      </div>
      <div className="metric-value text-lg font-bold">
        {value}
        {unit && (
          <span className="text-xs ml-1 opacity-70">{unit}</span>
        )}
      </div>
      {trend && trendValue && (
        <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

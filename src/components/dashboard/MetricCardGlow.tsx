interface MetricCardGlowProps {
  label: string;
  value: string;
  unit?: string;
}

export const MetricCardGlow = ({ label, value, unit }: MetricCardGlowProps) => {
  return (
    <div className="metric-glow p-4 text-center">
      <div className="text-xs mb-2" style={{ color: "hsl(200, 15%, 60%)" }}>
        {label}
      </div>
      <div className="metric-value text-2xl font-bold">
        {value}
        {unit && (
          <span className="text-sm ml-1 opacity-70">{unit}</span>
        )}
      </div>
    </div>
  );
};

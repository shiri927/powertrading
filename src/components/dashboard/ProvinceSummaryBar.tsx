interface ProvinceSummary {
  name: string;
  capacity: number;
  generation: number;
  revenue: number;
}

interface ProvinceSummaryBarProps {
  provinces: ProvinceSummary[];
}

export const ProvinceSummaryBar = ({ provinces }: ProvinceSummaryBarProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 px-4 py-3" style={{ background: "hsla(200, 50%, 12%, 0.5)", borderTop: "1px solid hsla(200, 80%, 40%, 0.2)" }}>
      {provinces.map((province) => (
        <div key={province.name} className="flex items-center gap-3 px-3 py-2 rounded" style={{ background: "hsla(200, 50%, 15%, 0.5)", border: "1px solid hsla(200, 80%, 40%, 0.15)" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "hsl(149, 100%, 45%)", boxShadow: "0 0 6px hsl(149, 100%, 45%)" }} />
          <div className="flex-1">
            <div className="text-sm font-medium" style={{ color: "hsl(200, 20%, 90%)" }}>{province.name}</div>
            <div className="flex gap-3 text-xs mt-1" style={{ color: "hsl(200, 15%, 60%)" }}>
              <span>装机 <span className="font-mono text-blue-300">{province.capacity}</span>MW</span>
              <span>发电 <span className="font-mono text-green-300">{province.generation}</span>万kWh</span>
              <span>收益 <span className="font-mono text-yellow-300">{province.revenue}</span>万元</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

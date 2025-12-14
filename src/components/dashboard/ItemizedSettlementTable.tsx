interface SettlementItem {
  type: string;
  volume: number;
  avgPrice: number;
  cost: number;
  ratio: number;
}

interface ItemizedSettlementTableProps {
  data: SettlementItem[];
}

export const ItemizedSettlementTable = ({ data }: ItemizedSettlementTableProps) => {
  const total = data.reduce(
    (acc, item) => ({
      volume: acc.volume + item.volume,
      cost: acc.cost + item.cost,
    }),
    { volume: 0, cost: 0 }
  );

  const avgPrice = total.volume > 0 ? (total.cost / total.volume) * 10000 : 0;

  return (
    <div className="overflow-auto">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>交易类型</th>
            <th className="text-right">电量(万kWh)</th>
            <th className="text-right">均价(元/MWh)</th>
            <th className="text-right">电费(万元)</th>
            <th className="text-right">占比</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.type}>
              <td>{item.type}</td>
              <td className="text-right font-mono">{item.volume.toFixed(2)}</td>
              <td className="text-right font-mono">{item.avgPrice.toFixed(1)}</td>
              <td className="text-right font-mono">{item.cost.toFixed(2)}</td>
              <td className="text-right font-mono">{item.ratio.toFixed(1)}%</td>
            </tr>
          ))}
          <tr className="font-semibold" style={{ background: "hsla(200, 50%, 20%, 0.3)" }}>
            <td>合计</td>
            <td className="text-right font-mono">{total.volume.toFixed(2)}</td>
            <td className="text-right font-mono">{avgPrice.toFixed(1)}</td>
            <td className="text-right font-mono">{total.cost.toFixed(2)}</td>
            <td className="text-right font-mono">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

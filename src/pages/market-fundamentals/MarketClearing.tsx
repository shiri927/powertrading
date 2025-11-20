import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const settlementData = [
  { type: "风电", volume: 8500, price: 368, revenue: 3128 },
  { type: "光伏", volume: 6200, price: 372, revenue: 2306 },
  { type: "火电", volume: 12800, price: 405, revenue: 5184 },
  { type: "水电", volume: 4500, price: 358, revenue: 1611 },
];

const MarketClearing = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">市场出清</h1>
        <p className="text-muted-foreground mt-2">
          市场出清结果与结算数据分析
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>出清价格 vs 交易量</CardTitle>
          <CardDescription>按能源类型分布（本月）</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="volume" 
                name="交易量" 
                unit=" MWh"
                label={{ value: '交易量 (兆瓦时)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="price" 
                name="价格" 
                unit=" ¥"
                label={{ value: '出清价格 (元/兆瓦时)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="风电" data={[settlementData[0]]} fill="hsl(var(--chart-1))" />
              <Scatter name="光伏" data={[settlementData[1]]} fill="hsl(var(--chart-2))" />
              <Scatter name="火电" data={[settlementData[2]]} fill="hsl(var(--chart-3))" />
              <Scatter name="水电" data={[settlementData[3]]} fill="hsl(var(--chart-4))" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>结算明细</CardTitle>
          <CardDescription>各能源类型的出清结算信息</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>能源类型</TableHead>
                <TableHead>交易量 (MWh)</TableHead>
                <TableHead>出清价格 (¥/MWh)</TableHead>
                <TableHead>总收益 (万元)</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlementData.map((item) => (
                <TableRow key={item.type}>
                  <TableCell className="font-medium">{item.type}</TableCell>
                  <TableCell>{item.volume.toLocaleString()}</TableCell>
                  <TableCell>¥{item.price}</TableCell>
                  <TableCell>¥{item.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="default">已出清</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketClearing;

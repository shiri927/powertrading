import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 生成实时成交数据
const generateRealtimeData = () => {
  return Array.from({ length: 24 }, (_, hour) => {
    const baseVolume = 3000 + Math.sin(hour / 24 * Math.PI * 2) * 1000;
    const basePrice = 235 + Math.sin(hour / 24 * Math.PI * 2) * 15;
    
    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      buyVolume: baseVolume + Math.random() * 500,
      sellVolume: baseVolume + 200 + Math.random() * 500,
      avgPrice: basePrice + (Math.random() - 0.5) * 5,
      transactions: Math.floor(10 + Math.random() * 20),
    };
  });
};

export const RealtimeTrackingDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState("00");
  
  const data = generateRealtimeData();
  const selectedData = data.find(d => d.time.startsWith(selectedHour));
  
  const totalVolume = data.reduce((sum, d) => sum + d.buyVolume + d.sellVolume, 0);
  const avgPrice = data.reduce((sum, d) => sum + d.avgPrice, 0) / data.length;
  const totalTransactions = data.reduce((sum, d) => sum + d.transactions, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow p-6 text-center">
          <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="font-medium">实时成交跟踪</p>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>实时成交跟踪</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 时段选择 */}
          <div className="overflow-x-auto">
            <Tabs value={selectedHour} onValueChange={setSelectedHour}>
              <TabsList className="w-full justify-start">
                {Array.from({ length: 24 }, (_, i) => (
                  <TabsTrigger key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}:00
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* 当前时段统计 */}
          {selectedData && (
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">成交笔数</p>
                <p className="text-2xl font-bold font-mono">{selectedData.transactions}</p>
                <p className="text-xs text-muted-foreground">笔</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">成交均价</p>
                <p className="text-2xl font-bold font-mono">{selectedData.avgPrice.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">元/MWh</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">买方成交量</p>
                <p className="text-2xl font-bold font-mono text-success">
                  {selectedData.buyVolume.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">MWh</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">卖方成交量</p>
                <p className="text-2xl font-bold font-mono text-destructive">
                  {selectedData.sellVolume.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">MWh</p>
              </Card>
            </div>
          )}

          {/* 图表 */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">买/卖方挂牌交易成交数据</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  label={{ value: '成交量 (MWh)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  label={{ value: '价格 (元/MWh)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="buyVolume" 
                  fill="hsl(var(--success) / 0.6)"
                  name="买方成交量"
                />
                <Bar 
                  yAxisId="left"
                  dataKey="sellVolume" 
                  fill="hsl(var(--destructive) / 0.6)"
                  name="卖方成交量"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="#00B04D"
                  strokeWidth={2}
                  name="成交均价"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 累计统计 */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">累计成交量</p>
              <p className="text-2xl font-bold font-mono">{totalVolume.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">MWh</p>
            </Card>
            <Card className="p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">平均价格</p>
              <p className="text-2xl font-bold font-mono">{avgPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">元/MWh</p>
            </Card>
            <Card className="p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">总交易笔数</p>
              <p className="text-2xl font-bold font-mono">{totalTransactions}</p>
              <p className="text-xs text-muted-foreground">笔</p>
            </Card>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              关闭
            </Button>
            <Button>
              导出报告
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

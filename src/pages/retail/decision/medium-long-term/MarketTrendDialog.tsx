import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { zhCN } from "date-fns/locale";

// 生成多日期对比数据
const generateComparisonData = (dates: Date[]) => {
  return Array.from({ length: 24 }, (_, hour) => {
    const dataPoint: any = {
      time: `${String(hour).padStart(2, '0')}:00`,
    };
    
    dates.forEach((date, i) => {
      const basePower = 4000 + Math.sin(hour / 24 * Math.PI * 2) * 1500;
      dataPoint[`date${i}`] = basePower + (Math.random() - 0.5) * 500;
    });
    
    return dataPoint;
  });
};

export const MarketTrendDialog = () => {
  const [open, setOpen] = useState(false);
  const [analysisType, setAnalysisType] = useState("price");
  
  const comparisonDates = [
    new Date(),
    subDays(new Date(), 1),
    subDays(new Date(), 2),
    subDays(new Date(), 7),
  ];
  
  const data = generateComparisonData(comparisonDates);
  
  const colors = ["#00B04D", "#0EA5E9", "#F59E0B", "#EF4444"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow p-6 text-center">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="font-medium">市场行情分析</p>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>市场行情分析</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 过滤器 */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">分析类型:</span>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">成交价格</SelectItem>
                  <SelectItem value="volume">成交量</SelectItem>
                  <SelectItem value="power">出力功率</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1" />
            
            <div className="text-sm text-muted-foreground">
              对比日期: {comparisonDates.length} 个
            </div>
          </div>

          {/* 图表 */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">多日期出力功率对比</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  label={{ value: '出力 (MW)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                {comparisonDates.map((date, i) => (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={`date${i}`}
                    stroke={colors[i]}
                    strokeWidth={2}
                    name={format(date, 'MM月dd日', { locale: zhCN })}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-4 gap-4">
            {comparisonDates.map((date, i) => (
              <Card key={i} className="p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  {format(date, 'MM月dd日', { locale: zhCN })}
                </p>
                <p className="text-2xl font-bold font-mono" style={{ color: colors[i] }}>
                  {(4000 + Math.random() * 1000).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">平均出力 (MW)</p>
              </Card>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              关闭
            </Button>
            <Button>
              导出数据
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

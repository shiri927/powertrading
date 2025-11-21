import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { History } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { zhCN } from "date-fns/locale";

// 生成历史成交数据
const generateHistoricalData = () => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const baseVolume = 5000 + Math.sin(i / 30 * Math.PI * 2) * 2000;
    const basePrice = 240 + Math.sin(i / 30 * Math.PI * 2) * 20;
    
    return {
      date: format(date, 'MM-dd'),
      volume: baseVolume + (Math.random() - 0.5) * 1000,
      price: basePrice + (Math.random() - 0.5) * 10,
      transactions: Math.floor(50 + Math.random() * 100),
    };
  });
};

const supportLevels = [
  { price: 225.5, label: '强支撑', type: 'strong' },
  { price: 232.8, label: '支撑', type: 'normal' },
  { price: 238.2, label: '弱支撑', type: 'weak' },
];

const resistanceLevels = [
  { price: 252.3, label: '弱压力', type: 'weak' },
  { price: 258.9, label: '压力', type: 'normal' },
  { price: 265.1, label: '强压力', type: 'strong' },
];

export const HistoricalAnalysisDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState({
    main: true,
    sub: true,
    early: false,
    after: false,
  });
  const [volumeRange, setVolumeRange] = useState([4300, 8000]);
  const [customYAxis, setCustomYAxis] = useState(false);
  
  const data = generateHistoricalData();

  const toggleSession = (session: keyof typeof selectedSessions) => {
    setSelectedSessions(prev => ({
      ...prev,
      [session]: !prev[session],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow p-6 text-center">
          <History className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="font-medium">历史成交分析</p>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>历史成交分析</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 警告提示 */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive font-medium">
              近期交易次数少，支撑多点
            </p>
          </div>

          {/* 过滤器区域 */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">交易品种</Label>
                <div className="text-sm text-muted-foreground">
                  2025年1月22日-3月31日内每天现货日合约交易
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">时段过滤</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="main" 
                      checked={selectedSessions.main}
                      onCheckedChange={() => toggleSession('main')}
                    />
                    <label htmlFor="main" className="text-sm cursor-pointer">
                      主板(20:00)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sub" 
                      checked={selectedSessions.sub}
                      onCheckedChange={() => toggleSession('sub')}
                    />
                    <label htmlFor="sub" className="text-sm cursor-pointer">
                      副榜(09:30)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="early" 
                      checked={selectedSessions.early}
                      onCheckedChange={() => toggleSession('early')}
                    />
                    <label htmlFor="early" className="text-sm cursor-pointer">
                      早盘(07:30)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="after" 
                      checked={selectedSessions.after}
                      onCheckedChange={() => toggleSession('after')}
                    />
                    <label htmlFor="after" className="text-sm cursor-pointer">
                      盘后(05:00)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  成交量范围: {volumeRange[0]} - {volumeRange[1]} MWh
                </Label>
                <Slider
                  value={volumeRange}
                  onValueChange={setVolumeRange}
                  min={0}
                  max={10000}
                  step={100}
                  className="mb-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="custom-y" className="text-sm font-medium">
                  自定义Y轴范围
                </Label>
                <Switch
                  id="custom-y"
                  checked={customYAxis}
                  onCheckedChange={setCustomYAxis}
                />
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  重置过滤器
                </Button>
              </div>
            </div>
          </div>

          {/* 图表和支撑压力位 */}
          <div className="grid grid-cols-[1fr,280px] gap-4">
            {/* 主图表 */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">历史成交趋势</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
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
                    dataKey="volume" 
                    fill="#00B04D"
                    opacity={0.6}
                    name="成交量"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="价格趋势"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* 支撑压力位列表 */}
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  支撑位
                </h4>
                <div className="space-y-2">
                  {supportLevels.map((level, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <Badge variant={
                        level.type === 'strong' ? 'default' :
                        level.type === 'normal' ? 'secondary' : 'outline'
                      }>
                        {level.label}
                      </Badge>
                      <span className="font-mono text-success">{level.price}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  压力位
                </h4>
                <div className="space-y-2">
                  {resistanceLevels.map((level, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <Badge variant={
                        level.type === 'strong' ? 'default' :
                        level.type === 'normal' ? 'secondary' : 'outline'
                      }>
                        {level.label}
                      </Badge>
                      <span className="font-mono text-destructive">{level.price}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 bg-muted/30">
                <h4 className="font-semibold mb-2 text-sm">统计信息</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">平均成交量:</span>
                    <span className="font-mono">6,234 MWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">平均价格:</span>
                    <span className="font-mono">238.56 元</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总交易笔数:</span>
                    <span className="font-mono">2,145 笔</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              关闭
            </Button>
            <Button>
              导出分析报告
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

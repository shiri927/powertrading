import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowRight } from "lucide-react";
import { useState } from "react";

const TransmissionPrice = () => {
  const [formData, setFormData] = useState({
    sendPrice: 300,
    transmissionPrice: 45,
    lineLoss: 2.5,
    receivePrice: 380,
  });

  const calculatedPrice = 
    formData.sendPrice + 
    formData.transmissionPrice + 
    (formData.sendPrice * formData.lineLoss / 100);

  const priceDiff = formData.receivePrice - calculatedPrice;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">外送价格计算</h1>
        <p className="text-muted-foreground mt-2">
          跨省跨区电力外送价格测算与对比分析
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 价格计算器 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              外送价格计算器
            </CardTitle>
            <CardDescription>
              输入各项参数自动计算外送到达电价
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sendPrice">送端上网电价 (元/MWh)</Label>
                <Input 
                  id="sendPrice"
                  type="number"
                  value={formData.sendPrice}
                  onChange={(e) => setFormData({...formData, sendPrice: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmissionPrice">输配电价 (元/MWh)</Label>
                <Input 
                  id="transmissionPrice"
                  type="number"
                  value={formData.transmissionPrice}
                  onChange={(e) => setFormData({...formData, transmissionPrice: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineLoss">线损率 (%)</Label>
                <Input 
                  id="lineLoss"
                  type="number"
                  step="0.1"
                  value={formData.lineLoss}
                  onChange={(e) => setFormData({...formData, lineLoss: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivePrice">受端市场电价 (元/MWh)</Label>
                <Input 
                  id="receivePrice"
                  type="number"
                  value={formData.receivePrice}
                  onChange={(e) => setFormData({...formData, receivePrice: Number(e.target.value)})}
                />
              </div>
            </div>

            <Button className="w-full">
              重新计算
            </Button>
          </CardContent>
        </Card>

        {/* 计算结果 */}
        <Card>
          <CardHeader>
            <CardTitle>计算结果</CardTitle>
            <CardDescription>
              外送到达电价与价差分析
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 价格构成 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">送端上网电价</span>
                <span className="font-semibold">{formData.sendPrice} 元/MWh</span>
              </div>
              
              <div className="flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">输配电价</span>
                <span className="font-semibold">+{formData.transmissionPrice} 元/MWh</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">线损折价</span>
                <span className="font-semibold">
                  +{(formData.sendPrice * formData.lineLoss / 100).toFixed(2)} 元/MWh
                </span>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* 最终结果 */}
              <div className="p-4 bg-primary/10 border-2 border-primary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">外送到达电价</span>
                  <Badge>计算结果</Badge>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {calculatedPrice.toFixed(2)} 元/MWh
                </div>
              </div>

              {/* 价差分析 */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">与受端市场价差</span>
                </div>
                <div className={`text-2xl font-bold ${priceDiff > 0 ? 'text-success' : 'text-destructive'}`}>
                  {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(2)} 元/MWh
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {priceDiff > 0 ? '有价格优势，建议外送' : '价格劣势，建议谨慎'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 历史对比分析 */}
      <Card>
        <CardHeader>
          <CardTitle>外送通道价格对比</CardTitle>
          <CardDescription>
            不同外送通道的价格对比分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "通道A", send: 300, transmission: 45, loss: 2.5, receive: 380 },
              { name: "通道B", send: 295, transmission: 50, loss: 3.0, receive: 385 },
              { name: "通道C", send: 310, transmission: 42, loss: 2.2, receive: 375 },
            ].map((channel, idx) => {
              const total = channel.send + channel.transmission + (channel.send * channel.loss / 100);
              const diff = channel.receive - total;
              return (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="font-semibold">{channel.name}</div>
                    <div className="text-sm text-muted-foreground">
                      送端: {channel.send} + 输配: {channel.transmission} + 线损: {channel.loss}%
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{total.toFixed(2)} 元/MWh</div>
                      <div className={`text-xs ${diff > 0 ? 'text-success' : 'text-destructive'}`}>
                        价差: {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransmissionPrice;

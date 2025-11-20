import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

// Mock data for ICE Brent Crude
const iceBrentData = [
  { contract: "2601", price: 74.82, change: -0.63, changePercent: -0.83, ytd: 0.54 },
  { contract: "2602", price: 74.46, change: -0.62, changePercent: -0.83, ytd: 0.38 },
  { contract: "2603", price: 74.11, change: -0.61, changePercent: -0.82, ytd: 0.23 },
  { contract: "2604", price: 73.78, change: -0.60, changePercent: -0.81, ytd: 0.09 },
  { contract: "2605", price: 73.46, change: -0.59, changePercent: -0.80, ytd: -0.05 },
];

// Mock data for WTI Crude
const wtiData = [
  { contract: "2601", price: 71.29, change: -0.72, changePercent: -1.00, ytd: 0.82 },
  { contract: "2602", price: 70.98, change: -0.71, changePercent: -0.99, ytd: 0.68 },
  { contract: "2603", price: 70.68, change: -0.70, changePercent: -0.98, ytd: 0.55 },
  { contract: "2604", price: 70.39, change: -0.69, changePercent: -0.97, ytd: 0.42 },
  { contract: "2605", price: 70.11, change: -0.68, changePercent: -0.96, ytd: 0.30 },
];

// Mock data for Spot Crude
const spotCrudeData = [
  { name: "FOB新加坡", price: 74.25, change: -0.58, changePercent: -0.78, ytd: 0.45 },
  { name: "迪拜原油", price: 73.98, change: -0.61, changePercent: -0.82, ytd: 0.38 },
  { name: "阿曼原油", price: 74.15, change: -0.59, changePercent: -0.79, ytd: 0.42 },
];

// Mock data for INE Shanghai Crude
const ineData = [
  { contract: "主力2501", price: 558.3, change: -5.2, changePercent: -0.92, ytd: 1.25 },
  { contract: "2501", price: 558.3, change: -5.2, changePercent: -0.92, ytd: 1.25 },
  { contract: "2502", price: 555.8, change: -5.1, changePercent: -0.91, ytd: 1.18 },
  { contract: "2503", price: 553.5, change: -5.0, changePercent: -0.90, ytd: 1.12 },
  { contract: "2504", price: 551.2, change: -4.9, changePercent: -0.88, ytd: 1.05 },
];

// Mock chart data for INE price trend
const inePriceTrendData = [
  { time: "09:30", price: 562.5 },
  { time: "10:30", price: 561.2 },
  { time: "11:30", price: 559.8 },
  { time: "13:30", price: 558.5 },
  { time: "14:30", price: 558.3 },
];

// Mock data for Refined Oil
const refinedOilData = [
  { name: "汽油0#国VI", price: 8856, change: -35, changePercent: -0.39, ytd: 2.15 },
  { name: "柴油0#国VI", price: 7725, change: -28, changePercent: -0.36, ytd: 1.98 },
  { name: "航空煤油", price: 8125, change: -32, changePercent: -0.39, ytd: 2.05 },
];

// Mock data for Crack Spreads
const crackSpreadData = [
  { name: "WTI裂解价差", price: 12.58, change: 0.15, changePercent: 1.21, ytd: -2.35 },
  { name: "ICE裂解价差", price: 13.25, change: 0.18, changePercent: 1.38, ytd: -1.98 },
  { name: "RBOB汽油价差", price: 8.92, change: 0.12, changePercent: 1.36, ytd: -3.12 },
  { name: "取暖油价差", price: 15.68, change: 0.22, changePercent: 1.42, ytd: -1.85 },
];

// Mock data for Supply/Demand/Inventory
const inventoryData = [
  { name: "API库存", value: "432.5M桶", change: "+2.1M", changePercent: "+0.49%", status: "up" },
  { name: "EIA库存", value: "428.8M桶", change: "+1.8M", changePercent: "+0.42%", status: "up" },
  { name: "原油持仓", value: "1.85M手", change: "-0.05M", changePercent: "-2.63%", status: "down" },
  { name: "净多头持仓", value: "285K手", change: "+8.5K", changePercent: "+3.07%", status: "up" },
];

// Mock data for Related Stocks
const relatedStocksData = [
  { code: "中国石油", price: 8.95, change: -0.08, changePercent: -0.88, ytd: 5.29 },
  { code: "中国石化", price: 5.68, change: -0.06, changePercent: -1.04, ytd: 4.82 },
  { code: "中海油服", price: 18.32, change: 0.15, changePercent: 0.82, ytd: 12.56 },
  { code: "洲际油气", price: 3.25, change: -0.03, changePercent: -0.91, ytd: -2.35 },
];

// Mock news data
const newsData = [
  { time: "14:35", title: "国际油价下跌，布伦特原油跌破75美元关口" },
  { time: "13:52", title: "OPEC+维持减产政策，市场供应依然偏紧" },
  { time: "12:18", title: "美国原油库存意外增加，施压油价走势" },
  { time: "11:05", title: "中东地缘政治风险升温，油价波动加剧" },
  { time: "10:22", title: "IEA上调2025年全球石油需求预测" },
];

// Mock index data
const indexData = [
  { name: "上证", value: "3245.68", change: "-15.32", changePercent: "-0.47%" },
  { name: "深证", value: "10856.25", change: "-82.56", changePercent: "-0.75%" },
  { name: "标普", value: "4782.35", change: "+12.58", changePercent: "+0.26%" },
];

const scrollingNews = "国际油价震荡下行，WTI原油跌破71美元 · OPEC月报：全球石油需求增长放缓 · 美联储维持利率不变，关注通胀数据 · 中国原油进口量同比增长2.3% · 俄罗斯原油出口量维持高位";

const EnergyQuotes = () => {
  const renderChangeCell = (change: number, changePercent: number) => (
    <TableCell className="text-xs px-2 py-1">
      <div className={change >= 0 ? "text-red-500" : "text-green-600"}>
        <div className="flex items-center gap-1">
          {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}</span>
        </div>
        <div className="text-[10px]">
          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>
    </TableCell>
  );

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">能源行情</h1>
        <p className="text-sm text-muted-foreground mt-1">
          实时原油、天然气及煤炭价格行情数据
        </p>
      </div>

      {/* Main 3-column grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left Column - International Crude */}
        <div className="space-y-4">
          {/* ICE Brent */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">ICE布伦特原油</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 px-2">合约</TableHead>
                    <TableHead className="text-xs h-8 px-2">现价</TableHead>
                    <TableHead className="text-xs h-8 px-2">涨跌</TableHead>
                    <TableHead className="text-xs h-8 px-2">年初至今</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {iceBrentData.map((item) => (
                    <TableRow key={item.contract} className="hover:bg-muted/50">
                      <TableCell className="text-xs font-medium px-2 py-1">{item.contract}</TableCell>
                      <TableCell className="text-xs px-2 py-1">{item.price.toFixed(2)}</TableCell>
                      {renderChangeCell(item.change, item.changePercent)}
                      <TableCell className={`text-xs px-2 py-1 ${item.ytd >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {item.ytd >= 0 ? '+' : ''}{item.ytd.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* WTI */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">WTI原油</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 px-2">合约</TableHead>
                    <TableHead className="text-xs h-8 px-2">现价</TableHead>
                    <TableHead className="text-xs h-8 px-2">涨跌</TableHead>
                    <TableHead className="text-xs h-8 px-2">年初至今</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wtiData.map((item) => (
                    <TableRow key={item.contract} className="hover:bg-muted/50">
                      <TableCell className="text-xs font-medium px-2 py-1">{item.contract}</TableCell>
                      <TableCell className="text-xs px-2 py-1">{item.price.toFixed(2)}</TableCell>
                      {renderChangeCell(item.change, item.changePercent)}
                      <TableCell className={`text-xs px-2 py-1 ${item.ytd >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {item.ytd >= 0 ? '+' : ''}{item.ytd.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Spot Crude */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">原油现货</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 px-2">名称</TableHead>
                    <TableHead className="text-xs h-8 px-2">现价</TableHead>
                    <TableHead className="text-xs h-8 px-2">涨跌</TableHead>
                    <TableHead className="text-xs h-8 px-2">年初至今</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spotCrudeData.map((item) => (
                    <TableRow key={item.name} className="hover:bg-muted/50">
                      <TableCell className="text-xs font-medium px-2 py-1">{item.name}</TableCell>
                      <TableCell className="text-xs px-2 py-1">{item.price.toFixed(2)}</TableCell>
                      {renderChangeCell(item.change, item.changePercent)}
                      <TableCell className={`text-xs px-2 py-1 ${item.ytd >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {item.ytd >= 0 ? '+' : ''}{item.ytd.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Shanghai Crude & Refined Oil */}
        <div className="space-y-4">
          {/* INE Shanghai Crude */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">INE上海原油期货</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 px-2">合约</TableHead>
                    <TableHead className="text-xs h-8 px-2">现价</TableHead>
                    <TableHead className="text-xs h-8 px-2">涨跌</TableHead>
                    <TableHead className="text-xs h-8 px-2">年初至今</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ineData.map((item) => (
                    <TableRow key={item.contract} className="hover:bg-muted/50">
                      <TableCell className="text-xs font-medium px-2 py-1">{item.contract}</TableCell>
                      <TableCell className="text-xs px-2 py-1">{item.price.toFixed(1)}</TableCell>
                      {renderChangeCell(item.change, item.changePercent)}
                      <TableCell className={`text-xs px-2 py-1 ${item.ytd >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {item.ytd >= 0 ? '+' : ''}{item.ytd.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* INE Price Trend Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">INE原油日内走势</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={inePriceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '11px',
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Refined Oil */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">成品油</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 px-2">名称</TableHead>
                    <TableHead className="text-xs h-8 px-2">现价</TableHead>
                    <TableHead className="text-xs h-8 px-2">涨跌</TableHead>
                    <TableHead className="text-xs h-8 px-2">年初至今</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refinedOilData.map((item) => (
                    <TableRow key={item.name} className="hover:bg-muted/50">
                      <TableCell className="text-xs font-medium px-2 py-1">{item.name}</TableCell>
                      <TableCell className="text-xs px-2 py-1">{item.price}</TableCell>
                      {renderChangeCell(item.change, item.changePercent)}
                      <TableCell className={`text-xs px-2 py-1 ${item.ytd >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {item.ytd >= 0 ? '+' : ''}{item.ytd.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Crack Spreads, Inventory & Stocks */}
        <div className="space-y-4">
          {/* Crack Spreads */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">裂解/价差</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 px-2">名称</TableHead>
                    <TableHead className="text-xs h-8 px-2">现价</TableHead>
                    <TableHead className="text-xs h-8 px-2">涨跌</TableHead>
                    <TableHead className="text-xs h-8 px-2">年初至今</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crackSpreadData.map((item) => (
                    <TableRow key={item.name} className="hover:bg-muted/50">
                      <TableCell className="text-xs font-medium px-2 py-1">{item.name}</TableCell>
                      <TableCell className="text-xs px-2 py-1">{item.price.toFixed(2)}</TableCell>
                      {renderChangeCell(item.change, item.changePercent)}
                      <TableCell className={`text-xs px-2 py-1 ${item.ytd >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {item.ytd >= 0 ? '+' : ''}{item.ytd.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Supply/Demand/Inventory */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">供需/库存/持仓</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 px-2">指标</TableHead>
                    <TableHead className="text-xs h-8 px-2">数值</TableHead>
                    <TableHead className="text-xs h-8 px-2">变化</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.map((item) => (
                    <TableRow key={item.name} className="hover:bg-muted/50">
                      <TableCell className="text-xs font-medium px-2 py-1">{item.name}</TableCell>
                      <TableCell className="text-xs px-2 py-1">{item.value}</TableCell>
                      <TableCell className="text-xs px-2 py-1">
                        <div className={item.status === 'up' ? "text-red-500" : "text-green-600"}>
                          <div>{item.change}</div>
                          <div className="text-[10px]">{item.changePercent}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Related Stocks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">关联股票</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 px-2">名称</TableHead>
                    <TableHead className="text-xs h-8 px-2">现价</TableHead>
                    <TableHead className="text-xs h-8 px-2">涨跌</TableHead>
                    <TableHead className="text-xs h-8 px-2">年初至今</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedStocksData.map((item) => (
                    <TableRow key={item.code} className="hover:bg-muted/50">
                      <TableCell className="text-xs font-medium px-2 py-1">{item.code}</TableCell>
                      <TableCell className="text-xs px-2 py-1">{item.price.toFixed(2)}</TableCell>
                      {renderChangeCell(item.change, item.changePercent)}
                      <TableCell className={`text-xs px-2 py-1 ${item.ytd >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {item.ytd >= 0 ? '+' : ''}{item.ytd.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* News List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">市场动态</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {newsData.map((news, index) => (
                <div key={index} className="flex gap-2 text-xs border-b border-border pb-2 last:border-0 last:pb-0">
                  <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                    {news.time}
                  </Badge>
                  <span className="text-muted-foreground line-clamp-1">{news.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom scrolling news bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center gap-6">
            {/* Index display */}
            <div className="flex gap-4 shrink-0">
              {indexData.map((index) => (
                <div key={index.name} className="flex items-center gap-2">
                  <span className="text-xs font-medium">{index.name}</span>
                  <span className="text-xs font-bold">{index.value}</span>
                  <span className={`text-xs ${index.change.startsWith('+') ? 'text-red-500' : 'text-green-600'}`}>
                    {index.change}
                  </span>
                  <span className={`text-[10px] ${index.changePercent.startsWith('+') ? 'text-red-500' : 'text-green-600'}`}>
                    {index.changePercent}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Scrolling news */}
            <div className="flex-1 overflow-hidden">
              <div className="animate-scroll whitespace-nowrap text-xs text-muted-foreground">
                {scrollingNews}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          display: inline-block;
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default EnergyQuotes;

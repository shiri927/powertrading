import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import {
  useIceBrentData,
  useWtiData,
  useSpotCrudeData,
  useIneData,
  useInePriceTrend,
  useRefinedOilData,
  useCrackSpreadData,
  useInventoryData,
  useRelatedStocksData,
  useEnergyNewsData,
  useScrollingNews,
  useMarketIndicesData,
} from "@/hooks/useEnergyQuotesData";

const EnergyQuotes = () => {
  // Fetch all data from database
  const { data: iceBrentData = [], isLoading: loadingBrent } = useIceBrentData();
  const { data: wtiData = [], isLoading: loadingWti } = useWtiData();
  const { data: spotCrudeData = [], isLoading: loadingSpot } = useSpotCrudeData();
  const { data: ineData = [], isLoading: loadingIne } = useIneData();
  const { data: inePriceTrendData = [], isLoading: loadingTrend } = useInePriceTrend();
  const { data: refinedOilData = [], isLoading: loadingRefined } = useRefinedOilData();
  const { data: crackSpreadData = [], isLoading: loadingCrack } = useCrackSpreadData();
  const { data: inventoryData = [], isLoading: loadingInventory } = useInventoryData();
  const { data: relatedStocksData = [], isLoading: loadingStocks } = useRelatedStocksData();
  const { data: newsData = [], isLoading: loadingNews } = useEnergyNewsData();
  const { data: scrollingNews = '', isLoading: loadingScrolling } = useScrollingNews();
  const { data: indexData = [], isLoading: loadingIndex } = useMarketIndicesData();

  const isLoading = loadingBrent || loadingWti || loadingSpot || loadingIne || loadingTrend || 
                    loadingRefined || loadingCrack || loadingInventory || loadingStocks || 
                    loadingNews || loadingScrolling || loadingIndex;

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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">加载能源行情数据...</span>
      </div>
    );
  }

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
                          <div className="flex items-center gap-1">
                            {item.status === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span>{item.change}</span>
                          </div>
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
              <CardTitle className="text-sm font-medium">关联个股</CardTitle>
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

          {/* News */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">市场要闻</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 p-3">
                {newsData.map((item, index) => (
                  <div key={index} className="flex gap-2 text-xs">
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {item.time}
                    </Badge>
                    <span className="text-muted-foreground line-clamp-1">{item.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom scrolling news ticker */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
            <div className="flex gap-4 shrink-0">
              {indexData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="text-xs font-medium">{item.name}</span>
                  <span className="text-xs">{item.value}</span>
                  <span className={`text-xs ${item.change.startsWith('+') ? 'text-red-500' : 'text-green-600'}`}>
                    {item.change} ({item.changePercent})
                  </span>
                </div>
              ))}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="animate-scroll whitespace-nowrap text-xs text-muted-foreground">
                {scrollingNews}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default EnergyQuotes;

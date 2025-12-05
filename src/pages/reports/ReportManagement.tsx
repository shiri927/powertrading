import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// 结算分类明细数据
const settlementData = {
  totalCapacity: 9.9,
  categories: [
    {
      category: "电量清分",
      items: [
        {
          type: "现货",
          subType: null,
          subItems: [
            { name: "省间现货", volume: 111.7097, priceNoSubsidy: 0.33907, priceWithSubsidy: 0.61707, incomeNoSubsidy: 37.877582, incomeWithSubsidy: 68.933047 },
            { name: "省内现货", volume: 1953.7994, priceNoSubsidy: 0.61425, priceWithSubsidy: 0.89225, incomeNoSubsidy: 1200.11606, incomeWithSubsidy: 1743.285709 },
          ]
        },
        {
          type: "中长期",
          subType: "交易",
          subItems: [
            { name: "直接交易", volume: 6494.7826, priceNoSubsidy: 0.25883, priceWithSubsidy: 0.53683, incomeNoSubsidy: 1681.046587, incomeWithSubsidy: 3486.610537 },
            { name: "优先发电", volume: 93.4, priceNoSubsidy: 0.33062, priceWithSubsidy: 0.60862, incomeNoSubsidy: 30.879856, incomeWithSubsidy: 56.845056 },
          ]
        },
        {
          type: null,
          subType: null,
          subItems: [
            { name: "基数", subName: "非交易", volume: 4576.2863, priceNoSubsidy: 0.332, priceWithSubsidy: 0.61, incomeNoSubsidy: 1519.327051, incomeWithSubsidy: 2791.552444 },
            { name: "外送", subName: "交易", volume: 1380.1723, priceNoSubsidy: 0.3687, priceWithSubsidy: 0.6467, incomeNoSubsidy: 508.869518, incomeWithSubsidy: 892.562414 },
          ]
        },
      ],
      total: { name: "电量合计", volume: 14610.1503, priceNoSubsidy: 0.34073, priceWithSubsidy: 0.61873, incomeNoSubsidy: 4978.116654, incomeWithSubsidy: 9039.789207 }
    },
    {
      category: "权益凭证\n分摊补偿\n偏差考核",
      items: [
        { name: "市场运营费用", volume: "-", priceNoSubsidy: "-", priceWithSubsidy: "-", incomeNoSubsidy: -676.491131, incomeWithSubsidy: -676.491131 },
        { name: "辅助服务费用分摊", subName: "/", extraCol: "/", volume: "-", priceNoSubsidy: "-", priceWithSubsidy: "-", incomeNoSubsidy: 6.02612, incomeWithSubsidy: 6.02612 },
        { name: "两个细则", volume: "-", priceNoSubsidy: "-", priceWithSubsidy: "-", incomeNoSubsidy: -72.969742, incomeWithSubsidy: -72.969742 },
      ],
      total: { name: "费用合计", volume: "-", priceNoSubsidy: "-", priceWithSubsidy: "-", incomeNoSubsidy: -743.434753, incomeWithSubsidy: -743.434753 }
    },
    {
      category: "结算调整",
      items: [
        { name: "退补", subName: "/", extraCol: "/", volume: "-", priceNoSubsidy: "-", priceWithSubsidy: "-", incomeNoSubsidy: -35.497224, incomeWithSubsidy: -35.497224 },
      ],
      total: null
    }
  ],
  grandTotal: { name: "扣费收入合计", volume: 14610.1503, priceNoSubsidy: 0.28742, priceWithSubsidy: 0.56542, incomeNoSubsidy: 4199.184677, incomeWithSubsidy: 8260.85723 }
};

const formatNumber = (value: number | string, decimals: number = 4): string => {
  if (typeof value === "string") return value;
  return value.toFixed(decimals);
};

const ReportManagement = () => {
  return (
    <div className="p-8 space-y-4">
      {/* 标题和导出按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">结算单分类明细报表</h1>
          <p className="text-sm text-muted-foreground mt-1">
            合计装机容量: <span className="font-mono">{settlementData.totalCapacity}</span> 万kW
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          导出
        </Button>
      </div>

      {/* 数据表格 */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#F1F8F4] border-b">
              <th colSpan={3} className="h-12 px-4 text-center align-middle font-semibold text-gray-700 border-r">
                统计指标
              </th>
              <th className="h-12 px-4 text-center align-middle font-semibold text-gray-700 border-r whitespace-nowrap">
                当前结算电量(万kWh)
              </th>
              <th className="h-12 px-4 text-center align-middle font-semibold text-gray-700 border-r whitespace-nowrap">
                当前不含补贴结算平均电价<br/>(元/kWh)
              </th>
              <th className="h-12 px-4 text-center align-middle font-semibold text-gray-700 border-r whitespace-nowrap">
                当前含补贴结算平均电价<br/>(元/kWh)
              </th>
              <th className="h-12 px-4 text-center align-middle font-semibold text-gray-700 border-r whitespace-nowrap">
                当前不含补贴结算电费收入(万元)
              </th>
              <th className="h-12 px-4 text-center align-middle font-semibold text-gray-700 whitespace-nowrap">
                当前含补贴电费收入(万元)
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 电量清分 - 现货 */}
            <tr className="border-b hover:bg-[#F8FBFA]">
              <td rowSpan={8} className="px-4 py-3 align-middle border-r font-medium text-center">电量清分</td>
              <td rowSpan={2} className="px-4 py-3 align-middle border-r text-center">现货</td>
              <td className="px-4 py-3 align-middle border-r">省间现货</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(111.7097)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.33907, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.61707, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(37.877582, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono">{formatNumber(68.933047, 6)}</td>
            </tr>
            <tr className="border-b hover:bg-[#F8FBFA]">
              <td className="px-4 py-3 align-middle border-r">省内现货</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(1953.7994)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.61425, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.89225, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(1200.11606, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono">{formatNumber(1743.285709, 6)}</td>
            </tr>
            
            {/* 电量清分 - 中长期 */}
            <tr className="border-b hover:bg-[#F8FBFA]">
              <td rowSpan={4} className="px-4 py-3 align-middle border-r text-center">中长期</td>
              <td className="px-4 py-3 align-middle border-r">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">交易</span>
                  <span>直接交易</span>
                </div>
              </td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(6494.7826)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.25883, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.53683, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(1681.046587, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono">{formatNumber(3486.610537, 6)}</td>
            </tr>
            <tr className="border-b hover:bg-[#F8FBFA]">
              <td className="px-4 py-3 align-middle border-r">优先发电</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(93.4)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.33062, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.60862, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(30.879856, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono">{formatNumber(56.845056, 6)}</td>
            </tr>
            <tr className="border-b hover:bg-[#F8FBFA]">
              <td className="px-4 py-3 align-middle border-r">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">非交易</span>
                  <span>基数</span>
                </div>
              </td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(4576.2863)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.332, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.61, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(1519.327051, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono">{formatNumber(2791.552444, 6)}</td>
            </tr>
            <tr className="border-b hover:bg-[#F8FBFA]">
              <td className="px-4 py-3 align-middle border-r">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">交易</span>
                  <span>外送</span>
                </div>
              </td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(1380.1723)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.3687, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.6467, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(508.869518, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono">{formatNumber(892.562414, 6)}</td>
            </tr>
            
            {/* 电量合计 */}
            <tr className="border-b hover:bg-[#F8FBFA] bg-[#F8FBFA]">
              <td colSpan={2} className="px-4 py-3 align-middle border-r font-medium">电量合计</td>
              <td className="px-4 py-3 align-middle text-right font-mono font-medium border-r">{formatNumber(14610.1503)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono font-medium border-r">{formatNumber(0.34073, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono font-medium border-r">{formatNumber(0.61873, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono font-medium border-r">{formatNumber(4978.116654, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono font-medium">{formatNumber(9039.789207, 6)}</td>
            </tr>

            {/* 权益凭证分摊补偿偏差考核 */}
            <tr className="border-b hover:bg-[#F8FBFA]">
              <td rowSpan={4} className="px-4 py-3 align-middle border-r font-medium text-center whitespace-pre-line leading-tight">权益凭证<br/>分摊补偿<br/>偏差考核</td>
              <td colSpan={2} className="px-4 py-3 align-middle border-r">市场运营费用</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-right font-mono text-red-600 border-r">{formatNumber(-676.491131, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono text-red-600">{formatNumber(-676.491131, 6)}</td>
            </tr>
            <tr className="border-b hover:bg-[#F8FBFA]">
              <td className="px-4 py-3 align-middle border-r">辅助服务费用分摊</td>
              <td className="px-4 py-3 align-middle border-r text-center text-muted-foreground">/</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(6.02612, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono">{formatNumber(6.02612, 6)}</td>
            </tr>
            <tr className="border-b hover:bg-[#F8FBFA]">
              <td colSpan={2} className="px-4 py-3 align-middle border-r">两个细则</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-right font-mono text-red-600 border-r">{formatNumber(-72.969742, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono text-red-600">{formatNumber(-72.969742, 6)}</td>
            </tr>
            <tr className="border-b hover:bg-[#F8FBFA] bg-[#F8FBFA]">
              <td colSpan={2} className="px-4 py-3 align-middle border-r font-medium">费用合计</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-right font-mono font-medium text-red-600 border-r">{formatNumber(-743.434753, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono font-medium text-red-600">{formatNumber(-743.434753, 6)}</td>
            </tr>

            {/* 结算调整 */}
            <tr className="border-b hover:bg-[#F8FBFA]">
              <td className="px-4 py-3 align-middle border-r font-medium text-center">结算调整</td>
              <td className="px-4 py-3 align-middle border-r">退补</td>
              <td className="px-4 py-3 align-middle border-r text-center text-muted-foreground">/</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-center text-muted-foreground border-r">-</td>
              <td className="px-4 py-3 align-middle text-right font-mono text-red-600 border-r">{formatNumber(-35.497224, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono text-red-600">{formatNumber(-35.497224, 6)}</td>
            </tr>

            {/* 扣费收入合计 */}
            <tr className="bg-[#E8F0EC] font-semibold">
              <td colSpan={3} className="px-4 py-3 align-middle border-r text-center">扣费收入合计</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(14610.1503)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.28742, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(0.56542, 5)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono border-r">{formatNumber(4199.184677, 6)}</td>
              <td className="px-4 py-3 align-middle text-right font-mono">{formatNumber(8260.85723, 6)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportManagement;

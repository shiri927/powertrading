import { NavLink } from "./NavLink";
import { LayoutDashboard, TrendingUp, BarChart3, Zap, ShoppingCart, PieChart, Settings, ChevronDown, LineChart, FileText } from "lucide-react";
import { useState } from "react";
import heengyLogo from "@/assets/heengy-logo.png";
import shanshuLogo from "@/assets/shanshu-logo.png";
const navigation = [{
  name: "首页大屏",
  href: "/",
  icon: LayoutDashboard
}, {
  name: "市场与基本面数据",
  icon: BarChart3,
  children: [{
    name: "市场出清",
    href: "/market-fundamentals/clearing"
  }, {
    name: "市场供需",
    href: "/market-fundamentals/supply-demand"
  }, {
    name: "气象数据",
    href: "/market-fundamentals/weather"
  }, {
    name: "电网系统",
    href: "/market-fundamentals/grid"
  }, {
    name: "能源行情",
    href: "/market-fundamentals/energy"
  }, {
    name: "新闻与政策",
    href: "/market-fundamentals/news-policy"
  }]
}, {
  name: "新能源发电侧",
  icon: Zap,
  children: [{
    name: "交易日历",
    href: "/renewable/trading-ledger"
  }, {
    name: "基础数据",
    href: "/renewable/base-data"
  }, {
    name: "交易决策",
    href: "/renewable/decision"
  }, {
    name: "交易操作台",
    href: "/renewable/console"
  }, {
    name: "出清管理",
    href: "/renewable/clearing"
  }, {
    name: "结算管理",
    href: "/renewable/settlement"
  }, {
    name: "复盘分析",
    href: "/renewable/review"
  }]
}, {
  name: "售电业务侧",
  icon: ShoppingCart,
  children: [{
    name: "交易日历",
    href: "/retail/trading-ledger"
  }, {
    name: "基础数据",
    href: "/retail/base-data"
  }, {
    name: "交易决策",
    icon: ShoppingCart,
    children: [{
      name: "中长期交易策略",
      href: "/retail/decision/medium-long-term"
    }, {
      name: "省间现货策略",
      href: "/retail/decision/inter-provincial"
    }, {
      name: "省内现货策略",
      href: "/retail/decision/intra-provincial"
    }, {
      name: "绿证交易策略",
      href: "/retail/decision/green-certificate"
    }]
  }, {
    name: "交易操作台",
    href: "/retail/console"
  }, {
    name: "零售交易",
    icon: ShoppingCart,
    children: [{
      name: "客户管理",
      href: "/retail/trading/customer-management"
    }, {
      name: "用电管理",
      href: "/retail/trading/load-management"
    }, {
      name: "套餐模拟计算",
      href: "/retail/trading/package-simulation"
    }, {
      name: "零售执行情况追踪",
      href: "/retail/trading/execution-tracking"
    }]
  }, {
    name: "出清管理",
    href: "/retail/clearing"
  }, {
    name: "结算管理",
    href: "/retail/settlement"
  }, {
    name: "复盘分析",
    href: "/retail/review"
  }]
}, {
  name: "收益分析",
  icon: PieChart,
  children: [{
    name: "发电侧收益",
    href: "/revenue/generation"
  }, {
    name: "售电侧收益",
    href: "/revenue/retail"
  }]
}, {
  name: "报表与报告",
  icon: FileText,
  children: [{
    name: "报表管理",
    href: "/reports/management"
  }, {
    name: "报告管理",
    href: "/reports/analysis"
  }]
}, {
  name: "系统管理",
  href: "/settings",
  icon: Settings
}];
export const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(["市场与基本面数据"]);
  const toggleExpand = (name: string) => {
    setExpandedItems(prev => prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]);
  };
  return <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border bg-gradient-to-br from-white to-slate-50/50 bg-slate-50 border-2 border-slate-950">
          <div className="flex items-start gap-3">
            <img src={shanshuLogo} alt="杉数科技" className="w-14 h-14 object-contain flex-shrink-0 mt-0.5" />
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <h2 style={{
              color: '#8B2332'
            }} className="font-bold leading-tight mb-1 text-lg text-red-900">
                杉数科技
              </h2>
              <h1 className="font-bold leading-tight text-base text-red-900">
                电力交易决策平台
              </h1>
              <p className="text-sm font-medium leading-tight mb-2 text-slate-950">
                

              </p>
              
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map(item => <div key={item.name}>
              {item.href ? <NavLink to={item.href} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink> : <>
                  <button onClick={() => toggleExpand(item.name)} className="flex items-center justify-between w-full gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedItems.includes(item.name) ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedItems.includes(item.name) && item.children && <div className="ml-8 mt-1 space-y-1">
                      {item.children.map(child => <div key={child.name}>
                          {child.href ? <NavLink to={child.href} className="block px-3 py-2 text-sm text-sidebar-foreground/70 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                              {child.name}
                            </NavLink> : <>
                              <button onClick={() => toggleExpand(child.name)} className="flex items-center justify-between w-full px-3 py-2 text-sm text-sidebar-foreground/70 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                                <span>{child.name}</span>
                                <ChevronDown className={`h-3 w-3 transition-transform ${expandedItems.includes(child.name) ? 'rotate-180' : ''}`} />
                              </button>
                              {expandedItems.includes(child.name) && child.children && <div className="ml-4 mt-1 space-y-1">
                                  {child.children.map(grandchild => <NavLink key={grandchild.name} to={grandchild.href} className="block px-3 py-2 text-xs text-sidebar-foreground/60 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                                      {grandchild.name}
                                    </NavLink>)}
                                </div>}
                            </>}
                        </div>)}
                    </div>}
                </>}
            </div>)}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            © 2025 电力交易平台
          </p>
        </div>
      </div>
    </div>;
};

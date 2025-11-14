import { NavLink } from "./NavLink";
import { 
  LayoutDashboard, 
  TrendingUp, 
  CloudRain, 
  Zap,
  Settings,
  BarChart3
} from "lucide-react";

const navigation = [
  { name: "数据概览", href: "/", icon: LayoutDashboard },
  { name: "市场情报", href: "/market", icon: BarChart3 },
  { name: "价格预测", href: "/prediction", icon: TrendingUp },
  { name: "气象情报", href: "/weather", icon: CloudRain },
  { name: "发电计划", href: "/generation", icon: Zap },
  { name: "系统管理", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            电力交易系统
          </h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">
            Power Trading System
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            © 2024 电力交易平台
          </p>
        </div>
      </div>
    </div>
  );
};

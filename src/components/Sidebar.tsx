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
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Market Intelligence", href: "/market", icon: BarChart3 },
  { name: "Price Prediction", href: "/prediction", icon: TrendingUp },
  { name: "Weather Intelligence", href: "/weather", icon: CloudRain },
  { name: "Generation Planning", href: "/generation", icon: Zap },
  { name: "System Management", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Power Trading System
          </h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">
            电力交易系统
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
            © 2024 Power Trading Platform
          </p>
        </div>
      </div>
    </div>
  );
};

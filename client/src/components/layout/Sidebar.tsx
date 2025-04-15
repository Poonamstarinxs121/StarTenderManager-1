import { useLocation, Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BarChart,
  FileText,
  Settings,
  Users,
  LayoutDashboard
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const navItems: NavItem[] = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard />,
    },
    {
      href: "/tenders",
      label: "Tenders",
      icon: <FileText />,
    },
    {
      href: "/clients",
      label: "Clients",
      icon: <Users />,
    },
    {
      href: "/reports",
      label: "Reports",
      icon: <BarChart />,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings />,
    },
  ];

  return (
    <aside className="bg-surface shadow-md sidebar w-16 md:w-64 flex flex-col">
      <nav className="py-4 flex-1">
        <ul>
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <li className="mb-1" key={item.href}>
                <Link href={item.href}>
                  <a
                    className={`flex items-center px-4 py-3 rounded-md mx-2 transition-colors
                      ${isActive 
                        ? "bg-primary text-white" 
                        : "text-text-secondary hover:bg-primary hover:text-white"}`}
                  >
                    <span className="h-5 w-5">{item.icon}</span>
                    <span className="ml-4 hidden md:inline">{item.label}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span className="ml-2 text-sm text-text-secondary hidden md:inline">Database connected</span>
        </div>
      </div>
    </aside>
  );
}

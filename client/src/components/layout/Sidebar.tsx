import { useLocation, Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BarChart,
  FileText,
  Settings,
  Users,
  LayoutDashboard,
  Building2,
  Factory,
  UserCog,
  Target,
  FileSpreadsheet
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
      href: "/companies",
      label: "Companies",
      icon: <Building2 />,
    },
    {
      href: "/oems",
      label: "OEMs",
      icon: <Factory />,
    },
    {
      href: "/customers",
      label: "Customers",
      icon: <Users />,
    },
    {
      href: "/user-management",
      label: "User Management",
      icon: <UserCog />,
    },
    {
      href: "/leads",
      label: "Leads",
      icon: <Target />,
    },
    {
      href: "/document-management",
      label: "Document Management",
      icon: <FileSpreadsheet />,
    },
    {
      href: "/tender-management",
      label: "Tender Management",
      icon: <FileText />,
    },
  ];

  return (
    <aside className="bg-white border-r border-gray-200 sidebar w-64 flex flex-col">
      <nav className="py-4 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center px-4 py-2.5 transition-colors
                      ${isActive 
                        ? "bg-gray-100 text-black font-medium" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"}`}
                  >
                    <span className="h-5 w-5 flex-shrink-0">{item.icon}</span>
                    <span className="ml-3 text-sm">{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="ml-2 text-xs text-gray-500">Database connected</span>
        </div>
      </div>
    </aside>
  );
}

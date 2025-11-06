import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import {
  Home,
  Library,
  Target,
  Trophy,
  Wallet,
  CreditCard,
  BarChart3,
  LogOut,
} from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { signoutRedirect } = useAuth();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Overview" },
    { href: "/dashboard/games", icon: Library, label: "Games" },
    { href: "/dashboard/quests", icon: Target, label: "Quests" },
    { href: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
    { href: "/dashboard/cards", icon: CreditCard, label: "Trading Cards" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            GameQuest
          </Link>
          <Button variant="ghost" size="sm" onClick={() => signoutRedirect()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.href && "bg-accent"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

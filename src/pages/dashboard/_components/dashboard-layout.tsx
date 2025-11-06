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
  Zap,
} from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { signoutRedirect, user } = useAuth();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/games", icon: Library, label: "Library" },
    { href: "/dashboard/quests", icon: Target, label: "Quests" },
    { href: "/dashboard/leaderboard", icon: Trophy, label: "Ranks" },
    { href: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
    { href: "/dashboard/cards", icon: CreditCard, label: "Cards" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Stats" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Top Bar - PlayStation/Steam Deck style */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-card/80 border-b border-primary/20">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/50">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              CARV QUEST
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-sm font-medium">{user.profile.name}</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => signoutRedirect()}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Console style navigation */}
          <aside className="lg:w-64 space-y-2">
            <div className="p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-primary/10 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 shadow-lg shadow-primary/20"
                          : "hover:bg-primary/5 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        isActive 
                          ? "bg-primary/20 text-primary shadow-inner" 
                          : "bg-muted/50 text-muted-foreground"
                      )}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className={cn(
                        "font-medium text-sm",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-6 rounded-full bg-gradient-to-b from-primary to-accent" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

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
  Gift,
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
    { href: "/dashboard/rewards", icon: Gift, label: "Rewards" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Stats" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated glow background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Bar - Futuristic glowing style */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-card/60 border-b border-primary/30 glow-primary">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center glow-primary transition-all group-hover:scale-110">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-glow gradient-animate">
              PlayBeings
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 glow-primary backdrop-blur-xl">
                <span className="text-sm font-semibold text-foreground">{user.profile.name}</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => signoutRedirect()}
              className="hover:bg-destructive/20 hover:text-destructive rounded-xl px-4 py-2 transition-all hover:glow-accent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Futuristic navigation */}
          <aside className="lg:w-72 space-y-3">
            <div className="p-5 rounded-3xl bg-card/60 backdrop-blur-2xl border border-primary/20 glow-primary space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-r from-primary/30 to-accent/30 border-2 border-primary/50 glow-primary"
                          : "hover:bg-primary/10 border-2 border-transparent hover:border-primary/20"
                      )}
                    >
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                        isActive 
                          ? "bg-gradient-to-br from-primary to-accent text-white glow-primary" 
                          : "bg-muted/30 text-muted-foreground"
                      )}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className={cn(
                        "font-bold text-base",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-2 h-8 rounded-full bg-gradient-to-b from-primary via-secondary to-accent glow-accent animate-pulse" />
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

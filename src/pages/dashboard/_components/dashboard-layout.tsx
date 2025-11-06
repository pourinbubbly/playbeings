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
    <div className="min-h-screen bg-background cyber-grid-animated relative">
      {/* Animated background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-[var(--neon-cyan)] rounded-full blur-[120px] opacity-10 animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[var(--neon-magenta)] rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--neon-purple)] rounded-full blur-[120px] opacity-5 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Bar - Cyber style with neon glow */}
      <header className="sticky top-0 z-50 glass-card border-b border-[var(--neon-cyan)]/20">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan transition-all group-hover:neon-glow-magenta">
              <Zap className="w-7 h-7 text-[var(--neon-cyan)] group-hover:text-[var(--neon-magenta)] transition-colors" />
            </div>
            <span className="text-3xl font-bold gradient-text-cyber tracking-wider glitch-text-slow">
              PLAYBEINGS
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded glass-card neon-border-cyan">
                <span className="text-sm font-semibold text-[var(--neon-cyan)] uppercase tracking-wide">{user.profile.name}</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => signoutRedirect()}
              className="glass-card border border-destructive/30 hover:neon-glow-pink hover:border-destructive text-destructive font-semibold uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4 mr-2" />
              EXIT
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Cyber navigation with neon */}
          <aside className="lg:w-72 space-y-4">
            <nav className="glass-card p-2 rounded-sm space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-sm transition-all font-semibold uppercase tracking-wider text-sm border-2",
                        isActive
                          ? "neon-border-cyan bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] neon-glow-cyan"
                          : "border-transparent hover:neon-border-magenta hover:bg-[var(--neon-magenta)]/10 text-muted-foreground hover:text-[var(--neon-magenta)] hover:neon-glow-magenta"
                      )}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto text-xs animate-pulse">◆</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

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
  Menu,
  ChevronDown,
  Newspaper,
  User,
  Settings,
  Users,
  Crown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { NotificationBell } from "@/components/notification-bell.tsx";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { signoutRedirect, user } = useAuth();

  const mainNavItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/games", icon: Library, label: "Library" },
    { href: "/dashboard/quests", icon: Target, label: "Quests" },
    { href: "/dashboard/leaderboard", icon: Trophy, label: "Ranks" },
  ];

  const moreNavItems = [
    { href: "/premium", icon: Crown, label: "Premium Pass" },
    { href: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
    { href: "/dashboard/cards", icon: CreditCard, label: "NFT Cards" },
    { href: "/dashboard/nfts", icon: Zap, label: "My NFTs" },
    { href: "/dashboard/rewards", icon: Gift, label: "Rewards" },
    { href: "/dashboard/news", icon: Newspaper, label: "News" },
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
            <img 
              src="https://cdn.hercules.app/file_Evc6kLN23XZ1w4t1QNsD1IRy" 
              alt="PlayBeings" 
              className="w-12 h-12 object-contain"
            />
            <span className="text-3xl font-bold gradient-text-cyber tracking-wider">
              PLAYBEINGS
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <NotificationBell />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="glass-card neon-border-cyan px-5 py-2.5 h-auto hover:neon-glow-cyan"
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm font-semibold text-[var(--neon-cyan)] uppercase tracking-wide">
                      {user.profile.name}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-2 border-[var(--neon-cyan)]/30 min-w-[200px]">
                  <Link to="/profile">
                    <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer font-semibold uppercase tracking-wider text-sm text-muted-foreground hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10">
                      <User className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/settings">
                    <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer font-semibold uppercase tracking-wider text-sm text-muted-foreground hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/community">
                    <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer font-semibold uppercase tracking-wider text-sm text-muted-foreground hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10">
                      <Users className="w-4 h-4" />
                      <span>Community</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem 
                    onClick={() => signoutRedirect()}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer font-semibold uppercase tracking-wider text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Exit</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Top Navigation - Clean horizontal menu with dropdown */}
      <nav className="glass-card border-b border-[var(--neon-cyan)]/20 relative z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 py-2">
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-5 py-3 rounded-sm transition-all font-semibold uppercase tracking-wider text-sm border-2 whitespace-nowrap",
                      isActive
                        ? "neon-border-cyan bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] neon-glow-cyan"
                        : "border-transparent hover:neon-border-magenta hover:bg-[var(--neon-magenta)]/10 text-muted-foreground hover:text-[var(--neon-magenta)] hover:neon-glow-magenta"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="text-xs animate-pulse">◆</span>
                    )}
                  </div>
                </Link>
              );
            })}
            
            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-sm transition-all font-semibold uppercase tracking-wider text-sm border-2",
                    moreNavItems.some(item => location.pathname === item.href)
                      ? "neon-border-cyan bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] neon-glow-cyan"
                      : "border-transparent hover:neon-border-magenta hover:bg-[var(--neon-magenta)]/10 text-muted-foreground hover:text-[var(--neon-magenta)] hover:neon-glow-magenta"
                  )}
                >
                  <Menu className="w-5 h-5" />
                  <span>More</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="glass-card border-2 border-[var(--neon-cyan)]/30 min-w-[200px]">
                {moreNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={item.href} to={item.href}>
                      <DropdownMenuItem
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 cursor-pointer font-semibold uppercase tracking-wider text-sm",
                          isActive
                            ? "text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10"
                            : "text-muted-foreground hover:text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/10"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    </Link>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10 relative z-10">
        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}

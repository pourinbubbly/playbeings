import { Link } from "react-router-dom";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Gamepad2,
  Trophy,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  Shield,
  DollarSign,
  Gift,
  Clock,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background cyber-grid-animated relative">
      {/* Animated background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-[var(--neon-cyan)] rounded-full blur-[120px] opacity-10 animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[var(--neon-magenta)] rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--neon-purple)] rounded-full blur-[120px] opacity-5 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <header className="glass-card border-b border-[var(--neon-cyan)]/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="https://cdn.hercules.app/file_C1apUdTtCZmsdaOnfQV8Z8c0" 
              alt="PlayBeings" 
              className="w-12 h-12 object-contain"
            />
            <span className="text-3xl font-bold gradient-text-cyber tracking-wider">PLAYBEINGS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Authenticated>
              <Button asChild className="glass-card border-2 border-[var(--neon-cyan)] hover:neon-glow-cyan text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 font-bold uppercase tracking-wider">
                <Link to="/dashboard">DASHBOARD</Link>
              </Button>
            </Authenticated>
            <Unauthenticated>
              <SignInButton className="glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider" />
            </Unauthenticated>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-sm border-2 border-[var(--neon-cyan)]/30 neon-glow-cyan">
                <Shield className="w-5 h-5 text-[var(--neon-cyan)]" />
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--neon-cyan)]">CARV SVM Blockchain Powered</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider uppercase text-foreground">
                Turn Gaming Into <span className="gradient-text-cyber">Real Rewards</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground uppercase tracking-wide">
                Connect Steam • Complete Quests • Mint NFTs • Earn Rewards
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center gap-4 pt-8">
                <Authenticated>
                  <Button asChild className="glass-card border-2 border-[var(--neon-cyan)] hover:neon-glow-cyan text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 font-bold uppercase tracking-wider text-lg px-10 h-14">
                    <Link to="/dashboard">ENTER DASHBOARD</Link>
                  </Button>
                </Authenticated>
                <Unauthenticated>
                  <SignInButton className="glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider text-lg px-10 h-14" />
                </Unauthenticated>
                <Button asChild variant="ghost" className="glass-card border-2 border-[var(--neon-purple)] hover:neon-glow-purple text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/20 font-bold uppercase tracking-wider text-lg px-10 h-14">
                  <a href="#features">LEARN MORE</a>
                </Button>
              </div>
            </div>

            {/* Right Icon */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-[var(--neon-cyan)] rounded-full blur-[100px] opacity-20 animate-pulse" />
                <Gamepad2 className="relative w-full h-auto text-[var(--neon-cyan)] drop-shadow-2xl" style={{ height: '400px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 glass-card border-y-2 border-[var(--neon-cyan)]/20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <StatItem label="Active Players" value="0" />
            <StatItem label="Quests Completed" value="0" />
            <StatItem label="NFTs Minted" value="0" />
            <StatItem label="Rewards Distributed" value="$0" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text-cyber uppercase tracking-wider">Everything You Need</h2>
            <p className="text-xl text-muted-foreground uppercase tracking-wide">
              Complete platform to earn, collect, and compete
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Gamepad2 className="w-8 h-8" />}
              title="Steam Integration"
              description="Automatically sync your game library, playtime, achievements, and trading cards from Steam."
            />
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Daily Quests"
              description="Complete 5 fresh challenges every day based on your gaming activity and earn points."
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8" />}
              title="NFT Trading Cards"
              description="Mint your Steam trading cards as NFTs on CARV SVM blockchain with bonus point multipliers."
            />
            <FeatureCard
              icon={<DollarSign className="w-8 h-8" />}
              title="Real Rewards"
              description="Redeem your points for Steam wallet codes, Amazon gift cards, and Nintendo eShop credits."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Global Leaderboard"
              description="Compete with players worldwide for a $1,000 monthly prize pool for top 100 players."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Secure & Transparent"
              description="Built on CARV SVM blockchain for secure, verifiable, and transparent transactions."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 glass-card relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text-cyber uppercase tracking-wider">How It Works</h2>
            <p className="text-xl text-muted-foreground uppercase tracking-wide">
              Start earning from gaming in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number="1"
              title="Connect Steam"
              description="Link your Steam account to automatically sync your games and achievements."
            />
            <StepCard
              number="2"
              title="Complete Quests"
              description="Play games and complete daily quests to earn points and climb the leaderboard."
            />
            <StepCard
              number="3"
              title="Earn Rewards"
              description="Redeem your points for gift cards or mint NFTs with bonus multipliers."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto glass-card rounded-sm border-2 border-[var(--neon-cyan)]/30 neon-glow-cyan p-12 text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-cyber uppercase tracking-wider">Ready to Start Earning?</h2>
            <p className="text-xl text-muted-foreground uppercase tracking-wide">
              Join gamers earning rewards from their gaming
            </p>
            <div className="pt-4">
              <Unauthenticated>
                <SignInButton className="glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider text-lg px-10 h-14" />
              </Unauthenticated>
              <Authenticated>
                <Button asChild className="glass-card border-2 border-[var(--neon-cyan)] hover:neon-glow-cyan text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 font-bold uppercase tracking-wider text-lg px-10 h-14">
                  <Link to="/dashboard">ENTER DASHBOARD</Link>
                </Button>
              </Authenticated>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-card border-t-2 border-[var(--neon-cyan)]/20 py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan">
                  <Zap className="w-6 h-6 text-[var(--neon-cyan)]" />
                </div>
                <span className="text-xl font-bold gradient-text-cyber tracking-wider">PLAYBEINGS</span>
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Turn gaming into rewards with blockchain
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/dashboard/quests" className="hover:text-foreground transition-colors">Quests</Link></li>
                <li><Link to="/dashboard/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link></li>
                <li><Link to="/dashboard/news" className="hover:text-foreground transition-colors">News</Link></li>
                <li><Link to="/dashboard/rewards" className="hover:text-foreground transition-colors">Rewards</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://docs.carv.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="https://explorer-testnet.carv.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">CARV Explorer</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PlayBeings. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 space-y-4 hover-glow-cyan transition-all relative z-10">
      <div className="w-14 h-14 bg-black/40 rounded border-2 border-[var(--neon-cyan)] flex items-center justify-center text-[var(--neon-cyan)] neon-glow-cyan">
        {icon}
      </div>
      <h3 className="text-xl font-bold uppercase tracking-wider gradient-text-purple">{title}</h3>
      <p className="text-muted-foreground leading-relaxed uppercase tracking-wide text-sm">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative glass-card p-8 rounded-sm border-2 border-[var(--neon-magenta)]/20 space-y-4 hover-glow-magenta transition-all">
      <div className="w-14 h-14 bg-black/40 rounded border-2 border-[var(--neon-magenta)] flex items-center justify-center text-3xl font-bold text-[var(--neon-magenta)] neon-glow-magenta">
        {number}
      </div>
      <h3 className="text-xl font-bold uppercase tracking-wider gradient-text-cyber">{title}</h3>
      <p className="text-muted-foreground leading-relaxed uppercase tracking-wide text-sm">{description}</p>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center glass-card p-6 rounded-sm border-2 border-[var(--neon-purple)]/20 hover-glow-purple">
      <div className="text-4xl md:text-5xl font-bold gradient-text-cyber mb-3">{value}</div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

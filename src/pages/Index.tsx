import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
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
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function Index() {
  const stats = useQuery(api.stats.getPlatformStats);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButtons(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

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
              src="https://cdn.hercules.app/file_Evc6kLN23XZ1w4t1QNsD1IRy" 
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
                <Button 
                  variant="ghost" 
                  className="glass-card border-2 border-[var(--neon-purple)] hover:neon-glow-purple text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/20 font-bold uppercase tracking-wider text-lg px-10 h-14"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  LEARN MORE
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
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <StatItem label="Active Players" value={stats?.activePlayers.toString() || "0"} color="cyan" />
            <StatItem label="Quests Completed" value={stats?.questsCompleted.toString() || "0"} color="magenta" />
            <StatItem label="NFTs Minted" value={stats?.nftsMinted.toString() || "0"} color="purple" />
            <StatItem label="Rewards Distributed" value={`$${stats?.rewardsDistributed || 0}`} color="cyan" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-cyber uppercase tracking-wider">Everything You Need</h2>
            <p className="text-xl text-muted-foreground tracking-wide">
              Complete platform to earn, collect, and compete
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Gamepad2 className="w-6 h-6" />}
              title="Steam Integration"
              description="Sync your game library, playtime, and achievements automatically"
              color="cyan"
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Daily Quests"
              description="Complete 5 fresh challenges every day and earn points"
              color="magenta"
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title="NFT Trading Cards"
              description="Mint achievements as NFTs with bonus point multipliers"
              color="purple"
            />
            <FeatureCard
              icon={<DollarSign className="w-6 h-6" />}
              title="Real Rewards"
              description="Redeem points for gift cards and game credits"
              color="cyan"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Global Leaderboard"
              description="Compete for $1,000 monthly prize pool"
              color="magenta"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Blockchain Powered"
              description="Secure and transparent CARV SVM transactions"
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-cyber uppercase tracking-wider">How It Works</h2>
            <p className="text-xl text-muted-foreground tracking-wide">
              Start earning from gaming in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <StepCard
              number="1"
              title="Connect Steam"
              description="Link your Steam account to sync games and achievements"
              color="cyan"
            />
            <StepCard
              number="2"
              title="Complete Quests"
              description="Play games and complete daily challenges to earn points"
              color="magenta"
            />
            <StepCard
              number="3"
              title="Earn Rewards"
              description="Redeem points for gift cards or mint NFTs with bonuses"
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* CARV D.A.T.A Framework Section */}
      <section className="py-20 md:py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-sm border-2 border-green-500/30 mb-6">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm font-bold uppercase tracking-wider text-green-500">Powered by CARV</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-cyber uppercase tracking-wider">
                D.A.T.A AI Framework
              </h2>
              <p className="text-xl text-muted-foreground tracking-wide">
                Data Authentication, Trust, and Attestation
              </p>
            </div>

            <div className="glass-card border-2 border-green-500/20 p-8 md:p-12 space-y-6">
              <p className="text-lg text-foreground leading-relaxed">
                The D.A.T.A Framework empowers AI agents with seamless access to high-quality on-chain and off-chain data, 
                enabling them to make better-informed, autonomous decisions in decentralized ecosystems.
              </p>
              
              <p className="text-base text-muted-foreground leading-relaxed">
                At its core, D.A.T.A represents a pioneering implementation of DeepSeek's revolutionary reasoning-first approach 
                to AI autonomy. As the first framework to integrate DeepSeek's breakthrough self-evolving reasoning capabilities 
                in a Web3 context, D.A.T.A enables AI agents to develop sophisticated cognitive processes that mirror human-like 
                reasoning patterns.
              </p>

              <div className="grid md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[var(--neon-cyan)] uppercase tracking-wide flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    For Developers
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Transform static data into dynamic, actionable insights. Build smarter, more autonomous AI systems that 
                    require minimal human intervention, from trading bots that respond instantly to on-chain events to AI 
                    agents capable of executing autonomous strategies.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[var(--neon-magenta)] uppercase tracking-wide flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    For Blockchain Ecosystem
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Bridge on-chain and off-chain data seamlessly. Enable AI agents to make intelligent, cross-chain decisions 
                    and interact meaningfully within decentralized networks through agentic infrastructure that decentralizes trust.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[var(--neon-purple)] uppercase tracking-wide flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    For End-Users
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Securely control and monetize your data. Solve the challenge of fragmented, inaccessible, and untrustworthy 
                    data while maintaining full ownership and privacy control.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[var(--neon-cyan)] uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    For AI Researchers
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Empower AGI to evolve collaboratively within a decentralized ecosystem. Explore decentralized AI innovations 
                    that push the boundaries of what intelligent systems can achieve.
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <Button
                  asChild
                  className="glass-card border-2 border-green-500 text-green-500 hover:bg-green-500/20 font-bold uppercase tracking-wider text-lg px-10 h-14"
                >
                  <a href="https://docs.carv.io/d.a.t.a.-ai-framework/introduction" target="_blank" rel="noopener noreferrer">
                    Learn More About D.A.T.A
                  </a>
                </Button>
              </div>
            </div>
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
                <img 
                  src="https://cdn.hercules.app/file_Evc6kLN23XZ1w4t1QNsD1IRy" 
                  alt="PlayBeings" 
                  className="w-10 h-10 object-contain"
                />
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
                <li><a href="https://docs.playbeings.fun/documentation" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="http://explorer.testnet.carv.io/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">CARV SVM Testnet Explorer</a></li>
                <li><a href="https://docs.carv.io/d.a.t.a.-ai-framework/introduction" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">CARV D.A.T.A Framework</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PlayBeings. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Scroll Buttons */}
      {showScrollButtons && (
        <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-50">
          <Button
            onClick={scrollToTop}
            size="icon"
            className="glass-card w-12 h-12 rounded-full border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 hover:neon-glow-cyan shadow-lg"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
          <Button
            onClick={scrollToBottom}
            size="icon"
            className="glass-card w-12 h-12 rounded-full border-2 border-[var(--neon-magenta)] text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 hover:neon-glow-magenta shadow-lg"
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "cyan" | "magenta" | "purple";
}) {
  const colorClasses = {
    cyan: "border-[var(--neon-cyan)]/10 hover:border-[var(--neon-cyan)]/30 group-hover:text-[var(--neon-cyan)]",
    magenta: "border-[var(--neon-magenta)]/10 hover:border-[var(--neon-magenta)]/30 group-hover:text-[var(--neon-magenta)]",
    purple: "border-[var(--neon-purple)]/10 hover:border-[var(--neon-purple)]/30 group-hover:text-[var(--neon-purple)]",
  };

  return (
    <div className={`group glass-card p-6 rounded-sm border-2 ${colorClasses[color]} transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-start gap-4">
        <div className={`text-${color === "cyan" ? "[var(--neon-cyan)]" : color === "magenta" ? "[var(--neon-magenta)]" : "[var(--neon-purple)]"} transition-colors`}>
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold tracking-wide text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  color,
}: {
  number: string;
  title: string;
  description: string;
  color: "cyan" | "magenta" | "purple";
}) {
  const colorClasses = {
    cyan: "border-[var(--neon-cyan)]/10 hover:border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)]",
    magenta: "border-[var(--neon-magenta)]/10 hover:border-[var(--neon-magenta)]/30 text-[var(--neon-magenta)]",
    purple: "border-[var(--neon-purple)]/10 hover:border-[var(--neon-purple)]/30 text-[var(--neon-purple)]",
  };

  return (
    <div className={`relative glass-card p-6 rounded-sm border-2 ${colorClasses[color]} transition-all duration-300 hover:-translate-y-1`}>
      <div className="space-y-4">
        <div className={`text-5xl font-bold ${color === "cyan" ? "text-[var(--neon-cyan)]" : color === "magenta" ? "text-[var(--neon-magenta)]" : "text-[var(--neon-purple)]"}`}>
          {number}
        </div>
        <h3 className="text-xl font-bold tracking-wide text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: "cyan" | "magenta" | "purple" }) {
  const colorClasses = {
    cyan: "border-[var(--neon-cyan)]/10 hover:border-[var(--neon-cyan)]/30",
    magenta: "border-[var(--neon-magenta)]/10 hover:border-[var(--neon-magenta)]/30",
    purple: "border-[var(--neon-purple)]/10 hover:border-[var(--neon-purple)]/30",
  };

  return (
    <div className={`text-center glass-card p-6 rounded-sm border-2 ${colorClasses[color]} transition-all duration-300 hover:-translate-y-1`}>
      <div className="text-4xl md:text-5xl font-bold gradient-text-cyber mb-2">{value}</div>
      <div className="text-sm text-muted-foreground tracking-wide">{label}</div>
    </div>
  );
}

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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border backdrop-blur-xl bg-card/95 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">PlayBeings</span>
          </Link>
          <div className="flex items-center gap-4">
            <Authenticated>
              <Button asChild size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </Authenticated>
            <Unauthenticated>
              <SignInButton size="sm" />
            </Unauthenticated>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Powered by CARV SVM Blockchain</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Turn Your Gaming Into <span className="gradient-text">Real Rewards</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Connect your Steam account, complete daily quests, mint NFTs, and earn real rewards from your gaming achievements.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Authenticated>
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </Authenticated>
              <Unauthenticated>
                <SignInButton size="lg" className="text-lg px-8" />
              </Unauthenticated>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <StatItem label="Active Players" value="12,456" />
            <StatItem label="Quests Completed" value="186,234" />
            <StatItem label="NFTs Minted" value="45,891" />
            <StatItem label="Rewards Distributed" value="$28,450" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground">
              A complete platform to earn, collect, and compete
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
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Start earning from your gaming in three simple steps
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
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-12 text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Start Earning?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of gamers already earning rewards from their gaming.
            </p>
            <div className="pt-4">
              <Unauthenticated>
                <SignInButton size="lg" className="text-lg px-8" />
              </Unauthenticated>
              <Authenticated>
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </Authenticated>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">PlayBeings</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Turn your gaming into real rewards with blockchain technology.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/dashboard/quests" className="hover:text-foreground transition-colors">Quests</Link></li>
                <li><Link to="/dashboard/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link></li>
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
    <div className="p-6 bg-card border border-border rounded-lg space-y-4 hover:border-primary/50 transition-colors">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
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
    <div className="relative p-6 bg-card border border-border rounded-lg space-y-4">
      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-2xl font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

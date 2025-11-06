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
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                Powered by CARV SVM Testnet
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-balance">
              Play. Earn. Mint.
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Connect your Steam account, complete daily quests, and turn your
              gaming achievements into valuable NFTs
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
              <Button asChild variant="secondary" size="lg" className="text-lg px-8">
                <a
                  href="https://docs.carv.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Gamepad2 className="w-8 h-8" />}
            title="Steam Integration"
            description="Connect your Steam account and sync your game library, playtime, and achievements automatically"
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Daily Quests"
            description="Complete fresh challenges every day and earn points to climb the leaderboard"
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8" />}
            title="NFT Trading Cards"
            description="Mint your Steam trading cards as NFTs on CARV SVM and showcase your collection"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Instant Rewards"
            description="Earn points for every quest completed and gaming milestone achieved"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Leaderboard"
            description="Compete with players worldwide and prove you're the ultimate gamer"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="Web3 Gaming"
            description="Experience the future of gaming with blockchain-powered rewards and ownership"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-card border rounded-xl p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatItem label="Total Players" value="1,234" />
            <StatItem label="Quests Completed" value="45,678" />
            <StatItem label="NFTs Minted" value="8,901" />
          </div>
        </div>
      </div>
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
    <div className="p-6 bg-card border rounded-xl space-y-4 hover:border-primary/50 transition-colors">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary mb-2">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

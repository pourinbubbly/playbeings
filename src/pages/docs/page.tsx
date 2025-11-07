import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { 
  ArrowLeft, 
  Gamepad2, 
  Target, 
  Trophy, 
  Gift, 
  Flame,
  Users,
  Wallet,
  TrendingUp
} from "lucide-react";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background cyber-grid-animated">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button asChild variant="ghost" className="mb-8">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>

        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold gradient-text-cyber uppercase tracking-wider">Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about PlayBeings - from getting started to earning rewards
            </p>
          </div>

          {/* Getting Started */}
          <Section
            icon={<Gamepad2 className="w-6 h-6" />}
            title="Getting Started"
            color="cyan"
          >
            <div className="space-y-4">
              <Step number="1" title="Create Account">
                Visit <a href="https://playbeings.fun" target="_blank" rel="noopener noreferrer" className="text-[var(--neon-cyan)] hover:underline">playbeings.fun</a> and click "Sign In" to create your account using Google, Microsoft, or email.
              </Step>
              <Step number="2" title="Connect Steam">
                After signing in, go to your dashboard and click "Connect Steam Account". Enter your Steam profile URL or Steam ID to link your account.
              </Step>
              <Step number="3" title="Connect Wallet">
                Navigate to the Wallet section and connect your Backpack wallet. Make sure you have the CARV SVM testnet selected in your wallet.
              </Step>
            </div>
          </Section>

          {/* Daily Quests */}
          <Section
            icon={<Target className="w-6 h-6" />}
            title="Daily Quests"
            color="magenta"
          >
            <p className="mb-4">
              Complete 5 fresh challenges every day to earn points. Quests are automatically generated based on your Steam gaming activity.
            </p>
            <div className="space-y-2">
              <QuestType title="Play Time Quests" description="Play specific games for a certain amount of time" />
              <QuestType title="Achievement Quests" description="Unlock achievements in your games" />
              <QuestType title="Game Launch Quests" description="Simply launch and play specific games" />
              <QuestType title="Collection Quests" description="Own certain games in your library" />
              <QuestType title="Community Quests" description="Engage with the PlayBeings community" />
            </div>
            <div className="mt-4 glass-card p-4 rounded-sm border-2 border-[var(--neon-magenta)]/20">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Quests reset daily at midnight UTC. Make sure to complete them before they expire!
              </p>
            </div>
          </Section>

          {/* NFT Minting */}
          <Section
            icon={<Trophy className="w-6 h-6" />}
            title="NFT Minting & Boosts"
            color="purple"
          >
            <p className="mb-4">
              Mint your Steam achievements as NFTs on the CARV SVM blockchain. Each NFT provides a permanent point boost!
            </p>
            <div className="space-y-3 mb-4">
              <BoostTier rarity="Common" boost="5%" color="gray" />
              <BoostTier rarity="Rare" boost="10%" color="blue" />
              <BoostTier rarity="Epic" boost="15%" color="purple" />
            </div>
            <div className="space-y-2">
              <p className="text-sm"><strong>How to mint:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Go to the Cards page</li>
                <li>Load your Steam achievements</li>
                <li>Select an achievement to mint</li>
                <li>Approve the transaction in your Backpack wallet</li>
                <li>View your minted NFTs in the "My NFTs" section</li>
              </ol>
            </div>
          </Section>

          {/* Daily Check-In */}
          <Section
            icon={<Flame className="w-6 h-6" />}
            title="Daily Check-In & Streaks"
            color="cyan"
          >
            <p className="mb-4">
              Build your streak by checking in daily. Each check-in requires a CARV SVM testnet transaction and rewards you with points!
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span>Day 1:</span>
                <span className="text-[var(--neon-cyan)] font-bold">10 points</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Day 2-6:</span>
                <span className="text-[var(--neon-cyan)] font-bold">+2 points per day</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Day 7+:</span>
                <span className="text-[var(--neon-cyan)] font-bold">25 points</span>
              </div>
            </div>
            <div className="glass-card p-4 rounded-sm border-2 border-[var(--neon-cyan)]/20">
              <p className="text-sm text-muted-foreground">
                ⚡ <strong>Bonus:</strong> Your active NFT boosts apply to check-in rewards too!
              </p>
            </div>
          </Section>

          {/* Rewards */}
          <Section
            icon={<Gift className="w-6 h-6" />}
            title="Redeeming Rewards"
            color="magenta"
          >
            <p className="mb-4">
              Spend your hard-earned points on real gift cards from top platforms:
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <RewardCard platform="Steam" points="500-2000" />
              <RewardCard platform="Amazon" points="500-2000" />
              <RewardCard platform="Nintendo" points="500-2000" />
              <RewardCard platform="PlayStation" points="500-2000" />
              <RewardCard platform="Xbox" points="500-2000" />
              <RewardCard platform="Epic Games" points="500-2000" />
            </div>
            <div className="space-y-2">
              <p className="text-sm"><strong>How to redeem:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Go to the Rewards Store</li>
                <li>Choose your desired gift card</li>
                <li>Click "Redeem" and confirm</li>
                <li>Wait for admin approval (usually within 24-48 hours)</li>
                <li>Receive your gift card code via email</li>
              </ol>
            </div>
          </Section>

          {/* Leaderboard */}
          <Section
            icon={<TrendingUp className="w-6 h-6" />}
            title="Leaderboard & Prize Pool"
            color="purple"
          >
            <p className="mb-4">
              Compete with players worldwide for a share of the $1,000 monthly prize pool!
            </p>
            <div className="space-y-3 mb-4">
              <PrizeTier rank="1st Place" prize="$300" color="gold" />
              <PrizeTier rank="2nd Place" prize="$200" color="silver" />
              <PrizeTier rank="3rd Place" prize="$100" color="bronze" />
              <PrizeTier rank="4th-10th" prize="$50 each" color="cyan" />
              <PrizeTier rank="11th-100th" prize="Split remaining" color="purple" />
            </div>
            <div className="glass-card p-4 rounded-sm border-2 border-[var(--neon-purple)]/20">
              <p className="text-sm text-muted-foreground">
                🏆 <strong>Note:</strong> Leaderboard resets monthly. Prize distribution happens on the 1st of each month.
              </p>
            </div>
          </Section>

          {/* Community */}
          <Section
            icon={<Users className="w-6 h-6" />}
            title="Community Features"
            color="cyan"
          >
            <div className="space-y-4">
              <Feature title="Profile System">
                Customize your profile with avatar, banner, bio, and social links. Build your gaming presence!
              </Feature>
              <Feature title="Follow System">
                Follow other players, see their stats, and build your gaming network.
              </Feature>
              <Feature title="Profile Comments">
                Leave comments on player profiles. Each comment requires a CARV SVM testnet transaction to prevent spam.
              </Feature>
              <Feature title="Public Profiles">
                View other players' game libraries, NFT collections, and achievements.
              </Feature>
            </div>
          </Section>

          {/* CARV SVM */}
          <Section
            icon={<Wallet className="w-6 h-6" />}
            title="CARV SVM Blockchain"
            color="magenta"
          >
            <p className="mb-4">
              PlayBeings is built on the CARV SVM testnet, ensuring secure and transparent transactions.
            </p>
            <div className="space-y-2">
              <InfoItem label="Network" value="CARV SVM Testnet" />
              <InfoItem label="RPC URL" value="https://rpc.testnet.carv.io/rpc" />
              <InfoItem label="Explorer" value={
                <a href="https://scan-testnet.carv.io" target="_blank" rel="noopener noreferrer" className="text-[var(--neon-cyan)] hover:underline">
                  scan-testnet.carv.io
                </a>
              } />
              <InfoItem label="Wallet" value="Backpack Wallet (recommended)" />
            </div>
            <div className="mt-4 glass-card p-4 rounded-sm border-2 border-[var(--neon-magenta)]/20">
              <p className="text-sm text-muted-foreground">
                💰 <strong>Testnet:</strong> All transactions use test tokens with no real monetary value. This is for testing purposes only.
              </p>
            </div>
          </Section>

          {/* Support */}
          <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 text-center space-y-4">
            <h2 className="text-2xl font-bold">Need Help?</h2>
            <p className="text-muted-foreground">
              If you have any questions or run into issues, feel free to reach out to our support team.
            </p>
            <Button asChild className="glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20">
              <a href="mailto:support@playbeings.fun">Contact Support</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ 
  icon, 
  title, 
  color, 
  children 
}: { 
  icon: React.ReactNode; 
  title: string; 
  color: "cyan" | "magenta" | "purple";
  children: React.ReactNode;
}) {
  const colorClasses = {
    cyan: "border-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]",
    magenta: "border-[var(--neon-magenta)]/20 text-[var(--neon-magenta)]",
    purple: "border-[var(--neon-purple)]/20 text-[var(--neon-purple)]",
  };

  return (
    <div className={`glass-card p-8 rounded-sm border-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={colorClasses[color]}>
          {icon}
        </div>
        <h2 className="text-3xl font-bold tracking-wide">{title}</h2>
      </div>
      <div className="text-foreground">
        {children}
      </div>
    </div>
  );
}

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--neon-cyan)]/20 border-2 border-[var(--neon-cyan)] flex items-center justify-center font-bold text-[var(--neon-cyan)]">
        {number}
      </div>
      <div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function QuestType({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-2 h-2 rounded-full bg-[var(--neon-magenta)] mt-2" />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function BoostTier({ rarity, boost, color }: { rarity: string; boost: string; color: string }) {
  return (
    <div className="flex justify-between items-center glass-card p-3 rounded-sm border border-border">
      <span className={`text-sm font-bold text-${color}-400`}>{rarity}</span>
      <span className="text-[var(--neon-purple)] font-bold">{boost} Boost</span>
    </div>
  );
}

function RewardCard({ platform, points }: { platform: string; points: string }) {
  return (
    <div className="glass-card p-4 rounded-sm border border-border text-center">
      <p className="font-bold">{platform}</p>
      <p className="text-xs text-muted-foreground">{points} pts</p>
    </div>
  );
}

function PrizeTier({ rank, prize, color }: { rank: string; prize: string; color: string }) {
  return (
    <div className="flex justify-between items-center glass-card p-3 rounded-sm border border-border">
      <span className="text-sm font-semibold">{rank}</span>
      <span className={`font-bold ${color === 'gold' ? 'text-yellow-400' : color === 'silver' ? 'text-gray-300' : color === 'bronze' ? 'text-orange-400' : color === 'cyan' ? 'text-[var(--neon-cyan)]' : 'text-[var(--neon-purple)]'}`}>
        {prize}
      </span>
    </div>
  );
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

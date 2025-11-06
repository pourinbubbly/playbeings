import { Card, CardContent } from "@/components/ui/card.tsx";
import { CreditCard, Sparkles, Package } from "lucide-react";

interface CardStatsProps {
  stats: {
    totalCards: number;
    mintedCards: number;
    unmintedCards: number;
    rarityCount: Record<string, number>;
  };
}

const RARITY_COLORS: Record<string, string> = {
  Common: "text-gray-500",
  Uncommon: "text-green-500",
  Rare: "text-blue-500",
  Epic: "text-purple-500",
  Legendary: "text-orange-500",
};

export function CardStats({ stats }: CardStatsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<CreditCard className="w-5 h-5" />}
          label="Total Cards"
          value={stats.totalCards.toString()}
        />
        <StatCard
          icon={<Sparkles className="w-5 h-5" />}
          label="Minted as NFT"
          value={stats.mintedCards.toString()}
        />
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Not Minted"
          value={stats.unmintedCards.toString()}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Cards by Rarity
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(stats.rarityCount).map(([rarity, count]) => (
                <div
                  key={rarity}
                  className="bg-muted/50 rounded-lg p-3 text-center"
                >
                  <div className={`text-2xl font-bold ${RARITY_COLORS[rarity]}`}>
                    {count}
                  </div>
                  <div className="text-xs text-muted-foreground">{rarity}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

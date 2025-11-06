import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { DashboardLayout } from "@/pages/dashboard/_components/dashboard-layout.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Sparkles, ExternalLink, Zap, Trophy, TrendingUp } from "lucide-react";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";
import { Button } from "@/components/ui/button.tsx";

export default function MyNFTs() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <NFTsContent />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedPage />
      </Unauthenticated>
    </>
  );
}

function NFTsContent() {
  const mintedNFTs = useQuery(api.nft.getMintedNFTs);
  const activeBoosts = useQuery(api.nft.getActiveBoosts);

  if (mintedNFTs === undefined || activeBoosts === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalBoost = activeBoosts.reduce((sum, boost) => sum + boost.boostPercentage, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 neon-glow-cyan">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan">
                <Sparkles className="w-8 h-8 text-[var(--neon-cyan)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text-cyber tracking-wider uppercase">
                  My NFTs
                </h1>
                <p className="text-muted-foreground text-sm uppercase tracking-wide mt-1">
                  Achievement NFTs & Point Boosts
                </p>
              </div>
            </div>

            {totalBoost > 0 && (
              <div className="glass-card border-2 border-[var(--neon-magenta)]/30 px-6 py-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-[var(--neon-magenta)]" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Total Boost Active
                    </p>
                    <p className="text-2xl font-bold text-[var(--neon-magenta)]">
                      +{totalBoost}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Boosts Section */}
        {activeBoosts.length > 0 && (
          <Card className="glass-card border-2 border-[var(--neon-purple)]/30">
            <CardHeader>
              <CardTitle className="text-xl text-[var(--neon-purple)] uppercase tracking-wider flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Active Boosts
              </CardTitle>
              <CardDescription className="uppercase tracking-wide">
                All points earned are multiplied by these boosts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBoosts.map((boost) => (
                  <div
                    key={boost._id}
                    className="glass-card p-4 border-2 border-[var(--neon-magenta)]/30 hover:border-[var(--neon-magenta)]/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--neon-cyan)] uppercase tracking-wide">
                          NFT Boost
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                          {boost.nftAddress.slice(0, 8)}...{boost.nftAddress.slice(-6)}
                        </p>
                      </div>
                      <Badge className="bg-[var(--neon-magenta)]/20 border-2 border-[var(--neon-magenta)] text-[var(--neon-magenta)] font-bold text-lg px-4 py-2">
                        +{boost.boostPercentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* NFT Gallery */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--neon-cyan)] uppercase tracking-wider flex items-center gap-3">
            <Trophy className="w-6 h-6" />
            NFT Collection ({mintedNFTs.length})
          </h2>

          {mintedNFTs.length === 0 ? (
            <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold text-foreground uppercase tracking-wider mb-2">
                  No NFTs Yet
                </h3>
                <p className="text-muted-foreground text-center max-w-md uppercase tracking-wide text-sm">
                  Mint your first achievement NFT from the NFT Cards page to get started
                </p>
                <Button
                  onClick={() => window.location.href = "/dashboard/cards"}
                  className="mt-6 glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 hover:neon-glow-cyan font-semibold uppercase tracking-wider"
                >
                  Go to NFT Cards
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mintedNFTs.map((nft) => {
                const hasBoost = activeBoosts.find(b => b.nftAddress === nft.nftAddress);
                return (
                  <Card key={nft._id} className="glass-card border-2 border-[var(--neon-cyan)]/30 hover:border-[var(--neon-cyan)]/60 transition-all overflow-hidden group">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-black/40">
                      <img
                        src={nft.imageUrl}
                        alt={nft.cardName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {hasBoost && (
                        <div className="absolute top-3 right-3 bg-[var(--neon-magenta)]/90 backdrop-blur-sm border-2 border-[var(--neon-magenta)] px-3 py-1.5 rounded neon-glow-magenta">
                          <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            +{hasBoost.boostPercentage}%
                          </p>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border border-[var(--neon-cyan)]/50 px-2 py-1 rounded">
                        <p className="text-xs font-semibold text-[var(--neon-cyan)] uppercase tracking-wider">
                          {nft.rarity}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-[var(--neon-cyan)] uppercase tracking-wide text-lg truncate">
                          {nft.cardName}
                        </h3>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide truncate">
                          {nft.gameName}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="uppercase tracking-wider">
                          Minted: {new Date(nft.earnedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {nft.nftTokenId && (
                        <div className="pt-2 border-t border-[var(--neon-cyan)]/20">
                          <a
                            href={`https://explorer.testnet.carv.io/address/${nft.nftAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-[var(--neon-cyan)] hover:text-[var(--neon-magenta)] transition-colors uppercase tracking-wider font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View on CARV Explorer
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

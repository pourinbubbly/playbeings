import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { DashboardLayout } from "@/pages/dashboard/_components/dashboard-layout.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Sparkles, ExternalLink, Zap, Trophy, TrendingUp, Clock, AlertCircle } from "lucide-react";
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

// Helper function to get time remaining
function getTimeRemaining(expiresAt: number | undefined): string {
  if (!expiresAt || typeof expiresAt !== 'number') return "N/A";
  
  const now = Date.now();
  const diff = expiresAt - now;
  
  if (diff <= 0) return "Expired";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m`;
  }
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

  // Create a map of nftAddress to boost info
  const boostMap = new Map(
    activeBoosts.map((boost) => [boost.nftAddress, boost])
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="glass-card p-8 rounded-lg border border-[var(--neon-cyan)]/20">
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
                  Achievement NFTs & Point Boosts (30-day active period)
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
          <Card className="glass-card border border-[var(--neon-purple)]/30">
            <CardHeader>
              <CardTitle className="text-xl text-[var(--neon-purple)] uppercase tracking-wider flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Active Boosts
              </CardTitle>
              <CardDescription className="uppercase tracking-wide">
                All points earned are multiplied by these boosts • Boosts expire 30 days after minting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBoosts.map((boost) => {
                  const timeRemaining = getTimeRemaining(boost.expiresAt);
                  const daysRemaining = boost.expiresAt ? Math.floor((boost.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 3;
                  
                  return (
                    <div
                      key={boost._id}
                      className="glass-card p-4 border border-[var(--neon-magenta)]/30 hover:border-[var(--neon-magenta)]/60 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
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
                      
                      {/* Time remaining */}
                      <div className={`flex items-center gap-2 text-xs ${isExpiringSoon ? 'text-[var(--neon-magenta)]' : 'text-muted-foreground'}`}>
                        <Clock className="w-3 h-3" />
                        <span className="uppercase tracking-wide">
                          {timeRemaining} remaining
                        </span>
                      </div>
                      
                      {isExpiringSoon && (
                        <div className="flex items-center gap-2 text-xs text-[var(--neon-magenta)] mt-2 bg-[var(--neon-magenta)]/10 p-2 rounded">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span className="uppercase tracking-wide">
                            Expiring soon!
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
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
            <Card className="glass-card border border-[var(--neon-cyan)]/20">
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
                const boostInfo = nft.nftAddress ? boostMap.get(nft.nftAddress) : undefined;
                const hasActiveBoost = !!boostInfo;
                
                return (
                  <Card key={nft._id} className="glass-card border border-[var(--neon-cyan)]/30 hover:border-[var(--neon-cyan)]/60 transition-all overflow-hidden group">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-black/40">
                      <img
                        src={nft.imageUrl}
                        alt={nft.cardName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {hasActiveBoost && (
                        <div className="absolute top-3 right-3 bg-[var(--neon-magenta)]/90 backdrop-blur-sm border-2 border-[var(--neon-magenta)] px-3 py-1.5 rounded neon-glow-magenta">
                          <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            +{boostInfo.boostPercentage}%
                          </p>
                        </div>
                      )}
                      {!hasActiveBoost && (
                        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm border border-muted-foreground/50 px-3 py-1.5 rounded">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Boost Expired
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

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="uppercase tracking-wider">
                            Minted: {new Date(nft.earnedAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {/* Boost Status */}
                        {hasActiveBoost && boostInfo ? (
                          <div className="flex items-center gap-2 text-xs bg-[var(--neon-magenta)]/10 p-2 rounded border border-[var(--neon-magenta)]/30">
                            <Zap className="w-3 h-3 text-[var(--neon-magenta)]" />
                            <div className="flex-1">
                              <p className="text-[var(--neon-magenta)] uppercase tracking-wide font-semibold">
                                Boost Active
                              </p>
                              <p className="text-muted-foreground">
                                {boostInfo.expiresAt ? `${getTimeRemaining(boostInfo.expiresAt)} remaining` : 'Active'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs bg-black/20 p-2 rounded border border-muted-foreground/20">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-muted-foreground uppercase tracking-wide font-semibold">
                                Boost Expired
                              </p>
                              <p className="text-muted-foreground text-xs">
                                30-day period ended
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {nft.nftTokenId && (
                        <div className="pt-2 border-t border-[var(--neon-cyan)]/20">
                          <a
                            href={`http://explorer.testnet.carv.io/address/${nft.nftAddress}`}
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

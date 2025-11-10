import { useState, useEffect, useCallback } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Sparkles, Trophy, Loader2, RefreshCw, Gamepad2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";

export default function Cards() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <CardsContent />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedPage />
      </Unauthenticated>
    </>
  );
}

interface TopGame {
  appId: number;
  name: string;
  playtime: number;
  imageUrl: string;
}

interface SteamAchievement {
  id: string;
  name: string;
  description: string;
  gameName: string;
  gameId: number;
  imageUrl: string;
  iconUrl: string;
  rarity: string;
}

function CardsContent() {
  const [games, setGames] = useState<TopGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<TopGame | null>(null);
  const [achievements, setAchievements] = useState<SteamAchievement[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [minting, setMinting] = useState<string | null>(null);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const connectedWallet = useQuery(api.wallets.getConnectedWallet);
  const steamProfile = useQuery(api.profiles.getSteamProfile, {});
  const mintedNFTs = useQuery(api.nft.getMintedNFTs);
  const getTopGames = useAction(api.steam.getTopGames);
  const getGameAchievements = useAction(api.steam.getGameAchievements);
  const saveMinedNFT = useMutation(api.cards.saveMinedNFT);

  // Check if an achievement is already minted using unique achievement ID
  const isAlreadyMinted = (achievement: SteamAchievement): boolean => {
    if (!mintedNFTs) return false;
    return mintedNFTs.some(
      (nft) => nft.achievementId === achievement.id
    );
  };

  const handleLoadGames = useCallback(async (silent = false) => {
    if (!steamProfile?.steamId) {
      if (!silent) {
        toast.error("Please connect your Steam account first");
      }
      return;
    }

    setLoadingGames(true);
    try {
      const result = await getTopGames({ steamId: steamProfile.steamId });
      setGames(result);
      if (!silent) {
        if (result.length === 0) {
          toast.info("No games found", {
            description: "Play some games to see them here!",
          });
        } else {
          toast.success(`Loaded ${result.length} games!`);
        }
      }
    } catch (error) {
      if (!silent) {
        toast.error("Failed to load games", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } finally {
      setLoadingGames(false);
    }
  }, [steamProfile?.steamId, getTopGames]);

  // Auto-load games on mount
  useEffect(() => {
    if (steamProfile?.steamId && !hasAutoLoaded) {
      setHasAutoLoaded(true);
      handleLoadGames(true);
    }
  }, [steamProfile?.steamId, hasAutoLoaded, handleLoadGames]);

  const handleGameClick = async (game: TopGame) => {
    setSelectedGame(game);
    setAchievements([]);
    setLoadingAchievements(true);
    
    try {
      if (!steamProfile?.steamId) {
        toast.error("Steam account not connected");
        return;
      }

      const result = await getGameAchievements({
        steamId: steamProfile.steamId,
        appId: game.appId,
        gameName: game.name,
      });

      setAchievements(result);
      
      if (result.length === 0) {
        toast.info("No achievements found", {
          description: "This game has no unlocked achievements yet",
        });
      }
    } catch (error) {
      toast.error("Failed to load achievements", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      setSelectedGame(null);
    } finally {
      setLoadingAchievements(false);
    }
  };

  const handleMint = async (achievement: SteamAchievement) => {
    if (!connectedWallet) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your Backpack wallet to continue",
        duration: 5000,
        action: {
          label: "Go to Wallet",
          onClick: () => {
            window.location.href = "/dashboard/wallet";
          },
        },
      });
      return;
    }

    // Check if already minted
    if (isAlreadyMinted(achievement)) {
      toast.error("Already Minted", {
        description: "This achievement has already been minted as an NFT",
      });
      return;
    }

    setMinting(achievement.id);
    try {
      // Dynamically import wallet functions
      const { mintNFTOnCARV } = await import("@/lib/wallet.ts");
      
      toast.info("Approve transaction in Backpack...", {
        description: "Please confirm the transaction in your wallet",
      });

      const { signature, explorerUrl, mintAddress } = await mintNFTOnCARV(
        achievement.name,
        achievement.description,
        achievement.gameName,
        achievement.imageUrl
      );

      // Calculate boost based on rarity
      let boost = 0.05; // Common: 0.05%
      if (achievement.rarity === "Uncommon") boost = 0.1; // Uncommon: 0.1%
      else if (achievement.rarity === "Rare") boost = 0.5; // Rare: 0.5%
      else if (achievement.rarity === "Epic") boost = 1; // Epic: 1%
      
      // Save to database with boost
      await saveMinedNFT({
        appId: achievement.gameId,
        gameName: achievement.gameName,
        cardName: achievement.name,
        achievementId: achievement.id,
        imageUrl: achievement.imageUrl,
        rarity: achievement.rarity,
        nftAddress: mintAddress,
        nftTokenId: signature,
        boostPercentage: boost,
      });
      
      toast.success(`Achievement NFT Minted!`, {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-[var(--neon-magenta)]">+{boost}% point boost activated!</p>
            <p className="text-xs text-muted-foreground">Mint Address: {mintAddress.slice(0, 8)}...{mintAddress.slice(-6)}</p>
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--neon-cyan)] hover:underline text-xs flex items-center gap-1"
            >
              View on CARV Explorer →
            </a>
          </div>
        ),
        duration: 10000,
      });

      // Remove minted achievement from list
      setAchievements(prev => prev.filter(a => a.id !== achievement.id));
    } catch (error) {
      console.error("Minting error:", error);
      
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message.includes("already been minted") || error.message.includes("CONFLICT")) {
          toast.error("Already Minted", {
            description: "This achievement has already been minted as an NFT",
          });
        } else if (error.message.includes("cancelled by user")) {
          toast.error("Minting Cancelled", {
            description: "You cancelled the transaction in your wallet",
          });
        } else if (error.message.includes("Insufficient SOL")) {
          toast.error("Insufficient Balance", {
            description: "You need SOL for the transaction and NFT rent",
          });
        } else if (error.message.includes("multiple attempts")) {
          toast.error("Network Error", {
            description: "Please check your connection and try again",
          });
        } else {
          toast.error("Minting failed", {
            description: error.message || "Please try again",
          });
        }
      } else {
        toast.error("Minting failed", {
          description: "An unexpected error occurred",
        });
      }
    } finally {
      setMinting(null);
    }
  };

  if (connectedWallet === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Card */}
        <div className="glass-card p-8 rounded-lg border border-[var(--neon-cyan)]/20">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan">
              <Trophy className="w-8 h-8 text-[var(--neon-cyan)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-cyber tracking-wider uppercase">
                Achievement NFTs
              </h1>
              <p className="text-muted-foreground text-sm uppercase tracking-wide mt-1">
                Select a game • View achievements • Mint as NFTs • Earn 0.05-1% boost
              </p>
            </div>
          </div>
        </div>

        {/* No Steam Profile */}
        {!steamProfile?.steamId ? (
          <div className="glass-card p-8 rounded-lg border border-[var(--neon-cyan)]/20 text-center">
            <p className="text-muted-foreground uppercase tracking-wide">
              Please connect your Steam account first
            </p>
          </div>
        ) : loadingGames && games.length === 0 ? (
          <div className="glass-card p-8 rounded-lg border border-[var(--neon-cyan)]/20 text-center space-y-4">
            <Loader2 className="w-16 h-16 text-[var(--neon-cyan)] mx-auto animate-spin" />
            <p className="text-muted-foreground uppercase tracking-wide">
              Loading games...
            </p>
          </div>
        ) : games.length === 0 ? (
          <div className="glass-card p-8 rounded-lg border border-[var(--neon-cyan)]/20 text-center space-y-4">
            <Gamepad2 className="w-16 h-16 text-[var(--neon-cyan)] mx-auto opacity-50" />
            <p className="text-muted-foreground uppercase tracking-wide">
              No games found
            </p>
            <p className="text-sm text-muted-foreground">
              Play some games on Steam to see them here!
            </p>
            <Button 
              onClick={() => handleLoadGames(false)}
              disabled={loadingGames}
              className="glass-card border-2 border-[var(--neon-cyan)] hover:neon-glow-cyan text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 font-bold uppercase tracking-wider"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : null}

        {/* Games Grid */}
        {games.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                {games.length} games • Click to view achievements
              </p>
              <Button 
                onClick={() => handleLoadGames(false)}
                disabled={loadingGames}
                size="sm"
                variant="ghost"
                className="glass-card border border-[var(--neon-cyan)]/40 hover:neon-glow-cyan text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20"
              >
                {loadingGames ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => (
                <button
                  key={game.appId}
                  onClick={() => handleGameClick(game)}
                  className="glass-card rounded-lg border border-[var(--neon-cyan)]/20 overflow-hidden transition-all group hover:border-[var(--neon-cyan)]/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] text-left"
                >
                  {/* Game Image */}
                  <div className="relative aspect-[616/353] bg-black/40 overflow-hidden">
                    <img
                      src={game.imageUrl}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'w-full h-full flex items-center justify-center';
                          placeholder.innerHTML = '<svg class="w-20 h-20 text-[var(--neon-cyan)]/30" fill="currentColor" viewBox="0 0 24 24"><path d="M21,6H3C1.9,6,1,6.9,1,8v8c0,1.1,0.9,2,2,2h18c1.1,0,2-0.9,2-2V8C23,6.9,22.1,6,21,6z M21,16H3V8h18V16z M6,15h2v-2H6V15z M6,11h2V9H6V11z M9,15h2v-2H9V15z M9,11h2V9H9V11z M12,15h2v-2h-2V15z M12,11h2V9h-2V11z M15,15h2v-2h-2V15z M15,11h2V9h-2V11z M18,15h2v-2h-2V15z M18,11h2V9h-2V11z"/></svg>';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                    {/* Game Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-sm uppercase tracking-wide line-clamp-2 text-white mb-2">
                        {game.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[var(--neon-cyan)]">
                        <Trophy className="w-3 h-3" />
                        <span>{Math.round(game.playtime / 60)} hours played</span>
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="p-4 bg-black/20">
                    <div className="flex items-center justify-center gap-2 text-[var(--neon-cyan)] text-sm font-semibold uppercase tracking-wide">
                      <Trophy className="w-4 h-4" />
                      View Achievements
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Achievements Dialog */}
        <Dialog open={!!selectedGame} onOpenChange={(open) => !open && setSelectedGame(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass-card border-2 border-[var(--neon-cyan)]/40">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedGame(null)}
                  className="glass-card border border-[var(--neon-purple)]/40 hover:border-[var(--neon-cyan)]/60"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                  <div className="gradient-text-cyber uppercase tracking-wider">
                    {selectedGame?.name}
                  </div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1 font-normal">
                    {achievements.length} achievements available to mint
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Loading State */}
            {loadingAchievements && (
              <div className="py-16 text-center space-y-4">
                <Loader2 className="w-16 h-16 text-[var(--neon-cyan)] mx-auto animate-spin" />
                <p className="text-muted-foreground uppercase tracking-wide">
                  Loading achievements...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!loadingAchievements && achievements.length === 0 && (
              <div className="py-16 text-center space-y-4">
                <Trophy className="w-16 h-16 text-[var(--neon-cyan)] mx-auto opacity-50" />
                <p className="text-muted-foreground uppercase tracking-wide">
                  No achievements found
                </p>
                <p className="text-sm text-muted-foreground">
                  Play this game and unlock achievements to mint NFTs!
                </p>
              </div>
            )}

            {/* Achievements Grid */}
            {!loadingAchievements && achievements.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {achievements.map((achievement) => {
                  const alreadyMinted = isAlreadyMinted(achievement);
                  const rarityColor =
                    achievement.rarity === "Rare" ? "text-[var(--neon-magenta)]" :
                    achievement.rarity === "Uncommon" ? "text-[var(--neon-cyan)]" :
                    "text-[var(--neon-purple)]";

                  return (
                    <div
                      key={achievement.id}
                      className={`glass-card rounded-lg border overflow-hidden transition-all ${
                        alreadyMinted 
                          ? "border-[var(--neon-purple)]/20 opacity-70" 
                          : "border-[var(--neon-cyan)]/20 hover:border-[var(--neon-cyan)]/60"
                      }`}
                    >
                      {/* Achievement Image */}
                      <div className="relative aspect-[616/353] bg-black/40 overflow-hidden">
                        <img
                          src={achievement.imageUrl}
                          alt={achievement.gameName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/616x353?text=Achievement";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                        {/* Status Badges */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <Badge className={`${rarityColor} bg-black/60 border border-current font-semibold uppercase tracking-wider text-xs`}>
                            {achievement.rarity}
                          </Badge>
                          {alreadyMinted && (
                            <Badge className="bg-[var(--neon-purple)]/80 border border-[var(--neon-purple)] text-white font-semibold uppercase tracking-wider text-xs">
                              Minted
                            </Badge>
                          )}
                        </div>

                        {/* Achievement Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-bold text-sm uppercase tracking-wide line-clamp-1 text-white">
                            {achievement.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {achievement.description}
                          </p>
                        </div>
                      </div>

                      {/* Mint Button */}
                      <div className="p-3 bg-black/20">
                        {alreadyMinted ? (
                          <Button
                            disabled
                            size="sm"
                            className="w-full glass-card border border-[var(--neon-purple)]/30 text-[var(--neon-purple)] bg-[var(--neon-purple)]/10 font-bold uppercase tracking-wider cursor-not-allowed"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Minted
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleMint(achievement)}
                            disabled={!connectedWallet || minting === achievement.id}
                            size="sm"
                            className="w-full glass-card border border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider"
                          >
                            {minting === achievement.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Minting...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Mint NFT
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

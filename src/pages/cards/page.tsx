import { useState } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Sparkles, Trophy, Loader2 } from "lucide-react";
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
  const [achievements, setAchievements] = useState<SteamAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState<string | null>(null);
  const connectedWallet = useQuery(api.wallets.getConnectedWallet);
  const steamProfile = useQuery(api.profiles.getSteamProfile, {});
  const mintedNFTs = useQuery(api.nft.getMintedNFTs);
  const getAchievements = useAction(api.steam.getSteamAchievements);
  const saveMinedNFT = useMutation(api.cards.saveMinedNFT);

  // Check if an achievement is already minted using unique achievement ID
  const isAlreadyMinted = (achievement: SteamAchievement): boolean => {
    if (!mintedNFTs) return false;
    return mintedNFTs.some(
      (nft) => nft.achievementId === achievement.id
    );
  };

  const handleLoadAchievements = async () => {
    if (!steamProfile?.steamId) {
      toast.error("Please connect your Steam account first");
      return;
    }

    setLoading(true);
    try {
      const result = await getAchievements({ steamId: steamProfile.steamId });
      setAchievements(result);
      if (result.length === 0) {
        toast.info("No achievements found", {
          description: "Play some games and unlock achievements to mint NFTs!",
        });
      } else {
        toast.success(`Loaded ${result.length} achievements!`);
      }
    } catch (error) {
      toast.error("Failed to load achievements", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
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
        achievementId: achievement.id, // Pass the unique achievement ID
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
        } else if (error.message.includes("Plugin Closed") || error.message.includes("User rejected")) {
          toast.error("Transaction Cancelled", {
            description: "You cancelled the transaction in your wallet",
          });
        } else {
          toast.error("Minting failed", {
            description: error.message || "Transaction was rejected or failed",
          });
        }
      } else {
        toast.error("Minting failed", {
          description: "Transaction was rejected or failed",
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
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 neon-glow-cyan">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan">
              <Trophy className="w-8 h-8 text-[var(--neon-cyan)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-cyber tracking-wider uppercase">
                Achievement NFTs
              </h1>
              <p className="text-muted-foreground text-sm uppercase tracking-wide mt-1">
                Load Steam achievements • Mint as NFTs • Earn 0.05-1% boost per achievement
              </p>
            </div>
          </div>
        </div>

        {/* Load Achievements Button */}
        {!steamProfile?.steamId ? (
          <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 text-center">
            <p className="text-muted-foreground uppercase tracking-wide">
              Please connect your Steam account first to load achievements
            </p>
          </div>
        ) : achievements.length === 0 ? (
          <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 text-center space-y-4">
            <Trophy className="w-16 h-16 text-[var(--neon-cyan)] mx-auto opacity-50" />
            <p className="text-muted-foreground uppercase tracking-wide">
              Load your unlocked Steam achievements to mint as NFTs
            </p>
            <Button 
              onClick={handleLoadAchievements}
              disabled={loading}
              className="glass-card border-2 border-[var(--neon-cyan)] hover:neon-glow-cyan text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 font-bold uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  Load Achievements
                </>
              )}
            </Button>
          </div>
        ) : null}

        {/* Achievements Grid */}
        {achievements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {achievements.map((achievement) => {
              const alreadyMinted = isAlreadyMinted(achievement);
              const rarityColor =
                achievement.rarity === "Rare" ? "text-[var(--neon-magenta)]" :
                achievement.rarity === "Uncommon" ? "text-[var(--neon-cyan)]" :
                "text-[var(--neon-purple)]";

              return (
                <div
                  key={achievement.id}
                  className={`glass-card rounded-sm border-2 overflow-hidden transition-all group ${
                    alreadyMinted 
                      ? "border-[var(--neon-purple)]/20 opacity-70" 
                      : "border-[var(--neon-cyan)]/20 hover-glow-cyan"
                  }`}
                >
                  {/* Achievement Image */}
                  <div className="relative aspect-[616/353] bg-black/40 overflow-hidden">
                    <img
                      src={achievement.imageUrl}
                      alt={achievement.gameName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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

                    {/* Achievement Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-[var(--neon-cyan)]" />
                        <span className="text-xs text-[var(--neon-cyan)] uppercase tracking-wide font-semibold">
                          {achievement.gameName}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm uppercase tracking-wide line-clamp-1 text-white">
                        {achievement.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {achievement.description}
                      </p>
                    </div>
                  </div>

                  {/* Mint Button */}
                  <div className="p-4 bg-black/20">
                    {alreadyMinted ? (
                      <Button
                        disabled
                        className="w-full glass-card border-2 border-[var(--neon-purple)]/30 text-[var(--neon-purple)] bg-[var(--neon-purple)]/10 font-bold uppercase tracking-wider cursor-not-allowed"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Already Minted
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleMint(achievement)}
                        disabled={!connectedWallet || minting === achievement.id}
                        className="w-full glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider"
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
      </div>
    </DashboardLayout>
  );
}

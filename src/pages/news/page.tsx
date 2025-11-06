import { useState } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Newspaper, ExternalLink, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";
import { formatDistanceToNow } from "date-fns";

export default function News() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <NewsContent />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedPage />
      </Unauthenticated>
    </>
  );
}

interface NewsItem {
  id: string;
  title: string;
  url: string;
  author: string;
  content: string;
  date: number;
  feedName: string;
  appId: number;
  gameName: string;
  gameIcon: string;
}

function NewsContent() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const steamProfile = useQuery(api.profiles.getSteamProfile, {});
  const getNews = useAction(api.steam.getSteamNews);

  const handleLoadNews = async () => {
    if (!steamProfile?.steamId) {
      toast.error("Please connect your Steam account first");
      return;
    }

    setLoading(true);
    try {
      const result = await getNews({ steamId: steamProfile.steamId });
      setNews(result);
      if (result.length === 0) {
        toast.info("No news found", {
          description: "Play some games to see their latest updates!",
        });
      } else {
        toast.success(`Loaded ${result.length} news articles!`);
      }
    } catch (error) {
      toast.error("Failed to load news", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (steamProfile === undefined) {
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
              <Newspaper className="w-8 h-8 text-[var(--neon-cyan)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-cyber tracking-wider uppercase">
                Game News
              </h1>
              <p className="text-muted-foreground text-sm uppercase tracking-wide mt-1">
                Latest updates from your favorite games
              </p>
            </div>
          </div>
        </div>

        {/* Load News Button */}
        {!steamProfile?.steamId ? (
          <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 text-center">
            <p className="text-muted-foreground uppercase tracking-wide">
              Please connect your Steam account first to load game news
            </p>
          </div>
        ) : news.length === 0 ? (
          <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 text-center space-y-4">
            <Newspaper className="w-16 h-16 text-[var(--neon-cyan)] mx-auto opacity-50" />
            <p className="text-muted-foreground uppercase tracking-wide">
              Load the latest news from your most played games
            </p>
            <Button 
              onClick={handleLoadNews}
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
                  <Newspaper className="w-4 h-4 mr-2" />
                  Load News
                </>
              )}
            </Button>
          </div>
        ) : null}

        {/* News Grid */}
        {news.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                {news.length} articles from your top games
              </p>
              <Button 
                onClick={handleLoadNews}
                disabled={loading}
                size="sm"
                variant="ghost"
                className="glass-card border border-[var(--neon-cyan)]/40 hover:neon-glow-cyan text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Newspaper className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-sm border-2 border-[var(--neon-cyan)]/20 overflow-hidden hover-glow-cyan transition-all group flex flex-col"
                >
                  {/* Game Header */}
                  <div className="p-4 bg-black/40 border-b border-[var(--neon-cyan)]/20 flex items-center gap-3">
                    <img
                      src={item.gameIcon}
                      alt={item.gameName}
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/32?text=Game";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--neon-cyan)] uppercase tracking-wider truncate">
                        {item.gameName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.date * 1000), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* News Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm uppercase tracking-wide mb-3 line-clamp-2 text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-4 mb-4 flex-1">
                      {item.content.replace(/<[^>]*>/g, '')}
                    </p>
                    
                    <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-[var(--neon-cyan)]/10">
                      {item.feedName && (
                        <Badge className="text-[var(--neon-purple)] bg-black/40 border border-[var(--neon-purple)]/40 text-xs uppercase tracking-wider">
                          {item.feedName}
                        </Badge>
                      )}
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="ml-auto glass-card border border-[var(--neon-magenta)]/40 hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 text-xs"
                      >
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          Read More <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

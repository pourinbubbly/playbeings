import { Badge } from "@/components/ui/badge.tsx";
import { Shield, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";

interface CarvBadgeProps {
  carvId?: string | null;
  reputationScore?: number | null;
  size?: "sm" | "md" | "lg";
  showReputation?: boolean;
}

export function CarvBadge({ 
  carvId, 
  reputationScore, 
  size = "md",
  showReputation = true 
}: CarvBadgeProps) {
  if (!carvId) return null;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <Badge 
              variant="secondary"
              className={`
                ${sizeClasses[size]}
                bg-[var(--neon-cyan)]/10 
                text-[var(--neon-cyan)] 
                border border-[var(--neon-cyan)]/30
                hover:bg-[var(--neon-cyan)]/20
                transition-colors
                flex items-center gap-1
              `}
            >
              <Shield className={iconSize[size]} />
              CARV
            </Badge>
            {showReputation && reputationScore !== null && reputationScore !== undefined && (
              <Badge 
                variant="secondary"
                className={`
                  ${sizeClasses[size]}
                  bg-yellow-500/10 
                  text-yellow-600 dark:text-yellow-500
                  border border-yellow-500/30
                  flex items-center gap-1
                `}
              >
                <Star className={iconSize[size]} />
                {reputationScore}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-semibold">CARV Verified</p>
            <p className="text-muted-foreground">On-chain identity verified</p>
            {carvId && <p className="text-xs font-mono">{carvId.slice(0, 12)}...</p>}
            {reputationScore !== null && reputationScore !== undefined && (
              <p className="text-muted-foreground">Reputation: {reputationScore}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

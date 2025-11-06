import { SignInButton } from "@/components/ui/signin.tsx";
import { LogIn, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function UnauthenticatedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background cyber-grid-animated p-4 relative">
      {/* Animated background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-[var(--neon-cyan)] rounded-full blur-[120px] opacity-10 animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[var(--neon-magenta)] rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="glass-card rounded-sm border-2 border-[var(--neon-cyan)]/30 p-12">
          <div className="space-y-8">
            <div className="mx-auto w-24 h-24 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan">
              <Shield className="w-12 h-12 text-[var(--neon-cyan)]" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-bold gradient-text-cyber uppercase tracking-wider">
                Authentication Required
              </h2>
              <p className="text-muted-foreground uppercase tracking-wide text-lg">
                Please sign in to access this page
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <SignInButton className="w-full glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider h-14 text-base">
                <LogIn className="w-5 h-5 mr-2" />
                SIGN IN
              </SignInButton>
              
              <Link 
                to="/"
                className="text-sm text-[var(--neon-cyan)] hover:text-[var(--neon-magenta)] transition-colors font-semibold uppercase tracking-wider"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

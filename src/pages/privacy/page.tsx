import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background cyber-grid-animated">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button asChild variant="ghost" className="mb-8">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[var(--neon-cyan)]" />
              <h1 className="text-5xl font-bold gradient-text-cyber uppercase tracking-wider">Privacy Policy</h1>
            </div>
            <p className="text-muted-foreground">
              Last updated: November 7, 2025
            </p>
          </div>

          <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 space-y-8">
            <Section title="Introduction">
              <p>
                PlayBeings ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our gaming rewards platform at playbeings.fun.
              </p>
            </Section>

            <Section title="Information We Collect">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Account Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Email address (via Google, Microsoft, or direct sign-up)</li>
                    <li>Profile information (username, avatar, bio, social links)</li>
                    <li>Wallet address (Backpack wallet)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Steam Data</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Steam ID and profile URL</li>
                    <li>Public profile information (username, avatar)</li>
                    <li>Game library and playtime statistics</li>
                    <li>Achievement data</li>
                    <li>Trading card inventory</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Platform Activity</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Quest completion and progress</li>
                    <li>Points earned and redeemed</li>
                    <li>NFT minting transactions</li>
                    <li>Daily check-in streaks</li>
                    <li>Leaderboard rankings</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section title="How We Use Your Information">
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Provide and maintain our gaming rewards platform</li>
                <li>Process your quests, rewards, and NFT minting</li>
                <li>Calculate leaderboard rankings and distribute prizes</li>
                <li>Sync your Steam gaming data automatically</li>
                <li>Send you important updates about your account</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Improve our services and user experience</li>
              </ul>
            </Section>

            <Section title="Data Sharing and Disclosure">
              <p className="mb-4">We do NOT sell your personal information. We may share your data with:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li><strong>Steam API:</strong> To fetch your public gaming data</li>
                <li><strong>CARV SVM Blockchain:</strong> NFT minting and transaction data is publicly visible on the blockchain</li>
                <li><strong>Service Providers:</strong> Third-party services that help us operate the platform (hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </Section>

            <Section title="Blockchain and NFTs">
              <p>
                PlayBeings uses the CARV SVM blockchain for NFT minting and transactions. Blockchain data is public and permanent. Your wallet address and transaction history will be visible on the CARV SVM testnet explorer at scan-testnet.carv.io.
              </p>
            </Section>

            <Section title="Your Rights">
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Access your personal data</li>
                <li>Update or correct your information</li>
                <li>Delete your account and associated data</li>
                <li>Disconnect your Steam account</li>
                <li>Opt out of promotional communications</li>
                <li>Export your data</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                To exercise these rights, visit your Settings page or contact us at privacy@playbeings.fun.
              </p>
            </Section>

            <Section title="Data Security">
              <p>
                We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure. We use encryption, secure servers, and regular security audits to safeguard your data.
              </p>
            </Section>

            <Section title="Children's Privacy">
              <p>
                PlayBeings is not intended for users under 13 years of age. We do not knowingly collect information from children. If you believe we have collected data from a child, please contact us immediately.
              </p>
            </Section>

            <Section title="Cookies and Tracking">
              <p>
                We use cookies and similar technologies to improve your experience. See our <Link to="/cookies" className="text-[var(--neon-cyan)] hover:underline">Cookie Policy</Link> for more details.
              </p>
            </Section>

            <Section title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Continued use of PlayBeings after changes constitutes acceptance of the new policy.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                If you have questions about this Privacy Policy, contact us at:
              </p>
              <div className="mt-4 space-y-1 text-sm">
                <p>Email: privacy@playbeings.fun</p>
                <p>Website: <a href="https://playbeings.fun" className="text-[var(--neon-cyan)] hover:underline">playbeings.fun</a></p>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 gradient-text-cyber">{title}</h2>
      <div className="text-foreground space-y-2">
        {children}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
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
              <FileText className="w-8 h-8 text-[var(--neon-magenta)]" />
              <h1 className="text-5xl font-bold gradient-text-cyber uppercase tracking-wider">Terms of Service</h1>
            </div>
            <p className="text-muted-foreground">
              Last updated: November 7, 2025
            </p>
          </div>

          <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-magenta)]/20 space-y-8">
            <Section title="Acceptance of Terms">
              <p>
                By accessing and using PlayBeings ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>
            </Section>

            <Section title="Eligibility">
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>You must be at least 13 years old to use PlayBeings</li>
                <li>You must have a valid Steam account</li>
                <li>You must have a compatible cryptocurrency wallet (Backpack wallet)</li>
                <li>You must comply with all applicable laws in your jurisdiction</li>
              </ul>
            </Section>

            <Section title="Account Responsibilities">
              <p className="mb-4">You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your Steam profile is set to public (required for data syncing)</li>
                <li>Keeping your wallet secure and private keys safe</li>
                <li>Any transactions made from your wallet</li>
              </ul>
            </Section>

            <Section title="Platform Usage">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Permitted Use</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Complete quests based on legitimate Steam gaming activity</li>
                    <li>Mint NFTs from your own achievements</li>
                    <li>Redeem points for rewards</li>
                    <li>Participate in the community features</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Prohibited Activities</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Using bots, scripts, or automation tools</li>
                    <li>Manipulating Steam data or game time artificially</li>
                    <li>Creating multiple accounts to farm rewards</li>
                    <li>Exploiting bugs or glitches for unfair advantage</li>
                    <li>Sharing or selling your account</li>
                    <li>Harassment, hate speech, or abusive behavior</li>
                    <li>Attempting to hack or compromise the platform</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section title="Points and Rewards">
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Points have no cash value and cannot be transferred or sold</li>
                <li>Rewards are subject to availability</li>
                <li>Reward redemptions require admin approval (24-48 hours)</li>
                <li>We reserve the right to modify point values and rewards at any time</li>
                <li>Fraudulent activity will result in point forfeiture and account termination</li>
                <li>Unclaimed rewards may expire after 90 days</li>
              </ul>
            </Section>

            <Section title="Leaderboard and Prizes">
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Leaderboard rankings are calculated based on total points earned</li>
                <li>Monthly prizes are distributed to the top 100 players</li>
                <li>Prize pool and distribution may change with notice</li>
                <li>Winners must have a verified account to receive prizes</li>
                <li>Prizes are paid via the reward redemption system</li>
                <li>We reserve the right to disqualify cheaters or suspicious accounts</li>
              </ul>
            </Section>

            <Section title="NFTs and Blockchain">
              <p className="mb-4">
                PlayBeings uses the CARV SVM testnet blockchain. By minting NFTs, you understand that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>NFTs are minted on a testnet with no real monetary value</li>
                <li>Blockchain transactions are permanent and irreversible</li>
                <li>Gas fees (if any) are your responsibility</li>
                <li>NFT ownership is determined by blockchain records</li>
                <li>We do not control the blockchain or wallet providers</li>
                <li>Lost wallet access means lost NFTs - we cannot recover them</li>
              </ul>
            </Section>

            <Section title="Steam Integration">
              <p>
                PlayBeings accesses your public Steam data via the Steam Web API. We do not access your password or make any changes to your Steam account. You can disconnect your Steam account anytime from the Settings page.
              </p>
            </Section>

            <Section title="Intellectual Property">
              <p className="mb-4">
                PlayBeings and its content are protected by copyright, trademark, and other laws. You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Copy, modify, or distribute our platform code or design</li>
                <li>Use our branding without permission</li>
                <li>Reverse engineer or decompile our software</li>
                <li>Create derivative works based on PlayBeings</li>
              </ul>
            </Section>

            <Section title="Disclaimers">
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</strong>
                </p>
                <p>
                  PlayBeings is a testnet platform. We do not guarantee:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Uninterrupted or error-free service</li>
                  <li>Accuracy of Steam data or quest tracking</li>
                  <li>Availability of specific rewards</li>
                  <li>Permanent storage of NFTs or data</li>
                  <li>Prize pool amounts or distribution</li>
                </ul>
              </div>
            </Section>

            <Section title="Limitation of Liability">
              <p className="text-sm text-muted-foreground">
                PlayBeings and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform. This includes, but is not limited to, loss of points, rewards, NFTs, or prizes.
              </p>
            </Section>

            <Section title="Account Termination">
              <p className="mb-4">We may suspend or terminate your account for:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or abusive behavior</li>
                <li>Extended periods of inactivity</li>
                <li>At our discretion for any reason</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                You may delete your account anytime from the Settings page.
              </p>
            </Section>

            <Section title="Changes to Terms">
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated date. Continued use of PlayBeings after changes constitutes acceptance of the new terms.
              </p>
            </Section>

            <Section title="Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance with applicable international laws. Any disputes shall be resolved through binding arbitration.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                Questions about these Terms of Service? Contact us at:
              </p>
              <div className="mt-4 space-y-1 text-sm">
                <p>Email: legal@playbeings.fun</p>
                <p>Website: <a href="https://playbeings.fun" className="text-[var(--neon-magenta)] hover:underline">playbeings.fun</a></p>
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

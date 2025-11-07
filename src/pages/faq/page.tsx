import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";

export default function FAQ() {
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
              <HelpCircle className="w-8 h-8 text-[var(--neon-cyan)]" />
              <h1 className="text-5xl font-bold gradient-text-cyber uppercase tracking-wider">FAQ</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Frequently asked questions about PlayBeings
            </p>
          </div>

          <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-bold">
                  What is PlayBeings?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  PlayBeings is a gaming rewards platform that turns your Steam gaming activity into real rewards. Complete daily quests, mint NFTs from your achievements, and earn points that can be redeemed for gift cards.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-bold">
                  Is PlayBeings free to use?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! PlayBeings is completely free to use. You only need a Steam account and a Backpack wallet to get started. All transactions are on the CARV SVM testnet, which uses test tokens with no real monetary value.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-bold">
                  How do I earn points?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <div className="space-y-2">
                    <p>There are several ways to earn points:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Complete daily quests (10-50 points each)</li>
                      <li>Daily check-in (10-25 points depending on streak)</li>
                      <li>Mint NFTs for permanent point boosts (5-15%)</li>
                      <li>Climb the leaderboard for bonus rewards</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-bold">
                  What can I do with my points?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Points can be redeemed for gift cards from Steam, Amazon, Nintendo, PlayStation, Xbox, and Epic Games. Gift cards range from 500 to 2000 points depending on the value.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-bold">
                  How do daily quests work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Every day, you receive 5 fresh quests based on your Steam gaming activity. These can include playing specific games, unlocking achievements, or reaching playtime goals. Quests reset at midnight UTC.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-bold">
                  What are NFT boosts?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  When you mint your Steam achievements as NFTs, they provide permanent point boosts: Common (5%), Rare (10%), and Epic (15%). These boosts apply to all your future point earnings, including quests and check-ins.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-bold">
                  How does the leaderboard work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  The leaderboard ranks all players by total points earned. The top 100 players share a $1,000 monthly prize pool, with 1st place winning $300. The leaderboard resets on the 1st of each month.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-lg font-bold">
                  Why do I need a Backpack wallet?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  PlayBeings uses the CARV SVM blockchain for NFT minting, daily check-ins, and profile comments. You need a Backpack wallet to approve these blockchain transactions. Don't worry - all transactions are on testnet and use free test tokens!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="text-lg font-bold">
                  How long does reward redemption take?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  After you redeem a reward, it typically takes 24-48 hours for admin approval. Once approved, you'll receive your gift card code via email.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="text-lg font-bold">
                  Can I connect multiple Steam accounts?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Currently, you can only connect one Steam account per PlayBeings account. If you need to switch accounts, disconnect your current Steam profile first.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11">
                <AccordionTrigger className="text-lg font-bold">
                  Is my Steam data safe?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! PlayBeings only reads your public Steam data (games, playtime, achievements). We never access your password, private information, or make any changes to your Steam account.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-12">
                <AccordionTrigger className="text-lg font-bold">
                  What happens if I miss a day of quests?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Missed quests simply expire and are replaced with new ones the next day. Your check-in streak will also reset if you miss a day, so try to log in daily!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-13">
                <AccordionTrigger className="text-lg font-bold">
                  Can I delete my account?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, you can delete your account anytime from the Settings page. This will permanently remove all your data, including points, NFTs, and quest progress.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-14">
                <AccordionTrigger className="text-lg font-bold">
                  How do I contact support?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  If you need help, email us at support@playbeings.fun or check our <Link to="/docs" className="text-[var(--neon-cyan)] hover:underline">Documentation</Link> page for detailed guides.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

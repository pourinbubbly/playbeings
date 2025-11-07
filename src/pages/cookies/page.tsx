import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiePolicy() {
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
              <Cookie className="w-8 h-8 text-[var(--neon-purple)]" />
              <h1 className="text-5xl font-bold gradient-text-cyber uppercase tracking-wider">Cookie Policy</h1>
            </div>
            <p className="text-muted-foreground">
              Last updated: November 7, 2025
            </p>
          </div>

          <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-purple)]/20 space-y-8">
            <Section title="What Are Cookies?">
              <p>
                Cookies are small text files stored on your device when you visit a website. They help us provide you with a better experience by remembering your preferences and tracking how you use our platform.
              </p>
            </Section>

            <Section title="How We Use Cookies">
              <p className="mb-4">PlayBeings uses cookies for:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Keeping you signed in to your account</li>
                <li>Remembering your preferences and settings</li>
                <li>Understanding how you use the platform</li>
                <li>Improving our services and user experience</li>
                <li>Preventing fraud and maintaining security</li>
              </ul>
            </Section>

            <Section title="Types of Cookies We Use">
              <div className="space-y-6">
                <CookieType
                  type="Essential Cookies"
                  description="Required for the platform to function. These cookies enable core features like authentication and security."
                  examples={[
                    "Session authentication tokens",
                    "Security and fraud prevention",
                    "Load balancing",
                  ]}
                  canDisable={false}
                />
                <CookieType
                  type="Preference Cookies"
                  description="Remember your settings and preferences to provide a personalized experience."
                  examples={[
                    "Theme preferences (light/dark mode)",
                    "Language settings",
                    "Dashboard layout preferences",
                  ]}
                  canDisable={true}
                />
                <CookieType
                  type="Analytics Cookies"
                  description="Help us understand how visitors use our platform so we can improve it."
                  examples={[
                    "Page views and navigation patterns",
                    "Feature usage statistics",
                    "Performance monitoring",
                  ]}
                  canDisable={true}
                />
                <CookieType
                  type="Functional Cookies"
                  description="Enable enhanced functionality and personalization."
                  examples={[
                    "Remember your connected Steam account",
                    "Store your wallet connection",
                    "Quest completion tracking",
                  ]}
                  canDisable={true}
                />
              </div>
            </Section>

            <Section title="Third-Party Cookies">
              <p className="mb-4">
                We may use third-party services that set their own cookies. These include:
              </p>
              <div className="space-y-3">
                <ThirdParty
                  name="Google Sign-In"
                  purpose="Authentication and account creation"
                  link="https://policies.google.com/privacy"
                />
                <ThirdParty
                  name="Microsoft Sign-In"
                  purpose="Authentication and account creation"
                  link="https://privacy.microsoft.com/en-us/privacystatement"
                />
                <ThirdParty
                  name="CARV SVM"
                  purpose="Blockchain transactions and NFT minting"
                  link="https://carv.io/privacy"
                />
              </div>
            </Section>

            <Section title="Managing Cookies">
              <p className="mb-4">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>View cookies stored on your device</li>
                <li>Delete all or specific cookies</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies (not recommended - may break functionality)</li>
                <li>Get notified when cookies are set</li>
              </ul>
              <div className="mt-6 glass-card p-4 rounded-sm border border-border">
                <p className="text-sm text-muted-foreground">
                  ⚠️ <strong>Note:</strong> Disabling essential cookies will prevent you from using PlayBeings. Other cookies can be disabled but may affect your experience.
                </p>
              </div>
            </Section>

            <Section title="Cookie Lifespan">
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold mb-1">Session Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    Temporary cookies deleted when you close your browser. Used for authentication and security.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Persistent Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    Remain on your device for a set period (up to 1 year). Used for preferences and "remember me" functionality.
                  </p>
                </div>
              </div>
            </Section>

            <Section title="Local Storage">
              <p>
                In addition to cookies, PlayBeings may use browser local storage to save data locally on your device. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4 mt-4">
                <li>Cached game data for faster loading</li>
                <li>Wallet connection state</li>
                <li>UI preferences and settings</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                You can clear local storage through your browser's developer tools or settings.
              </p>
            </Section>

            <Section title="Do Not Track">
              <p>
                Some browsers have a "Do Not Track" feature. PlayBeings respects DNT signals. When DNT is enabled, we will not use analytics or tracking cookies.
              </p>
            </Section>

            <Section title="Updates to This Policy">
              <p>
                We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated date. Continued use of PlayBeings after changes constitutes acceptance of the new policy.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                Questions about our cookie usage? Contact us at:
              </p>
              <div className="mt-4 space-y-1 text-sm">
                <p>Email: privacy@playbeings.fun</p>
                <p>Website: <a href="https://playbeings.fun" className="text-[var(--neon-purple)] hover:underline">playbeings.fun</a></p>
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

function CookieType({ 
  type, 
  description, 
  examples, 
  canDisable 
}: { 
  type: string; 
  description: string; 
  examples: string[];
  canDisable: boolean;
}) {
  return (
    <div className="glass-card p-4 rounded-sm border border-border">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold">{type}</h3>
        <span className={`text-xs px-2 py-1 rounded ${canDisable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {canDisable ? 'Optional' : 'Required'}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div>
        <p className="text-xs font-semibold mb-1">Examples:</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
          {examples.map((example, i) => (
            <li key={i}>{example}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ThirdParty({ name, purpose, link }: { name: string; purpose: string; link: string }) {
  return (
    <div className="glass-card p-4 rounded-sm border border-border">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground">{purpose}</p>
        </div>
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-[var(--neon-purple)] hover:underline"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
}

import "./polyfills.ts";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/dashboard/page.tsx";
import Games from "./pages/games/page.tsx";
import Quests from "./pages/quests/page.tsx";
import Leaderboard from "./pages/leaderboard/page.tsx";
import Wallet from "./pages/wallet/page.tsx";
import Cards from "./pages/cards/page.tsx";
import Rewards from "./pages/rewards/page.tsx";
import Analytics from "./pages/analytics/page.tsx";
import News from "./pages/news/page.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/games" element={<Games />} />
          <Route path="/dashboard/quests" element={<Quests />} />
          <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
          <Route path="/dashboard/wallet" element={<Wallet />} />
          <Route path="/dashboard/cards" element={<Cards />} />
          <Route path="/dashboard/rewards" element={<Rewards />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/news" element={<News />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/pages/dashboard/_components/dashboard-layout.tsx";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { AlertCircle, Trash2, Shield, Bell, User, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import { useAuth } from "@/hooks/use-auth.ts";

function SettingsContent() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const { signoutRedirect } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount({});
      toast.success("Hesabınız başarıyla silindi");
      // Sign out and redirect to home
      setTimeout(() => {
        signoutRedirect();
      }, 1000);
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error("Hesap silinirken bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text-cyber tracking-wider uppercase">
          Ayarlar
        </h1>
        <p className="text-muted-foreground">
          Hesabınızı ve tercihlerinizi yönetin
        </p>
      </div>

      {/* Account Information */}
      <Card className="glass-card neon-border-cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[var(--neon-cyan)] uppercase tracking-wider">
            <User className="w-6 h-6" />
            Hesap Bilgileri
          </CardTitle>
          <CardDescription>
            Hesabınızla ilgili temel bilgiler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ad
            </Label>
            <div className="glass-card p-4 border border-[var(--neon-cyan)]/30">
              <p className="text-foreground font-medium">
                {currentUser.name || "Belirtilmemiş"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              E-posta
            </Label>
            <div className="glass-card p-4 border border-[var(--neon-cyan)]/30 flex items-center gap-3">
              <Mail className="w-5 h-5 text-[var(--neon-cyan)]" />
              <p className="text-foreground font-medium">
                {currentUser.email || "Belirtilmemiş"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Kullanıcı Adı
            </Label>
            <div className="glass-card p-4 border border-[var(--neon-cyan)]/30">
              <p className="text-foreground font-medium">
                {currentUser.username || "Belirtilmemiş"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Kullanıcı adınızı değiştirmek için profil sayfasını kullanın
            </p>
          </div>

          <Button
            onClick={() => navigate("/profile")}
            className="glass-card neon-border-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/10 hover:neon-glow-magenta font-semibold uppercase tracking-wider"
          >
            Profili Düzenle
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass-card neon-border-purple">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[var(--neon-purple)] uppercase tracking-wider">
            <Shield className="w-6 h-6" />
            Gizlilik Ayarları
          </CardTitle>
          <CardDescription>
            Profil görünürlüğü ve gizlilik tercihleri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-purple)]/30">
            <div className="space-y-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Profil Görünürlüğü
              </p>
              <p className="text-sm text-muted-foreground">
                Profiliniz tüm kullanıcılar tarafından görülebilir
              </p>
            </div>
            <div className="text-sm text-[var(--neon-cyan)] font-semibold">
              Herkese Açık
            </div>
          </div>

          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-purple)]/30">
            <div className="space-y-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Steam Profili
              </p>
              <p className="text-sm text-muted-foreground">
                Steam profiliniz kontrol panelinde görüntülenir
              </p>
            </div>
            <div className="text-sm text-[var(--neon-cyan)] font-semibold">
              {currentUser.steamId ? "Bağlı" : "Bağlı Değil"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="glass-card neon-border-cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[var(--neon-cyan)] uppercase tracking-wider">
            <Bell className="w-6 h-6" />
            Bildirim Tercihleri
          </CardTitle>
          <CardDescription>
            Bildirim ayarlarınızı yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-cyan)]/30">
            <div className="space-y-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Quest Bildirimleri
              </p>
              <p className="text-sm text-muted-foreground">
                Yeni günlük görevler için bildirim al
              </p>
            </div>
            <div className="text-sm text-[var(--neon-cyan)] font-semibold">
              Açık
            </div>
          </div>

          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-cyan)]/30">
            <div className="space-y-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Ödül Bildirimleri
              </p>
              <p className="text-sm text-muted-foreground">
                Ödül durumu güncellemeleri için bildirim al
              </p>
            </div>
            <div className="text-sm text-[var(--neon-cyan)] font-semibold">
              Açık
            </div>
          </div>

          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-cyan)]/30">
            <div className="space-y-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Sosyal Bildirimler
              </p>
              <p className="text-sm text-muted-foreground">
                Yeni takipçiler ve yorumlar için bildirim al
              </p>
            </div>
            <div className="text-sm text-[var(--neon-cyan)] font-semibold">
              Açık
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass-card border-2 border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-destructive uppercase tracking-wider">
            <AlertCircle className="w-6 h-6" />
            Tehlikeli Bölge
          </CardTitle>
          <CardDescription>
            Geri alınamaz eylemler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 glass-card border border-destructive/30 space-y-4">
            <div className="space-y-2">
              <p className="font-semibold text-destructive uppercase tracking-wide">
                Hesabı Sil
              </p>
              <p className="text-sm text-muted-foreground">
                Hesabınızı ve tüm verilerinizi kalıcı olarak silin. Bu işlem geri alınamaz.
              </p>
            </div>

            <Separator className="bg-destructive/20" />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full font-semibold uppercase tracking-wider"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hesabı Kalıcı Olarak Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card border-2 border-destructive/50">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl text-destructive uppercase tracking-wider">
                    Emin misiniz?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    Bu işlem geri alınamaz. Hesabınız ve aşağıdaki tüm verileriniz kalıcı olarak silinecek:
                    <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                      <li>Steam profili ve oyun verileri</li>
                      <li>Quest geçmişi ve ilerlemesi</li>
                      <li>Trading kartları ve NFT'ler</li>
                      <li>Puan geçmişi ve liderlik sıralaması</li>
                      <li>Wallet bağlantıları</li>
                      <li>Takipçiler ve takip ettikleriniz</li>
                      <li>Profil yorumları</li>
                      <li>Günlük giriş streak'i</li>
                      <li>Ödül satın alımları</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="glass-card neon-border-cyan text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 font-semibold uppercase tracking-wider">
                    İptal
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold uppercase tracking-wider"
                  >
                    {isDeleting ? "Siliniyor..." : "Evet, Hesabı Sil"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  return (
    <DashboardLayout>
      <Authenticated>
        <SettingsContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Shield className="w-16 h-16 text-[var(--neon-cyan)] neon-glow-cyan" />
          <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider">
            Giriş Yapmanız Gerekiyor
          </h2>
          <p className="text-muted-foreground">
            Ayarlarınızı görüntülemek için lütfen giriş yapın
          </p>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuthLoading>
    </DashboardLayout>
  );
}

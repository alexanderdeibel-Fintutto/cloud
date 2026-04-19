import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import mieterLogo from "@/assets/mieter-logo.svg";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  Home, FileText, BookOpen, Phone, Settings, LogOut, ChevronRight, Edit3, Sparkles,
  Shield, Calculator, FileOutput
} from "lucide-react";

const menuItems = [
  { icon: Shield, label: "Mietrecht-Checker", to: "/checker", description: "10 Checks für Ihre Rechte", color: "primary" as const },
  { icon: FileOutput, label: "Formulare", to: "/formulare", description: "Rechtssichere Dokumente", color: "coral" as const },
  { icon: Calculator, label: "Rechner", to: "/rechner", description: "Miete, Kaution & mehr", color: "mint" as const },
  { icon: Home, label: "Meine Wohnung", to: "/wohnung", description: "Adresse & Wohnungsdaten", color: "sky" as const },
  { icon: FileText, label: "Dokumente", to: "/dokumente", description: "Mietvertrag, Abrechnungen", color: "sky" as const },
  { icon: BookOpen, label: "Hausordnung", to: "/hausordnung", description: "Regeln & Informationen", color: "mint" as const },
  { icon: Phone, label: "Notfallkontakte", to: "/notfallkontakte", description: "Wichtige Telefonnummern", color: "coral" as const },
  { icon: Settings, label: "Einstellungen", to: "/einstellungen", description: "Profil & Benachrichtigungen", color: "amber" as const },
  { icon: Sparkles, label: "Fintutto Ökosystem", to: "/fintutto-apps", description: "Alle Apps entdecken", color: "primary" as const },
];

export default function Mehr() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const userName = user?.user_metadata?.name || "Mieter";

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <MobileLayout>
      <PageHeader title="Mehr" subtitle="Einstellungen & Informationen" />

      <div className="px-4 -mt-2 space-y-4 pb-4">
        {/* User Profile Card */}
        <AnimatedCard delay={0} accentColor="primary">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                  <img src={mieterLogo} alt="Fintutto Mieter" className="w-full h-full" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Edit3 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-white/90">{userName}</p>
                <p className="text-sm text-white/50">{user?.email}</p>
                <span className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Aktiv
                </span>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Menu Items */}
        <AnimatedCard delay={100}>
          <div className="divide-y divide-white/[0.08]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to}>
                  <CardContent className="p-4 hover:bg-white/[0.04] transition-all duration-200 group">
                    <div className="flex items-center gap-4">
                      <IconBadge icon={Icon} variant={item.color} size="md" />
                      <div className="flex-1">
                        <p className="font-medium text-white/90">{item.label}</p>
                        <p className="text-sm text-white/50">{item.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Link>
              );
            })}
          </div>
        </AnimatedCard>

        {/* Logout Button */}
        <AnimatedCard delay={200}>
          <CardContent 
            className="p-4 cursor-pointer hover:bg-destructive/5 transition-all duration-200 group"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-4">
              <IconBadge icon={LogOut} variant="destructive" size="md" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Abmelden</p>
                <p className="text-sm text-white/50">Von Ihrem Konto abmelden</p>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </MobileLayout>
  );
}
import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import GlobalAIChatButton from "@/components/ai/GlobalAIChatButton";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24">
        {children || <Outlet />}
      </main>
      <BottomNavigation />
      <GlobalAIChatButton />
    </div>
  );
}

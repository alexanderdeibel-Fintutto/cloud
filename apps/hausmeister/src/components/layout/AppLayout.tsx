import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <main className="pb-24">
        {children || <Outlet />}
      </main>
      <BottomNavigation />
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { EcosystemBanner } from '@/components/EcosystemBanner';

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <EcosystemBanner variant="bar" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-7xl py-6 px-4 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

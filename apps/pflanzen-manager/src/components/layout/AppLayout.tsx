import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import EcosystemBar from './EcosystemBar';

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <EcosystemBar />
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

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl py-6 px-4 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

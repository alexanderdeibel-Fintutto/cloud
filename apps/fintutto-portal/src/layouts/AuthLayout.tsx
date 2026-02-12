import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <span className="text-white font-bold text-xl">Fintutto</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Fintutto. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
}

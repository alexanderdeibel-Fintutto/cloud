import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, LogOut, BarChart3, FileText, Sun, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import appLogo from '@/assets/logo.svg';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/read', icon: Camera, label: 'Ablesen' },
  { href: '/analysis', icon: BarChart3, label: 'Analyse' },
  { href: '/contracts', icon: FileText, label: 'Verträge' },
  { href: '/savings', icon: Lightbulb, label: 'Sparen' },
];

export function AppLayout({ children, title, showBack }: AppLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  // Check if current path matches nav item (including sub-paths)
  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen gradient-mesh flex flex-col">
      {/* Header with glass effect */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3 safe-area-pt"
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl overflow-hidden shadow-glow"
            >
              <img src={appLogo} alt="Fintutto Logo" className="w-full h-full" />
            </motion.div>
            <span className="text-xl font-bold text-gradient">Fintutto</span>
          </Link>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-xl"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-lg mx-auto px-4 py-5"
        >
          {title && (
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-white mb-5"
            >
              {title}
            </motion.h1>
          )}
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation - Enhanced Mobile Style */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mb-4 safe-area-pb">
          <div className="glass-card rounded-2xl max-w-lg mx-auto overflow-hidden">
            <div className="flex justify-around py-2 px-1">
              {navItems.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    to={href}
                    className="relative flex-1"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'flex flex-col items-center gap-0.5 py-2 px-1.5 rounded-xl transition-all duration-300',
                        active
                          ? 'bg-gradient-to-br from-primary/20 to-secondary/20'
                          : 'hover:bg-accent/50'
                      )}
                    >
                      <div className="relative">
                        <Icon className={cn(
                          "w-5 h-5 transition-all duration-300",
                          active ? "text-primary" : "text-muted-foreground"
                        )} />
                        {active && (
                          <motion.div
                            layoutId="navGlow"
                            className="absolute inset-0 blur-lg bg-primary/40"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium transition-all duration-300",
                        active ? "text-primary font-semibold" : "text-muted-foreground"
                      )}>
                        {label}
                      </span>

                      {/* Active indicator dot */}
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full gradient-primary"
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}

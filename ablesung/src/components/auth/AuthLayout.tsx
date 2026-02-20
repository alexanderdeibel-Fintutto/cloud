import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import appLogo from '@/assets/logo.svg';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Floating blobs */}
      <motion.div
        animate={{ 
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 -left-20 w-64 h-64 blob bg-gradient-to-br from-primary/30 to-secondary/20 blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 -right-20 w-80 h-80 blob bg-gradient-to-br from-secondary/25 to-primary/15 blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/30 blur-3xl"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-2xl overflow-hidden shadow-glow float"
          >
            <img src={appLogo} alt="Fintutto Logo" className="w-full h-full" />
          </motion.div>
          <span className="text-3xl font-extrabold text-gradient">Fintutto</span>
        </motion.div>

        {/* Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="glass-card rounded-3xl p-8 shadow-glow"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-2">{subtitle}</p>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {children}
          </motion.div>
        </motion.div>

        {/* Footer decoration */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex justify-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-primary/60" />
          <div className="w-2 h-2 rounded-full bg-secondary/60" />
          <div className="w-2 h-2 rounded-full bg-primary/40" />
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ParallaxHeaderProps {
  children: ReactNode;
  backgroundGradient?: string;
  meshOverlay?: boolean;
  floatingElement?: ReactNode;
  className?: string;
}

export function ParallaxHeader({
  children,
  backgroundGradient = "gradient-primary",
  meshOverlay = true,
  floatingElement,
  className,
}: ParallaxHeaderProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background gradient */}
      <motion.div 
        className={cn("absolute inset-0 opacity-95", backgroundGradient)}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      {/* Mesh overlay */}
      {meshOverlay && (
        <motion.div 
          className="absolute inset-0 gradient-mesh opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      )}
      
      {/* Floating decorative element */}
      {floatingElement && (
        <motion.div
          className="absolute top-8 right-4 opacity-20"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {floatingElement}
        </motion.div>
      )}
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-10 -left-10 w-32 h-32 rounded-full bg-white/5"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      
      {/* Content */}
      <motion.div
        className="relative px-4 pt-12 pb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

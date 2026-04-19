import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CounterAnimationProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CounterAnimation({
  value,
  duration = 1.5,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: CounterAnimationProps) {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) => current.toFixed(decimals));
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [display]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("tabular-nums", className)}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}

// Simpler version that just counts up
interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn("inline-block tabular-nums", className)}
    >
      {value}
    </motion.span>
  );
}

import { Zap, Flame, Droplets, Thermometer, Sun, Car, Snowflake, Fuel, Warehouse, LucideIcon } from 'lucide-react';
import { MeterType } from '@/types/database';
import { cn } from '@/lib/utils';

interface MeterIconProps {
  type: MeterType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap: Record<MeterType, LucideIcon> = {
  electricity: Zap,
  electricity_ht: Zap,
  electricity_nt: Zap,
  electricity_common: Warehouse,
  gas: Flame,
  water_cold: Droplets,
  water_hot: Droplets,
  heating: Thermometer,
  district_heating: Thermometer,
  cooling: Snowflake,
  pv_feed_in: Sun,
  pv_self_consumption: Sun,
  pv_production: Sun,
  heat_pump: Thermometer,
  ev_charging: Car,
  oil: Fuel,
  pellets: Flame,
  lpg: Flame,
};

const colorMap: Record<MeterType, string> = {
  electricity: 'bg-meter-electricity text-primary-foreground',
  electricity_ht: 'bg-amber-500 text-white',
  electricity_nt: 'bg-indigo-500 text-white',
  electricity_common: 'bg-meter-electricity text-primary-foreground',
  gas: 'bg-meter-gas text-secondary-foreground',
  water_cold: 'bg-meter-cold-water text-white',
  water_hot: 'bg-meter-warm-water text-white',
  heating: 'bg-meter-heating text-white',
  district_heating: 'bg-meter-heating text-white',
  cooling: 'bg-cyan-500 text-white',
  pv_feed_in: 'bg-yellow-500 text-white',
  pv_self_consumption: 'bg-orange-500 text-white',
  pv_production: 'bg-yellow-400 text-white',
  heat_pump: 'bg-teal-500 text-white',
  ev_charging: 'bg-green-500 text-white',
  oil: 'bg-stone-600 text-white',
  pellets: 'bg-amber-700 text-white',
  lpg: 'bg-slate-500 text-white',
};

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function MeterIcon({ type, size = 'md', className }: MeterIconProps) {
  const Icon = iconMap[type] || Zap;

  return (
    <div className={cn(
      'rounded-xl flex items-center justify-center',
      sizeMap[size],
      colorMap[type] || 'bg-gray-500 text-white',
      className
    )}>
      <Icon className={iconSizeMap[size]} />
    </div>
  );
}

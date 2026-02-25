import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Location, Category } from '../types';
import { MapPin, Coffee, Palette, Dog, Star, Trees, ShoppingBag } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DriftlessMapProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
  selectedLocationId?: string;
  activeCategory: Category | 'all';
}

// Approximate bounding box for Iowa and Sauk Counties
const BOUNDS = {
  minLat: 42.7,
  maxLat: 43.6,
  minLng: -90.6,
  maxLng: -89.4,
};

export const DriftlessMap: React.FC<DriftlessMapProps> = ({
  locations,
  onSelectLocation,
  selectedLocationId,
  activeCategory,
}) => {
  const project = (lat: number, lng: number) => {
    const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
    const y = 100 - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  const getIcon = (category: Category) => {
    switch (category) {
      case 'coffee': return <Coffee className="w-4 h-4" />;
      case 'art': return <Palette className="w-4 h-4" />;
      case 'dog-park': return <Dog className="w-4 h-4" />;
      case 'trail-park': return <Trees className="w-4 h-4" />;
      case 'shop': return <ShoppingBag className="w-4 h-4" />;
      case 'attraction': return <Star className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const filteredLocations = useMemo(() => {
    if (activeCategory === 'all') return locations;
    return locations.filter(l => l.category === activeCategory);
  }, [locations, activeCategory]);

  return (
    <div className="relative w-full h-full bg-driftless-cream overflow-hidden rounded-3xl border border-driftless-ink/10 shadow-inner">
      {/* Stylized County Backgrounds */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Sauk County (North) */}
        <path 
          d="M 10,10 L 90,10 L 90,50 L 70,50 L 70,55 L 10,55 Z" 
          fill="currentColor" 
          className="text-driftless-teal"
        />
        {/* Iowa County (South) */}
        <path 
          d="M 10,55 L 70,55 L 70,50 L 90,50 L 90,90 L 10,90 Z" 
          fill="currentColor" 
          className="text-driftless-yellow"
        />
      </svg>

      {/* Grid Lines for "Trendy" feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Labels */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <h2 className="serif text-4xl font-light italic text-driftless-teal/40">Sauk County</h2>
      </div>
      <div className="absolute bottom-8 right-8 pointer-events-none text-right">
        <h2 className="serif text-4xl font-light italic text-driftless-yellow/40">Iowa County</h2>
      </div>

      {/* Locations */}
      {filteredLocations.map((loc) => {
        const pos = project(loc.lat, loc.lng);
        const isSelected = loc.id === selectedLocationId;

        return (
          <motion.button
            key={loc.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.2, zIndex: 50 }}
            onClick={() => onSelectLocation(loc)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg transition-colors duration-300",
              isSelected 
                ? "bg-driftless-ink text-driftless-cream scale-125 z-40" 
                : "bg-white text-driftless-ink hover:bg-driftless-olive hover:text-white z-30"
            )}
            style={{ left: pos.x, top: pos.y }}
          >
            {getIcon(loc.category)}
            
            {/* Tooltip-like label on hover or selection */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isSelected ? 1 : 0, y: isSelected ? -35 : 10 }}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-driftless-ink text-white text-[10px] px-2 py-1 rounded-md pointer-events-none uppercase tracking-widest font-bold"
            >
              {loc.name}
            </motion.div>
          </motion.button>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-driftless-ink/5 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-driftless-teal">
          <div className="w-2 h-2 rounded-full bg-driftless-teal" /> Sauk County
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-driftless-yellow">
          <div className="w-2 h-2 rounded-full bg-driftless-yellow" /> Iowa County
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DriftlessMap } from './components/Map';
import { fetchLocations, getLocalTips } from './services/gemini';
import { Location, Category } from './types';
import { 
  Coffee, 
  Palette, 
  Dog, 
  Star, 
  Map as MapIcon, 
  Info, 
  ExternalLink, 
  X,
  ChevronRight,
  Sparkles,
  Trees,
  ShoppingBag
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [localTips, setLocalTips] = useState<{ text: string; links?: { uri: string; title: string }[] } | null>(null);
  const [tipsLoading, setTipsLoading] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const data = await fetchLocations("Spring Green and Mineral Point, WI");
      setLocations(data);
      setLoading(false);
    }
    init();
  }, []);

  const handleSelectLocation = async (loc: Location) => {
    setSelectedLocation(loc);
    setLocalTips(null);
    setTipsLoading(true);
    const tips = await getLocalTips(loc.name);
    setLocalTips(tips);
    setTipsLoading(false);
  };

  const categories: { id: Category | 'all', label: string, icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Spots', icon: <MapIcon className="w-4 h-4" /> },
    { id: 'art', label: 'Art Galleries', icon: <Palette className="w-4 h-4" /> },
    { id: 'coffee', label: 'Coffee Shops', icon: <Coffee className="w-4 h-4" /> },
    { id: 'shop', label: 'Local Shops', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'dog-park', label: 'Dog Parks', icon: <Dog className="w-4 h-4" /> },
    { id: 'trail-park', label: 'Trails & Parks', icon: <Trees className="w-4 h-4" /> },
    { id: 'attraction', label: 'Attractions', icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-driftless-cream">
      {/* Sidebar / Navigation */}
      <aside className="w-full md:w-80 lg:w-96 p-6 flex flex-col gap-8 border-r border-driftless-ink/5 bg-white/50 backdrop-blur-md z-20">
        <header>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="serif text-4xl font-light leading-tight text-driftless-ink"
          >
            Driftlesslocal.com <br />
            <span className="italic text-driftless-pink text-5xl">Vibe Map</span>
          </motion.h1>
          <p className="mt-4 text-sm text-driftless-ink/60 font-medium tracking-wide uppercase">
            Iowa & Sauk Counties, WI
          </p>
        </header>

        {/* Category Filter */}
        <nav className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-driftless-ink/40 mb-2">Filter by Vibe</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-medium",
                activeCategory === cat.id 
                  ? "bg-driftless-red text-white shadow-lg shadow-driftless-red/20" 
                  : "bg-white/50 text-driftless-ink hover:bg-white hover:shadow-md"
              )}
            >
              {cat.icon}
              {cat.label}
              {activeCategory === cat.id && (
                <motion.div layoutId="active-pill" className="ml-auto">
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        {/* Selected Location Details */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedLocation ? (
              <motion.div
                key={selectedLocation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="relative group">
                  <button 
                    onClick={() => setSelectedLocation(null)}
                    className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-md z-10 hover:bg-driftless-ink hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-driftless-olive/5 border border-driftless-ink/5 flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-[0.03]" 
                         style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={selectedLocation.category}
                      className="text-driftless-olive/20"
                    >
                      {selectedLocation.category === 'coffee' && <Coffee className="w-24 h-24" />}
                      {selectedLocation.category === 'art' && <Palette className="w-24 h-24" />}
                      {selectedLocation.category === 'shop' && <ShoppingBag className="w-24 h-24" />}
                      {selectedLocation.category === 'dog-park' && <Dog className="w-24 h-24" />}
                      {selectedLocation.category === 'trail-park' && <Trees className="w-24 h-24" />}
                      {selectedLocation.category === 'attraction' && <Star className="w-24 h-24" />}
                    </motion.div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] font-bold text-driftless-olive/40">
                      {selectedLocation.category}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-driftless-pink/10 text-driftless-pink text-[10px] uppercase tracking-widest font-bold rounded-md">
                      {selectedLocation.category}
                    </span>
                    {selectedLocation.rating && (
                      <div className="flex items-center gap-1 text-driftless-yellow font-bold text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        {selectedLocation.rating}
                      </div>
                    )}
                  </div>
                  <h3 className="serif text-3xl font-medium text-driftless-ink mb-2">{selectedLocation.name}</h3>
                  <p className="text-sm text-driftless-ink/70 leading-relaxed mb-4">
                    {selectedLocation.description}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 text-xs text-driftless-ink/60">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{selectedLocation.address}</span>
                    </div>
                    {selectedLocation.website && (
                      <a 
                        href={selectedLocation.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-driftless-olive hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>

                {/* AI Local Tips */}
                <div className="p-5 bg-driftless-blue/5 rounded-3xl border border-driftless-blue/10">
                  <div className="flex items-center gap-2 mb-3 text-driftless-blue">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Local Insider Tips</span>
                  </div>
                  {tipsLoading ? (
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-driftless-blue rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-driftless-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-driftless-blue rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="text-xs text-driftless-ink/80 leading-relaxed italic">
                        {localTips?.text}
                      </div>
                      {localTips?.links && localTips.links.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-driftless-blue/10">
                          {localTips.links.map((link, i) => (
                            <a 
                              key={i}
                              href={link.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] uppercase tracking-wider font-bold text-driftless-blue hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {link.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30"
              >
                <MapIcon className="w-12 h-12 mb-4" />
                <p className="serif text-xl italic">Select a spot on the map to explore its secrets</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative p-4 md:p-8 flex flex-col gap-4">
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-driftless-cream/80 backdrop-blur-sm z-50 rounded-3xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-driftless-olive border-t-transparent rounded-full animate-spin" />
                <p className="serif italic text-xl text-driftless-olive">Mapping the Driftless...</p>
              </div>
            </div>
          ) : (
            <DriftlessMap 
              locations={locations} 
              onSelectLocation={handleSelectLocation}
              selectedLocationId={selectedLocation?.id}
              activeCategory={activeCategory}
            />
          )}
        </div>
        
        {/* Footer Stats/Info */}
        <footer className="flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-driftless-ink/30">
          <span>&copy; 2024 Driftlesslocal.com Vibe Map</span>
          <div className="flex gap-4">
            <span>{locations.length} Curated Spots</span>
            <span>2 Counties</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import ViewToggle from "./ViewToggle";

export default function CatalogueHero({
  searchQuery,
  onSearchChange,
  resultsCount,
  activeLayout,
  setActiveLayout,
  onOpenMobileFilters,
  activeFiltersCount
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  // Sync local search with external changes (e.g. filter resets)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  return (
    <div className="w-full select-none">
      {/* 1. Hero Compact (280px tall) */}
      <div className="relative h-[280px] bg-gradient-to-br from-[#1c380e] to-[#2c4e1d] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        
        {/* Subtle geometric SVG grid pattern */}
        <div className="absolute inset-0 opacity-8 pointer-events-none">
          <svg className="w-full h-full text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 40 M 0 0 L 40 40" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="relative z-10 space-y-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center space-x-1.5 text-white/50 text-[10px] uppercase font-poppins font-semibold tracking-wider">
            <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight size={10} />
            <span className="text-white">Catalogue</span>
          </nav>

          {/* Titles */}
          <div className="space-y-1.5">
            <h1 className="font-serif font-bold text-4xl md:text-5xl text-white tracking-tight">
              Catalogue
            </h1>
            <p className="font-sans text-xs md:text-sm text-white/70 max-w-md font-light">
              Découvrez notre sélection de livres soigneusement choisis
            </p>
          </div>
        </div>
      </div>

      {/* 2. Sticky Results & Controls Bar */}
      <div className="sticky top-[112px] z-40 bg-ivory border-b border-primary-soft/10 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl h-16 flex items-center justify-between gap-4">
          
          {/* Left: Tally count */}
          <div className="text-xs font-poppins font-bold text-charcoal/80 shrink-0 uppercase tracking-wider">
            {resultsCount} {resultsCount > 1 ? "livres trouvés" : "livre trouvé"}
          </div>

          {/* Center: Compact debounced Search input */}
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray/50" />
            </div>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Rechercher par titre, auteur..."
              className="w-full bg-white border border-primary-soft/20 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-charcoal placeholder-gray/40 outline-none focus:border-[#1c380e] transition-colors shadow-inner"
            />
          </div>

          {/* Right: Layout Toggle & Mobile Filter Trigger */}
          <div className="flex items-center space-x-4 shrink-0">
            {/* Desktop Layout Toggles */}
            <div className="hidden md:block">
              <ViewToggle activeLayout={activeLayout} setActiveLayout={setActiveLayout} />
            </div>

            {/* Mobile filter button */}
            <button
              onClick={onOpenMobileFilters}
              className="lg:hidden flex items-center space-x-1.5 border border-[#1c380e]/20 bg-white hover:bg-ivory text-charcoal px-3.5 py-2 rounded-xl text-xs font-poppins font-bold uppercase tracking-wider transition-all duration-200"
            >
              <SlidersHorizontal size={14} className="text-[#1c380e]" />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#1c380e] text-white flex items-center justify-center text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

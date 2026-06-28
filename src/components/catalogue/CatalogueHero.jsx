import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
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
    <div className="w-full select-none bg-ivory">
      {/* 1. Large, Highly Visible Search Bar Section */}
      <div className="container mx-auto px-6 md:px-12 max-w-7xl pt-4 pb-8 flex flex-col items-center">
        <div className="w-full max-w-2xl text-center space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-poppins font-bold uppercase tracking-widest text-[#1c380e]">
              Recherche Catalogue
            </span>
            <h1 className="font-serif font-bold text-2xl text-charcoal leading-tight">
              Trouvez votre prochaine lecture
            </h1>
          </div>

          <div className="relative w-full group">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-[#1c380e]/40 group-focus-within:text-[#1c380e] transition-colors" />
            </div>
            
            {/* Input Element */}
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Rechercher par titre, auteur, genre, mot-clé..."
              className="w-full bg-white border-2 border-[#1c380e]/10 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-medium text-charcoal placeholder-gray/40 outline-none focus:border-[#1c380e] focus:ring-4 focus:ring-[#1c380e]/5 transition-all shadow-sm hover:shadow-md"
            />
          </div>
        </div>
      </div>

      {/* 2. Compact Sticky Results & Controls Bar */}
      <div className="sticky top-[112px] z-40 bg-ivory/95 backdrop-blur-md border-b border-primary-soft/10 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl h-14 flex items-center justify-between gap-4">
          
          {/* Left: Tally count with a green active indicator dot */}
          <div className="text-xs font-poppins font-bold text-charcoal/80 shrink-0 uppercase tracking-wider flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#1c380e] animate-pulse"></span>
            <span>
              {resultsCount} {resultsCount > 1 ? "livres trouvés" : "livre trouvé"}
            </span>
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

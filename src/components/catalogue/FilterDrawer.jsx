import { useEffect, useState } from "react";
import { X } from "lucide-react";
import FilterContent from "./FilterContent";

export default function FilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  setSelectedCategories,
  selectedEtats,
  setSelectedEtats,
  priceRange,
  setPriceRange,
  selectedLangues,
  setSelectedLangues,
  stockOnly,
  setStockOnly,
  sortBy,
  setSortBy,
  onResetAll,
  hasActiveFilters,
  resultsCount,
  categoryCounts
}) {
  const [isRendered, setIsRendered] = useState(isOpen);

  // Sync open states with transitions
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden select-none">
      
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 2. Drawer Panel */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-full max-w-[320px] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 cubic-bezier ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-soft/10">
          <h3 className="font-serif font-bold text-lg text-[#1c380e]">
            Filtres
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-primary-soft/10 rounded-full text-charcoal transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
          <FilterContent
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedEtats={selectedEtats}
            setSelectedEtats={setSelectedEtats}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedLangues={selectedLangues}
            setSelectedLangues={setSelectedLangues}
            stockOnly={stockOnly}
            setStockOnly={setStockOnly}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onResetAll={onResetAll}
            hasActiveFilters={hasActiveFilters}
            resultsCount={resultsCount}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-ivory border-t border-primary-soft/10">
          <button
            onClick={onClose}
            className="w-full bg-[#1c380e] hover:bg-[#2c4e1d] text-white py-3 px-4 rounded-xl text-xs font-poppins font-bold uppercase tracking-wider shadow hover:shadow-lg transition-all"
          >
            Appliquer les filtres
          </button>
        </div>

      </div>

      <style>{`
        .cubic-bezier {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

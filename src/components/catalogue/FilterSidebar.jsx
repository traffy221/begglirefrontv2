import { SlidersHorizontal } from "lucide-react";
import FilterContent from "./FilterContent";

export default function FilterSidebar({
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
  return (
    <aside className="w-[280px] bg-white border-r border-primary-soft/10 sticky top-[176px] h-[calc(100vh-200px)] overflow-y-auto px-6 py-8 hidden lg:block scrollbar-thin select-none">
      
      {/* Title Header */}
      <div className="flex items-center space-x-2 border-b border-primary-soft/10 pb-4 mb-6">
        <SlidersHorizontal size={16} className="text-[#1c380e]" />
        <h3 className="font-serif font-bold text-base text-charcoal">
          Filtres de recherche
        </h3>
      </div>

      {/* Main Filter Content */}
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

    </aside>
  );
}

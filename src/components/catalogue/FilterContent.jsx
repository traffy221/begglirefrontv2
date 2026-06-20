import { Star } from "lucide-react";

export default function FilterContent({
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
  
  // Category handler
  const handleCategoryChange = (id) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // State handler
  const handleEtatChange = (etat) => {
    setSelectedEtats(prev => {
      if (prev.includes(etat)) {
        return prev.filter(e => e !== etat);
      } else {
        return [...prev, etat];
      }
    });
  };

  // Language toggle
  const handleLangueToggle = (langue) => {
    setSelectedLangues(prev => {
      if (prev.includes(langue)) {
        return prev.filter(l => l !== langue);
      } else {
        return [...prev, langue];
      }
    });
  };

  const etatsList = [
    { id: "neuf", label: "Neuf", color: "bg-emerald-500" },
    { id: "tres_bon", label: "Très bon", color: "bg-blue-500" },
    { id: "bon", label: "Bon", color: "bg-amber-500" },
    { id: "acceptable", label: "Acceptable", color: "bg-orange-500" }
  ];

  const languesList = ["Français", "Anglais", "Arabe", "Wolof", "Autre"];

  const sortOptions = [
    { id: "recent", label: "Plus récents" },
    { id: "prix_asc", label: "Prix croissant" },
    { id: "prix_desc", label: "Prix décroissant" },
    { id: "popularite", label: "Popularité (vues)" }
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* 1. SECTION: Catégories */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
            Catégories
          </h4>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-[10px] text-[#1c380e] hover:underline font-bold font-poppins"
            >
              Tout désélectionner
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.id);
            const count = categoryCounts[cat.id] || 0;

            return (
              <label key={cat.id} className="flex items-center space-x-2.5 text-xs text-charcoal/80 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCategoryChange(cat.id)}
                  className="rounded border-primary-soft/30 text-[#1c380e] focus:ring-[#1c380e]/40 h-4 w-4"
                />
                <span className={`flex-1 transition-colors ${isChecked ? "text-[#1c380e] font-semibold" : "group-hover:text-[#1c380e]"}`}>
                  {cat.name}
                </span>
                <span className="text-[10px] font-semibold text-gray/50 bg-primary-soft/10 px-2 py-0.5 rounded-full">
                  ({count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. SECTION: État du livre */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
          État du livre
        </h4>
        <div className="space-y-2">
          {etatsList.map((et) => {
            const isChecked = selectedEtats.includes(et.id);

            return (
              <label key={et.id} className="flex items-center space-x-2.5 text-xs text-charcoal/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleEtatChange(et.id)}
                  className="rounded border-primary-soft/30 text-[#1c380e] focus:ring-[#1c380e]/40 h-4 w-4"
                />
                <span className="flex items-center space-x-1.5 flex-1">
                  <span className={`w-2 h-2 rounded-full ${et.color}`} />
                  <span className={isChecked ? "text-[#1c380e] font-semibold" : ""}>{et.label}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION: Prix */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
          Tranche de Prix
        </h4>
        
        {/* Double Range Slider */}
        <div className="relative h-6 mt-6">
          <div className="absolute top-2.5 left-0 right-0 h-1 bg-primary-soft/20 rounded-full" />
          <div
            className="absolute top-2.5 h-1 bg-[#1c380e] rounded-full"
            style={{
              left: `${(priceRange.min / 50000) * 100}%`,
              right: `${100 - (priceRange.max / 50000) * 100}%`
            }}
          />
          <input
            type="range"
            min="0"
            max="50000"
            step="500"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: Math.min(Number(e.target.value), priceRange.max) })}
            className="absolute pointer-events-none appearance-none z-30 h-1.5 w-full bg-transparent accent-[#1c380e] [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          />
          <input
            type="range"
            min="0"
            max="50000"
            step="500"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: Math.max(Number(e.target.value), priceRange.min) })}
            className="absolute pointer-events-none appearance-none z-30 h-1.5 w-full bg-transparent accent-[#1c380e] [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          />
        </div>

        {/* Inputs and Labels */}
        <div className="flex items-center justify-between space-x-2 pt-2">
          <div className="w-1/2">
            <span className="text-[9px] uppercase font-bold text-gray/50 block font-poppins">Min</span>
            <input
              type="number"
              min="0"
              max="50000"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: Math.min(Number(e.target.value), priceRange.max) })}
              className="w-full bg-[#1c380e]/5 border border-primary-soft/10 rounded-lg p-1.5 text-xs font-semibold font-poppins outline-none text-[#1c380e]"
            />
          </div>
          <div className="w-1/2">
            <span className="text-[9px] uppercase font-bold text-gray/50 block font-poppins">Max</span>
            <input
              type="number"
              min="0"
              max="50000"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Math.max(Number(e.target.value), priceRange.min) })}
              className="w-full bg-[#1c380e]/5 border border-primary-soft/10 rounded-lg p-1.5 text-xs font-semibold font-poppins outline-none text-[#1c380e]"
            />
          </div>
        </div>

        <div className="text-[10px] font-poppins font-bold text-accent-gold text-center pt-1.5">
          {priceRange.min.toLocaleString()} FCFA — {priceRange.max.toLocaleString()} FCFA
        </div>
      </div>

      {/* 4. SECTION: Langue */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
          Langue
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {languesList.map((lang) => {
            const isActive = selectedLangues.includes(lang);

            return (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangueToggle(lang)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-poppins font-bold uppercase tracking-wider border transition-all duration-300 ${
                  isActive
                    ? "bg-[#1c380e] text-white border-transparent"
                    : "bg-white border-primary-soft/20 text-charcoal/70 hover:bg-[#1c380e]/5 hover:text-[#1c380e]"
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. SECTION: Disponibilité */}
      <div className="space-y-3 pt-2">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
            Livres en stock uniquement
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) => setStockOnly(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-8 h-4 bg-gray/20 rounded-full transition-colors ${stockOnly ? "bg-[#1c380e]" : ""}`} />
            <div className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${stockOnly ? "translate-x-4" : ""}`} />
          </div>
        </label>
      </div>

      {/* 6. SECTION: Tri */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
          Trier par
        </h4>
        <div className="space-y-2">
          {sortOptions.map((opt) => {
            const isActive = sortBy === opt.id;

            return (
              <label key={opt.id} className="flex items-center space-x-2.5 text-xs text-charcoal/80 cursor-pointer">
                <input
                  type="radio"
                  name="sortBy"
                  checked={isActive}
                  onChange={() => setSortBy(opt.id)}
                  className="text-[#1c380e] focus:ring-[#1c380e]/40 h-4 w-4 border-primary-soft/30"
                />
                <span className={isActive ? "text-[#1c380e] font-semibold" : ""}>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 7. Footer: Results Tally & Reset */}
      <div className="pt-6 border-t border-primary-soft/10 space-y-3">
        <p className="text-[10px] text-gray leading-normal italic">
          {resultsCount} {resultsCount > 1 ? "livres correspondent" : "livre correspond"} à vos filtres.
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetAll}
            className="w-full text-center py-2.5 px-4 border border-[#1c380e] text-[#1c380e] hover:bg-[#1c380e] hover:text-white rounded-xl text-xs font-poppins font-bold uppercase tracking-wider transition-all duration-300"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

    </div>
  );
}

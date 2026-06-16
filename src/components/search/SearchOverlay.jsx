import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, BookOpen, SearchCode } from "lucide-react";
import useSearch from "../../hooks/useSearch";
import SearchHistory from "./SearchHistory";
import SearchResults from "./SearchResults";

export default function SearchOverlay({ isOpen, onClose }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Use the search custom hook
  const {
    query,
    setQuery,
    results,
    isLoading,
    hasResults,
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    totalCount
  } = useSearch();

  const [activeFilter, setActiveFilter] = useState("all");
  const [placeholderText, setPlaceholderText] = useState("Rechercher un livre...");

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Autofocus input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Rotate placeholder text every 3s
  useEffect(() => {
    const placeholders = [
      "Rechercher un livre...",
      "Trouver un auteur...",
      "Explorer une catégorie...",
      "Lire un article..."
    ];
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % placeholders.length;
      setPlaceholderText(placeholders[idx]);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      addToHistory(query);
      navigate(`/recherche?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  // Reset active filter when query becomes empty
  useEffect(() => {
    if (!query) {
      setActiveFilter("all");
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div 
      style={{ backgroundColor: "rgba(251, 251, 249, 0.98)" }}
      className="fixed inset-0 z-50 backdrop-blur-md flex flex-col p-6 md:p-12 overflow-y-auto animate-slide-down"
    >
      
      {/* Header bar: Logo + Centered Input + Close button */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-4 border-b border-primary-soft/10 pb-4">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-2 shrink-0">
          <BookOpen className="w-6 h-6 text-[#1c380e]" />
          <span className="font-serif font-bold text-lg text-charcoal tracking-tight select-none">
            Bëgg Lire
          </span>
        </div>

        {/* Center: Search form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative flex items-center px-2">
          <Search size={22} className="text-gray/50 mr-3 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholderText}
            className="w-full bg-transparent text-xl font-serif placeholder-gray/40 outline-none text-charcoal border-b-2 border-primary-soft/30 focus:border-[#1c380e] transition-colors py-2 px-1 pr-8"
          />
          
          {/* Clear input button */}
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 p-1.5 hover:bg-slate-100 rounded-full text-gray hover:text-charcoal transition-colors"
              aria-label="Vider la recherche"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Right: Close button */}
        <button
          onClick={onClose}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-charcoal rounded-full transition-all shrink-0 shadow-sm border border-slate-200/50"
          aria-label="Fermer la recherche"
        >
          <X size={20} />
        </button>

      </div>

      {/* Filter pills bar (only if query is not empty) */}
      {query.trim().length >= 2 && (
        <div className="w-full max-w-5xl mx-auto mt-6 flex flex-wrap gap-2 justify-start items-center border-b border-primary-soft/10 pb-4 animate-fade-in select-none">
          {[
            { id: "all", label: "Tous", count: totalCount },
            { id: "livres", label: "Livres", count: results.livres.length },
            { id: "auteurs", label: "Auteurs", count: results.auteurs.length },
            { id: "categories", label: "Catégories", count: results.categories.length },
            { id: "articles", label: "Articles", count: results.articles.length }
          ].map((filter) => {
            const active = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-poppins font-semibold transition-all ${
                  active
                    ? "bg-[#1c380e] text-white shadow-sm"
                    : "bg-white border border-primary-soft/20 text-gray hover:text-charcoal hover:bg-slate-50"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            );
          })}
        </div>
      )}

      {/* Content panel */}
      <div className="w-full max-w-3xl mx-auto flex-1 mt-8">
        
        {/* Case A: Query is empty -> show history */}
        {!query.trim() && (
          <SearchHistory
            history={history}
            setQuery={setQuery}
            removeFromHistory={removeFromHistory}
            clearHistory={clearHistory}
          />
        )}

        {/* Case B: Loading state skeleton */}
        {query.trim() && isLoading && (
          <div className="space-y-4 py-6">
            <div className="flex items-center space-x-2 text-xs text-gray/50 font-poppins">
              <Loader2 size={12} className="animate-spin text-[#1c380e]" />
              <span>Recherche en cours...</span>
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-12 bg-slate-100 rounded-2xl animate-pulse w-full" />
              <div className="h-12 bg-slate-100 rounded-2xl animate-pulse w-[95%]" />
              <div className="h-12 bg-slate-100 rounded-2xl animate-pulse w-[90%]" />
            </div>
          </div>
        )}

        {/* Case C: Has results -> show search results list */}
        {query.trim() && !isLoading && hasResults && (
          <div className="space-y-6">
            <SearchResults
              results={results}
              activeFilter={activeFilter}
              query={query}
              onClose={onClose}
              addToHistory={addToHistory}
            />
            
            {/* View all results button */}
            <div className="border-t border-primary-soft/5 pt-4 text-center">
              <button
                onClick={handleSearchSubmit}
                className="bg-[#1c380e] hover:bg-primary-dark text-white font-poppins text-xs font-bold py-3 px-8 rounded-xl shadow uppercase tracking-wider transition-all"
              >
                Voir tous les résultats ({totalCount})
              </button>
            </div>
          </div>
        )}

        {/* Case D: Query >= 2 but no results */}
        {query.trim().length >= 2 && !isLoading && !hasResults && (
          <div className="text-center py-12 space-y-4 max-w-sm mx-auto animate-fade-in">
            <div className="w-16 h-16 bg-primary-soft/20 text-[#1c380e] rounded-full flex items-center justify-center mx-auto">
              <X size={28} />
            </div>
            
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-lg text-charcoal">
                Aucun résultat pour « {query} »
              </h4>
              <p className="text-xs text-gray font-light leading-relaxed">
                Vérifiez l'orthographe ou essayez d'autres mots clés.
              </p>
            </div>

            <div className="pt-2 text-xs text-gray font-poppins">
              <span>Suggestions : </span>
              <button
                onClick={() => handleSuggestionClick("Roman")}
                className="text-primary hover:underline font-semibold mx-1"
              >
                Roman
              </button>
              <span>|</span>
              <button
                onClick={() => handleSuggestionClick("Sembène")}
                className="text-primary hover:underline font-semibold mx-1"
              >
                Sembène
              </button>
              <span>|</span>
              <button
                onClick={() => handleSuggestionClick("Senghor")}
                className="text-primary hover:underline font-semibold mx-1"
              >
                Senghor
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Inject custom slide-down animation */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
}

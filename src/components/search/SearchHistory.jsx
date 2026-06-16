import { Clock, X, TrendingUp } from "lucide-react";

export default function SearchHistory({ history, setQuery, removeFromHistory, clearHistory }) {
  const trends = [
    "Roman africain",
    "Sembène",
    "Livres scolaires",
    "Cheikh Hamidou Kane",
    "Thriller",
    "BD"
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans max-w-2xl mx-auto py-4">
      {/* 1. Recent Searches Section */}
      {history && history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-primary-soft/10 pb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
              Recherches récentes
            </span>
            <button
              onClick={clearHistory}
              className="text-[10px] text-primary hover:text-primary-dark transition-colors font-semibold font-poppins"
            >
              Tout effacer
            </button>
          </div>
          
          <div className="flex flex-col divide-y divide-primary-soft/5">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2.5 group cursor-pointer"
              >
                <div
                  onClick={() => setQuery(item)}
                  className="flex items-center space-x-3 flex-1 min-w-0"
                >
                  <Clock size={14} className="text-gray/50 shrink-0" />
                  <span className="text-xs text-charcoal font-medium truncate group-hover:text-primary transition-colors">
                    {item}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item);
                  }}
                  className="p-1 hover:bg-slate-100 rounded-full text-gray hover:text-charcoal transition-colors ml-2"
                  aria-label={`Supprimer ${item} de l'historique`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Popular Trends Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-primary-soft/10 pb-2">
          <TrendingUp size={14} className="text-accent-gold" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
            Tendances sur Bëgg Lire
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {trends.map((trend, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(trend)}
              className="px-3.5 py-1.5 bg-ivory border border-primary-soft/20 text-xs font-medium text-gray hover:text-charcoal hover:border-primary-dark hover:bg-slate-50 rounded-full transition-all duration-200 select-none font-poppins"
            >
              {trend}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

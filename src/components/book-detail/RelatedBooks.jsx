import { Link } from "react-router-dom";
import { Eye, ChevronRight } from "lucide-react";
import { useRelatedBooks, useBooks } from "../../hooks/useQueries";

export default function RelatedBooks({ currentBookId }) {
  // 1. Fetch related books
  const { data: relatedResponse, isLoading: relatedLoading } = useRelatedBooks(currentBookId);

  // 2. Fetch fallbacks (all books) in case related is empty or fails
  const { data: fallbackResponse, isLoading: fallbackLoading } = useBooks("tous");

  const relatedData = relatedResponse?.data || relatedResponse || [];
  const fallbackData = fallbackResponse?.data || fallbackResponse || [];

  // Filter out current book
  const finalBooks = (relatedData.length > 0 ? relatedData : fallbackData)
    .filter(b => Number(b.id) !== Number(currentBookId))
    .slice(0, 6);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  if (relatedLoading || (finalBooks.length === 0 && fallbackLoading)) {
    return (
      <div className="bg-ivory border-t border-primary-soft/10 py-16 px-6 md:px-12 max-w-5xl mx-auto font-sans select-none">
        <h3 className="font-serif font-bold text-2xl text-[#1c380e] mb-8">
          Vous devriez aussi aimer
        </h3>
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="w-[180px] md:w-[220px] shrink-0 animate-pulse space-y-3">
              <div className="h-60 bg-white/50 rounded-2xl border border-primary-soft/10" />
              <div className="h-4 bg-white/50 rounded w-3/4" />
              <div className="h-3 bg-white/50 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (finalBooks.length === 0) return null;

  return (
    <div className="bg-ivory border-t border-primary-soft/10 py-16 px-6 md:px-12 max-w-5xl mx-auto font-sans select-none">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-serif font-bold text-2xl text-[#1c380e]">
          Vous devriez aussi aimer
        </h3>
        <Link
          to="/catalogue"
          className="text-xs font-bold font-poppins text-[#1c380e] hover:underline flex items-center space-x-1 uppercase tracking-wider"
        >
          <span>Voir le catalogue</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Horizontal scrolling wrapper */}
      <div className="flex space-x-6 overflow-x-auto pb-6 scroll-smooth snap-x scrollbar-thin">
        {finalBooks.map((relatedBook) => {
          const coverUrl = getImgUrl(relatedBook.image || relatedBook.cover || relatedBook.image_link);
          const price = Number(relatedBook.prix_vente !== undefined ? relatedBook.prix_vente : (relatedBook.prix !== undefined ? relatedBook.prix : 0));
          const author = relatedBook.auteur || "Auteur inconnu";

          return (
            <div
              key={relatedBook.id}
              className="snap-start shrink-0 w-[180px] md:w-[220px] bg-white rounded-2xl p-4 border border-primary-soft/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Image Container with view details overlay */}
                <Link
                  to={`/catalogue/${relatedBook.id}`}
                  className="h-48 md:h-56 overflow-hidden rounded-xl relative block bg-[#1c380e]/5 border border-[#1c380e]/5"
                >
                  <img
                    src={coverUrl}
                    alt={relatedBook.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#1c380e]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white rounded-full p-2 text-[#1c380e] shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye size={16} />
                    </div>
                  </div>
                </Link>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-xs md:text-sm text-charcoal line-clamp-1 group-hover:text-primary transition-colors">
                    <Link to={`/catalogue/${relatedBook.id}`}>{relatedBook.titre}</Link>
                  </h4>
                  <p className="text-[10px] text-gray line-clamp-1">{author}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-primary-soft/10 text-[11px]">
                <span className="font-poppins font-bold text-accent-gold">
                  {price.toLocaleString()} FCFA
                </span>
                <Link
                  to={`/catalogue/${relatedBook.id}`}
                  className="text-[#1c380e] font-poppins font-bold uppercase tracking-wider hover:underline"
                >
                  Voir
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        /* Custom thin scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(28, 56, 14, 0.05);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(28, 56, 14, 0.15);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(28, 56, 14, 0.3);
        }
      `}</style>
    </div>
  );
}

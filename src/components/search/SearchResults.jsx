import { useNavigate } from "react-router-dom";
import { Tag, BookOpen, FileText } from "lucide-react";
import { useCallback } from "react";

export default function SearchResults({ results, activeFilter, query, onClose, addToHistory }) {
  const navigate = useNavigate();

  // Helper function to escape regex characters
  const escapeRegex = (string) => {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  // Safe search highlighting
  const highlightQuery = useCallback((text, search) => {
    if (!search || !search.trim()) return text;
    try {
      const escapedSearch = escapeRegex(search.trim());
      const regex = new RegExp(`(${escapedSearch})`, "gi");
      return text.replace(regex, `<mark class="bg-amber-200 text-charcoal font-semibold px-0.5">$1</mark>`);
    } catch (e) {
      return text;
    }
  }, []);

  const handleBookClick = (book) => {
    if (addToHistory) addToHistory(query);
    navigate(`/catalogue/${book.id}`);
    onClose();
  };

  const handleAuthorClick = (authorName) => {
    if (addToHistory) addToHistory(query);
    navigate(`/recherche?q=${encodeURIComponent(authorName)}&type=auteurs`);
    onClose();
  };

  const handleCategoryClick = (category) => {
    if (addToHistory) addToHistory(query);
    // Listing page uses 'category' or 'categorie' search parameter
    navigate(`/catalogue?categorie=${category.id}`);
    onClose();
  };

  const handleArticleClick = (article) => {
    if (addToHistory) addToHistory(query);
    navigate(`/communaute/article/${article.type}/${article.id}`);
    onClose();
  };

  // Helper to extract author initials
  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const { livres, auteurs, categories, articles } = results;

  // Filter based on activeFilter pill
  const showLivres = (activeFilter === "all" || activeFilter === "livres") && livres.length > 0;
  const showAuteurs = (activeFilter === "all" || activeFilter === "auteurs") && auteurs.length > 0;
  const showCategories = (activeFilter === "all" || activeFilter === "categories") && categories.length > 0;
  const showArticles = (activeFilter === "all" || activeFilter === "articles") && articles.length > 0;

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary-soft/40 scrollbar-track-transparent">
      
      {/* 1. BOOKS SECTION */}
      {showLivres && (
        <div className="space-y-2.5">
          <div className="border-b border-primary-soft/5 pb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
              Livres
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {livres.slice(0, 5).map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book)}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-primary-soft/10 hover:bg-primary-soft/10 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Miniature Cover */}
                  <div className="w-10 h-14 bg-ivory rounded-md overflow-hidden shrink-0 border border-primary-soft/10 shadow-sm flex items-center justify-center">
                    {book.image || book.cover || book.image_link ? (
                      <img
                        src={book.image || book.cover || book.image_link}
                        alt={book.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen size={18} className="text-primary-dark/25" />
                    )}
                  </div>
                  
                  {/* Info details */}
                  <div className="min-w-0 leading-tight">
                    <h5
                      className="font-serif font-bold text-sm text-charcoal truncate"
                      dangerouslySetInnerHTML={{ __html: highlightQuery(book.titre, query) }}
                    />
                    <p className="text-xs text-gray/70 font-light truncate mt-0.5">
                      Par {book.auteur}
                    </p>
                    <span className="text-[11px] font-semibold text-[#1c380e] block mt-0.5">
                      {(book.prix_vente || book.prix || 0).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                {/* Category badge */}
                <span className="text-[9px] font-poppins font-bold bg-primary-soft/30 text-primary-dark px-2.5 py-1 rounded-full uppercase shrink-0">
                  {book.category?.name || book.categorie || "Roman"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. AUTHORS SECTION */}
      {showAuteurs && (
        <div className="space-y-2.5 pt-2">
          <div className="border-b border-primary-soft/5 pb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
              Auteurs
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {auteurs.slice(0, 3).map((author, idx) => (
              <div
                key={idx}
                onClick={() => handleAuthorClick(author.nom)}
                className="flex items-center space-x-3 p-3 rounded-2xl bg-white border border-primary-soft/10 hover:border-[#1c380e]/20 hover:bg-slate-50/50 cursor-pointer transition-all duration-200"
              >
                {/* Initials Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#1c380e] text-white flex items-center justify-center font-poppins font-bold text-[10px] shrink-0">
                  {getInitials(author.nom)}
                </div>
                
                {/* Details */}
                <div className="min-w-0 leading-tight">
                  <h5
                    className="font-poppins font-bold text-xs text-charcoal truncate"
                    dangerouslySetInnerHTML={{ __html: highlightQuery(author.nom, query) }}
                  />
                  <p className="text-[10px] text-gray/65 mt-0.5 font-light">
                    {author.count} {author.count > 1 ? "ouvrages trouvés" : "ouvrage trouvé"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CATEGORIES SECTION */}
      {showCategories && (
        <div className="space-y-2.5 pt-2">
          <div className="border-b border-primary-soft/5 pb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
              Catégories
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {categories.slice(0, 3).map((category, idx) => (
              <div
                key={idx}
                onClick={() => handleCategoryClick(category)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white border border-primary-soft/10 hover:bg-primary-soft/5 cursor-pointer transition-all duration-200 select-none group"
              >
                <Tag size={12} className="text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <span
                  className="text-xs text-charcoal font-semibold font-poppins"
                  dangerouslySetInnerHTML={{ __html: highlightQuery(category.name, query) }}
                />
                <span className="text-[9px] text-gray/45 font-poppins bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ARTICLES SECTION */}
      {showArticles && (
        <div className="space-y-2.5 pt-2">
          <div className="border-b border-primary-soft/5 pb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray font-poppins">
              Articles & Chroniques
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {articles.slice(0, 3).map((article) => (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-primary-soft/10 hover:bg-primary-soft/10 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Article cover */}
                  <div className="w-10 h-10 bg-primary-soft/15 rounded overflow-hidden shrink-0 border border-primary-soft/10 flex items-center justify-center">
                    {article.image ? (
                      <img src={article.image} alt={article.titre} className="w-full h-full object-cover" />
                    ) : (
                      <FileText size={16} className="text-primary-dark/30" />
                    )}
                  </div>
                  
                  {/* Title details */}
                  <div className="min-w-0 leading-tight">
                    <h5
                      className="font-poppins font-bold text-xs text-charcoal truncate"
                      dangerouslySetInnerHTML={{ __html: highlightQuery(article.titre, query) }}
                    />
                    <p className="text-[10px] text-gray/50 mt-0.5 font-light truncate max-w-lg">
                      {article.content.replace(/<[^>]*>/g, "").substring(0, 90)}...
                    </p>
                  </div>
                </div>

                {/* Badge Type */}
                <span className="text-[9px] font-poppins font-bold bg-[#1c380e]/10 text-[#1c380e] px-2.5 py-1 rounded border border-[#1c380e]/15 uppercase shrink-0 select-none">
                  {article.type === "chronique" ? "Chronique" : "Article"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

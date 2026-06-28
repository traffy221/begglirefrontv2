import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Eye, Filter, ArrowUpDown, Tag, BookOpen, FileText, RefreshCw, X, AlertCircle } from "lucide-react";
import { useSearch, useCategories, useArticles, useBooks } from "../hooks/useQueries";
import { IMAGE_URL } from "../api/client";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read URL params
  const q = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";
  const initialCategory = searchParams.get("categorie") || "all";

  // Filter and Input States
  const [searchInput, setSearchInput] = useState(q);
  const [debouncedInput, setDebouncedInput] = useState(q);
  
  // Advanced filters states
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState("pertinence");
  
  // Accordion toggle for mobile filters
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync input with q param when q changes externally
  useEffect(() => {
    setSearchInput(q);
    setDebouncedInput(q);
  }, [q]);

  // Sync types and category from URL params
  useEffect(() => {
    setSelectedType(initialType);
    setSelectedCategory(initialCategory);
  }, [initialType, initialCategory]);

  // Debounce input typed directly on SearchPage
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Update URL search query param reactively as user types
  useEffect(() => {
    if (debouncedInput.trim() !== q) {
      const newParams = { q: debouncedInput.trim() };
      if (selectedType !== "all") newParams.type = selectedType;
      if (selectedCategory !== "all") newParams.categorie = selectedCategory;
      setSearchParams(newParams, { replace: true });
    }
  }, [debouncedInput, setSearchParams, q, selectedType, selectedCategory]);

  // Queries
  const { data: searchBooksData, isLoading: booksLoading } = useSearch(q);
  const { data: articlesData, isLoading: articlesLoading } = useArticles();
  const { data: categoriesData } = useCategories();
  const { data: allBooksData } = useBooks("tous"); // used for empty state suggestions

  const categories = categoriesData?.data || categoriesData || [];
  const articlesList = articlesData?.data || articlesData || [];
  const popularSuggestions = useMemo(() => {
    const list = allBooksData?.data || allBooksData || [];
    return list.slice(0, 3);
  }, [allBooksData]);

  const isLoading = booksLoading || articlesLoading;

  // Grouped results extraction and filtering
  const matchingBooks = useMemo(() => {
    const list = searchBooksData?.data?.data || searchBooksData?.data || searchBooksData || [];
    return Array.isArray(list) ? list : [];
  }, [searchBooksData]);

  const matchesCondition = (book, cond) => {
    if (cond === "all") return true;
    const bookCond = (book.etat || book.etat_livre || "").toLowerCase();
    if (cond === "neuf") return bookCond === "neuf";
    if (cond === "tres_bon") return bookCond === "tres_bon";
    if (cond === "bon") return bookCond === "bon" || bookCond === "occasion";
    if (cond === "acceptable") return bookCond === "acceptable";
    return false;
  };

  const processedBooks = useMemo(() => {
    // 1. Filter matching books
    let result = matchingBooks.filter((book) => {
      // Category filter
      if (selectedCategory !== "all") {
        const catId = book.category?.id || book.category_id;
        if (String(catId) !== String(selectedCategory)) return false;
      }
      
      // Condition filter
      if (!matchesCondition(book, selectedCondition)) return false;

      // Price filter
      const price = Number(book.prix_vente || book.prix || 0);
      if (price > maxPrice) return false;

      return true;
    });

    // 2. Sorting
    result.sort((a, b) => {
      const priceA = Number(a.prix_vente || a.prix || 0);
      const priceB = Number(b.prix_vente || b.prix || 0);
      const viewsA = Number(a.views_count || a.nb_vues || 0);
      const viewsB = Number(b.views_count || b.nb_vues || 0);

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "popularity") return viewsB - viewsA;
      if (sortBy === "recent") return b.id - a.id;
      
      // Default: pertinence (keep search rank)
      return 0;
    });

    return result;
  }, [matchingBooks, selectedCategory, selectedCondition, maxPrice, sortBy]);

  // Extract Authors based on matching query books
  const authors = useMemo(() => {
    const uniqueAuthors = [...new Set(matchingBooks.map((b) => b.auteur).filter(Boolean))];
    return uniqueAuthors.map((name) => {
      const count = matchingBooks.filter((b) => b.auteur === name).length;
      return { nom: name, count };
    });
  }, [matchingBooks]);

  // Filter articles by query string
  const filteredArticles = useMemo(() => {
    if (!q.trim()) return [];
    const lowerQuery = q.toLowerCase();
    return articlesList.filter((art) => {
      const titleMatch = (art.title || art.titre || "").toLowerCase().includes(lowerQuery);
      const contentMatch = (art.content || art.contenu || "").toLowerCase().includes(lowerQuery);
      return titleMatch || contentMatch;
    });
  }, [articlesList, q]);

  // Total results count across all segments (based on current filters/searches)
  const totalCount = useMemo(() => {
    return processedBooks.length + authors.length + filteredArticles.length;
  }, [processedBooks, authors, filteredArticles]);

  const isFilterActive = 
    selectedCategory !== "all" ||
    selectedCondition !== "all" ||
    maxPrice < 50000 ||
    sortBy !== "pertinence" ||
    selectedType !== "all";

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedCondition("all");
    setMaxPrice(50000);
    setSortBy("pertinence");
    setSelectedType("all");
    setSearchParams({ q }, { replace: true });
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    const params = { q };
    if (type !== "all") params.type = type;
    if (selectedCategory !== "all") params.categorie = selectedCategory;
    setSearchParams(params, { replace: true });
  };

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
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

  return (
    <div className="container mx-auto px-6 md:px-12 max-w-7xl py-12">
      
      {/* 1. Page Header with Search input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary-soft/10 pb-8 mb-8">
        <div className="space-y-2">
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-charcoal">
            {q ? `Résultats pour « ${q} »` : "Recherche sur Bëgg Lire"}
          </h1>
          <p className="text-xs md:text-sm text-gray font-light">
            {q ? `${totalCount} résultats trouvés` : "Saisissez un mot clé pour commencer l'exploration"}
          </p>
        </div>

        {/* Small page-level search input */}
        <div className="max-w-md w-full relative flex items-center bg-white border border-primary-soft/20 rounded-2xl p-2 shadow-sm shrink-0">
          <Search className="text-gray/50 mr-2 ml-2" size={18} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nouvelle recherche..."
            className="w-full bg-transparent text-sm text-charcoal outline-none placeholder-gray/40 py-1.5"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="p-1 hover:bg-slate-100 rounded-full text-gray hover:text-charcoal transition-colors mr-1"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Advanced Filters Bar & Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* ==========================================
           SIDEBAR - FILTERS PANEL (Desktop sticky)
           ========================================== */}
        <aside className="lg:col-span-3 bg-white rounded-3xl p-6 border border-primary-soft/20 shadow-sm space-y-6 lg:sticky lg:top-32">
          
          <div className="flex items-center justify-between border-b border-primary-soft/10 pb-4">
            <div className="flex items-center space-x-2">
              <Filter className="text-primary-dark shrink-0" size={16} />
              <h2 className="font-serif font-bold text-base text-charcoal">Filtres avancés</h2>
            </div>
            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="text-[10px] text-rose-600 hover:text-rose-800 transition-colors font-semibold flex items-center space-x-0.5"
              >
                <RefreshCw size={10} className="animate-spin-slow" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>

          {/* Toggle for mobile filters dropdown */}
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="lg:hidden w-full flex items-center justify-between py-2 text-xs font-poppins font-bold text-[#1c380e] uppercase tracking-wider"
          >
            <span>{isMobileFiltersOpen ? "Masquer les filtres ▲" : "Afficher les filtres ▼"}</span>
          </button>

          {/* Filters List */}
          <div className={`space-y-6 lg:block ${isMobileFiltersOpen ? "block" : "hidden"}`}>
            
            {/* Filter Category */}
            <div className="space-y-2.5">
              <label className="text-[10px] uppercase font-poppins font-bold text-gray tracking-wider">
                Catégorie de livre
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-ivory text-xs border border-primary-soft/30 rounded-xl p-2.5 outline-none text-charcoal cursor-pointer"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Condition (Etat) */}
            <div className="space-y-2.5">
              <label className="text-[10px] uppercase font-poppins font-bold text-gray tracking-wider block">
                État physique
              </label>
              <div className="flex flex-col space-y-1">
                {[
                  { id: "all", label: "Tous" },
                  { id: "neuf", label: "🟢 Neuf" },
                  { id: "tres_bon", label: "🔵 Très bon" },
                  { id: "bon", label: "🟡 Bon" },
                  { id: "acceptable", label: "🟠 Acceptable" }
                ].map((cond) => {
                  const active = selectedCondition === cond.id;
                  return (
                    <button
                      key={cond.id}
                      onClick={() => setSelectedCondition(cond.id)}
                      className={`text-left text-xs py-1.5 px-3 rounded-lg transition-colors font-medium ${
                        active
                          ? "bg-primary-soft/30 text-primary-dark font-semibold shadow-inner"
                          : "text-charcoal hover:bg-slate-50"
                      }`}
                    >
                      {cond.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Price Max */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[10px] uppercase font-poppins font-bold text-gray tracking-wider">
                <span>Prix maximum</span>
                <span className="text-primary-dark font-bold">
                  {maxPrice.toLocaleString()} FCFA
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-primary-soft/40 rounded-lg appearance-none cursor-pointer accent-[#1c380e]"
              />
              <div className="flex justify-between text-[9px] text-gray/45 font-poppins">
                <span>0 FCFA</span>
                <span>50 000 FCFA</span>
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-2.5">
              <label className="text-[10px] uppercase font-poppins font-bold text-gray tracking-wider flex items-center">
                <ArrowUpDown size={11} className="mr-1 text-primary-dark" /> Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-ivory text-xs border border-primary-soft/30 rounded-xl p-2.5 outline-none text-charcoal cursor-pointer"
              >
                <option value="pertinence">Pertinence</option>
                <option value="recent">Plus récent d'abord</option>
                <option value="price-asc">Prix : croissant</option>
                <option value="price-desc">Prix : décroissant</option>
                <option value="popularity">Popularité (vues)</option>
              </select>
            </div>

          </div>
        </aside>

        {/* ==========================================
           MAIN CONTENT AREA (9/12 cols)
           ========================================== */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Segment selection tabs/pills */}
          {q.trim() && (
            <div className="flex bg-white p-1 rounded-2xl border border-primary-soft/20 max-w-md select-none">
              {[
                { id: "all", label: "Tous" },
                { id: "livres", label: "Livres" },
                { id: "auteurs", label: "Auteurs" },
                { id: "articles", label: "Articles" }
              ].map((t) => {
                const active = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTypeSelect(t.id)}
                    className={`w-1/4 py-2 text-center rounded-xl text-xs font-poppins font-semibold transition-all ${
                      active
                        ? "bg-[#1c380e] text-white shadow-sm"
                        : "text-gray hover:text-charcoal"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading display */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-3xl border border-primary-soft/10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-dark" />
              <p className="font-serif italic text-gray text-sm">Exploration en cours...</p>
            </div>
          ) : totalCount > 0 ? (
            <div className="space-y-10">
              
              {/* Group A: Books display */}
              {(selectedType === "all" || selectedType === "livres") && processedBooks.length > 0 && (
                <div className="space-y-4">
                  {selectedType === "all" && (
                    <h2 className="font-serif font-bold text-lg text-charcoal border-b border-primary-soft/10 pb-2">
                      Livres correspondants ({processedBooks.length})
                    </h2>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {processedBooks.map((book, idx) => {
                      // Alternate layout if displaying all items: first item is featured (full width)
                      const isFeatured = selectedType === "all" && idx === 0;

                      if (isFeatured) {
                        return (
                          <div
                            key={book.id}
                            className="col-span-full bg-white rounded-3xl p-5 border border-primary-soft/20 shadow-sm hover:shadow-md transition-shadow group grid grid-cols-1 md:grid-cols-12 gap-5 items-center font-sans"
                          >
                            <Link
                              to={`/catalogue/${book.id}`}
                              className="md:col-span-4 h-52 md:h-64 overflow-hidden rounded-2xl relative block bg-ivory"
                            >
                              <img
                                src={getImgUrl(book.image || book.cover || book.image_link)}
                                alt={book.titre}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                              />
                            </Link>

                            <div className="md:col-span-8 flex flex-col justify-between h-full py-2 space-y-3">
                              <div className="space-y-1.5">
                                <span className="font-poppins uppercase tracking-wider text-[9px] font-bold text-primary block">
                                  Suggestion à la une
                                </span>
                                <h3 className="font-serif font-bold text-xl md:text-2xl text-charcoal group-hover:text-primary transition-colors">
                                  <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
                                </h3>
                                <p className="text-xs text-gray font-medium">Par {book.auteur}</p>
                                <p className="text-gray/80 text-xs leading-relaxed line-clamp-3 font-light">
                                  {book.description || "Aucune description supplémentaire disponible pour cet ouvrage."}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-primary-soft/10">
                                <span className="text-lg font-serif font-bold text-primary-dark">
                                  {(book.prix_vente || book.prix || 0).toLocaleString()} FCFA
                                </span>
                                <Link
                                  to={`/catalogue/${book.id}`}
                                  className="bg-[#1c380e] hover:bg-primary-dark text-white text-[10px] font-poppins font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all"
                                >
                                  Consulter
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Normal Compact card
                      return (
                        <div
                          key={book.id}
                          className="col-span-1 bg-white rounded-2xl p-4 border border-primary-soft/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-full font-sans"
                        >
                          <div className="space-y-3">
                            <Link
                              to={`/catalogue/${book.id}`}
                              className="h-44 overflow-hidden rounded-xl relative block bg-ivory"
                            >
                              <img
                                src={getImgUrl(book.image || book.cover || book.image_link)}
                                alt={book.titre}
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                              />
                            </Link>

                            <div className="space-y-1">
                              <span className="font-poppins uppercase tracking-wider text-[9px] font-bold text-gray/50 block">
                                {book.category?.name || book.categorie || "Livre"}
                              </span>
                              <h4 className="font-serif font-bold text-sm text-charcoal line-clamp-1 group-hover:text-primary transition-colors">
                                <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
                              </h4>
                              <p className="text-[11px] text-gray truncate font-light">Par {book.auteur}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-primary-soft/10">
                            <span className="font-serif font-bold text-primary-dark text-sm">
                              {(book.prix_vente || book.prix || 0).toLocaleString()} FCFA
                            </span>
                            <Link
                              to={`/catalogue/${book.id}`}
                              className="text-xs font-bold text-primary hover:text-[#1c380e] font-poppins"
                            >
                              Voir
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group B: Authors display */}
              {(selectedType === "all" || selectedType === "auteurs") && authors.length > 0 && (
                <div className="space-y-4 pt-4">
                  {selectedType === "all" && (
                    <h2 className="font-serif font-bold text-lg text-charcoal border-b border-primary-soft/10 pb-2">
                      Auteurs correspondants ({authors.length})
                    </h2>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-sans">
                    {authors.map((author, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/recherche?q=${encodeURIComponent(author.nom)}&type=livres`)}
                        className="flex items-center space-x-3.5 p-4 rounded-2xl bg-white border border-primary-soft/15 hover:border-primary-dark/20 cursor-pointer shadow-sm hover:shadow transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#1c380e] text-white flex items-center justify-center font-poppins font-bold text-xs shrink-0 shadow-inner">
                          {getInitials(author.nom)}
                        </div>
                        <div className="min-w-0 leading-tight">
                          <h5 className="font-poppins font-bold text-xs text-charcoal group-hover:text-primary transition-colors truncate">
                            {author.nom}
                          </h5>
                          <p className="text-[10px] text-gray/60 font-light mt-0.5">
                            {author.count} {author.count > 1 ? "ouvrages disponibles" : "ouvrage disponible"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group C: Articles display */}
              {(selectedType === "all" || selectedType === "articles") && filteredArticles.length > 0 && (
                <div className="space-y-4 pt-4">
                  {selectedType === "all" && (
                    <h2 className="font-serif font-bold text-lg text-charcoal border-b border-primary-soft/10 pb-2">
                      Articles & Chroniques correspondants ({filteredArticles.length})
                    </h2>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                    {filteredArticles.map((art) => (
                      <div
                        key={art.id}
                        className="bg-white rounded-2xl border border-primary-soft/15 overflow-hidden shadow-sm hover:shadow transition-shadow group flex flex-col justify-between"
                      >
                        <div>
                          {/* Image */}
                          <div className="h-40 overflow-hidden relative bg-primary-soft/5">
                            {art.image ? (
                              <img
                                src={art.image}
                                alt={art.title || art.titre}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary-dark/20">
                                <FileText size={36} />
                              </div>
                            )}
                            <span className="absolute top-3 left-3 text-[9px] font-poppins font-bold bg-[#1c380e] text-white px-2 py-0.5 rounded shadow">
                              {art.type === "chronique" ? "Chronique" : "Article"}
                            </span>
                          </div>
                          
                          {/* Content text */}
                          <div className="p-4 space-y-2">
                            <h4 className="font-poppins font-bold text-sm text-charcoal leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                              {art.title || art.titre}
                            </h4>
                            <p className="text-xs text-gray/80 leading-normal line-clamp-3 font-light">
                              {(art.content || art.contenu || "").replace(/<[^>]*>/g, "")}
                            </p>
                          </div>
                        </div>

                        {/* Card footer */}
                        <div className="p-4 border-t border-primary-soft/10 flex justify-end">
                          <Link
                            to={`/communaute/article/${art.type || "article"}/${art.id}`}
                            className="text-xs font-bold text-primary hover:text-primary-dark font-poppins"
                          >
                            Lire l'article
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            
            /* EMPTY RESULTS STATE */
            <div className="bg-white rounded-3xl p-10 md:p-16 text-center border border-primary-soft/20 shadow-sm flex flex-col items-center justify-center space-y-6 animate-fade-in font-sans">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                <AlertCircle size={28} />
              </div>
              
              <div className="space-y-2 max-w-sm">
                <h3 className="font-serif font-bold text-xl text-charcoal">
                  Aucun résultat pour « {q} »
                </h3>
                <p className="text-xs text-gray font-light leading-relaxed">
                  Nous n'avons trouvé aucun livre, auteur ou article correspondant à vos filtres.
                </p>
              </div>

              {/* Popular recommendations suggestions */}
              {popularSuggestions.length > 0 && (
                <div className="space-y-4 pt-4 w-full max-w-md border-t border-primary-soft/10">
                  <span className="text-[10px] uppercase font-poppins font-bold text-gray tracking-wider block">
                    Vous cherchiez peut-être...
                  </span>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {popularSuggestions.map((book) => (
                      <Link
                        key={book.id}
                        to={`/catalogue/${book.id}`}
                        className="space-y-1 block text-left group"
                      >
                        <div className="h-28 rounded-lg overflow-hidden bg-ivory border border-primary-soft/10 shadow-sm">
                          <img
                            src={getImgUrl(book.image || book.cover || book.image_link)}
                            alt={book.titre}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-charcoal truncate block font-serif group-hover:text-primary">
                          {book.titre}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to="/catalogue"
                className="bg-[#1c380e] hover:bg-primary-dark text-white font-poppins text-xs font-bold py-3 px-8 rounded-xl shadow uppercase tracking-wider transition-all pt-2"
              >
                Voir tout le catalogue
              </Link>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

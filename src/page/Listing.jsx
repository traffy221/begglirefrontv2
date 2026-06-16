import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Eye, Filter, ArrowUpDown } from "lucide-react";
import { useBooks, useCategories, useBooksByCategory, useSearch } from "../hooks/useQueries";
import { IMAGE_URL } from "../api/client";

const Listing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "all";

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [sortBy, setSortBy] = useState("recent"); // 'recent' | 'price-asc' | 'price-desc'
  const [searchInput, setSearchInput] = useState(searchParamQuery);
  const [activeSearch, setActiveSearch] = useState(searchParamQuery);

  // Sync state with URL search param
  useEffect(() => {
    setSearchInput(searchParamQuery);
    setActiveSearch(searchParamQuery);
    if (searchParamQuery) {
      setSelectedCategory("all"); // Reset category if search is triggered from url
    }
  }, [searchParamQuery]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      if (categoryParam !== "all") {
        setActiveSearch("");
        setSearchInput("");
      }
    }
  }, [categoryParam]);

  // Queries
  const { data: categoriesData } = useCategories();
  
  // Data Fetching Strategies based on active states
  const { data: allBooksData, isLoading: allLoading } = useBooks("tous");
  const { data: catBooksData, isLoading: catLoading } = useBooksByCategory(
    selectedCategory !== "all" ? selectedCategory : null
  );
  const { data: searchBooksData, isLoading: searchLoading } = useSearch(
    activeSearch ? activeSearch : ""
  );

  // Extract Books
  const books = useMemo(() => {
    let list = [];
    if (activeSearch) {
      list = searchBooksData?.data?.data || searchBooksData?.data || searchBooksData || [];
    } else if (selectedCategory !== "all") {
      list = catBooksData?.data?.data || catBooksData?.data || catBooksData || [];
    } else {
      list = allBooksData?.data?.data || allBooksData?.data || allBooksData || [];
    }
    return Array.isArray(list) ? list : [];
  }, [activeSearch, selectedCategory, allBooksData, catBooksData, searchBooksData]);

  // Categories list
  const categories = categoriesData?.data || categoriesData || [];

  // Filter and Sort in-memory
  const processedBooks = useMemo(() => {
    // 1. Filter by price
    let result = books.filter((book) => {
      const price = Number(book.prix_vente || book.prix || 0);
      return price <= maxPrice;
    });

    // 2. Sort
    result.sort((a, b) => {
      const priceA = Number(a.prix_vente || a.prix || 0);
      const priceB = Number(b.prix_vente || b.prix || 0);
      
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      
      // Default: recent (newest ID first)
      return b.id - a.id;
    });

    return result;
  }, [books, maxPrice, sortBy]);

  // Loading state
  const isLoading = allLoading || catLoading || searchLoading;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setSearchParams(searchInput ? { search: searchInput } : {});
    setSelectedCategory("all");
  };

  const selectCategoryHandler = (catId) => {
    setSelectedCategory(catId);
    setActiveSearch("");
    setSearchInput("");
    setSearchParams({});
  };

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  return (
    <div className="container mx-auto px-6 md:px-12 max-w-7xl py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* ==========================================
           1. SIDEBAR - FIXED LEFT FILTERS (3/12 cols)
           ========================================== */}
        <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-32 h-fit">
          <div className="bg-white rounded-3xl p-6 border border-primary-soft/20 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 border-b border-primary-soft/20 pb-4">
              <Filter className="text-primary-dark" size={18} />
              <h2 className="font-serif font-bold text-lg text-charcoal">Filtres de recherche</h2>
            </div>

            {/* Category selection */}
            <div className="space-y-3">
              <h3 className="font-poppins uppercase tracking-wider text-[10px] font-bold text-gray">
                Catégories
              </h3>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => selectCategoryHandler("all")}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary-soft/30 text-primary-dark font-semibold"
                      : "text-charcoal hover:bg-primary-soft/10"
                  }`}
                >
                  Tous les livres
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategoryHandler(cat.id)}
                    className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-primary-soft/30 text-primary-dark font-semibold"
                        : "text-charcoal hover:bg-primary-soft/10"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-poppins uppercase tracking-wider text-[10px] font-bold text-gray">
                  Prix maximum
                </h3>
                <span className="text-xs font-bold text-primary-dark">
                  {maxPrice.toLocaleString()} CFA
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-primary-soft/40 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-gray/50">
                <span>1 000 CFA</span>
                <span>30 000 CFA</span>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="space-y-3">
              <h3 className="font-poppins uppercase tracking-wider text-[10px] font-bold text-gray flex items-center">
                <ArrowUpDown size={12} className="mr-1" /> Trier par
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-ivory text-sm border border-primary-soft/30 rounded-lg p-2.5 outline-none text-charcoal"
              >
                <option value="recent">Nouveautés d'abord</option>
                <option value="price-asc">Prix : croissant</option>
                <option value="price-desc">Prix : décroissant</option>
              </select>
            </div>
          </div>
        </aside>

        {/* ==========================================
           2. MAIN AREA - EDITORIAL CATALOG (9/12 cols)
           ========================================== */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* Main search bar */}
          <form onSubmit={handleSearchSubmit} className="flex bg-white border border-primary-soft/20 rounded-2xl shadow-sm p-2">
            <div className="flex items-center flex-grow pl-3">
              <Search className="text-gray/50 mr-2" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher par titre, auteur, genre..."
                className="w-full bg-transparent text-sm text-charcoal outline-none placeholder-gray/40"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl px-6 py-2.5 transition-colors"
            >
              Rechercher
            </button>
          </form>

          {/* Active Search & Category Status */}
          {(activeSearch || selectedCategory !== "all") && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray uppercase tracking-wider">Résultats pour :</span>
              {activeSearch && (
                <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold border border-primary-soft/20 text-charcoal">
                  Recherche: "{activeSearch}"
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold border border-primary-soft/20 text-primary-dark">
                  Catégorie: {categories.find(c => c.id === selectedCategory)?.name || "Sélectionnée"}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setActiveSearch("");
                  setSearchInput("");
                  setSearchParams({});
                }}
                className="text-xs text-primary font-bold hover:underline ml-2"
              >
                Réinitialiser
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-dark" />
              <p className="font-serif italic text-gray">Exploration des pages en cours...</p>
            </div>
          ) : processedBooks.length > 0 ? (
            
            /* EDITORIAL MAGAZINE LAYOUT - ALTERNATING RHYTHM */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {processedBooks.map((book, idx) => {
                // Alternating structure: every 4th element (idx % 4 === 0) is a large horizontal card
                const isFeatured = idx % 4 === 0;

                if (isFeatured) {
                  return (
                    <div
                      key={book.id}
                      className="col-span-full bg-white rounded-3xl p-6 border border-primary-soft/20 shadow-sm hover:shadow-md transition-shadow group grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    >
                      <Link to={`/catalogue/${book.id}`} className="md:col-span-4 h-64 md:h-80 overflow-hidden rounded-2xl relative block">
                        <img
                          src={getImgUrl(book.image)}
                          alt={book.titre}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 text-charcoal shadow opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye size={16} />
                        </div>
                      </Link>

                      <div className="md:col-span-8 flex flex-col justify-between h-full py-2 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-poppins uppercase tracking-wider text-[10px] font-bold text-primary">
                              À l'affiche
                            </span>
                            <span className="text-xs text-gray/50">
                              Publié par {book.owner_user?.fullname || "Libraire"}
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-2xl md:text-3xl text-charcoal group-hover:text-primary transition-colors">
                            <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
                          </h3>
                          <p className="text-gray text-base font-medium">Par {book.auteur}</p>
                          <p className="text-gray/80 text-sm leading-relaxed line-clamp-3">
                            {book.description || "Découvrez cet ouvrage exceptionnel mis en avant dans notre catalogue. Une pièce de lecture remarquable sélectionnée spécialement pour vous."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-primary-soft/10">
                          <span className="text-2xl font-serif font-bold text-primary-dark">
                            {Number(book.prix_vente).toLocaleString()} CFA
                          </span>
                          <Link
                            to={`/catalogue/${book.id}`}
                            className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                          >
                            Consulter la fiche
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Compact layout card for other books
                return (
                  <div
                    key={book.id}
                    className="col-span-1 bg-white rounded-2xl p-4 border border-primary-soft/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-full"
                  >
                    <div className="space-y-4">
                      <Link to={`/catalogue/${book.id}`} className="h-56 overflow-hidden rounded-xl relative block bg-ivory">
                        <img
                          src={getImgUrl(book.image)}
                          alt={book.titre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 text-charcoal shadow opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye size={14} />
                        </div>
                      </Link>

                      <div className="space-y-1">
                        <span className="font-poppins uppercase tracking-wider text-[9px] font-bold text-gray/50 block">
                          {book.category?.name || "Livre"}
                        </span>
                        <h4 className="font-serif font-bold text-base text-charcoal line-clamp-1 group-hover:text-primary transition-colors">
                          <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
                        </h4>
                        <p className="text-xs text-gray">{book.auteur}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-primary-soft/10">
                      <span className="font-serif font-bold text-primary-dark text-sm md:text-base">
                        {Number(book.prix_vente).toLocaleString()} CFA
                      </span>
                      <Link
                        to={`/catalogue/${book.id}`}
                        className="text-xs font-bold text-primary hover:text-primary-dark"
                      >
                        Voir plus
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center text-gray flex flex-col items-center justify-center border border-primary-soft/20 font-serif">
              <p className="text-lg">Aucun livre ne correspond à vos filtres.</p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setMaxPrice(25000);
                  setSortBy("recent");
                  setActiveSearch("");
                  setSearchInput("");
                  setSearchParams({});
                }}
                className="mt-4 bg-primary text-white text-xs font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-all"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Listing;

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useBooks, useCategories, useSearch } from "../hooks/useQueries";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// Modular Subcomponents
import CatalogueHero from "../components/catalogue/CatalogueHero";
import FilterSidebar from "../components/catalogue/FilterSidebar";
import FilterDrawer from "../components/catalogue/FilterDrawer";
import MagazineLayout from "../components/catalogue/MagazineLayout";
import GridLayout from "../components/catalogue/GridLayout";
import ListLayout from "../components/catalogue/ListLayout";
import InfiniteScrollSentinel from "../components/catalogue/InfiniteScrollSentinel";
import QuickViewModal from "../components/catalogue/QuickViewModal";
import SponsoredBanner from "../components/catalogue/SponsoredBanner";

export default function Listing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get("search") || "";

  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  // Quick View Modal States
  const [selectedBook, setSelectedBook] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = useCallback((book) => {
    setSelectedBook(book);
    setIsQuickViewOpen(true);
  }, []);

  // 1. Layout Mode with Local Storage and Transition States
  const [layoutMode, setLayoutMode] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("begglire_catalogue_view") || "magazine";
    }
    return "magazine";
  });
  const [renderedLayout, setRenderedLayout] = useState(layoutMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLayoutChange = useCallback((newLayout) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setRenderedLayout(newLayout);
      setLayoutMode(newLayout);
      setIsTransitioning(false);
    }, 150);
  }, []);

  // 2. Search & Mobile Drawer States
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync search query with URL search param changes
  useEffect(() => {
    setSearchQuery(searchParamQuery);
  }, [searchParamQuery]);

  // 3. Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedEtats, setSelectedEtats] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [selectedLangues, setSelectedLangues] = useState([]);
  const [stockOnly, setStockOnly] = useState(true); // default true
  const [sortBy, setSortBy] = useState("recent"); // default 'recent'

  // Reset page to 1 whenever filters change
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [selectedCategories, selectedEtats, priceRange, selectedLangues, stockOnly, sortBy, searchQuery]);

  // 4. API Data Fetching
  const { data: allBooksResponse, isLoading: allBooksLoading } = useBooks("tous");
  const { data: searchBooksResponse, isLoading: searchBooksLoading } = useSearch(searchQuery || "");

  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data?.data || categoriesQuery.data || [];

  // Sync category parameter from URL to state
  const lastProcessedCategoryRef = useRef(null);

  useEffect(() => {
    const categoryParam = searchParams.get("category") || searchParams.get("categorie") || "";
    if (categoryParam !== lastProcessedCategoryRef.current && categories.length > 0) {
      lastProcessedCategoryRef.current = categoryParam;
      if (categoryParam === "all" || categoryParam === "") {
        setSelectedCategories([]);
      } else {
        const idsOrSlugs = categoryParam.split(",");
        const resolvedIds = [];
        
        idsOrSlugs.forEach(val => {
          const matchedCat = categories.find(
            c => String(c.id) === val || c.slug === val
          );
          if (matchedCat) {
            resolvedIds.push(matchedCat.id);
          } else {
            const num = Number(val);
            if (!isNaN(num)) {
              resolvedIds.push(num);
            }
          }
        });
        
        setSelectedCategories(resolvedIds);
      }
    }
  }, [searchParams, categories]);

  // Dynamic "Voir plus" link logic
  const { voirPlusUrl, voirPlusLabel } = useMemo(() => {
    if (selectedCategories.length === 0) {
      return {
        voirPlusUrl: "/catalogue",
        voirPlusLabel: "Voir tous les livres"
      };
    }
    
    if (selectedCategories.length === 1) {
      const catId = selectedCategories[0];
      const cat = categories.find(c => c.id === catId);
      const name = cat ? cat.name : "";
      return {
        voirPlusUrl: `/catalogue?category=${catId}`,
        voirPlusLabel: name ? `Voir tous les livres de ${name}` : "Voir tous les livres de ce genre"
      };
    }
    
    return {
      voirPlusUrl: `/catalogue?category=${selectedCategories.join(",")}`,
      voirPlusLabel: "Voir tous les livres de ces genres"
    };
  }, [selectedCategories, categories]);

  // Extract primary books list (empty query -> all books, active query -> searched books)
  const books = useMemo(() => {
    const list = searchQuery
      ? (searchBooksResponse?.data?.data || searchBooksResponse?.data || searchBooksResponse)
      : (allBooksResponse?.data?.data || allBooksResponse?.data || allBooksResponse);
    return Array.isArray(list) ? list : [];
  }, [searchQuery, allBooksResponse, searchBooksResponse]);

  // Calculate dynamic book counts per category BEFORE applying category filters
  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach(c => { counts[c.id] = 0; });
    books.forEach(b => {
      const catId = b.category_id || b.category?.id;
      if (catId) {
        counts[catId] = (counts[catId] || 0) + 1;
      }
    });
    return counts;
  }, [books, categories]);

  // 5. Apply In-Memory Filters & Sort
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter(b => {
        const catId = b.category_id || b.category?.id;
        return selectedCategories.includes(catId);
      });
    }

    // Filter by book states
    if (selectedEtats.length > 0) {
      result = result.filter(b => {
        const bookEtat = (b.etat || b.etat_livre || "").toLowerCase().replace("_", "");
        return selectedEtats.some(filterEtat => {
          const f = filterEtat.toLowerCase().replace("_", "");
          // Match "Neuf" exactly, or group all others under "Occasion"
          if (f === "neuf") return bookEtat === "neuf";
          return bookEtat !== "neuf";
        });
      });
    }

    // Filter by price range
    result = result.filter(b => {
      const price = Number(b.prix_vente !== undefined ? b.prix_vente : (b.prix !== undefined ? b.prix : 0));
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Filter by language
    if (selectedLangues.length > 0) {
      result = result.filter(b => {
        const lang = (b.langue || "Français").toLowerCase();
        return selectedLangues.some(l => l.toLowerCase() === lang);
      });
    }

    // Filter by stock
    if (stockOnly) {
      result = result.filter(b => {
        const stock = Number(b.stock !== undefined ? b.stock : (b.quantite !== undefined ? b.quantite : 1));
        return stock > 0;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => b.id - a.id);
        break;
      case "prix_asc":
        result.sort((a, b) => {
          const priceA = Number(a.prix_vente !== undefined ? a.prix_vente : (a.prix !== undefined ? a.prix : 0));
          const priceB = Number(b.prix_vente !== undefined ? b.prix_vente : (b.prix !== undefined ? b.prix : 0));
          return priceA - priceB;
        });
        break;
      case "prix_desc":
        result.sort((a, b) => {
          const priceA = Number(a.prix_vente !== undefined ? a.prix_vente : (a.prix !== undefined ? a.prix : 0));
          const priceB = Number(b.prix_vente !== undefined ? b.prix_vente : (b.prix !== undefined ? b.prix : 0));
          return priceB - priceA;
        });
        break;
      case "popularite":
        result.sort((a, b) => {
          const viewsA = Number(a.views_count || a.nb_vues || 0);
          const viewsB = Number(b.views_count || b.nb_vues || 0);
          return viewsB - viewsA;
        });
        break;
      default:
        break;
    }

    return result;
  }, [books, selectedCategories, selectedEtats, priceRange, selectedLangues, stockOnly, sortBy]);

  // Sponsored Book and remaining list
  const sponsoredBook = useMemo(() => {
    return filteredBooks.length > 0 ? filteredBooks[0] : null;
  }, [filteredBooks]);

  const remainingBooks = useMemo(() => {
    return filteredBooks.slice(1);
  }, [filteredBooks]);

  // 6. Pagination & Infinite Scroll Logic
  const itemsPerPage = 12;
  const paginatedBooks = useMemo(() => {
    return remainingBooks.slice(0, page * itemsPerPage);
  }, [remainingBooks, page]);

  const hasMore = paginatedBooks.length < remainingBooks.length;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    // Simulate latency (800ms) to display premium skeletons
    setTimeout(() => {
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 800);
  }, [isLoadingMore, hasMore]);

  // IntersectionObserver implementation
  const observerRef = useRef();
  const sentinelRef = useCallback((node) => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    }, { threshold: 0.1 });
    if (node) observerRef.current.observe(node);
  }, [hasMore, isLoadingMore, loadMore]);

  // Reset Filters logic
  const handleResetAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedEtats([]);
    setPriceRange({ min: 0, max: 50000 });
    setSelectedLangues([]);
    setStockOnly(true);
    setSortBy("recent");
    setSearchQuery("");
    setSearchParams({});
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategories.length > 0 ||
      selectedEtats.length > 0 ||
      priceRange.min > 0 ||
      priceRange.max < 50000 ||
      selectedLangues.length > 0 ||
      !stockOnly ||
      sortBy !== "recent" ||
      searchQuery !== ""
    );
  }, [selectedCategories, selectedEtats, priceRange, selectedLangues, stockOnly, sortBy, searchQuery]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedEtats.length > 0) count++;
    if (priceRange.min > 0 || priceRange.max < 50000) count++;
    if (selectedLangues.length > 0) count++;
    if (!stockOnly) count++;
    if (sortBy !== "recent") count++;
    if (searchQuery !== "") count++;
    return count;
  }, [selectedCategories, selectedEtats, priceRange, selectedLangues, stockOnly, sortBy, searchQuery]);

  // Global Cart Addition Dispatcher
  const handleAddToCart = useCallback((book) => {
    const price = Number(book.prix_vente !== undefined ? book.prix_vente : (book.prix !== undefined ? book.prix : 0));
    addItem({ ...book, prix_vente: price }, "book");

    // Dispatch event to Layout.jsx
    window.dispatchEvent(new CustomEvent("show-cart-toast", {
      detail: {
        titre: book.titre,
        cover: book.image || book.cover || book.image_link,
        quantite: 1
      }
    }));
  }, [addItem]);

  const isPageLoading = allBooksLoading || (searchQuery && searchBooksLoading);

  return (
    <div className="w-full min-h-screen bg-ivory pb-12">
      {/* Sponsored Banner - above search controls and filters */}
      {sponsoredBook && (
        <div className="container mx-auto px-6 md:px-12 max-w-7xl pt-8">
          <SponsoredBanner book={sponsoredBook} onAddToCart={handleAddToCart} />
        </div>
      )}

      {/* 1. Sticky search controls bar */}
      <CatalogueHero
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setSearchParams(val ? { search: val } : {});
        }}
        resultsCount={filteredBooks.length}
        activeLayout={renderedLayout}
        setActiveLayout={handleLayoutChange}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* 2. Main Content Grid (Sidebar + Listings) */}
      <div className="container mx-auto px-6 md:px-12 max-w-7xl pt-8">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
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
            onResetAll={handleResetAllFilters}
            hasActiveFilters={hasActiveFilters}
            resultsCount={filteredBooks.length}
            categoryCounts={categoryCounts}
          />

          {/* Mobile Filter Drawer */}
          <FilterDrawer
            isOpen={isMobileFiltersOpen}
            onClose={() => setIsMobileFiltersOpen(false)}
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
            onResetAll={handleResetAllFilters}
            hasActiveFilters={hasActiveFilters}
            resultsCount={filteredBooks.length}
            categoryCounts={categoryCounts}
          />

          {/* Catalog Listings (flex-grow w-full) */}
          <div className="flex-grow w-full space-y-6 min-h-[50vh]">
            
            {/* Dynamic "Voir plus" link */}
            <div className="flex justify-end items-center">
              <Link
                to={voirPlusUrl}
                className="text-[#1c380e] hover:text-[#2c4e1d] font-poppins font-bold text-[10px] md:text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all select-none hover:underline group"
              >
                <span>{voirPlusLabel}</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {isPageLoading ? (
              // Initial Loading Skeletons
              <div className="w-full pt-10">
                <InfiniteScrollSentinel
                  isLoadingMore={true}
                  hasMore={false}
                  activeLayout={renderedLayout}
                />
              </div>
            ) : filteredBooks.length > 0 ? (
              // Active listings layout with fade transition
              <div className={`transition-opacity duration-150 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
                {renderedLayout === "magazine" && (
                  <MagazineLayout
                    books={paginatedBooks}
                    onQuickView={handleQuickView}
                    onAddToCart={handleAddToCart}
                  />
                )}
                {renderedLayout === "grid" && (
                  <GridLayout
                    books={paginatedBooks}
                    onAddToCart={handleAddToCart}
                    isAuthenticated={isAuthenticated}
                    onQuickView={handleQuickView}
                  />
                )}
                {renderedLayout === "list" && (
                  <ListLayout
                    books={paginatedBooks}
                    onAddToCart={handleAddToCart}
                    isAuthenticated={isAuthenticated}
                  />
                )}

                {/* Infinite scroll sentinel */}
                <InfiniteScrollSentinel
                  sentinelRef={sentinelRef}
                  hasMore={hasMore}
                  isLoadingMore={isLoadingMore}
                  activeLayout={renderedLayout}
                />
              </div>
            ) : (
              // Empty Result State
              <div className="w-full pt-16 flex items-center justify-center">
                {renderEmptyState(handleResetAllFilters, handleLayoutChange)}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Centralized Quick View Modal */}
      <QuickViewModal
        book={selectedBook}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

// ==========================================================================
// EMPTY STATE LAYOUT
// ==========================================================================
function renderEmptyState(onReset, onLayoutChange) {
  return (
    <div className="bg-white rounded-3xl p-12 md:p-16 text-center text-gray flex flex-col items-center justify-center border border-primary-soft/10 shadow-sm max-w-lg mx-auto space-y-6 select-none animate-fade-in">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 text-[#1c380e]/40">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
      <div className="space-y-2">
        <h3 className="font-serif font-bold text-xl text-charcoal">Aucun livre ne correspond à vos filtres</h3>
        <p className="text-xs text-gray/70 leading-relaxed max-w-xs">
          Essayez d'élargir votre recherche ou de modifier vos critères de filtrage.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
        <button
          onClick={onReset}
          className="bg-transparent border border-[#1c380e] text-[#1c380e] hover:bg-[#1c380e] hover:text-white px-6 py-2.5 rounded-xl text-xs font-poppins font-bold uppercase tracking-wider transition-all duration-300 active:scale-95"
        >
          Réinitialiser les filtres
        </button>
        <button
          onClick={() => {
            onReset();
            onLayoutChange("magazine");
          }}
          className="bg-[#1c380e] hover:bg-[#2c4e1d] text-white px-6 py-2.5 rounded-xl text-xs font-poppins font-bold uppercase tracking-wider transition-all duration-300 shadow active:scale-95"
        >
          Voir tous les livres
        </button>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShoppingBag, Eye, X, Filter, Sparkles, Check } from "lucide-react";
import { useSupplies, useSupplyCategories } from "../hooks/useQueries";
import { useCart } from "../context/CartContext";
import InfiniteScrollSentinel from "../components/catalogue/InfiniteScrollSentinel";

const Fournitures = () => {
  const { addItem } = useCart();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupply, setSelectedSupply] = useState(null); // Supply object for detail modal
  const [addedItemFeedback, setAddedItemFeedback] = useState(null); // ID of item added to cart

  // Queries
  const { data: suppliesResponse, isLoading: suppliesLoading } = useSupplies();
  const { data: categoriesResponse } = useSupplyCategories();

  const supplies = useMemo(() => {
    // Safely extract supplies list (handles nested paginated data structures)
    const list = suppliesResponse?.fournitures?.data 
      || suppliesResponse?.data?.fournitures?.data 
      || suppliesResponse?.fournitures 
      || suppliesResponse?.data 
      || [];
    return Array.isArray(list) ? list : [];
  }, [suppliesResponse]);

  const categories = categoriesResponse?.data || categoriesResponse || [];

  // Filter supplies in-memory
  const filteredSupplies = useMemo(() => {
    if (selectedCategory === "all") return supplies;
    return supplies.filter((s) => {
      // Handle category ID matching or string matching depending on API response
      return s.category_id == selectedCategory || s.category == selectedCategory;
    });
  }, [supplies, selectedCategory]);

  // Infinite Scroll & Pagination Logic
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const paginatedSupplies = useMemo(() => {
    return filteredSupplies.slice(0, page * itemsPerPage);
  }, [filteredSupplies, page]);

  const hasMore = paginatedSupplies.length < filteredSupplies.length;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    // Simulate premium skeletons loading latency (800ms)
    setTimeout(() => {
      setPage((prev) => prev + 1);
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

  const handleAddToCart = (supply) => {
    addItem(supply, "supply");
    setAddedItemFeedback(supply.id);
    setTimeout(() => setAddedItemFeedback(null), 2000);
  };

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  return (
    <div className="container mx-auto px-6 md:px-12 max-w-7xl py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* ==========================================
           1. SIDEBAR - CATEGORIES (3/12 cols)
           ========================================== */}
        <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-32 h-fit">
          <div className="bg-white rounded-3xl p-6 border border-primary-soft/20 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 border-b border-primary-soft/20 pb-4">
              <Filter className="text-accent-gold" size={18} />
              <h2 className="font-serif font-bold text-lg text-charcoal">Rayons fournitures</h2>
            </div>

            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                  selectedCategory === "all"
                    ? "bg-accent-gold/20 text-charcoal font-semibold"
                    : "text-charcoal hover:bg-primary-soft/10"
                }`}
              >
                Toutes les fournitures
              </button>
              {categories.map((cat, idx) => {
                // Support category object keys (could be named 'nom' or 'name', and ID)
                const catName = cat.name || cat.nom || cat;
                const catId = cat.id || cat;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(catId)}
                    className={`text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                      selectedCategory === catId
                        ? "bg-accent-gold/20 text-charcoal font-semibold"
                        : "text-charcoal hover:bg-primary-soft/10"
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ==========================================
           2. MAIN AREA - PRODUCTS CATALOG (9/12 cols)
           ========================================== */}
        <main className="lg:col-span-9 space-y-8">
          <div className="space-y-2 border-b border-primary-soft/10 pb-4">
            <h1 className="font-serif font-bold text-2xl md:text-3xl text-charcoal">
              Papeterie & Fournitures Scolaires
            </h1>
            <p className="text-xs text-gray">Préparez vos rentrées scolaires ou vos espaces de travail</p>
          </div>

          {suppliesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-gold" />
              <p className="font-serif italic text-gray">Ouverture des cartons de papeterie...</p>
            </div>
          ) : filteredSupplies.length > 0 ? (
            
            /* EDITORIAL LAYOUT FOR PRODUCTS */
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedSupplies.map((supply) => (
                  <div
                    key={supply.id}
                    className="bg-white rounded-2xl p-4 border border-primary-soft/10 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-full"
                  >
                    <div className="space-y-4">
                      {/* Cover Preview Area */}
                      <div className="h-44 overflow-hidden rounded-xl relative bg-ivory flex items-center justify-center">
                        <img
                          src={getImgUrl(supply.image || supply.image_url)}
                          alt={supply.nom || supply.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-103 transition-transform duration-500"
                        />
                        <button
                          onClick={() => setSelectedSupply(supply)}
                          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 text-charcoal shadow opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Preview"
                        >
                          <Eye size={12} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-poppins font-bold text-gray/50 tracking-wider">
                          {supply.marque || supply.brand || "Bëgg Lire"}
                        </span>
                        <h3 className="font-serif font-bold text-base text-charcoal line-clamp-2">
                          {supply.nom || supply.name || "Fourniture"}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-primary-soft/10">
                      <span className="font-serif font-bold text-primary-dark text-sm md:text-base">
                        {Number(supply.prix || supply.price || 0).toLocaleString()} CFA
                      </span>
                      
                      <button
                        onClick={() => handleAddToCart(supply)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                          addedItemFeedback === supply.id
                            ? "bg-primary text-white"
                            : "bg-accent-gold hover:bg-accent-gold/90 text-charcoal shadow-sm"
                        }`}
                      >
                        {addedItemFeedback === supply.id ? (
                          <>
                            <Check size={12} />
                            <span>Ajouté</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={12} />
                            <span>Prendre</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              <InfiniteScrollSentinel
                sentinelRef={sentinelRef}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                activeLayout="grid"
                endMessage="— Vous avez vu toutes les fournitures disponibles —"
              />
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center text-gray border border-primary-soft/20 font-serif">
              <p>Aucun article disponible dans ce rayon.</p>
            </div>
          )}
        </main>
      </div>

      {/* ==========================================
         3. PRODUCT DETAIL MODAL
         ========================================== */}
      {selectedSupply && (
        <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-primary-soft/20 shadow-2xl p-6 md:p-8 relative">
            <button
              onClick={() => setSelectedSupply(null)}
              className="absolute top-4 right-4 p-1.5 text-gray hover:text-charcoal transition-colors rounded-full"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              {/* Left Image */}
              <div className="bg-ivory rounded-2xl p-4 border border-primary-soft/10 flex items-center justify-center h-48 sm:h-60">
                <img
                  src={getImgUrl(selectedSupply.image || selectedSupply.image_url)}
                  alt={selectedSupply.nom || selectedSupply.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Right Details */}
              <div className="space-y-4">
                <div>
                  <span className="font-poppins uppercase tracking-wider text-[9px] font-bold text-accent-gold bg-primary-dark/10 px-2 py-0.5 rounded">
                    {selectedSupply.marque || selectedSupply.brand || "Rayon Fournitures"}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-charcoal mt-2">
                    {selectedSupply.nom || selectedSupply.name}
                  </h3>
                </div>

                <div className="text-xl font-serif font-bold text-primary-dark">
                  {Number(selectedSupply.prix || selectedSupply.price || 0).toLocaleString()} CFA
                </div>

                <p className="text-xs text-gray/80 leading-relaxed font-light">
                  {selectedSupply.description || "Article de papeterie sélectionné par Bëgg Lire pour sa qualité d'usage."}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedSupply);
                      setSelectedSupply(null);
                    }}
                    className="w-full bg-accent-gold hover:bg-accent-gold/90 text-charcoal font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow"
                  >
                    <ShoppingBag size={14} />
                    <span>Ajouter au panier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fournitures;

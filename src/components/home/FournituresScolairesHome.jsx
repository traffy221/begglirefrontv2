import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, Sparkles, Check } from "lucide-react";
import { useSupplies } from "../../hooks/useQueries";
import { useCart } from "../../context/CartContext";
import { IMAGE_URL } from "../../api/client";

const FournituresScolairesHome = () => {
  const { addItem } = useCart();
  const [addedItemFeedback, setAddedItemFeedback] = useState(null);

  // Queries
  const { data: suppliesResponse, isLoading } = useSupplies();

  const supplies = useMemo(() => {
    const list = suppliesResponse?.fournitures?.data 
      || suppliesResponse?.data?.fournitures?.data 
      || suppliesResponse?.fournitures 
      || suppliesResponse?.data 
      || [];
    return Array.isArray(list) ? list.slice(0, 4) : [];
  }, [suppliesResponse]);

  const handleAddToCart = (supply) => {
    addItem(supply, "supply");
    setAddedItemFeedback(supply.id);
    setTimeout(() => setAddedItemFeedback(null), 2000);
  };

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  if (isLoading || supplies.length === 0) return null;

  return (
    <section className="py-20 px-6 md:px-12 bg-white/50 border-t border-primary-soft/10">
      <div className="container mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <span className="font-poppins uppercase tracking-wider text-[10px] font-bold text-primary flex items-center space-x-1.5">
              <Sparkles size={12} className="text-accent-gold fill-accent-gold" />
              <span>Tout pour la rentrée</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
              Papeterie & Fournitures Scolaires
            </h2>
          </div>
          <Link
            to="/fournitures"
            className="mt-4 md:mt-0 font-poppins text-sm font-semibold text-primary hover:text-primary-dark flex items-center space-x-1 group"
          >
            <span>Voir toutes les fournitures</span>
            <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {supplies.map((supply) => (
            <div
              key={supply.id}
              className="bg-white rounded-2xl p-4 border border-primary-soft/10 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                {/* Cover Preview Area */}
                <div className="h-44 overflow-hidden rounded-xl bg-ivory flex items-center justify-center relative">
                  <img
                    src={getImgUrl(supply.image || supply.image_url)}
                    alt={supply.nom || supply.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-103 transition-transform duration-500"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-poppins font-bold text-gray/50 tracking-wider">
                    {supply.marque || supply.brand || "Bëgg Lire"}
                  </span>
                  <h3 className="font-serif font-bold text-base text-charcoal line-clamp-2 min-h-[48px]">
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

      </div>
    </section>
  );
};

export default FournituresScolairesHome;

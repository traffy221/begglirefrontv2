import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, ShoppingCart, Heart, Star } from "lucide-react";
import apiClient from "../../api/client";

export default function BookCardGrid({
  book,
  onQuickView,
  onAddToCart,
  isAuthenticated
}) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [heartPulsing, setHeartPulsing] = useState(false);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const coverUrl = getImgUrl(book.image || book.cover || book.image_link);
  const price = Number(book.prix_vente !== undefined ? book.prix_vente : (book.prix !== undefined ? book.prix : 0));
  const categoryName = book.category?.name || book.categorie || "Roman";
  const author = book.auteur || "Auteur inconnu";

  // Check wishlist state on mount
  useEffect(() => {
    if (book.id && isAuthenticated) {
      apiClient
        .post("/wishlist/check", { book_id: Number(book.id) })
        .then((res) => {
          if (res.data && res.data.success) {
            setIsInWishlist(res.data.is_in_wishlist ?? res.data.data ?? false);
          }
        })
        .catch(() => {});
    }
  }, [book.id, isAuthenticated]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || wishlistLoading) return;
    setWishlistLoading(true);
    setHeartPulsing(true);
    setTimeout(() => setHeartPulsing(false), 500);

    try {
      if (isInWishlist) {
        await apiClient.post("/wishlist/remove", { book_id: Number(book.id) });
        setIsInWishlist(false);
      } else {
        await apiClient.post("/wishlist/add", { book_id: Number(book.id) });
        setIsInWishlist(true);
      }
      // Dispatch a custom event to notify other components (e.g. Header wishlist counter)
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
    } catch (error) {
      console.error("Failed to update wishlist", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const getConditionBadge = (etat) => {
    if (!etat || etat.toLowerCase() === "neuf") return null;
    let label = "Occasion";
    let colorClass = "bg-blue-500/90 text-white";

    if (etat.toLowerCase() === "tres_bon" || etat === "très bon") {
      label = "Très bon";
      colorClass = "bg-blue-500/95 text-white";
    } else if (etat.toLowerCase() === "bon") {
      label = "Bon état";
      colorClass = "bg-amber-500/95 text-white";
    } else if (etat.toLowerCase() === "acceptable") {
      label = "Acceptable";
      colorClass = "bg-orange-500/95 text-white";
    }

    return (
      <span className={`absolute top-3 right-3 text-[9px] font-poppins font-bold uppercase tracking-wider px-2 py-1 rounded shadow-md z-20 ${colorClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="group bg-white rounded-2xl p-4 border border-primary-soft/10 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden select-none">
      
      {/* 1. Cover area with hover action overlays */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#1c380e]/5 border border-primary-soft/5 mb-4 z-10">
        
        {/* Book image with zoom */}
        <img
          src={coverUrl}
          alt={book.titre}
          className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-108"
        />

        {/* Category Pill (top-left) */}
        <span className="absolute top-3 left-3 text-[9px] font-poppins font-bold uppercase tracking-widest bg-accent-gold text-charcoal px-2 py-1 rounded shadow-md z-20">
          {categoryName}
        </span>

        {/* Used condition badge (top-right) */}
        {getConditionBadge(book.etat || book.etat_livre)}

        {/* Dark overlay & Action icons (fade in on hover) */}
        <div className="absolute inset-0 bg-[#1c380e]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 z-30">
          
          {/* Quick View Button */}
          <button
            onClick={() => onQuickView(book)}
            className="p-3 bg-white hover:bg-accent-gold hover:text-charcoal text-[#1c380e] rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            title="Aperçu rapide"
          >
            <Eye size={16} />
          </button>

          {/* Add to Basket Button */}
          <button
            onClick={() => onAddToCart(book)}
            className="p-3 bg-white hover:bg-accent-gold hover:text-charcoal text-[#1c380e] rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
            title="Ajouter au panier"
          >
            <ShoppingCart size={16} />
          </button>

          {/* Wishlist Button */}
          {isAuthenticated && (
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`p-3 bg-white hover:bg-rose-500 hover:text-white text-rose-500 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100 ${
                heartPulsing ? "animate-heart-pulse" : ""
              }`}
              title={isInWishlist ? "Retirer de la liste" : "Ajouter aux favoris"}
            >
              <Heart size={16} className={isInWishlist ? "fill-rose-500 text-rose-500" : ""} />
            </button>
          )}

        </div>

      </div>

      {/* 2. Metadata details under cover */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Title (2 lines max, ellipsis) */}
          <h4 className="font-sans font-bold text-sm text-charcoal leading-snug line-clamp-2 group-hover:text-[#1c380e] transition-colors">
            <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
          </h4>
          
          {/* Author */}
          <p className="text-xs text-amber-600 font-medium font-poppins line-clamp-1">{author}</p>
        </div>

        {/* Price & Star Rating row */}
        <div className="flex items-center justify-between pt-2.5 border-t border-primary-soft/10 select-none">
          <span className="font-poppins font-bold text-sm text-charcoal">
            {price.toLocaleString()} FCFA
          </span>
          <div className="flex space-x-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={10}
                className="fill-accent-gold text-accent-gold"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Slide-up Add to Cart Button (on hover) */}
      <div className="absolute left-0 right-0 bottom-0 bg-[#1c380e] text-white py-3.5 text-center text-xs font-poppins font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.15)] hover:bg-[#2c4e1d]"
        onClick={() => onAddToCart(book)}
      >
        <ShoppingCart size={14} />
        <span>Ajouter au panier</span>
      </div>

      {/* CSS Pulse */}
      <style>{`
        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-heart-pulse {
          animation: heartPulse 0.45s ease-out forwards;
        }
      `}</style>

    </div>
  );
}

import { useState, useEffect } from "react";
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import apiClient from "../../api/client";
import ShareDropdown from "./ShareDropdown";

export default function BookActions({ book, addItem, isAuthenticated, refreshWishlistCount }) {
  const [qty, setQty] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [heartPulsing, setHeartPulsing] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const stock = Number(book.stock !== undefined ? book.stock : (book.quantite !== undefined ? book.quantite : 1));
  const price = Number(book.prix_vente !== undefined ? book.prix_vente : (book.prix !== undefined ? book.prix : 0));

  // Check if book is already in wishlist
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

  // Wishlist toggle handler
  const handleWishlistToggle = async () => {
    if (!isAuthenticated || wishlistLoading) return;
    setWishlistLoading(true);
    setHeartPulsing(true);
    
    // Heart pulse animation resets after 500ms
    setTimeout(() => setHeartPulsing(false), 500);

    try {
      if (isInWishlist) {
        await apiClient.post("/wishlist/remove", { book_id: Number(book.id) });
        setIsInWishlist(false);
      } else {
        await apiClient.post("/wishlist/add", { book_id: Number(book.id) });
        setIsInWishlist(true);
      }
      if (refreshWishlistCount) {
        refreshWishlistCount();
      }
    } catch (error) {
      console.error("Failed to update wishlist", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Cart addition handler
  const handleAddToCart = () => {
    if (stock <= 0 || isAddingToCart) return;
    setIsAddingToCart(true);

    // Button click scale animation
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 150);

    // Add item to Cart Context
    if (addItem) {
      // Pass the quantity selected
      addItem({ ...book, prix_vente: price }, "book", qty);
    }

    // Dispatch custom event to Layout.jsx
    const event = new CustomEvent("show-cart-toast", {
      detail: {
        titre: book.titre,
        cover: book.image || book.cover || book.image_link,
        quantite: qty
      }
    });
    window.dispatchEvent(event);
  };

  const incrementQty = () => {
    if (qty < stock) setQty(prev => prev + 1);
  };

  const decrementQty = () => {
    if (qty > 1) setQty(prev => prev - 1);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Pricing and Stock indicators */}
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        {/* Pricing */}
        <div className="text-3xl md:text-4xl font-serif font-bold text-accent-gold select-none">
          {price.toLocaleString()} FCFA
        </div>

        {/* Stock Badge */}
        <div className="select-none">
          {stock > 1 ? (
            <span className="text-[11px] font-poppins font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ✓ En stock ({stock} disponibles)
            </span>
          ) : stock === 1 ? (
            <span className="text-[11px] font-poppins font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ⚡ Dernier exemplaire
            </span>
          ) : (
            <span className="text-[11px] font-poppins font-semibold px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              ✗ Rupture de stock
            </span>
          )}
        </div>
      </div>

      {/* 2. Quantity selector (shown only if stock > 1) */}
      {stock > 1 && (
        <div className="flex items-center space-x-3 select-none">
          <span className="text-xs text-white/75 font-poppins font-bold uppercase tracking-wider">Quantité :</span>
          <div className="flex bg-white/10 border border-white/20 rounded-xl p-1 items-center">
            <button
              type="button"
              onClick={decrementQty}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white font-bold transition-all"
            >
              −
            </button>
            <input
              type="number"
              value={qty}
              readOnly
              className="w-10 bg-transparent text-center text-white text-xs font-bold outline-none"
            />
            <button
              type="button"
              onClick={incrementQty}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* 3. Action Buttons Row */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* Add to Basket */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className={`flex-1 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider font-poppins shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 ${
            stock > 0
              ? `bg-accent-gold text-charcoal hover:bg-amber-500 hover:scale-[1.02] ${isAddingToCart ? "scale-[0.95]" : ""}`
              : "bg-gray/50 text-white/50 cursor-not-allowed"
          }`}
        >
          <ShoppingBag size={14} />
          <span>Ajouter au panier</span>
        </button>

        {/* Add to Wishlist */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`border font-semibold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider font-poppins transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 ${
              isInWishlist
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "border-white/25 hover:bg-white/5 text-white"
            }`}
          >
            <Heart
              size={14}
              className={`transition-transform duration-300 ${
                isInWishlist ? "fill-rose-500 text-rose-500" : "text-white"
              } ${heartPulsing ? "animate-heart-pulse" : ""}`}
            />
            <span>{isInWishlist ? "Retirer" : "Favoris"}</span>
          </button>
        )}

        {/* Share Dropdown Button */}
        <ShareDropdown />
      </div>

      {/* 4. Trust Signals Strip */}
      <div className="border-t border-white/10 pt-4 flex flex-wrap gap-x-6 gap-y-3 justify-start items-center text-[10px] text-white/70 font-poppins">
        <div className="flex items-center space-x-1.5">
          <Truck size={12} className="text-accent-gold" />
          <span>Livraison partout au Sénégal</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <ShieldCheck size={12} className="text-accent-gold" />
          <span>Paiement sécurisé Wave & Orange Money</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <RotateCcw size={12} className="text-accent-gold" />
          <span>Retour sous 7 jours</span>
        </div>
      </div>

      {/* Injected animations */}
      <style>{`
        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        .animate-heart-pulse {
          animation: heartPulse 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

    </div>
  );
}

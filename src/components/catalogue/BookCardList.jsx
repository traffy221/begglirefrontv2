import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import apiClient from "../../api/client";

export default function BookCardList({
  book,
  onAddToCart,
  isAuthenticated
}) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const coverUrl = getImgUrl(book.image || book.cover || book.image_link);
  const price = Number(book.prix_vente !== undefined ? book.prix_vente : (book.prix !== undefined ? book.prix : 0));
  const categoryName = book.category?.name || book.categorie || "Roman";
  const author = book.auteur || "Auteur inconnu";
  const publisher = book.editeur || "Non spécifié";
  const desc = book.description || "Aucun résumé disponible pour cet ouvrage.";
  const stock = Number(book.stock !== undefined ? book.stock : (book.quantite !== undefined ? book.quantite : 1));

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

    try {
      if (isInWishlist) {
        await apiClient.post("/wishlist/remove", { book_id: Number(book.id) });
        setIsInWishlist(false);
      } else {
        await apiClient.post("/wishlist/add", { book_id: Number(book.id) });
        setIsInWishlist(true);
      }
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
    } catch (error) {
      console.error("Failed to update wishlist", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const getEtatLabel = (etat) => {
    if (!etat) return "Bon état";
    switch (etat.toLowerCase()) {
      case "neuf": return "🟢 Neuf";
      case "tres_bon":
      case "très bon": return "🔵 Très bon";
      case "bon": return "🟡 Bon";
      case "acceptable": return "Acceptable";
      default: return etat;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start p-4 hover:bg-[#1c380e]/5 border-b border-primary-soft/10 transition-colors duration-200 gap-4 select-none">
      
      {/* 1. Cover Left (80x110px) */}
      <Link
        to={`/catalogue/${book.id}`}
        className="w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-[#1c380e]/5 border border-primary-soft/5 shadow flex items-center justify-center"
      >
        <img src={coverUrl} alt={book.titre} className="w-full h-full object-cover" />
      </Link>

      {/* 2. Metadata Center (flex-1) */}
      <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
        {/* Row 1: Title + Category badge */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h4 className="font-sans font-bold text-sm text-charcoal hover:text-[#1c380e] transition-colors truncate">
            <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
          </h4>
          <span className="self-center sm:self-start text-[8px] font-poppins font-bold uppercase tracking-wider bg-[#1c380e]/10 text-[#1c380e] px-2 py-0.5 rounded shrink-0">
            {categoryName}
          </span>
        </div>

        {/* Row 2: Author + Publisher */}
        <p className="text-[10px] text-gray font-medium font-poppins">
          <span>par </span>
          <span className="text-amber-600 font-semibold">{author}</span>
          {publisher && (
            <span className="text-gray/50"> • Éditeur : {publisher}</span>
          )}
        </p>

        {/* Row 3: Short summary */}
        <p className="text-[11px] text-gray/80 leading-relaxed truncate max-w-xl font-light">
          {desc}
        </p>

        {/* Row 4: Specifications badges */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 select-none">
          {/* State Badge */}
          <span className="text-[9px] font-poppins font-semibold bg-white border border-primary-soft/15 px-2.5 py-0.5 rounded-full text-charcoal shadow-sm">
            {getEtatLabel(book.etat || book.etat_livre)}
          </span>

          {/* Language Badge */}
          {book.langue && (
            <span className="text-[9px] font-poppins font-semibold bg-white border border-primary-soft/15 px-2.5 py-0.5 rounded-full text-charcoal/80 uppercase shadow-sm">
              🌍 {book.langue}
            </span>
          )}

          {/* Availability Badge */}
          {stock > 0 ? (
            <span className="text-[9px] font-poppins font-semibold bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-0.5 rounded-full text-emerald-600 shadow-sm">
              En stock
            </span>
          ) : (
            <span className="text-[9px] font-poppins font-semibold bg-rose-500/10 border border-rose-500/10 px-2.5 py-0.5 rounded-full text-rose-600 shadow-sm">
              Rupture
            </span>
          )}
        </div>
      </div>

      {/* 3. Pricing & Actions Right */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-2 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-primary-soft/5">
        {/* Pricing */}
        <div className="text-lg font-poppins font-bold text-charcoal">
          {price.toLocaleString()} FCFA
        </div>

        {/* Actions row */}
        <div className="flex items-center space-x-2">
          {/* Wishlist Heart (if connected) */}
          {isAuthenticated && (
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`p-2 border rounded-xl shadow-sm transition-all duration-300 ${
                isInWishlist
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                  : "border-primary-soft/20 text-gray hover:bg-[#1c380e]/5 hover:text-[#1c380e]"
              }`}
              title={isInWishlist ? "Retirer de la liste" : "Ajouter aux favoris"}
            >
              <Heart size={14} className={isInWishlist ? "fill-rose-500 text-rose-500" : ""} />
            </button>
          )}

          {/* Add to Basket */}
          <button
            onClick={() => onAddToCart(book)}
            disabled={stock <= 0}
            className="bg-[#1c380e] hover:bg-[#2c4e1d] disabled:opacity-50 text-white font-poppins font-bold uppercase tracking-wider py-2 px-4 rounded-xl text-[10px] shadow hover:shadow-lg transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <ShoppingBag size={12} />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

    </div>
  );
}

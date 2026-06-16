import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Eye, Heart, ShoppingBag, ArrowLeft, ArrowRight, Share2, Check } from "lucide-react";
import { useBookDetail, useRelatedBooks } from "../hooks/useQueries";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import apiClient, { IMAGE_URL } from "../api/client";

const BookDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, refreshWishlistCount } = useAuth();
  const { addItem } = useCart();

  // Local UI States
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addedToCartFeedback, setAddedToCartFeedback] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Queries
  const { data: bookResponse, isLoading: bookLoading, error: bookError } = useBookDetail(id);
  const { data: relatedResponse } = useRelatedBooks(id);

  const book = bookResponse?.data || bookResponse;
  const relatedBooks = relatedResponse?.data?.data || relatedResponse?.data || relatedResponse || [];

  // 1. Register view on mount (de-duplicated via X-Session-Token)
  useEffect(() => {
    if (id) {
      apiClient.post(`/livre-en-vente/${id}/vue`).catch(() => {
        // Quietly fail to not disrupt user experience
      });
    }
  }, [id]);

  // 2. Check if book is already in wishlist (if authenticated)
  useEffect(() => {
    if (id && isAuthenticated) {
      apiClient
        .post("/wishlist/check", { book_id: Number(id) })
        .then((res) => {
          if (res.data && res.data.success) {
            // Support direct boolean or nested parameter
            setIsInWishlist(res.data.is_in_wishlist ?? res.data.data ?? false);
          }
        })
        .catch(() => {});
    }
  }, [id, isAuthenticated]);

  // 3. Toggle Wishlist mutation
  const handleWishlistToggle = async () => {
    if (!isAuthenticated || wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await apiClient.post("/wishlist/remove", { book_id: Number(id) });
        setIsInWishlist(false);
      } else {
        await apiClient.post("/wishlist/add", { book_id: Number(id) });
        setIsInWishlist(true);
      }
      refreshWishlistCount();
    } catch (error) {
      console.error("Failed to update wishlist", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!book) return;
    addItem(book, "book");
    setAddedToCartFeedback(true);
    setTimeout(() => setAddedToCartFeedback(false), 2000);
  };

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  if (bookLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-dark" />
        <p className="font-serif italic text-gray">Lecture du volume...</p>
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-4 max-w-xl">
        <h2 className="font-serif text-3xl font-bold text-charcoal">Volume introuvable</h2>
        <p className="text-gray">Le livre que vous cherchez n'existe pas ou a été retiré de la vente.</p>
        <Link
          to="/catalogue"
          className="inline-flex items-center space-x-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Retour au catalogue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-12 max-w-7xl py-12 space-y-16">
      {/* Back link */}
      <div>
        <Link
          to="/catalogue"
          className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-poppins font-bold text-primary hover:text-primary-dark"
        >
          <ArrowLeft size={14} />
          <span>Retour au catalogue</span>
        </Link>
      </div>

      {/* ==========================================
         1. BOOK SPECIFICATIONS (2 Columns)
         ========================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Image, Badges, View counts (5/12 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-6">
          <div className="relative group max-w-xs md:max-w-sm">
            {/* Elegant deep shadow backing */}
            <div className="absolute inset-0 bg-charcoal/5 rounded-3xl blur-md transform translate-y-3 scale-95" />
            <div className="absolute inset-0 bg-primary-soft/20 rounded-3xl transform rotate-3" />
            
            <img
              src={getImgUrl(book.image)}
              alt={book.titre}
              className="w-full h-[380px] md:h-[480px] object-cover rounded-3xl shadow-xl relative z-10 border-4 border-white transform transition-transform duration-500 hover:scale-[1.01]"
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-xs md:max-w-sm px-4">
            <span className="font-poppins uppercase tracking-wider text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-soft/30 text-primary-dark">
              {book.category?.name || "Livre"}
            </span>

            <div className="flex items-center space-x-1.5 text-gray font-medium text-sm">
              <Eye size={16} className="text-primary" />
              <span>{book.views_count || book.nb_vues || 0} vues</span>
            </div>
          </div>
        </div>

        {/* Right Column: Book details (7/12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-charcoal leading-tight">
              {book.titre}
            </h1>
            <p className="text-lg md:text-xl text-gray font-medium">Par {book.auteur}</p>
          </div>

          <div className="text-3xl font-serif font-bold text-accent-gold">
            {Number(book.prix_vente).toLocaleString()} CFA
          </div>

          <hr className="border-t border-primary-soft/20" />

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-poppins uppercase tracking-wider text-xs font-bold text-gray/80">
              Résumé de l'ouvrage
            </h3>
            <p className="text-gray text-base leading-relaxed whitespace-pre-line font-light">
              {book.description || "Aucun résumé n'est disponible pour cet ouvrage. Plongez dans ses pages pour découvrir son histoire et le style d'écriture de l'auteur."}
            </p>
          </div>

          {/* Stock Available */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-semibold text-charcoal">Disponibilité :</span>
            {Number(book.stock ?? book.quantite ?? 1) > 0 ? (
              <span className="text-primary-dark font-semibold">
                En stock ({book.stock ?? book.quantite} exemplaires)
              </span>
            ) : (
              <span className="text-destructive font-semibold">Rupture de stock</span>
            )}
          </div>

          <hr className="border-t border-primary-soft/20" />

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={Number(book.stock ?? book.quantite ?? 1) <= 0}
              className="bg-accent-gold hover:bg-accent-gold/90 disabled:opacity-50 text-charcoal font-bold px-8 py-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 grow md:grow-0"
            >
              {addedToCartFeedback ? (
                <>
                  <Check size={18} />
                  <span>Ajouté au panier !</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>Ajouter au panier</span>
                </>
              )}
            </button>

            {isAuthenticated && (
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`border px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isInWishlist
                    ? "bg-destructive/10 border-destructive text-destructive"
                    : "border-primary-soft/60 hover:bg-primary-soft/10 text-charcoal"
                }`}
                aria-label="Wishlist"
              >
                <Heart size={18} className={isInWishlist ? "fill-destructive" : ""} />
                <span>{isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
         2. RELATED BOOKS (Horizontal scroll)
         ========================================== */}
      <section className="border-t border-primary-soft/20 pt-16 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal">
            Livres similaires
          </h2>
        </div>

        {relatedBooks.length > 0 ? (
          <div className="flex overflow-x-auto space-x-6 pb-6 scroll-smooth snap-x">
            {relatedBooks.map((relatedBook) => (
              <div
                key={relatedBook.id}
                className="snap-start shrink-0 w-[200px] md:w-[240px] bg-white rounded-2xl p-4 border border-primary-soft/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <Link to={`/catalogue/${relatedBook.id}`} className="h-48 overflow-hidden rounded-xl relative block bg-ivory">
                    <img
                      src={getImgUrl(relatedBook.image)}
                      alt={relatedBook.titre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 text-charcoal shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={12} />
                    </div>
                  </Link>
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-sm text-charcoal line-clamp-1 group-hover:text-primary transition-colors">
                      <Link to={`/catalogue/${relatedBook.id}`}>{relatedBook.titre}</Link>
                    </h4>
                    <p className="text-[11px] text-gray">{relatedBook.auteur}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-primary-soft/10 text-xs">
                  <span className="font-serif font-bold text-primary-dark">
                    {Number(relatedBook.prix_vente).toLocaleString()} CFA
                  </span>
                  <Link to={`/catalogue/${relatedBook.id}`} className="text-primary font-bold">
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray font-serif">Aucun livre similaire trouvé.</p>
        )}
      </section>
    </div>
  );
};

export default BookDetail;

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, ShoppingBag, Eye, Heart, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import apiClient, { IMAGE_URL } from "../api/client";

const Wishlist = () => {
  const queryClient = useQueryClient();
  const { refreshWishlistCount } = useAuth();
  const { addItem } = useCart();
  const [removingId, setRemovingId] = useState(null);

  // Fetch Wishlist
  const { data: wishlistResponse, isLoading, refetch } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await apiClient.get("/wishlist");
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes local cache
  });

  const books = wishlistResponse?.data?.books || [];

  // Remove Mutation
  const removeMutation = useMutation({
    mutationFn: async (bookId) => {
      setRemovingId(bookId);
      const response = await apiClient.post("/wishlist/remove", { book_id: bookId });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      refreshWishlistCount();
      setRemovingId(null);
    },
    onError: (error) => {
      console.error("Failed to remove item", error);
      setRemovingId(null);
    }
  });

  const handleRemove = (bookId) => {
    removeMutation.mutate(bookId);
  };

  const handleAddToCart = (book) => {
    addItem(book, "book");
  };

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  return (
    <div className="container mx-auto px-6 md:px-12 max-w-4xl py-12 space-y-12">
      {/* Title */}
      <div className="space-y-2 text-center md:text-left">
        <span className="font-poppins uppercase tracking-wider text-xs font-semibold text-primary">
          Mon Espace
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
          Mes Lectures Préférées
        </h1>
        <p className="text-sm text-gray font-light">
          Retrouvez les ouvrages qui ont capturé votre attention et préparez vos futures lectures.
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-dark" />
          <p className="font-serif italic text-gray">Ouverture de votre sélection...</p>
        </div>
      ) : books.length > 0 ? (
        
        /* VERTICAL EDITORIAL LIST */
        <div className="space-y-6">
          {books.map((book) => (
            <div
              key={book.id}
              className={`bg-white rounded-3xl p-6 border border-primary-soft/10 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center md:items-start justify-between gap-6 ${
                removingId === book.id ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {/* Left Side: Image + Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 w-full md:w-auto">
                <Link to={`/catalogue/${book.id}`} className="w-24 h-36 rounded-xl overflow-hidden shadow-md shrink-0 block bg-ivory">
                  <img
                    src={getImgUrl(book.image)}
                    alt={book.titre}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="space-y-2 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] uppercase font-poppins tracking-wider font-bold text-primary">
                      {book.category?.name || "Livre"}
                    </span>
                    <h2 className="font-serif font-bold text-xl text-charcoal hover:text-primary transition-colors">
                      <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
                    </h2>
                    <p className="text-sm text-gray">Par {book.auteur}</p>
                  </div>
                  <p className="text-lg font-serif font-bold text-primary-dark">
                    {Number(book.prix_vente).toLocaleString()} CFA
                  </p>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto shrink-0 justify-center md:justify-end">
                <button
                  onClick={() => handleAddToCart(book)}
                  className="bg-accent-gold hover:bg-accent-gold/90 text-charcoal font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 w-full md:w-40 transition-colors shadow-sm"
                >
                  <ShoppingBag size={14} />
                  <span>Ajouter au panier</span>
                </button>

                <button
                  onClick={() => handleRemove(book.id)}
                  className="border border-primary-soft hover:bg-destructive/5 hover:border-destructive hover:text-destructive text-gray px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 w-full md:w-40 transition-all"
                  title="Retirer des favoris"
                >
                  <Trash2 size={14} />
                  <span>Retirer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        
        /* ILLUSTRATED EMPTY STATE WITH BRAND MANIFESTO */
        <div className="bg-white rounded-3xl p-12 text-center max-w-xl mx-auto border border-primary-soft/20 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-primary-soft/20 rounded-full flex items-center justify-center mx-auto text-primary">
            <Heart size={28} className="text-primary-dark" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-charcoal">Votre carnet de lectures est vide</h3>
            <p className="text-gray text-sm font-light leading-relaxed">
              "Promouvoir le goût de la lecture, c'est commencer par explorer les récits qui font battre notre cœur."
            </p>
          </div>

          <p className="text-xs text-gray/60 max-w-xs mx-auto">
            Parcourez notre catalogue littéraire pour y dénicher des ouvrages captivants à ajouter à votre liste personnelle.
          </p>

          <div className="pt-2">
            <Link
              to="/catalogue"
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors inline-flex items-center space-x-1"
            >
              <span>Parcourir le catalogue</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;

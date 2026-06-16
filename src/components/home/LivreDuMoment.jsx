import { Link } from "react-router-dom";
import { ShoppingBag, Star, BookOpen } from "lucide-react";
import { useBookMoment } from "../../hooks/useQueries";
import { useCart } from "../../context/CartContext";
import { mockBooks } from "../../api/mockData";
import { IMAGE_URL } from "../../api/client";

const LivreDuMoment = () => {
  const { addItem } = useCart();
  
  // Queries
  const { data: momentResponse } = useBookMoment("selection_semaine");
  
  const books = momentResponse?.data?.data || momentResponse?.data || momentResponse || [];
  const book = books.length > 0 ? books[0] : mockBooks[0]; // Fallback to first book

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  const handleAddToCart = () => {
    if (book) {
      addItem(book, "book");
    }
  };

  if (!book) return null;

  return (
    <section className="py-20 px-6 md:px-12 bg-white border-t border-b border-primary-soft/10">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Big cover visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative max-w-xs md:max-w-sm group">
              {/* Back shadows */}
              <div className="absolute inset-0 bg-charcoal/5 rounded-3xl blur-md transform translate-y-3 scale-95" />
              <div className="absolute inset-0 bg-primary-soft/20 rounded-3xl transform rotate-3" />
              
              <Link to={`/catalogue/${book.id}`}>
                <img
                  src={getImgUrl(book.image || book.image_link)}
                  alt={book.titre}
                  className="w-72 h-[420px] md:w-80 md:h-[480px] object-cover rounded-3xl shadow-xl relative z-10 border-4 border-white transition-transform duration-500 hover:scale-[1.01]"
                />
              </Link>
            </div>
          </div>

          {/* Right Column: Text information */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-poppins uppercase tracking-wider text-[10px] font-bold text-primary bg-primary-soft/30 px-4 py-1.5 rounded-full inline-flex items-center space-x-1.5">
                <BookOpen size={10} />
                <span>Le choix de la semaine</span>
              </span>
              
              <div className="flex items-center space-x-1 text-accent-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-accent-gold stroke-none" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-charcoal leading-tight">
                {book.titre}
              </h2>
              <p className="text-lg text-gray font-medium">De {book.auteur}</p>
            </div>

            <hr className="border-t border-primary-soft/20" />

            <div className="space-y-3">
              <h3 className="font-poppins uppercase tracking-wider text-[10px] font-bold text-gray/70">
                Notes de l'éditeur
              </h3>
              <p className="text-gray text-base leading-relaxed line-clamp-4 font-light">
                {book.description || "Un ouvrage d'exception recommandé par notre équipe pour sa plume unique et la profondeur de son récit. Plongez sans hésitation dans ses pages."}
              </p>
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <span className="text-3xl font-serif font-bold text-accent-gold">
                {Number(book.prix_vente || book.prix).toLocaleString()} FCFA
              </span>
              <span className="text-xs text-primary-dark font-poppins uppercase tracking-wider bg-primary-soft/30 px-3 py-1 rounded-lg font-bold">
                {book.etat_livre || book.etat || "Neuf"}
              </span>
            </div>

            <hr className="border-t border-primary-soft/20" />

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                className="bg-accent-gold hover:bg-accent-gold/90 text-charcoal font-bold px-8 py-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={18} />
                <span>Acheter maintenant</span>
              </button>
              
              <Link
                to={`/catalogue/${book.id}`}
                className="border border-primary-soft hover:bg-primary-soft/10 text-charcoal font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-300 flex items-center justify-center"
              >
                Consulter la fiche
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default LivreDuMoment;

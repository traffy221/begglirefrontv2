import { useEffect, useState } from "react";
import { X, ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickViewModal({ book, isOpen, onClose, onAddToCart }) {
  const [isRendered, setIsRendered] = useState(isOpen);

  // Modal open transitions
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isRendered || !book) return null;

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const coverUrl = getImgUrl(book.image || book.cover || book.image_link);
  const price = Number(book.prix_vente !== undefined ? book.prix_vente : (book.prix !== undefined ? book.prix : 0));
  const desc = book.description || "Aucun résumé n'est disponible pour cet ouvrage.";
  const shortDesc = desc.length > 180 ? `${desc.substring(0, 180)}...` : desc;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 select-none">
      
      {/* 1. Backdrop overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 2. Modal Centered Panel */}
      <div
        className={`relative bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-primary-soft/10 grid grid-cols-1 md:grid-cols-12 transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-white/80 backdrop-blur hover:bg-primary-soft/10 rounded-full text-charcoal shadow-sm transition-colors"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        {/* LEFT COLUMN: Cover (5/12 cols) */}
        <div className="md:col-span-5 bg-[#1c380e]/5 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-primary-soft/10">
          <div className="w-[170px] h-[240px] md:w-[190px] md:h-[270px] bg-white rounded-xl overflow-hidden shadow-lg border-[3px] border-white flex items-center justify-center">
            <img src={coverUrl} alt={book.titre} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Actions (7/12 cols) */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category */}
            <span className="inline-block text-[9px] font-poppins font-bold uppercase tracking-widest bg-[#1c380e]/10 text-[#1c380e] px-2.5 py-1 rounded">
              {book.category?.name || book.categorie || "Livre"}
            </span>

            {/* Title & Author */}
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl md:text-2xl text-charcoal leading-tight line-clamp-2">
                {book.titre}
              </h3>
              <p className="text-xs text-gray font-medium">Par <span className="text-accent-gold">{book.auteur}</span></p>
            </div>

            {/* Price */}
            <div className="text-xl font-serif font-bold text-charcoal select-none">
              {price.toLocaleString()} FCFA
            </div>

            {/* Description snippet */}
            <p className="text-xs text-gray/80 leading-relaxed font-light">
              {shortDesc}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-primary-soft/10">
            {/* Direct basket add */}
            <button
              onClick={() => {
                onAddToCart(book);
                onClose();
              }}
              className="flex-1 bg-accent-gold hover:bg-amber-500 text-charcoal py-3 px-4 rounded-xl text-xs font-poppins font-bold uppercase tracking-wider shadow hover:shadow-lg transition-all flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <ShoppingBag size={14} />
              <span>Ajouter au panier</span>
            </button>

            {/* See detail page */}
            <Link
              to={`/catalogue/${book.id}`}
              onClick={onClose}
              className="flex-1 bg-[#1c380e] hover:bg-[#2c4e1d] text-white py-3 px-4 rounded-xl text-xs font-poppins font-bold uppercase tracking-wider shadow hover:shadow-lg transition-all flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <Eye size={14} />
              <span>Fiche complète</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

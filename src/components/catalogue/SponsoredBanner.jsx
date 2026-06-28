import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SponsoredBanner({ book, onAddToCart }) {
  if (!book) return null;

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const coverUrl = getImgUrl(book.image || book.cover || book.image_link);
  const price = Number(book.prix_vente !== undefined ? book.prix_vente : (book.prix !== undefined ? book.prix : 0));
  const categoryName = book.category?.name || book.categorie || "Roman";
  const author = book.auteur || "Auteur inconnu";
  const desc = book.description || "Aucun résumé disponible pour cet ouvrage d'exception.";
  const shortDesc = desc.length > 220 ? `${desc.substring(0, 220)}...` : desc;

  return (
    <div className="w-full bg-white border border-[#E5B23E]/30 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-sm relative overflow-hidden select-none mb-8">
      {/* Background Subtle Sparkle Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5B23E]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left: Landscape Image Area */}
      <div className="w-full md:w-72 h-44 md:h-52 shrink-0 rounded-2xl overflow-hidden relative bg-[#1c380e]/5 border border-primary-soft/5 flex items-center justify-center">
        {/* Blurred background cover */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-md opacity-25 scale-110"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
        {/* Crisp foreground portrait cover centered */}
        <img
          src={coverUrl}
          alt={book.titre}
          className="relative z-10 h-full w-auto object-contain py-3 shadow-md transition-transform duration-500 hover:scale-105"
          draggable="false"
        />

        {/* Badge Sponsorisé superimposed on the image */}
        <span className="absolute top-3 left-3 bg-charcoal text-accent-gold text-[8px] font-poppins font-bold uppercase tracking-widest px-2 py-1 rounded shadow-md z-20">
          Sponsorisé
        </span>
      </div>

      {/* Right: Text Content */}
      <div className="flex-grow w-full flex flex-col justify-between py-1">
        <div className="space-y-3">
          {/* Header Row: Category & À l'affiche */}
          <div className="flex items-center space-x-2">
            <span className="inline-block text-[9px] font-poppins font-bold uppercase tracking-widest bg-[#1c380e]/10 text-[#1c380e] px-2.5 py-1 rounded">
              {categoryName}
            </span>
            <span className="text-[9px] font-poppins font-bold uppercase tracking-widest text-gray/50">
              • À l'affiche
            </span>
          </div>

          {/* Book Title */}
          <h2 className="font-serif font-bold text-xl md:text-2xl text-charcoal leading-snug hover:text-[#1c380e] transition-colors">
            <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
          </h2>

          {/* Author */}
          <p className="text-xs font-poppins font-semibold text-gray">Par {author}</p>

          {/* Description */}
          <p className="text-xs text-gray/80 leading-relaxed font-light max-w-2xl">
            {shortDesc}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-4 border-t border-primary-soft/10">
          <span className="text-lg md:text-xl font-poppins font-bold text-charcoal">
            {price.toLocaleString()} FCFA
          </span>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onAddToCart(book)}
              className="bg-transparent border border-[#1c380e] hover:bg-[#1c380e]/5 text-[#1c380e] text-[10px] md:text-xs font-poppins font-bold uppercase tracking-wider py-2.5 px-4 md:px-5 rounded-xl transition-all active:scale-95"
            >
              Ajouter au panier
            </button>
            <Link
              to={`/catalogue/${book.id}`}
              className="inline-flex items-center space-x-1.5 bg-[#1c380e] hover:bg-[#2c4e1d] text-white text-[10px] md:text-xs font-poppins font-bold uppercase tracking-wider py-2.5 px-4 md:px-5 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <span>Consulter la fiche</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Eye, ShoppingBag } from "lucide-react";

export default function BookCardMagazine({
  book,
  layout = "compact", // "featured" | "compact"
  onQuickView,
  onAddToCart
}) {
  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const coverUrl = getImgUrl(book.image || book.cover || book.image_link);
  const price = Number(book.prix_vente !== undefined ? book.prix_vente : (book.prix !== undefined ? book.prix : 0));
  const categoryName = book.category?.name || book.categorie || "Roman";
  const author = book.auteur || "Auteur inconnu";

  if (layout === "featured") {
    return (
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-md group select-none border border-primary-soft/10 cursor-pointer">
        {/* Cover image with zoom */}
        <img
          src={coverUrl}
          alt={book.titre}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Bottom dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/40 to-transparent z-10" />

        {/* Category Badge (top-left) */}
        <span className="absolute top-4 left-4 bg-accent-gold text-charcoal text-[9px] font-poppins font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-md z-20 select-none">
          {categoryName}
        </span>

        {/* Action icons on hover */}
        <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center space-x-3">
          <button
            onClick={() => onQuickView(book)}
            className="p-3 bg-white hover:bg-accent-gold text-charcoal rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300"
            title="Aperçu rapide"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onAddToCart(book)}
            className="p-3 bg-white hover:bg-accent-gold text-charcoal rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 delay-75"
            title="Ajouter au panier"
          >
            <ShoppingBag size={16} />
          </button>
        </div>

        {/* Text Details Box (bottom absolute) */}
        <div className="absolute bottom-5 left-5 right-5 z-20 text-white space-y-1.5">
          <h3 className="font-serif font-bold text-lg md:text-xl text-white leading-tight line-clamp-2 drop-shadow-sm group-hover:text-accent-gold transition-colors">
            <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/70 font-poppins">{author}</span>
            <span className="text-sm font-serif font-bold text-accent-gold">
              {price.toLocaleString()} FCFA
            </span>
          </div>
        </div>

      </div>
    );
  }

  // DEFAULT COMPACT LAYOUT CARD
  return (
    <div className="bg-white rounded-2xl p-4 border border-primary-soft/10 shadow-sm hover:shadow-md transition-shadow duration-300 group flex flex-col justify-between h-full relative select-none">
      
      <div className="space-y-4">
        {/* Cover */}
        <div className="aspect-[3/4] overflow-hidden rounded-xl relative block bg-ivory border border-primary-soft/5">
          <img
            src={coverUrl}
            alt={book.titre}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          />
          {/* Overlay actions on hover */}
          <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <button
              onClick={() => onQuickView(book)}
              className="p-2.5 bg-white hover:bg-accent-gold text-charcoal rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
              title="Aperçu"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => onAddToCart(book)}
              className="p-2.5 bg-white hover:bg-accent-gold text-charcoal rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all delay-75"
              title="Ajouter"
            >
              <ShoppingBag size={14} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <span className="text-[9px] font-poppins font-bold uppercase tracking-wider text-gray/50 block">
            {categoryName}
          </span>
          <h4 className="font-serif font-bold text-sm text-charcoal line-clamp-1 group-hover:text-[#1c380e] transition-colors">
            <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
          </h4>
          <p className="text-[10px] text-gray line-clamp-1 font-medium">{author}</p>
        </div>
      </div>

      {/* Pricing row */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-primary-soft/10 text-xs">
        <span className="font-poppins font-bold text-charcoal">
          {price.toLocaleString()} FCFA
        </span>
        <Link
          to={`/catalogue/${book.id}`}
          className="text-[#1c380e] font-poppins font-bold uppercase tracking-wider hover:underline"
        >
          Détails
        </Link>
      </div>

    </div>
  );
}

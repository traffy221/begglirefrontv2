import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, ChevronRight, BookOpen } from "lucide-react";
import BookActions from "./BookActions";

export default function HeroBook({ book, addItem, isAuthenticated, refreshWishlistCount }) {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  // Parallax scroll calculation
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const handleAuthorClick = () => {
    navigate(`/recherche?q=${encodeURIComponent(book.auteur)}&type=auteurs`);
  };

  const categoryName = book.category?.name || book.categorie || "Roman";
  const coverUrl = getImgUrl(book.image || book.cover || book.image_link);

  return (
    <div className="relative min-h-[92vh] lg:min-h-[88vh] flex items-center justify-center py-16 overflow-hidden select-none">
      
      {/* 1. Immersive Blur Background with Parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-[40px] scale-[1.25] transition-transform ease-out duration-100 z-0"
        style={{
          backgroundImage: `url(${coverUrl})`,
          transform: `translateY(${scrollY * 0.15}px) scale(1.25)`
        }}
      />

      {/* 2. Editorial Sage-Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1c380e]/85 via-[#1c380e]/65 to-ivory z-0" />

      {/* 3. Main Centered 2-Column Content */}
      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        
        {/* COLONNE GAUCHE (40% / 5 Cols) — 3D Cover */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center animate-slide-left">
          
          <div className="relative group max-w-[280px] sm:max-w-[340px] w-full transform transition-all duration-[600ms] hover-perspective-rotate-3d">
            
            {/* Background offset card */}
            <div className="absolute inset-0 bg-[#d5eac7]/20 rounded-3xl transform rotate-2 blur-sm" />
            
            {/* Dramatic Box Shadow behind image */}
            <div className="absolute inset-0 rounded-2xl shadow-[0_35px_70px_rgba(0,0,0,0.55)] group-hover:shadow-[0_45px_85px_rgba(0,0,0,0.65)] transition-shadow duration-[600ms]" />

            {/* Book Image */}
            <div className="relative rounded-2xl overflow-hidden border-[6px] border-white/95 shadow-inner">
              <img
                src={coverUrl}
                alt={book.titre}
                className="w-full h-[380px] md:h-[450px] object-cover"
              />

              {/* Gold Category Badge overlay (top-left of cover) */}
              <div className="absolute top-4 left-4 bg-accent-gold text-charcoal text-[9px] font-poppins font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-md select-none">
                {categoryName}
              </div>

              {/* Views Count overlay (bottom of cover) */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 flex items-center justify-center space-x-1.5 text-white/90 text-xs font-semibold select-none shadow">
                <Eye size={14} className="text-accent-gold shrink-0" />
                <span>{(book.views_count || book.nb_vues || 0).toLocaleString()} vues</span>
              </div>
            </div>

          </div>

        </div>

        {/* COLONNE DROITE (60% / 7 Cols) — Main book metadata */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-white text-left animate-slide-right">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1 text-white/60 text-[10px] uppercase font-poppins font-semibold tracking-wider select-none">
            <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight size={10} />
            <Link to="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
            <ChevronRight size={10} />
            <span className="text-white/40 truncate max-w-[120px]">{categoryName}</span>
            <ChevronRight size={10} />
            <span className="text-white truncate max-w-[150px]">{book.titre}</span>
          </nav>

          {/* Book Title & Author */}
          <div className="space-y-2">
            <h1 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl leading-tight text-white tracking-tight drop-shadow-sm clamp-2">
              {book.titre}
            </h1>
            <p className="text-sm font-poppins font-semibold text-white/80">
              <span>par </span>
              <span 
                onClick={handleAuthorClick}
                className="text-accent-gold hover:text-amber-300 hover:underline cursor-pointer transition-colors"
              >
                {book.auteur}
              </span>
            </p>
          </div>

          {/* Publisher and Year */}
          {(book.editeur || book.annee) && (
            <div className="text-xs text-white/70 font-poppins flex items-center space-x-2 select-none">
              {book.editeur && <span>Édition : {book.editeur}</span>}
              {book.editeur && book.annee && <span>•</span>}
              {book.annee && <span>Publié en {book.annee}</span>}
            </div>
          )}

          {/* Language & State pill badges */}
          <div className="flex flex-wrap gap-2 select-none">
            {book.langue && (
              <span className="text-[10px] font-poppins font-semibold bg-white/10 border border-white/10 px-3 py-1 rounded-full text-white/90 uppercase">
                🌍 {book.langue}
              </span>
            )}
            {book.etat && (
              <span className="text-[10px] font-poppins font-semibold bg-white/10 border border-white/10 px-3 py-1 rounded-full text-white/90 uppercase">
                📖 État : {book.etat === "tres_bon" ? "Très bon" : book.etat === "neuf" ? "Neuf" : book.etat === "bon" ? "Bon" : "Acceptable"}
              </span>
            )}
          </div>

          {/* Book actions sub-component */}
          <div className="pt-4 border-t border-white/10">
            <BookActions
              book={book}
              addItem={addItem}
              isAuthenticated={isAuthenticated}
              refreshWishlistCount={refreshWishlistCount}
            />
          </div>

        </div>

      </div>

      {/* Style injection for slide-in animations and 3D perspectives */}
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-left {
          animation: slideLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 200ms;
        }
        .animate-slide-right {
          animation: slideRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 300ms;
        }
        .hover-perspective-rotate-3d {
          perspective: 1000px;
        }
        .hover-perspective-rotate-3d img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          transform: rotateY(-8deg);
        }
        .hover-perspective-rotate-3d:hover img {
          transform: rotateY(0deg);
        }
      `}</style>

    </div>
  );
}

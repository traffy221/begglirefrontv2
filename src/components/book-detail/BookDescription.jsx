import { useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BookDescription({ book }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const desc = book.description || "Aucun résumé n'est disponible pour cet ouvrage. Plongez dans ses pages pour découvrir son histoire et le style d'écriture de l'auteur.";
  const showReadMore = desc.length > 300;
  const displayedDesc = showReadMore && !isExpanded ? `${desc.substring(0, 300)}...` : desc;

  const handleScrollToBuy = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const getConditionLabel = (cond) => {
    switch (cond) {
      case "neuf": return "Neuf (Comme sorti de librairie)";
      case "tres_bon": return "Très bon état (Aucune marque visible)";
      case "bon": return "Bon état (Légères traces d'usure)";
      case "acceptable": return "Acceptable (Usure visible mais entièrement lisible)";
      default: return cond || "Bon état";
    }
  };

  // Resolve Excerpt Content
  const excerptText = book.extrait || book.chapter_sample || (
    desc.length > 200 ? `${desc.substring(0, 200)}...` : desc
  );
  const isFallbackExcerpt = !book.extrait && !book.chapter_sample;

  return (
    <div className="bg-ivory py-16 px-6 md:px-12 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start font-sans">
      
      {/* LEFT COLUMN: Summary and Excerpt (7/12 cols) */}
      <div className="lg:col-span-7 space-y-10">
        
        {/* 1. Description Section */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-2xl text-[#1c380e]">
            À propos de ce livre
          </h3>
          <p className="text-gray text-sm md:text-base leading-relaxed whitespace-pre-line font-light transition-all duration-300">
            {displayedDesc}
          </p>

          {showReadMore && (
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="text-xs font-bold text-[#1c380e] hover:underline flex items-center pt-1"
            >
              {isExpanded ? "Lire moins ▲" : "Lire plus ▼"}
            </button>
          )}
        </div>

        {/* 2. Excerpt Section */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-2xl text-[#1c380e]">
            Extrait
          </h3>
          
          <div className="bg-primary-soft/10 border-l-4 border-accent-gold p-6 rounded-r-2xl shadow-sm relative group">
            {isFallbackExcerpt && (
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#1c380e]/40 block mb-2 font-poppins">
                Extrait de l'introduction
              </span>
            )}
            
            <p className="font-serif italic text-sm md:text-base text-charcoal/90 leading-relaxed">
              « {excerptText} »
            </p>

            {/* Scroll to buy link */}
            <div className="text-right mt-4">
              <button
                onClick={handleScrollToBuy}
                className="text-[10px] uppercase font-poppins font-bold text-[#1c380e] hover:text-primary-dark transition-colors inline-flex items-center space-x-1"
              >
                <span>Acheter pour lire la suite</span>
                <ArrowUp size={10} className="animate-bounce" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Specifications (5/12 cols) */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-primary-soft/20 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-lg text-charcoal border-b border-primary-soft/10 pb-3">
          Fiche technique
        </h3>

        <div className="flex flex-col space-y-3.5 text-xs">
          
          {/* ISBN */}
          <div className="flex justify-between items-start">
            <span className="text-gray font-light">ISBN</span>
            <span className="font-poppins font-semibold text-charcoal text-right">
              {book.isbn || "Non spécifié"}
            </span>
          </div>

          {/* Publisher */}
          <div className="flex justify-between items-start border-t border-primary-soft/5 pt-3">
            <span className="text-gray font-light">Éditeur</span>
            <span className="font-medium text-charcoal text-right">
              {book.editeur || "Non spécifié"}
            </span>
          </div>

          {/* Year */}
          <div className="flex justify-between items-start border-t border-primary-soft/5 pt-3">
            <span className="text-gray font-light">Année de publication</span>
            <span className="font-poppins font-semibold text-charcoal text-right">
              {book.annee || "Non spécifiée"}
            </span>
          </div>

          {/* Language */}
          <div className="flex justify-between items-start border-t border-primary-soft/5 pt-3">
            <span className="text-gray font-light">Langue</span>
            <span className="font-medium text-charcoal text-right">
              {book.langue || "Français"}
            </span>
          </div>

          {/* Category */}
          <div className="flex justify-between items-start border-t border-primary-soft/5 pt-3">
            <span className="text-gray font-light">Catégorie</span>
            <span className="font-medium text-[#1c380e] text-right uppercase font-poppins font-bold text-[10px]">
              {book.category?.name || book.categorie || "Roman"}
            </span>
          </div>

          {/* State */}
          <div className="flex justify-between items-start border-t border-primary-soft/5 pt-3">
            <span className="text-gray font-light">État du livre</span>
            <span className="font-medium text-charcoal text-right">
              {getConditionLabel(book.etat)}
            </span>
          </div>

          {/* Seller */}
          <div className="flex justify-between items-start border-t border-primary-soft/5 pt-3">
            <span className="text-gray font-light">Vendeur</span>
            <span className="font-medium text-primary-dark font-poppins font-bold uppercase text-[10px] text-right">
              {book.owner_user?.fullname || "Libraire Bëgg Lire"}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

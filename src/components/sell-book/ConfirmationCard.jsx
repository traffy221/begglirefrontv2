import { Check, BookOpen } from "lucide-react";

const ConfirmationCard = ({ bookInfo, onViewMyAds, onSellAnother }) => {
  const getConditionLabel = (condId) => {
    switch (condId) {
      case "neuf": return "Neuf";
      case "tres_bon": return "Très bon";
      case "bon": return "Bon";
      case "acceptable": return "Acceptable";
      default: return "Bon";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 border border-primary-soft/10 shadow-sm max-w-xl mx-auto text-center space-y-8 animate-fade-in">
      
      {/* Animated Check circle */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-[#1c380e] text-white rounded-full flex items-center justify-center shadow-lg transform scale-100 animate-bounce-in">
          <Check size={32} strokeWidth={2.5} />
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-3">
        <h2 className="font-serif font-bold text-2xl md:text-3xl text-charcoal">
          Livre soumis avec succès !
        </h2>
        <p className="text-xs md:text-sm text-gray max-w-md mx-auto font-light leading-relaxed">
          Votre annonce est en cours de vérification par notre équipe. Vous recevrez une réponse sous 24 à 48h.
        </p>
      </div>

      {/* Recap Card */}
      <div className="bg-ivory border border-primary-soft/20 rounded-2xl p-5 text-left flex items-center space-x-4 max-w-md mx-auto">
        <div className="w-16 h-22 bg-white rounded shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
          {bookInfo.cover ? (
            <img src={bookInfo.cover} alt={bookInfo.titre} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="text-primary/30" size={24} />
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <h4 className="font-serif font-bold text-sm text-charcoal truncate">
            {bookInfo.titre}
          </h4>
          <p className="text-xs text-gray font-light truncate">
            Par {bookInfo.auteur}
          </p>
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-[9px] font-poppins font-bold bg-primary-soft/40 text-primary-dark px-2 py-0.5 rounded">
              État : {getConditionLabel(bookInfo.etat)}
            </span>
            <span className="text-xs font-serif font-bold text-primary-dark pl-1">
              {Number(bookInfo.prix).toLocaleString()} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={onViewMyAds}
          className="bg-[#1c380e] hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl text-xs font-poppins uppercase tracking-wider shadow"
        >
          Voir mes annonces
        </button>
        
        <button
          onClick={onSellAnother}
          className="border border-[#1c380e] text-[#1c380e] hover:bg-[#1c380e]/5 font-bold px-8 py-3.5 rounded-xl text-xs font-poppins uppercase tracking-wider transition-all"
        >
          Vendre un autre livre
        </button>
      </div>

      {/* CSS Animation injection (safeguarded) */}
      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

    </div>
  );
};

export default ConfirmationCard;

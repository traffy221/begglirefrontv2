import { Link } from "react-router-dom";
import { Calendar, Bell, ArrowRight } from "lucide-react";

const AParaitre = () => {
  // Mock upcoming books
  const upcomingBooks = [
    {
      id: "up-1",
      titre: "Les veilleurs du fleuve",
      auteur: "Awa Ndiaye",
      image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400",
      release_date: "Septembre 2026",
      synopsis: "Une plongée poétique et politique le long du fleuve Sénégal, explorant la mémoire des eaux et le destin des villages frontaliers."
    },
    {
      id: "up-2",
      titre: "Dakar Underground",
      auteur: "Ousmane Sy",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400",
      release_date: "Octobre 2026",
      synopsis: "Un thriller haletant explorant les milieux de la musique alternative, de la mode de rue et des secrets financiers de la capitale."
    }
  ];

  return (
    <section className="py-20 px-6 md:px-12 bg-ivory">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <span className="font-poppins uppercase tracking-wider text-[10px] font-bold text-primary flex items-center space-x-1.5">
              <Calendar size={12} className="text-accent-gold" />
              <span>Les sorties futures</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
              À paraître
            </h2>
          </div>
          <button
            onClick={() => {}}
            className="mt-4 md:mt-0 font-poppins text-sm font-semibold text-gray/50 cursor-not-allowed flex items-center space-x-1"
            disabled
          >
            <span>Voir tous les résultats</span>
            <ArrowRight size={16} className="shrink-0" />
          </button>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {upcomingBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-3xl p-6 border border-primary-soft/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-6"
            >
              {/* Cover wrapper with badge */}
              <div className="relative shrink-0 w-full sm:w-36 h-56 rounded-2xl overflow-hidden bg-ivory shadow-inner">
                <img
                  src={book.image}
                  alt={book.titre}
                  className="w-full h-full object-cover filter grayscale-[40%]"
                />
                <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center p-3 text-center">
                  <span className="bg-accent-gold text-charcoal font-bold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow">
                    Bientôt dispo
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-primary text-xs font-semibold font-poppins">
                    <Calendar size={12} />
                    <span>Parution : {book.release_date}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-charcoal">{book.titre}</h3>
                  <p className="text-xs text-gray font-medium">De {book.auteur}</p>
                  <p className="text-xs text-gray/70 leading-relaxed font-light line-clamp-3">
                    {book.synopsis}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => alert(`Vous recevrez une alerte lors de la sortie de « ${book.titre} » !`)}
                    className="flex items-center space-x-2 text-xs font-poppins uppercase tracking-wider font-bold text-primary-dark hover:text-primary transition-colors bg-primary-soft/20 hover:bg-primary-soft/40 px-4 py-2 rounded-xl"
                  >
                    <Bell size={12} />
                    <span>M'alerter par email</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AParaitre;

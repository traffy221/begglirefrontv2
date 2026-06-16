import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BannierePromo = () => {
  return (
    <section className="bg-primary text-white py-12 px-6 md:px-12 relative overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      <div className="container mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* Promo details */}
        <div className="space-y-2">
          <div className="inline-block bg-accent-gold text-charcoal font-bold px-3 py-1 rounded-lg text-xs font-poppins uppercase tracking-wider">
            Offre Littéraire
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-tight">
            Jusqu'à <span className="text-accent-gold font-poppins">20% OFF</span> sur une sélection d'auteurs
          </h2>
          <p className="text-white/80 font-light max-w-xl text-sm md:text-base">
            Redécouvrez les grands classiques de la littérature africaine à des prix encore plus bas cette semaine.
          </p>
        </div>

        {/* CTA Button */}
        <div className="shrink-0">
          <Link
            to="/catalogue?category=1"
            className="bg-white text-primary-dark hover:bg-ivory font-bold px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center text-sm uppercase tracking-wider font-poppins"
          >
            <span>Profiter de l'offre</span>
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default BannierePromo;

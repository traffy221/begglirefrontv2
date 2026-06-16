import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { useAuteurSemaine } from "../../hooks/useQueries";
import { IMAGE_URL } from "../../api/client";

const AuteurSemaine = () => {
  const { data: auteurData, isLoading } = useAuteurSemaine();
  const auteur = auteurData?.data || auteurData;

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  if (isLoading || !auteur) return null;

  return (
    <section className="bg-primary-dark text-ivory py-20 px-6 md:px-12 relative overflow-hidden transition-all duration-300">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-gold/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Author Photo slightly tilted */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="absolute inset-0 bg-accent-gold rounded-2xl transform rotate-6 opacity-30 blur-sm" />
              <img
                src={getImgUrl(auteur.image_auteur || auteur.photo)}
                alt={auteur.nom_auteur || auteur.fullname || "Auteur de la semaine"}
                className="w-64 h-80 md:w-72 md:h-[400px] object-cover rounded-2xl border-4 border-white shadow-2xl relative z-10"
              />
            </div>
          </div>

          {/* Right Column: Author Info */}
          <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="font-poppins uppercase tracking-widest text-[10px] font-bold text-accent-gold bg-white/10 px-4 py-1.5 rounded-full inline-block">
                Auteur de la semaine
              </span>
              
              {/* Star Rating */}
              <div className="flex items-center space-x-1 text-accent-gold bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-accent-gold stroke-none" />
                ))}
                <span className="text-[10px] font-poppins font-bold text-white ml-1.5">5.0</span>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              {auteur.nom_auteur || auteur.nom || auteur.fullname}
            </h2>
            
            <p className="text-lg text-white/80 leading-relaxed font-light max-w-2xl">
              {auteur.description || auteur.bio || "Découvrez l'univers littéraire de notre auteur mis en avant cette semaine à travers ses ouvrages marquants."}
            </p>

            <div className="pt-4">
              <Link
                to={`/catalogue?search=${encodeURIComponent(auteur.nom_auteur || auteur.nom || auteur.fullname)}`}
                className="bg-white hover:bg-ivory text-primary-dark font-bold px-8 py-4 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center group"
              >
                <span>En lire plus</span>
                <ArrowRight className="ml-2 text-primary shrink-0 group-hover:translate-x-1 transition-transform" size={16} />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AuteurSemaine;

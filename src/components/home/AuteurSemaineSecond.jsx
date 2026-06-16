import { Link } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";
import { useAuteurSemaine } from "../../hooks/useQueries";
import { IMAGE_URL } from "../../api/client";

const AuteurSemaineSecond = () => {
  const { data: auteurData, isLoading } = useAuteurSemaine();
  const auteur = auteurData?.data || auteurData;

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  if (isLoading || !auteur) return null;

  return (
    <section className="py-20 px-6 md:px-12 bg-white border-t border-primary-soft/10">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-ivory rounded-3xl border border-primary-soft/30 p-8 md:p-12 shadow-sm relative overflow-hidden">
          {/* Subtle Sage circle decoration */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left side: Biography & Quote */}
            <div className="md:col-span-7 space-y-6">
              <span className="font-poppins uppercase tracking-widest text-[9px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                Zoom Littéraire
              </span>
              
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal leading-tight">
                Rencontre avec {auteur.nom_auteur || auteur.nom || auteur.fullname}
              </h2>
              
              <div className="relative pl-6 border-l-2 border-accent-gold">
                <Quote className="absolute top-0 left-1.5 text-accent-gold/20 -translate-y-4 shrink-0" size={40} />
                <p className="text-sm md:text-base text-charcoal/80 font-serif italic leading-relaxed">
                  "{auteur.description || "Chaque livre est une fenêtre ouverte sur un monde d'histoires et d'idées nouvelles. Une invitation au voyage de l'esprit."}"
                </p>
              </div>

              <p className="text-xs text-gray leading-relaxed max-w-xl">
                Retrouvez toutes ses publications disponibles à la vente sur notre plateforme, des ouvrages d'exception qui enrichiront votre bibliothèque personnelle.
              </p>

              <div className="pt-2">
                <Link
                  to={`/catalogue?search=${encodeURIComponent(auteur.nom_auteur || auteur.nom || auteur.fullname)}`}
                  className="font-poppins text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center group space-x-1"
                >
                  <span>Consulter sa bibliographie</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right side: Clean framed Portrait */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative">
                {/* Sage double frame */}
                <div className="absolute inset-2 border-2 border-primary-soft/40 rounded-2xl transform translate-x-2 translate-y-2 pointer-events-none" />
                <img
                  src={getImgUrl(auteur.image_auteur || auteur.photo)}
                  alt={auteur.nom_auteur || "Portrait de l'auteur"}
                  className="w-48 h-60 md:w-56 md:h-72 object-cover rounded-2xl shadow border border-primary-soft/10 relative z-10"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AuteurSemaineSecond;

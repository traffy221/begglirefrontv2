import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Layers, Award } from "lucide-react";

const RubriquesEditoriales = () => {
  const litAfricaineTags = [
    { name: "Sénégal", query: "Sénégal" },
    { name: "Nigeria", query: "Nigeria" },
    { name: "Mali", query: "Mali" },
    { name: "Congo", query: "Congo" },
    { name: "Côte d'Ivoire", query: "Ivoire" },
    { name: "Guinée", query: "Guinée" }
  ];

  const fictionSubCats = [
    { name: "Romans Contemporains", query: "Roman" },
    { name: "Poésie & Slam", query: "Poésie" },
    { name: "Théâtre Africain", query: "Théâtre" },
    { name: "Policiers & Thrillers", query: "Policier" },
    { name: "Contes & Légendes", query: "Conte" }
  ];

  const partenaires = [
    "Éditions L'Harmattan",
    "Présence Africaine",
    "Nouvelles Éditions Africaines du Sénégal (NEAS)",
    "Éditions Vents d'Ailleurs",
    "Mémoire d'Encrier"
  ];

  return (
    <section className="py-20 px-6 md:px-12 bg-charcoal text-ivory overflow-hidden border-t border-white/5">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Littérature Africaine */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-primary/40 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-primary">
                <BookOpen size={20} className="text-primary-light" />
                <span className="font-poppins uppercase tracking-widest text-[10px] font-bold text-primary-light">
                  Rubrique Spéciale
                </span>
              </div>
              <h3 className="font-serif font-bold text-2xl text-white group-hover:text-primary transition-colors">
                Littérature Africaine
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Explorez la richesse des voix de notre continent. Des classiques intemporels de Senghor et Ousmane Sembène aux plumes contemporaines les plus vibrantes.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {litAfricaineTags.map((tag, idx) => (
                  <Link
                    key={idx}
                    to={`/catalogue?search=${encodeURIComponent(tag.query)}`}
                    className="text-[10px] font-poppins font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-primary-soft/10 hover:text-white hover:border-primary/30 transition-all"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="pt-8">
              <Link
                to="/catalogue?search=Afrique"
                className="inline-flex items-center text-xs font-bold text-primary-light hover:text-primary transition-colors space-x-2 group/btn"
              >
                <span>Parcourir le rayon</span>
                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Fiction */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-accent-gold/40 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-accent-gold">
                <Layers size={20} />
                <span className="font-poppins uppercase tracking-widest text-[10px] font-bold">
                  Genres Littéraires
                </span>
              </div>
              <h3 className="font-serif font-bold text-2xl text-white group-hover:text-accent-gold transition-colors">
                Fiction & Création
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Laissez-vous emporter par des récits imaginaires singuliers. Romans d'aventures, recueils de poésie moderne, drames théâtraux et intrigues policières sombres.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {fictionSubCats.map((sub, idx) => (
                  <Link
                    key={idx}
                    to={`/catalogue?search=${encodeURIComponent(sub.query)}`}
                    className="text-[10px] font-poppins font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-accent-gold/10 hover:text-white hover:border-accent-gold/30 transition-all"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="pt-8">
              <Link
                to="/catalogue"
                className="inline-flex items-center text-xs font-bold text-accent-gold hover:text-accent-gold/80 transition-colors space-x-2 group/btn"
              >
                <span>Découvrir les fictions</span>
                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: Nos Partenaires Éditoriaux */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-primary/40 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-primary">
                <Award size={20} className="text-primary-light" />
                <span className="font-poppins uppercase tracking-widest text-[10px] font-bold text-primary-light">
                  Réseau Littéraire
                </span>
              </div>
              <h3 className="font-serif font-bold text-2xl text-white group-hover:text-primary transition-colors">
                Partenaires Éditoriaux
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Nous travaillons main dans la main avec les plus grandes maisons d'édition d'Afrique et d'Europe pour vous proposer un catalogue de qualité au meilleur tarif.
              </p>
              
              <div className="space-y-2.5 pt-2">
                {partenaires.map((partner, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 text-[11px] text-white/70 font-sans border-b border-white/5 pb-1.5 last:border-b-0 last:pb-0"
                  >
                    <div className="w-1 h-1 rounded-full bg-accent-gold shrink-0" />
                    <span className="font-medium truncate">{partner}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-8">
              <span className="text-[10px] font-poppins text-white/40 block">
                Partenaires officiels Bëgg Lire
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RubriquesEditoriales;

import { Link } from "react-router-dom";
import { ArrowRight, Star, Heart } from "lucide-react";
import { mockBooks } from "../../api/mockData";
import { IMAGE_URL } from "../../api/client";
import { useMemo } from "react";

const ChoixEquipe = () => {
  // Select specific books manually from mock data for curated selection
  const curatedSelection = useMemo(() => {
    // Select Mariama Ba, Cheikh Hamidou Kane and Mohamed Mbougar Sarr
    return mockBooks.filter(b => [1, 2, 3].includes(b.id));
  }, []);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-ivory">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <span className="font-poppins uppercase tracking-wider text-[10px] font-bold text-primary flex items-center space-x-1.5">
              <Heart size={12} className="text-destructive fill-destructive" />
              <span>Les favoris de nos libraires</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
              Choix de l'équipe
            </h2>
          </div>
          <Link
            to="/catalogue"
            className="mt-4 md:mt-0 font-poppins text-sm font-semibold text-primary hover:text-primary-dark flex items-center space-x-1 group"
          >
            <span>Voir tous les résultats</span>
            <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Columns Editorial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {curatedSelection.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-3xl p-6 border border-primary-soft/10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between"
            >
              {/* Background badge style */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-soft/10 rounded-bl-full flex items-start justify-end p-4 z-0" />
              
              <div className="space-y-6 z-10 relative">
                <div className="flex gap-4">
                  {/* Small visual cover */}
                  <Link to={`/catalogue/${book.id}`} className="shrink-0 w-20 h-32 rounded-xl overflow-hidden shadow-sm bg-ivory">
                    <img
                      src={getImgUrl(book.image || book.image_link)}
                      alt={book.titre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  
                  {/* Meta */}
                  <div className="space-y-2 flex flex-col justify-center">
                    <h4 className="font-serif font-bold text-base text-charcoal leading-tight line-clamp-2">
                      <Link to={`/catalogue/${book.id}`} className="hover:text-primary transition-colors">{book.titre}</Link>
                    </h4>
                    <p className="text-xs text-gray">{book.auteur}</p>
                    
                    <div className="flex items-center text-accent-gold space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className="fill-accent-gold stroke-none" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Libraire comment */}
                <div className="bg-ivory/50 rounded-2xl p-4 border border-primary-soft/5">
                  <p className="text-xs text-gray font-light italic leading-relaxed line-clamp-3">
                    "Un livre absolument remarquable, dont les thématiques résonnent avec une force incroyable. À posséder dans sa bibliothèque."
                  </p>
                  <p className="text-[9px] font-poppins uppercase tracking-wider text-primary font-bold mt-2 text-right">
                    — Libraire Bëgg Lire
                  </p>
                </div>
              </div>

              {/* Bottom strip */}
              <div className="pt-4 flex items-center justify-between border-t border-primary-soft/10 mt-6 z-10 relative">
                <span className="font-serif font-bold text-primary-dark">
                  {Number(book.prix_vente || book.prix).toLocaleString()} FCFA
                </span>
                <Link
                  to={`/catalogue/${book.id}`}
                  className="text-xs font-poppins uppercase tracking-wider font-bold text-primary hover:text-primary-dark"
                >
                  Découvrir
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ChoixEquipe;

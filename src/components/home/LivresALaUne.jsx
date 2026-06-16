import { Link } from "react-router-dom";
import { ArrowRight, Eye, Star } from "lucide-react";
import { useBookMoment } from "../../hooks/useQueries";
import { mockBooks } from "../../api/mockData";
import { IMAGE_URL } from "../../api/client";

const LivresALaUne = () => {
  // Queries
  const { data: featuredResponse } = useBookMoment("livres_a_la_une");
  
  const books = featuredResponse?.data?.data || featuredResponse?.data || featuredResponse || mockBooks.slice(3, 6);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-white">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-primary-soft/10 pb-6">
          <div className="space-y-2">
            <span className="font-poppins uppercase tracking-wider text-[10px] font-bold text-accent-gold">
              Sélection d'exception
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
              Livres à la une
            </h2>
          </div>
          <Link
            to="/catalogue"
            className="mt-4 md:mt-0 font-poppins text-sm font-semibold text-primary hover:text-primary-dark flex items-center space-x-1 group"
          >
            <span>Voir toute la sélection</span>
            <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Dynamic editorial splits layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Main big split featured book */}
          {books.length > 0 && (
            <div className="bg-ivory rounded-3xl p-8 border border-primary-soft/10 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start grow">
              <Link to={`/catalogue/${books[0].id}`} className="shrink-0 w-44 h-64 rounded-2xl overflow-hidden shadow-md bg-white">
                <img
                  src={getImgUrl(books[0].image || books[0].image_link)}
                  alt={books[0].titre}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </Link>
              
              <div className="space-y-4 flex flex-col justify-between h-full text-center md:text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start space-x-1 text-accent-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className="fill-accent-gold stroke-none" />
                    ))}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-charcoal leading-tight">
                    {books[0].titre}
                  </h3>
                  <p className="text-sm text-gray font-medium">De {books[0].auteur}</p>
                  <p className="text-xs text-gray/70 leading-relaxed font-light line-clamp-3">
                    {books[0].description || "Découvrez une œuvre littéraire majeure, encensée par les lecteurs et recommandée pour sa finesse stylistique."}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-primary-soft/10 mt-4">
                  <span className="font-serif font-bold text-primary-dark text-lg">
                    {Number(books[0].prix_vente || books[0].prix).toLocaleString()} FCFA
                  </span>
                  <Link
                    to={`/catalogue/${books[0].id}`}
                    className="bg-accent-gold text-charcoal font-bold px-4 py-2 rounded-xl text-xs hover:bg-accent-gold/90 transition-colors inline-flex items-center"
                  >
                    Voir le livre
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* List of 2 other spotlight books */}
          <div className="space-y-6">
            {books.slice(1, 3).map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-3xl p-5 border border-primary-soft/5 hover:border-primary-soft/20 shadow-sm hover:shadow-md transition-all duration-300 flex gap-6 items-center"
              >
                <Link to={`/catalogue/${book.id}`} className="shrink-0 w-24 h-36 rounded-xl overflow-hidden shadow-sm bg-ivory">
                  <img
                    src={getImgUrl(book.image || book.image_link)}
                    alt={book.titre}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="space-y-3 flex-grow">
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-lg text-charcoal leading-tight line-clamp-1">
                      <Link to={`/catalogue/${book.id}`} className="hover:text-primary transition-colors">{book.titre}</Link>
                    </h4>
                    <p className="text-xs text-gray">De {book.auteur}</p>
                  </div>
                  
                  <p className="text-xs text-gray/60 leading-relaxed font-light line-clamp-2">
                    {book.description || "Un ouvrage enrichissant à découvrir sans plus attendre."}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-primary-soft/5">
                    <span className="font-serif font-bold text-primary-dark">
                      {Number(book.prix_vente || book.prix).toLocaleString()} FCFA
                    </span>
                    <span className="text-[9px] font-poppins uppercase tracking-wider text-gray font-semibold">
                      {book.category?.name || "Littérature"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default LivresALaUne;

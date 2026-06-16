import { Link } from "react-router-dom";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import { useBookMoment } from "../../hooks/useQueries";
import { mockBooks } from "../../api/mockData";
import { IMAGE_URL } from "../../api/client";

const LivresTendances = () => {
  // Queries
  const { data: trendingResponse, isLoading } = useBookMoment("recent");
  
  const books = trendingResponse?.data?.data || trendingResponse?.data || trendingResponse || mockBooks.slice(0, 6);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-ivory overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <span className="font-poppins uppercase tracking-wider text-[10px] font-bold text-primary flex items-center space-x-1.5">
              <Sparkles size={12} className="text-accent-gold fill-accent-gold" />
              <span>Ce que tout le monde lit</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
              Livres Tendances
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

        {/* Horizontal Scroll Grid */}
        <div className="flex overflow-x-auto space-x-6 pb-6 scrollbar-none snap-x">
          {books.map((book) => (
            <div
              key={book.id}
              className="snap-start shrink-0 w-[200px] md:w-[240px] bg-white rounded-2xl p-4 border border-primary-soft/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <Link to={`/catalogue/${book.id}`} className="h-56 overflow-hidden rounded-xl relative block bg-ivory">
                  <img
                    src={getImgUrl(book.image || book.image_link)}
                    alt={book.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 text-charcoal shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye size={12} />
                  </div>
                </Link>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-sm text-charcoal line-clamp-1 group-hover:text-primary transition-colors">
                    <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
                  </h4>
                  <p className="text-xs text-gray">{book.auteur}</p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-primary-soft/5 mt-4">
                <span className="font-serif font-bold text-primary-dark">
                  {Number(book.prix_vente || book.prix).toLocaleString()} FCFA
                </span>
                <span className="text-[10px] font-poppins uppercase tracking-wider text-accent-gold font-bold">
                  {book.etat_livre || book.etat || "Neuf"}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default LivresTendances;

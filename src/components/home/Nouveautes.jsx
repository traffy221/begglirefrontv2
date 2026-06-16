import { Link } from "react-router-dom";
import { ArrowRight, Eye, Star } from "lucide-react";
import { useBooks } from "../../hooks/useQueries";
import { mockBooks } from "../../api/mockData";
import { IMAGE_URL } from "../../api/client";
import { useMemo } from "react";

const Nouveautes = () => {
  // Queries
  const { data: booksResponse, isLoading } = useBooks("tous");
  const rawBooks = booksResponse?.data?.data || booksResponse?.data || booksResponse || [];
  
  // Sort by ID descending for newest and limit to 4
  const newestBooks = useMemo(() => {
    const list = rawBooks.length > 0 ? [...rawBooks] : [...mockBooks];
    return list.sort((a, b) => b.id - a.id).slice(0, 4);
  }, [rawBooks]);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-white">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <span className="font-poppins uppercase tracking-wider text-[10px] font-bold text-primary">
              Les derniers arrivages
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
              Nouveautés
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

        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newestBooks.map((book) => (
            <div
              key={book.id}
              className="bg-ivory rounded-3xl p-5 border border-primary-soft/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <Link to={`/catalogue/${book.id}`} className="h-64 overflow-hidden rounded-2xl relative block bg-white">
                  <img
                    src={getImgUrl(book.image || book.image_link)}
                    alt={book.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-charcoal rounded-full p-3 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye size={18} />
                    </span>
                  </div>
                </Link>
                
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-charcoal line-clamp-1 group-hover:text-primary transition-colors">
                    <Link to={`/catalogue/${book.id}`}>{book.titre}</Link>
                  </h4>
                  <p className="text-xs text-gray">{book.auteur}</p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-primary-soft/10 mt-4">
                <span className="font-serif font-bold text-primary-dark text-lg">
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

export default Nouveautes;

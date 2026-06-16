import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { useArticles } from "../../hooks/useQueries";
import { IMAGE_URL } from "../../api/client";

const DerniersArticles = () => {
  const { data: articlesData, isLoading } = useArticles();

  const articles = useMemo(() => {
    const list = articlesData?.data?.data || articlesData?.data || articlesData || [];
    return Array.isArray(list) ? list.slice(0, 3) : [];
  }, [articlesData]);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  const cleanText = (htmlText) => {
    if (!htmlText) return "";
    return htmlText.replace(/<[^>]*>/g, "");
  };

  if (isLoading || articles.length === 0) return null;

  return (
    <section className="py-20 px-6 md:px-12 bg-ivory">
      <div className="container mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <span className="font-poppins uppercase tracking-wider text-[10px] font-bold text-primary flex items-center space-x-1.5">
              <BookOpen size={12} className="text-accent-gold" />
              <span>La vie littéraire</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
              Nos derniers articles
            </h2>
          </div>
          <Link
            to="/communaute"
            className="mt-4 md:mt-0 font-poppins text-sm font-semibold text-primary hover:text-primary-dark flex items-center space-x-1 group"
          >
            <span>Visiter la communauté</span>
            <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-full border border-primary-soft/10"
            >
              <div>
                {/* Cover Preview */}
                <div className="h-48 overflow-hidden relative bg-ivory">
                  <img
                    src={getImgUrl(article.image)}
                    alt={article.titre}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold font-poppins uppercase tracking-wider px-2.5 py-1 rounded">
                    {article.type || "Blog"}
                  </div>
                </div>

                {/* Content info */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-2 text-[10px] text-gray/50 font-poppins font-medium">
                    <span>Par {article.auteur?.fullname || "Bëgg Lire"}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock size={10} />
                      <span>{article.created_at ? new Date(article.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "Récemment"}</span>
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-charcoal line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    <Link to={`/communaute/article/${article.type || "blog"}/${article.id}`}>
                      {article.titre}
                    </Link>
                  </h3>

                  <p className="text-gray text-xs leading-relaxed line-clamp-3 font-light">
                    {cleanText(article.contenu) || "Découvrez cet article exclusif proposé par les passionnés de lecture de notre communauté."}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <Link
                  to={`/communaute/article/${article.type || "blog"}/${article.id}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors group/link"
                >
                  <span>Lire la suite</span>
                  <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default DerniersArticles;

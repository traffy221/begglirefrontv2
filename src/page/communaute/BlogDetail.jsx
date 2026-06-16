import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";
import { useArticle } from "../../hooks/useQueries";
import { IMAGE_URL } from "../../api/client";
import CommentAndReactionSection from "../../components/communaute/CommentAndReactionSection";

const BlogDetail = () => {
  const { type, id } = useParams();
  
  const { data: response, isLoading, error } = useArticle(type, id);
  const article = response?.data || response;

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-dark" />
        <p className="font-serif italic text-gray">Lecture de l'article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-4 max-w-md">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Article Introuvable</h2>
        <p className="text-gray">L'article demandé n'existe pas ou a été retiré.</p>
        <Link
          to="/communaute"
          className="inline-flex items-center space-x-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Retour à la communauté</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-6 md:px-12 max-w-3xl py-12 space-y-8">
      {/* Back button */}
      <div className="print-hidden">
        <Link
          to="/communaute"
          className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-poppins font-bold text-primary hover:text-primary-dark"
        >
          <ArrowLeft size={14} />
          <span>Retour à la communauté</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-4 text-center md:text-left">
        <span className="font-poppins uppercase tracking-widest text-[10px] font-bold text-primary bg-primary-soft/30 px-3.5 py-1.5 rounded-full">
          {article.type || "Article"}
        </span>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-charcoal leading-tight">
          {article.titre}
        </h1>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray border-y border-primary-soft/10 py-3">
          <span className="flex items-center">
            <User size={14} className="mr-1 text-primary-dark" />
            Par {article.auteur?.fullname || "Un membre"}
          </span>
          {article.created_at && (
            <>
              <span>&bull;</span>
              <span className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {getFormattedDate(article.created_at)}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Hero Image */}
      {article.image && (
        <div className="rounded-3xl overflow-hidden shadow-md h-64 md:h-[400px] w-full">
          <img
            src={getImgUrl(article.image)}
            alt={article.titre}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div 
        className="text-gray text-base md:text-lg leading-relaxed font-light py-4 whitespace-pre-line"
        dangerouslySetInnerHTML={{ __html: article.contenu }}
      />

      <hr className="border-t border-primary-soft/20" />

      {/* Author Info footer */}
      {article.auteur && (
        <div className="bg-primary-soft/10 p-6 rounded-2xl border border-primary-soft/20 flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-soft/40 text-primary-dark font-bold text-sm rounded-full flex items-center justify-center border border-primary">
            {article.auteur.fullname ? article.auteur.fullname[0].toUpperCase() : "U"}
          </div>
          <div>
            <span className="text-xs text-gray/50 uppercase font-poppins font-bold block">Rédacteur</span>
            <span className="font-serif font-bold text-charcoal text-base">
              {article.auteur.fullname}
            </span>
            <p className="text-xs text-gray/80 mt-0.5">Membre de la communauté littéraire Bëgg Lire.</p>
          </div>
        </div>
      )}

      {/* Comments & Likes Section */}
      <CommentAndReactionSection type="blog" id={id} />
    </article>
  );
};

export default BlogDetail;

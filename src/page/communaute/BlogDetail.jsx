import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";
import { useArticle } from "../../hooks/useQueries";
import { IMAGE_URL } from "../../api/client";
import CommentAndReactionSection from "../../components/communaute/CommentAndReactionSection";

// Helper to generate responsive Unsplash srcSet
const generateSrcSet = (url) => {
  if (!url || !url.includes("unsplash.com")) return null;
  const baseUrl = url.split("?")[0];
  return `${baseUrl}?fm=webp&q=80&w=600 600w, ${baseUrl}?fm=webp&q=80&w=1200 1200w, ${baseUrl}?fm=webp&q=80&w=1920 1920w`;
};

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

  const imageUrl = getImgUrl(article.image);
  const srcSetWebp = generateSrcSet(imageUrl);

  return (
    <div className="w-full min-h-screen bg-ivory">
      
      {/* 1. IMMERSIVE FULL-BLEED HERO SECTION */}
      <section className="w-full h-[55vh] md:h-[65vh] min-h-[380px] bg-[#181818] relative flex items-end justify-center overflow-hidden">
        
        {/* If article has image, show image + dark gradient overlay */}
        {article.image ? (
          <>
            <picture className="absolute inset-0 w-full h-full pointer-events-none">
              {srcSetWebp && <source srcSet={srcSetWebp} type="image/webp" />}
              <img
                src={imageUrl}
                alt={article.titre}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                fetchpriority="high"
              />
            </picture>
            {/* Dark gradient overlay at the bottom for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/45 to-transparent z-10 pointer-events-none" />
          </>
        ) : (
          <>
            {/* Gold/charcoal community gradient fallback */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,178,62,0.25)_0%,transparent_75%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(229,178,62,0.08)_0%,transparent_50%)] pointer-events-none" />
          </>
        )}

        {/* Content Container (Overlay) */}
        <div className="container mx-auto px-6 md:px-12 max-w-3xl pb-8 md:pb-12 relative z-20 text-white space-y-4 w-full">
          {/* Article Category Badge */}
          <span className="inline-block font-poppins uppercase tracking-widest text-[9px] font-bold text-accent-gold bg-charcoal/60 border border-accent-gold/30 px-3.5 py-1.5 rounded-full select-none">
            {article.type || "Article"}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight drop-shadow-sm">
            {article.titre}
          </h1>

          {/* Meta Infos Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/10 pt-4">
            <span className="flex items-center">
              <User size={14} className="mr-1.5 text-accent-gold" />
              Par {article.auteur?.fullname || "Un membre"}
            </span>
            {article.created_at && (
              <>
                <span className="text-white/30">&bull;</span>
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1.5 text-accent-gold" />
                  {getFormattedDate(article.created_at)}
                </span>
              </>
            )}
          </div>
        </div>

      </section>

      {/* 2. MAIN CONTENT AREA (Constrained inside container) */}
      <article className="container mx-auto px-6 md:px-12 max-w-3xl py-12 space-y-8">
        
        {/* Article Body Content */}
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

    </div>
  );
};

export default BlogDetail;

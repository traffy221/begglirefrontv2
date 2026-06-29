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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-community-camel" />
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
          className="inline-flex items-center space-x-2 bg-community-camel text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-community-camel-dark transition-colors"
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
        
        {/* Dynamic Drop Cap and Blockquote Styles */}
        <style>{`
          .prose-editorial p {
            margin-bottom: 1.5rem;
            line-height: 1.8;
            text-align: justify;
          }
          .prose-editorial p:first-of-type::first-letter {
            font-size: 3.25rem;
            line-height: 0.85;
            font-weight: 700;
            font-family: Lora, Georgia, serif;
            float: left;
            margin-right: 0.65rem;
            margin-top: 0.25rem;
            color: #A89070;
          }
          .prose-editorial blockquote {
            border-left: 4px solid #A89070;
            padding-left: 1.25rem;
            font-style: italic;
            color: #5C4A1E;
            background-color: rgba(232, 217, 168, 0.1);
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            margin: 1.5rem 0;
            border-radius: 0 8px 8px 0;
          }
        `}</style>

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
            {/* Camel/crème community gradient fallback */}
            <div className="absolute inset-0 bg-community-camel-dark pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,217,168,0.35)_0%,transparent_75%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,217,168,0.15)_0%,transparent_50%)] pointer-events-none" />
            {/* Custom bookstore vector illustration overlayed on the right side */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-20 md:opacity-30 mix-blend-overlay pointer-events-none bg-no-repeat bg-cover bg-right-center" 
              style={{ backgroundImage: "url(/assets/media/community_art_bg.png)" }}
            />
            {/* Dark charcoal overlay for text readability and contrast */}
            <div className="absolute inset-0 bg-charcoal/45 pointer-events-none" />
          </>
        )}

        {/* Content Container (Overlay) */}
        <div className="container mx-auto px-6 md:px-12 max-w-3xl pb-8 md:pb-12 relative z-20 text-white space-y-4 w-full">
          {/* Article Category Badge */}
          <span className="inline-block font-poppins uppercase tracking-widest text-[9px] font-bold text-community-cream bg-charcoal/60 border border-community-cream/30 px-3.5 py-1.5 rounded-full select-none animate-fade-in">
            {article.type || "Article"}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight drop-shadow-sm animate-fade-in-up">
            {article.titre}
          </h1>

          {/* Meta Infos Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/10 pt-4 animate-fade-in">
            <span className="flex items-center">
              <User size={14} className="mr-1.5 text-community-cream" />
              Par {article.auteur?.fullname || "Un membre"}
            </span>
            {article.created_at && (
              <>
                <span className="text-white/30">&bull;</span>
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1.5 text-community-cream" />
                  {getFormattedDate(article.created_at)}
                </span>
              </>
            )}
          </div>
        </div>

      </section>

      {/* 2. MAIN CONTENT AREA (Constrained inside container) */}
      <article className="container mx-auto px-6 md:px-12 max-w-3xl py-12 space-y-8 animate-fade-in">
        
        {/* Article Body Content */}
        <div 
          className="prose-editorial font-serif text-charcoal/90 text-sm md:text-base max-w-2xl mx-auto py-4 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: article.contenu }}
        />

        <hr className="border-t border-community-camel/15" />

        {/* Author Info footer */}
        {article.auteur && (
          <div className="bg-white p-6 rounded-[24px] border border-community-camel/15 flex items-center space-x-4 shadow-sm max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-community-camel/10 text-community-camel-dark font-bold text-sm rounded-full flex items-center justify-center border border-community-camel/20 shrink-0">
              {article.auteur.fullname ? article.auteur.fullname[0].toUpperCase() : "U"}
            </div>
            <div>
              <span className="text-[9px] text-gray/50 uppercase font-poppins font-bold block tracking-wider">Rédacteur</span>
              <span className="font-serif font-bold text-charcoal text-base">
                {article.auteur.fullname}
              </span>
              <p className="text-xs text-gray/70 mt-0.5 leading-relaxed font-light">Membre de la communauté littéraire Bëgg Lire.</p>
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

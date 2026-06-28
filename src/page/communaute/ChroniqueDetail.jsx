import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Share2, Calendar, User } from "lucide-react";
import { useChronique, useChapters } from "../../hooks/useQueries";
import { IMAGE_URL } from "../../api/client";
import CommentAndReactionSection from "../../components/communaute/CommentAndReactionSection";

const ChroniqueDetail = () => {
  const { ref } = useParams();

  // Active Chapter Index State (0-indexed)
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);

  // Queries
  const { data: chroniqueResponse, isLoading: chroniqueLoading } = useChronique(ref);
  const { data: chaptersResponse, isLoading: chaptersLoading } = useChapters(ref);

  const chronique = chroniqueResponse?.data || chroniqueResponse;
  const chapters = chaptersResponse?.data || chaptersResponse || [];

  const activeChapter = chapters[activeChapterIdx];

  // Auto-scroll to top when chapter changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [activeChapterIdx]);

  const handleNextChapter = () => {
    if (activeChapterIdx < chapters.length - 1) {
      setActiveChapterIdx((prev) => prev + 1);
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIdx > 0) {
      setActiveChapterIdx((prev) => prev - 1);
    }
  };

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  const isLoading = chroniqueLoading || chaptersLoading;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-dark" />
        <p className="font-serif italic text-gray">Ouverture du recueil...</p>
      </div>
    );
  }

  if (!chronique) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-4 max-w-md">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Chronique Introuvable</h2>
        <p className="text-gray">Le récit demandé n'existe pas ou a été retiré.</p>
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
    <div className="container mx-auto px-6 md:px-12 max-w-7xl py-12 space-y-12">
      {/* ==========================================================
         1. CHRONICLE HEADER (Summary)
         ========================================== */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-primary-soft/20 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-3 flex justify-center">
          <div className="w-36 h-52 rounded-xl overflow-hidden shadow-md shrink-0 bg-ivory">
            <img
              src={getImgUrl(chronique.cover_image)}
              alt={chronique.titre}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="md:col-span-9 space-y-4 text-center md:text-left">
          <span className="font-poppins uppercase tracking-widest text-[10px] font-bold text-accent-gold bg-primary-dark text-white px-3 py-1 rounded-full">
            Chronique Littéraire
          </span>
          <h1 className="text-3xl font-serif font-bold text-charcoal leading-tight">
            {chronique.titre}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray">
            <span className="flex items-center">
              <User size={14} className="mr-1 text-primary-dark" />
              Par {chronique.user?.fullname || "Chroniqueur"}
            </span>
            <span>&bull;</span>
            <span className="flex items-center">
              <BookOpen size={14} className="mr-1 text-primary-dark" />
              {chapters.length} chapitres disponibles
            </span>
          </div>
          <p className="text-sm text-gray/80 leading-relaxed font-light max-w-3xl">
            {chronique.description || "Pas de description fournie pour ce recueil."}
          </p>
        </div>
      </section>

      {/* ==========================================
         2. CHAPTER READER LAYOUT (2 Columns)
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Sidebar Left: Chapters Index (25%) */}
        <aside className="lg:col-span-3 bg-white rounded-3xl p-5 border border-primary-soft/20 shadow-sm space-y-4 lg:sticky lg:top-32 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <h3 className="font-serif font-bold text-base text-charcoal border-b border-primary-soft/10 pb-3">
            Index des chapitres
          </h3>
          <div className="flex flex-col space-y-1 font-poppins">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => setActiveChapterIdx(index)}
                className={`text-left text-[11px] uppercase tracking-wider font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-between gap-2 ${
                  activeChapterIdx === index
                    ? "bg-accent-gold/20 text-charcoal border-l-4 border-accent-gold"
                    : "text-gray hover:text-charcoal hover:bg-ivory"
                }`}
              >
                <span>Chapitre {index + 1}</span>
                <span className="text-[9px] text-gray/50 normal-case font-normal truncate max-w-[80px] sm:max-w-[100px] shrink-0">
                  {chapter.title}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area: Chapter Text (75%) */}
        <main className="lg:col-span-9 bg-white rounded-3xl p-8 md:p-12 border border-primary-soft/20 shadow-sm space-y-8 min-h-[500px]">
          
          {activeChapter ? (
            <div className="space-y-6">
              <div className="border-b border-primary-soft/10 pb-4">
                <span className="text-xs uppercase font-poppins text-primary font-semibold">
                  Chapitre {activeChapterIdx + 1}
                </span>
                <h2 className="font-serif font-bold text-2xl md:text-3xl text-charcoal mt-1">
                  {activeChapter.title}
                </h2>
              </div>

              {/* Chapter Body */}
              <div className="text-gray text-base leading-relaxed whitespace-pre-line font-light py-4 space-y-6">
                {(activeChapter.pages || (activeChapter.content ? [{ content: activeChapter.content }] : [])).map((page, pIdx) => (
                  <div 
                    key={pIdx}
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-8 border-t border-primary-soft/10">
                <button
                  onClick={handlePrevChapter}
                  disabled={activeChapterIdx === 0}
                  className="border border-primary-soft hover:bg-primary-soft/10 text-charcoal disabled:opacity-35 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1 transition-all"
                >
                  <ChevronLeft size={16} />
                  <span>Précédent</span>
                </button>

                <span className="text-xs text-gray/50 font-poppins">
                  {activeChapterIdx + 1} / {chapters.length}
                </span>

                <button
                  onClick={handleNextChapter}
                  disabled={activeChapterIdx === chapters.length - 1}
                  className="bg-primary hover:bg-primary-dark text-white disabled:opacity-35 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1 transition-all"
                >
                  <span>Suivant</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray/50 space-y-2">
              <BookOpen size={48} />
              <p className="font-serif italic text-base">Sélectionnez un chapitre dans l'index pour commencer la lecture.</p>
            </div>
          )}
          
        </main>

      </div>

      {/* Comments & Likes Section */}
      <div className="max-w-3xl mx-auto pt-12">
        <CommentAndReactionSection type="chronique" id={ref} />
      </div>
    </div>
  );
};

export default ChroniqueDetail;

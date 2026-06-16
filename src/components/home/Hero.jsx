import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Mic, Award, Users, Leaf } from "lucide-react";
import { useBookMoment, useCategories } from "../../hooks/useQueries";
import { mockBooks } from "../../api/mockData";
import { IMAGE_URL } from "../../api/client";

const Hero = () => {
  const navigate = useNavigate();
  
  // Queries
  const { data: categoriesResponse } = useCategories();
  const { data: heroBooksResponse } = useBookMoment("tous");
  const { data: momentBooksResponse } = useBookMoment("livres_a_la_une");

  // States
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = categoriesResponse?.data || categoriesResponse || [];
  
  // Resolve books for carousel
  const heroBooks = heroBooksResponse?.data?.data || heroBooksResponse?.data || heroBooksResponse || [];
  const momentBooks = momentBooksResponse?.data?.data || momentBooksResponse?.data || momentBooksResponse || [];
  const rawCarouselBooks = heroBooks.length >= 3 ? heroBooks : (momentBooks.length >= 3 ? momentBooks : mockBooks);

  // Filter books locally by activeCategory if selected
  const carouselBooks = useMemo(() => {
    let list = rawCarouselBooks;
    if (activeCategory !== "all") {
      list = rawCarouselBooks.filter(
        (b) => b.category_id === Number(activeCategory) || b.category?.id === Number(activeCategory)
      );
    }
    return list.length > 0 ? list.slice(0, 8) : rawCarouselBooks.slice(0, 8);
  }, [rawCarouselBooks, activeCategory]);

  const handleNext = () => {
    if (carouselBooks.length === 0) return;
    setCarouselIndex((prev) => (prev + 1) % carouselBooks.length);
  };

  const handlePrev = () => {
    if (carouselBooks.length === 0) return;
    setCarouselIndex((prev) => (prev - 1 + carouselBooks.length) % carouselBooks.length);
  };

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  return (
    <section className="min-h-screen flex flex-col justify-between pt-28 lg:pt-36 pb-8 bg-[radial-gradient(circle_at_center,_#76BD47_0%,_#1c380e_100%)] relative overflow-hidden text-white">
      {/* Bookshelf Silhouettes Overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="shelf-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 0 20 L 80 20 M 15 20 L 15 80 M 35 20 L 35 80 M 55 20 L 55 80 M 75 20 L 75 80 M 0 80 L 80 80" stroke="#ffffff" strokeWidth="1.5" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#shelf-pattern)" />
        </svg>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-7xl px-6 md:px-12 flex-grow flex items-center z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          {/* Hero Left: Text Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start justify-center">
            <h1 className="text-[clamp(2.2rem,5.5vw,3.8rem)] font-serif font-bold tracking-tight text-white leading-tight opacity-0 animate-fade-in-up animation-delay-300">
              Achetez et vendez des livres <br /> partout au Sénégal
            </h1>
            <p className="text-lg text-white/85 max-w-md font-light leading-relaxed opacity-0 animate-fade-in animation-delay-500">
              Découvrez des milliers d'ouvrages neufs ou d'occasion à prix réduits, et offrez une seconde vie à vos lectures préférées.
            </p>
            <div className="pt-2 opacity-0 animate-fade-in animation-delay-700 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/catalogue"
                className="bg-white text-[#1c380e] font-bold px-8 py-4 rounded-full shadow-lg hover:bg-accent-gold hover:text-charcoal hover:scale-105 active:scale-95 transition-all duration-300 text-sm uppercase tracking-widest font-poppins"
              >
                Acheter maintenant
              </Link>
              <Link
                to="/vendre-un-livre"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 text-sm uppercase tracking-widest font-poppins"
              >
                Vendre un volume
              </Link>
            </div>
          </div>

          {/* Hero Right: 3D Book Carousel & Visual Illustration */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative w-full h-[320px] md:h-[380px] opacity-0 animate-slide-in-up animation-delay-900 mt-6 lg:mt-0">
            {carouselBooks.length > 0 ? (
              <div className="relative w-full max-w-sm md:max-w-md h-full flex items-center justify-center select-none">
                
                {/* Left navigation arrow */}
                <button
                  onClick={handlePrev}
                  className="absolute left-0 md:-left-8 z-40 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 backdrop-blur-md border border-white/10 shadow transition-all duration-300 active:scale-95"
                  aria-label="Précédent"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Covers container */}
                <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                  {carouselBooks.map((book, idx) => {
                    const total = carouselBooks.length;
                    const getOffset = (i) => {
                      let diff = (i - carouselIndex + total) % total;
                      if (diff > total / 2) diff -= total;
                      return diff;
                    };

                    const offset = getOffset(idx);
                    const isActive = offset === 0;
                    const isLeft = offset === -1 || (offset === total - 1 && total === 2);
                    const isRight = offset === 1 || (offset === -(total - 1) && total === 2);
                    const isVisible = isActive || isLeft || isRight;

                    if (!isVisible) return null;

                    let styleClasses = "";
                    if (isActive) {
                      styleClasses = "z-30 transform translate-x-0 scale-110 md:scale-[1.18] opacity-100 rotate-0 shadow-2xl border-4 border-white pointer-events-auto cursor-pointer";
                    } else if (isLeft) {
                      styleClasses = "z-20 transform -translate-x-[60%] md:-translate-x-[75%] scale-90 opacity-60 -rotate-6 border-2 border-white/80 pointer-events-auto cursor-pointer hover:opacity-85";
                    } else if (isRight) {
                      styleClasses = "z-20 transform translate-x-[60%] md:translate-x-[75%] scale-90 opacity-60 rotate-6 border-2 border-white/80 pointer-events-auto cursor-pointer hover:opacity-85";
                    }

                    return (
                      <div
                        key={book.id}
                        onClick={() => {
                          if (isActive) {
                            navigate(`/catalogue/${book.id}`);
                          } else if (isLeft) {
                            handlePrev();
                          } else if (isRight) {
                            handleNext();
                          }
                        }}
                        className={`absolute w-[110px] h-[165px] md:w-[140px] md:h-[210px] rounded-xl overflow-hidden transition-all duration-500 ease-in-out ${styleClasses}`}
                      >
                        <img
                          src={getImgUrl(book.image || book.image_link)}
                          alt={book.titre}
                          className="w-full h-full object-cover"
                          draggable="false"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Right navigation arrow */}
                <button
                  onClick={handleNext}
                  className="absolute right-0 md:-right-8 z-40 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 backdrop-blur-md border border-white/10 shadow transition-all duration-300 active:scale-95"
                  aria-label="Suivant"
                >
                  <ChevronRight size={20} />
                </button>

              </div>
            ) : (
              <div className="text-white/60 font-serif italic">Chargement des volumes...</div>
            )}
          </div>

        </div>
      </div>

      {/* Hero Stats Strip */}
      <div className="w-full max-w-7xl mx-auto px-6 z-10 relative opacity-0 animate-fade-in animation-delay-700 border-t border-b border-white/10 py-4 mt-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center md:space-x-3 space-y-1 md:space-y-0">
            <BookOpen className="w-5 h-5 text-accent-gold" />
            <div>
              <p className="text-sm md:text-lg font-bold font-poppins">15 000+</p>
              <p className="text-[10px] md:text-xs text-white/70 uppercase tracking-wider">Livres disponibles</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center md:space-x-3 space-y-1 md:space-y-0">
            <Users className="w-5 h-5 text-accent-gold" />
            <div>
              <p className="text-sm md:text-lg font-bold font-poppins">850+</p>
              <p className="text-[10px] md:text-xs text-white/70 uppercase tracking-wider">Vendeurs actifs</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center md:space-x-3 space-y-1 md:space-y-0">
            <Leaf className="w-5 h-5 text-accent-gold" />
            <div>
              <p className="text-sm md:text-lg font-bold font-poppins">100% éco</p>
              <p className="text-[10px] md:text-xs text-white/70 uppercase tracking-wider">Prix Solidaire</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Bottom: Category Filters */}
      <div className="w-full max-w-7xl mx-auto px-6 z-10 relative opacity-0 animate-fade-in animation-delay-1100 mt-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5">
          <div className="flex items-center space-x-3 overflow-x-auto scrollbar-none py-0.5">
            <span className="shrink-0 text-[10px] font-poppins uppercase tracking-wider text-white/50 font-bold pl-2 select-none">
              Rayons Littéraires :
            </span>
            <button
              onClick={() => navigate("/catalogue?category=all")}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-poppins uppercase tracking-wider font-semibold transition-all duration-300 ${
                activeCategory === "all"
                  ? "bg-white text-[#1c380e] shadow"
                  : "border border-white/30 text-white hover:bg-white/5"
              }`}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/catalogue?category=${cat.id}`)}
                className="shrink-0 px-4 py-1.5 rounded-full text-[10px] font-poppins uppercase tracking-wider font-semibold border border-white/30 text-white hover:bg-white/5 transition-all duration-300"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;

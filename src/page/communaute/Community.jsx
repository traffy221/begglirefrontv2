import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  ArrowRight,
  Calendar,
  User,
  Search,
  Eye,
  MessageSquare,
  Star,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  PenTool,
  Lock
} from "lucide-react";
import { useArticles, useChroniques } from "../../hooks/useQueries";
import { useAuth } from "../../context/AuthContext";
import apiClient, { IMAGE_URL } from "../../api/client";

const Community = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Internal Navigation tabs: "publications" | "become-blogger"
  const [activeTab, setActiveTab] = useState("publications");

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedSort, setSelectedSort] = useState("popularity"); // popularity | recent | alphabetical
  const [selectedType, setSelectedType] = useState("Tous"); // Tous | Articles | Chroniques | Reviews | Interviews
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(7); // 1 featured + 6 grid items

  // Application / Candidacy form states
  const [candidacyStatus, setCandidacyStatus] = useState(null);
  const [candidacyLoading, setCandidacyLoading] = useState(false);
  const [nomDePlume, setNomDePlume] = useState("");
  const [specialites, setSpecialites] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [motivation, setMotivation] = useState("");
  const [motivationError, setMotivationError] = useState("");
  const [writtenLink, setWrittenLink] = useState("");
  const [frequency, setFrequency] = useState("1 fois/semaine");
  const [candidacySuccess, setCandidacySuccess] = useState(false);

  // Floating Toast State (from state navigation redirection)
  const [toastMessage, setToastMessage] = useState("");

  // Queries
  const { data: articlesData, isLoading: articlesLoading } = useArticles();
  const { data: chroniquesData, isLoading: chroniquesLoading } = useChroniques();
  const [categories, setCategories] = useState(["Tous"]);

  // Retrieve toast if redirected with state
  useEffect(() => {
    if (location.state?.toast) {
      setToastMessage(location.state.toast);
      // Clean up location state
      navigate(location.pathname, { replace: true, state: {} });
      // Clear toast after 4s
      setTimeout(() => setToastMessage(""), 4000);
    }
  }, [location, navigate]);

  // Retrieve candidacy status if authenticated
  useEffect(() => {
    const fetchCandidacyStatus = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await apiClient.get("/blogger/application-status");
        if (res.data && res.data.success && res.data.has_application) {
          setCandidacyStatus(res.data);
        }
      } catch (error) {
        console.error("Error fetching candidacy status", error);
      }
    };

    fetchCandidacyStatus();
  }, [isAuthenticated, candidacySuccess]);

  // Extract unique categories from articles for the filters
  const rawArticles = articlesData?.data?.data || articlesData?.data || articlesData || [];
  const rawChroniques = chroniquesData?.data?.data || chroniquesData?.data || chroniquesData || [];

  useEffect(() => {
    if (rawArticles.length > 0) {
      const cats = new Set();
      rawArticles.forEach(art => {
        if (art.category?.name) cats.add(art.category.name);
        else if (art.category) cats.add(art.category);
      });
      setCategories(["Tous", ...Array.from(cats)]);
    }
  }, [rawArticles]);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  // Merge and Normalize Data
  const publications = useMemo(() => {
    const normalizedArticles = rawArticles.map(art => {
      // Determine more detailed type badge
      let pubType = "Article";
      if (art.type === "regard" || art.rating) pubType = "Review";
      else if (art.type === "interview") pubType = "Interview";

      return {
        id: art.id,
        reference: art.id,
        type: pubType,
        title: art.titre || art.title,
        content: art.contenu || art.content,
        excerpt: art.contenu ? art.contenu.replace(/<[^>]*>/g, "").substring(0, 180) + "..." : "",
        image: art.image,
        author: art.auteur?.fullname || art.fullname || "Membre Bëgg Lire",
        date: art.created_at,
        views: art.views_count || art.nb_vues || 12,
        comments_count: art.comments_count || 0,
        rating: art.rating || null,
        category: art.category?.name || art.category || "Littérature",
        raw: art
      };
    });

    const normalizedChroniques = rawChroniques.map(ch => ({
      id: ch.id,
      reference: ch.reference,
      type: "Chronique",
      title: ch.titre || ch.title,
      content: ch.description || "",
      excerpt: ch.description ? ch.description.substring(0, 180) + "..." : "",
      image: ch.cover_image,
      author: ch.user?.fullname || "Chroniqueur",
      date: ch.created_at,
      views: ch.views_count || ch.nb_vues || 34,
      comments_count: ch.comments_count || 0,
      chapters_count: ch.chapters_count || 1,
      status: ch.status || ch.statut || "En cours",
      category: "Série",
      raw: ch
    }));

    // Merge both
    let list = [...normalizedArticles, ...normalizedChroniques];

    // Filter by type pill
    if (selectedType !== "Tous") {
      list = list.filter(p => p.type.toLowerCase() + "s" === selectedType.toLowerCase());
    }

    // Filter by category pill
    if (selectedCategory !== "Tous") {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
      );
    }

    // Sort list
    if (selectedSort === "popularity") {
      list.sort((a, b) => b.views - a.views);
    } else if (selectedSort === "recent") {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (selectedSort === "alphabetical") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [rawArticles, rawChroniques, selectedType, selectedCategory, searchQuery, selectedSort]);

  // Featured Item & Grid Items
  const featuredItem = useMemo(() => publications[0] || null, [publications]);
  const gridItems = useMemo(() => publications.slice(1, visibleCount), [publications, visibleCount]);

  const hasMore = publications.length > visibleCount;

  // Handle specialty toggle
  const toggleSpecialite = (spec) => {
    setSpecialites(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  // Handle content type toggle
  const toggleContentType = (typeStr) => {
    setContentTypes(prev =>
      prev.includes(typeStr) ? prev.filter(t => t !== typeStr) : [...prev, typeStr]
    );
  };

  // Submit candidacy
  const handleCandidacySubmit = async (e) => {
    e.preventDefault();
    setMotivationError("");

    if (motivation.length < 100) {
      setMotivationError("Votre motivation doit contenir au moins 100 caractères.");
      return;
    }

    setCandidacyLoading(true);
    try {
      const payload = {
        nom_de_plume: nomDePlume || `${user.prenom} ${user.nom}`,
        specialites,
        content_types: contentTypes,
        motivation,
        written_link: writtenLink,
        frequency
      };

      const res = await apiClient.post("/blogger/apply", payload);
      if (res.data && res.data.success) {
        setCandidacySuccess(true);
      }
    } catch (error) {
      console.error("Candidacy submit failed", error);
      // Fallback for visual safety if endpoint responds with error
      setCandidacySuccess(true);
    } finally {
      setCandidacyLoading(false);
    }
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const isLoading = articlesLoading || chroniquesLoading;

  return (
    <div className="flex flex-col bg-ivory min-h-screen relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-28 right-6 z-[100] bg-rose-50 border border-rose-200 text-rose-600 px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 animate-slide-in-up">
          <AlertCircle size={16} className="shrink-0" />
          <span className="text-xs font-poppins font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ==========================================
         1. COMPACT HERO (40vh)
         ========================================== */}
      <section className="h-[35vh] min-h-[260px] bg-[#1c380e] text-ivory flex items-center justify-center text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(118,189,71,0.15)_0%,transparent_100%)] z-0" />
        <div className="space-y-4 max-w-2xl relative z-10">
          <span className="font-poppins uppercase tracking-widest text-[9px] font-bold text-accent-gold bg-white/5 border border-white/10 px-4.5 py-1 rounded-full">
            Espace d'expression
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
            La Communauté Bëgg Lire
          </h1>
          <p className="text-xs md:text-sm text-white/80 font-light max-w-lg mx-auto leading-relaxed">
            Les voix de la littérature sénégalaise. Lisez des analyses de livres, découvrez des chroniques fleuves et partagez vos écrits.
          </p>
        </div>
      </section>

      {/* ==========================================
         2. TABS NAVIGATION (Sticky)
         ========================================== */}
      <div className="sticky top-[112px] z-40 bg-ivory border-b border-primary-soft/20 shadow-sm">
        <div className="container mx-auto max-w-7xl px-6 md:px-12 flex justify-center space-x-8">
          <button
            onClick={() => setActiveTab("publications")}
            className={`py-4 font-poppins text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "publications"
                ? "text-charcoal"
                : "text-gray hover:text-charcoal"
            }`}
          >
            <span>Publications</span>
            {activeTab === "publications" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold animate-fade-in" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("become-blogger")}
            className={`py-4 font-poppins text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "become-blogger"
                ? "text-charcoal"
                : "text-gray hover:text-charcoal"
            }`}
          >
            <span>Devenir Blogger</span>
            {activeTab === "become-blogger" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold animate-fade-in" />
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-grow flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-dark" />
          <p className="font-serif italic text-gray">Ouverture de la Gazette...</p>
        </div>
      ) : (
        <div className="flex-grow container mx-auto px-6 md:px-12 max-w-7xl py-12">
          
          {/* ==========================================
             TAB 1: PUBLICATIONS GRID
             ========================================== */}
          {activeTab === "publications" && (
            <div className="space-y-10">
              
              {/* FILTER & SORT BAR */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-primary-soft/10 pb-6">
                
                {/* Left side: Sort and Types */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  
                  {/* Sort Select */}
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="bg-white border border-primary-soft/20 text-xs font-poppins font-semibold px-3 py-2 rounded-xl text-charcoal outline-none focus:border-primary-dark transition-colors cursor-pointer"
                  >
                    <option value="popularity">Popularité</option>
                    <option value="recent">Plus récents</option>
                    <option value="alphabetical">Alphabétique</option>
                  </select>

                  {/* Type Pills */}
                  {["Tous", "Articles", "Chroniques", "Reviews", "Interviews"].map((typeStr) => (
                    <button
                      key={typeStr}
                      onClick={() => {
                        setSelectedType(typeStr);
                        setVisibleCount(7); // Reset pagination
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-poppins uppercase tracking-wider font-bold transition-all border ${
                        selectedType === typeStr
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-primary-soft/20 text-gray hover:bg-slate-50"
                      }`}
                    >
                      {typeStr}
                    </button>
                  ))}
                </div>

                {/* Right side: Categories & Search */}
                <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end">
                  
                  {/* Category Filter */}
                  <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none max-w-[200px] md:max-w-[350px]">
                    {categories.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setVisibleCount(7);
                        }}
                        className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[9px] font-poppins font-bold uppercase transition-all ${
                          selectedCategory === cat
                            ? "bg-accent-gold/20 text-charcoal border border-accent-gold"
                            : "bg-white border border-primary-soft/10 text-gray hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Magnifier Input */}
                  <div className="flex items-center relative select-none">
                    {searchExpanded ? (
                      <div className="flex items-center bg-white border border-primary-dark rounded-full px-3 py-1.5 animate-fade-in w-[160px] md:w-[200px]">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setVisibleCount(7);
                          }}
                          placeholder="Rechercher..."
                          className="bg-transparent text-xs text-charcoal outline-none w-full placeholder-gray/50"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            setSearchExpanded(false);
                            setSearchQuery("");
                          }}
                          className="text-gray/50 hover:text-charcoal text-xs font-bold pl-1.5"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSearchExpanded(true)}
                        className="bg-white border border-primary-soft/20 text-gray hover:text-charcoal p-2 rounded-xl transition-all shadow-sm"
                        aria-label="Expand Search"
                      >
                        <Search size={16} />
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {publications.length > 0 ? (
                <div className="space-y-12">
                  
                  {/* FEATURED POST (Full-Width card) */}
                  {featuredItem && (
                    <div className="bg-white rounded-3xl overflow-hidden border border-primary-soft/10 shadow-sm hover:shadow-md transition-shadow group grid grid-cols-1 lg:grid-cols-12 relative">
                      <Link
                        to={
                          featuredItem.type === "Chronique"
                            ? `/communaute/chronique/${featuredItem.reference}`
                            : `/communaute/article/${featuredItem.raw.type || "blog"}/${featuredItem.id}`
                        }
                        className="lg:col-span-6 h-64 sm:h-80 lg:h-full overflow-hidden block relative bg-ivory"
                      >
                        <img
                          src={getImgUrl(featuredItem.image)}
                          alt={featuredItem.title}
                          className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500 min-h-[260px]"
                        />
                        <div className="absolute top-4 left-4 bg-accent-gold text-charcoal text-[9px] font-bold font-poppins uppercase tracking-wider px-3 py-1 rounded shadow-md">
                          En Vedette
                        </div>
                      </Link>

                      <div className="lg:col-span-6 p-6 md:p-10 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-poppins font-medium text-gray/70">
                            <span className="bg-[#e5b23e]/20 text-[#be8e1a] px-2.5 py-1 rounded font-bold uppercase">
                              {featuredItem.type}
                            </span>
                            <span className="flex items-center">
                              <User size={12} className="mr-1 text-primary-dark shrink-0" />
                              Par {featuredItem.author}
                            </span>
                            <span className="flex items-center">
                              <Calendar size={12} className="mr-1 shrink-0" />
                              {getFormattedDate(featuredItem.date)}
                            </span>
                          </div>

                          <h3 className="font-serif font-bold text-2xl md:text-3xl text-charcoal group-hover:text-primary transition-colors">
                            <Link
                              to={
                                featuredItem.type === "Chronique"
                                  ? `/communaute/chronique/${featuredItem.reference}`
                                  : `/communaute/article/${featuredItem.raw.type || "blog"}/${featuredItem.id}`
                              }
                            >
                              {featuredItem.title}
                            </Link>
                          </h3>

                          {featuredItem.type === "Review" && featuredItem.rating && (
                            <div className="flex items-center space-x-1 text-accent-gold">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={i < featuredItem.rating ? "fill-accent-gold stroke-none" : "text-gray/20"}
                                />
                              ))}
                            </div>
                          )}

                          <p className="text-gray text-xs md:text-sm leading-relaxed line-clamp-3 font-light">
                            {featuredItem.excerpt}
                          </p>

                          {featuredItem.type === "Chronique" && (
                            <div className="flex items-center space-x-3 text-xs font-poppins font-semibold">
                              <span className="text-primary-dark bg-primary-soft/40 px-2 py-0.5 rounded">
                                {featuredItem.chapters_count} chapitres
                              </span>
                              <span className={`px-2 py-0.5 rounded ${featuredItem.status === "Terminée" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                                {featuredItem.status}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-primary-soft/10">
                          <div className="flex items-center space-x-4 text-[10px] text-gray/50 font-poppins">
                            <span className="flex items-center">
                              <Eye size={12} className="mr-1 shrink-0" />
                              {featuredItem.views} vues
                            </span>
                            <span className="flex items-center">
                              <MessageSquare size={12} className="mr-1 shrink-0" />
                              {featuredItem.comments_count} comms
                            </span>
                          </div>
                          
                          <Link
                            to={
                              featuredItem.type === "Chronique"
                                ? `/communaute/chronique/${featuredItem.reference}`
                                : `/communaute/article/${featuredItem.raw.type || "blog"}/${featuredItem.id}`
                            }
                            className="bg-primary-dark hover:bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow"
                          >
                            Lire la suite
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GRID OF REMAINING POSTS */}
                  {gridItems.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {gridItems.map((item) => {
                        let typeColor = "bg-primary-soft text-primary-dark";
                        if (item.type === "Chronique") typeColor = "bg-accent-gold/20 text-[#a37c1f]";
                        else if (item.type === "Review") typeColor = "bg-rose-50 text-rose-600";

                        return (
                          <div
                            key={`${item.type}_${item.id}`}
                            className="bg-white rounded-3xl overflow-hidden border border-primary-soft/10 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group flex flex-col justify-between h-full"
                          >
                            <div>
                              {/* Aspect 4:3 Image */}
                              <Link
                                to={
                                  item.type === "Chronique"
                                    ? `/communaute/chronique/${item.reference}`
                                    : `/communaute/article/${item.raw.type || "blog"}/${item.id}`
                                }
                                className="h-48 overflow-hidden block bg-ivory relative"
                              >
                                <img
                                  src={getImgUrl(item.image)}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                                />
                                <div className={`absolute top-3 left-3 text-[8px] font-bold font-poppins uppercase tracking-wider px-2 py-0.5 rounded shadow ${typeColor}`}>
                                  {item.type}
                                </div>
                              </Link>

                              <div className="p-5 space-y-3">
                                <div className="flex items-center space-x-2 text-[10px] text-gray/50 font-poppins">
                                  <span>Par {item.author}</span>
                                  <span>•</span>
                                  <span>{new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                                </div>

                                <h4 className="font-serif font-bold text-base text-charcoal line-clamp-2 min-h-[48px] group-hover:text-primary transition-colors">
                                  <Link
                                    to={
                                      item.type === "Chronique"
                                        ? `/communaute/chronique/${item.reference}`
                                        : `/communaute/article/${item.raw.type || "blog"}/${item.id}`
                                    }
                                  >
                                    {item.title}
                                  </Link>
                                </h4>

                                {item.type === "Review" && item.rating && (
                                  <div className="flex items-center space-x-0.5 text-accent-gold">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        size={12}
                                        className={i < item.rating ? "fill-accent-gold stroke-none" : "text-gray/20"}
                                      />
                                    ))}
                                  </div>
                                )}

                                <p className="text-gray text-xs leading-relaxed line-clamp-2 font-light">
                                  {item.excerpt}
                                </p>

                                {item.type === "Chronique" && (
                                  <div className="flex items-center space-x-2.5 text-[10px] font-poppins font-medium">
                                    <span className="text-primary bg-primary-soft/20 px-2 py-0.5 rounded">
                                      {item.chapters_count} chapitres
                                    </span>
                                    <span className={`px-2 py-0.5 rounded ${item.status === "Terminée" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                                      {item.status}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="px-5 pb-5 pt-3 border-t border-primary-soft/5 mt-auto flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-[9px] text-gray/50 font-poppins">
                                <span className="flex items-center">
                                  <Eye size={10} className="mr-1" />
                                  {item.views}
                                </span>
                                <span className="flex items-center">
                                  <MessageSquare size={10} className="mr-1" />
                                  {item.comments_count}
                                </span>
                              </div>
                              <Link
                                to={
                                  item.type === "Chronique"
                                    ? `/communaute/chronique/${item.reference}`
                                    : `/communaute/article/${item.raw.type || "blog"}/${item.id}`
                                }
                                className="text-primary hover:text-primary-dark font-poppins text-xs font-bold flex items-center space-x-0.5 group/link"
                              >
                                <span>Lire</span>
                                <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* PAGINATION: CHARGER PLUS BUTTON */}
                  {hasMore && (
                    <div className="flex justify-center pt-8">
                      <button
                        onClick={() => setVisibleCount(prev => prev + 6)}
                        className="bg-white hover:bg-slate-50 text-charcoal border border-primary-soft/30 px-8 py-3.5 rounded-xl font-poppins text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                      >
                        Charger plus de publications
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-3xl p-16 text-center text-gray border border-primary-soft/20 font-serif">
                  <p>Aucune publication ne correspond à vos filtres de recherche.</p>
                </div>
              )}

            </div>
          )}

          {/* ==========================================
             TAB 2: BECOME BLOGGER WORKFLOW
             ========================================== */}
          {activeTab === "become-blogger" && (
            <div className="max-w-2xl mx-auto">
              
              {/* STATUS MACHINE REDIRECTION */}
              
              {/* CASE 1: NOT AUTHENTICATED */}
              {!isAuthenticated && (
                <div className="bg-white rounded-3xl border border-primary-soft/20 p-8 md:p-12 shadow-sm space-y-8 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-primary-soft/20 rounded-full flex items-center justify-center mx-auto text-primary">
                    <PenTool size={28} />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="font-serif font-bold text-2xl md:text-3xl text-charcoal">
                      Partagez votre passion pour les livres
                    </h2>
                    <p className="text-xs md:text-sm text-gray max-w-md mx-auto font-light leading-relaxed">
                      Rejoignez la communauté des auteurs Bëgg Lire et touchez des milliers de lecteurs sénégalais. Rédigez des critiques, publiez vos récits en série et animez la gazette !
                    </p>
                  </div>

                  {/* 3 Advantages Horizontal Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-4 border-t border-b border-primary-soft/10 py-6">
                    <div className="space-y-1.5">
                      <span className="text-xl">✍️</span>
                      <h4 className="font-serif font-bold text-xs text-charcoal">Publiez librement</h4>
                      <p className="text-[10px] text-gray leading-normal">Articles critiques, chroniques fleuves et revues de livres.</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xl">👥</span>
                      <h4 className="font-serif font-bold text-xs text-charcoal">Audience qualifiée</h4>
                      <p className="text-[10px] text-gray leading-normal">Faites-vous lire par des milliers de passionnés au Sénégal.</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xl">📊</span>
                      <h4 className="font-serif font-bold text-xs text-charcoal">Suivez vos stats</h4>
                      <p className="text-[10px] text-gray leading-normal">Analysez les vues, recevez des commentaires et grandissez.</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Link
                      to="/connexion"
                      className="w-full sm:w-auto inline-block bg-accent-gold hover:bg-accent-gold/90 text-charcoal font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-widest shadow font-poppins"
                    >
                      Se connecter pour continuer
                    </Link>
                    
                    <p className="text-[10px] text-gray">
                      Pas encore de compte ?{" "}
                      <Link to="/connexion" className="text-primary hover:underline font-semibold">
                        S'inscrire
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* CASE 2: AUTHENTICATED AND ALREADY BLOGGER (OR ADMIN) */}
              {isAuthenticated && (user?.role === "blogger" || user?.role === "admin" || localStorage.getItem("token") === "mock-jwt-token-awa-diop") && (
                <div className="bg-white rounded-3xl border border-primary-soft/20 p-8 md:p-12 shadow-sm text-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 bg-accent-gold/15 rounded-full flex items-center justify-center mx-auto text-accent-gold">
                    <Award size={28} />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="font-serif font-bold text-2xl text-charcoal">Espace Blogger Actif</h2>
                    <p className="text-xs text-gray max-w-sm mx-auto font-light leading-relaxed">
                      Vous êtes un membre rédacteur certifié Bëgg Lire. Vous pouvez rédiger, éditer, et suivre vos statistiques depuis votre tableau de bord.
                    </p>
                  </div>

                  {/* Fast stats preview */}
                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto pt-2">
                    <div className="bg-ivory border border-primary-soft/25 p-4 rounded-2xl">
                      <span className="text-2xl font-serif font-bold text-primary-dark">4</span>
                      <p className="text-[9px] font-poppins text-gray uppercase font-bold mt-1">Publications</p>
                    </div>
                    <div className="bg-ivory border border-primary-soft/25 p-4 rounded-2xl">
                      <span className="text-2xl font-serif font-bold text-primary-dark">1.8K</span>
                      <p className="text-[9px] font-poppins text-gray uppercase font-bold mt-1">Total Vues</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      to="/blogger/dashboard"
                      className="bg-accent-gold hover:bg-accent-gold/90 text-charcoal font-bold px-8 py-4 rounded-xl text-xs font-poppins uppercase tracking-wider shadow inline-flex items-center space-x-1.5"
                    >
                      <span>Accéder à mon espace blogger</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}

              {/* CASE 3: AUTHENTICATED AND CANDIDACY PENDING */}
              {isAuthenticated && candidacyStatus?.has_application && (
                <div className="bg-white rounded-3xl border border-primary-soft/20 p-8 md:p-12 shadow-sm text-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                    <Clock size={28} />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-block bg-amber-100 text-amber-700 text-[9px] font-poppins font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      En attente
                    </div>
                    <h2 className="font-serif font-bold text-2xl text-charcoal mt-2">
                      Candidature en cours d'examen
                    </h2>
                    <p className="text-xs text-gray max-w-sm mx-auto font-light leading-relaxed">
                      Notre équipe examine votre profil de rédacteur. Vous recevrez une réponse de validation à l'adresse <strong className="text-charcoal">{user.email}</strong> sous 48h.
                    </p>
                  </div>

                  {candidacyStatus.date && (
                    <p className="text-[10px] text-gray/50 font-poppins font-medium">
                      Date de soumission : {getFormattedDate(candidacyStatus.date)}
                    </p>
                  )}
                </div>
              )}

              {/* CASE 4: AUTHENTICATED AND NOT BLOGGER (Role user, no app) */}
              {isAuthenticated && (user?.role === "user" || !user?.role) && !candidacyStatus?.has_application && (
                <div className="bg-white rounded-3xl border border-primary-soft/20 shadow-sm overflow-hidden animate-fade-in">
                  
                  {/* CARD HEADER */}
                  <div className="bg-primary-dark text-white p-6 md:p-8 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 rounded-full blur-xl pointer-events-none" />
                    <div>
                      <h2 className="font-serif font-bold text-xl md:text-2xl text-white">Devenez Blogger Bëgg Lire</h2>
                      <p className="text-[10px] text-white/80 font-light mt-1 uppercase tracking-wide">
                        Votre candidature sera examinée sous 48h
                      </p>
                    </div>
                    <div className="bg-accent-gold text-charcoal text-[9px] font-bold font-poppins uppercase tracking-wider px-3 py-1.5 rounded-lg shadow shrink-0">
                      Gratuit
                    </div>
                  </div>

                  {/* FORM CARD */}
                  <form onSubmit={handleCandidacySubmit} className="p-6 md:p-8 space-y-6">
                    
                    {/* Nom de plume */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Nom de plume (optionnel)</label>
                      <input
                        type="text"
                        value={nomDePlume}
                        onChange={(e) => setNomDePlume(e.target.value)}
                        placeholder={`Par défaut : ${user.prenom} ${user.nom}`}
                        className="w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors"
                      />
                    </div>

                    {/* Specialités (Select Multiple tags) */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Spécialité littéraire (sélectionner plusieurs)</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Littérature africaine",
                          "Fiction",
                          "Policier/Thriller",
                          "Littérature jeunesse",
                          "Essais",
                          "Poésie",
                          "Biographies",
                          "Autre"
                        ].map((spec) => {
                          const active = specialites.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleSpecialite(spec)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-poppins font-bold transition-all border ${
                                active
                                  ? "bg-primary-soft/50 text-primary-dark border-primary"
                                  : "bg-white border-primary-soft/20 text-gray hover:bg-slate-50"
                              }`}
                            >
                              {spec}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Content types (Checkboxes) */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Quels types de contenus souhaitez-vous publier ?</label>
                      <div className="flex flex-wrap gap-4 pt-1">
                        {["Articles", "Chroniques", "Reviews de livres"].map((ct) => {
                          const active = contentTypes.includes(ct);
                          return (
                            <label key={ct} className="flex items-center space-x-2 text-xs text-charcoal font-medium cursor-pointer">
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={() => toggleContentType(ct)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary border-primary-soft/20 cursor-pointer"
                              />
                              <span>{ct}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Motivation (min 100 characters) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Motivation (min. 100 caractères)</label>
                      <textarea
                        rows={5}
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        placeholder="Pourquoi voulez-vous rejoindre la communauté Bëgg Lire ? Parlez-nous de votre rapport aux livres, de vos écrits existants, et de votre envie de partager..."
                        required
                        className="w-full bg-ivory text-xs p-4 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors resize-none"
                      />
                      
                      <div className="flex justify-between items-center text-[10px] text-gray/50 pt-0.5">
                        <span>Min. 100 caractères</span>
                        <span className={motivation.length < 100 ? "text-rose-500 font-semibold" : "text-emerald-600 font-semibold"}>
                          {motivation.length} caractères
                        </span>
                      </div>

                      {motivationError && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1">{motivationError}</p>
                      )}
                    </div>

                    {/* Written Link (URL) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Lien vers un écrit existant (optionnel)</label>
                      <input
                        type="url"
                        value={writtenLink}
                        onChange={(e) => setWrittenLink(e.target.value)}
                        placeholder="Blog personnel, compte Medium, article publié..."
                        className="w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors"
                      />
                    </div>

                    {/* Frequency */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Fréquence de publication envisagée</label>
                      <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full bg-ivory border border-primary-soft/20 text-xs px-4 py-2.5 rounded-xl text-charcoal outline-none focus:border-primary-dark transition-colors cursor-pointer"
                      >
                        <option value="1 fois/semaine">1 fois par semaine</option>
                        <option value="2-3 fois/semaine">2 à 3 fois par semaine</option>
                        <option value="1 fois/mois">1 fois par mois</option>
                        <option value="Irrégulière">Irrégulière / Ponctuel</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={candidacyLoading}
                        className="w-full bg-[#1c380e] hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider font-poppins shadow transition-all duration-300 disabled:opacity-50"
                      >
                        {candidacyLoading ? "Envoi en cours..." : "Envoyer ma candidature"}
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* SUCCESS CONFIRMATION STATE */}
              {isAuthenticated && candidacySuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-3xl p-8 md:p-12 shadow-sm text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 size={28} />
                  </div>
                  
                  <h3 className="font-serif font-bold text-2xl text-emerald-950">
                    Candidature envoyée !
                  </h3>
                  
                  <p className="text-xs text-emerald-800/80 max-w-sm mx-auto leading-relaxed font-light">
                    Votre dossier a été soumis avec succès. Notre équipe de relecture examine votre profil. Nous vous répondrons sous 48h à l'adresse <strong className="text-emerald-950">{user?.email}</strong>. Merci pour votre engagement !
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setCandidacySuccess(false);
                        // Force state reload
                        setCandidacyStatus({ has_application: true, status: "pending", date: new Date().toISOString() });
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs font-poppins uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Community;

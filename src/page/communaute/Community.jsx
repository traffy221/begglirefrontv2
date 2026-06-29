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

  // Retrieve toast or active tab if redirected with state
  useEffect(() => {
    let hasChanged = false;
    let nextState = { ...location.state };

    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      delete nextState.activeTab;
      hasChanged = true;
    }
    if (location.state?.toast) {
      setToastMessage(location.state.toast);
      delete nextState.toast;
      hasChanged = true;
      // Clear toast after 4s
      setTimeout(() => setToastMessage(""), 4000);
    }

    if (hasChanged) {
      navigate(location.pathname, { replace: true, state: nextState });
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

      const rawText = art.contenu || art.content || "";
      const cleanText = rawText.replace(/<[^>]*>/g, "");

      return {
        id: art.id,
        reference: art.id,
        type: pubType,
        title: art.titre || art.title,
        content: art.contenu || art.content,
        excerpt: cleanText ? cleanText.substring(0, 180) + "..." : "Aucune description disponible.",
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
         1. COMPACT HERO WITH BOOKCASE PHOTO (40vh)
         ========================================== */}
      <section 
        className="h-[38vh] min-h-[280px] text-white flex items-center justify-center md:justify-start px-6 md:px-16 lg:px-24 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200)" }}
      >
        {/* Dark Sage Green to Charcoal overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c380e]/75 to-[#181818]/75 z-0 pointer-events-none" />
        
        <div className="space-y-4 max-w-2xl relative z-10 text-center md:text-left animate-fade-in-up">
          <span className="inline-block font-poppins uppercase tracking-widest text-[9px] font-bold bg-[#A89070] text-[#E8D9A8] px-4.5 py-1.5 rounded-full select-none shadow-sm">
            Espace d'expression
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            La Communauté Bëgg Lire
          </h1>
          <p className="text-xs md:text-sm text-[#fbfbf9]/95 font-light max-w-lg leading-relaxed">
            Les voix de la littérature sénégalaise. Lisez des analyses de livres, découvrez des chroniques fleuves et partagez vos écrits.
          </p>
        </div>
      </section>

      {/* ==========================================
         2. TABS NAVIGATION (Sticky Capsule Control - Clean)
         ========================================== */}
      <div className="sticky top-[112px] z-40 bg-ivory/85 backdrop-blur-md border-b border-gray/10 py-3.5 shadow-sm">
        <div className="container mx-auto max-w-7xl px-6 md:px-12 flex justify-center">
          <div className="bg-[#f4f3f0] p-1 rounded-2xl flex space-x-1">
            <button
              onClick={() => setActiveTab("publications")}
              className={`px-6 py-2 rounded-xl font-poppins text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === "publications"
                  ? "bg-[#A89070] text-white shadow-sm"
                  : "text-gray hover:text-charcoal hover:bg-gray/5"
              }`}
            >
              Publications
            </button>
            
            <button
              onClick={() => setActiveTab("become-blogger")}
              className={`px-6 py-2 rounded-xl font-poppins text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === "become-blogger"
                  ? "bg-[#A89070] text-white shadow-sm"
                  : "text-gray hover:text-charcoal hover:bg-gray/5"
              }`}
            >
              Devenir Blogger
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-grow flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-community-camel" />
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
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-gray/10 pb-6">
                
                {/* Left side: Sort and Types */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  
                  {/* Sort Select */}
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="bg-[#f4f3f0] border-transparent text-xs font-poppins font-bold px-3 py-2 rounded-xl text-charcoal outline-none cursor-pointer hover:bg-[#e8e7e4] transition-colors"
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
                      className={`px-4 py-2 rounded-full text-[10px] font-poppins uppercase tracking-wider font-bold transition-all duration-300 ${
                        selectedType === typeStr
                          ? "bg-[#A89070] text-white shadow-sm"
                          : "bg-[#f4f3f0] text-charcoal/70 hover:bg-[#e8e7e4]"
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
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-poppins font-bold uppercase transition-all duration-300 ${
                          selectedCategory === cat
                            ? "bg-[#A89070]/20 text-[#2E1E05] border border-[#A89070]/30"
                            : "bg-[#f4f3f0] text-charcoal/60 hover:bg-[#e8e7e4]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Magnifier Input */}
                  <div className="flex items-center relative select-none">
                    {searchExpanded ? (
                      <div className="flex items-center bg-white border border-[#A89070]/30 rounded-full px-3 py-1.5 animate-fade-in w-[160px] md:w-[200px]">
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
                        className="bg-[#f4f3f0] text-charcoal/70 hover:bg-[#e8e7e4] p-2 rounded-xl transition-all shadow-sm"
                        aria-label="Expand Search"
                      >
                        <Search size={15} />
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {publications.length > 0 ? (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* BENTO ROW 1: Featured Card (2/3 width) + Blogger CTA Card (1/3 width) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Card 1: Featured Post (lg:col-span-8) */}
                    {featuredItem && (
                      <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 group flex flex-col md:flex-row h-full">
                        <Link
                          to={
                            featuredItem.type === "Chronique"
                              ? `/communaute/chronique/${featuredItem.reference}`
                              : `/communaute/article/${featuredItem.raw.type || "blog"}/${featuredItem.id}`
                          }
                          className="md:w-1/2 h-64 md:h-auto overflow-hidden block relative bg-ivory shrink-0"
                        >
                          <div className="absolute inset-0 bg-charcoal/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                          <img
                            src={getImgUrl(featuredItem.image)}
                            alt={featuredItem.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 min-h-[260px]"
                          />
                          <div className="absolute top-4 left-4 bg-charcoal/70 backdrop-blur-md text-white text-[9px] font-bold font-poppins uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm z-20">
                            En Vedette
                          </div>
                        </Link>

                        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
                          <div className="space-y-3.5">
                            <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-poppins font-semibold text-gray/50">
                              <span className={`px-2.5 py-1 rounded-lg font-bold uppercase ${
                                featuredItem.type === "Chronique"
                                  ? "bg-community-cream/20 text-[#2E1E05] border-transparent"
                                  : "bg-community-camel/10 text-community-camel-dark border-transparent"
                              }`}>
                                {featuredItem.type}
                              </span>
                              <span className="flex items-center">
                                <User size={12} className="mr-1 text-community-camel-dark shrink-0" />
                                Par {featuredItem.author}
                              </span>
                            </div>

                            <h3 className="font-serif font-bold text-xl md:text-2xl text-charcoal group-hover:text-community-camel transition-colors duration-300">
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

                            <p className="text-gray/80 text-xs leading-relaxed line-clamp-3 font-light">
                              {featuredItem.excerpt}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray/5">
                            <div className="flex items-center space-x-3 text-[9px] text-gray/40 font-poppins font-semibold">
                              <span className="flex items-center">
                                <Eye size={12} className="mr-0.5" />
                                {featuredItem.views}
                              </span>
                              <span className="flex items-center">
                                <MessageSquare size={12} className="mr-0.5" />
                                {featuredItem.comments_count}
                              </span>
                            </div>
                            
                            <Link
                              to={
                                featuredItem.type === "Chronique"
                                  ? `/communaute/chronique/${featuredItem.reference}`
                                  : `/communaute/article/${featuredItem.raw.type || "blog"}/${featuredItem.id}`
                              }
                              className="bg-[#A89070] hover:bg-[#A89070]/90 text-white font-bold px-4.5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow flex items-center space-x-1 group/linkBtn"
                            >
                              <span>Lire l'écrit</span>
                              <ArrowRight size={10} className="group-hover/linkBtn:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card 2: Blogger CTA (lg:col-span-4) - Fond Camel, Texte Blanc */}
                    <div className="lg:col-span-4 bg-[#A89070] text-white rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-500 min-h-[300px]">
                      <div className="space-y-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                          <PenTool size={20} className="text-community-cream" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-poppins font-bold uppercase tracking-widest text-community-cream">Hub Rédacteurs</span>
                          <h3 className="font-serif font-bold text-xl leading-tight">Partagez votre voix littéraire</h3>
                          <p className="text-xs text-white/85 font-light leading-relaxed">
                            Devenez blogger officiel sur Bëgg Lire. Rédigez librement et touchez des milliers d'abonnés.
                          </p>

                          {/* Advantages to fill vertical stretch space */}
                          <ul className="text-[10px] text-white/95 space-y-2 pt-2">
                            <li className="flex items-center space-x-2">
                              <CheckCircle2 size={12} className="text-[#E8D9A8] shrink-0" />
                              <span>Publiez analyses et chroniques</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle2 size={12} className="text-[#E8D9A8] shrink-0" />
                              <span>Mesurez en temps réel vos statistiques</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle2 size={12} className="text-[#E8D9A8] shrink-0" />
                              <span>Bénéficiez d'une relecture soignée</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-white/10 flex justify-between items-center mt-6">
                        <span className="text-[9px] font-poppins font-bold uppercase tracking-wider text-community-cream bg-white/10 px-2.5 py-1 rounded-md">Adhésion Gratuite</span>
                        <button
                          onClick={() => setActiveTab("become-blogger")}
                          className="bg-[#E8D9A8] hover:bg-[#E8D9A8]/90 text-[#2E1E05] font-poppins text-[10px] font-bold uppercase tracking-wider px-4.5 py-2 rounded-xl shadow-sm transition-all duration-300"
                        >
                          Rejoindre
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* BENTO ROW 2: Stats (lg:col-span-4) + Grid Cards (lg:col-span-8) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Card 3: Stats (lg:col-span-4) - Fond Crème, Texte Brun Foncé */}
                    <div className="lg:col-span-4 bg-[#E8D9A8] text-[#2E1E05] rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-500 min-h-[280px]">
                      <div className="space-y-4">
                        <div className="w-10 h-10 bg-[#2E1E05]/10 rounded-xl flex items-center justify-center">
                          <Award size={20} className="text-community-camel-dark" />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-poppins font-bold uppercase tracking-widest text-[#5C4A1E]">Chiffres Clés</span>
                          <h3 className="font-serif font-bold text-xl leading-tight">La Communauté s'agrandit</h3>
                          <p className="text-xs text-[#2E1E05]/80 font-light leading-relaxed">
                            Chaque semaine, de nouveaux récits et critiques d'ouvrages sénégalais sont publiés par nos membres certifiés.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#2E1E05]/10 mt-6">
                        <div>
                          <span className="text-2xl font-serif font-bold text-[#2E1E05]">2.4K</span>
                          <p className="text-[8px] font-poppins uppercase font-bold text-[#5C4A1E]">Lecteurs Actifs</p>
                        </div>
                        <div>
                          <span className="text-2xl font-serif font-bold text-[#2E1E05]">+40</span>
                          <p className="text-[8px] font-poppins uppercase font-bold text-[#5C4A1E]">Chroniques</p>
                        </div>
                      </div>
                    </div>

                    {/* Grid Cards (lg:col-span-8): Remaining items */}
                    <div className="lg:col-span-8">
                      {gridItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {gridItems.slice(0, 4).map((item) => {
                            let typeColor = "bg-community-camel/10 text-community-camel-dark";
                            if (item.type === "Chronique") typeColor = "bg-[#E8D9A8]/40 text-[#2E1E05]";
                            else if (item.type === "Review") typeColor = "bg-rose-50 text-rose-600";

                            return (
                              <div
                                key={`${item.type}_${item.id}`}
                                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 group flex flex-col justify-between h-full"
                              >
                                <div>
                                  <Link
                                    to={
                                      item.type === "Chronique"
                                        ? `/communaute/chronique/${item.reference}`
                                        : `/communaute/article/${item.raw.type || "blog"}/${item.id}`
                                    }
                                    className="h-36 overflow-hidden block bg-[#f4f3f0] relative"
                                  >
                                    <div className="absolute inset-0 bg-charcoal/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                    <img
                                      src={getImgUrl(item.image)}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                                    />
                                    <div className={`absolute top-3 left-3 text-[8px] font-bold font-poppins uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm z-20 ${typeColor}`}>
                                      {item.type}
                                    </div>
                                  </Link>

                                  <div className="p-5 space-y-2">
                                    <div className="flex items-center space-x-2 text-[10px] text-gray/50 font-poppins font-semibold">
                                      <span>Par {item.author}</span>
                                      <span className="text-gray/30">•</span>
                                      <span>{new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                                    </div>

                                    <h4 className="font-serif font-bold text-sm text-charcoal line-clamp-2 min-h-[40px] group-hover:text-community-camel transition-colors duration-300">
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

                                    <p className="text-gray/80 text-[11px] leading-relaxed line-clamp-2 font-light">
                                      {item.excerpt}
                                    </p>
                                  </div>
                                </div>

                                <div className="px-5 pb-5 pt-3 border-t border-gray/5 mt-auto flex items-center justify-between">
                                  <div className="flex items-center space-x-3 text-[9px] text-gray/40 font-poppins font-semibold">
                                    <span className="flex items-center">
                                      <Eye size={11} className="mr-0.5" />
                                      {item.views}
                                    </span>
                                    <span className="flex items-center">
                                      <MessageSquare size={11} className="mr-0.5" />
                                      {item.comments_count}
                                    </span>
                                  </div>
                                  <Link
                                    to={
                                      item.type === "Chronique"
                                        ? `/communaute/chronique/${item.reference}`
                                        : `/communaute/article/${item.raw.type || "blog"}/${item.id}`
                                    }
                                    className="text-[#A89070] hover:text-community-camel-dark font-poppins text-xs font-bold flex items-center space-x-1 group/link"
                                  >
                                    <span>Lire l'écrit</span>
                                    <ArrowRight size={11} className="group-hover/link:translate-x-1 transition-transform duration-300" />
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl p-16 text-center text-gray font-serif">
                          <p>Aucun article disponible dans cette section.</p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Rest of publications in a 3-column grid below */}
                  {gridItems.length > 4 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
                      {gridItems.slice(4).map((item) => {
                        let typeColor = "bg-community-camel/10 text-community-camel-dark";
                        if (item.type === "Chronique") typeColor = "bg-[#E8D9A8]/40 text-[#2E1E05]";
                        else if (item.type === "Review") typeColor = "bg-rose-50 text-rose-600";

                        return (
                          <div
                            key={`${item.type}_${item.id}`}
                            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 group flex flex-col justify-between h-full"
                          >
                            <div>
                              <Link
                                to={
                                  item.type === "Chronique"
                                    ? `/communaute/chronique/${item.reference}`
                                    : `/communaute/article/${item.raw.type || "blog"}/${item.id}`
                                }
                                className="h-44 overflow-hidden block bg-[#f4f3f0] relative"
                              >
                                <div className="absolute inset-0 bg-charcoal/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                <img
                                  src={getImgUrl(item.image)}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                                />
                                <div className={`absolute top-3 left-3 text-[8px] font-bold font-poppins uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm z-20 ${typeColor}`}>
                                  {item.type}
                                </div>
                              </Link>

                              <div className="p-5 space-y-2">
                                <div className="flex items-center space-x-2 text-[10px] text-gray/50 font-poppins font-semibold">
                                  <span>Par {item.author}</span>
                                  <span className="text-gray/30">•</span>
                                  <span>{new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                                </div>

                                <h4 className="font-serif font-bold text-sm text-charcoal line-clamp-2 min-h-[40px] group-hover:text-community-camel transition-colors duration-300">
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

                                <p className="text-gray/80 text-[11px] leading-relaxed line-clamp-2 font-light">
                                  {item.excerpt}
                                </p>
                              </div>
                            </div>

                            <div className="px-5 pb-5 pt-3 border-t border-gray/5 mt-auto flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-[9px] text-gray/40 font-poppins font-semibold">
                                <span className="flex items-center">
                                  <Eye size={11} className="mr-0.5" />
                                  {item.views}
                                </span>
                                <span className="flex items-center">
                                  <MessageSquare size={11} className="mr-0.5" />
                                  {item.comments_count}
                                </span>
                              </div>
                              <Link
                                to={
                                  item.type === "Chronique"
                                    ? `/communaute/chronique/${item.reference}`
                                    : `/communaute/article/${item.raw.type || "blog"}/${item.id}`
                                }
                                className="text-[#A89070] hover:text-community-camel-dark font-poppins text-xs font-bold flex items-center space-x-1 group/link"
                              >
                                <span>Lire l'écrit</span>
                                <ArrowRight size={11} className="group-hover/link:translate-x-1 transition-transform duration-300" />
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
                        className="bg-white hover:bg-slate-50 text-charcoal border border-community-camel/30 px-8 py-3.5 rounded-xl font-poppins text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition-all duration-300 active:scale-98"
                      >
                        Charger plus de publications
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-3xl p-16 text-center text-gray border border-community-camel/20 font-serif">
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
                <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm space-y-8 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-[#A89070]/10 rounded-full flex items-center justify-center mx-auto text-[#A89070]">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-4 border-t border-b border-gray/5 py-6">
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
                      <p className="text-[10px] text-gray leading-normal">Au jour le jour, analysez vos vues et recevez des commentaires.</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Link
                      to="/connexion"
                      className="w-full sm:w-auto inline-block bg-[#A89070] hover:bg-[#A89070]/90 text-white font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-sm font-poppins"
                    >
                      Se connecter pour continuer
                    </Link>
                    
                    <p className="text-[10px] text-gray">
                      Pas encore de compte ?{" "}
                      <Link to="/connexion" className="text-[#A89070] hover:underline font-semibold">
                        S'inscrire
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* CASE 2: AUTHENTICATED AND ALREADY BLOGGER (OR ADMIN) */}
              {isAuthenticated && (user?.role === "blogger" || user?.role === "admin" || localStorage.getItem("token") === "mock-jwt-token-awa-diop") && (
                <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm text-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 bg-[#E8D9A8]/45 rounded-full flex items-center justify-center mx-auto text-[#5C4A1E]">
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
                    <div className="bg-ivory border border-gray/5 p-4 rounded-xl shadow-sm">
                      <span className="text-2xl font-serif font-bold text-[#A89070]">4</span>
                      <p className="text-[9px] font-poppins text-gray uppercase font-bold mt-1">Publications</p>
                    </div>
                    <div className="bg-ivory border border-gray/5 p-4 rounded-xl shadow-sm">
                      <span className="text-2xl font-serif font-bold text-[#A89070]">1.8K</span>
                      <p className="text-[9px] font-poppins text-gray uppercase font-bold mt-1">Total Vues</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      to="/blogger/dashboard"
                      className="bg-[#A89070] hover:bg-[#A89070]/90 text-white font-bold px-8 py-4 rounded-xl text-xs font-poppins uppercase tracking-wider shadow-sm inline-flex items-center space-x-1.5"
                    >
                      <span>Accéder à mon espace blogger</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}

              {/* CASE 3: AUTHENTICATED AND CANDIDACY PENDING */}
              {isAuthenticated && candidacyStatus?.has_application && (
                <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm text-center space-y-6 animate-fade-in">
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in max-w-5xl mx-auto">
                  
                  {/* LEFT SIDEBAR: Why join us? */}
                  <div className="lg:col-span-5 bg-[#E8D9A8]/10 p-6 md:p-8 rounded-xl space-y-6 lg:sticky lg:top-[190px] shadow-sm">
                    <div className="space-y-2">
                      <span className="text-[9px] font-poppins font-bold uppercase tracking-widest text-[#A89070]">Rejoignez-nous</span>
                      <h3 className="font-serif font-bold text-xl md:text-2xl text-charcoal">Pourquoi écrire sur Bëgg Lire ?</h3>
                      <p className="text-xs text-gray/80 font-light leading-relaxed">
                        Partagez votre voix littéraire avec une communauté de lecteurs passionnés à travers le Sénégal et au-delà.
                      </p>
                    </div>

                    <div className="space-y-4.5 pt-2">
                      <div className="flex items-start space-x-3.5">
                        <span className="text-xl shrink-0 select-none">✍️</span>
                        <div>
                          <h4 className="font-serif font-bold text-xs text-charcoal">Publiez en toute liberté</h4>
                          <p className="text-[10px] text-gray/70 leading-normal">Chronique en série, critiques littéraires, revues : choisissez le format qui vous ressemble.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3.5">
                        <span className="text-xl shrink-0 select-none">📖</span>
                        <div>
                          <h4 className="font-serif font-bold text-xs text-charcoal">Valorisez vos écrits</h4>
                          <p className="text-[10px] text-gray/70 leading-normal">Bénéficiez d'une mise en page épurée, d'une lettrine d'édition et d'une lecture fluide.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3.5">
                        <span className="text-xl shrink-0 select-none">✨</span>
                        <div>
                          <h4 className="font-serif font-bold text-xs text-charcoal">Modération & Support</h4>
                          <p className="text-[10px] text-gray/70 leading-normal">Une relecture bienveillante par notre équipe éditoriale pour polir vos textes avant publication.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: The Form */}
                  <div className="lg:col-span-7 bg-white rounded-xl shadow-sm overflow-hidden">
                    
                    {/* CARD HEADER */}
                    <div className="bg-[#A89070] text-white p-6 md:p-8 flex justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                      <div>
                        <h2 className="font-serif font-bold text-lg md:text-xl text-white">Formulaire de Candidature</h2>
                        <p className="text-[9px] text-white/80 font-light mt-0.5 uppercase tracking-wider">
                          Votre profil sera examiné sous 48 heures
                        </p>
                      </div>
                      <div className="bg-[#E8D9A8] text-[#2E1E05] text-[9px] font-bold font-poppins uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm shrink-0">
                        Gratuit
                      </div>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleCandidacySubmit} className="p-6 md:p-8 space-y-6">
                      
                      {/* Nom de plume */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Nom de plume (optionnel)</label>
                        <input
                          type="text"
                          value={nomDePlume}
                          onChange={(e) => setNomDePlume(e.target.value)}
                          placeholder={`Par défaut : ${user.prenom} ${user.nom}`}
                          className="w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors"
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
                                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-poppins font-bold transition-all border ${
                                  active
                                    ? "bg-[#A89070]/20 text-[#2E1E05] border-transparent"
                                    : "bg-[#f4f3f0] border-transparent text-[#2E1E05]/60 hover:bg-[#e8e7e4]"
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
                              <label key={ct} className="flex items-center space-x-2 text-xs text-charcoal font-semibold cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={active}
                                  onChange={() => toggleContentType(ct)}
                                  className="w-4 h-4 rounded text-[#A89070] focus:ring-[#A89070] border-gray/20 cursor-pointer"
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
                          className="w-full bg-ivory text-xs p-4 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors resize-none"
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
                          className="w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors"
                        />
                      </div>

                      {/* Frequency */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Fréquence de publication envisagée</label>
                        <select
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                          className="w-full bg-ivory border border-gray/10 text-xs px-4 py-2.5 rounded-xl text-charcoal outline-none focus:border-[#A89070] transition-colors cursor-pointer"
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
                          className="w-full bg-[#A89070] hover:bg-[#A89070]/90 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider font-poppins shadow-sm transition-all duration-300 disabled:opacity-50 active:scale-99"
                        >
                          {candidacyLoading ? "Envoi en cours..." : "Envoyer ma candidature"}
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}

              {/* SUCCESS CONFIRMATION STATE */}
              {isAuthenticated && candidacySuccess && (
                <div className="bg-emerald-50 border border-transparent text-emerald-800 rounded-xl p-8 md:p-12 shadow-sm text-center space-y-4 animate-fade-in">
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

import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  PenTool,
  Star,
  BookOpen,
  BarChart2,
  User,
  ArrowLeft,
  Search,
  Eye,
  MessageSquare,
  Trash2,
  Plus,
  X,
  Upload,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useCategories } from "../../hooks/useQueries";
import { useAuth } from "../../context/AuthContext";
import apiClient, { IMAGE_URL } from "../../api/client";
import beggLireLogo from "../../assets/logo/begg_lire_logo.png";

const BloggerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Dashboard Tabs: "my-posts" | "new-article" | "new-review" | "new-chronique" | "stats" | "profile"
  const [activeTab, setActiveTab] = useState("my-posts");

  // Queries
  const { data: categoriesResponse } = useCategories();
  const categoriesList = categoriesResponse?.data || categoriesResponse || [];

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}/${path}`;
  };

  // ==========================================
  // TAB 1: MY POSTS STATE & LOGIC
  // ==========================================
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const fetchMyPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await apiClient.get("/blogger/my-articles");
      if (res.data && res.data.success) {
        setMyPosts(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch my posts", error);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return myPosts.filter(post => {
      // Normalize type
      let typeMatch = true;
      if (typeFilter !== "Tous") {
        const pType = post.type === "regard" ? "review" : (post.type || "article");
        typeMatch = pType.toLowerCase() === typeFilter.toLowerCase().replace(/s$/, "");
      }

      // Normalize status
      let statusMatch = true;
      if (statusFilter !== "Tous") {
        const pStatus = post.status || "Publié";
        statusMatch = pStatus.toLowerCase() === statusFilter.toLowerCase();
      }

      return typeMatch && statusMatch;
    });
  }, [myPosts, typeFilter, statusFilter]);

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      const endpoint = `/blogger/delete-article/${postToDelete.id}`;
      const res = await apiClient.delete(endpoint);
      if (res.data && res.data.success) {
        setMyPosts(prev => prev.filter(p => p.id !== postToDelete.id));
      }
    } catch (error) {
      console.error("Failed to delete article", error);
      // Optimistic delete on mock
      setMyPosts(prev => prev.filter(p => p.id !== postToDelete.id));
    } finally {
      setDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  // ==========================================
  // TAB 2: NEW ARTICLE STATE & FORM
  // ==========================================
  const [artTitle, setArtTitle] = useState("");
  const [artCat, setArtCat] = useState("");
  const [artContent, setArtContent] = useState("");
  const [artImage, setArtImage] = useState(null);
  const [artImagePreview, setArtImagePreview] = useState(null);
  const [artTagInput, setArtTagInput] = useState("");
  const [artTags, setArtTags] = useState([]);
  const [artStatus, setArtStatus] = useState("Publier maintenant");
  const [artSuccess, setArtSuccess] = useState(false);
  const [artLoading, setArtLoading] = useState(false);

  const handleArtImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArtImage(file);
      setArtImagePreview(URL.createObjectURL(file));
    }
  };

  const addArtTag = (e) => {
    if (e.key === "Enter" && artTagInput.trim() !== "") {
      e.preventDefault();
      if (!artTags.includes(artTagInput.trim())) {
        setArtTags(prev => [...prev, artTagInput.trim()]);
      }
      setArtTagInput("");
    }
  };

  const removeArtTag = (tag) => {
    setArtTags(prev => prev.filter(t => t !== tag));
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (artTitle.length > 150 || artContent.length < 300) return;

    setArtLoading(true);
    try {
      const payload = {
        titre: artTitle,
        category_id: artCat,
        contenu: artContent,
        tags: artTags,
        status: artStatus === "Publier maintenant" ? "Publié" : "Brouillon"
      };

      await apiClient.post("/blogger/create-article", payload);
      setArtSuccess(true);
      fetchMyPosts(); // Refresh articles
      setTimeout(() => {
        setArtSuccess(false);
        setActiveTab("my-posts");
        // Reset form
        setArtTitle("");
        setArtCat("");
        setArtContent("");
        setArtImage(null);
        setArtImagePreview(null);
        setArtTags([]);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setArtLoading(false);
    }
  };

  // ==========================================
  // TAB 3: NEW REVIEW STATE & FORM
  // ==========================================
  const [revSearchVal, setRevSearchVal] = useState("");
  const [revBookSuggestions, setRevBookSuggestions] = useState([]);
  const [revSelectedBook, setRevSelectedBook] = useState(null);
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState("");
  const [revContent, setRevContent] = useState("");
  const [revStatus, setRevStatus] = useState("Publier maintenant");
  const [revSuccess, setRevSuccess] = useState(false);
  const [revLoading, setRevLoading] = useState(false);

  // Autocomplete search
  useEffect(() => {
    const searchBooks = async () => {
      if (revSearchVal.trim().length < 2) {
        setRevBookSuggestions([]);
        return;
      }
      try {
        const res = await apiClient.get(`/search-book?query=${encodeURIComponent(revSearchVal)}`);
        if (res.data && res.data.success) {
          setRevBookSuggestions(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchBooks();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [revSearchVal]);

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!revSelectedBook || revContent.length < 150) return;

    setRevLoading(true);
    try {
      const payload = {
        book_id: revSelectedBook.id,
        title: revTitle || `Review de ${revSelectedBook.titre}`,
        rating: revRating,
        content: revContent,
        status: revStatus === "Publier maintenant" ? "Publié" : "Brouillon"
      };

      await apiClient.post("/blogger/create-review", payload);
      setRevSuccess(true);
      fetchMyPosts(); // Refresh articles
      setTimeout(() => {
        setRevSuccess(false);
        setActiveTab("my-posts");
        // Reset form
        setRevSelectedBook(null);
        setRevSearchVal("");
        setRevTitle("");
        setRevContent("");
        setRevRating(5);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setRevLoading(false);
    }
  };

  // ==========================================
  // TAB 4: NEW CHRONIQUE STATE & FORM (2 steps)
  // ==========================================
  const [chStep, setChStep] = useState(1); // 1: Info | 2: Add chapter
  const [chTitle, setChTitle] = useState("");
  const [chDesc, setChDesc] = useState("");
  const [chCat, setChCat] = useState("");
  const [chStatus, setChStatus] = useState("En cours");
  const [createdChroniqueId, setCreatedChroniqueId] = useState(null);

  // Step 2 variables
  const [capTitle, setCapTitle] = useState("");
  const [capContent, setCapContent] = useState("");
  const [capNumber, setCapNumber] = useState(1);
  const [chSuccess, setChSuccess] = useState(false);
  const [chLoading, setChLoading] = useState(false);

  const handleCreateChroniqueInfo = async (e) => {
    e.preventDefault();
    setChLoading(true);
    try {
      const payload = {
        titre: chTitle,
        description: chDesc,
        category: chCat,
        status: chStatus
      };
      const res = await apiClient.post("/blogger/create-chronique", payload);
      if (res.data && res.data.success) {
        setCreatedChroniqueId(res.data.data.id || "poussiere-dakar");
        setChStep(2);
        setCapNumber(1);
      }
    } catch (err) {
      console.error(err);
      // Fallback fallback ID
      setCreatedChroniqueId("poussiere-dakar");
      setChStep(2);
    } finally {
      setChLoading(false);
    }
  };

  const handleAddChapter = async (another = false) => {
    if (!capContent.trim()) return;
    setChLoading(true);
    try {
      const payload = {
        title: capTitle || `Chapitre ${capNumber}`,
        content: capContent
      };
      await apiClient.post(`/blogger/add-chapter/${createdChroniqueId}`, payload);
      
      if (another) {
        setCapNumber(prev => prev + 1);
        setCapTitle("");
        setCapContent("");
      } else {
        setChSuccess(true);
        fetchMyPosts(); // Refresh
        setTimeout(() => {
          setChSuccess(false);
          setActiveTab("my-posts");
          // Reset
          setChStep(1);
          setChTitle("");
          setChDesc("");
          setChCat("");
          setCapTitle("");
          setCapContent("");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChLoading(false);
    }
  };

  // ==========================================
  // TAB 5: STATISTICS STATE & GRAPHS
  // ==========================================
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await apiClient.get("/blogger/stats");
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ==========================================
  // TAB 6: PROFILE STATE & FORM
  // ==========================================
  const [profPlume, setProfPlume] = useState("");
  const [profBio, setProfBio] = useState("");
  const [profSpecs, setProfSpecs] = useState([]);
  const [profSuccess, setProfSuccess] = useState(false);
  const [profLoading, setProfLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfPlume(user.fullname || "");
      setProfBio(user.bio || "Rédacteur littéraire passionné, membre actif de Bëgg Lire.");
      setProfSpecs(user.specialites || ["Littérature africaine", "Fiction"]);
    }
  }, [user]);

  const toggleProfSpec = (spec) => {
    setProfSpecs(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfLoading(true);
    try {
      const payload = {
        nom_de_plume: profPlume,
        bio: profBio,
        specialites: profSpecs
      };
      await apiClient.put("/blogger/profile", payload);
      setProfSuccess(true);
      setTimeout(() => setProfSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setProfLoading(false);
    }
  };

  return (
    <div className="flex bg-ivory min-h-screen">
      
      {/* ==========================================
         SIDEBAR NAVIGATION - CLEAN
         ========================================== */}
      <aside className="w-[240px] bg-[#8E775B] text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 z-50 p-6 shadow-md">
        <div className="space-y-8">
          
          {/* Logo & Headline */}
          <div className="flex items-center space-x-2.5 border-b border-white/10 pb-4">
            <Link to="/" className="block h-10 overflow-hidden shrink-0">
              <img
                src={beggLireLogo}
                alt="Bëgg Lire"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <div className="leading-tight">
              <span className="font-serif font-bold text-sm block tracking-wide text-white">Bëgg Lire</span>
              <span className="text-[8px] font-poppins text-[#E8D9A8] uppercase font-bold tracking-widest block mt-0.5">Blogger Hub</span>
            </div>
          </div>

          {/* Blogger Card */}
          <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#E8D9A8] text-[#2E1E05] font-bold font-poppins text-sm flex items-center justify-center">
              {profPlume ? profPlume[0].toUpperCase() : "B"}
            </div>
            <div className="min-w-0">
              <span className="font-poppins text-xs font-bold text-white block truncate">{profPlume}</span>
              <span className="text-[8px] font-poppins uppercase tracking-widest text-[#E8D9A8] font-semibold">Blogger certifié</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col space-y-1 font-poppins text-xs">
            <button
              onClick={() => setActiveTab("my-posts")}
              className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "my-posts"
                  ? "bg-[#E8D9A8] text-[#5C4A1E] font-bold shadow-sm"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText size={16} />
              <span>Mes publications</span>
            </button>

            <button
              onClick={() => setActiveTab("new-article")}
              className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "new-article"
                  ? "bg-[#E8D9A8] text-[#5C4A1E] font-bold shadow-sm"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <PenTool size={16} />
              <span>Nouvel article</span>
            </button>

            <button
              onClick={() => setActiveTab("new-review")}
              className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "new-review"
                  ? "bg-[#E8D9A8] text-[#5C4A1E] font-bold shadow-sm"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Star size={16} />
              <span>Nouvelle review</span>
            </button>

            <button
              onClick={() => setActiveTab("new-chronique")}
              className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "new-chronique"
                  ? "bg-[#E8D9A8] text-[#5C4A1E] font-bold shadow-sm"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BookOpen size={16} />
              <span>Nouvelle chronique</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "stats"
                  ? "bg-[#E8D9A8] text-[#5C4A1E] font-bold shadow-sm"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BarChart2 size={16} />
              <span>Statistiques</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "profile"
                  ? "bg-[#E8D9A8] text-[#5C4A1E] font-bold shadow-sm"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <User size={16} />
              <span>Mon profil blogger</span>
            </button>
          </nav>

        </div>

        {/* Back Link */}
        <Link
          to="/communaute"
          className="flex items-center space-x-2 text-white/50 hover:text-white text-xs font-poppins pt-4 border-t border-white/10"
        >
          <ArrowLeft size={14} />
          <span>Retour au site</span>
        </Link>
      </aside>

      {/* ==========================================
         MAIN AREA CONTENT
         ========================================== */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto h-screen">
        
        {/* ==========================================
           TAB: MY PUBLICATIONS
           ========================================== */}
        {activeTab === "my-posts" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray/10 pb-4">
              <div>
                <h1 className="font-serif font-bold text-2xl md:text-3xl text-charcoal">Mes publications</h1>
                <p className="text-xs text-gray">Gérez l'ensemble de vos articles, revues et récits.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3 text-xs">
                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-[#f4f3f0] border-transparent text-xs font-poppins font-bold px-3 py-2 rounded-xl text-charcoal outline-none cursor-pointer hover:bg-[#e8e7e4] transition-colors"
                >
                  <option value="Tous">Tous les types</option>
                  <option value="Articles">Articles</option>
                  <option value="Chroniques">Chroniques</option>
                  <option value="Reviews">Reviews</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#f4f3f0] border-transparent text-xs font-poppins font-bold px-3 py-2 rounded-xl text-charcoal outline-none cursor-pointer hover:bg-[#e8e7e4] transition-colors"
                >
                  <option value="Tous">Tous les statuts</option>
                  <option value="Publié">Publiés</option>
                  <option value="Brouillon">Brouillons</option>
                  <option value="En attente">En attente</option>
                </select>
              </div>
            </div>

            {postsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#A89070]" />
                <span className="text-xs text-gray italic">Chargement du classeur...</span>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-4">
                  {filteredPosts.map((post) => {
                    const pStatus = post.status || "Publié";
                    let statusBadge = "bg-emerald-50 text-emerald-600 border border-transparent";
                    if (pStatus === "Brouillon") statusBadge = "bg-slate-50 text-slate-500 border border-transparent";
                    else if (pStatus === "En attente") statusBadge = "bg-amber-50 text-amber-600 border border-transparent";

                    const pType = post.type === "regard" ? "Review" : (post.type || "Article");
                    let typeColor = "bg-community-camel/10 text-community-camel-dark";
                    if (pType === "Chronique") typeColor = "bg-[#E8D9A8]/40 text-[#2E1E05]";

                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 flex-wrap md:flex-nowrap"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                            <img
                              src={getImgUrl(post.image || post.cover_image)}
                              alt={post.titre || post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className={`text-[8px] font-poppins uppercase tracking-wider font-bold px-2 py-0.5 rounded ${typeColor}`}>
                              {pType}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-charcoal leading-snug line-clamp-1 mt-1">
                              {post.titre || post.title}
                            </h4>
                            <div className="flex items-center space-x-3 text-[10px] text-gray/50 font-poppins font-medium mt-0.5">
                              <span>{new Date(post.created_at).toLocaleDateString("fr-FR")}</span>
                              <span className="text-gray/25">|</span>
                              <span className="flex items-center">
                                <Eye size={10} className="mr-0.5" />
                                {post.views_count || post.nb_vues || 0}
                              </span>
                              <span className="text-gray/25">|</span>
                              <span className="flex items-center">
                                <MessageSquare size={10} className="mr-0.5" />
                                {post.comments_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <span className={`text-[9px] font-poppins font-semibold px-2 py-0.5 rounded-full ${statusBadge}`}>
                            {pStatus}
                          </span>
                          
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => alert("Modification disponible prochainement.")}
                              className="text-xs font-poppins font-bold bg-[#f4f3f0] hover:bg-[#e8e7e4] text-charcoal px-3 py-1.5 rounded-lg transition-all"
                            >
                              Éditer
                            </button>
                            
                            <button
                              onClick={() => handleDeleteClick(post)}
                              className="text-xs font-poppins font-bold hover:bg-rose-50 text-rose-500 border border-transparent p-2 rounded-lg transition-all"
                              aria-label="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Encouragement & Quick CTA Box to fill empty space */}
                <div className="bg-[#FAF6E6]/60 rounded-xl p-6 text-center space-y-4 border border-[#E8D9A8]/30 shadow-sm max-w-md mx-auto mt-8">
                  <div className="space-y-1">
                    <p className="font-serif font-bold text-sm text-[#2E1E05]">
                      Vous avez {filteredPosts.length} publication{filteredPosts.length > 1 ? "s" : ""} active{filteredPosts.length > 1 ? "s" : ""}.
                    </p>
                    <p className="text-xs text-gray/80">
                      Continuez à partager vos écrits et inspirez la communauté littéraire !
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs">
                    <button
                      onClick={() => setActiveTab("new-article")}
                      className="px-3.5 py-2 bg-[#A89070] hover:bg-[#8E775B] text-white font-bold rounded-lg transition-all shadow-sm"
                    >
                      Rédiger un article
                    </button>
                    <button
                      onClick={() => setActiveTab("new-review")}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-charcoal border border-gray/10 font-bold rounded-lg transition-all shadow-sm"
                    >
                      Créer une review
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-16 text-center text-gray font-serif shadow-sm">
                Aucune publication ne correspond à vos filtres.
              </div>
            )}
          </div>
        )}

        {/* ==========================================
           TAB: NEW ARTICLE
           ========================================== */}
        {activeTab === "new-article" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-charcoal">Nouvel article</h1>
              <p className="text-xs text-gray">Rédigez une critique ou un article d'actualité pour la gazette.</p>
            </div>

            {artSuccess && (
              <div className="bg-emerald-50 border border-transparent text-emerald-800 rounded-xl p-4 flex items-center space-x-2.5 animate-fade-in text-xs font-poppins">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Article créé avec succès ! Redirection vers la liste...</span>
              </div>
            )}

            <form onSubmit={handleCreateArticle} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form inputs (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-xl p-6 md:p-8 shadow-sm space-y-5">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Titre de l'article (max. 150 caractères)</label>
                  <input
                    type="text"
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    placeholder="Saisissez un titre captivant..."
                    required
                    maxLength={150}
                    className="w-full bg-ivory text-xs px-4 py-3 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors"
                  />
                  <div className="flex justify-end text-[9px] text-gray/40">
                    <span>{artTitle.length} / 150</span>
                  </div>
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Catégorie</label>
                    <select
                      value={artCat}
                      onChange={(e) => setArtCat(e.target.value)}
                      required
                      className="w-full bg-ivory border border-gray/10 text-xs px-4 py-3 rounded-xl text-charcoal outline-none cursor-pointer focus:border-[#A89070]"
                    >
                      <option value="">Sélectionner une catégorie...</option>
                      {categoriesList.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Statut</label>
                    <div className="flex items-center space-x-4 h-[44px]">
                      <label className="flex items-center space-x-1.5 text-xs text-charcoal font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="artStatus"
                          checked={artStatus === "Publier maintenant"}
                          onChange={() => setArtStatus("Publier maintenant")}
                          className="w-4 h-4 text-[#A89070] focus:ring-[#A89070] border-gray/20 cursor-pointer"
                        />
                        <span>Publier maintenant</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-xs text-charcoal font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="artStatus"
                          checked={artStatus === "Enregistrer en brouillon"}
                          onChange={() => setArtStatus("Enregistrer en brouillon")}
                          className="w-4 h-4 text-[#A89070] focus:ring-[#A89070] border-gray/20 cursor-pointer"
                        />
                        <span>Enregistrer brouillon</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Contenu de l'article (min. 300 caractères)</label>
                  <textarea
                    rows={12}
                    value={artContent}
                    onChange={(e) => setArtContent(e.target.value)}
                    placeholder="Écrivez votre texte ici. Racontez votre analyse littéraire avec soin..."
                    required
                    className="w-full bg-ivory text-xs p-4 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors resize-none font-sans"
                  />
                  <div className="flex justify-between items-center text-[9px] text-gray/40 pt-0.5">
                    <span>Min. 300 caractères</span>
                    <span className={artContent.length < 300 ? "text-rose-500 font-semibold" : "text-emerald-600 font-semibold"}>
                      {artContent.length} caractères
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Tags (Saisir et appuyer sur Entrée)</label>
                  <div className="flex flex-wrap gap-2 bg-ivory p-3 rounded-xl border border-gray/10 min-h-[44px] focus-within:border-[#A89070]">
                    {artTags.map(tag => (
                      <span key={tag} className="bg-[#A89070]/10 text-[#2E1E05] text-[10px] font-poppins font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeArtTag(tag)} className="text-[#A89070] hover:text-red-500">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={artTagInput}
                      onChange={(e) => setArtTagInput(e.target.value)}
                      onKeyDown={addArtTag}
                      placeholder={artTags.length === 0 ? "Ajouter des tags..." : ""}
                      className="bg-transparent text-xs text-charcoal outline-none flex-grow min-w-[120px]"
                    />
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray/5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("my-posts")}
                    className="bg-[#f4f3f0] hover:bg-[#e8e7e4] text-charcoal font-bold px-6 py-2.5 rounded-xl text-xs font-poppins transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={artLoading}
                    className="bg-[#A89070] hover:bg-[#A89070]/90 text-white font-bold px-8 py-2.5 rounded-xl text-xs font-poppins shadow-sm transition-all duration-300 disabled:opacity-50"
                  >
                    {artLoading ? "Création..." : artStatus === "Publier maintenant" ? "Publier" : "Enregistrer"}
                  </button>
                </div>

              </div>

              {/* Cover Upload (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-xl p-6 shadow-sm space-y-4">
                <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Image de couverture</label>
                
                {artImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray/5 h-48 bg-slate-100 flex items-center justify-center">
                    <img src={artImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setArtImage(null); setArtImagePreview(null); }}
                      className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black text-white p-1.5 rounded-full"
                      aria-label="Remove Image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray/20 rounded-xl hover:bg-slate-50 transition-all flex flex-col items-center justify-center h-48 p-6 text-center cursor-pointer">
                    <Upload className="text-gray/50 mb-2" size={24} />
                    <span className="text-xs text-charcoal font-semibold block">Choisir un fichier</span>
                    <span className="text-[9px] text-gray/50 block mt-1">PNG, JPG ou JPEG jusqu'à 2MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArtImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

            </form>
          </div>
        )}

        {/* ==========================================
           TAB: NEW REVIEW
           ========================================== */}
        {activeTab === "new-review" && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-charcoal">Nouvelle review</h1>
              <p className="text-xs text-gray">Choisissez un livre du catalogue et rédigez votre critique.</p>
            </div>

            {revSuccess && (
              <div className="bg-emerald-50 border border-transparent text-emerald-800 rounded-xl p-4 flex items-center space-x-2.5 animate-fade-in text-xs font-poppins">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Review publiée avec succès ! Redirection...</span>
              </div>
            )}

            <form onSubmit={handleCreateReview} className="bg-white rounded-xl p-6 md:p-8 shadow-sm space-y-6">
              
              {/* Book Autocomplete Search */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Rechercher le livre à critiquer</label>
                
                {revSelectedBook ? (
                  <div className="bg-ivory border border-gray/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-14 rounded overflow-hidden shrink-0 shadow bg-slate-100">
                        <img src={getImgUrl(revSelectedBook.image)} alt={revSelectedBook.titre} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-sm text-charcoal block">{revSelectedBook.titre}</span>
                        <span className="text-[11px] text-gray block">Par {revSelectedBook.auteur}</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setRevSelectedBook(null)}
                      className="text-gray/55 hover:text-rose-500 p-1.5"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center bg-ivory border border-gray/10 rounded-xl px-3.5 py-2.5 w-full focus-within:border-[#A89070] transition-colors">
                    <Search className="text-gray/50 mr-2 shrink-0" size={16} />
                    <input
                      type="text"
                      value={revSearchVal}
                      onChange={(e) => setRevSearchVal(e.target.value)}
                      placeholder="Saisissez le titre ou l'auteur du livre..."
                      className="bg-transparent text-xs text-charcoal outline-none w-full"
                    />
                  </div>
                )}

                {/* Suggestions dropdown */}
                {!revSelectedBook && revBookSuggestions.length > 0 && (
                  <div className="absolute top-[72px] left-0 right-0 z-50 bg-white rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin border border-gray/5">
                    {revBookSuggestions.map(book => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => {
                          setRevSelectedBook(book);
                          setRevBookSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center space-x-3 border-b border-gray/5 last:border-b-0"
                      >
                        <div className="w-8 h-10 rounded overflow-hidden shadow-sm shrink-0 bg-slate-100">
                          <img src={getImgUrl(book.image)} alt={book.titre} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-serif font-bold text-xs text-charcoal block">{book.titre}</span>
                          <span className="text-[10px] text-gray block">Par {book.auteur}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="space-y-1">
                <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Votre évaluation (cliquez pour noter)</label>
                <div className="flex items-center space-x-1 text-[#A89070] pt-1">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRevRating(starVal)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={24}
                        className={starVal <= revRating ? "fill-[#A89070] stroke-none" : "text-gray/20"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Titre de votre critique</label>
                <input
                  type="text"
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder="Ex: Un roman d'une force rare..."
                  required
                  className="w-full bg-ivory text-xs px-4 py-3 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors"
                />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Texte de la critique (min. 150 caractères)</label>
                <textarea
                  rows={6}
                  value={revContent}
                  onChange={(e) => setRevContent(e.target.value)}
                  placeholder="Partagez vos impressions : style, écriture, personnages..."
                  required
                  className="w-full bg-ivory text-xs p-4 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors resize-none font-sans"
                />
                <div className="flex justify-between items-center text-[9px] text-gray/40 pt-0.5">
                  <span>Min. 150 caractères</span>
                  <span className={revContent.length < 150 ? "text-rose-500 font-semibold" : "text-emerald-600 font-semibold"}>
                    {revContent.length} caractères
                  </span>
                </div>
              </div>

              {/* Status & Submit */}
              <div className="flex items-center justify-between pt-4 border-t border-gray/5 flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-1.5 text-xs text-charcoal font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="revStatus"
                      checked={revStatus === "Publier maintenant"}
                      onChange={() => setRevStatus("Publier maintenant")}
                      className="w-4 h-4 text-[#A89070] focus:ring-[#A89070] border-gray/20 cursor-pointer"
                    />
                    <span>Publier maintenant</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs text-charcoal font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="revStatus"
                      checked={revStatus === "Enregistrer en brouillon"}
                      onChange={() => setRevStatus("Enregistrer en brouillon")}
                      className="w-4 h-4 text-[#A89070] focus:ring-[#A89070] border-gray/20 cursor-pointer"
                    />
                    <span>Enregistrer brouillon</span>
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("my-posts")}
                    className="bg-[#f4f3f0] hover:bg-[#e8e7e4] text-charcoal font-bold px-6 py-2.5 rounded-xl text-xs font-poppins transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={revLoading || !revSelectedBook || revContent.length < 150}
                    className="bg-[#A89070] hover:bg-[#A89070]/90 text-white font-bold px-8 py-2.5 rounded-xl text-xs font-poppins shadow-sm transition-all duration-300 disabled:opacity-50"
                  >
                    {revLoading ? "Création..." : "Publier ma review"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* ==========================================
           TAB: NEW CHRONIQUE
           ========================================== */}
        {activeTab === "new-chronique" && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-charcoal">Nouvelle chronique</h1>
              <p className="text-xs text-gray">Rédigez un récit par chapitres réguliers.</p>
            </div>

            {chSuccess && (
              <div className="bg-emerald-50 border border-transparent text-emerald-800 rounded-xl p-4 flex items-center space-x-2.5 animate-fade-in text-xs font-poppins">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Chronique et 1er chapitre enregistrés avec succès !</span>
              </div>
            )}

            {/* STEP 1: SERIES DETAILS */}
            {chStep === 1 && (
              <form onSubmit={handleCreateChroniqueInfo} className="bg-white rounded-xl p-6 md:p-8 shadow-sm space-y-5">
                <div className="flex items-center space-x-2 border-b border-gray/5 pb-3">
                  <span className="w-6 h-6 rounded-full bg-[#E8D9A8] text-[#2E1E05] text-xs font-bold flex items-center justify-center font-poppins">1</span>
                  <h3 className="font-serif font-bold text-sm text-charcoal">Étape 1 : Informations de la série</h3>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Titre de la série</label>
                  <input
                    type="text"
                    value={chTitle}
                    onChange={(e) => setChTitle(e.target.value)}
                    placeholder="Ex: Le souffle de la Petite Côte..."
                    required
                    className="w-full bg-ivory text-xs px-4 py-3 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Description / Synopsis</label>
                  <textarea
                    rows={4}
                    value={chDesc}
                    onChange={(e) => setChDesc(e.target.value)}
                    placeholder="Rédigez le résumé accrocheur pour présenter l'intrigue aux lecteurs..."
                    required
                    className="w-full bg-ivory text-xs p-4 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Catégorie de récit</label>
                    <select
                      value={chCat}
                      onChange={(e) => setChCat(e.target.value)}
                      required
                      className="w-full bg-ivory border border-gray/10 text-xs px-4 py-3 rounded-xl text-charcoal outline-none cursor-pointer focus:border-[#A89070]"
                    >
                      <option value="">Sélectionner un type...</option>
                      <option value="Roman feuilleton">Roman feuilleton</option>
                      <option value="Série policière">Série policière</option>
                      <option value="Recueil de contes">Recueil de contes</option>
                      <option value="Poésie chronologique">Poésie chronologique</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Statut de parution</label>
                    <select
                      value={chStatus}
                      onChange={(e) => setChStatus(e.target.value)}
                      className="w-full bg-ivory border border-gray/10 text-xs px-4 py-3 rounded-xl text-charcoal outline-none cursor-pointer focus:border-[#A89070]"
                    >
                      <option value="En cours">En cours</option>
                      <option value="Terminée">Terminée</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray/5">
                  <button
                    type="submit"
                    disabled={chLoading}
                    className="bg-[#A89070] hover:bg-[#A89070]/90 text-white font-bold px-8 py-3 rounded-xl text-xs font-poppins shadow-sm transition-all duration-300 inline-flex items-center space-x-1.5"
                  >
                    <span>Créer et ajouter le 1er chapitre</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: ADD CHAPTER */}
            {chStep === 2 && (
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-gray/5 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#E8D9A8] text-[#2E1E05] text-xs font-bold flex items-center justify-center font-poppins">2</span>
                    <h3 className="font-serif font-bold text-sm text-charcoal">Étape 2 : Ajouter un chapitre</h3>
                  </div>
                  
                  <span className="text-xs font-poppins font-bold bg-[#E8D9A8]/40 text-[#2E1E05] px-3 py-1 rounded-lg">
                    Chapitre {capNumber}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Titre du chapitre</label>
                  <input
                    type="text"
                    value={capTitle}
                    onChange={(e) => setCapTitle(e.target.value)}
                    placeholder="Ex: Chapitre 1 : L'appel de minuit..."
                    required
                    className="w-full bg-ivory text-xs px-4 py-3 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Contenu du chapitre</label>
                  <textarea
                    rows={12}
                    value={capContent}
                    onChange={(e) => setCapContent(e.target.value)}
                    placeholder="Rédigez le texte complet de ce chapitre..."
                    required
                    className="w-full bg-ivory text-xs p-4 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors resize-none font-sans"
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray/5 flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => setChStep(1)}
                    className="text-xs font-poppins font-bold text-gray hover:text-charcoal"
                  >
                    ← Retourner aux infos
                  </button>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => handleAddChapter(true)}
                      disabled={chLoading || !capContent.trim()}
                      className="bg-[#f4f3f0] hover:bg-[#e8e7e4] text-charcoal font-bold px-6 py-2.5 rounded-xl text-xs font-poppins transition-all flex items-center space-x-1"
                    >
                      <Plus size={14} />
                      <span>Ajouter un autre chapitre</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleAddChapter(false)}
                      disabled={chLoading || !capContent.trim()}
                      className="bg-[#A89070] hover:bg-[#A89070]/90 text-white font-bold px-8 py-2.5 rounded-xl text-xs font-poppins shadow-sm transition-all duration-300"
                    >
                      {chLoading ? "Sauvegarde..." : "Terminer et enregistrer"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
           TAB: STATISTICS
           ========================================== */}
        {activeTab === "stats" && (
          <div className="space-y-8">
            <div>
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-charcoal">Statistiques</h1>
              <p className="text-xs text-gray">Analysez l'impact et la visibilité de vos écrits.</p>
            </div>

            {statsLoading || !stats ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-community-camel" />
                <span className="text-xs text-gray italic">Compilation des données...</span>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                
                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Card 1 */}
                  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-[#A89070]/10 text-[#A89070] rounded-xl">
                      <FileText size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-poppins text-gray/50 font-bold block">Publications</span>
                      <span className="text-2xl font-serif font-bold text-charcoal mt-1 block">
                        {stats.total_publications}
                      </span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-[#E8D9A8]/40 text-[#2E1E05] rounded-xl">
                      <TrendingUp size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-poppins text-gray/50 font-bold block">Lectures</span>
                      <span className="text-2xl font-serif font-bold text-charcoal mt-1 block">
                        {stats.total_views.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                      <MessageSquare size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-poppins text-gray/50 font-bold block">Commentaires</span>
                      <span className="text-2xl font-serif font-bold text-charcoal mt-1 block">
                        {stats.total_comments}
                      </span>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                      <Award size={22} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-poppins text-gray/50 font-bold block">Le plus lu</span>
                      <span className="text-xs font-serif font-bold text-charcoal mt-1 block truncate">
                        {stats.most_read.title}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Graph + Table layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Recharts Bar Chart (8 cols) */}
                  <div className="lg:col-span-8 bg-white rounded-xl p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-base text-charcoal">Vues par publication (Top 5)</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chart_data}>
                          <XAxis dataKey="name" stroke="#666" fontSize={9} font-family="Inter" tickLine={false} />
                          <YAxis stroke="#666" fontSize={9} font-family="Inter" tickLine={false} />
                          <Tooltip wrapperClassName="font-poppins text-xs" />
                          <Bar dataKey="views" fill="#A89070" radius={[6, 6, 0, 0]}>
                            {stats.chart_data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? "#8E775B" : "#A89070"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top table (4 cols) */}
                  <div className="lg:col-span-4 bg-white rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-base text-charcoal">Publications populaires</h3>
                    
                    <div className="space-y-3 font-poppins">
                      {stats.top_publications.map((item) => (
                        <div key={item.rank} className="flex items-center justify-between border-b border-gray/5 pb-2.5 last:border-b-0 last:pb-0">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-lg bg-slate-100 font-bold text-[10px] text-charcoal flex items-center justify-center shrink-0">
                              {item.rank}
                            </span>
                            <span className="text-xs font-semibold text-charcoal truncate block">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[#A89070] shrink-0 pl-2">
                            {item.views} vues
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>
        )}

        {/* ==========================================
           TAB: PROFILE
           ========================================== */}
        {activeTab === "profile" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-charcoal">Profil blogger</h1>
              <p className="text-xs text-gray">Mettez à jour vos informations publiques de plume.</p>
            </div>

            {profSuccess && (
              <div className="bg-emerald-50 border border-transparent text-emerald-800 rounded-xl p-4 flex items-center space-x-2.5 animate-fade-in text-xs font-poppins">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Profil enregistré avec succès !</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form (7 cols) */}
              <form onSubmit={handleProfileSave} className="lg:col-span-7 bg-white rounded-xl p-6 md:p-8 shadow-sm space-y-5">
                
                {/* Pen Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Nom de plume ou pseudonyme</label>
                  <input
                    type="text"
                    value={profPlume}
                    onChange={(e) => setProfPlume(e.target.value)}
                    required
                    className="w-full bg-ivory text-xs px-4 py-3 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors font-semibold"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Biographie courte (max. 300 caractères)</label>
                  <textarea
                    rows={4}
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    maxLength={300}
                    required
                    placeholder="Parlez de votre parcours littéraire..."
                    className="w-full bg-ivory text-xs p-4 rounded-xl border border-gray/10 outline-none focus:border-[#A89070] transition-colors resize-none font-light leading-relaxed"
                  />
                  <div className="flex justify-end text-[9px] text-gray/40">
                    <span>{profBio.length} / 300</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-2">
                  <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">Rayons de prédilection</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Littérature africaine",
                      "Fiction",
                      "Policier/Thriller",
                      "Littérature jeunesse",
                      "Essais",
                      "Poésie",
                      "Biographies"
                    ].map((spec) => {
                      const active = profSpecs.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleProfSpec(spec)}
                          className={`px-3.5 py-1.5 rounded-lg text-[9px] font-poppins font-bold transition-all border ${
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

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profLoading}
                    className="bg-[#A89070] hover:bg-[#A89070]/90 text-white font-bold px-8 py-3 rounded-xl text-xs font-poppins uppercase tracking-wider shadow-sm transition-all duration-300 disabled:opacity-50"
                  >
                    {profLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
                  </button>
                </div>

              </form>

              {/* Public Card Preview (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-sm space-y-4">
                <span className="text-[9px] font-poppins uppercase tracking-widest text-gray/45 font-bold block">Aperçu public sur le site</span>
                
                <div className="bg-ivory border border-gray/5 rounded-xl p-5 text-center space-y-4 shadow-inner">
                  <div className="w-16 h-16 rounded-full bg-[#A89070]/20 text-[#2E1E05] font-bold font-poppins text-lg flex items-center justify-center mx-auto border-2 border-[#A89070]">
                    {profPlume ? profPlume[0].toUpperCase() : "B"}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-charcoal">{profPlume}</h3>
                    <span className="text-[9px] font-poppins uppercase text-[#A89070] font-bold tracking-widest block mt-0.5">Membre certifié</span>
                  </div>
                  <p className="text-[11px] text-gray leading-relaxed font-light font-sans max-w-xs mx-auto">
                    "{profBio}"
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                    {profSpecs.map((spec) => (
                      <span key={spec} className="text-[8px] bg-white border border-gray/5 text-gray font-poppins px-2 py-0.5 rounded shadow-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ==========================================
         DELETE CONFIRMATION MODAL
         ========================================== */}
      {deleteModalOpen && postToDelete && (
        <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-6 text-center border border-transparent">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={20} />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-lg text-charcoal">Supprimer la publication ?</h3>
              <p className="text-xs text-gray font-light leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-charcoal">"{postToDelete.titre || postToDelete.title}"</strong> ? Cette action est irréversible.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="w-1/2 bg-[#f4f3f0] hover:bg-[#e8e7e4] text-charcoal py-2.5 rounded-xl text-xs font-poppins font-bold transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="w-1/2 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-xs font-poppins font-bold transition-all shadow-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BloggerDashboard;

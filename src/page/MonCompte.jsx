import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, ShoppingBag, BookOpen, Key, LogOut, FileText, CheckCircle2, AlertCircle, Tag, Trash2, Edit3, ExternalLink, Share2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";

const MonCompte = () => {
  const { user, logout, updateUser } = useAuth();
  
  // Tab states: 'profile' | 'commands' | 'sales' | 'supplies'
  const [activeTab, setActiveTab] = useState("profile");

  const location = useLocation();

  // Sales submissions states
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesFilter, setSalesFilter] = useState("all");
  const [expandedReasonId, setExpandedReasonId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Orders lists
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Password Form States
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("idle");
  const [passwordMsg, setPasswordMsg] = useState("");

  // Auto-switch tab if location.state dictates it
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Fetch orders history
  useEffect(() => {
    if (activeTab === "commands" || activeTab === "supplies") {
      setLoadingOrders(true);
      apiClient
        .get("/mes-commandes")
        .then((res) => {
          if (res.data && res.data.success) {
            setOrders(res.data.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab]);

  // Fetch sales submissions
  useEffect(() => {
    if (activeTab === "sales") {
      setLoadingSales(true);
      apiClient
        .get("/vendre-livre")
        .then((res) => {
          if (res.data && res.data.success) {
            setSales(res.data.data || []);
          }
        })
        .catch((err) => console.error("Error fetching sales submissions", err))
        .finally(() => setLoadingSales(false));
    }
  }, [activeTab]);

  // Auto-clear toast messages
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleDeleteSubmission = async (id) => {
    try {
      const res = await apiClient.delete(`/vendre-livre/${id}`);
      if (res.data && res.data.success) {
        setSales(prev => prev.filter(item => item.id !== id));
        setToastMessage("Annonce retirée avec succès.");
      }
    } catch (err) {
      console.error("Failed to delete submission", err);
      setToastMessage("Une erreur est survenue lors de la suppression.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleShareLink = (item) => {
    const mockUrl = `${window.location.origin}/catalogue/${item.id}`;
    navigator.clipboard.writeText(mockUrl)
      .then(() => {
        setToastMessage("Lien de l'annonce copié dans le presse-papier !");
      })
      .catch(() => {
        setToastMessage("Impossible de copier le lien.");
      });
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setPasswordStatus("error");
      setPasswordMsg("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordStatus("error");
      setPasswordMsg("Les mots de passe de confirmation ne correspondent pas.");
      return;
    }

    setPasswordStatus("loading");
    setPasswordMsg("");

    try {
      const response = await apiClient.put("/user/update", {
        password,
        password_confirmation: passwordConfirm,
      });

      if (response.data && response.data.success) {
        setPasswordStatus("success");
        setPasswordMsg("Votre mot de passe a été modifié avec succès.");
        setPassword("");
        setPasswordConfirm("");
        // Update user state if context supports it
        if (updateUser) {
          updateUser(response.data.data);
        }
      } else {
        throw new Error(response.data?.message || "La modification a échoué.");
      }
    } catch (error) {
      setPasswordStatus("error");
      setPasswordMsg(
        error.response?.data?.message || 
        error.message || 
        "Erreur lors de la modification du mot de passe."
      );
    }
  };

  // Get initials for Avatar
  const getInitials = () => {
    if (!user || !user.fullname) return "U";
    return user.fullname
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Filter orders by type
  const bookOrders = orders.filter((o) => o.type === "Livre");
  const supplyOrders = orders.filter((o) => o.type === "Fourniture");

  return (
    <div className="container mx-auto px-6 md:px-12 max-w-6xl py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* ==========================================
           1. SIDEBAR - PROFILE HEADER & TAB SWITCHER (25%)
           ========================================== */}
        <aside className="lg:col-span-3 bg-white rounded-3xl p-6 border border-primary-soft/20 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-primary-soft/10">
            {/* Initials Avatar */}
            <div className="w-16 h-16 bg-primary-soft/40 text-primary-dark font-serif font-bold text-xl rounded-full flex items-center justify-center border-2 border-primary shadow-inner">
              {getInitials()}
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-charcoal leading-tight">
                {user?.fullname || "Lecteur Bëgg Lire"}
              </h2>
              <p className="text-xs text-gray/70">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col space-y-1 font-poppins">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center space-x-3 text-left text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl transition-all ${
                activeTab === "profile"
                  ? "bg-primary-soft/30 text-primary-dark"
                  : "text-gray hover:text-charcoal hover:bg-ivory"
              }`}
            >
              <User size={16} />
              <span>Mes informations</span>
            </button>

            <button
              onClick={() => setActiveTab("commands")}
              className={`flex items-center space-x-3 text-left text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl transition-all ${
                activeTab === "commands"
                  ? "bg-primary-soft/30 text-primary-dark"
                  : "text-gray hover:text-charcoal hover:bg-ivory"
              }`}
            >
              <ShoppingBag size={16} />
              <span>Mes commandes</span>
            </button>

            <button
              onClick={() => setActiveTab("sales")}
              className={`flex items-center space-x-3 text-left text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl transition-all ${
                activeTab === "sales"
                  ? "bg-primary-soft/30 text-primary-dark"
                  : "text-gray hover:text-charcoal hover:bg-ivory"
              }`}
            >
              <Tag size={16} />
              <span>Mes ventes</span>
            </button>

            <button
              onClick={() => setActiveTab("supplies")}
              className={`flex items-center space-x-3 text-left text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl transition-all ${
                activeTab === "supplies"
                  ? "bg-primary-soft/30 text-primary-dark"
                  : "text-gray hover:text-charcoal hover:bg-ivory"
              }`}
            >
              <BookOpen size={16} />
              <span>Mes fournitures</span>
            </button>

            <hr className="border-t border-primary-soft/10 my-2" />

            <button
              onClick={logout}
              className="flex items-center space-x-3 text-left text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl text-destructive hover:bg-destructive/5 transition-all"
            >
              <LogOut size={16} />
              <span>Se déconnecter</span>
            </button>
          </nav>
        </aside>

        {/* ==========================================
           2. CONTENT WINDOW (75%)
           ========================================== */}
        <main className="lg:col-span-9 bg-white rounded-3xl p-6 md:p-8 border border-primary-soft/20 shadow-sm min-h-[400px]">
          
          {/* TAB: PROFILE & PASSWORD EDIT */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div className="border-b border-primary-soft/10 pb-4">
                <h3 className="font-serif font-bold text-xl text-charcoal">Mes informations personnelles</h3>
                <p className="text-xs text-gray">Consultez vos coordonnées de livraison</p>
              </div>

              {/* READ-ONLY PERSONAL DATA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1 bg-ivory p-4 rounded-xl border border-primary-soft/10">
                  <span className="text-[10px] uppercase font-poppins text-gray/50 font-semibold block">Prénom / Nom</span>
                  <span className="font-medium text-charcoal">{user?.fullname || "-"}</span>
                </div>
                <div className="space-y-1 bg-ivory p-4 rounded-xl border border-primary-soft/10">
                  <span className="text-[10px] uppercase font-poppins text-gray/50 font-semibold block">Adresse email</span>
                  <span className="font-medium text-charcoal">{user?.email || "-"}</span>
                </div>
                <div className="space-y-1 bg-ivory p-4 rounded-xl border border-primary-soft/10">
                  <span className="text-[10px] uppercase font-poppins text-gray/50 font-semibold block">Téléphone</span>
                  <span className="font-medium text-charcoal">{user?.phoneNumber || user?.telephone || "-"}</span>
                </div>
                <div className="space-y-1 bg-ivory p-4 rounded-xl border border-primary-soft/10">
                  <span className="text-[10px] uppercase font-poppins text-gray/50 font-semibold block">Localité / Adresse</span>
                  <span className="font-medium text-charcoal">{user?.locality || "-"}</span>
                </div>
                
                {/* Coming Soon notice for field editing */}
                <div className="md:col-span-2 text-xs text-primary bg-primary-soft/10 border border-primary-soft/20 rounded-xl p-3 font-poppins">
                  Note : La mise à jour des coordonnées personnelles est en cours de développement. Pour modifier vos adresses ou numéro de téléphone, veuillez contacter le service client.
                </div>
              </div>

              {/* PASSWORD UPDATE FORM (Supported by Backend UserController) */}
              <form onSubmit={handlePasswordUpdate} className="space-y-6 pt-6 border-t border-primary-soft/10">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-lg text-charcoal flex items-center">
                    <Key size={16} className="mr-2 text-accent-gold" /> Modifier mon mot de passe
                  </h4>
                  <p className="text-xs text-gray">Sécurisez l'accès à votre compte lecteur</p>
                </div>

                {passwordMsg && (
                  <div className={`flex items-center space-x-2 text-xs p-3 rounded-lg border animate-fade-in ${
                    passwordStatus === "success" 
                      ? "bg-primary-soft/20 border-primary text-primary-dark"
                      : "bg-destructive/10 border-destructive text-destructive"
                  }`}>
                    {passwordStatus === "success" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    <span>{passwordMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-gray uppercase tracking-wider">Nouveau mot de passe</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8 caractères minimum"
                      className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-gray uppercase tracking-wider">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      required
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Ressaisir le mot de passe"
                      className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordStatus === "loading"}
                    className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {passwordStatus === "loading" ? "Mise à jour..." : "Modifier le mot de passe"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: BOOK ORDERS */}
          {activeTab === "commands" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-primary-soft/10 pb-4">
                <h3 className="font-serif font-bold text-xl text-charcoal">Mes commandes de livres</h3>
                <p className="text-xs text-gray">Consultez l'historique de vos achats littéraires</p>
              </div>

              {loadingOrders ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-dark" />
                </div>
              ) : bookOrders.length > 0 ? (
                <div className="space-y-4">
                  {bookOrders.map((order) => (
                    <div
                      key={order.reference}
                      className="p-5 bg-ivory rounded-2xl border border-primary-soft/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-charcoal">Réf: {order.reference}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-poppins font-bold ${
                            order.status ? "bg-primary-soft/30 text-primary-dark" : "bg-accent-gold/20 text-charcoal"
                          }`}>
                            {order.status ? "Payé" : "En cours / Livraison"}
                          </span>
                        </div>
                        <p className="text-xs text-gray/80">Commandé le : {new Date(order.date).toLocaleDateString()}</p>
                        <p className="font-medium text-charcoal">{order.name} ({order.articles_count} articles)</p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                        <span className="font-serif font-bold text-primary-dark text-base">
                          {Number(order.total).toLocaleString()} CFA
                        </span>
                        <Link
                          to={`/commande/${order.reference}`}
                          className="bg-white border border-primary hover:bg-primary hover:text-white text-primary text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center space-x-1"
                        >
                          <FileText size={12} />
                          <span>Facture</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray/60 font-serif bg-ivory rounded-2xl border border-dashed border-primary-soft/30">
                  <ShoppingBag size={24} className="mx-auto mb-2 text-primary-soft" />
                  Vous n'avez passé aucune commande de livres pour le moment.
                </div>
              )}
            </div>
          )}

          {/* TAB: SCHOOL SUPPLY ORDERS */}
          {activeTab === "supplies" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-primary-soft/10 pb-4">
                <h3 className="font-serif font-bold text-xl text-charcoal">Mes commandes de fournitures</h3>
                <p className="text-xs text-gray">Consultez l'historique de vos fournitures scolaires</p>
              </div>

              {loadingOrders ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-dark" />
                </div>
              ) : supplyOrders.length > 0 ? (
                <div className="space-y-4">
                  {supplyOrders.map((order) => (
                    <div
                      key={order.reference}
                      className="p-5 bg-ivory rounded-2xl border border-primary-soft/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-charcoal">Réf: {order.reference}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-poppins font-bold ${
                            order.status ? "bg-primary-soft/30 text-primary-dark" : "bg-accent-gold/20 text-charcoal"
                          }`}>
                            {order.status ? "Payé" : "En cours"}
                          </span>
                        </div>
                        <p className="text-xs text-gray/80">Commandé le : {new Date(order.date).toLocaleDateString()}</p>
                        <p className="font-medium text-charcoal">{order.name} ({order.articles_count} articles)</p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                        <span className="font-serif font-bold text-primary-dark text-base">
                          {Number(order.total).toLocaleString()} CFA
                        </span>
                        <Link
                          to={`/commande/${order.reference}`}
                          className="bg-white border border-primary hover:bg-primary hover:text-white text-primary text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center space-x-1"
                        >
                          <FileText size={12} />
                          <span>Facture</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray/60 font-serif bg-ivory rounded-2xl border border-dashed border-primary-soft/30">
                  <BookOpen size={24} className="mx-auto mb-2 text-primary-soft" />
                  Vous n'avez passé aucune commande de fournitures scolaires pour le moment.
                </div>
              )}
            </div>
          )}

          {/* TAB: SALES SUBMISSIONS */}
          {activeTab === "sales" && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header de section */}
              <div className="border-b border-primary-soft/10 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-xl text-charcoal">Mes annonces de vente</h3>
                  <p className="text-xs text-gray font-poppins">
                    {(() => {
                      const total = sales.length;
                      const pending = sales.filter((s) => s.statut === "en_attente").length;
                      const approved = sales.filter((s) => s.statut === "approuve").length;
                      const refused = sales.filter((s) => s.statut === "refuse").length;
                      return `${total} annonce${total > 1 ? "s" : ""} · ${pending} en attente · ${approved} approuvée${approved > 1 ? "s" : ""} · ${refused} refusée${refused > 1 ? "s" : ""}`;
                    })()}
                  </p>
                </div>
                <Link
                  to="/vendre-un-livre"
                  className="bg-[#1c380e] hover:bg-primary-dark text-white font-poppins text-xs font-bold py-2.5 px-4 rounded-xl shadow transition-all flex items-center justify-center space-x-1.5 self-start md:self-center shrink-0"
                >
                  <Plus size={14} />
                  <span>Vendre un livre</span>
                </Link>
              </div>

              {/* Status Filters */}
              {sales.length > 0 && (
                <div className="flex flex-wrap gap-2 select-none">
                  {[
                    { id: "all", label: "Tous" },
                    { id: "en_attente", label: "En attente" },
                    { id: "approuve", label: "Approuvés" },
                    { id: "refuse", label: "Refusés" }
                  ].map((filter) => {
                    const active = salesFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setSalesFilter(filter.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-poppins font-semibold transition-all ${
                          active
                            ? "bg-[#1c380e] text-white shadow-sm"
                            : "bg-ivory border border-primary-soft/20 text-gray hover:text-charcoal hover:bg-slate-50"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Loading State */}
              {loadingSales ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-dark" />
                </div>
              ) : (() => {
                // Filter listings
                const filteredSales = sales.filter((s) => {
                  if (salesFilter === "all") return true;
                  return s.statut === salesFilter;
                });

                if (filteredSales.length > 0) {
                  return (
                    <div className="space-y-4 font-sans">
                      {filteredSales.map((item) => {
                        const isExpanded = expandedReasonId === item.id;
                        const formattedDate = item.created_at
                          ? new Date(item.created_at).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric"
                            })
                          : "-";

                        // Get condition colors
                        const getConditionBadge = (cond) => {
                          switch (cond) {
                            case "neuf":
                              return "bg-emerald-50 text-emerald-800 border-emerald-100";
                            case "tres_bon":
                              return "bg-blue-50 text-blue-800 border-blue-100";
                            case "bon":
                              return "bg-amber-50 text-amber-800 border-amber-100";
                            case "acceptable":
                              return "bg-orange-50 text-orange-800 border-orange-100";
                            default:
                              return "bg-slate-50 text-slate-800 border-slate-100";
                          }
                        };

                        const getConditionLabel = (cond) => {
                          switch (cond) {
                            case "neuf": return "Neuf";
                            case "tres_bon": return "Très bon";
                            case "bon": return "Bon";
                            case "acceptable": return "Acceptable";
                            default: return cond || "-";
                          }
                        };

                        return (
                          <div
                            key={item.id}
                            className="bg-white border border-primary-soft/20 rounded-2xl p-5 space-y-4 hover:shadow-sm transition-all duration-300"
                          >
                            <div className="flex flex-col md:flex-row gap-5 items-start">
                              
                              {/* Left: Book Cover */}
                              <div className="w-16 h-20 bg-primary-soft/10 rounded-lg overflow-hidden shrink-0 border border-primary-soft/5 shadow-sm flex items-center justify-center">
                                {item.cover ? (
                                  <img
                                    src={item.cover}
                                    alt={item.titre}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="text-primary-dark/30" size={24} />
                                )}
                              </div>

                              {/* Center: Info */}
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <h4 className="font-serif font-bold text-base text-charcoal leading-snug">
                                  {item.titre}
                                </h4>
                                <p className="text-xs text-gray/85 font-light">
                                  Par {item.auteur}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <span className={`text-[9px] font-poppins font-bold px-2 py-0.5 rounded border uppercase ${getConditionBadge(item.etat)}`}>
                                    {getConditionLabel(item.etat)}
                                  </span>
                                  <span className="text-[9px] font-poppins font-bold bg-primary-soft/30 text-primary-dark px-2.5 py-0.5 rounded uppercase">
                                    {item.categorie || "Roman"}
                                  </span>
                                  {item.type_exemplaire === "stock" && (
                                    <span className="text-[9px] font-poppins font-semibold bg-[#1c380e]/10 text-[#1c380e] px-2.5 py-0.5 rounded border border-[#1c380e]/20">
                                      {item.quantite} exemplaires disponibles
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center space-x-3 pt-1.5">
                                  <span className="font-serif font-bold text-[#1c380e] text-base">
                                    {Number(item.prix).toLocaleString()} FCFA
                                  </span>
                                  <span className="text-[10px] text-gray/50 font-poppins">
                                    Soumis le {formattedDate}
                                  </span>
                                </div>
                              </div>

                              {/* Right: Status badge */}
                              <div className="shrink-0 flex flex-col items-start md:items-end space-y-1 w-full md:w-auto">
                                {item.statut === "en_attente" && (
                                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-left md:text-right w-full md:w-auto">
                                    <span className="text-xs font-poppins font-bold text-amber-800 block">
                                      🟡 En attente
                                    </span>
                                    <span className="text-[9px] text-amber-700/70 font-poppins font-medium block mt-0.5">
                                      Vérification sous 24-48h
                                    </span>
                                  </div>
                                )}
                                
                                {item.statut === "approuve" && (
                                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-left md:text-right w-full md:w-auto">
                                    <span className="text-xs font-poppins font-bold text-emerald-800 block">
                                      🟢 Approuvé
                                    </span>
                                    <span className="text-[9px] text-emerald-700/70 font-poppins font-medium block mt-0.5">
                                      En vente sur Bëgg Lire
                                    </span>
                                  </div>
                                )}

                                {item.statut === "refuse" && (
                                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-left md:text-right w-full md:w-auto">
                                    <div className="flex items-center justify-between md:justify-end gap-3 w-full">
                                      <span className="text-xs font-poppins font-bold text-rose-800 block text-left md:text-right">
                                        🔴 Refusé
                                      </span>
                                      <button
                                        onClick={() => setExpandedReasonId(isExpanded ? null : item.id)}
                                        className="text-[10px] font-poppins font-bold text-rose-700 hover:underline flex items-center space-x-0.5"
                                      >
                                        <span>Voir le motif</span>
                                        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                            </div>

                            {/* Refusal motive details accordion */}
                            {item.statut === "refuse" && isExpanded && (
                              <div className="bg-rose-50/50 border border-rose-100/30 rounded-xl p-4 text-xs text-rose-900 animate-fade-in space-y-1">
                                <span className="font-semibold text-[10px] uppercase font-poppins text-rose-950 block">Motif du refus :</span>
                                <p className="italic leading-normal">"{item.motif_refus || "Aucun motif fourni par l'équipe de validation."}"</p>
                              </div>
                            )}

                            {/* Actions block */}
                            <div className="border-t border-primary-soft/5 pt-3.5 flex flex-wrap gap-2.5 justify-end">
                              {item.statut === "en_attente" && (
                                <>
                                  <Link
                                    to={`/vendre-un-livre?edit=${item.id}`}
                                    className="bg-white border border-[#1c380e] hover:bg-[#1c380e]/5 text-[#1c380e] text-[10px] font-poppins font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center space-x-1"
                                  >
                                    <Edit3 size={11} />
                                    <span>Modifier</span>
                                  </Link>
                                  <button
                                    onClick={() => setDeleteConfirmId(item.id)}
                                    className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-[10px] font-poppins font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center space-x-1"
                                  >
                                    <Trash2 size={11} />
                                    <span>Retirer l'annonce</span>
                                  </button>
                                </>
                              )}

                              {item.statut === "refuse" && (
                                <Link
                                  to={`/vendre-un-livre?edit=${item.id}`}
                                  className="bg-[#1c380e] hover:bg-primary-dark text-white text-[10px] font-poppins font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1"
                                >
                                  <Edit3 size={11} />
                                  <span>Corriger et resoumettre</span>
                                </Link>
                              )}

                              {item.statut === "approuve" && (
                                <>
                                  <Link
                                    to="/catalogue"
                                    className="bg-white border border-primary-soft text-primary-dark hover:bg-primary-soft/20 text-[10px] font-poppins font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center space-x-1"
                                  >
                                    <ExternalLink size={11} />
                                    <span>Voir l'annonce</span>
                                  </Link>
                                  <button
                                    onClick={() => handleShareLink(item)}
                                    className="bg-white border border-primary-soft text-primary-dark hover:bg-primary-soft/20 text-[10px] font-poppins font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center space-x-1"
                                  >
                                    <Share2 size={11} />
                                    <span>Partager</span>
                                  </button>
                                </>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // Empty state
                return (
                  <div className="text-center py-16 bg-ivory rounded-3xl border border-dashed border-primary-soft/30 flex flex-col items-center justify-center p-6 space-y-4 animate-fade-in max-w-lg mx-auto">
                    <div className="w-16 h-16 bg-primary-soft/30 text-primary-dark rounded-full flex items-center justify-center">
                      <BookOpen size={28} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-lg text-charcoal">
                        {salesFilter === "all" 
                          ? "Vous n'avez pas encore mis de livre en vente" 
                          : "Aucune annonce correspondant à ce filtre"
                        }
                      </h4>
                      <p className="text-xs text-gray font-light max-w-xs leading-relaxed">
                        {salesFilter === "all" 
                          ? "Rejoignez des centaines de vendeurs sur Bëgg Lire et donnez une seconde vie à vos livres." 
                          : "Essayez de sélectionner un autre statut de filtre ci-dessus."
                        }
                      </p>
                    </div>
                    {salesFilter === "all" && (
                      <Link
                        to="/vendre-un-livre"
                        className="bg-[#1c380e] hover:bg-primary-dark text-white font-poppins text-xs font-bold py-2.5 px-6 rounded-xl shadow uppercase tracking-wider transition-all"
                      >
                        Vendre mon premier livre
                      </Link>
                    )}
                  </div>
                );
              })()}

            </div>
          )}

        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-primary-soft/20 shadow-xl space-y-5 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-lg text-charcoal">
                Retirer cette annonce ?
              </h4>
              <p className="text-xs text-gray font-light leading-relaxed">
                Êtes-vous sûr de vouloir retirer cette annonce ? Cette action est définitive.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 border border-[#1c380e] text-[#1c380e] hover:bg-[#1c380e]/5 font-poppins font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteSubmission(deleteConfirmId)}
                className="w-1/2 bg-destructive hover:bg-red-700 text-white font-poppins font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c380e] text-white font-poppins text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-primary-light/10 animate-slide-in-up">
          <CheckCircle2 size={14} className="text-primary animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default MonCompte;

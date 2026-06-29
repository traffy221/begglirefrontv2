import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Share2, 
  Link as LinkIcon, 
  MessageSquare, 
  Facebook, 
  User, 
  Calendar, 
  BookOpen, 
  Globe, 
  Landmark, 
  Hash, 
  Package, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart, 
  ShoppingBag, 
  ChevronRight, 
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useBookDetail } from "../hooks/useQueries";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import apiClient from "../api/client";

// Modular Subcomponents
import BookReviews from "../components/book-detail/BookReviews";
import RelatedBooks from "../components/book-detail/RelatedBooks";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshWishlistCount } = useAuth();
  const { addItem } = useCart();
  const dropdownRef = useRef(null);

  // States
  const [qty, setQty] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [heartPulsing, setHeartPulsing] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Queries
  const { data: bookResponse, isLoading: bookLoading, error: bookError } = useBookDetail(id);
  const book = bookResponse?.data || bookResponse;

  // View Increment useEffect
  useEffect(() => {
    if (id) {
      apiClient.post(`/livre-en-vente/${id}/vue`).catch(() => {
        // Fail silently to prevent disrupting user experience
      });
    }
  }, [id]);

  // Wishlist Check useEffect
  useEffect(() => {
    if (book?.id && isAuthenticated) {
      apiClient
        .post("/wishlist/check", { book_id: Number(book.id) })
        .then((res) => {
          if (res.data && res.data.success) {
            setIsInWishlist(res.data.is_in_wishlist ?? res.data.data ?? false);
          }
        })
        .catch(() => {});
    }
  }, [book?.id, isAuthenticated]);

  // Close share dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (bookLoading) {
    return <BookDetailSkeleton />;
  }

  if (bookError || !book) {
    const errorMsg = bookError?.response?.data?.message || "Le volume demandé est introuvable ou n'est plus proposé à la vente.";
    return <BookDetailError message={errorMsg} />;
  }

  // De-duplicating variables
  const stock = Number(book.stock !== undefined ? book.stock : (book.quantite !== undefined ? book.quantite : 1));
  const price = Number(book.prix_vente !== undefined ? book.prix_vente : (book.prix !== undefined ? book.prix : 0));
  const categoryName = book.category?.name || book.categorie || "Roman";
  const desc = book.description || "Aucun résumé n'est disponible pour cet ouvrage. Plongez dans ses pages pour découvrir son histoire et le style d'écriture de l'auteur.";

  const showReadMore = desc.length > 300;
  const displayedDesc = showReadMore && !isExpanded ? `${desc.substring(0, 300)}...` : desc;

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const coverUrl = getImgUrl(book.image || book.cover || book.image_link);

  const getConditionLabel = (cond) => {
    switch (cond) {
      case "neuf": return "Neuf";
      case "tres_bon": return "Très bon état";
      case "bon": return "Bon état";
      case "acceptable": return "Acceptable";
      default: return cond || "Bon état";
    }
  };

  // Quantity Handlers
  const incrementQty = () => {
    if (qty < stock) setQty((prev) => prev + 1);
  };

  const decrementQty = () => {
    if (qty > 1) setQty((prev) => prev - 1);
  };

  // Click handlers
  const handleAuthorClick = () => {
    navigate(`/recherche?q=${encodeURIComponent(book.auteur)}&type=auteurs`);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || wishlistLoading) return;
    setWishlistLoading(true);
    setHeartPulsing(true);
    setTimeout(() => setHeartPulsing(false), 500);

    try {
      if (isInWishlist) {
        await apiClient.post("/wishlist/remove", { book_id: Number(book.id) });
        setIsInWishlist(false);
      } else {
        await apiClient.post("/wishlist/add", { book_id: Number(book.id) });
        setIsInWishlist(true);
      }
      if (refreshWishlistCount) {
        refreshWishlistCount();
      }
    } catch (error) {
      console.error("Failed to update wishlist", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (stock <= 0 || isAddingToCart) return;
    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 150);

    if (addItem) {
      addItem({ ...book, prix_vente: price }, "book", qty);
    }

    const event = new CustomEvent("show-cart-toast", {
      detail: {
        titre: book.titre,
        cover: book.image || book.cover || book.image_link,
        quantite: qty
      }
    });
    window.dispatchEvent(event);
  };

  const handleBuyNow = () => {
    if (stock <= 0) return;
    if (addItem) {
      addItem({ ...book, prix_vente: price }, "book", qty);
    }
    navigate("/checkout");
  };

  // Share Handlers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setShowShareTooltip(true);
        setShareOpen(false);
        setTimeout(() => setShowShareTooltip(false), 2000);
      })
      .catch((err) => console.error("Failed to copy link", err));
  };

  const handleWhatsAppShare = () => {
    const text = `Découvre ce livre sur Bëgg Lire : ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    setShareOpen(false);
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
    setShareOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-ivory pb-16 font-sans">
      
      {/* 1. FIL D'ARIANE (BREADCRUMB) */}
      <div className="bg-[#f4f3f0] py-3.5 border-b border-gray/5 select-none">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl flex items-center space-x-2 text-[10px] font-poppins text-gray/50 font-bold uppercase tracking-wider">
          <Link to="/" className="hover:text-charcoal transition-colors">Accueil</Link>
          <ChevronRight size={10} />
          <Link to="/catalogue" className="hover:text-charcoal transition-colors">Catalogue</Link>
          <ChevronRight size={10} />
          <span className="truncate max-w-[120px] text-gray/40">{categoryName}</span>
          <ChevronRight size={10} />
          <span className="text-charcoal truncate max-w-[150px] font-bold">{book.titre}</span>
        </div>
      </div>

      {/* 2. LAYOUT PRINCIPAL (3 COLONNES DESKTOP) */}
      <div className="container mx-auto px-6 md:px-12 max-w-7xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* COLONNE GAUCHE — IMAGE DE COUVERTURE & PARTAGE */}
          <div className="lg:col-span-4 flex flex-col items-center space-y-6">
            
            {/* Couverture cadre avec ombre légère */}
            <div className="relative group w-full max-w-[280px] sm:max-w-[320px] bg-white rounded-3xl overflow-hidden border border-gray/10 shadow-[0_15px_45px_rgba(0,0,0,0.06)] transform transition-transform duration-300 hover:scale-[1.01]">
              <img
                src={coverUrl}
                alt={book.titre}
                className="w-full h-[380px] sm:h-[430px] object-cover"
              />
              <div className="absolute top-4 left-4 bg-[#76BD47] text-white text-[9px] font-poppins font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md z-10 select-none">
                {categoryName}
              </div>
            </div>

            {/* Bouton de Partage */}
            <div ref={dropdownRef} className="relative w-full max-w-[280px] sm:max-w-[320px]">
              <button
                type="button"
                onClick={() => setShareOpen((prev) => !prev)}
                className="w-full border border-charcoal/20 hover:border-charcoal hover:bg-charcoal/5 text-charcoal py-3 rounded-xl text-xs font-semibold font-poppins transition-all duration-300 flex items-center justify-center space-x-2 select-none"
              >
                <Share2 size={13} />
                <span>Partager cet ouvrage</span>
              </button>

              {shareOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray/10 rounded-2xl shadow-xl z-20 py-2 animate-fade-in text-charcoal text-left">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full text-left px-4 py-2.5 hover:bg-ivory text-xs font-semibold font-poppins flex items-center space-x-2.5 transition-colors"
                  >
                    <LinkIcon size={12} className="text-gray" />
                    <span>Copier le lien</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="w-full text-left px-4 py-2.5 hover:bg-ivory text-xs font-semibold font-poppins flex items-center space-x-2.5 transition-colors"
                  >
                    <MessageSquare size={12} className="text-emerald-500" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFacebookShare}
                    className="w-full text-left px-4 py-2.5 hover:bg-ivory text-xs font-semibold font-poppins flex items-center space-x-2.5 transition-colors"
                  >
                    <Facebook size={12} className="text-blue-600" />
                    <span>Facebook</span>
                  </button>
                </div>
              )}

              {showShareTooltip && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#181818] text-white text-[10px] font-bold font-poppins rounded-lg shadow-lg whitespace-nowrap z-30 select-none">
                  Lien copié !
                </div>
              )}
            </div>

          </div>

          {/* COLONNE CENTRALE — INFORMATIONS PRINCIPALES */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title & Publisher */}
            <div className="space-y-1">
              <h1 className="font-serif font-bold text-2xl md:text-3xl lg:text-4xl text-charcoal leading-tight">
                {book.titre}
              </h1>
              {book.editeur && (
                <p className="text-[11px] text-gray/50 font-poppins font-semibold uppercase tracking-wider">
                  Éditeur : {book.editeur}
                </p>
              )}
            </div>

            {/* Author Accent Sage Green */}
            <div className="text-xs font-poppins font-semibold">
              <span className="text-gray/50 uppercase text-[10px] tracking-wide">Écrit par </span>
              <span 
                onClick={handleAuthorClick}
                className="text-[#76BD47] hover:text-[#5fa236] hover:underline cursor-pointer transition-colors"
              >
                {book.auteur}
              </span>
            </div>

            {/* Description (Read more/less) */}
            <div className="space-y-2.5 pt-2 border-t border-gray/5">
              <p className="text-gray text-xs md:text-sm leading-relaxed whitespace-pre-line font-light">
                {displayedDesc}
              </p>
              
              {showReadMore && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="text-xs font-bold text-[#76BD47] hover:text-[#5fa236] flex items-center space-x-1 pt-1 select-none"
                >
                  <span>{isExpanded ? "Lire moins" : "Lire plus"}</span>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
            </div>

            {/* Technical Information Grid 6-Cols */}
            <div className="border-t border-b border-gray/10 py-6 mt-8">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                
                {/* Pages */}
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-gray/5 flex items-center justify-center text-[#76BD47]">
                    <BookOpen size={14} />
                  </div>
                  <span className="text-[8px] text-gray/50 font-poppins font-bold uppercase tracking-wider">Pages</span>
                  <span className="text-[10px] text-charcoal font-bold truncate max-w-[80px]">
                    {book.pages || book.nb_pages || "N/A"}
                  </span>
                </div>

                {/* Langue */}
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-gray/5 flex items-center justify-center text-[#76BD47]">
                    <Globe size={14} />
                  </div>
                  <span className="text-[8px] text-gray/50 font-poppins font-bold uppercase tracking-wider">Langue</span>
                  <span className="text-[10px] text-charcoal font-bold truncate max-w-[80px]">
                    {book.langue || "Français"}
                  </span>
                </div>

                {/* Date */}
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-gray/5 flex items-center justify-center text-[#76BD47]">
                    <Calendar size={14} />
                  </div>
                  <span className="text-[8px] text-gray/50 font-poppins font-bold uppercase tracking-wider">Date</span>
                  <span className="text-[10px] text-charcoal font-bold truncate max-w-[80px]">
                    {book.annee || "N/A"}
                  </span>
                </div>

                {/* Éditeur */}
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-gray/5 flex items-center justify-center text-[#76BD47]">
                    <Landmark size={14} />
                  </div>
                  <span className="text-[8px] text-gray/50 font-poppins font-bold uppercase tracking-wider">Éditeur</span>
                  <span className="text-[10px] text-charcoal font-bold truncate max-w-[80px]">
                    {book.editeur || "N/A"}
                  </span>
                </div>

                {/* ISBN */}
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-gray/5 flex items-center justify-center text-[#76BD47]">
                    <Hash size={14} />
                  </div>
                  <span className="text-[8px] text-gray/50 font-poppins font-bold uppercase tracking-wider">ISBN</span>
                  <span className="text-[10px] text-charcoal font-bold truncate max-w-[80px]">
                    {book.isbn || "N/A"}
                  </span>
                </div>

                {/* Stock */}
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-gray/5 flex items-center justify-center text-[#76BD47]">
                    <Package size={14} />
                  </div>
                  <span className="text-[8px] text-gray/50 font-poppins font-bold uppercase tracking-wider">Stock</span>
                  <span className="text-[10px] text-charcoal font-bold truncate max-w-[80px]">
                    {stock > 0 ? `${stock} ex` : "Rupture"}
                  </span>
                </div>

              </div>
              
              {/* Button Voir tous les détails */}
              <div className="text-center pt-5">
                <button
                  type="button"
                  onClick={() => document.getElementById("technical-specs")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-[10px] uppercase font-poppins font-bold text-[#76BD47] hover:text-[#5fa236] transition-colors inline-flex items-center space-x-1 select-none"
                >
                  Voir tous les détails
                </button>
              </div>
            </div>

          </div>

          {/* COLONNE DROITE — ACHAT (STICKY DESKTOP) */}
          <div className="lg:col-span-3 lg:sticky lg:top-[125px] bg-white rounded-[28px] border border-gray/10 p-6 shadow-[0_10px_25px_rgba(0,0,0,0.03)] space-y-6">
            
            {/* Price with Devise Superscript */}
            <div className="flex items-start select-none">
              <span className="text-3xl font-serif font-bold text-charcoal leading-none">
                {price.toLocaleString()}
              </span>
              <span className="text-[9px] font-poppins font-bold text-[#76BD47] uppercase tracking-widest ml-1 mt-0.5 select-none">
                FCFA
              </span>
            </div>

            {/* Urgency Stock Status */}
            <div>
              {stock <= 0 ? (
                <span className="w-full text-center text-[10px] font-poppins font-bold bg-rose-50 border border-rose-100 text-rose-500 px-3.5 py-2 rounded-xl inline-block select-none">
                  ✗ Rupture de stock
                </span>
              ) : stock === 1 ? (
                <span className="w-full text-center text-[10px] font-poppins font-bold bg-[#E5B23E]/10 border border-[#E5B23E]/25 text-[#5C4A1E] px-3.5 py-2 rounded-xl inline-block select-none animate-pulse">
                  ⚠️ Dernier exemplaire restant !
                </span>
              ) : stock <= 3 ? (
                <span className="w-full text-center text-[10px] font-poppins font-bold bg-[#E5B23E]/10 border border-[#E5B23E]/25 text-[#5C4A1E] px-3.5 py-2 rounded-xl inline-block select-none">
                  ⚠️ Plus que {stock} exemplaires restants !
                </span>
              ) : (
                <span className="w-full text-center text-[10px] font-poppins font-bold bg-emerald-50 border border-emerald-100 text-[#76BD47] px-3.5 py-2 rounded-xl inline-block select-none">
                  ✓ En stock ({stock} disponibles)
                </span>
              )}
            </div>

            {/* Quantity Selector (Only if stock > 0) */}
            {stock > 0 && (
              <div className="flex items-center justify-between border-t border-b border-gray/5 py-4 select-none">
                <span className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/70">Quantité</span>
                <div className="flex items-center border border-gray/10 rounded-xl bg-ivory p-0.5">
                  <button
                    type="button"
                    onClick={decrementQty}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray/5 text-charcoal font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-charcoal">{qty}</span>
                  <button
                    type="button"
                    onClick={incrementQty}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray/5 text-charcoal font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Buy / Add Cart Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stock <= 0}
                className="w-full bg-[#76BD47] hover:bg-[#5fa236] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider font-poppins shadow transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-99"
              >
                Commander maintenant
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider font-poppins border transition-all duration-300 flex items-center justify-center space-x-1.5 select-none ${
                    stock > 0
                      ? "border-[#76BD47] text-[#76BD47] hover:bg-[#76BD47]/5 active:scale-98"
                      : "border-gray/10 text-gray/40 cursor-not-allowed"
                  }`}
                >
                  <ShoppingBag size={13} />
                  <span>Panier</span>
                </button>

                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`w-11 h-11 border rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 select-none ${
                      isInWishlist
                        ? "bg-rose-50 border-rose-200 text-rose-500"
                        : "border-gray/20 hover:bg-gray/5 text-gray hover:text-charcoal"
                    }`}
                  >
                    <Heart
                      size={15}
                      className={`${
                        isInWishlist ? "fill-rose-500 text-rose-500" : ""
                      } ${heartPulsing ? "animate-heart-pulse" : ""}`}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Vendor & Security Sign-off */}
            <div className="border-t border-gray/10 pt-4 space-y-3 text-[10px] text-gray font-poppins">
              <div className="flex items-center justify-between">
                <span>Vendeur :</span>
                <span className="font-bold text-[#76BD47] hover:underline cursor-pointer select-none">
                  Bëgg Lire
                </span>
              </div>
              <div className="flex items-center justify-between select-none">
                <span>Paiement :</span>
                <span className="font-semibold text-charcoal flex items-center">
                  <ShieldCheck size={12} className="mr-1 text-[#76BD47]" />
                  Sécurisé
                </span>
              </div>
              <div className="flex items-center space-x-2 pt-2 border-t border-gray/5 select-none">
                <Truck size={14} className="text-[#76BD47] shrink-0" />
                <span className="text-[9px] leading-tight">Livraison à domicile dans tout le Sénégal</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3. TECHNICAL SPEC SHEET */}
      <section id="technical-specs" className="container mx-auto px-6 md:px-12 max-w-7xl pt-6">
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray/10 shadow-sm max-w-3xl mx-auto space-y-6">
          <h3 className="font-serif font-bold text-lg text-charcoal border-b border-gray/10 pb-3">
            Fiche technique détaillée
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-poppins">
            <div className="flex justify-between items-center py-2 border-b border-gray/5">
              <span className="text-gray/50 uppercase font-bold text-[9px] tracking-wider">ISBN</span>
              <span className="font-bold text-charcoal">{book.isbn || "Non spécifié"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray/5">
              <span className="text-gray/50 uppercase font-bold text-[9px] tracking-wider">Éditeur</span>
              <span className="font-bold text-charcoal">{book.editeur || "Non spécifié"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray/5">
              <span className="text-gray/50 uppercase font-bold text-[9px] tracking-wider">Année</span>
              <span className="font-bold text-charcoal">{book.annee || "Non spécifiée"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray/5">
              <span className="text-gray/50 uppercase font-bold text-[9px] tracking-wider">Langue</span>
              <span className="font-bold text-charcoal">{book.langue || "Français"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray/5">
              <span className="text-gray/50 uppercase font-bold text-[9px] tracking-wider">État du livre</span>
              <span className="font-bold text-charcoal">{getConditionLabel(book.etat)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray/5">
              <span className="text-gray/50 uppercase font-bold text-[9px] tracking-wider">Format</span>
              <span className="font-bold text-charcoal">{book.format || "Physique / Broché"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RATINGS & REVIEWS */}
      <div className="container mx-auto px-6 md:px-12 max-w-7xl pt-12">
        <div className="max-w-3xl mx-auto">
          <BookReviews bookId={book.id} user={user} />
        </div>
      </div>

      {/* 5. RECOMMENDATIONS */}
      <div className="container mx-auto px-6 md:px-12 max-w-7xl pt-12">
        <RelatedBooks currentBookId={book.id} />
      </div>

      {/* Heart pulsation animation */}
      <style>{`
        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-heart-pulse {
          animation: heartPulse 0.45s ease-in-out;
        }
      `}</style>

    </div>
  );
}

// ==========================================================================
// LOADING SKELETON COMPONENT
// ==========================================================================
function BookDetailSkeleton() {
  return (
    <div className="w-full space-y-12 bg-ivory pb-20 select-none animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="bg-[#f4f3f0] py-3.5 border-b border-gray/5">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="h-3 bg-gray/10 rounded w-1/4" />
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Col Left cover skeleton */}
          <div className="lg:col-span-4 flex flex-col items-center space-y-6">
            <div className="w-[280px] sm:w-[320px] h-[400px] bg-gray/10 rounded-3xl" />
            <div className="w-[280px] sm:w-[320px] h-10 bg-gray/10 rounded-xl" />
          </div>

          {/* Col center metadata skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-8 bg-gray/15 rounded w-3/4" />
            <div className="h-4 bg-gray/10 rounded w-1/3" />
            <div className="h-4 bg-gray/10 rounded w-1/4" />
            <div className="space-y-2 pt-4">
              <div className="h-4 bg-gray/10 rounded w-full" />
              <div className="h-4 bg-gray/10 rounded w-full" />
              <div className="h-4 bg-gray/10 rounded w-5/6" />
            </div>
            <div className="h-16 bg-gray/10 rounded-xl w-full" />
          </div>

          {/* Col right card skeleton */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-gray/10 h-80" />
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ERROR / 404 STATE COMPONENT
// ==========================================================================
function BookDetailError({ message }) {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center space-y-6 select-none bg-ivory">
      <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div className="space-y-2 max-w-md font-sans">
        <h2 className="font-serif text-3xl font-bold text-charcoal">
          Volume introuvable
        </h2>
        <p className="text-gray text-xs md:text-sm leading-relaxed">
          {message}
        </p>
      </div>
      <Link
        to="/catalogue"
        className="inline-flex items-center space-x-2 bg-[#76BD47] hover:bg-[#5fa236] text-white font-poppins font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-xs active:scale-95 select-none"
      >
        <span>Retour au catalogue</span>
      </Link>
    </div>
  );
}

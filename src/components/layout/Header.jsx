import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, ArrowRight, Mic, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import SearchOverlay from "../search/SearchOverlay";

const Header = () => {
  const { isAuthenticated, wishlistCount } = useAuth();
  const { totalItems } = useCart();
  
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [voiceSearchText, setVoiceSearchText] = useState("Écoute en cours...");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPromoIdx, setCurrentPromoIdx] = useState(0);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const triggerVoiceSearch = () => {
    setIsVoiceSearchActive(true);
    setVoiceSearchText("Écoute en cours...");
    setTimeout(() => {
      setVoiceSearchText("Recherche : « Mariama Bâ »");
    }, 1200);
    setTimeout(() => {
      setIsVoiceSearchActive(false);
      navigate("/catalogue?search=Mariama Bâ");
    }, 2400);
  };

  const promos = [
    "Livraison Dakar & régions",
    "Découvrez les plus belles plumes africaines",
    "Paiement Wave, Orange Money & Livraison"
  ];

  // Rotate top-bar message
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIdx((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Track page scroll to toggle header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Escape key to close search overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isSearchOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Handle outside click to close search
  const handleOutsideClick = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setIsSearchOpen(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: "Accueil", path: "/" },
    { label: "Catalogue", path: "/catalogue" },
    { label: "Communauté", path: "/communaute" },
    { label: "Fournitures", path: "/fournitures" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
        {/* Top bar fine (40px) */}
        <div className="h-10 bg-primary-dark text-ivory flex items-center justify-center text-xs tracking-widest uppercase font-poppins px-4 relative overflow-hidden transition-colors duration-300">
          <div className="flex items-center space-x-2 transition-all duration-500 ease-in-out">
            <span>{promos[currentPromoIdx]}</span>
          </div>
        </div>

        {/* Main navigation (72px) */}
        <div
          className={`h-[72px] w-full transition-all duration-300 flex items-center justify-between px-6 md:px-12 ${
            isScrolled
              ? "bg-ivory/95 backdrop-blur-md shadow-sm border-b border-primary-soft/30"
              : isHome
                ? "bg-transparent border-b border-transparent"
                : "bg-ivory border-b border-transparent"
          }`}
        >
          {/* ==========================================
             MOBILE HERO HEADER (Path is / and not scrolled)
             ========================================== */}
          {isHome && !isScrolled ? (
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Logo en haut à gauche, blanc */}
              <Link to="/" className="flex items-center space-x-2 text-white">
                <BookOpen className="w-6 h-6 text-white" />
                <span className="font-serif font-bold text-lg tracking-tight">Bëgg Lire</span>
              </Link>

              {/* Bouton recherche vocale centré */}
              <button
                onClick={triggerVoiceSearch}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-inner transition-all duration-300"
              >
                <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
                <div className="flex items-end space-x-0.5 h-3">
                  <span className="w-0.5 h-1.5 bg-white rounded-full animate-wave-bar-1"></span>
                  <span className="w-0.5 h-3 bg-white rounded-full animate-wave-bar-2"></span>
                  <span className="w-0.5 h-1 bg-white rounded-full animate-wave-bar-3"></span>
                  <span className="w-0.5 h-2 bg-white rounded-full animate-wave-bar-4"></span>
                </div>
              </button>

              {/* Bouton hamburger rond (fond sage-soft, icône ≡) */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2.5 bg-[#d5eac7]/30 hover:bg-[#d5eac7]/50 text-white rounded-full shadow-md transition-all duration-300"
                aria-label="Menu"
              >
                <Menu size={20} />
              </button>
            </div>
          ) : (
            /* Standard Mobile Logo (Visible on scroll or other pages) */
            <div className="lg:hidden flex items-center justify-between w-full">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 text-charcoal hover:text-primary transition-colors mr-2"
                  aria-label="Menu"
                >
                  <Menu size={22} />
                </button>
                <Link to="/" className="text-2xl font-serif font-bold text-primary-dark tracking-tight">
                  Bëgg Lire
                </Link>
              </div>

              {/* Mobile Quick Icons (Cart/Wishlist when not in transparent hero mode) */}
              <div className="flex items-center space-x-3">
                <Link to="/wishlist" className="p-1.5 text-charcoal hover:text-primary transition-colors relative">
                  <Heart size={20} />
                  {isAuthenticated && wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-gold text-charcoal font-bold text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/panier" className="p-1.5 text-charcoal hover:text-primary transition-colors relative">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white font-bold text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}

          {/* ==========================================
             DESKTOP NAVIGATION (Hidden on mobile)
             ========================================== */}
          {/* Logo (Desktop only) */}
          <div className="hidden lg:flex items-center">
            <Link
              to="/"
              className={`text-2xl font-serif font-bold tracking-tight transition-colors ${
                !isScrolled && isHome ? "text-white hover:text-accent-gold" : "text-primary-dark hover:text-primary"
              }`}
            >
              Bëgg Lire
            </Link>
          </div>

          {/* Links centered (Desktop only) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm tracking-wide font-medium relative py-1 transition-colors ${
                  !isScrolled && isHome
                    ? location.pathname === link.path
                      ? "text-white font-semibold"
                      : "text-white/80 hover:text-white"
                    : location.pathname === link.path
                      ? "text-primary font-semibold"
                      : "text-charcoal hover:text-primary"
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full animate-fade-in ${
                      !isScrolled && isHome ? "bg-white" : "bg-primary"
                    }`}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Icons right (Desktop only) */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-2 transition-colors rounded-full ${
                !isScrolled && isHome ? "text-white hover:text-white/80" : "text-charcoal hover:text-primary"
              }`}
              aria-label="Recherche"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className={`p-2 transition-colors rounded-full relative ${
                !isScrolled && isHome ? "text-white hover:text-white/80" : "text-charcoal hover:text-primary"
              }`}
              aria-label="Favoris"
            >
              <Heart size={20} />
              {isAuthenticated && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-gold text-charcoal font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-ivory">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/panier"
              className={`p-2 transition-colors rounded-full relative ${
                !isScrolled && isHome ? "text-white hover:text-white/80" : "text-charcoal hover:text-primary"
              }`}
              aria-label="Panier"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-ivory animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Account Link */}
            <Link
              to={isAuthenticated ? "/mon-compte" : "/connexion"}
              className={`p-2 transition-colors rounded-full ${
                !isScrolled && isHome ? "text-white hover:text-white/80" : "text-charcoal hover:text-primary"
              }`}
              aria-label="Compte"
            >
              <User size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* 1. Full-Width Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 2. Mobile Drawer Lateral Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <div className="fixed top-0 left-0 w-80 max-w-[85vw] h-full bg-ivory shadow-2xl p-6 flex flex-col justify-between z-10 animate-slide-right">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-serif font-bold text-primary-dark">Bëgg Lire</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-charcoal hover:text-primary transition-colors rounded-full"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-lg font-medium border-b border-primary-soft/10 py-2 hover:text-primary transition-colors ${
                      location.pathname === link.path ? "text-primary" : "text-charcoal"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-auto border-t border-primary-soft/20 pt-6">
              <Link
                to={isAuthenticated ? "/mon-compte" : "/connexion"}
                className="flex items-center space-x-3 text-charcoal hover:text-primary py-2 transition-colors"
              >
                <User size={20} />
                <span className="font-medium">
                  {isAuthenticated ? "Mon compte" : "Connexion / Inscription"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Voice Search Overlay (Glassmorphism) */}
      {isVoiceSearchActive && (
        <div className="fixed inset-0 bg-primary-dark/85 backdrop-blur-xl z-[150] flex flex-col items-center justify-center text-white p-6 animate-fade-in">
          <div className="text-center space-y-8 max-w-sm">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-white/10 rounded-full animate-ping" />
              <div className="absolute w-32 h-32 bg-white/5 rounded-full animate-pulse" />
              <div className="bg-white text-primary-dark p-6 rounded-full shadow-2xl relative z-10">
                <Mic size={40} className="animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-serif font-bold tracking-wide">Recherche Vocale</h3>
              <p className="text-white/80 font-poppins text-sm uppercase tracking-wider animate-pulse">
                {voiceSearchText}
              </p>
            </div>

            <button
              onClick={() => setIsVoiceSearchActive(false)}
              className="text-xs text-white/50 hover:text-white underline tracking-widest uppercase font-poppins transition-colors pt-6"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

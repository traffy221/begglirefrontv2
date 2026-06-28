import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import apiClient from "../../api/client";
import beggLireLogo from "../../assets/logo/begg_lire_logo.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [msg, setMsg] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMsg("");

    try {
      const response = await apiClient.post("/newsletter/subscribe", { email });
      if (response.data && response.data.success) {
        setStatus("success");
        setMsg(response.data.message || "Merci pour votre abonnement !");
        setEmail("");
      } else {
        throw new Error(response.data?.message || "Une erreur est survenue.");
      }
    } catch (error) {
      setStatus("error");
      setMsg(
        error.response?.data?.message || 
        error.message || 
        "Impossible de s'abonner pour le moment."
      );
    }
  };

  return (
    <footer className="bg-charcoal text-ivory pt-16 pb-8 border-t border-white/5 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        {/* Asymmetric Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-12">
          {/* Left Column: Manifesto (Wide - 7/12 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <Link to="/" className="inline-block mb-4 max-h-20 overflow-hidden">
                <img
                  src={beggLireLogo}
                  alt="Bëgg Lire"
                  className="h-20 w-auto object-contain brightness-0 invert"
                />
              </Link>
              <p className="font-serif italic text-lg md:text-xl text-white/90 leading-relaxed max-w-xl">
                "Promouvoir le goût de la lecture, célébrer les récits d'Afrique et d'ailleurs, et soutenir la communauté d'écrivains avec fierté."
              </p>
            </div>
            <div className="text-sm text-ivory/60 font-poppins max-w-md">
              Notre ambition est de rapprocher les lecteurs des livres en facilitant l'accès aux œuvres physiques et aux échanges culturels au Sénégal.
            </div>
          </div>

          {/* Right Column: Links & Newsletter (5/12 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-8 justify-between">
            {/* Newsletter Subscription */}
            <div className="space-y-4">
              <h3 className="font-poppins uppercase tracking-wider text-xs font-bold text-accent-gold">
                Newsletter Littéraire
              </h3>
              <p className="text-sm text-white/80">
                Recevez nos sélections coups de cœur, chroniques et rencontres d'auteurs.
              </p>
              
              <form onSubmit={handleSubscribe} className="flex items-center space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email..."
                  required
                  disabled={status === "loading"}
                  className="bg-white/10 text-white placeholder-white/50 text-sm rounded-lg px-4 py-3 outline-none border border-white/20 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold w-full transition-all"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-accent-gold hover:bg-accent-gold/90 text-charcoal rounded-lg px-6 py-3 font-semibold text-sm transition-all flex items-center justify-center disabled:opacity-50 h-[46px]"
                >
                  {status === "loading" ? "..." : <Send size={16} />}
                </button>
              </form>

              {/* Status messages */}
              {status === "success" && (
                <div className="flex items-center text-xs text-ivory bg-white/10 p-3 rounded-lg border border-primary animate-fade-in space-x-2">
                  <CheckCircle2 size={14} className="text-white shrink-0" />
                  <span>{msg}</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center text-xs text-white bg-destructive/10 p-3 rounded-lg border border-destructive animate-fade-in space-x-2">
                  <AlertCircle size={14} className="text-destructive shrink-0" />
                  <span>{msg}</span>
                </div>
              )}
            </div>

            {/* Links Block */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-poppins uppercase tracking-wider text-[10px] font-bold text-white/50">
                  Découvrir
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link to="/catalogue" className="hover:text-accent-gold text-white/80 font-normal transition-colors">
                      Le Catalogue
                    </Link>
                  </li>
                  <li>
                    <Link to="/fournitures" className="hover:text-accent-gold text-white/80 font-normal transition-colors">
                      Fournitures
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-poppins uppercase tracking-wider text-[10px] font-bold text-white/50">
                  Communauté
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link to="/communaute" className="hover:text-accent-gold text-white/80 font-normal transition-colors">
                      Articles & Chroniques
                    </Link>
                  </li>
                  <li>
                    <Link to="/vendre-un-livre" className="hover:text-accent-gold text-white/80 font-normal transition-colors">
                      Vendre un livre
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Gold Separator */}
        <hr className="border-t border-accent-gold/30 my-6" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-white/50 font-poppins space-y-4 md:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} Bëgg Lire. Tous droits réservés.
          </div>
          <div className="flex items-center space-x-1">
            <span>Fait avec fierté au Sénégal</span>
            <span className="text-[#e25555]">&hearts;</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

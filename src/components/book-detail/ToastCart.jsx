import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function ToastCart({ toast, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // Handle slide-out transition delay
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onClose]);

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[150] bg-[#1c380e] text-white p-4 rounded-2xl shadow-2xl border border-primary-light/10 flex items-center space-x-4 max-w-sm w-full transition-transform duration-300 font-sans ${
        isExiting ? "animate-slide-out" : "animate-slide-in"
      }`}
    >
      {/* Cover Image */}
      <div className="w-10 h-14 bg-white/10 rounded overflow-hidden shrink-0 border border-white/10 shadow flex items-center justify-center">
        {toast.cover ? (
          <img src={getImgUrl(toast.cover)} alt={toast.titre} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] text-white/40">Cover</span>
        )}
      </div>

      {/* Message and link */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-tight text-white line-clamp-2">
          {toast.quantite > 1 ? `${toast.quantite}x ` : ""}{toast.titre} ajouté au panier
        </p>
        <Link
          to="/panier"
          className="text-xs text-accent-gold hover:underline font-bold font-poppins mt-1 block"
        >
          Voir le panier →
        </Link>
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsExiting(true)}
        className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        <X size={14} />
      </button>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOut {
          from { transform: translateX(0); }
          to { transform: translateX(120%); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-out {
          animation: slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

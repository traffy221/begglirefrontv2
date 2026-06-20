import { useState, useRef, useEffect } from "react";
import { Share2, Link as LinkIcon, MessageSquare, Facebook } from "lucide-react";

export default function ShareDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(prev => !prev);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setShowTooltip(true);
        setIsOpen(false);
        setTimeout(() => setShowTooltip(false), 2000);
      })
      .catch((err) => console.error("Failed to copy link", err));
  };

  const handleWhatsAppShare = () => {
    const text = `Découvre ce livre sur Bëgg Lire : ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    setIsOpen(false);
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block font-sans">
      {/* Share Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full transition-colors flex items-center justify-center shadow-md relative"
        aria-label="Partager"
      >
        <Share2 size={16} />
      </button>

      {/* Share List Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-primary-soft/20 rounded-2xl shadow-xl z-20 py-2 animate-fade-in text-charcoal">
          
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full text-left px-4 py-2 hover:bg-primary-soft/10 text-xs font-semibold font-poppins flex items-center space-x-2 transition-colors"
          >
            <LinkIcon size={12} className="text-gray" />
            <span>Copier le lien</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full text-left px-4 py-2 hover:bg-primary-soft/10 text-xs font-semibold font-poppins flex items-center space-x-2 transition-colors"
          >
            <MessageSquare size={12} className="text-emerald-500" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleFacebookShare}
            className="w-full text-left px-4 py-2 hover:bg-primary-soft/10 text-xs font-semibold font-poppins flex items-center space-x-2 transition-colors"
          >
            <Facebook size={12} className="text-blue-600" />
            <span>Facebook</span>
          </button>

        </div>
      )}

      {/* Copy link Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1c380e] text-white text-[10px] font-bold font-poppins rounded-lg shadow-lg whitespace-nowrap z-30 animate-bounce-in">
          Lien copié !
        </div>
      )}
    </div>
  );
}

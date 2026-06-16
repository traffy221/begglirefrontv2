import { useState, useEffect } from "react";
import { Upload, Camera, BookOpen } from "lucide-react";

const BookPreview = ({ formData, setFormData }) => {
  const [localImagePreview, setLocalImagePreview] = useState(null);

  // Sync previews
  useEffect(() => {
    if (formData.cover && formData.cover.startsWith("http")) {
      setLocalImagePreview(formData.cover);
    } else if (!formData.cover) {
      setLocalImagePreview(null);
    }
  }, [formData.cover]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result;
        setLocalImagePreview(previewUrl);
        setFormData(prev => ({ ...prev, cover: previewUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getConditionStyle = (condId) => {
    switch (condId) {
      case "neuf":
        return { label: "Neuf", classes: "bg-emerald-50 text-emerald-600 border-emerald-200" };
      case "tres_bon":
        return { label: "Très bon", classes: "bg-blue-50 text-blue-600 border-blue-200" };
      case "bon":
        return { label: "Bon", classes: "bg-amber-50 text-amber-600 border-amber-200" };
      case "acceptable":
        return { label: "Acceptable", classes: "bg-orange-50 text-orange-600 border-orange-200" };
      default:
        return { label: "Non spécifié", classes: "bg-slate-50 text-slate-400 border-slate-200" };
    }
  };

  const condition = getConditionStyle(formData.etat);

  return (
    <div className="bg-white rounded-3xl p-6 border border-primary-soft/10 shadow-sm lg:sticky lg:top-36 space-y-6 animate-fade-in">
      
      {/* Header Label */}
      <span className="font-poppins uppercase tracking-widest text-[9px] font-bold text-accent-gold block border-b border-primary-soft/10 pb-2">
        Aperçu de votre annonce
      </span>

      {/* Image Cover Preview / Upload block */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm h-64 bg-ivory flex items-center justify-center border border-primary-soft/10 group">
        {localImagePreview ? (
          <>
            <img src={localImagePreview} alt="Aperçu du livre" className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="bg-white/95 hover:bg-white text-charcoal font-poppins text-[10px] font-bold py-2 px-4 rounded-xl cursor-pointer shadow flex items-center space-x-1 transition-all">
                <Camera size={12} />
                <span>Changer la photo</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </>
        ) : (
          <label className="border-2 border-dashed border-primary-soft/30 rounded-2xl hover:bg-slate-50/50 transition-all flex flex-col items-center justify-center h-full w-full p-6 text-center cursor-pointer">
            <Upload className="text-primary/50 mb-2 shrink-0 animate-pulse" size={24} />
            <span className="text-xs text-primary font-bold block">📸 Ajouter une photo de couverture</span>
            <span className="text-[9px] text-gray/50 block mt-1">Glisser-déposer ou cliquer pour parcourir (optionnel)</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      {/* Metadata layout */}
      <div className="space-y-4 pt-2">
        <div className="space-y-1.5 text-center lg:text-left">
          
          {/* Tags row */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
            <span className={`text-[9px] font-poppins font-bold px-2 py-0.5 rounded-full border ${condition.classes}`}>
              {condition.label}
            </span>
            <span className="text-[9px] font-poppins font-bold bg-primary-soft/40 text-primary-dark px-2.5 py-0.5 rounded-full">
              {formData.categorie || "Catégorie"}
            </span>
            {formData.type_exemplaire === "stock" && (
              <span className="text-[9px] font-poppins font-bold bg-[#1c380e]/15 text-[#1c380e] px-2.5 py-0.5 rounded-full">
                {formData.quantite} exemplaires
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-serif font-bold text-xl text-charcoal leading-tight line-clamp-2 pt-1.5">
            {formData.titre || <span className="text-gray/40 italic">Titre du livre</span>}
          </h4>

          {/* Author */}
          <p className="text-xs text-gray font-light">
            {formData.auteur ? `Par ${formData.auteur}` : <span className="text-gray/40 italic">Nom de l'auteur</span>}
          </p>
        </div>

        {/* Pricing tag */}
        <div className="border-t border-primary-soft/10 pt-4 flex items-center justify-between">
          <span className="text-[10px] uppercase font-poppins text-gray/55 font-bold select-none">
            Prix de vente
          </span>
          <span className="font-serif font-bold text-primary-dark text-lg">
            {formData.prix ? Number(formData.prix).toLocaleString() : "0"} FCFA
          </span>
        </div>

      </div>

    </div>
  );
};

export default BookPreview;

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

const BookForm = ({ formData, setFormData, onSubmit, loading, refuseReason }) => {
  const [errors, setErrors] = useState({});

  const languages = ["Français", "Anglais", "Arabe", "Wolof", "Autre"];
  const categories = [
    "Littérature africaine",
    "Roman",
    "Policier/Thriller",
    "Jeunesse",
    "Essai",
    "BD/Manga",
    "Scolaire",
    "Poésie",
    "Autre"
  ];

  const conditions = [
    {
      id: "neuf",
      label: "🟢 Neuf",
      desc: "Jamais lu, comme sorti de librairie",
      helper: "Prix conseillé : prix libraire"
    },
    {
      id: "tres_bon",
      label: "🔵 Très bon",
      desc: "Lu avec soin, aucune marque visible",
      helper: "Prix conseillé : -20 à -30% du prix neuf"
    },
    {
      id: "bon",
      label: "🟡 Bon",
      desc: "Légères traces d'usure",
      helper: "Prix conseillé : -40 à -50% du prix neuf"
    },
    {
      id: "acceptable",
      label: "🟠 Acceptable",
      desc: "Usure visible mais entièrement lisible",
      helper: "Prix conseillé : -60 à -70% du prix neuf"
    }
  ];

  // Helper for dynamic price advice
  const selectedConditionObj = conditions.find(c => c.id === formData.etat);
  const priceHelper = selectedConditionObj ? selectedConditionObj.helper : "";

  // Perform validation on inputs
  const validateField = (name, value) => {
    let err = "";
    if (name === "titre" && !value.trim()) {
      err = "Le titre du livre est obligatoire.";
    }
    if (name === "auteur" && !value.trim()) {
      err = "L'auteur du livre est obligatoire.";
    }
    if (name === "prix" && (isNaN(value) || Number(value) < 100)) {
      err = "Le prix minimum est de 100 FCFA.";
    }
    if (name === "quantite" && formData.type_exemplaire === "stock" && (isNaN(value) || Number(value) < 2)) {
      err = "La quantité minimum pour plusieurs exemplaires est de 2.";
    }
    
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleConditionSelect = (condId) => {
    setFormData(prev => ({ ...prev, etat: condId }));
    setErrors(prev => ({ ...prev, etat: "" }));
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => {
      const updated = { ...prev, type_exemplaire: type };
      if (type === "unique") {
        updated.quantite = 1;
      } else if (prev.quantite < 2) {
        updated.quantite = 2; // Default for multiple
      }
      return updated;
    });
  };

  // Run initial validations to verify if form is submittable
  const isFormValid = 
    formData.titre.trim() !== "" &&
    formData.auteur.trim() !== "" &&
    Number(formData.prix) >= 100 &&
    formData.etat !== "" &&
    Object.values(errors).every(err => !err);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      
      {/* Refused Advert Banner */}
      {refuseReason && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start space-x-2.5 animate-fade-in">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold block text-rose-950">Vous modifiez une annonce refusée</span>
            <p className="italic leading-normal">" {refuseReason} "</p>
          </div>
        </div>
      )}

      {/* SECTION 1: Livre Info */}
      <div className="bg-white rounded-3xl p-6 border border-primary-soft/10 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-charcoal border-b border-primary-soft/5 pb-2">
          Informations du livre
        </h3>

        {/* ISBN */}
        <div className="space-y-1">
          <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">
            ISBN
          </label>
          <input
            type="text"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            placeholder="ISBN à 10 ou 13 chiffres (Optionnel)"
            className="w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors"
          />
          <span className="text-[9px] text-gray/40 block">Optionnel si introuvable</span>
        </div>

        {/* Titre */}
        <div className="space-y-1">
          <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">
            Titre du livre *
          </label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            maxLength={255}
            required
            placeholder="Ex: Une si longue lettre..."
            className={`w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border outline-none focus:border-primary-dark transition-colors ${
              errors.titre ? "border-rose-300" : "border-primary-soft/20"
            }`}
          />
          {errors.titre && <p className="text-[10px] text-rose-500 font-semibold">{errors.titre}</p>}
        </div>

        {/* Auteur */}
        <div className="space-y-1">
          <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">
            Auteur *
          </label>
          <input
            type="text"
            name="auteur"
            value={formData.auteur}
            onChange={handleChange}
            maxLength={255}
            required
            placeholder="Ex: Mariama Bâ..."
            className={`w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border outline-none focus:border-primary-dark transition-colors ${
              errors.auteur ? "border-rose-300" : "border-primary-soft/20"
            }`}
          />
          {errors.auteur && <p className="text-[10px] text-rose-500 font-semibold">{errors.auteur}</p>}
        </div>

        {/* Editeur & Annee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">
              Éditeur (optionnel)
            </label>
            <input
              type="text"
              name="editeur"
              value={formData.editeur || ""}
              onChange={handleChange}
              placeholder="Ex: Éditions Julliard..."
              className="w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">
              Année de publication
            </label>
            <input
              type="number"
              name="annee"
              value={formData.annee || ""}
              onChange={handleChange}
              min={1800}
              max={2025}
              placeholder="Ex: 1961"
              className="w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors"
            />
          </div>
        </div>

        {/* Langue & Categorie */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">
              Langue *
            </label>
            <select
              name="langue"
              value={formData.langue}
              onChange={handleChange}
              required
              className="w-full bg-ivory border border-primary-soft/20 text-xs px-4 py-2.5 rounded-xl text-charcoal outline-none cursor-pointer"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">
              Catégorie *
            </label>
            <select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              required
              className="w-full bg-ivory border border-primary-soft/20 text-xs px-4 py-2.5 rounded-xl text-charcoal outline-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* SECTION 2: Etat & Dispo */}
      <div className="bg-white rounded-3xl p-6 border border-primary-soft/10 shadow-sm space-y-5">
        <h3 className="font-serif font-bold text-base text-charcoal border-b border-primary-soft/5 pb-2">
          État & Disponibilité
        </h3>

        {/* Etat du livre (2x2 Grid) */}
        <div className="space-y-2">
          <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80 block">
            État physique du livre *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conditions.map(c => {
              const selected = formData.etat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleConditionSelect(c.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col space-y-1 ${
                    selected
                      ? "border-primary-dark bg-primary-soft/20 shadow-sm"
                      : "border-primary-soft/20 bg-ivory hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs font-poppins font-bold text-charcoal">{c.label}</span>
                  <span className="text-[10px] text-gray leading-snug font-light">{c.desc}</span>
                </button>
              );
            })}
          </div>
          {errors.etat && <p className="text-[10px] text-rose-500 font-semibold">{errors.etat}</p>}
        </div>

        {/* Type de vente */}
        <div className="space-y-2">
          <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80 block">
            Type de vente *
          </label>
          <div className="flex bg-ivory border border-primary-soft/20 rounded-xl p-1 max-w-sm">
            <button
              type="button"
              onClick={() => handleTypeSelect("unique")}
              className={`w-1/2 text-center py-2 rounded-lg text-xs font-poppins font-semibold transition-all ${
                formData.type_exemplaire === "unique"
                  ? "bg-primary-dark text-white shadow-sm"
                  : "text-gray hover:text-charcoal"
              }`}
            >
              Exemplaire unique
            </button>
            <button
              type="button"
              onClick={() => handleTypeSelect("stock")}
              className={`w-1/2 text-center py-2 rounded-lg text-xs font-poppins font-semibold transition-all ${
                formData.type_exemplaire === "stock"
                  ? "bg-primary-dark text-white shadow-sm"
                  : "text-gray hover:text-charcoal"
              }`}
            >
              Plusieurs exemplaires
            </button>
          </div>
        </div>

        {/* Quantity (Conditional Slide Down) */}
        {formData.type_exemplaire === "stock" && (
          <div className="space-y-1 animate-fade-in border-t border-primary-soft/5 pt-4">
            <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">
              Quantité disponible
            </label>
            <input
              type="number"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              min={2}
              max={999}
              required
              className={`w-full bg-ivory text-xs px-4 py-2.5 rounded-xl border outline-none focus:border-primary-dark transition-colors ${
                errors.quantite ? "border-rose-300" : "border-primary-soft/20"
              }`}
            />
            {errors.quantite && <p className="text-[10px] text-rose-500 font-semibold">{errors.quantite}</p>}
          </div>
        )}

      </div>

      {/* SECTION 3: Prix & Description */}
      <div className="bg-white rounded-3xl p-6 border border-primary-soft/10 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-charcoal border-b border-primary-soft/5 pb-2">
          Prix & Description
        </h3>

        {/* Prix */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">
            Prix en FCFA *
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              name="prix"
              value={formData.prix}
              onChange={handleChange}
              min={100}
              required
              placeholder="Ex: 2500"
              className={`w-full bg-ivory text-xs pl-4 pr-16 py-2.5 rounded-xl border outline-none focus:border-primary-dark transition-colors ${
                errors.prix ? "border-rose-300" : "border-primary-soft/20"
              }`}
            />
            <span className="absolute right-4 text-xs text-gray/50 font-poppins font-bold uppercase select-none">
              FCFA
            </span>
          </div>
          
          {/* Dynamic Advice helper label */}
          {priceHelper && (
            <p className="text-[10px] text-accent-gold font-poppins font-semibold flex items-center space-x-1 animate-fade-in">
              <span>💡 {priceHelper}</span>
            </p>
          )}
          {errors.prix && <p className="text-[10px] text-rose-500 font-semibold">{errors.prix}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray/80">
            Description (optionnel)
          </label>
          <textarea
            name="description"
            rows={5}
            value={formData.description || ""}
            onChange={handleChange}
            maxLength={1000}
            placeholder="Décrivez l'état réel du livre, les annotations, surlignages, chocs sur la couverture..."
            className="w-full bg-ivory text-xs p-4 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors resize-none"
          />
          <div className="flex justify-end text-[9px] text-gray/45 pt-0.5">
            <span>{formData.description ? formData.description.length : 0} / 1000</span>
          </div>
        </div>

      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-[#1c380e] hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider font-poppins shadow transition-all duration-300 disabled:opacity-35 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Envoi en cours...</span>
            </>
          ) : (
            <span>Soumettre à la validation</span>
          )}
        </button>
      </div>

    </form>
  );
};

export default BookForm;

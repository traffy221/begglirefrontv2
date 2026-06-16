import { useState } from "react";
import { Search, Loader2, AlertTriangle, CheckCircle2, QrCode } from "lucide-react";

// Mock ISBN Database
const isbnDatabase = {
  "9782070360024": { 
    titre: "L'Aventure Ambiguë", 
    auteur: "Cheikh Hamidou Kane",
    editeur: "Julliard", 
    annee: 1961,
    cover: "https://covers.openlibrary.org/b/isbn/9782070360024-M.jpg",
    langue: "Français", 
    categorie: "Littérature africaine"
  },
  "9782070413119": {
    titre: "Les Misérables",
    auteur: "Victor Hugo",
    editeur: "Gallimard", 
    annee: 1951,
    cover: "https://covers.openlibrary.org/b/isbn/9782070413119-M.jpg",
    langue: "Français", 
    categorie: "Roman"
  }
};

const ISBNSearch = ({ onFound, onManual }) => {
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [foundBook, setFoundBook] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const validateIsbn = (val) => {
    const cleaned = val.replace(/[- ]/g, "");
    // Checks for ISBN-10 or ISBN-13
    return /^(?:\d{9}[\dX]|\d{13})$/.test(cleaned);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFoundBook(null);
    setSearched(false);

    const cleanedIsbn = isbn.replace(/[- ]/g, "");

    if (!validateIsbn(cleanedIsbn)) {
      setErrorMsg("Veuillez saisir un ISBN valide à 10 ou 13 chiffres.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSearched(true);
      const book = isbnDatabase[cleanedIsbn];
      if (book) {
        setFoundBook({ ...book, isbn: cleanedIsbn });
      } else {
        // Not found: immediately transition to manual form with a banner
        onManual(cleanedIsbn, "ISBN non reconnu — remplissez les informations manuellement");
      }
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-primary-soft/10 shadow-sm max-w-xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header card */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-primary-soft/20 rounded-full flex items-center justify-center mx-auto text-primary">
          <QrCode size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif font-bold text-xl text-charcoal">
            Avez-vous l'ISBN de votre livre ?
          </h2>
          <p className="text-xs text-gray max-w-sm mx-auto font-light leading-normal">
            L'ISBN se trouve au dos du livre, sous le code-barres (commence généralement par 978 ou 979).
          </p>
        </div>
      </div>

      {/* Input / Search Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            value={isbn}
            onChange={(e) => {
              setIsbn(e.target.value);
              setErrorMsg("");
              setSearched(false);
              setFoundBook(null);
            }}
            placeholder="Ex: 9782070360024"
            disabled={loading}
            className="w-full bg-ivory text-xs px-4 py-3 rounded-xl border border-primary-soft/20 outline-none focus:border-primary-dark transition-colors font-medium"
          />
          <button
            type="submit"
            disabled={loading || !isbn.trim()}
            className="bg-[#1c380e] hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl text-xs font-poppins uppercase tracking-wider shadow shrink-0 disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Recherche...</span>
              </>
            ) : (
              <>
                <Search size={12} />
                <span>Rechercher</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <p className="text-[10px] text-rose-500 font-semibold flex items-center space-x-1">
            <AlertTriangle size={12} className="shrink-0" />
            <span>{errorMsg}</span>
          </p>
        )}
      </form>

      {/* If found book preview */}
      {searched && foundBook && (
        <div className="space-y-4 pt-2 border-t border-primary-soft/10 animate-fade-in">
          <div className="flex items-center text-xs text-primary-dark bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl space-x-2">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
            <span className="font-semibold">✓ Livre trouvé et pré-rempli automatiquement</span>
          </div>

          <div className="bg-ivory border border-primary-soft/20 rounded-2xl p-4 flex items-center space-x-4">
            <div className="w-14 h-20 bg-white rounded shadow-sm overflow-hidden shrink-0">
              <img src={foundBook.cover} alt={foundBook.titre} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-charcoal">{foundBook.titre}</h4>
              <p className="text-xs text-gray font-light">Par {foundBook.auteur}</p>
              <p className="text-[10px] text-gray/50 font-poppins mt-0.5">Éditeur : {foundBook.editeur} ({foundBook.annee})</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-center">
            <button
              onClick={() => onFound(foundBook)}
              className="w-full bg-[#1c380e] hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-xs font-poppins uppercase tracking-wider shadow"
            >
              Continuer avec ce livre
            </button>
            <button
              onClick={() => onManual("", "")}
              className="text-[10px] text-primary hover:underline font-semibold"
            >
              Ce n'est pas le bon livre ? Modifier manuellement
            </button>
          </div>
        </div>
      )}

      {/* Link under the form */}
      {!foundBook && !loading && (
        <div className="text-center pt-2">
          <button
            onClick={() => onManual("", "")}
            className="text-xs text-primary hover:underline font-semibold"
          >
            Je n'ai pas l'ISBN → Remplir manuellement
          </button>
        </div>
      )}

    </div>
  );
};

export default ISBNSearch;

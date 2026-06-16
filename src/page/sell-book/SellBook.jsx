import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, AlertTriangle } from "lucide-react";
import ISBNSearch from "../../components/sell-book/ISBNSearch";
import BookForm from "../../components/sell-book/BookForm";
import BookPreview from "../../components/sell-book/BookPreview";
import ConfirmationCard from "../../components/sell-book/ConfirmationCard";
import apiClient from "../../api/client";

const SellBook = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  // Step state: 1 (ISBN Lookup) | 2 (Form Details) | 3 (Confirmation)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [warningBanner, setWarningBanner] = useState("");
  const [refuseReason, setRefuseReason] = useState("");

  // Form payload state
  const [formData, setFormData] = useState({
    isbn: "",
    titre: "",
    auteur: "",
    editeur: "",
    annee: "",
    langue: "Français",
    categorie: "Roman",
    etat: "bon",
    type_exemplaire: "unique",
    quantite: 1,
    prix: "",
    description: "",
    cover: null
  });

  // Fetch target edit submission if editId is provided
  useEffect(() => {
    const fetchEditItem = async () => {
      if (!editId) return;
      try {
        setLoading(true);
        const res = await apiClient.get("/vendre-livre");
        if (res.data && res.data.success) {
          const list = res.data.data || [];
          const item = list.find(x => x.id === Number(editId));
          if (item) {
            setFormData({
              isbn: item.isbn || "",
              titre: item.titre || "",
              auteur: item.auteur || "",
              editeur: item.editeur || "",
              annee: item.annee || "",
              langue: item.langue || "Français",
              categorie: item.categorie || "Roman",
              etat: item.etat || "bon",
              type_exemplaire: item.type_exemplaire || "unique",
              quantite: item.quantite || 1,
              prix: item.prix || "",
              description: item.description || "",
              cover: item.cover || null
            });
            // If the item was refused, load the reason
            if (item.statut === "refuse" && item.motif_refus) {
              setRefuseReason(item.motif_refus);
            }
            // Skip step 1 for editing
            setStep(2);
          }
        }
      } catch (err) {
        console.error("Failed to fetch edit item details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEditItem();
  }, [editId]);

  // Handler for ISBN Lookup Success
  const handleISBNFound = (book) => {
    setFormData(prev => ({
      ...prev,
      isbn: book.isbn,
      titre: book.titre,
      auteur: book.auteur,
      editeur: book.editeur,
      annee: book.annee,
      langue: book.langue || "Français",
      categorie: book.categorie || "Roman",
      cover: book.cover
    }));
    setWarningBanner("");
    setStep(2);
  };

  // Handler for manual filling
  const handleManualFill = (fallbackIsbn = "", bannerMsg = "") => {
    setFormData(prev => ({
      ...prev,
      isbn: fallbackIsbn || prev.isbn
    }));
    setWarningBanner(bannerMsg);
    setStep(2);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        // Edit mode (PUT)
        await apiClient.put(`/vendre-livre/${editId}`, formData);
      } else {
        // Create mode (POST)
        await apiClient.post("/vendre-livre", formData);
      }
      // Transition to step 3 after mock delay
      setTimeout(() => {
        setLoading(false);
        setStep(3);
      }, 1500);
    } catch (err) {
      console.error("Submission failed", err);
      setLoading(false);
    }
  };

  // View my ads redirect
  const handleViewAds = () => {
    // Navigate to My Account page and pass state to auto-toggle tab
    navigate("/mon-compte", { state: { activeTab: "sales" } });
  };

  // Reset form to start a new sale
  const handleSellAnother = () => {
    setFormData({
      isbn: "",
      titre: "",
      auteur: "",
      editeur: "",
      annee: "",
      langue: "Français",
      categorie: "Roman",
      etat: "bon",
      type_exemplaire: "unique",
      quantite: 1,
      prix: "",
      description: "",
      cover: null
    });
    setWarningBanner("");
    setRefuseReason("");
    setStep(1);
  };

  return (
    <div className="bg-ivory min-h-screen py-12 px-6 md:px-12 flex flex-col justify-start items-center">
      
      {/* Upper Headers */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-charcoal">
          {editId ? "Modifiez votre annonce" : "Vendez vos livres sur Bëgg Lire"}
        </h1>
        <p className="text-xs md:text-sm text-gray max-w-lg mx-auto font-light leading-relaxed">
          {editId
            ? "Mettez à jour les détails de votre ouvrage pour faciliter sa validation."
            : "Donnez une seconde vie à vos livres et touchez des milliers de lecteurs au Sénégal."
          }
        </p>

        {/* Stepper (only visible in steps 1 and 2) */}
        {step < 3 && (
          <div className="flex items-center justify-center space-x-4 pt-4 select-none">
            
            {/* Step 1 marker */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-xs font-poppins font-bold ${
              step === 1
                ? "bg-[#1c380e] border-[#1c380e] text-white"
                : "border-[#1c380e] text-[#1c380e]"
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
              <span>Identifier le livre</span>
            </div>

            {/* Link line */}
            <div className="w-8 h-0.5 bg-primary-soft" />

            {/* Step 2 marker */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-xs font-poppins font-bold ${
              step === 2
                ? "bg-[#1c380e] border-[#1c380e] text-white"
                : "border-primary-soft text-gray"
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              <span>Détails & Prix</span>
            </div>

          </div>
        )}
      </div>

      <div className="w-full max-w-6xl">
        
        {/* STEP 1: ISBN Search */}
        {step === 1 && (
          <ISBNSearch onFound={handleISBNFound} onManual={handleManualFill} />
        )}

        {/* STEP 2: Details Form & Live Preview */}
        {step === 2 && (
          <div className="space-y-6">
            
            {/* Warning Banner for missing ISBN */}
            {warningBanner && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center space-x-2.5 max-w-xl mx-auto animate-fade-in text-xs font-poppins">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <span className="font-semibold">{warningBanner}</span>
              </div>
            )}

            {/* 2-Column Editorial Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Column (60% / 7 cols) */}
              <div className="lg:col-span-7">
                <BookForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  loading={loading}
                  refuseReason={refuseReason}
                />
              </div>

              {/* Preview Column (40% / 5 cols) */}
              <div className="lg:col-span-5">
                <BookPreview formData={formData} setFormData={setFormData} />
              </div>

            </div>

          </div>
        )}

        {/* STEP 3: Confirmation page */}
        {step === 3 && (
          <ConfirmationCard
            bookInfo={formData}
            onViewMyAds={handleViewAds}
            onSellAnother={handleSellAnother}
          />
        )}

      </div>

    </div>
  );
};

export default SellBook;

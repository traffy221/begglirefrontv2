import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, CreditCard, Truck, ShoppingBag, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import apiClient from "../api/client";

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { items, totalPrice: cartSubtotal, bookItems, supplyItems, clearCart } = useCart();

  // Stepper State
  const [step, setStep] = useState(1); // 1 = Shipping, 2 = Payment

  // Form States (Step 1)
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [selectedCommune, setSelectedCommune] = useState(null); // Commune object
  const [communes, setCommunes] = useState([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  // Payment States (Step 2)
  const [paymentMethod, setPaymentMethod] = useState("paytech"); // 'paytech' | 'livraison'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      navigate("/panier");
    }
  }, [items, navigate, isSubmitting]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Split name if space exists
      const names = user.fullname ? user.fullname.split(" ") : ["", ""];
      setPrenom(user.prenom || names[0] || "");
      setNom(user.nom || names.slice(1).join(" ") || "");
      setEmail(user.email || "");
      setTelephone(user.phoneNumber || user.telephone || "");
      setAdresse(user.locality || "");
    }
  }, [user, isAuthenticated]);

  // Fetch Communes for Dakar/Senegal delivery fees
  useEffect(() => {
    setLoadingCommunes(true);
    apiClient
      .get("/get-all-communes")
      .then((res) => {
        if (res.data && res.data.success) {
          setCommunes(res.data.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCommunes(false));
  }, []);

  // Compute shipping fee based on selected commune
  const shippingFee = useMemo(() => {
    if (!selectedCommune) return 1000; // Default flat fee
    return Number(selectedCommune.prix_livraison ?? 1000);
  }, [selectedCommune]);

  const orderTotal = cartSubtotal + shippingFee;

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!prenom || !nom || !email || !telephone || !adresse || !selectedCommune) {
      setErrorMsg("Veuillez remplir tous les champs de livraison obligatoires.");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleOrderCheckout = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    const hasBooks = bookItems.length > 0;
    const hasSupplies = supplyItems.length > 0;

    let refCommand = "";
    
    try {
      // 1. REGISTER CART TO THE BACKEND
      if (hasBooks && !hasSupplies) {
        // Books only
        const payload = {
          user: user?.id || null,
          books: bookItems.map((item) => ({
            id: item.id,
            isbn: item.isbn || "9780000000000",
            title: item.title,
            prix_vente: item.price,
            quantity: item.quantity,
          })),
          livraison: true,
        };
        const res = await apiClient.post("/cart-command", payload);
        refCommand = res.data?.data || res.data;
      } 
      else if (!hasBooks && hasSupplies) {
        // Supplies only
        const payload = {
          user: user?.id || null,
          supplies: supplyItems.map((item) => ({
            id: item.id,
            supplier_name: item.title,
            prix: item.price,
            quantity: item.quantity,
          })),
          livraison: true,
        };
        const res = await apiClient.post("/cart-supply-command", payload);
        refCommand = res.data?.data || res.data;
      } 
      else {
        // Mixed Cart
        const payload = {
          user: user?.id || null,
          livres: bookItems.map((item) => ({
            id: item.id,
            isbn: item.isbn || "9780000000000",
            title: item.title,
            prix_vente: item.price,
            quantity: item.quantity,
          })),
          fournitures: supplyItems.map((item) => ({
            id: item.id,
            supplier_name: item.title,
            prix: item.price,
            quantity: item.quantity,
          })),
          livraison: true,
          commune: selectedCommune.nom,
        };
        const res = await apiClient.post("/mixed-cart", payload);
        refCommand = res.data?.data?.reference || res.data?.reference || res.data;
      }

      if (!refCommand) {
        throw new Error("Impossible de générer la référence de la commande.");
      }

      // 2. PROCESS PAYMENT BASED ON SELECTION
      if (paymentMethod === "paytech") {
        // PayTech online payment
        const paytechPayload = {
          nom_client: `${prenom} ${nom}`,
          email,
          telephone,
          locality: `${selectedCommune.nom} - ${adresse}`,
          item_name: "Achat Bëgg Lire",
          item_price: orderTotal,
          ref_command: refCommand,
          user_id: user?.id || null,
          type_payement: "paytech",
        };

        const paytechRes = await apiClient.post("/paytech/payment", paytechPayload);
        
        if (paytechRes.data && paytechRes.data.success && paytechRes.data.redirect_url) {
          // Clear cart local state before redirecting
          clearCart();
          window.location.href = paytechRes.data.redirect_url;
        } else {
          throw new Error("L'initialisation du paiement PayTech a échoué.");
        }
      } else {
        // Cash on delivery
        const deliveryPayload = {
          nom_client: `${prenom} ${nom}`,
          email,
          telephone,
          locality: `${selectedCommune.nom} - ${adresse}`,
          ref_command: refCommand,
          type_payement: "livraison",
        };

        const deliveryRes = await apiClient.post("/payment-delivery", deliveryPayload);
        if (deliveryRes.data && deliveryRes.data.success) {
          clearCart();
          navigate(`/commande/${refCommand}`);
        } else {
          throw new Error("L'enregistrement du paiement à la livraison a échoué.");
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error.response?.data?.message || 
        error.message || 
        "Une erreur est survenue lors de la commande."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 md:px-12 max-w-4xl py-12 space-y-10">
      
      {/* 1. VISUAL STEPPER */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 pb-2 border-b-2 transition-all duration-300 ${step === 1 ? "border-primary text-primary-dark font-bold" : "border-transparent text-gray"}`}>
          <span className="w-6 h-6 rounded-full bg-primary-soft/30 text-primary-dark flex items-center justify-center text-xs">1</span>
          <span className="text-sm font-poppins">Livraison</span>
        </div>
        <div className="w-12 h-0.5 bg-primary-soft/30" />
        <div className={`flex items-center space-x-2 pb-2 border-b-2 transition-all duration-300 ${step === 2 ? "border-primary text-primary-dark font-bold" : "border-transparent text-gray"}`}>
          <span className="w-6 h-6 rounded-full bg-primary-soft/30 text-primary-dark flex items-center justify-center text-xs">2</span>
          <span className="text-sm font-poppins">Paiement</span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-xl p-4 text-sm flex items-center space-x-2 animate-fade-in">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ==========================================
         STEP 1 - SHIPPING INFORMATION
         ========================================== */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="bg-white rounded-3xl p-6 md:p-8 border border-primary-soft/20 shadow-sm space-y-6">
          <h2 className="font-serif font-bold text-xl text-charcoal border-b border-primary-soft/10 pb-4">
            Adresse & informations de livraison
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Prénom *</label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex. Fatou"
                className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Nom *</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex. Diop"
                className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Adresse email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex. fatou.diop@example.com"
                className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Téléphone *</label>
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="Ex. 771234567"
                className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary transition-all"
              />
            </div>
            
            <div className="flex flex-col space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Commune de livraison *</label>
              <select
                required
                value={selectedCommune ? selectedCommune.nom : ""}
                onChange={(e) => {
                  const target = communes.find((c) => c.nom === e.target.value);
                  setSelectedCommune(target);
                }}
                className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary transition-all"
              >
                <option value="">Sélectionnez votre commune...</option>
                {communes.map((c) => (
                  <option key={c.id} value={c.nom}>
                    {c.nom} ({Number(c.prix_livraison).toLocaleString()} CFA)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray uppercase tracking-wider">Adresse précise *</label>
              <input
                type="text"
                required
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="Numéro de rue, appartement, repères visuels..."
                className="bg-ivory border border-primary-soft/30 rounded-xl p-3 text-sm text-charcoal outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-primary-soft/10">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center space-x-2"
            >
              <span>Continuer vers le paiement</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* ==========================================
         STEP 2 - PAYMENT & ORDER PLACEMENT
         ========================================== */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Payment method select (7/12 cols) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-primary-soft/20 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 border-b border-primary-soft/10 pb-4">
              <button
                onClick={() => setStep(1)}
                className="p-1 hover:bg-primary-soft/20 rounded-lg transition-colors mr-2"
                aria-label="Back"
              >
                <ArrowLeft size={16} />
              </button>
              <h2 className="font-serif font-bold text-xl text-charcoal">Mode de paiement</h2>
            </div>

            {/* Visual selector radios */}
            <div className="space-y-4">
              
              {/* PayTech Online Pay */}
              <div
                onClick={() => setPaymentMethod("paytech")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-4 ${
                  paymentMethod === "paytech"
                    ? "border-primary bg-primary-soft/5"
                    : "border-primary-soft/20 hover:border-primary/40 bg-white"
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="radio"
                    checked={paymentMethod === "paytech"}
                    onChange={() => setPaymentMethod("paytech")}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="space-y-1 flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-charcoal">Paiement en ligne</h3>
                    <CreditCard size={18} className="text-primary-dark" />
                  </div>
                  <p className="text-xs text-gray leading-relaxed">
                    Payez de manière sécurisée en ligne via Wave, Orange Money, Free Money ou par Carte Bancaire via PayTech.
                  </p>
                </div>
              </div>

              {/* Delivery Pay */}
              <div
                onClick={() => setPaymentMethod("livraison")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-4 ${
                  paymentMethod === "livraison"
                    ? "border-primary bg-primary-soft/5"
                    : "border-primary-soft/20 hover:border-primary/40 bg-white"
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="radio"
                    checked={paymentMethod === "livraison"}
                    onChange={() => setPaymentMethod("livraison")}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="space-y-1 flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-charcoal">Paiement à la livraison</h3>
                    <Truck size={18} className="text-accent-gold" />
                  </div>
                  <p className="text-xs text-gray leading-relaxed">
                    Réglez en espèces directement auprès du livreur lors de la réception de vos articles à domicile.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-primary-soft/10">
              <button
                onClick={handleOrderCheckout}
                disabled={isSubmitting}
                className="w-full bg-accent-gold hover:bg-accent-gold/90 disabled:opacity-50 text-charcoal font-bold py-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Validation en cours...</span>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Confirmer et régler {orderTotal.toLocaleString()} CFA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Recap sidebar (5/12 cols) */}
          <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-primary-soft/20 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-lg text-charcoal border-b border-primary-soft/10 pb-4">
              Votre Commande
            </h3>

            <div className="max-h-56 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {items.map((item) => (
                <div key={`${item.id}-${item.type}`} className="flex justify-between items-start text-xs">
                  <div className="space-y-0.5 max-w-[70%]">
                    <h4 className="font-medium text-charcoal line-clamp-1">{item.title}</h4>
                    <p className="text-gray/70">
                      Qté: {item.quantity} &middot; {item.type === "book" ? "Livre" : "Fourniture"}
                    </p>
                  </div>
                  <span className="font-semibold text-charcoal shrink-0">
                    {(item.price * item.quantity).toLocaleString()} CFA
                  </span>
                </div>
              ))}
            </div>

            <hr className="border-t border-primary-soft/10" />

            <div className="space-y-2 text-xs text-gray">
              <div className="flex justify-between">
                <span>Sous-total articles</span>
                <span>{cartSubtotal.toLocaleString()} CFA</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison ({selectedCommune?.nom})</span>
                <span>{shippingFee.toLocaleString()} CFA</span>
              </div>
              
              <hr className="border-t border-primary-soft/10 my-2" />

              <div className="flex justify-between text-sm font-serif font-bold text-charcoal">
                <span>Total à payer</span>
                <span className="text-primary-dark font-bold">
                  {orderTotal.toLocaleString()} CFA
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Checkout;

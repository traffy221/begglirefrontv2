import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, Home, CheckCircle2, AlertCircle } from "lucide-react";
import apiClient from "../api/client";

const Facture = () => {
  const { reference } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [orderMeta, setOrderMeta] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        let booksList = [];
        let suppliesList = [];

        // 1. Try to fetch from book command endpoint
        try {
          const resBooks = await apiClient.get(`/show-command/${reference}`);
          if (resBooks.data && resBooks.data.success) {
            // successResponses returns data and data2
            booksList = resBooks.data.data || [];
          }
        } catch (e) {
          // If 404, books might just not exist in this command
        }

        // 2. Try to fetch from supply command endpoint
        try {
          const resSupplies = await apiClient.get(`/show-supply-command/${reference}`);
          if (resSupplies.data && resSupplies.data.success) {
            suppliesList = resSupplies.data.data || [];
          }
        } catch (e) {
          // Ignore 404
        }

        const combinedItems = [...booksList, ...suppliesList];

        if (combinedItems.length === 0) {
          throw new Error("Aucune commande trouvée avec cette référence.");
        }

        setItems(combinedItems);

        // Extract metadata from first item
        const first = combinedItems[0];
        setOrderMeta({
          reference: first.reference,
          client: first.client || "Client Bëgg Lire",
          email: first.email || "",
          telephone: first.telephone || "",
          locality: first.locality || "",
          type_payement: first.type_payement || "livraison",
          status: first.status, // true/false or 1/0
          livraison: first.livraison,
          date: first.created_at ? new Date(first.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        });

      } catch (err) {
        setError(err.message || "Erreur de chargement de la facture.");
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      fetchOrderDetails();
    }
  }, [reference]);

  const handlePrint = () => {
    window.print();
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + Number(item.prix_total || 0), 0);
  };

  // Calculate shipping fee dynamically based on location
  const getShippingFee = () => {
    if (!orderMeta || !orderMeta.livraison) return 0;
    // Standard flat delivery fee is 1000 CFA if not specific
    return 1000;
  };

  const getGrandTotal = () => {
    return getSubtotal() + getShippingFee();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-dark" />
        <p className="font-serif italic text-gray">Génération de la facture...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-4 max-w-md">
        <AlertCircle size={48} className="text-destructive mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-charcoal">Facture Introuvable</h2>
        <p className="text-gray">{error}</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Home size={16} />
          <span>Retour à l'accueil</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-12 max-w-3xl py-12 space-y-8">
      {/* Global CSS Print Styles Override */}
      <style>{`
        @media print {
          header, footer, .print-hidden {
            display: none !important;
          }
          main {
            padding-top: 0 !important;
          }
          .invoice-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* 1. Header controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print-hidden bg-primary-soft/10 p-4 rounded-2xl border border-primary-soft/30">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="text-primary-dark" size={20} />
          <span className="text-sm font-semibold text-charcoal">
            Commande enregistrée avec succès.
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Printer size={14} />
            <span>Imprimer la facture</span>
          </button>
          <Link
            to="/"
            className="bg-white hover:bg-ivory border border-primary-soft/40 text-charcoal font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Home size={14} />
            <span>Accueil</span>
          </Link>
        </div>
      </div>

      {/* 2. INVOICE CARD SHEET */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-primary-soft/20 shadow-sm space-y-8 invoice-card">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-primary-soft/20 pb-8">
          <div className="space-y-2">
            <span className="text-3xl font-serif font-bold text-primary-dark">Bëgg Lire</span>
            <p className="text-xs text-gray leading-relaxed">
              Librairie en ligne sénégalaise<br />
              Dakar, Sénégal<br />
              contact@begglire.com
            </p>
          </div>
          
          <div className="text-left sm:text-right space-y-1">
            <h2 className="font-serif font-bold text-xl uppercase text-charcoal">Facture</h2>
            <p className="text-sm text-charcoal font-semibold">Réf: {reference}</p>
            <p className="text-xs text-gray">Date: {orderMeta?.date}</p>
          </div>
        </div>

        {/* Client & Shipping Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-1">
            <h3 className="font-poppins uppercase tracking-wider text-[10px] font-bold text-gray">
              Destinataire
            </h3>
            <p className="font-semibold text-charcoal">{orderMeta?.client}</p>
            <p className="text-gray">{orderMeta?.email}</p>
            <p className="text-gray">{orderMeta?.telephone}</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-poppins uppercase tracking-wider text-[10px] font-bold text-gray">
              Livraison & Paiement
            </h3>
            <p className="text-gray">
              <span className="font-medium text-charcoal">Adresse:</span> {orderMeta?.locality}
            </p>
            <p className="text-gray">
              <span className="font-medium text-charcoal">Mode:</span>{" "}
              {orderMeta?.type_payement === "paytech" ? "En ligne (PayTech)" : "À la livraison"}
            </p>
            <p className="text-gray">
              <span className="font-medium text-charcoal">Statut:</span>{" "}
              <span className={`font-semibold ${orderMeta?.status || orderMeta?.type_payement === "livraison" ? "text-primary-dark" : "text-accent-gold"}`}>
                {orderMeta?.status ? "Payé" : orderMeta?.type_payement === "livraison" ? "À régler au livreur" : "En attente"}
              </span>
            </p>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-primary-soft/30 text-xs font-poppins uppercase text-gray/80">
                <th className="py-3 font-semibold">Article</th>
                <th className="py-3 text-right font-semibold">Prix unitaire</th>
                <th className="py-3 text-center font-semibold">Quantité</th>
                <th className="py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-primary-soft/10 text-charcoal">
                  <td className="py-4 font-medium max-w-xs truncate">{item.name || item.title}</td>
                  <td className="py-4 text-right">
                    {Number(item.prix_unitaire || item.prix || 0).toLocaleString()} CFA
                  </td>
                  <td className="py-4 text-center">{item.quantite || item.quantity}</td>
                  <td className="py-4 text-right font-semibold">
                    {Number(item.prix_total || 0).toLocaleString()} CFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Totals */}
        <div className="flex justify-end pt-4">
          <div className="w-full sm:w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray">
              <span>Sous-total articles</span>
              <span>{getSubtotal().toLocaleString()} CFA</span>
            </div>
            {orderMeta?.livraison && (
              <div className="flex justify-between text-gray">
                <span>Frais de livraison</span>
                <span>{getShippingFee().toLocaleString()} CFA</span>
              </div>
            )}
            
            <hr className="border-t border-primary-soft/20 my-2" />

            <div className="flex justify-between text-base font-serif font-bold text-charcoal pt-1">
              <span>Montant total</span>
              <span className="text-primary-dark">
                {getGrandTotal().toLocaleString()} CFA
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Footer note */}
        <div className="border-t border-primary-soft/20 pt-8 text-center text-xs text-gray/50 space-y-1">
          <p>Merci pour votre confiance et bon voyage littéraire avec Bëgg Lire !</p>
          <p>Facture générée numériquement et conforme aux conditions générales.</p>
        </div>
      </div>
    </div>
  );
};

export default Facture;

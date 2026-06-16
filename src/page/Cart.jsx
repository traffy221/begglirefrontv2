import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const {
    items,
    totalPrice,
    bookItems,
    supplyItems,
    updateQuantity,
    removeItem,
  } = useCart();

  // Compute subtotals in-memory
  const booksSubtotal = bookItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const suppliesSubtotal = supplyItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckoutRedirect = () => {
    navigate("/checkout");
  };

  const getImgUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    if (path.startsWith("http")) return path;
    // Fallback to local image URL if appropriate
    return `http://localhost:8000/storage/${path}`;
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 md:px-12 max-w-xl py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-primary-soft/20 rounded-full flex items-center justify-center mx-auto text-primary">
          <ShoppingBag size={28} className="text-primary-dark" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-charcoal">Votre panier est vide</h2>
          <p className="text-gray text-sm font-light leading-relaxed">
            "Chaque grand voyage littéraire commence par l'ajout d'une première page à son panier."
          </p>
        </div>
        <p className="text-xs text-gray/50 max-w-xs mx-auto">
          Explorez notre sélection pour y dénicher des ouvrages remarquables ou des fournitures pour votre rentrée.
        </p>
        <div className="pt-2">
          <Link
            to="/catalogue"
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors inline-flex items-center space-x-1"
          >
            <span>Parcourir le catalogue</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // Helper to render items
  const renderCartItem = (item) => (
    <div
      key={`${item.id}-${item.type}`}
      className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 p-5 bg-white rounded-2xl border border-primary-soft/10 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 w-full">
        <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-sm bg-ivory">
          <img
            src={getImgUrl(item.image)}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <div>
            <span
              className={`font-poppins uppercase tracking-wider text-[9px] font-bold px-2 py-0.5 rounded ${
                item.type === "book"
                  ? "bg-primary-soft/30 text-primary-dark"
                  : "bg-accent-gold/20 text-charcoal"
              }`}
            >
              {item.type === "book" ? "Livre" : "Fourniture"}
            </span>
            <h3 className="font-serif font-bold text-lg text-charcoal line-clamp-1 mt-1">
              {item.title}
            </h3>
            <p className="text-xs text-gray/70">
              Prix unitaire : {Number(item.price).toLocaleString()} CFA
            </p>
          </div>
          <p className="text-base font-serif font-bold text-primary-dark">
            {(item.price * item.quantity).toLocaleString()} CFA
          </p>
        </div>
      </div>

      {/* Stepper & Delete */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
        <div className="flex items-center space-x-2 bg-ivory rounded-lg border border-primary-soft/20 p-1">
          <button
            onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1 hover:text-primary disabled:opacity-35 transition-colors"
            aria-label="Decrease"
          >
            <Minus size={14} />
          </button>
          <span className="font-poppins font-semibold text-xs px-2 min-w-[20px] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
            disabled={item.stock > 0 && item.quantity >= item.stock}
            className="p-1 hover:text-primary disabled:opacity-35 transition-colors"
            aria-label="Increase"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={() => removeItem(item.id, item.type)}
          className="p-2 hover:bg-destructive/5 hover:text-destructive text-gray/50 rounded-xl transition-all"
          title="Retirer du panier"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 md:px-12 max-w-7xl py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-charcoal mb-10 text-center md:text-left">
        Mon Panier d'Achats
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Items List (65%) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Books Sub-List */}
          {bookItems.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-poppins uppercase tracking-wider text-xs font-bold text-primary-dark border-b border-primary-soft/20 pb-2">
                Mes Ouvrages Littéraires ({bookItems.length})
              </h2>
              <div className="space-y-4">{bookItems.map(renderCartItem)}</div>
            </div>
          )}

          {/* Supplies Sub-List */}
          {supplyItems.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-poppins uppercase tracking-wider text-xs font-bold text-accent-gold border-b border-primary-soft/20 pb-2">
                Fournitures Scolaires & Bureautique ({supplyItems.length})
              </h2>
              <div className="space-y-4">{supplyItems.map(renderCartItem)}</div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Summary (35%) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-primary-soft/20 shadow-sm space-y-6 lg:sticky lg:top-32 h-fit">
            <h2 className="font-serif font-bold text-lg text-charcoal border-b border-primary-soft/10 pb-4">
              Récapitulatif de ma commande
            </h2>

            <div className="space-y-3 text-sm">
              {bookItems.length > 0 && (
                <div className="flex justify-between text-gray">
                  <span>Sous-total Livres</span>
                  <span className="font-semibold text-charcoal">
                    {booksSubtotal.toLocaleString()} CFA
                  </span>
                </div>
              )}
              {supplyItems.length > 0 && (
                <div className="flex justify-between text-gray">
                  <span>Sous-total Fournitures</span>
                  <span className="font-semibold text-charcoal">
                    {suppliesSubtotal.toLocaleString()} CFA
                  </span>
                </div>
              )}

              <hr className="border-t border-primary-soft/10" />

              <div className="flex justify-between text-base font-serif font-bold text-charcoal pt-2">
                <span>Total général</span>
                <span className="text-primary-dark">
                  {totalPrice.toLocaleString()} CFA
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCheckoutRedirect}
                className="w-full bg-accent-gold hover:bg-accent-gold/90 text-charcoal font-bold py-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Passer la commande</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

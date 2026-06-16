import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isRehydrated, setIsRehydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("bl_cart");
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    }
    setIsRehydrated(true);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isRehydrated) {
      try {
        localStorage.setItem("bl_cart", JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save cart to localStorage", error);
      }
    }
  }, [items, isRehydrated]);

  // Add item to cart
  const addItem = (product, type) => {
    if (!product || !product.id) return;

    setItems((prevItems) => {
      // Normalize properties to support book vs supply variations from backend routes
      const normalizedPrice = Number(product.prix_vente ?? product.prix ?? product.price ?? 0);
      const normalizedTitle = product.titre ?? product.nom ?? product.title ?? "Produit sans titre";
      const normalizedImage = product.image ?? product.image_url ?? product.photo ?? "";
      const normalizedStock = Number(product.stock ?? product.quantite ?? 999);

      const existingIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.type === type
      );

      if (existingIndex > -1) {
        // Increment quantity of existing item
        return prevItems.map((item, idx) => {
          if (idx === existingIndex) {
            const nextQty = item.quantity + 1;
            // Cap at stock if stock is valid
            const finalQty = normalizedStock > 0 ? Math.min(nextQty, normalizedStock) : nextQty;
            return { ...item, quantity: finalQty };
          }
          return item;
        });
      }

      // Add as new item
      const newItem = {
        id: product.id,
        type, // 'book' | 'supply'
        title: normalizedTitle,
        price: normalizedPrice,
        image: normalizedImage,
        stock: normalizedStock,
        quantity: 1,
      };

      return [...prevItems, newItem];
    });
  };

  // Remove item from cart
  const removeItem = (id, type) => {
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.type === type))
    );
  };

  // Update item quantity
  const updateQuantity = (id, type, quantity) => {
    const targetQty = Math.max(1, quantity);

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id && item.type === type) {
          const maxStock = item.stock > 0 ? item.stock : 999;
          return { ...item, quantity: Math.min(targetQty, maxStock) };
        }
        return item;
      })
    );
  };

  // Clear all items in cart
  const clearCart = () => {
    setItems([]);
  };

  // Computed Values (Memoized)
  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const bookItems = useMemo(() => {
    return items.filter((item) => item.type === "book");
  }, [items]);

  const supplyItems = useMemo(() => {
    return items.filter((item) => item.type === "supply");
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        bookItems,
        supplyItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

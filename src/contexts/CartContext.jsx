import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("food_delivery_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeRestaurant, setActiveRestaurant] = useState(() => {
    const saved = localStorage.getItem("food_delivery_cart_restaurant");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("food_delivery_cart", JSON.stringify(cartItems));
    if (cartItems.length === 0) {
      setActiveRestaurant(null);
      localStorage.removeItem("food_delivery_cart_restaurant");
    } else {
      localStorage.setItem("food_delivery_cart_restaurant", JSON.stringify(activeRestaurant));
    }
  }, [cartItems, activeRestaurant]);

  const addToCart = (item, restaurant) => {
    // If cart has items from a different restaurant, warn/prevent
    if (activeRestaurant && activeRestaurant.id !== restaurant.id) {
      if (window.confirm(`Your cart contains items from "${activeRestaurant.name}". Clear cart and add items from "${restaurant.name}"?`)) {
        setCartItems([{ ...item, quantity: 1 }]);
        setActiveRestaurant(restaurant);
      }
      return;
    }

    if (!activeRestaurant) {
      setActiveRestaurant(restaurant);
    }

    setCartItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCartItems([]);
    setActiveRestaurant(null);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      activeRestaurant,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}
export default CartContext;

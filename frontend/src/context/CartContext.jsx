"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
} from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchCart() {
    if (!token) {
      setItems([]);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);

      const data = await getCart(token);

      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, [token]);

  async function addItem(productId, quantity = 1) {
    await addToCart(token, productId, quantity);
    await fetchCart();
  }

  async function updateItem(productId, quantity) {
    await updateCart(token, productId, quantity);
    await fetchCart();
  }

  async function removeItem(productId) {
    await removeFromCart(token, productId);
    await fetchCart();
  }

  const cartCount = items.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        cartCount,
        loading,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
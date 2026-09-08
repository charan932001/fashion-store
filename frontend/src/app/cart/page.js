"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder } from "../../services/orderService";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";

export default function CartPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const {
    items,
    total,
    loading,
    updateItem,
    removeItem,
    fetchCart,
  } = useCart();

  const [placingOrder, setPlacingOrder] = useState(false);

  async function handleUpdateQuantity(productId, quantity) {
    try {
      await updateItem(productId, quantity);
      toast.success("Cart updated.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleRemove(productId) {
    try {
      await removeItem(productId);
      toast.success("Item removed from cart.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleCheckout() {
    try {
      setPlacingOrder(true);
      await createOrder(token);
      await fetchCart();
      toast.success("Order placed successfully.");
      router.push("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPlacingOrder(false);
    }
  }

  if (!user) {
    return (
      <>
        <Header />

        <main className="mx-auto max-w-7xl p-6">
          <EmptyState message="Please login to view your cart." />
        </main>
      </>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (items.length === 0) {
    return (
      <>
        <Header />

        <main className="mx-auto max-w-7xl p-6">
          <EmptyState message="Your cart is empty." />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl p-6">
        <h1 className="mb-8 text-3xl font-semibold">
          Your Cart
        </h1>

        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-6 border-b pb-6"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="h-32 w-24 object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src =
                    "https://placehold.co/600x800?text=No+Image";
                }}
              />

              <div className="flex-1">
                <h2 className="font-medium">
                  {item.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  ${Number(item.price).toFixed(2)}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateQuantity(
                        item.product_id,
                        item.quantity - 1
                      )
                    }
                    disabled={item.quantity <= 1}
                    className="border px-3 py-1 disabled:opacity-40"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateQuantity(
                        item.product_id,
                        item.quantity + 1
                      )
                    }
                    disabled={item.quantity >= item.stock}
                    className="border px-3 py-1 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleRemove(item.product_id)
                  }
                  className="mt-4 text-sm text-red-500"
                >
                  Remove
                </button>
              </div>

              <p className="font-medium">
                ${Number(item.item_total).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <div className="w-full max-w-sm border p-6">
            <div className="flex justify-between">
              <span>Total</span>

              <span className="font-semibold">
                ${Number(total).toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={placingOrder}
              className="mt-6 w-full bg-black px-6 py-3 text-center text-sm text-white disabled:bg-gray-300"
            >
              {placingOrder ? "Placing order..." : "Checkout"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
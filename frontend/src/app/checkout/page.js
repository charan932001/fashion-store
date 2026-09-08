"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Header from "../../components/Header";
import EmptyState from "../../components/EmptyState";
import Loading from "../../components/Loading";
import ErrorState from "../../components/ErrorState";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";

export default function CheckoutPage() {
  const { user, token } = useAuth();
  const { items, total, loading: cartLoading } = useCart();

  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);

      const data = await createOrder(token);

      toast.success("Order placed successfully!");

      router.push(
        `/order-confirmation?orderId=${data.order.id}`
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl p-6">
          <EmptyState message="Please login to continue to checkout." />
        </main>
      </>
    );
  }

  if (cartLoading) {
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

      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold">
          Checkout
        </h1>

        <div className="grid gap-10 md:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm">
                Full Name
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">
                Address
              </label>

              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full border px-4 py-3"
                placeholder="Street address"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm">
                  City
                </label>

                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">
                  State
                </label>

                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full border px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm">
                Postal Code
              </label>

              <input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                className="w-full border px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black px-6 py-3 text-sm text-white disabled:bg-gray-300"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          <div className="h-fit border p-6">
            <h2 className="mb-6 text-xl font-semibold">
              Order Summary
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4"
                >
                  <div>
                    <p className="text-sm">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm">
                    $
                    {Number(item.item_total).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-6">
              <div className="flex justify-between font-semibold">
                <span>Total</span>

                <span>
                  ${Number(total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getProductById } from "../../../services/productService";
import Loading from "../../../components/Loading";
import ErrorState from "../../../components/ErrorState";
import EmptyState from "../../../components/EmptyState";
import Header from "../../../components/Header";
import { useCart } from "../../../context/CartContext";

export default function ProductDetail() {
  const params = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAddToCart() {
    try {
      setAdding(true);
      await addItem(product.id, 1);
      toast.success("Added to cart.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAdding(false);
    }
  }

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProductById(params.id);
        setProduct(data.product);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!product) {
    return <EmptyState message="Product not found." />;
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl p-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[3/4] overflow-hidden bg-gray-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src =
                  "https://placehold.co/600x800?text=No+Image";
              }}
            />
          </div>

          <div className="py-4">
            <p className="mb-2 text-sm text-gray-500">
              {product.category}
            </p>

            <h1 className="mb-4 text-3xl font-semibold">
              {product.name}
            </h1>

            <p className="mb-6 text-xl">
              ${Number(product.price).toFixed(2)}
            </p>

            <p className="mb-6 text-gray-600">
              {product.description}
            </p>

            <p className="text-sm text-gray-500">
              {product.stock > 0
                ? `${product.stock} available`
                : "Out of stock"}
            </p>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              className="mt-6 rounded-md bg-black px-6 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
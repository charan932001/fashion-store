"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Header from "../../components/Header";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <>
      <Header />

      <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-6 py-12">
        <div className="w-full text-center">
          <div className="mb-6 text-5xl">✓</div>

          <h1 className="text-3xl font-semibold">
            Order Confirmed
          </h1>

          <p className="mt-4 text-gray-500">
            Thank you for your purchase. Your order has been
            successfully placed.
          </p>

          {orderId && (
            <p className="mt-3 text-sm text-gray-500">
              Order ID: #{orderId}
            </p>
          )}

          <Link
            href="/"
            className="mt-8 inline-block bg-black px-6 py-3 text-sm text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </>
  );
}
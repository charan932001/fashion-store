"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold">
          Fashion Store
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/">Home</Link>

          <Link href="/cart">
            Cart ({cartCount})
          </Link>

          {user ? (
            <>
              <span>Hi, {user.name}</span>

              <button
                type="button"
                onClick={logout}
                className="cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
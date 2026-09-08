"use client";

import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Header from "../components/Header";

const DEFAULT_LIMIT = 8;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts(page, DEFAULT_LIMIT, search);

        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [page, search]);

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <>
      <Header />
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-8 text-3xl font-semibold">
        Products
      </h1>

      <input
        type="text"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search products..."
        className="mb-8 w-full max-w-md border px-4 py-2 text-sm"
      />

      {loading ? (
        <Loading />
      ) : products.length === 0 ? (
        <EmptyState
          message={
            search
              ? `No products match "${search}".`
              : "No products found."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
    </>
  );
}
import { apiRequest } from "./api";

export async function getProducts(page = 1, limit = 8, search = "") {
  const params = new URLSearchParams({ page, limit });

  if (search) {
    params.set("search", search);
  }

  return apiRequest(`/api/products?${params.toString()}`);
}

export async function getProductById(id) {
  return apiRequest(`/api/products/${id}`);
}
import { apiRequest } from "./api";

export async function getProducts() {
  return apiRequest("/api/products");
}

export async function getProductById(id) {
  return apiRequest(`/api/products/${id}`);
}
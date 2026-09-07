import { apiRequest } from "./api";

export async function addToCart(token, productId, quantity = 1) {
  return apiRequest("/api/cart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });
}

export async function getCart(token) {
  return apiRequest("/api/cart", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateCart(token, productId, quantity) {
  return apiRequest(`/api/cart/${productId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      quantity,
    }),
  });
}

export async function removeFromCart(token, productId) {
  return apiRequest(`/api/cart/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
import { apiRequest } from "./api";

export async function createOrder(token) {
  return apiRequest("/api/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
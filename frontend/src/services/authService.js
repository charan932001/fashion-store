import { apiRequest } from "./api";

export async function registerUser(userData) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function loginUser(credentials) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getCurrentUser(token) {
  return apiRequest("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
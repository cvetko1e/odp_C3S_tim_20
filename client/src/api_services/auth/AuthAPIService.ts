import axios from "axios";
import type { AuthResponse } from "../../types/auth/AuthResponse";
import type { IAuthAPIService } from "./IAuthAPIService";
import type { RegisterPayload } from "../../types/auth/RegisterPayload";
import { apiClient } from "../apiClient";

const err = (e: Error, fallback: string): AuthResponse => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const authApi: IAuthAPIService = {
  async login(username, password) {
    return apiClient.post<AuthResponse>("auth/login", { username, password })
      .then(r => r.data).catch((e: Error) => err(e, "Login failed"));
  },
  async register(payload: RegisterPayload) {
    return apiClient.post<AuthResponse>("auth/register", payload)
      .then(r => r.data).catch((e: Error) => err(e, "Registration failed"));
  },
  async logout(token: string) {
  return apiClient.post<AuthResponse>(
    "auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  .then(r => r.data)
  .catch((e: Error) => err(e, "Logout failed"));
},
};

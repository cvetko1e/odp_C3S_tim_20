import axios from "axios";
import type { AuthResponse } from "../../types/auth/AuthResponse";
import type { IAuthAPIService } from "./IAuthAPIService";
import type { RegisterPayload } from "../../types/auth/RegisterPayload";

const BASE = import.meta.env.VITE_API_URL + "auth";
const err = (e: Error, fallback: string): AuthResponse => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const authApi: IAuthAPIService = {
  async login(username, password) {
    return axios.post<AuthResponse>(`${BASE}/login`, { username, password })
      .then(r => r.data).catch((e: Error) => err(e, "Login failed"));
  },
  async register(payload: RegisterPayload) {
    return axios.post<AuthResponse>(`${BASE}/register`, payload)
      .then(r => r.data).catch((e: Error) => err(e, "Registration failed"));
  },
};

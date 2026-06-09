import axios from "axios";
import type { IUsersAPIService, ApiResponse } from "./IUsersAPIService";
import type { UpdateUserProfilePayload, UserDto } from "../../models/user/UserTypes";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "users";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: Error, fallback: string): ApiResponse<T> => ({
  success: false,
    message: axios.isAxiosError(e)
        ? (e.response?.data as { message?: string })?.message ?? fallback
        : fallback,

});

export const usersApi: IUsersAPIService = {
  async getAll() {
    return axios.get<ApiResponse<UserDto[]>>(BASE, { headers: authHeader() })
            .then((r) => r.data).catch((e) => err(e, "Failed to load users"));
  },
  async getById(id) {
    return axios.get<ApiResponse<UserDto>>(`${BASE}/${id}`, { headers: authHeader() })
          .then((r) => r.data).catch((e) => err(e, "Failed to load user"));
  },
  async updateMe(payload: UpdateUserProfilePayload) {
    return axios.put<ApiResponse<UserDto>>(`${BASE}/me`, payload, { headers: authHeader() })
      .then((r) => r.data).catch((e) => err(e, "Failed to update profile"));
  },
  async deactivate(id) {
    return axios.patch<ApiResponse<void>>(`${BASE}/${id}/deactivate`, {}, { headers: authHeader() })
            .then((r) => r.data).catch((e) => err(e, "Failed to deactivate user"));
    },
    async changeRole(id, role) {
        return axios.put<ApiResponse<void>>(`${BASE}/${id}/role`, { role }, { headers: authHeader() })
            .then((r) => r.data).catch((e) => err(e, "Failed to change role"));
  },
};

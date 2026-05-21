import axios from "axios";
import type { IFollowAPIService, ApiResponse } from "./IFollowAPIService";
import type { UserDto } from "../../models/user/UserTypes";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "users";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e)
    ? (e.response?.data as { message?: string })?.message ?? fallback
    : fallback,
});

export const followApi: IFollowAPIService = {
  async follow(userId) {
    return axios
      .post<ApiResponse<void>>(`${BASE}/${userId}/follow`, {}, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to follow user"));
  },

  async unfollow(userId) {
    return axios
      .delete<ApiResponse<void>>(`${BASE}/${userId}/follow`, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to unfollow user"));
  },

  async getFollowers(userId) {
    return axios
      .get<ApiResponse<UserDto[]>>(`${BASE}/${userId}/followers`, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to load followers"));
  },

  async getFollowing(userId) {
    return axios
      .get<ApiResponse<UserDto[]>>(`${BASE}/${userId}/following`, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to load following"));
  },

  async searchUsers(query) {
    return axios
      .get<ApiResponse<UserDto[]>>(`${BASE}/search`, {
        headers: authHeader(),
        params: { q: query },
      })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to search users"));
  },
};

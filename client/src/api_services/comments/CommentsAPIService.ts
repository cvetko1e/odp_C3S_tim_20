import axios from "axios";
import type { ICommentsAPIService, ApiResponse } from "./ICommentsAPIService";
import type { CommentDto } from "../../models/comments/CommentTypes";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "comments";

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

export const commentsApi: ICommentsAPIService = {
  async getByPost(postId) {
    return axios
      .get<ApiResponse<CommentDto[]>>(`${BASE}/post/${postId}`, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to load comments"));
  },

  async create(postId, content, parentId) {
    return axios
      .post<ApiResponse<CommentDto>>(BASE, { postId, content, parentId }, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to post comment"));
  },

  async update(id, content) {
    return axios
      .put<ApiResponse<void>>(`${BASE}/${id}`, { content }, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to update comment"));
  },

  async remove(id) {
    return axios
      .delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to delete comment"));
  },

  async like(id) {
    return axios
      .post<ApiResponse<void>>(`${BASE}/${id}/like`, {}, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to like comment"));
  },

  async unlike(id) {
    return axios
      .delete<ApiResponse<void>>(`${BASE}/${id}/like`, { headers: authHeader() })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to unlike comment"));
  },
};

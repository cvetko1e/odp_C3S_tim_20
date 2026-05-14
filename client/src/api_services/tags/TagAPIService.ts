import axios from "axios";
import type { ITagAPIService } from "./ITagAPIService";
import type { Tag } from "../../types/tags/Tag";
import type { TagActionResponse, TagListResponse, TagSingleResponse } from "../../types/tags/TagApiResponses";

const API_URL = import.meta.env.VITE_API_URL + "tags";
const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export const tagApi: ITagAPIService = {
  async getAllTags(): Promise<Tag[]> {
    try {
      const response = await axios.get<TagListResponse>(API_URL);
      return response.data.success ? (response.data.data ?? []) : [];
    } catch {
      return [];
    }
  },

  async createTag(token: string, name: string): Promise<Tag | null> {
    try {
      const response = await axios.post<TagSingleResponse>(API_URL, { name }, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? null) : null;
    } catch {
      return null;
    }
  },

  async deleteTag(token: string, id: number): Promise<boolean> {
    try {
      const response = await axios.delete<TagActionResponse>(`${API_URL}/${id}`, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },
};

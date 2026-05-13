import axios from "axios";
import type { IPostAPIService } from "./IPostAPIService";
import type { Post } from "../../types/posts/Post";
import type { PostListResponse, SinglePostResponse, PostActionResponse } from "../../types/posts/PostApiResponses";

const API_URL = import.meta.env.VITE_API_URL + "posts";
const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export const postApi: IPostAPIService = {
  async getPostById(id: number, token: string): Promise<Post | null> {
    try {
      const response = await axios.get<SinglePostResponse>(`${API_URL}/${id}`, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? null) : null;
    } catch {
      return null;
    }
  },

  async getPostsByCommunity(communityId: number, token: string): Promise<Post[]> {
    try {
      const response = await axios.get<PostListResponse>(`${API_URL}/community/${communityId}`, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? []) : [];
    } catch {
      return [];
    }
  },

  async getHomeFeed(token: string): Promise<Post[]> {
    try {
      const response = await axios.get<PostListResponse>(`${API_URL}/feed`, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? []) : [];
    } catch {
      return [];
    }
  },

  async createPost(token: string, title: string, content: string, imageUrl: string | null, communityId: number, tagIds: number[]): Promise<Post | null> {
    try {
      const payload = { title, content, imageUrl, communityId, tagIds };
      const response = await axios.post<SinglePostResponse>(API_URL, payload, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? null) : null;
    } catch {
      return null;
    }
  },

  async updatePost(token: string, id: number, title?: string, content?: string, imageUrl?: string | null): Promise<boolean> {
    try {
      const payload = { title, content, imageUrl };
      const response = await axios.put<PostActionResponse>(`${API_URL}/${id}`, payload, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },

  async deletePost(token: string, id: number): Promise<boolean> {
    try {
      const response = await axios.delete<PostActionResponse>(`${API_URL}/${id}`, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },

  async likePost(token: string, id: number): Promise<boolean> {
    try {
      const response = await axios.post<PostActionResponse>(`${API_URL}/${id}/like`, {}, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },

  async unlikePost(token: string, id: number): Promise<boolean> {
    try {
      const response = await axios.delete<PostActionResponse>(`${API_URL}/${id}/like`, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },
};

import type { IPostAPIService } from "./IPostAPIService";
import { emptyPost, type Post } from "../../types/posts/Post";
import type { PostListResponse, SinglePostResponse, PostActionResponse } from "../../types/posts/PostApiResponses";
import { apiClient } from "../apiClient";

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export const postApi: IPostAPIService = {
  async getPostById(id: number, token?: string): Promise<Post> {
    try {
      const response = await apiClient.get<SinglePostResponse>(`posts/${id}`, { headers: token ? authHeader(token) : undefined });
      return response.data.success ? (response.data.data ?? emptyPost) : emptyPost;
    } catch {
      return emptyPost;
    }
  },

  async getPostsByCommunity(communityId: number, token?: string): Promise<Post[]> {
    try {
      const response = await apiClient.get<PostListResponse>(`posts/community/${communityId}`, { headers: token ? authHeader(token) : undefined });
      return response.data.success ? (response.data.data ?? []) : [];
    } catch {
      return [];
    }
  },

  async getHomeFeed(token: string): Promise<Post[]> {
    try {
      const response = await apiClient.get<PostListResponse>("posts/feed", { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? []) : [];
    } catch {
      return [];
    }
  },

  async createPost(token: string, title: string, content: string, imageUrl: string | null, communityId: number, tagIds: number[]): Promise<Post> {
    try {
      const payload = { title, content, imageUrl, communityId, tagIds };
      const response = await apiClient.post<SinglePostResponse>("posts", payload, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? emptyPost) : emptyPost;
    } catch {
      return emptyPost;
    }
  },

  async updatePost(token: string, id: number, title?: string, content?: string, imageUrl?: string | null): Promise<boolean> {
    try {
      const payload = { title, content, imageUrl };
      const response = await apiClient.put<PostActionResponse>(`posts/${id}`, payload, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },

  async deletePost(token: string, id: number): Promise<boolean> {
    try {
      const response = await apiClient.delete<PostActionResponse>(`posts/${id}`, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },

  async likePost(token: string, id: number): Promise<boolean> {
    try {
      const response = await apiClient.post<PostActionResponse>(`posts/${id}/like`, {}, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },

  async unlikePost(token: string, id: number): Promise<boolean> {
    try {
      const response = await apiClient.delete<PostActionResponse>(`posts/${id}/like`, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },
};

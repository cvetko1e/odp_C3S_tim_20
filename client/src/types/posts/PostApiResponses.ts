import type { Post } from "./Post";

export interface PostListResponse {
  success: boolean;
  data?: Post[];
  message?: string;
}

export interface SinglePostResponse {
  success: boolean;
  data?: Post | null;
  message?: string;
}

export interface PostActionResponse {
  success: boolean;
  message?: string;
}

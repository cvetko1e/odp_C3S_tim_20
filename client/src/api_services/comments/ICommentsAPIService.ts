import type { CommentDto } from "../../models/comments/CommentTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ICommentsAPIService {
  getByPost(postId: number): Promise<ApiResponse<CommentDto[]>>;
  create(postId: number, content: string, parentId: number | null): Promise<ApiResponse<CommentDto>>;
  update(id: number, content: string): Promise<ApiResponse<void>>;
  remove(id: number): Promise<ApiResponse<void>>;
  like(id: number): Promise<ApiResponse<void>>;
  unlike(id: number): Promise<ApiResponse<void>>;
}

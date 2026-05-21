import { CommentDto } from "../../DTOs/comments/CommentDto";
import { ServiceResult } from "../../types/ServiceResult";

export interface ICommentService {
  getCommentsByPost(postId: number): Promise<CommentDto[]>;
  createComment(postId: number, authorId: number, content: string, parentId: number | null): Promise<ServiceResult<CommentDto>>;
  updateComment(id: number, userId: number, content: string): Promise<ServiceResult<boolean>>;
  deleteComment(id: number, userId: number, userRole: string): Promise<ServiceResult<boolean>>;
  likeComment(commentId: number, userId: number): Promise<ServiceResult<boolean>>;
  unlikeComment(commentId: number, userId: number): Promise<ServiceResult<boolean>>;
}

import { CommentDto } from "../../DTOs/comments/CommentDto";

export interface ICommentRepository {
  findByPostId(postId: number): Promise<CommentDto[]>;
  findById(id: number): Promise<CommentDto | null>;
  create(postId: number, authorId: number, content: string, parentId: number | null): Promise<CommentDto | null>;
  update(id: number, content: string): Promise<boolean>;
  softDelete(id: number): Promise<boolean>;

  hasUserLikedComment(commentId: number, userId: number): Promise<boolean>;
  addLike(commentId: number, userId: number): Promise<boolean>;
  removeLike(commentId: number, userId: number): Promise<boolean>;

  getDepth(commentId: number): Promise<number>;
}

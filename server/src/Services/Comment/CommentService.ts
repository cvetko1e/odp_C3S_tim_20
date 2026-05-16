import { ICommentService } from "../../Domain/services/Comment/ICommentService";
import { ICommentRepository } from "../../Domain/repositories/Comment/ICommentRepository";
import { CommentDto } from "../../Domain/DTOs/comments/CommentDto";
import { ServiceResult } from "../../Domain/types/ServiceResult";

const MAX_DEPTH = 1; // root = 0, reply = 1 → max 2 levels total

export class CommentService implements ICommentService {
  public constructor(
    private readonly commentRepo: ICommentRepository,
  ) {}

  public async getCommentsByPost(postId: number): Promise<CommentDto[]> {
    return this.commentRepo.findByPostId(postId);
  }

  public async createComment(
    postId: number,
    authorId: number,
    content: string,
    parentId: number | null
  ): Promise<ServiceResult<CommentDto>> {
    if (parentId !== null) {
      const parent = await this.commentRepo.findById(parentId);
      if (!parent) {
        return { success: false, status: 404, message: "Parent comment not found", data: null };
      }
      if (parent.isDeleted) {
        return { success: false, status: 400, message: "Cannot reply to a deleted comment", data: null };
      }
      const depth = await this.commentRepo.getDepth(parentId);
      if (depth >= MAX_DEPTH) {
        return { success: false, status: 400, message: "Maximum comment depth reached (2 levels only)", data: null };
      }
    }

    const comment = await this.commentRepo.create(postId, authorId, content, parentId);
    if (!comment) {
      return { success: false, status: 500, message: "Failed to create comment", data: null };
    }

    return { success: true, status: 201, message: "Comment created", data: comment };
  }

  public async updateComment(
    id: number,
    userId: number,
    content: string
  ): Promise<ServiceResult<boolean>> {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      return { success: false, status: 404, message: "Comment not found", data: null };
    }
    if (comment.isDeleted) {
      return { success: false, status: 400, message: "Cannot edit a deleted comment", data: null };
    }
    if (comment.authorId !== userId) {
      return { success: false, status: 403, message: "Unauthorized to edit this comment", data: null };
    }

    const updated = await this.commentRepo.update(id, content);
    if (!updated) {
      return { success: false, status: 500, message: "Failed to update comment", data: null };
    }

    return { success: true, status: 200, message: "Comment updated", data: true };
  }

  public async deleteComment(
    id: number,
    userId: number,
    userRole: string
  ): Promise<ServiceResult<boolean>> {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      return { success: false, status: 404, message: "Comment not found", data: null };
    }

    const isAuthor = comment.authorId === userId;
    const isAdmin = userRole === "admin";

    if (!isAuthor && !isAdmin) {
      return { success: false, status: 403, message: "Unauthorized to delete this comment", data: null };
    }

    const deleted = await this.commentRepo.softDelete(id);
    if (!deleted) {
      return { success: false, status: 500, message: "Failed to delete comment", data: null };
    }

    return { success: true, status: 200, message: "Comment deleted", data: true };
  }

  public async likeComment(commentId: number, userId: number): Promise<ServiceResult<boolean>> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) {
      return { success: false, status: 404, message: "Comment not found", data: null };
    }
    if (comment.isDeleted) {
      return { success: false, status: 400, message: "Cannot like a deleted comment", data: null };
    }

    const alreadyLiked = await this.commentRepo.hasUserLikedComment(commentId, userId);
    if (alreadyLiked) {
      return { success: false, status: 409, message: "You already liked this comment", data: null };
    }

    const added = await this.commentRepo.addLike(commentId, userId);
    if (!added) {
      return { success: false, status: 500, message: "Failed to like comment", data: null };
    }

    return { success: true, status: 200, message: "Comment liked", data: true };
  }

  public async unlikeComment(commentId: number, userId: number): Promise<ServiceResult<boolean>> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) {
      return { success: false, status: 404, message: "Comment not found", data: null };
    }

    const alreadyLiked = await this.commentRepo.hasUserLikedComment(commentId, userId);
    if (!alreadyLiked) {
      return { success: false, status: 409, message: "Comment was not liked", data: null };
    }

    const removed = await this.commentRepo.removeLike(commentId, userId);
    if (!removed) {
      return { success: false, status: 500, message: "Failed to unlike comment", data: null };
    }

    return { success: true, status: 200, message: "Comment unliked", data: true };
  }
}

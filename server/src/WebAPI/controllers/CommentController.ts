import { Request, Response, Router } from "express";
import { ICommentService } from "../../Domain/services/Comment/ICommentService";
import { IAuditService } from "../../Domain/services/Audit/IAuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";

export class CommentController {
  private readonly router = Router();

  public constructor(
    private readonly commentService: ICommentService,
    private readonly auditService: IAuditService,
  ) {
    this.router.get("/comments/post/:postId",  authenticate, this.getByPost.bind(this));
    this.router.post("/comments",              authenticate, this.create.bind(this));
    this.router.put("/comments/:id",           authenticate, this.update.bind(this));
    this.router.delete("/comments/:id",        authenticate, this.delete.bind(this));
    this.router.post("/comments/:id/like",     authenticate, this.like.bind(this));
    this.router.delete("/comments/:id/like",   authenticate, this.unlike.bind(this));
  }

  private parsePositiveInt(raw: string | string[] | undefined): number | null {
    if (typeof raw !== "string") return null;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }

  private async getByPost(req: Request, res: Response): Promise<void> {
    try {
      const postId = this.parsePositiveInt(req.params.postId);
      if (postId === null) { res.status(400).json({ success: false, message: "Invalid post id" }); return; }
      const comments = await this.commentService.getCommentsByPost(postId);
      res.status(200).json({ success: true, data: comments });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }

      const postId = typeof req.body.postId === "number"
        ? req.body.postId
        : Number.parseInt(req.body.postId, 10);
      if (!Number.isInteger(postId) || postId <= 0) { res.status(400).json({ success: false, message: "Invalid postId" }); return; }

      const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
      if (!content) { res.status(400).json({ success: false, message: "Content is required" }); return; }
      if (content.length > 2000) { res.status(400).json({ success: false, message: "Content must be 2000 characters or fewer" }); return; }

      const parentId = req.body.parentId != null ? Number.parseInt(String(req.body.parentId), 10) : null;
      if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0)) { res.status(400).json({ success: false, message: "Invalid parentId" }); return; }

      const result = await this.commentService.createComment(postId, userId, content, parentId);

      if (result.success && result.data) {
        await this.auditService.log('COMMENT_POST', userId, 'post', postId, null, req.ip ?? null);
      }

      res.status(result.status).json({ success: result.success, data: result.data, message: result.message });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
      const id = this.parsePositiveInt(req.params.id);
      if (id === null) { res.status(400).json({ success: false, message: "Invalid comment id" }); return; }
      const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
      if (!content) { res.status(400).json({ success: false, message: "Content is required" }); return; }
      if (content.length > 2000) { res.status(400).json({ success: false, message: "Content must be 2000 characters or fewer" }); return; }
      const result = await this.commentService.updateComment(id, userId, content);
      res.status(result.status).json({ success: result.success, message: result.message });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId   = req.user?.id;
      const userRole = req.user?.role;
      if (!userId || !userRole) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
      const id = this.parsePositiveInt(req.params.id);
      if (id === null) { res.status(400).json({ success: false, message: "Invalid comment id" }); return; }
      const result = await this.commentService.deleteComment(id, userId, userRole);
      res.status(result.status).json({ success: result.success, message: result.message });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async like(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
      const commentId = this.parsePositiveInt(req.params.id);
      if (commentId === null) { res.status(400).json({ success: false, message: "Invalid comment id" }); return; }
      const result = await this.commentService.likeComment(commentId, userId);
      res.status(result.status).json({ success: result.success, message: result.message });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async unlike(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
      const commentId = this.parsePositiveInt(req.params.id);
      if (commentId === null) { res.status(400).json({ success: false, message: "Invalid comment id" }); return; }
      const result = await this.commentService.unlikeComment(commentId, userId);
      res.status(result.status).json({ success: result.success, message: result.message });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  public getRouter(): Router { return this.router; }
}

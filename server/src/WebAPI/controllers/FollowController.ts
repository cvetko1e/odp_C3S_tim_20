import { Request, Response, Router } from "express";
import { IFollowService } from "../../Domain/services/Follow/IFollowService";
import { IAuditService } from "../../Domain/services/Audit/IAuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";

export class FollowController {
  private readonly router = Router();

  public constructor(
    private readonly followService: IFollowService,
    private readonly auditService: IAuditService,
  ) {
    this.router.post("/users/:id/follow",    authenticate, this.follow.bind(this));
    this.router.delete("/users/:id/follow",  authenticate, this.unfollow.bind(this));
    this.router.get("/users/:id/followers",  authenticate, this.getFollowers.bind(this));
    this.router.get("/users/:id/following",  authenticate, this.getFollowing.bind(this));
    this.router.get("/users/search",         authenticate, this.search.bind(this));
  }

  private parsePositiveInt(raw: string | string[] | undefined): number | null {
    if (typeof raw !== "string") return null;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }

  private async follow(req: Request, res: Response): Promise<void> {
    try {
      const followerId = req.user?.id;
      if (!followerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
      const followingId = this.parsePositiveInt(req.params.id);
      if (followingId === null) { res.status(400).json({ success: false, message: "Invalid user id" }); return; }

      const result = await this.followService.follow(followerId, followingId);

      if (result.success) {
        await this.auditService.log('FOLLOW_USER', followerId, 'user', followingId, null, req.ip ?? null);
      }

      res.status(result.status).json({ success: result.success, message: result.message });
    } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
  }

  private async unfollow(req: Request, res: Response): Promise<void> {
    try {
      const followerId = req.user?.id;
      if (!followerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
      const followingId = this.parsePositiveInt(req.params.id);
      if (followingId === null) { res.status(400).json({ success: false, message: "Invalid user id" }); return; }
      const result = await this.followService.unfollow(followerId, followingId);
      res.status(result.status).json({ success: result.success, message: result.message });
    } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
  }

  private async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.parsePositiveInt(req.params.id);
      if (userId === null) { res.status(400).json({ success: false, message: "Invalid user id" }); return; }
      const followers = await this.followService.getFollowers(userId);
      res.status(200).json({ success: true, data: followers });
    } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
  }

  private async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.parsePositiveInt(req.params.id);
      if (userId === null) { res.status(400).json({ success: false, message: "Invalid user id" }); return; }
      const following = await this.followService.getFollowing(userId);
      res.status(200).json({ success: true, data: following });
    } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
  }

  private async search(req: Request, res: Response): Promise<void> {
    try {
      const requesterId = req.user?.id;
      if (!requesterId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
      const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
      if (!query) { res.status(400).json({ success: false, message: "Query parameter 'q' is required" }); return; }
      const users = await this.followService.searchUsers(query, requesterId);
      res.status(200).json({ success: true, data: users });
    } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
  }

  public getRouter(): Router { return this.router; }
}

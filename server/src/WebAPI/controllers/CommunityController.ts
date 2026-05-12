import { Request, Response, Router } from "express";
import { ICommunityService } from "../../Domain/services/communities/ICommunityService";
import { UserRole } from "../../Domain/enums/UserRole";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { CreateCommunityDto } from "../../Domain/DTOs/communities/CreateCommunityDto";
import { UpdateCommunityDto } from "../../Domain/DTOs/communities/UpdateCommunityDto";
import { validateCreateCommunity, validateUpdateCommunity } from "../validators/communities/validateCommunity";

export class CommunityController {
  private readonly router = Router();

  public constructor(private readonly communityService: ICommunityService) {
    this.router.get("/communities", this.getPublic.bind(this));
    this.router.get("/communities/mine", authenticate, this.getMine.bind(this));
    this.router.get("/communities/all", authenticate, authorize(UserRole.ADMIN), this.getAll.bind(this));
    this.router.post("/communities", authenticate, this.create.bind(this));
    this.router.get("/communities/:id", this.getById.bind(this));
    this.router.put("/communities/:id", authenticate, this.update.bind(this));
    this.router.delete("/communities/:id", authenticate, this.delete.bind(this));
    this.router.post("/communities/:id/join", authenticate, this.join.bind(this));
    this.router.delete("/communities/:id/leave", authenticate, this.leave.bind(this));
  }

  private parseId(rawId: string): number | null {
    const id = Number.parseInt(rawId, 10);
    return Number.isNaN(id) ? null : id;
  }

  private getSingleParam(value: string | string[] | undefined): string | null {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && value.length > 0) return value[0];
    return null;
  }

  private async getPublic(req: Request, res: Response): Promise<void> {
    try {
      const communities = await this.communityService.getPublic();
      res.status(200).json({ success: true, data: communities });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async getMine(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const communities = await this.communityService.getMine(req.user.id);
      res.status(200).json({ success: true, data: communities });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async getAll(req: Request, res: Response): Promise<void> {
    try {
      const communities = await this.communityService.getAll();
      res.status(200).json({ success: true, data: communities });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const rawType = typeof req.body.type === "string" ? req.body.type : "";
      if (rawType !== "public" && rawType !== "private") {
        res.status(400).json({ success: false, message: "Type must be 'public' or 'private'" });
        return;
      }

      const dto = new CreateCommunityDto(
        typeof req.body.name === "string" ? req.body.name.trim() : "",
        typeof req.body.description === "string" ? req.body.description : null,
        typeof req.body.rules === "string" ? req.body.rules : null,
        typeof req.body.avatarUrl === "string" ? req.body.avatarUrl : null,
        rawType,
      );

      const validation = validateCreateCommunity(dto);
      if (!validation.valid) {
        res.status(400).json({ success: false, message: validation.message ?? "Invalid input" });
        return;
      }

      const created = await this.communityService.create(dto, req.user.id);
      if (!created) {
        res.status(500).json({ success: false, message: "Failed to create community" });
        return;
      }

      res.status(201).json({ success: true, data: created });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const rawId = this.getSingleParam(req.params.id);
      if (!rawId) {
        res.status(400).json({ success: false, message: "Invalid id" });
        return;
      }

      const id = this.parseId(rawId);
      if (id === null) {
        res.status(400).json({ success: false, message: "Invalid id" });
        return;
      }

      const community = await this.communityService.getById(id);
      if (!community) {
        res.status(404).json({ success: false, message: "Community not found" });
        return;
      }

      res.status(200).json({ success: true, data: community });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const rawId = this.getSingleParam(req.params.id);
      if (!rawId) {
        res.status(400).json({ success: false, message: "Invalid id" });
        return;
      }

      const id = this.parseId(rawId);
      if (id === null) {
        res.status(400).json({ success: false, message: "Invalid id" });
        return;
      }

      const community = await this.communityService.getById(id);
      if (!community) {
        res.status(404).json({ success: false, message: "Community not found" });
        return;
      }

      const dto = new UpdateCommunityDto(
        typeof req.body.name === "string" ? req.body.name.trim() : undefined,
        req.body.description === null ? null : (typeof req.body.description === "string" ? req.body.description : undefined),
        req.body.rules === null ? null : (typeof req.body.rules === "string" ? req.body.rules : undefined),
        req.body.avatarUrl === null ? null : (typeof req.body.avatarUrl === "string" ? req.body.avatarUrl : undefined),
        req.body.type === "public" || req.body.type === "private" ? req.body.type : undefined,
      );

      const validation = validateUpdateCommunity(dto);
      if (!validation.valid) {
        res.status(400).json({ success: false, message: validation.message ?? "Invalid input" });
        return;
      }

      const updated = await this.communityService.update(id, dto, req.user.id, req.user.role);
      if (!updated) {
        res.status(409).json({ success: false, message: "Operation not allowed" });
        return;
      }

      res.status(200).json({ success: true, message: "Community updated" });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const rawId = this.getSingleParam(req.params.id);
      if (!rawId) {
        res.status(400).json({ success: false, message: "Invalid id" });
        return;
      }

      const id = this.parseId(rawId);
      if (id === null) {
        res.status(400).json({ success: false, message: "Invalid id" });
        return;
      }

      const community = await this.communityService.getById(id);
      if (!community) {
        res.status(404).json({ success: false, message: "Community not found" });
        return;
      }

      const deleted = await this.communityService.delete(id, req.user.id, req.user.role);
      if (!deleted) {
        res.status(409).json({ success: false, message: "Operation not allowed" });
        return;
      }

      res.status(200).json({ success: true, message: "Community deleted" });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async join(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const rawId = this.getSingleParam(req.params.id);
      if (!rawId) {
        res.status(400).json({ success: false, message: "Invalid id" });
        return;
      }

      const id = this.parseId(rawId);
      if (id === null) {
        res.status(400).json({ success: false, message: "Invalid id" });
        return;
      }

      const community = await this.communityService.getById(id);
      if (!community) {
        res.status(404).json({ success: false, message: "Community not found" });
        return;
      }

      const joined = await this.communityService.join(id, req.user.id);
      if (!joined) {
        res.status(409).json({ success: false, message: "Already member or operation not allowed" });
        return;
      }

      res.status(200).json({ success: true, message: "Join request processed" });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async leave(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const rawId = this.getSingleParam(req.params.id);
      if (!rawId) {
        res.status(400).json({ success: false, message: "Invalid id" });
        return;
      }

      const id = this.parseId(rawId);
      if (id === null) {
        res.status(400).json({ success: false, message: "Invalid id" });
        return;
      }

      const community = await this.communityService.getById(id);
      if (!community) {
        res.status(404).json({ success: false, message: "Community not found" });
        return;
      }

      const left = await this.communityService.leave(id, req.user.id);
      if (!left) {
        res.status(409).json({ success: false, message: "Operation not allowed" });
        return;
      }

      res.status(200).json({ success: true, message: "Left community" });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

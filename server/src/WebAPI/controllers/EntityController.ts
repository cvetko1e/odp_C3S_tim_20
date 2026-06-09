import { Request, Response, Router } from "express";
import { IEntityService } from "../../Domain/services/entity/IEntityService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { EntityStatus } from "../../Domain/enums/EntityStatus";

export class EntityController {
  private readonly router = Router();

  public constructor(private readonly entityService: IEntityService) {
    this.router.get("/entities",          authenticate, authorize(UserRole.ADMIN, UserRole.USER), this.getAll.bind(this));
    this.router.get("/entities/:id",      authenticate, authorize(UserRole.ADMIN, UserRole.USER), this.getById.bind(this));
    this.router.get("/entities/user/:userId", authenticate, authorize(UserRole.ADMIN, UserRole.USER), this.getByUserId.bind(this));
    this.router.post("/entities",         authenticate, authorize(UserRole.USER), this.create.bind(this));
    this.router.patch("/entities/:id",    authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
    this.router.delete("/entities/:id",   authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));
  }

  private parsePositiveInt(raw: string | string[] | undefined): number {
    if (typeof raw !== "string") return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
  }

  private parseStatus(value: string | undefined): EntityStatus | undefined {
    if (
      value === EntityStatus.PENDING ||
      value === EntityStatus.ACTIVE ||
      value === EntityStatus.COMPLETED ||
      value === EntityStatus.CANCELLED
    ) {
      return value;
    }
    return undefined;
  }

  private async getAll(req: Request, res: Response): Promise<void> {
    try {
      const rawPage = typeof req.query.page === "string" ? req.query.page : "1";
      const rawLimit = typeof req.query.limit === "string" ? req.query.limit : "20";
      const page = Number.parseInt(rawPage, 10);
      const limit = Number.parseInt(rawLimit, 10);
      const safePage = Number.isInteger(page) && page > 0 ? page : 1;
      const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 20;
      const result = await this.entityService.getAll(safePage, Math.min(safeLimit, 100));
      res.status(200).json({ success: true, data: result });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parsePositiveInt(req.params.id);
      if (id === 0) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
      const entity = await this.entityService.getById(id);
      if (entity.id === 0) { res.status(404).json({ success: false, message: "Not found" }); return; }
      res.status(200).json({ success: true, data: entity });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.parsePositiveInt(req.params.userId);
      if (userId === 0) { res.status(400).json({ success: false, message: "Invalid userId" }); return; }
      const items = await this.entityService.getByUserId(userId);
      res.status(200).json({ success: true, data: items });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
      const created = await this.entityService.create({ userId });
      if (created.id === 0) { res.status(503).json({ success: false, message: "Failed to create" }); return; }
      res.status(201).json({ success: true, data: created });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parsePositiveInt(req.params.id);
      if (id === 0) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

      const body = req.body as { status?: string };
      const status = this.parseStatus(body.status);
      if (!status) { res.status(400).json({ success: false, message: "Invalid status" }); return; }

      const ok = await this.entityService.update(id, { status });
      res.status(ok ? 200 : 404).json({ success: ok, message: ok ? "Updated" : "Not found" });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parsePositiveInt(req.params.id);
      if (id === 0) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
      const ok = await this.entityService.delete(id);
      res.status(ok ? 200 : 404).json({ success: ok, message: ok ? "Deleted" : "Not found" });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  public getRouter(): Router { return this.router; }
}

import { Request, Response, Router } from "express";
import { IAuditService } from "../../Domain/services/Audit/IAuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class AuditController {
  private readonly router = Router();

  public constructor(private readonly auditService: IAuditService) {
    this.router.get("/audits/logs", authenticate, authorize(UserRole.ADMIN), this.getLogs.bind(this));
  }

  private parsePositiveInt(raw: string | undefined, fallback: number): number {
    if (typeof raw !== "string") return fallback;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
    return parsed;
  }

  private async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const pageParam = typeof req.query.page === "string" ? req.query.page : undefined;
      const limitParam = typeof req.query.limit === "string" ? req.query.limit : undefined;
      const page = this.parsePositiveInt(pageParam, 1);
      const requestedLimit = this.parsePositiveInt(limitParam, 50);
      const limit = requestedLimit > 100 ? 100 : requestedLimit;
      const logs = await this.auditService.getLogs(page, limit);
      res.status(200).json({ success: true, data: logs });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

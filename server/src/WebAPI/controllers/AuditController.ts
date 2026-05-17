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

  private async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const page  = parseInt(req.query.page  as string ?? "1",  10);
      const limit = parseInt(req.query.limit as string ?? "50", 10);
      const logs = await this.auditService.getLogs(
        isNaN(page)  ? 1  : page,
        isNaN(limit) ? 50 : limit,
      );
      res.status(200).json({ success: true, data: logs });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

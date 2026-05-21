import { Request, Response, Router } from "express";
import { DbManager } from "../../Database/connection/DbConnectionPool";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class HealthController {
  private readonly router = Router();

  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {
    // Public — basic health ping
    this.router.get("/health",          this.getHealth.bind(this));

    // Admin — detailed DB node status
    this.router.get("/health/db",       authenticate, authorize(UserRole.ADMIN), this.getDbHealth.bind(this));

    // Admin — trigger manual failover
    this.router.post("/health/failover", authenticate, authorize(UserRole.ADMIN), this.triggerFailover.bind(this));
  }

  // ── GET /api/v1/health ────────────────────────────────────────
  private async getHealth(_req: Request, res: Response): Promise<void> {
    const status = this.db.getHealthStatus();
    const httpCode = status.status === "unhealthy" ? 503 : 200;
    res.status(httpCode).json({
      success: status.status !== "unhealthy",
      data: {
        status:    status.status,
        timestamp: status.timestamp,
        uptime:    status.uptime,
      },
    });
  }

  // ── GET /api/v1/health/db ─────────────────────────────────────
  private async getDbHealth(_req: Request, res: Response): Promise<void> {
    // Run a fresh health check before responding
    await this.db.runHealthCheck();
    const status = this.db.getHealthStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  }

  // ── POST /api/v1/health/failover ──────────────────────────────
  private async triggerFailover(_req: Request, res: Response): Promise<void> {
    this.logger.warn("Health", `Manual failover triggered by admin user ${_req.user?.username ?? "unknown"}`);
    const result = await this.db.promoteSlaveToMaster();

    if (!result.success) {
      res.status(503).json({ success: false, message: result.message });
      return;
    }

    // Run health check after failover to refresh statuses
    await this.db.runHealthCheck();

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        promotedNode:   result.promotedNode,
        previousMaster: result.previousMaster,
        currentStatus:  this.db.getHealthStatus(),
      },
    });
  }

  public getRouter(): Router { return this.router; }
}

import { Request, Response, Router } from "express";
import { IUserService } from "../../Domain/services/users/IUserService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { IAuditService } from "../../Domain/services/Audit/IAuditService";


export class UserController {
  private readonly router = Router();

    public constructor(
        private readonly userService: IUserService,
        private readonly auditService: IAuditService,
    ) {
        this.router.get("/users", authenticate, authorize(UserRole.ADMIN), this.getAll.bind(this));
        this.router.get("/users/:id", authenticate, authorize(UserRole.ADMIN), this.getById.bind(this));
        this.router.patch("/users/:id/deactivate", authenticate, authorize(UserRole.ADMIN), this.deactivate.bind(this));
        this.router.put("/users/:id/role", authenticate, authorize(UserRole.ADMIN), this.changeRole.bind(this));


  private async getAll(req: Request, res: Response): Promise<void> {
      try {
          const users = await this.userService.getAll();
          res.status(200).json({ success: true, data: users });
      } catch {
          res.status(500).json({ success: false, message: "Internal server error" });
      }

  }

  private async getById(req: Request, res: Response): Promise<void> {
      try {
          const id = parseInt(req.params.id as string, 10);
          if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
          const user = await this.userService.getById(id);
          if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
          res.status(200).json({ success: true, data: user });
      } catch {
          res.status(500).json({ success: false, message: "Internal server error" });
      }
  }

    private async deactivate(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
            const ok = await this.userService.deactivate(id);
            res.status(ok ? 200 : 500).json({ success: ok, message: ok ? "User deactivated" : "Failed to deactivate user" });
        } catch {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    private async changeRole(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

            const { role } = req.body as { role?: string };
            if (!role || (role !== "user" && role !== "admin")) {
                res.status(400).json({ success: false, message: "Role must be 'user' or 'admin'" });
                return;
            }

            const ok = await this.userService.changeRole(id, role);
            if (!ok) { res.status(404).json({ success: false, message: "User not found or role unchanged" }); return; }

            await this.auditService.log(
                "ROLE_CHANGE",
                req.user?.id ?? null,
                "user",
                id,
                JSON.stringify({ newRole: role }),
                req.ip ?? null,
            );

            res.status(200).json({ success: true, message: "Role updated" });
        } catch {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    public getRouter(): Router { return this.router; }
}


import { Request, Response, Router } from "express";
import { ICommunityService } from "../../Domain/services/communities/ICommunityService";
import { IAuditService } from "../../Domain/services/Audit/IAuditService";
import { UserRole } from "../../Domain/enums/UserRole";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { CreateCommunityDto } from "../../Domain/DTOs/communities/CreateCommunityDto";
import { UpdateCommunityDto } from "../../Domain/DTOs/communities/UpdateCommunityDto";
import { validateCreateCommunity, validateUpdateCommunity } from "../validators/communities/validateCommunity";

export class CommunityController {
    private readonly router = Router();

    public constructor(
        private readonly communityService: ICommunityService,
        private readonly auditService: IAuditService,
    ) {
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

    private parseId(rawId: string): number {
        const id = Number.parseInt(rawId, 10);
        return Number.isNaN(id) ? 0 : id;
    }

    private getSingleParam(value: string | string[] | undefined): string {
        if (typeof value === "string") return value;
        if (Array.isArray(value) && value.length > 0) return value[0];
        return "";
    }

    private async getPublic(req: Request, res: Response): Promise<void> {
        try {
            const communities = await this.communityService.getPublic();
            res.status(200).json({ success: true, data: communities });
        } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
    }

    private async getMine(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const communities = await this.communityService.getMine(req.user.id);
            res.status(200).json({ success: true, data: communities });
        } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
    }

    private async getAll(req: Request, res: Response): Promise<void> {
        try {
            const communities = await this.communityService.getAll();
            res.status(200).json({ success: true, data: communities });
        } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
    }

    private async create(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }

            const rawType = typeof req.body.type === "string" ? req.body.type : "";
            if (rawType !== "public" && rawType !== "private") {
                res.status(400).json({ success: false, message: "Type must be 'public' or 'private'" }); return;
            }

            const dto = new CreateCommunityDto(
                typeof req.body.name === "string" ? req.body.name.trim() : "",
                typeof req.body.description === "string" ? req.body.description : null,
                typeof req.body.rules === "string" ? req.body.rules : null,
                typeof req.body.avatarUrl === "string" ? req.body.avatarUrl : null,
                rawType,
            );

            const validation = validateCreateCommunity(dto);
            if (!validation.valid) { res.status(400).json({ success: false, message: validation.message ?? "Invalid input" }); return; }

            const result = await this.communityService.create(dto, req.user.id);
            if (!result.success) { res.status(result.status).json({ success: false, message: result.message }); return; }

            await this.auditService.log("CREATE_COMMUNITY", req.user.id, "community", result.data!.id, null, req.ip ?? null);

            res.status(201).json({ success: true, data: result.data });
        } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
    }

    private async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = this.parseId(this.getSingleParam(req.params.id));
            if (id === 0) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
            const result = await this.communityService.getById(id);
            res.status(result.status).json({ success: result.success, message: result.message, data: result.data });
        } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
    }

    private async update(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const id = this.parseId(this.getSingleParam(req.params.id));
            if (id === 0) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

            const dto = new UpdateCommunityDto(
                typeof req.body.name === "string" ? req.body.name.trim() : undefined,
                req.body.description === null ? null : (typeof req.body.description === "string" ? req.body.description : undefined),
                req.body.rules === null ? null : (typeof req.body.rules === "string" ? req.body.rules : undefined),
                req.body.avatarUrl === null ? null : (typeof req.body.avatarUrl === "string" ? req.body.avatarUrl : undefined),
                req.body.type === "public" || req.body.type === "private" ? req.body.type : undefined,
            );

            const validation = validateUpdateCommunity(dto);
            if (!validation.valid) { res.status(400).json({ success: false, message: validation.message ?? "Invalid input" }); return; }

            const result = await this.communityService.update(id, dto, req.user.id, req.user.role);
            res.status(result.status).json({ success: result.success, message: result.message });
        } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
    }

    private async delete(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const id = this.parseId(this.getSingleParam(req.params.id));
            if (id === 0) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
            const result = await this.communityService.delete(id, req.user.id, req.user.role);
            res.status(result.status).json({ success: result.success, message: result.message });
        } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
    }

    private async join(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const id = this.parseId(this.getSingleParam(req.params.id));
            if (id === 0) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

            const result = await this.communityService.join(id, req.user.id);
            if (!result.success) { res.status(result.status).json({ success: false, message: result.message }); return; }

            await this.auditService.log("JOIN_COMMUNITY", req.user.id, "community", id, null, req.ip ?? null);

            res.status(result.status).json({ success: true, message: result.message });
        } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
    }

    private async leave(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
            const id = this.parseId(this.getSingleParam(req.params.id));
            if (id === 0) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
            const result = await this.communityService.leave(id, req.user.id);
            res.status(result.status).json({ success: result.success, message: result.message });
        } catch { res.status(500).json({ success: false, message: "Internal server error" }); }
    }

    public getRouter(): Router { return this.router; }
}

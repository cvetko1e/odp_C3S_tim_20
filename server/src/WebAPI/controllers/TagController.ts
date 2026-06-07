import { Router, Request, Response } from 'express';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { UserRole } from '../../Domain/enums/UserRole';
import { ITagService } from '../../Domain/services/tag/ITagServices';
import { validateTag } from '../validators/tags/validateTag';

export class TagController {
    private readonly router: Router;

    public constructor(private readonly tagService: ITagService) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.get('/tags', this.getAll);
        this.router.post('/tags', authenticate, authorize(UserRole.ADMIN), this.create);
        this.router.delete('/tags/:id', authenticate, authorize(UserRole.ADMIN), this.delete);
    }

    public getRouter(): Router { return this.router; }

    private parsePositiveInt(raw: string | string[] | undefined): number {
        if (typeof raw !== 'string') return 0;
        const parsed = Number.parseInt(raw, 10);
        if (!Number.isInteger(parsed) || parsed <= 0) return 0;
        return parsed;
    }

    public getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const tags = await this.tagService.getAllTags();
            res.status(200).json({ success: true, data: tags });
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };

    public create = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

            const name = typeof req.body.name === 'string' ? req.body.name : '';
            const validation = validateTag(name);
            if (!validation.valid) { res.status(400).json({ success: false, message: validation.message ?? 'Invalid tag' }); return; }

            const result = await this.tagService.createTag(name.trim(), userId);
            res.status(result.status).json({ success: result.success, message: result.message, data: result.data });
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = this.parsePositiveInt(req.params.id);
            if (id === 0) { res.status(400).json({ success: false, message: 'Invalid tag id' }); return; }

            const result = await this.tagService.deleteTag(id);
            res.status(result.status).json({ success: result.success, message: result.message });
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };
}
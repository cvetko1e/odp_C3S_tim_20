import { Router } from 'express';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { UserRole } from '../../Domain/enums/UserRole';
import { Request, Response } from 'express';
import { ITagService } from '../../Domain/services/Tag/ITagServices';
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

  public getRouter(): Router {
    return this.router;
  }

  private parsePositiveInt(raw: string | string[] | undefined): number | null {
    if (typeof raw !== 'string') return null;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
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
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const name = typeof req.body.name === 'string' ? req.body.name : '';
      const validation = validateTag(name);
      if (!validation.valid) {
        res.status(400).json({ success: false, message: validation.message ?? 'Invalid tag' });
        return;
      }

      const tag = await this.tagService.createTag(name.trim(), userId);
      if (!tag) {
        res.status(500).json({ success: false, message: 'Failed to create tag' });
        return;
      }

      res.status(201).json({ success: true, data: tag });
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.parsePositiveInt(req.params.id);
      if (id === null) {
        res.status(400).json({ success: false, message: 'Invalid tag id' });
        return;
      }

      const success = await this.tagService.deleteTag(id);
      if (!success) {
        res.status(404).json({ success: false, message: 'Tag not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Tag deleted successfully' });
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
}

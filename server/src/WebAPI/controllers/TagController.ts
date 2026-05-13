import { Router } from 'express';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { UserRole } from '../../Domain/enums/UserRole';
import { Request, Response } from 'express';
import { ITagService } from '../../Domain/services/Tag/ITagServices';

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

  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const tags = await this.tagService.getAllTags();
      res.status(200).json(tags);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ message: "Tag name is required" });
        return;
      }
      const tag = await this.tagService.createTag(name);
      res.status(201).json(tag);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const success = await this.tagService.deleteTag(id);
      if (!success) {
        res.status(404).json({ message: "Tag not found" });
        return;
      }
      res.status(200).json({ message: "Tag deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}

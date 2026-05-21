import { Router } from 'express';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { Request, Response } from 'express';
import { IPostService } from '../../Domain/services/Post/IPostServices';
import { IAuditService } from '../../Domain/services/Audit/IAuditService';
import { validateCreatePost, validateUpdatePost } from '../validators/posts/validatePost';

export class PostController {
  private readonly router: Router;

  public constructor(
    private readonly postService: IPostService,
    private readonly auditService: IAuditService,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/posts/feed',                    authenticate, this.getFeed);
    this.router.get('/posts/community/:communityId',  authenticate, this.getByCommunity);
    this.router.get('/posts/:id',                     authenticate, this.getById);
    this.router.post('/posts',                        authenticate, this.create);
    this.router.put('/posts/:id',                     authenticate, this.update);
    this.router.delete('/posts/:id',                  authenticate, this.delete);
    this.router.post('/posts/:id/like',               authenticate, this.like);
    this.router.delete('/posts/:id/like',             authenticate, this.unlike);
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

  public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.parsePositiveInt(req.params.id);
      if (id === null) { res.status(400).json({ success: false, message: 'Invalid post id' }); return; }
      const post = await this.postService.getPostById(id);
      if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
      res.status(200).json({ success: true, data: post });
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public getByCommunity = async (req: Request, res: Response): Promise<void> => {
    try {
      const communityId = this.parsePositiveInt(req.params.communityId);
      if (communityId === null) { res.status(400).json({ success: false, message: 'Invalid community id' }); return; }
      const posts = await this.postService.getPostsByCommunity(communityId);
      res.status(200).json({ success: true, data: posts });
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public getFeed = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
      const posts = await this.postService.getHomeFeed(userId);
      res.status(200).json({ success: true, data: posts });
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const communityId = typeof req.body.communityId === 'string'
        ? Number.parseInt(req.body.communityId, 10)
        : Number(req.body.communityId);

      const rawTagIds = req.body.tagIds;
      const tagIds = Array.isArray(rawTagIds)
        ? rawTagIds.map((value: number | string) => Number(value))
        : rawTagIds;

      const title   = typeof req.body.title   === 'string' ? req.body.title   : '';
      const content = typeof req.body.content === 'string' ? req.body.content : '';
      const imageUrl = req.body.imageUrl === null
        ? null
        : (typeof req.body.imageUrl === 'string' ? req.body.imageUrl : undefined);

      const validation = validateCreatePost({ title, content, imageUrl, communityId, tagIds });
      if (!validation.valid) { res.status(400).json({ success: false, message: validation.message ?? 'Invalid input' }); return; }

      const result = await this.postService.createPost(
        title.trim(), content.trim(),
        imageUrl !== undefined ? (imageUrl?.trim() ?? null) : null,
        userId, communityId, tagIds
      );

      if (result.success && result.data) {
        await this.auditService.log('CREATE_POST', userId, 'post', result.data.id, null, req.ip ?? null);
      }

      res.status(result.status).json({ success: result.success, data: result.data, message: result.message });
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.parsePositiveInt(req.params.id);
      if (id === null) { res.status(400).json({ success: false, message: 'Invalid post id' }); return; }
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const title   = typeof req.body.title   === 'string' ? req.body.title   : undefined;
      const content = typeof req.body.content === 'string' ? req.body.content : undefined;
      const imageUrl = req.body.imageUrl === null
        ? null
        : (typeof req.body.imageUrl === 'string' ? req.body.imageUrl : undefined);

      const validation = validateUpdatePost({ title, content, imageUrl });
      if (!validation.valid) { res.status(400).json({ success: false, message: validation.message ?? 'Invalid input' }); return; }

      const result = await this.postService.updatePost(id, userId, title?.trim(), content?.trim(), imageUrl === undefined ? undefined : (imageUrl?.trim() ?? null));
      res.status(result.status).json({ success: result.success, message: result.message });
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.parsePositiveInt(req.params.id);
      if (id === null) { res.status(400).json({ success: false, message: 'Invalid post id' }); return; }
      const userId   = req.user?.id;
      const userRole = req.user?.role;
      if (!userId || !userRole) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const result = await this.postService.deletePost(id, userId, userRole);

      if (result.success) {
        await this.auditService.log('DELETE_POST', userId, 'post', id, null, req.ip ?? null);
      }

      res.status(result.status).json({ success: result.success, message: result.message });
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public like = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = this.parsePositiveInt(req.params.id);
      if (postId === null) { res.status(400).json({ success: false, message: 'Invalid post id' }); return; }
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const result = await this.postService.likePost(postId, userId);

      if (result.success) {
        await this.auditService.log('LIKE_POST', userId, 'post', postId, null, req.ip ?? null);
      }

      res.status(result.status).json({ success: result.success, message: result.message });
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public unlike = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = this.parsePositiveInt(req.params.id);
      if (postId === null) { res.status(400).json({ success: false, message: 'Invalid post id' }); return; }
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const result = await this.postService.unlikePost(postId, userId);
      res.status(result.status).json({ success: result.success, message: result.message });
    } catch {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
}

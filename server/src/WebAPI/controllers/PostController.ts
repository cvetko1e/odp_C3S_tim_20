import { Router } from 'express';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { Request, Response } from 'express';
import { IPostService } from '../../Domain/services/Post/IPostServices';

export class PostController {
  private readonly router: Router;
  public constructor(private readonly postService: IPostService) {
    this.router = Router();
    this.setupRoutes();
  }
  private setupRoutes(): void {
  this.router.get('/posts/feed', authenticate, this.getFeed);
  this.router.get('/posts/community/:communityId', authenticate, this.getByCommunity);
  this.router.get('/posts/:id', authenticate, this.getById);
  this.router.post('/posts', authenticate, this.create);
  this.router.put('/posts/:id', authenticate, this.update);
  this.router.delete('/posts/:id', authenticate, this.delete);
  this.router.post('/posts/:id/like', authenticate, this.like);
  this.router.delete('/posts/:id/like', authenticate, this.unlike);
}

public getRouter(): Router {
  return this.router;
}

    public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const post = await this.postService.getPostById(id);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }
      res.status(200).json(post);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  public getByCommunity = async (req: Request, res: Response): Promise<void> => {
    try {
      const communityId = parseInt(req.params.communityId as string, 10);
      const posts = await this.postService.getPostsByCommunity(communityId);
      res.status(200).json(posts);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  public getFeed = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }
      
      const posts = await this.postService.getHomeFeed(userId);
      res.status(200).json(posts);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }
      
      const { title, content, imageUrl, communityId, tagIds } = req.body;
      const post = await this.postService.createPost(
        title, content, imageUrl || null, userId, parseInt(communityId, 10), tagIds || []
      );
      res.status(201).json(post);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }
      
      const { title, content, imageUrl } = req.body;
      const success = await this.postService.updatePost(id, userId, title, content, imageUrl);
      if (!success) {
        res.status(404).json({ message: "Post not found or no changes made" });
        return;
      }
      res.status(200).json({ message: "Post updated successfully" });
    } catch (err: any) {
      res.status(403).json({ message: err.message });
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const userId = req.user?.id;
      const userRole = req.user?.role;
      if (!userId || !userRole) { res.status(401).json({ message: "Unauthorized" }); return; }

      const success = await this.postService.deletePost(id, userId, userRole);
      if (!success) {
        res.status(404).json({ message: "Post not found" });
        return;
      }
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (err: any) {
      res.status(403).json({ message: err.message });
    }
  };

  public like = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = parseInt(req.params.id as string, 10);
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

      const success = await this.postService.likePost(postId, userId);
      if (!success) {
        res.status(400).json({ message: "You already liked this post" });
        return;
      }
      res.status(200).json({ message: "Post liked" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  public unlike = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = parseInt(req.params.id as string, 10);
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

      const success = await this.postService.unlikePost(postId, userId);
      if (!success) {
        res.status(400).json({ message: "Post was not liked" });
        return;
      }
      res.status(200).json({ message: "Post unliked" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}

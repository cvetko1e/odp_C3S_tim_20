import { IPostService } from '../../Domain/services/Post/IPostServices';
import { IPostRepository } from '../../Domain/repositories/Post/IPostRepository';
import { ICommunityRepository } from '../../Domain/repositories/communities/ICommunityRepository';
import { Post } from '../../Domain/models/Post';

export class PostService implements IPostService {
  public constructor(
    private readonly postRepo: IPostRepository,
    private readonly communityRepo: ICommunityRepository
  ) {}

  public async getPostById(id: number): Promise<Post | null> {
    return await this.postRepo.findById(id);
  }

  public async getPostsByCommunity(communityId: number): Promise<Post[]> {
    return await this.postRepo.findByCommunityId(communityId);
  }

  public async getHomeFeed(userId: number): Promise<Post[]> {
    return await this.postRepo.getFeed(userId);
  }

  public async createPost(
    title: string,
    content: string,
    imageUrl: string | null,
    authorId: number,
    communityId: number,
    tagIds: number[]
  ): Promise<Post | null> {
    const isMember = await this.communityRepo.isMember(communityId, authorId);
    if (!isMember) throw new Error("User must be a member of the community to post");

    const newPost = new Post(0, title, content, imageUrl, authorId, communityId);
    const postId = await this.postRepo.create(newPost);

    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await this.postRepo.addTagToPost(postId, tagId);
      }
    }

    return await this.postRepo.findById(postId);
  }

  public async updatePost(
    id: number,
    userId: number,
    title?: string,
    content?: string,
    imageUrl?: string | null
  ): Promise<boolean> {
    const post = await this.postRepo.findById(id);
    if (!post) return false;
    if (post.authorId !== userId) throw new Error("Unauthorized to edit this post");

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;

    return await this.postRepo.update(post);
  }

  public async deletePost(id: number, userId: number, userRole: string): Promise<boolean> {
    const post = await this.postRepo.findById(id);
    if (!post) return false;

    if (userRole === 'admin' || post.authorId === userId) {
      return await this.postRepo.delete(id);
    }

    const userCommunities = await this.communityRepo.getByUserId(userId);
    const membership = userCommunities.find(c => c.id === post.communityId);
    
    if (membership && membership.memberRole === 'moderator') {
      return await this.postRepo.delete(id);
    }

    throw new Error("Unauthorized to delete this post");
  }

    public async likePost(postId: number, userId: number): Promise<boolean> {
    const post = await this.postRepo.findById(postId);
    if (!post) return false;
    if (post.authorId === userId) throw new Error("You cannot like your own post");

    return await this.postRepo.addLike(postId, userId);
  }

  public async unlikePost(postId: number, userId: number): Promise<boolean> {
    return await this.postRepo.removeLike(postId, userId);
  }
}

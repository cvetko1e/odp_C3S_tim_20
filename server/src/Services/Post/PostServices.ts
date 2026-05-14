import { IPostService } from '../../Domain/services/post/IPostServices';
import { IPostRepository } from '../../Domain/repositories/post/IPostRepository';
import { ICommunityRepository } from '../../Domain/repositories/communities/ICommunityRepository';
import { Post } from '../../Domain/models/Post';
import { ServiceResult } from '../../Domain/types/ServiceResult';

export class PostService implements IPostService {
  public constructor(
    private readonly postRepo: IPostRepository,
    private readonly communityRepo: ICommunityRepository
  ) {}

  public async getPostById(id: number): Promise<Post | null> {
    return this.postRepo.findById(id);
  }

  public async getPostsByCommunity(communityId: number): Promise<Post[]> {
    return this.postRepo.findByCommunityId(communityId);
  }

  public async getHomeFeed(userId: number): Promise<Post[]> {
    return this.postRepo.getFeed(userId);
  }

  public async createPost(
    title: string,
    content: string,
    imageUrl: string | null,
    authorId: number,
    communityId: number,
    tagIds: number[]
  ): Promise<ServiceResult<Post>> {
    const isMember = await this.communityRepo.isMember(communityId, authorId);
    if (!isMember) {
      return {
        success: false,
        status: 403,
        message: 'User must be an active member of the community to post',
        data: null,
      };
    }

    const newPost = new Post(0, title, content, imageUrl, authorId, communityId);
    const postId = await this.postRepo.create(newPost);
    if (postId === null) {
      return { success: false, status: 500, message: 'Failed to create post', data: null };
    }

    for (const tagId of tagIds) {
      await this.postRepo.addTagToPost(postId, tagId);
    }

    const createdPost = await this.postRepo.findById(postId);
    if (!createdPost) {
      return { success: false, status: 500, message: 'Failed to load created post', data: null };
    }

    return {
      success: true,
      status: 201,
      message: 'Post created successfully',
      data: createdPost,
    };
  }

  public async updatePost(
    id: number,
    userId: number,
    title?: string,
    content?: string,
    imageUrl?: string | null
  ): Promise<ServiceResult<boolean>> {
    const post = await this.postRepo.findById(id);
    if (!post) {
      return { success: false, status: 404, message: 'Post not found', data: null };
    }

    if (post.authorId !== userId) {
      return { success: false, status: 403, message: 'Unauthorized to edit this post', data: null };
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;

    const updated = await this.postRepo.update(post);
    if (!updated) {
      return { success: false, status: 500, message: 'Failed to update post', data: null };
    }

    return { success: true, status: 200, message: 'Post updated successfully', data: true };
  }

  public async deletePost(id: number, userId: number, userRole: string): Promise<ServiceResult<boolean>> {
    const post = await this.postRepo.findById(id);
    if (!post) {
      return { success: false, status: 404, message: 'Post not found', data: null };
    }

    const isAuthor = post.authorId === userId;
    const isAdmin = userRole === 'admin';
    const isModerator = await this.communityRepo.isModerator(post.communityId, userId);

    if (!isAuthor && !isAdmin && !isModerator) {
      return { success: false, status: 403, message: 'Unauthorized to delete this post', data: null };
    }

    const deleted = await this.postRepo.delete(id);
    if (!deleted) {
      return { success: false, status: 500, message: 'Failed to delete post', data: null };
    }

    return { success: true, status: 200, message: 'Post deleted successfully', data: true };
  }

  public async likePost(postId: number, userId: number): Promise<ServiceResult<boolean>> {
    const post = await this.postRepo.findById(postId);
    if (!post) {
      return { success: false, status: 404, message: 'Post not found', data: null };
    }

    if (post.authorId === userId) {
      return { success: false, status: 400, message: 'You cannot like your own post', data: null };
    }

    const alreadyLiked = await this.postRepo.hasUserLikedPost(postId, userId);
    if (alreadyLiked) {
      return { success: false, status: 409, message: 'You already liked this post', data: null };
    }

    const added = await this.postRepo.addLike(postId, userId);
    if (!added) {
      return { success: false, status: 500, message: 'Failed to like post', data: null };
    }

    return { success: true, status: 200, message: 'Post liked', data: true };
  }

  public async unlikePost(postId: number, userId: number): Promise<ServiceResult<boolean>> {
    const post = await this.postRepo.findById(postId);
    if (!post) {
      return { success: false, status: 404, message: 'Post not found', data: null };
    }

    const alreadyLiked = await this.postRepo.hasUserLikedPost(postId, userId);
    if (!alreadyLiked) {
      return { success: false, status: 409, message: 'Post was not liked', data: null };
    }

    const removed = await this.postRepo.removeLike(postId, userId);
    if (!removed) {
      return { success: false, status: 500, message: 'Failed to unlike post', data: null };
    }

    return { success: true, status: 200, message: 'Post unliked', data: true };
  }
}

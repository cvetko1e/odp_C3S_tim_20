import { Post } from '../../models/Post';

export interface IPostService {
  getPostById(id: number): Promise<Post | null>;
  getPostsByCommunity(communityId: number): Promise<Post[]>;
  getHomeFeed(userId: number): Promise<Post[]>;
  createPost(title: string, content: string, imageUrl: string | null, authorId: number, communityId: number, tagIds: number[]): Promise<Post | null>;
  updatePost(id: number, userId: number, title?: string, content?: string, imageUrl?: string | null): Promise<boolean>;
  deletePost(id: number, userId: number, userRole: string): Promise<boolean>;
  likePost(postId: number, userId: number): Promise<boolean>;
  unlikePost(postId: number, userId: number): Promise<boolean>;
}

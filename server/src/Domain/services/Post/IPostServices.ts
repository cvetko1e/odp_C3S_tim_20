import { Post } from '../../models/Post';
import { ServiceResult } from '../../types/ServiceResult';

export interface IPostService {
  getPostById(id: number): Promise<Post | null>;
  getPostsByCommunity(communityId: number): Promise<Post[]>;
  getHomeFeed(userId: number): Promise<Post[]>;
  createPost(
    title: string,
    content: string,
    imageUrl: string | null,
    authorId: number,
    communityId: number,
    tagIds: number[]
  ): Promise<ServiceResult<Post>>;
  updatePost(
    id: number,
    userId: number,
    title?: string,
    content?: string,
    imageUrl?: string | null
  ): Promise<ServiceResult<boolean>>;
  deletePost(id: number, userId: number, userRole: string): Promise<ServiceResult<boolean>>;
  likePost(postId: number, userId: number): Promise<ServiceResult<boolean>>;
  unlikePost(postId: number, userId: number): Promise<ServiceResult<boolean>>;
}

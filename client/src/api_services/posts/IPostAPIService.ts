import type { Post } from "../../types/posts/Post";

export interface IPostAPIService {
  getPostById(id: number, token: string): Promise<Post | null>;
  getPostsByCommunity(communityId: number, token: string): Promise<Post[]>;
  getHomeFeed(token: string): Promise<Post[]>;
  createPost(token: string, title: string, content: string, imageUrl: string | null, communityId: number, tagIds: number[]): Promise<Post | null>;
  updatePost(token: string, id: number, title?: string, content?: string, imageUrl?: string | null): Promise<boolean>;
  deletePost(token: string, id: number): Promise<boolean>;
  likePost(token: string, id: number): Promise<boolean>;
  unlikePost(token: string, id: number): Promise<boolean>;
}

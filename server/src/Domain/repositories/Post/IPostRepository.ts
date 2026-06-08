import { Post } from '../../models/Post';

export interface IPostRepository {
  findById(id: number): Promise<Post>;
  findByIdFromPrimary(id: number): Promise<Post>;
  findAll(): Promise<Post[]>;
  findByCommunityId(communityId: number): Promise<Post[]>;
  getFeed(userId: number): Promise<Post[]>;
  create(post: Post): Promise<number>;
  update(post: Post): Promise<boolean>;
  delete(id: number): Promise<boolean>;

  addTagToPost(postId: number, tagId: number): Promise<void>;
  removeTagFromPost(postId: number, tagId: number): Promise<boolean>;
  removeTagsFromPost(postId: number): Promise<void>;

  hasUserLikedPost(postId: number, userId: number): Promise<boolean>;
  addLike(postId: number, userId: number): Promise<boolean>;
  removeLike(postId: number, userId: number): Promise<boolean>;
}

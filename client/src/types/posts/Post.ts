import type { Tag } from "../tags/Tag";

export interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  authorId: number;
  communityId: number;
  createdAt: string | null;
  updatedAt: string | null;
  authorUsername: string | null;
  likesCount: number;
  commentsCount: number;
  tags: Tag[];
}

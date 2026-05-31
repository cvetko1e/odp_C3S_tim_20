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

export const emptyPost: Post = {
  id: 0,
  title: "",
  content: "",
  imageUrl: null,
  authorId: 0,
  communityId: 0,
  createdAt: null,
  updatedAt: null,
  authorUsername: null,
  likesCount: 0,
  commentsCount: 0,
  tags: [],
};

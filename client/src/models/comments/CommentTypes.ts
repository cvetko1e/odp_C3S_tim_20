export type CommentDto = {
  id: number;
  postId: number;
  authorId: number;
  parentId: number | null;
  content: string;
  isDeleted: number;
  createdAt: string | null;
  updatedAt: string | null;
  authorUsername: string | null;
  likesCount: number;
  replies: CommentDto[];
};

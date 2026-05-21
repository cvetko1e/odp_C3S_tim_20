export class Comment {
  constructor(
    public id: number = 0,
    public postId: number = 0,
    public authorId: number = 0,
    public parentId: number | null = null,
    public content: string = "",
    public isDeleted: number = 0,
    public isFlagged: number = 0,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,

    // enriched
    public authorUsername: string | null = null,
    public likesCount: number = 0,
    public replies: Comment[] = []
  ) {}
}

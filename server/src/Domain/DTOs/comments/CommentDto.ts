export class CommentDto {
  constructor(
    public id: number = 0,
    public postId: number = 0,
    public authorId: number = 0,
    public parentId: number | null = null,
    public content: string = "",
    public isDeleted: number = 0,
    public createdAt: string | null = null,
    public updatedAt: string | null = null,
    public authorUsername: string | null = null,
    public likesCount: number = 0,
    public replies: CommentDto[] = []
  ) {}
}

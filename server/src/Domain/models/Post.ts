import { Tag } from './Tag';

export class Post {
  constructor(
    public id: number = 0,
    public title: string = "",
    public content: string = "", 
    public imageUrl: string | null = null, 
    public authorId: number = 0,
    public communityId: number = 0,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,
    
    public authorUsername: string | null = null,
    public likesCount: number = 0,
    public commentsCount: number = 0,
    public tags: Tag[] = []
  ) {}
}
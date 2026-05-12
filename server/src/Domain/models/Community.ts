export type CommunityType = "public" | "private";

export class Community {
  constructor(
    public id: number = 0,
    public name: string = "",
    public description: string | null = null,
    public rules: string | null = null,
    public avatarUrl: string | null = null,
    public type: CommunityType = "public",
    public createdBy: number = 0,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,
  ) {}
}

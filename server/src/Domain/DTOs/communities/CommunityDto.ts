import { CommunityType } from "../../models/Community";

export type CommunityMemberRole = "moderator" | "member";
export type CommunityMemberStatus = "active" | "pending" | "banned";

export class CommunityDto {
  constructor(
    public id: number = 0,
    public name: string = "",
    public description: string | null = null,
    public rules: string | null = null,
    public avatarUrl: string | null = null,
    public type: CommunityType = "public",
    public createdBy: number = 0,
    public createdAt: string | null = null,
    public updatedAt: string | null = null,
    public memberRole: CommunityMemberRole | null = null,
    public memberStatus: CommunityMemberStatus | null = null,
  ) {}
}

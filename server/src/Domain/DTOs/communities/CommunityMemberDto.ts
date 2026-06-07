import { UserRole } from "../../enums/UserRole";
import { CommunityMemberRole, CommunityMemberStatus } from "./CommunityDto";

export class CommunityMemberDto {
  constructor(
    public id: number = 0,
    public username: string = "",
    public email: string = "",
    public role: UserRole = UserRole.USER,
    public isActive: number = 1,
    public memberRole: CommunityMemberRole = "member",
    public memberStatus: CommunityMemberStatus = "pending",
    public joinedAt: string | null = null,
  ) {}
}

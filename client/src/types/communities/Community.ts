export type CommunityType = "public" | "private";
export type CommunityMemberRole = "moderator" | "member";
export type CommunityMemberStatus = "active" | "pending" | "banned";

export type Community = {
  id: number;
  name: string;
  description: string | null;
  rules: string | null;
  avatarUrl: string | null;
  type: CommunityType;
  createdBy: number;
  createdAt: string | null;
  updatedAt: string | null;
  memberRole?: CommunityMemberRole | null;
  memberStatus?: CommunityMemberStatus | null;
};

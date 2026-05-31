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

export const emptyCommunity: Community = {
  id: 0,
  name: "",
  description: null,
  rules: null,
  avatarUrl: null,
  type: "public",
  createdBy: 0,
  createdAt: null,
  updatedAt: null,
  memberRole: null,
  memberStatus: null,
};

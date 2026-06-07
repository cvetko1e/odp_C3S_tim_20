export type CommunityType = "public" | "private";
export type CommunityMemberRole = "moderator" | "member";
export type CommunityMemberStatus = "active" | "pending" | "banned";

export type CommunityMember = {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  isActive: number;
  memberRole: CommunityMemberRole;
  memberStatus: CommunityMemberStatus;
  joinedAt: string | null;
};

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

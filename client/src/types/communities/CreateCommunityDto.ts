import type { CommunityType } from "./Community";

export type CreateCommunityDto = {
  name: string;
  description: string | null;
  rules: string | null;
  avatarUrl: string | null;
  type: CommunityType;
};

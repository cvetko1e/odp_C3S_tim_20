import type { Community } from "./Community";

export type CommunityApiResponse = {
  success: boolean;
  message?: string;
  data?: Community | Community[];
};

export type CommunityListResponse = {
  success: boolean;
  message?: string;
  data?: Community[];
};

export type SingleCommunityResponse = {
  success: boolean;
  message?: string;
  data?: Community;
};

export type CommunityActionResponse = {
  success: boolean;
  message?: string;
};

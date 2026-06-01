import type { Community } from "../../types/communities/Community";
import type { CommunityActionResponse } from "../../types/communities/CommunityApiResponse";
import type { CreateCommunityDto } from "../../types/communities/CreateCommunityDto";
import type { UpdateCommunityDto } from "../../types/communities/UpdateCommunityDto";

export interface ICommunityAPIService {
  getPublicCommunities(): Promise<Community[]>;
  getMyCommunities(token: string): Promise<Community[]>;
  getAllCommunities(token: string): Promise<Community[]>;
  getCommunityById(id: number, token?: string): Promise<Community>;
  createCommunity(token: string, dto: CreateCommunityDto): Promise<Community>;
  updateCommunity(token: string, id: number, dto: UpdateCommunityDto): Promise<boolean>;
  deleteCommunity(token: string, id: number): Promise<boolean>;
  joinCommunity(token: string, id: number): Promise<CommunityActionResponse>;
  leaveCommunity(token: string, id: number): Promise<boolean>;
}

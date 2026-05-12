import type { Community } from "../../types/communities/Community";
import type { CreateCommunityDto } from "../../types/communities/CreateCommunityDto";
import type { UpdateCommunityDto } from "../../types/communities/UpdateCommunityDto";

export interface ICommunityAPIService {
  getPublicCommunities(): Promise<Community[]>;
  getMyCommunities(token: string): Promise<Community[]>;
  getAllCommunities(token: string): Promise<Community[]>;
  getCommunityById(id: number, token?: string): Promise<Community | null>;
  createCommunity(token: string, dto: CreateCommunityDto): Promise<Community | null>;
  updateCommunity(token: string, id: number, dto: UpdateCommunityDto): Promise<boolean>;
  deleteCommunity(token: string, id: number): Promise<boolean>;
  joinCommunity(token: string, id: number): Promise<boolean>;
  leaveCommunity(token: string, id: number): Promise<boolean>;
}

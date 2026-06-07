import type { Community, CommunityMember, CommunityMemberRole, CommunityMemberStatus } from "../../types/communities/Community";
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
  getMembers(token: string, id: number): Promise<CommunityMember[]>;
  updateMemberRole(token: string, id: number, userId: number, role: CommunityMemberRole): Promise<CommunityActionResponse>;
  updateMemberStatus(token: string, id: number, userId: number, status: CommunityMemberStatus): Promise<CommunityActionResponse>;
  removeMember(token: string, id: number, userId: number): Promise<CommunityActionResponse>;
}

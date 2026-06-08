import { CommunityType } from "../../models/Community";
import { CommunityDto } from "../../DTOs/communities/CommunityDto";
import { CommunityMemberDto } from "../../DTOs/communities/CommunityMemberDto";
import { CreateCommunityDto } from "../../DTOs/communities/CreateCommunityDto";
import { UpdateCommunityDto } from "../../DTOs/communities/UpdateCommunityDto";
import { CommunityMemberRole, CommunityMemberStatus } from "../../DTOs/communities/CommunityDto";

export interface ICommunityRepository {
  getPublic(): Promise<CommunityDto[]>;
  getAll(): Promise<CommunityDto[]>;
  getById(id: number): Promise<CommunityDto>;
  getByName(name: string): Promise<CommunityDto>;
  getByUserId(userId: number): Promise<CommunityDto[]>;
  create(dto: CreateCommunityDto, createdBy: number): Promise<CommunityDto>;
  update(id: number, dto: UpdateCommunityDto): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  isMember(communityId: number, userId: number): Promise<boolean>;
  isActiveMember(communityId: number, userId: number): Promise<boolean>;
  isModerator(communityId: number, userId: number): Promise<boolean>;
  joinCommunity(communityId: number, userId: number): Promise<boolean>;
  leaveCommunity(communityId: number, userId: number): Promise<boolean>;
  getMembers(communityId: number): Promise<CommunityMemberDto[]>;
  updateMemberRole(communityId: number, userId: number, role: CommunityMemberRole): Promise<boolean>;
  updateMemberStatus(communityId: number, userId: number, status: CommunityMemberStatus): Promise<boolean>;
  removeMember(communityId: number, userId: number): Promise<boolean>;
  getCommunityType(communityId: number): Promise<CommunityType | "">;
}

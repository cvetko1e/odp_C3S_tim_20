import { CommunityType } from "../../models/Community";
import { CommunityDto } from "../../DTOs/communities/CommunityDto";
import { CreateCommunityDto } from "../../DTOs/communities/CreateCommunityDto";
import { UpdateCommunityDto } from "../../DTOs/communities/UpdateCommunityDto";

export interface ICommunityRepository {
  getPublic(): Promise<CommunityDto[]>;
  getAll(): Promise<CommunityDto[]>;
  getById(id: number): Promise<CommunityDto | null>;
  getByUserId(userId: number): Promise<CommunityDto[]>;
  create(dto: CreateCommunityDto, createdBy: number): Promise<CommunityDto | null>;
  update(id: number, dto: UpdateCommunityDto): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  isMember(communityId: number, userId: number): Promise<boolean>;
  isModerator(communityId: number, userId: number): Promise<boolean>;
  joinCommunity(communityId: number, userId: number): Promise<boolean>;
  leaveCommunity(communityId: number, userId: number): Promise<boolean>;
  getCommunityType(communityId: number): Promise<CommunityType | null>;
}

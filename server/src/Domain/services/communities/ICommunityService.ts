import { UserRole } from "../../enums/UserRole";
import { ServiceResult } from "../../types/ServiceResult";
import { CommunityDto } from "../../DTOs/communities/CommunityDto";
import { CommunityMemberDto } from "../../DTOs/communities/CommunityMemberDto";
import { CreateCommunityDto } from "../../DTOs/communities/CreateCommunityDto";
import { UpdateCommunityDto } from "../../DTOs/communities/UpdateCommunityDto";
import { CommunityMemberRole, CommunityMemberStatus } from "../../DTOs/communities/CommunityDto";

export interface ICommunityService {
  getPublic(): Promise<CommunityDto[]>;
  getAll(): Promise<CommunityDto[]>;
  getById(id: number): Promise<ServiceResult<CommunityDto>>;
  getMine(userId: number): Promise<CommunityDto[]>;
  create(dto: CreateCommunityDto, createdBy: number): Promise<ServiceResult<CommunityDto>>;
  update(id: number, dto: UpdateCommunityDto, userId: number, userRole: UserRole): Promise<ServiceResult<boolean>>;
  delete(id: number, userId: number, userRole: UserRole): Promise<ServiceResult<boolean>>;
  join(id: number, userId: number): Promise<ServiceResult<boolean>>;
  leave(id: number, userId: number): Promise<ServiceResult<boolean>>;
  getMembers(id: number, userId: number, userRole: UserRole): Promise<ServiceResult<CommunityMemberDto[]>>;
  updateMemberRole(id: number, memberUserId: number, role: CommunityMemberRole, actorId: number, actorRole: UserRole): Promise<ServiceResult<boolean>>;
  updateMemberStatus(id: number, memberUserId: number, status: CommunityMemberStatus, actorId: number, actorRole: UserRole): Promise<ServiceResult<boolean>>;
  removeMember(id: number, memberUserId: number, actorId: number, actorRole: UserRole): Promise<ServiceResult<boolean>>;
}

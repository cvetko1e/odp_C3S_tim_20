import { UserRole } from "../../enums/UserRole";
import { CommunityDto } from "../../DTOs/communities/CommunityDto";
import { CreateCommunityDto } from "../../DTOs/communities/CreateCommunityDto";
import { UpdateCommunityDto } from "../../DTOs/communities/UpdateCommunityDto";

export interface ICommunityService {
  getPublic(): Promise<CommunityDto[]>;
  getAll(): Promise<CommunityDto[]>;
  getById(id: number): Promise<CommunityDto | null>;
  getMine(userId: number): Promise<CommunityDto[]>;
  create(dto: CreateCommunityDto, createdBy: number): Promise<CommunityDto | null>;
  update(id: number, dto: UpdateCommunityDto, userId: number, userRole: UserRole): Promise<boolean>;
  delete(id: number, userId: number, userRole: UserRole): Promise<boolean>;
  join(id: number, userId: number): Promise<boolean>;
  leave(id: number, userId: number): Promise<boolean>;
}

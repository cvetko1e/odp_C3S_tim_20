import { ICommunityService } from "../../Domain/services/communities/ICommunityService";
import { ICommunityRepository } from "../../Domain/repositories/communities/ICommunityRepository";
import { CommunityDto } from "../../Domain/DTOs/communities/CommunityDto";
import { CreateCommunityDto } from "../../Domain/DTOs/communities/CreateCommunityDto";
import { UpdateCommunityDto } from "../../Domain/DTOs/communities/UpdateCommunityDto";
import { UserRole } from "../../Domain/enums/UserRole";
import { ServiceResult } from "../../Domain/types/ServiceResult";

export class CommunityService implements ICommunityService {
  public constructor(private readonly communityRepo: ICommunityRepository) {}

  public async getPublic(): Promise<CommunityDto[]> {
    return this.communityRepo.getPublic();
  }

  public async getAll(): Promise<CommunityDto[]> {
    return this.communityRepo.getAll();
  }

  public async getById(id: number): Promise<CommunityDto> {
    return this.communityRepo.getById(id);
  }

  public async getMine(userId: number): Promise<CommunityDto[]> {
    return this.communityRepo.getByUserId(userId);
  }

  public async create(dto: CreateCommunityDto, createdBy: number): Promise<CommunityDto> {
    return this.communityRepo.create(dto, createdBy);
  }

  public async update(id: number, dto: UpdateCommunityDto, userId: number, userRole: UserRole): Promise<boolean> {
    if (userRole === UserRole.ADMIN) return this.communityRepo.update(id, dto);
    const moderator = await this.communityRepo.isModerator(id, userId);
    if (!moderator) return false;
    return this.communityRepo.update(id, dto);
  }

  public async delete(id: number, userId: number, userRole: UserRole): Promise<boolean> {
    if (userRole === UserRole.ADMIN) return this.communityRepo.delete(id);
    const moderator = await this.communityRepo.isModerator(id, userId);
    if (!moderator) return false;
    return this.communityRepo.delete(id);
  }

  public async join(id: number, userId: number): Promise<ServiceResult<boolean>> {
    const community = await this.communityRepo.getById(id);
    if (community.id === 0) {
      return { success: false, status: 404, message: "Community not found", data: null };
    }

    const alreadyMember = await this.communityRepo.isMember(id, userId);
    if (alreadyMember) {
      return {
        success: false,
        status: 409,
        message: "You are already a member or have a pending request",
        data: null,
      };
    }

    const joined = await this.communityRepo.joinCommunity(id, userId);
    if (!joined) {
      return { success: false, status: 500, message: "Failed to join community", data: null };
    }

    const message = community.type === "private" ? "Join request sent" : "Joined community successfully";
    return { success: true, status: 200, message, data: true };
  }

  public async leave(id: number, userId: number): Promise<boolean> {
    return this.communityRepo.leaveCommunity(id, userId);
  }
}
